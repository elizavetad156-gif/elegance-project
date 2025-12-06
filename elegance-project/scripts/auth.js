// Authentication module
const Auth = {
    // Инициализация модуля
    init: function() {
        this.setupEventListeners();
        this.setupPasswordToggles();
        this.loadUserData();
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Форма входа
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Форма регистрации
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
        
        // Форма изменения пароля
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleChangePassword();
            });
        }
        
        // Кнопка изменения пароля
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                App.showModal('changePasswordModal');
            });
        }
    },
    
    // Настройка переключения видимости пароля
    setupPasswordToggles: function() {
        const toggles = {
            'toggleLoginPassword': 'loginPassword',
            'toggleRegisterPassword': 'registerPassword',
            'toggleConfirmPassword': 'registerConfirmPassword',
            'toggleCurrentPassword': 'currentPassword',
            'toggleNewPassword': 'newPassword',
            'toggleConfirmNewPassword': 'confirmNewPassword'
        };
        
        Object.entries(toggles).forEach(([toggleId, inputId]) => {
            const toggle = document.getElementById(toggleId);
            const input = document.getElementById(inputId);
            
            if (toggle && input) {
                toggle.addEventListener('click', () => {
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);
                    toggle.classList.toggle('fa-eye');
                    toggle.classList.toggle('fa-eye-slash');
                });
            }
        });
    },
    
    // Загрузка данных пользователя
    loadUserData: function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            this.updateProfileForm(currentUser);
        }
    },
    
    // Обновление формы профиля
    updateProfileForm: function(user) {
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const profilePhone = document.getElementById('profilePhone');
        const profileAddress = document.getElementById('profileAddress');
        
        if (profileName) profileName.value = user.name || '';
        if (profileEmail) profileEmail.value = user.email || '';
        if (profilePhone) profilePhone.value = user.phone || '';
        if (profileAddress) profileAddress.value = user.address || '';
    },
    
    // Обработка входа
    handleLogin: function() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;
        
        // Валидация
        if (!this.validateEmail(email)) {
            App.showNotification('Пожалуйста, введите корректный email', 'error');
            return;
        }
        
        if (!password) {
            App.showNotification('Пожалуйста, введите пароль', 'error');
            return;
        }
        
        // Получаем пользователей из localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email);
        
        if (!user) {
            App.showNotification('Пользователь с таким email не найден', 'error');
            return;
        }
        
        // Проверка пароля (в реальном приложении должно быть хеширование)
        if (user.password !== password) {
            App.showNotification('Неверный пароль', 'error');
            return;
        }
        
        // Успешный вход
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            address: user.address,
            createdAt: user.createdAt
        };
        
        // Сохраняем данные пользователя
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Если выбрано "Запомнить меня", сохраняем email
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        
        // Закрываем модальное окно
        App.hideModal('loginModal');
        
        // Обновляем интерфейс
        App.checkAuthStatus();
        
        // Показываем уведомление
        App.showNotification('Вход выполнен успешно!', 'success');
        
        // Обновляем статистику
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateUserStats();
        }
    },
    
    // Обработка регистрации
    handleRegister: function() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const phone = document.getElementById('registerPhone')?.value.trim() || '';
        const acceptTerms = document.getElementById('acceptTerms')?.checked || false;
        
        // Валидация
        if (!name) {
            App.showNotification('Пожалуйста, введите имя', 'error');
            return;
        }
        
        if (!this.validateEmail(email)) {
            App.showNotification('Пожалуйста, введите корректный email', 'error');
            return;
        }
        
        if (password.length < 6) {
            App.showNotification('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            App.showNotification('Пароли не совпадают', 'error');
            return;
        }
        
        if (!acceptTerms) {
            App.showNotification('Необходимо принять правила и политику конфиденциальности', 'error');
            return;
        }
        
        // Проверяем, существует ли пользователь
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            App.showNotification('Пользователь с таким email уже существует', 'error');
            return;
        }
        
        // Создаем нового пользователя
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password, // В реальном приложении должно быть хеширование
            phone: phone,
            address: '',
            createdAt: new Date().toISOString()
        };
        
        // Добавляем пользователя
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Автоматический вход после регистрации
        const userData = {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            phone: newUser.phone,
            address: newUser.address,
            createdAt: newUser.createdAt
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Закрываем модальное окно
        App.hideModal('registerModal');
        
        // Обновляем интерфейс
        App.checkAuthStatus();
        
        // Показываем уведомление
        App.showNotification('Регистрация прошла успешно! Добро пожаловать!', 'success');
        
        // Обновляем форму профиля
        this.updateProfileForm(userData);
        
        // Обновляем статистику
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateUserStats();
        }
    },
    
    // Обработка изменения пароля
    handleChangePassword: function() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            App.showNotification('Необходимо войти в систему', 'error');
            return;
        }
        
        // Валидация
        if (newPassword.length < 6) {
            App.showNotification('Новый пароль должен содержать минимум 6 символов', 'error');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            App.showNotification('Новые пароли не совпадают', 'error');
            return;
        }
        
        // Получаем пользователя
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex === -1) {
            App.showNotification('Пользователь не найден', 'error');
            return;
        }
        
        // Проверяем текущий пароль
        if (users[userIndex].password !== currentPassword) {
            App.showNotification('Текущий пароль неверен', 'error');
            return;
        }
        
        // Обновляем пароль
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Закрываем модальное окно
        App.hideModal('changePasswordModal');
        
        // Показываем уведомление
        App.showNotification('Пароль успешно изменен', 'success');
        
        // Очищаем форму
        document.getElementById('changePasswordForm').reset();
    },
    
    // Валидация email
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Сохранение профиля
    saveProfile: function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            App.showNotification('Необходимо войти в систему', 'error');
            return false;
        }
        
        const name = document.getElementById('profileName').value.trim();
        const phone = document.getElementById('profilePhone').value.trim();
        const address = document.getElementById('profileAddress').value.trim();
        
        // Валидация
        if (!name) {
            App.showNotification('Пожалуйста, введите имя', 'error');
            return false;
        }
        
        // Обновляем данные пользователя
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex === -1) {
            App.showNotification('Пользователь не найден', 'error');
            return false;
        }
        
        // Обновляем данные
        users[userIndex].name = name;
        users[userIndex].phone = phone;
        users[userIndex].address = address;
        
        // Обновляем текущего пользователя
        currentUser.name = name;
        currentUser.phone = phone;
        currentUser.address = address;
        
        // Сохраняем изменения
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Обновляем интерфейс
        App.checkAuthStatus();
        
        return true;
    },
    
    // Выход из системы
    logout: function() {
        localStorage.removeItem('currentUser');
        App.checkAuthStatus();
        App.showNotification('Вы вышли из системы', 'info');
        App.showSection('home');
    }
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});

// Глобальный доступ для отладки
window.Auth = Auth;