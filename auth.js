document.addEventListener('DOMContentLoaded', () => {
    const USERS_KEY = 'forum_users';
    const SESSION_KEY = 'forum_session';

    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const messageEl = document.getElementById('message');
    const userStatusEl = document.getElementById('user-status');
    
    // --- Funkcje pomocnicze ---
    const getUsers = () => {
        let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        // Ensure default admin exists
        const adminExists = users.find(u => u.username === 'admin');
        if (!adminExists) {
            const defaultAdmin = {
                username: 'admin',
                password: 'admin123',
                isAdmin: true,
                rank: null,
                rankExperience: 0,
                plnBalance: 0,
                satoshiBalance: 0
            };
            users.push(defaultAdmin);
            saveUsers(users);
        }
        return users;
    };
    const saveUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const getSession = () => JSON.parse(sessionStorage.getItem(SESSION_KEY));
    const saveSession = (session) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    const clearSession = () => sessionStorage.removeItem(SESSION_KEY);

    // --- Logika Rejestracji ---
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                messageEl.textContent = "Nazwa użytkownika i hasło są wymagane.";
                messageEl.style.color = 'red';
                return;
            }

            const users = getUsers();
            const userExists = users.find(user => user.username === username);

            if (userExists) {
                messageEl.textContent = "Użytkownik o tej nazwie już istnieje.";
                messageEl.style.color = 'red';
            } else {
                // Domyślnie pierwszy zarejestrowany użytkownik jest adminem
                const isAdmin = users.length === 0;
                const newUser = { 
                    username, 
                    password, // W prawdziwej aplikacji hasła powinny być hashowane!
                    isAdmin,
                    rank: null,
                    rankExperience: 0,
                    plnBalance: 1000, // Default for casino
                    satoshiBalance: 0
                };
                users.push(newUser);
                saveUsers(users);
                messageEl.textContent = "Rejestracja pomyślna! Możesz się teraz zalogować.";
                messageEl.style.color = 'green';
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            }
        });
    }

    // --- Logika Logowania ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const users = getUsers();
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                saveSession({ username: user.username, isAdmin: user.isAdmin });
                messageEl.textContent = "Logowanie pomyślne! Przekierowywanie...";
                messageEl.style.color = 'green';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                messageEl.textContent = "Nieprawidłowa nazwa użytkownika lub hasło.";
                messageEl.style.color = 'red';
            }
        });
    }

    // --- Zarządzanie stanem logowania na wszystkich stronach ---
    if (userStatusEl) {
        const session = getSession();
        if (session) {
            let adminLink = '';
            if (session.isAdmin) {
                const currentPath = window.location.pathname;
                const adminHref = currentPath.includes('/b/') ? '../admin.html' : 'admin.html';
                adminLink = ` | <a href="${adminHref}">Panel Admina</a>`;
            }
            userStatusEl.innerHTML = `
                Witaj, <strong>${session.username}</strong>! 
                <a href="#" id="logout-btn">Wyloguj</a>
                ${adminLink}
            `;
            
            const logoutBtn = document.getElementById('logout-btn');
            if(logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    clearSession();
                    window.location.reload();
                });
            }
        } else {
            userStatusEl.innerHTML = `
                <a href="login.html">Zaloguj się</a> | 
                <a href="register.html">Zarejestruj się</a>
            `;
        }
    }

    // --- Logika Panelu Administratora ---
    const adminContent = document.getElementById('admin-content');
    if (adminContent) {
        const session = getSession();
        if (session && session.isAdmin) {
            const usersTable = document.getElementById('users-table');
            const usersTableBody = usersTable.querySelector('tbody');
            const users = getUsers();

            // Update table headers to include balances
            const thead = usersTable.querySelector('thead tr');
            thead.innerHTML = `
                <th>Nazwa użytkownika</th>
                <th>Rola</th>
                <th>Ranga</th>
                <th>Doświadczenie</th>
                <th>Saldo PLN</th>
                <th>Saldo Satoshi</th>
            `;

            users.forEach(user => {
                const row = usersTableBody.insertRow();
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.isAdmin ? 'Admin' : 'Użytkownik'}</td>
                    <td>${user.rank || 'Brak'}</td>
                    <td>${user.rankExperience || 0}</td>
                    <td>${user.plnBalance || 0}</td>
                    <td>${user.satoshiBalance || 0}</td>
                `;
            });
            
            adminContent.querySelector('p').classList.add('hidden');
            usersTable.classList.remove('hidden');

            // Add balance management form
            const balanceForm = document.createElement('div');
            balanceForm.innerHTML = `
                <h3>Dodaj saldo do użytkownika</h3>
                <select id="user-select">
                    ${users.map(user => `<option value="${user.username}">${user.username}</option>`).join('')}
                </select>
                <label for="amount">Kwota:</label>
                <input type="number" id="amount" min="0" step="0.01">
                <label for="balance-type">Typ:</label>
                <select id="balance-type">
                    <option value="pln">PLN (Kasyno)</option>
                    <option value="satoshi">Satoshi (Bitcoin Miner)</option>
                </select>
                <button id="add-balance-btn">Dodaj saldo</button>
            `;
            adminContent.appendChild(balanceForm);

            const addBalanceBtn = document.getElementById('add-balance-btn');
            addBalanceBtn.addEventListener('click', () => {
                const selectedUser = document.getElementById('user-select').value;
                const amount = parseFloat(document.getElementById('amount').value);
                const type = document.getElementById('balance-type').value;

                if (!selectedUser || isNaN(amount) || amount <= 0) {
                    alert('Wybierz użytkownika i podaj poprawną kwotę.');
                    return;
                }

                let currentUsers = getUsers();
                const userIndex = currentUsers.findIndex(u => u.username === selectedUser);
                if (userIndex !== -1) {
                    if (type === 'pln') {
                        currentUsers[userIndex].plnBalance = (currentUsers[userIndex].plnBalance || 0) + amount;
                    } else {
                        currentUsers[userIndex].satoshiBalance = (currentUsers[userIndex].satoshiBalance || 0) + amount;
                    }
                    saveUsers(currentUsers);
                    alert(`Dodano ${amount} ${type === 'pln' ? 'PLN' : 'Satoshi'} do konta ${selectedUser}`);
                    // Reload table
                    location.reload();
                }
            });

        } else {
            adminContent.innerHTML = '<p style="color: red;">Brak uprawnień. Ta strona jest dostępna tylko dla administratorów.</p>';
        }
    }
});
