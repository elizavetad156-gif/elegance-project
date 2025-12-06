// Main application module
const App = {
    // Инициализация приложения
    init: function() {
        console.log('Elegance приложение инициализировано');
        
        // Инициализация всех модулей
        this.initModules();
        
        // Настройка обработчиков событий
        this.setupEventListeners();
        
        // Загрузка начальных данных
        this.loadInitialData();
        
        // Проверка статуса авторизации
        this.checkAuthStatus();
        
        // Обновление счетчика корзины
        this.updateCartCount();
        
        // Показать главную страницу
        this.showSection('home');
    },
    
    // Инициализация модулей
    initModules: function() {
        // Инициализируем модули, если они существуют
        if (typeof Products !== 'undefined') Products.init();
        if (typeof Cart !== 'undefined') Cart.init();
        if (typeof Dashboard !== 'undefined') Dashboard.init();
        if (typeof Map !== 'undefined') Map.init();
    },
    
    // Загрузка начальных данных
    loadInitialData: function() {
        // Инициализация данных, если их нет
        this.initStorageData();
        
        // Загрузка товаров
        if (typeof Products !== 'undefined' && typeof Products.loadProducts === 'function') {
            Products.loadProducts();
        }
    },
    
    // Инициализация данных в localStorage
    initStorageData: function() {
        // Проверяем и инициализируем необходимые данные
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('orders')) {
            localStorage.setItem('orders', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('favorites')) {
            localStorage.setItem('favorites', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('settings')) {
            const defaultSettings = {
                emailNotifications: true,
                smsNotifications: false,
                theme: 'light',
                compactView: false
            };
            localStorage.setItem('settings', JSON.stringify(defaultSettings));
        }
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Навигация по секциям
        this.setupNavigation();
        
        // Мобильное меню
        this.setupMobileMenu();
        
        // Кнопки авторизации
        this.setupAuthButtons();
        
        // Кнопка просмотра коллекции
        const viewCollectionBtn = document.getElementById('viewCollectionBtn');
        if (viewCollectionBtn) {
            viewCollectionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection('products');
                
                // Обновляем активную ссылку в навигации
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.dataset.section === 'products') {
                        link.classList.add('active');
                    }
                });
            });
        }
        
        // Кнопка перехода к товарам из пустой корзины
        const goToProductsBtn = document.getElementById('goToProductsBtn');
        if (goToProductsBtn) {
            goToProductsBtn.addEventListener('click', () => {
                this.showSection('products');
            });
        }
        
        // Кнопка перехода к товарам из пустого избранного
        const browseProductsBtn = document.getElementById('browseProductsBtn');
        if (browseProductsBtn) {
            browseProductsBtn.addEventListener('click', () => {
                this.showSection('products');
            });
        }
        
        // Ссылки в футере
        document.querySelectorAll('a[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });
    },
    
    // Настройка навигации
    setupNavigation: function() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.dataset.section;
                
                // Обновляем активную ссылку
                document.querySelectorAll('.nav-link').forEach(l => {
                    l.classList.remove('active');
                });
                link.classList.add('active');
                
                // Показываем секцию
                this.showSection(sectionId);
                
                // Закрываем мобильное меню
                const navMenu = document.getElementById('nav-menu');
                if (navMenu) navMenu.classList.remove('active');
            });
        });
    },
    
    // Настройка мобильного меню
    setupMobileMenu: function() {
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                menuToggle.innerHTML = navMenu.classList.contains('active') 
                    ? '<i class="fas fa-times"></i>' 
                    : '<i class="fas fa-bars"></i>';
            });
            
            // Закрытие меню при клике вне его
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        }
    },
    
    // Настройка кнопок авторизации
    setupAuthButtons: function() {
        // Кнопки открытия модальных окон
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.showModal('loginModal');
            });
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.showModal('registerModal');
            });
        }
        
        // Кнопка выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (typeof Auth !== 'undefined' && typeof Auth.logout === 'function') {
                    Auth.logout();
                } else {
                    this.logout();
                }
            });
        }
        
        // Переключение между модальными окнами
        const switchToLogin = document.getElementById('switchToLogin');
        const switchToRegister = document.getElementById('switchToRegister');
        
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('registerModal');
                this.showModal('loginModal');
            });
        }
        
        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideModal('loginModal');
                this.showModal('registerModal');
            });
        }
        
        // Закрытие модальных окон
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });
        
        // Закрытие модальных окон при клике вне их
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal.id);
                }
            });
        });
    },
    
    // Показать секцию
    showSection: function(sectionId) {
        // Скрыть все секции
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Показать целевую секцию
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Прокрутка к началу секции
            window.scrollTo({ top: 80, behavior: 'smooth' });
            
            // Инициализация секции
            this.initSection(sectionId);
        }
    },
    
    // Инициализация секции
    initSection: function(sectionId) {
        switch(sectionId) {
            case 'products':
                if (typeof Products !== 'undefined' && typeof Products.displayProducts === 'function') {
                    Products.displayProducts();
                }
                break;
                
            case 'cart':
                if (typeof Cart !== 'undefined' && typeof Cart.displayCartItems === 'function') {
                    Cart.displayCartItems();
                }
                break;
                
            case 'dashboard':
                if (typeof Dashboard !== 'undefined' && typeof Dashboard.init === 'function') {
                    Dashboard.init();
                }
                break;
                
            case 'stores':
                if (typeof Map !== 'undefined' && typeof Map.init === 'function') {
                    // Даем небольшую задержку для инициализации карты
                    setTimeout(() => {
                        if (!Map.map) {
                            Map.init();
                        }
                    }, 300);
                }
                break;
        }
    },
    
    // Показать модальное окно
    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },
    
    // Скрыть модальное окно
    hideModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },
    
    // Проверка статуса авторизации
    checkAuthStatus: function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');
        const userName = document.getElementById('userName');
        const dashboardUserName = document.getElementById('dashboardUserName');
        const dashboardUserEmail = document.getElementById('dashboardUserEmail');
        const dashboardAvatar = document.getElementById('dashboardAvatar');
        
        if (currentUser) {
            // Пользователь авторизован
            if (loginBtn) loginBtn.classList.add('hidden');
            if (registerBtn) registerBtn.classList.add('hidden');
            if (userMenu) userMenu.classList.remove('hidden');
            if (userName) userName.textContent = currentUser.name || currentUser.email;
            
            // Обновление информации в личном кабинете
            if (dashboardUserName) dashboardUserName.textContent = currentUser.name || 'Пользователь';
            if (dashboardUserEmail) dashboardUserEmail.textContent = currentUser.email;
            
            // Обновление аватара
            if (dashboardAvatar && currentUser.name) {
                const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
                dashboardAvatar.textContent = initials;
            }
            
            // Загрузка данных пользователя
            this.loadUserData(currentUser);
        } else {
            // Пользователь не авторизован
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (registerBtn) registerBtn.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
            if (dashboardUserName) dashboardUserName.textContent = 'Гость';
            if (dashboardUserEmail) dashboardUserEmail.textContent = 'Войдите в систему';
            if (dashboardAvatar) dashboardAvatar.textContent = '?';
        }
    },
    
    // Загрузка данных пользователя
    loadUserData: function(user) {
        // Здесь можно загрузить дополнительные данные пользователя
        // Например, заказы, избранное и т.д.
    },
    
    // Выход из системы
    logout: function() {
        localStorage.removeItem('currentUser');
        this.checkAuthStatus();
        this.showNotification('Вы вышли из системы', 'info');
        this.showSection('home');
    },
    
    // Обновление счетчика корзины
    updateCartCount: function() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((total, item) => total + (item.quantity || 1), 0);
        
        document.querySelectorAll('.cart-count').forEach(element => {
            element.textContent = totalItems;
        });
        
        // Обновляем статистику в личном кабинете
        const statCart = document.getElementById('statCart');
        if (statCart) {
            statCart.textContent = totalItems;
        }
    },
    
    // Показать уведомление
    showNotification: function(message, type = 'info', duration = 3000) {
        const notification = document.getElementById('notification');
        
        if (!notification) {
            console.error('Элемент уведомления не найден');
            return;
        }
        
        // Устанавливаем сообщение и тип
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        // Показываем уведомление
        notification.classList.remove('slide-out');
        notification.classList.add('show', 'slide-in');
        
        // Автоматическое скрытие через указанное время
        setTimeout(() => {
            notification.classList.remove('slide-in');
            notification.classList.add('slide-out');
            
            setTimeout(() => {
                notification.classList.remove('show', 'slide-out');
            }, 300);
        }, duration);
    },
    
    // Сохранение данных
    saveData: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
            this.showNotification('Ошибка сохранения данных', 'error');
            return false;
        }
    },
    
    // Загрузка данных
    loadData: function(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            return null;
        }
    }
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Глобальный доступ для отладки
window.App = App;