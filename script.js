document.addEventListener('DOMContentLoaded', () => {
    // Obsługa ukrytych boardów
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'q') {
            event.preventDefault();
            const hiddenContainer = document.getElementById('hidden-boards-container');
            if (hiddenContainer) {
                hiddenContainer.classList.toggle('visible');
            }
        }
    });

    // Dane użytkowników
    const users = {
        'admin': { password: 'admin123', role: 'admin' },
        'mod': { password: 'mod123', role: 'moderator' },
        'user': { password: 'user123', role: 'user' }
    };

    // Sprawdź czy użytkownik jest zalogowany
    const checkLoginStatus = () => {
        const loggedUser = localStorage.getItem('currentUser');
        const userStatus = document.getElementById('user-status');
        if (userStatus) {
            if (loggedUser) {
                const user = JSON.parse(loggedUser);
                userStatus.innerHTML = `
                    Zalogowano jako: <strong>${user.username}</strong> (${user.role})
                    <a href="#" id="logout-btn">Wyloguj</a>
                `;
                document.getElementById('logout-btn').addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('currentUser');
                    window.location.reload();
                });
            } else {
                userStatus.innerHTML = `
                    <a href="#" id="login-btn">Logowanie</a> |
                    <a href="#" id="register-btn">Rejestracja</a>
                `;
                setupAuthButtons();
            }
        }
    };

    // Pokaż formularz logowania/rejestracji
    const showAuthForm = (type) => {
        const container = document.createElement('div');
        container.className = 'auth-container';
        container.innerHTML = `
            <h3>${type === 'login' ? 'Logowanie' : 'Rejestracja'}</h3>
            <form id="${type}-form">
                <div class="form-group">
                    <label for="${type}-username">Login:</label>
                    <input type="text" id="${type}-username" required>
                </div>
                <div class="form-group">
                    <label for="${type}-password">Hasło:</label>
                    <input type="password" id="${type}-password" required>
                </div>
                <button type="submit">${type === 'login' ? 'Zaloguj' : 'Zarejestruj'}</button>
                <div id="message"></div>
            </form>
        `;

        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = '';
            main.appendChild(container);

            const form = document.getElementById(`${type}-form`);
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (type === 'login') {
                    handleLogin();
                } else {
                    handleRegister();
                }
            });
        }
    };

    // Obsługa logowania
    const handleLogin = () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const message = document.getElementById('message');

        if (users[username] && users[username].password === password) {
            const userData = {
                username: username,
                role: users[username].role
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));
            message.textContent = 'Zalogowano pomyślnie!';
            message.style.color = 'green';
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            message.textContent = 'Nieprawidłowy login lub hasło!';
            message.style.color = 'red';
        }
    };

    // Obsługa rejestracji
    const handleRegister = () => {
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const message = document.getElementById('message');

        if (users[username]) {
            message.textContent = 'Użytkownik już istnieje!';
            message.style.color = 'red';
        } else {
            users[username] = { password: password, role: 'user' };
            message.textContent = 'Zarejestrowano pomyślnie!';
            message.style.color = 'green';
            setTimeout(() => {
                showAuthForm('login');
            }, 1000);
        }
    };

    // Obsługa edycji i usuwania boardów
    const setupBoardActions = () => {
        document.querySelectorAll('.post-actions .edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const postElement = e.target.closest('.post');
                const boardName = postElement.dataset.board;
                handleEditBoard(boardName, postElement);
            });
        });

        document.querySelectorAll('.post-actions .delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const postElement = e.target.closest('.post');
                const boardName = postElement.dataset.board;
                handleDeleteBoard(boardName, postElement);
            });
        });
    };

    const handleEditBoard = (boardName, postElement) => {
        const currentContent = postElement.querySelector('.post-content a').textContent;
        const newContent = prompt(`Edytuj treść dla boardu ${boardName}:`, currentContent);
        if (newContent !== null && newContent.trim() !== '') {
            // Update in localStorage (if we were storing content)
            // For now, just update the displayed text
            postElement.querySelector('.post-content a').textContent = newContent;
            // Optionally, update the href if the board name changes
            // postElement.querySelector('.post-content a').href = `b/${boardName}.html`;
        }
    };

    const handleDeleteBoard = (boardName, postElement) => {
        if (confirm(`Czy na pewno chcesz usunąć board ${boardName}?`)) {
            postElement.remove();
            // Optionally, remove from localStorage or a backend
        }
    };

    // Konfiguracja przycisków logowania/rejestracji
    const setupAuthButtons = () => {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showAuthForm('login');
            });
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showAuthForm('register');
            });
        }
    };

    // Inicjalizacja
    checkLoginStatus();
    setupBoardActions();
});
