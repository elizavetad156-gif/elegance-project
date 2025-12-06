// Dashboard module
const Dashboard = {
    // Инициализация модуля
    init: function() {
        this.setupEventListeners();
        this.loadUserData();
        this.updateUserStats();
        this.loadOrders();
        this.displayFavorites();
        this.loadSettings();
        this.initCharts();
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Навигация в личном кабинете
        document.querySelectorAll('.dashboard-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = link.dataset.tab;
                this.showTab(tabId);
                
                // Обновляем активную ссылку
                document.querySelectorAll('.dashboard-nav-link').forEach(l => {
                    l.classList.remove('active');
                });
                link.classList.add('active');
            });
        });
        
        // Форма профиля
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }
        
        // Кнопка обновления заказов
        const refreshOrdersBtn = document.getElementById('refreshOrders');
        if (refreshOrdersBtn) {
            refreshOrdersBtn.addEventListener('click', () => {
                this.loadOrders();
                App.showNotification('Список заказов обновлен', 'info');
            });
        }
        
        // Кнопка очистки избранного
        const clearFavoritesBtn = document.getElementById('clearFavorites');
        if (clearFavoritesBtn) {
            clearFavoritesBtn.addEventListener('click', () => {
                if (confirm('Вы уверены, что хотите очистить избранное?')) {
                    this.clearFavorites();
                }
            });
        }
        
        // Кнопка сохранения настроек
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
        
        // Кнопка экспорта данных
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }
        
        // Кнопка удаления аккаунта
        const deleteAccountBtn = document.getElementById('deleteAccountBtn');
        if (deleteAccountBtn) {
            deleteAccountBtn.addEventListener('click', () => {
                if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
                    this.deleteAccount();
                }
            });
        }
        
        // Изменение периода статистики
        const statPeriod = document.getElementById('statPeriod');
        if (statPeriod) {
            statPeriod.addEventListener('change', () => {
                this.updateCharts();
            });
        }
        
        // Обработчики для динамически создаваемых элементов
        document.addEventListener('click', (e) => {
            // Изменение статуса заказа
            if (e.target.closest('.change-status-btn')) {
                const button = e.target.closest('.change-status-btn');
                const orderId = parseInt(button.dataset.orderId);
                const newStatus = button.dataset.status;
                this.changeOrderStatus(orderId, newStatus);
            }
            
            // Отмена заказа
            if (e.target.closest('.cancel-order-btn')) {
                const button = e.target.closest('.cancel-order-btn');
                const orderId = parseInt(button.dataset.orderId);
                if (confirm('Вы уверены, что хотите отменить заказ?')) {
                    this.changeOrderStatus(orderId, 'cancelled');
                }
            }
            
            // Повтор заказа
            if (e.target.closest('.repeat-order-btn')) {
                const button = e.target.closest('.repeat-order-btn');
                const orderId = parseInt(button.dataset.orderId);
                this.repeatOrder(orderId);
            }
            
            // Добавление в корзину из избранного
            if (e.target.closest('.add-to-cart-from-fav')) {
                const button = e.target.closest('.add-to-cart-from-fav');
                const productId = parseInt(button.dataset.productId);
                this.addToCartFromFavorites(productId);
            }
        });
    },
    
    // Загрузка данных пользователя
    loadUserData: function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        // Обновляем форму профиля
        this.updateProfileForm(currentUser);
        
        // Обновляем имя в сайдбаре
        const dashboardUserName = document.getElementById('dashboardUserName');
        const dashboardUserEmail = document.getElementById('dashboardUserEmail');
        const dashboardAvatar = document.getElementById('dashboardAvatar');
        
        if (dashboardUserName) dashboardUserName.textContent = currentUser.name || 'Пользователь';
        if (dashboardUserEmail) dashboardUserEmail.textContent = currentUser.email;
        
        if (dashboardAvatar && currentUser.name) {
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
            dashboardAvatar.textContent = initials;
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
    
    // Обновление статистики пользователя
    updateUserStats: function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        // Фильтруем заказы текущего пользователя
        let userOrders = [];
        if (currentUser) {
            userOrders = orders.filter(order => order.userId === currentUser.id);
        }
        
        // Рассчитываем статистику
        const totalOrders = userOrders.length;
        const totalCartItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        const totalFavorites = favorites.length;
        
        // Обновляем отображение статистики
        const statOrders = document.getElementById('statOrders');
        const statCart = document.getElementById('statCart');
        const statFavorites = document.getElementById('statFavorites');
        
        if (statOrders) statOrders.textContent = totalOrders;
        if (statCart) statCart.textContent = totalCartItems;
        if (statFavorites) statFavorites.textContent = totalFavorites;
        
        // Обновляем статистику в разделе статистики
        this.updateStatisticsSummary(userOrders);
    },
    
    // Показать вкладку
    showTab: function(tabId) {
        // Скрываем все вкладки
        document.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Показываем целевую вкладку
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.classList.add('active');
            
            // Инициализируем вкладку при необходимости
            switch(tabId) {
                case 'orders':
                    this.loadOrders();
                    break;
                case 'favorites':
                    this.displayFavorites();
                    break;
                case 'statistics':
                    this.updateCharts();
                    break;
                case 'settings':
                    this.loadSettings();
                    break;
            }
        }
    },
    
    // Сохранение профиля
    saveProfile: function() {
        if (!Auth.saveProfile()) return;
        
        App.showNotification('Профиль успешно сохранен', 'success');
        
        // Обновляем данные пользователя
        this.loadUserData();
    },
    
    // Загрузка заказов
    loadOrders: function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const ordersTableBody = document.getElementById('ordersTableBody');
        
        if (!ordersTableBody) return;
        
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        
        // Фильтруем заказы текущего пользователя
        let userOrders = [];
        if (currentUser) {
            userOrders = orders.filter(order => order.userId === currentUser.id);
        } else {
            userOrders = [];
        }
        
        // Сортируем по дате (новые сначала)
        userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Очищаем таблицу
        ordersTableBody.innerHTML = '';
        
        if (userOrders.length === 0) {
            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-orders">
                        <i class="fas fa-shopping-bag"></i>
                        <p>У вас пока нет заказов</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        // Отображаем заказы
        userOrders.forEach(order => {
            const row = this.createOrderRow(order);
            ordersTableBody.appendChild(row);
        });
    },
    
    // Создание строки заказа
    createOrderRow: function(order) {
        const row = document.createElement('tr');
        
        // Форматируем дату
        const orderDate = new Date(order.date);
        const formattedDate = orderDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Количество товаров
        const totalItems = order.items.reduce((total, item) => total + (item.quantity || 1), 0);
        
        // Статус заказа
        const statusText = this.getStatusText(order.status);
        const statusClass = `status-${order.status}`;
        
        // Действия в зависимости от статуса
        let actions = '';
        if (order.status === 'pending') {
            actions = `
                <button class="btn btn-outline btn-sm change-status-btn" data-order-id="${order.id}" data-status="processing">
                    В обработку
                </button>
                <button class="btn btn-outline btn-sm btn-danger cancel-order-btn" data-order-id="${order.id}">
                    Отменить
                </button>
            `;
        } else if (order.status === 'processing') {
            actions = `
                <button class="btn btn-outline btn-sm change-status-btn" data-order-id="${order.id}" data-status="shipped">
                    Отправить
                </button>
            `;
        } else if (order.status === 'shipped') {
            actions = `
                <button class="btn btn-outline btn-sm change-status-btn" data-order-id="${order.id}" data-status="delivered">
                    Доставлено
                </button>
            `;
        } else if (order.status === 'delivered') {
            actions = `
                <button class="btn btn-outline btn-sm repeat-order-btn" data-order-id="${order.id}">
                    Повторить
                </button>
            `;
        } else if (order.status === 'cancelled') {
            actions = `
                <button class="btn btn-outline btn-sm repeat-order-btn" data-order-id="${order.id}">
                    Повторить
                </button>
            `;
        }
        
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${formattedDate}</td>
            <td>${totalItems} товар(ов)</td>
            <td>${order.total.toLocaleString()} ₽</td>
            <td><span class="order-status ${statusClass}">${statusText}</span></td>
            <td>
                <div class="order-actions">
                    ${actions}
                </div>
            </td>
        `;
        
        return row;
    },
    
    // Изменение статуса заказа
    changeOrderStatus: function(orderId, newStatus) {
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex === -1) {
            App.showNotification('Заказ не найден', 'error');
            return;
        }
        
        // Обновляем статус
        orders[orderIndex].status = newStatus;
        orders[orderIndex].updatedAt = new Date().toISOString();
        
        // Сохраняем изменения
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Обновляем отображение
        this.loadOrders();
        
        // Обновляем статистику
        this.updateUserStats();
        this.updateCharts();
        
        // Показываем уведомление
        const statusText = this.getStatusText(newStatus);
        App.showNotification(`Статус заказа #${orderId} изменен на "${statusText}"`, 'success');
    },
    
    // Повтор заказа
    repeatOrder: function(orderId) {
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        const order = orders.find(o => o.id === orderId);
        
        if (!order) {
            App.showNotification('Заказ не найден', 'error');
            return;
        }
        
        // Добавляем товары из заказа в корзину
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        order.items.forEach(orderItem => {
            const existingItemIndex = cart.findIndex(item => item.id === orderItem.id);
            
            if (existingItemIndex !== -1) {
                // Увеличиваем количество
                cart[existingItemIndex].quantity += orderItem.quantity;
            } else {
                // Добавляем новый товар
                cart.push({
                    id: orderItem.id,
                    name: orderItem.name,
                    price: orderItem.price,
                    image: orderItem.image,
                    category: orderItem.category,
                    quantity: orderItem.quantity
                });
            }
        });
        
        // Сохраняем корзину
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Обновляем счетчик корзины
        App.updateCartCount();
        
        // Обновляем статистику
        this.updateUserStats();
        
        // Показываем уведомление и переходим в корзину
        App.showNotification('Товары из заказа добавлены в корзину', 'success');
        App.showSection('cart');
    },
    
    // Отображение избранного
    displayFavorites: function() {
        const favoritesGrid = document.getElementById('favoritesGrid');
        if (!favoritesGrid) return;
        
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        if (favorites.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="empty-favorites">
                    <i class="fas fa-heart"></i>
                    <h4>Список избранного пуст</h4>
                    <p>Добавляйте товары в избранное, нажимая на сердечко</p>
                    <button class="btn btn-primary" id="browseProductsBtn">
                        <i class="fas fa-shopping-bag"></i> Перейти к покупкам
                    </button>
                </div>
            `;
            
            // Добавляем обработчик для кнопки
            const browseProductsBtn = document.getElementById('browseProductsBtn');
            if (browseProductsBtn) {
                browseProductsBtn.addEventListener('click', () => {
                    App.showSection('products');
                });
            }
            
            return;
        }
        
        favoritesGrid.innerHTML = '';
        
        // Отображаем товары из избранного
        favorites.forEach(favoriteId => {
            const product = Products.getProductById(favoriteId);
            if (product) {
                const favoriteItem = this.createFavoriteItem(product);
                favoritesGrid.appendChild(favoriteItem);
            }
        });
    },
    
    // Создание элемента избранного
    createFavoriteItem: function(product) {
        const element = document.createElement('div');
        element.className = 'favorite-item';
        element.dataset.productId = product.id;
        
        element.innerHTML = `
            <div class="favorite-item-image">
                <i class="fas fa-gem"></i>
            </div>
            <div class="favorite-item-info">
                <h4 class="favorite-item-title">${product.name}</h4>
                <div class="favorite-item-price">${product.price.toLocaleString()} ₽</div>
                <div class="favorite-item-actions">
                    <button class="btn btn-primary btn-sm add-to-cart-from-fav" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> В корзину
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="App.showSection('products')">
                        <i class="fas fa-eye"></i> Посмотреть
                    </button>
                </div>
            </div>
            <button class="remove-favorite" data-product-id="${product.id}" title="Удалить из избранного">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        return element;
    },
    
    // Добавление в корзину из избранного
    addToCartFromFavorites: function(productId) {
        // Используем функцию из модуля Products
        if (typeof Products !== 'undefined' && typeof Products.addToCart === 'function') {
            Products.addToCart(productId);
        }
    },
    
    // Очистка избранного
    clearFavorites: function() {
        localStorage.removeItem('favorites');
        this.displayFavorites();
        this.updateUserStats();
        App.showNotification('Избранное очищено', 'info');
    },
    
    // Обновление статистики
    updateStatisticsSummary: function(userOrders) {
        const totalOrdersStat = document.getElementById('totalOrdersStat');
        const totalSpentStat = document.getElementById('totalSpentStat');
        const avgOrderStat = document.getElementById('avgOrderStat');
        
        if (!totalOrdersStat || !totalSpentStat || !avgOrderStat) return;
        
        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
        const avgOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;
        
        totalOrdersStat.textContent = totalOrders;
        totalSpentStat.textContent = totalSpent.toLocaleString() + ' ₽';
        avgOrderStat.textContent = avgOrder.toLocaleString() + ' ₽';
    },
    
    // Инициализация графиков
    initCharts: function() {
        // Проверяем, загружен ли Chart.js
        if (typeof Chart === 'undefined') {
            console.error('Chart.js не загружен');
            return;
        }
        
        // Создаем графики
        this.createCategoryChart();
        this.createMonthlyChart();
    },
    
    // Создание графика категорий
    createCategoryChart: function() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;
        
        // Уничтожаем предыдущий график, если он существует
        if (ctx.chartInstance) {
            ctx.chartInstance.destroy();
        }
        
        // Получаем данные
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const userOrders = currentUser ? orders.filter(order => order.userId === currentUser.id) : [];
        
        // Анализируем категории
        const categoryData = {};
        userOrders.forEach(order => {
            order.items.forEach(item => {
                const category = Products.getCategoryName(item.category);
                categoryData[category] = (categoryData[category] || 0) + item.quantity;
            });
        });
        
        // Если нет данных, показываем заглушку
        if (Object.keys(categoryData).length === 0) {
            categoryData['Покупок нет'] = 1;
        }
        
        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        
        // Создаем график
        ctx.chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(139, 95, 191, 0.8)',
                        'rgba(255, 133, 162, 0.8)',
                        'rgba(95, 211, 255, 0.8)',
                        'rgba(255, 214, 231, 0.8)',
                        'rgba(226, 209, 249, 0.8)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    // Создание графика по месяцам
    createMonthlyChart: function() {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;
        
        // Уничтожаем предыдущий график
        if (ctx.chartInstance) {
            ctx.chartInstance.destroy();
        }
        
        // Получаем данные
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const userOrders = currentUser ? orders.filter(order => order.userId === currentUser.id) : [];
        
        // Анализируем по месяцам
        const monthlyData = {};
        const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        
        // Получаем выбранный период
        const periodSelect = document.getElementById('statPeriod');
        const period = periodSelect ? periodSelect.value : 'year';
        
        let startDate = new Date();
        switch(period) {
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            case 'all':
                startDate = new Date(0); // Начало времени
                break;
        }
        
        // Фильтруем заказы по периоду
        const filteredOrders = userOrders.filter(order => 
            new Date(order.date) >= startDate
        );
        
        // Группируем по месяцам
        filteredOrders.forEach(order => {
            const date = new Date(order.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            const monthLabel = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            
            if (!monthlyData[monthLabel]) {
                monthlyData[monthLabel] = 0;
            }
            monthlyData[monthLabel] += order.total;
        });
        
        // Сортируем по дате
        const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            const dateA = new Date(`${monthA} 1, ${yearA}`);
            const dateB = new Date(`${monthB} 1, ${yearB}`);
            return dateA - dateB;
        });
        
        const labels = sortedMonths;
        const data = sortedMonths.map(month => monthlyData[month]);
        
        // Если нет данных, показываем заглушку
        if (labels.length === 0) {
            labels.push('Нет данных');
            data.push(0);
        }
        
        // Создаем график
        ctx.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Сумма покупок (₽)',
                    data: data,
                    backgroundColor: 'rgba(139, 95, 191, 0.7)',
                    borderColor: 'rgba(139, 95, 191, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + ' ₽';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Сумма: ${context.raw.toLocaleString()} ₽`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    // Обновление графиков
    updateCharts: function() {
        this.createCategoryChart();
        this.createMonthlyChart();
    },
    
    // Загрузка настроек
    loadSettings: function() {
        const settings = JSON.parse(localStorage.getItem('settings')) || {
            emailNotifications: true,
            smsNotifications: false,
            theme: 'light',
            compactView: false
        };
        
        // Заполняем форму настроек
        const emailNotifications = document.getElementById('emailNotifications');
        const smsNotifications = document.getElementById('smsNotifications');
        const themeSelect = document.getElementById('themeSelect');
        const compactView = document.getElementById('compactView');
        
        if (emailNotifications) emailNotifications.checked = settings.emailNotifications;
        if (smsNotifications) smsNotifications.checked = settings.smsNotifications;
        if (themeSelect) themeSelect.value = settings.theme;
        if (compactView) compactView.checked = settings.compactView;
    },
    
    // Сохранение настроек
    saveSettings: function() {
        const settings = {
            emailNotifications: document.getElementById('emailNotifications').checked,
            smsNotifications: document.getElementById('smsNotifications').checked,
            theme: document.getElementById('themeSelect').value,
            compactView: document.getElementById('compactView').checked
        };
        
        localStorage.setItem('settings', JSON.stringify(settings));
        App.showNotification('Настройки сохранены', 'success');
        
        // Применяем тему
        this.applyTheme(settings.theme);
    },
    
    // Применение темы
    applyTheme: function(theme) {
        document.body.setAttribute('data-theme', theme);
    },
    
    // Экспорт данных
    exportData: function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            App.showNotification('Необходимо войти в систему', 'error');
            return;
        }
        
        // Собираем данные пользователя
        const userData = {
            profile: currentUser,
            orders: JSON.parse(localStorage.getItem('orders') || '[]').filter(order => order.userId === currentUser.id),
            favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
            cart: JSON.parse(localStorage.getItem('cart') || '[]'),
            settings: JSON.parse(localStorage.getItem('settings') || '{}')
        };
        
        // Создаем JSON файл
        const dataStr = JSON.stringify(userData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        // Создаем ссылку для скачивания
        const exportFileDefaultName = `elegance-data-${currentUser.id}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        App.showNotification('Данные успешно экспортированы', 'success');
    },
    
    // Удаление аккаунта
    deleteAccount: function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        // Удаляем пользователя из списка
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users = users.filter(user => user.id !== currentUser.id);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Удаляем данные пользователя
        localStorage.removeItem('currentUser');
        
        // Очищаем корзину и избранное пользователя
        localStorage.removeItem('cart');
        localStorage.removeItem('favorites');
        
        // Удаляем заказы пользователя
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders = orders.filter(order => order.userId !== currentUser.id);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Обновляем интерфейс
        App.checkAuthStatus();
        App.showNotification('Аккаунт успешно удален', 'info');
        App.showSection('home');
    },
    
    // Получение текста статуса
    getStatusText: function(status) {
        const statusMap = {
            'pending': 'Ожидание',
            'processing': 'В обработке',
            'shipped': 'Отправлен',
            'delivered': 'Доставлен',
            'cancelled': 'Отменен',
            'refunded': 'Возврат'
        };
        
        return statusMap[status] || status;
    }
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    Dashboard.init();
});

// Глобальный доступ для отладки
window.Dashboard = Dashboard;