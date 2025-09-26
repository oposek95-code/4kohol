document.addEventListener('DOMContentLoaded', () => {
    const USERS_KEY = 'forum_users';
    const SESSION_KEY = 'forum_session';

    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const messageEl = document.getElementById('message');
    const userStatusEl = document.getElementById('user-status');
    
    // --- Funkcje pomocnicze ---
    const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY)) || [];
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
                    rankExperience: 0
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
                adminLink = ` | <a href="admin.html">Panel Admina</a>`;
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

            users.forEach(user => {
                const row = usersTableBody.insertRow();
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.isAdmin ? 'Admin' : 'Użytkownik'}</td>
                    <td>${user.rank || 'Brak'}</td>
                    <td>${user.rankExperience || 0}</td>
                `;
            });
            
            adminContent.querySelector('p').classList.add('hidden');
            usersTable.classList.remove('hidden');

        } else {
            adminContent.innerHTML = '<p style="color: red;">Brak uprawnień. Ta strona jest dostępna tylko dla administratorów.</p>';
        }
    }
});
