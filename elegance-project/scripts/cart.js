// Cart module
const Cart = {
    // Инициализация модуля
    init: function() {
        this.setupEventListeners();
        this.displayCartItems();
        this.updateCartSummary();
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Кнопка оформления заказа
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.checkout();
            });
        }
        
        // Кнопка применения промокода
        const applyPromoBtn = document.getElementById('applyPromo');
        if (applyPromoBtn) {
            applyPromoBtn.addEventListener('click', () => {
                this.applyPromoCode();
            });
        }
        
        // Промокод по Enter
        const promoInput = document.getElementById('promoCode');
        if (promoInput) {
            promoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.applyPromoCode();
                }
            });
        }
        
        // Обработчики для динамически создаваемых элементов
        document.addEventListener('click', (e) => {
            // Увеличение количества
            if (e.target.closest('.quantity-btn.plus')) {
                const button = e.target.closest('.quantity-btn.plus');
                const productId = parseInt(button.dataset.productId);
                this.updateQuantity(productId, 1);
            }
            
            // Уменьшение количества
            if (e.target.closest('.quantity-btn.minus')) {
                const button = e.target.closest('.quantity-btn.minus');
                const productId = parseInt(button.dataset.productId);
                this.updateQuantity(productId, -1);
            }
            
            // Удаление товара
            if (e.target.closest('.cart-item-remove')) {
                const button = e.target.closest('.cart-item-remove');
                const productId = parseInt(button.dataset.productId);
                this.removeItem(productId);
            }
            
            // Очистка корзины
            if (e.target.closest('#clearCartBtn')) {
                if (confirm('Вы уверены, что хотите очистить корзину?')) {
                    this.clearCart();
                }
            }
        });
    },
    
    // Отображение товаров в корзине
    displayCartItems: function() {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;
        
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Корзина пуста</h3>
                    <p>Добавьте товары из каталога</p>
                    <button class="btn btn-primary" id="goToProductsBtn">
                        <i class="fas fa-shopping-bag"></i> Перейти к покупкам
                    </button>
                </div>
            `;
            
            // Добавляем обработчик для кнопки
            const goToProductsBtn = document.getElementById('goToProductsBtn');
            if (goToProductsBtn) {
                goToProductsBtn.addEventListener('click', () => {
                    App.showSection('products');
                });
            }
            
            return;
        }
        
        cartItemsContainer.innerHTML = '';
        
        cart.forEach(item => {
            const cartItem = this.createCartItem(item);
            cartItemsContainer.appendChild(cartItem);
        });
    },
    
    // Создание элемента корзины
    createCartItem: function(item) {
        const element = document.createElement('div');
        element.className = 'cart-item';
        element.dataset.productId = item.id;
        
        const itemTotal = item.price * item.quantity;
        
        element.innerHTML = `
            <div class="cart-item-image">
                <i class="fas fa-gem"></i>
            </div>
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.name}</h3>
                <span class="cart-item-category">${Products.getCategoryName(item.category)}</span>
                <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-control">
                    <button class="quantity-btn minus" data-product-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus" data-product-id="${item.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="cart-item-total">${itemTotal.toLocaleString()} ₽</div>
                <button class="cart-item-remove" data-product-id="${item.id}" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return element;
    },
    
    // Обновление количества товара
    updateQuantity: function(productId, change) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) return;
        
        const newQuantity = cart[itemIndex].quantity + change;
        
        if (newQuantity <= 0) {
            // Удаляем товар, если количество стало 0 или меньше
            this.removeItem(productId);
            return;
        }
        
        // Обновляем количество
        cart[itemIndex].quantity = newQuantity;
        
        // Сохраняем корзину
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Обновляем отображение
        this.displayCartItems();
        this.updateCartSummary();
        App.updateCartCount();
        
        // Обновляем статистику в личном кабинете
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateUserStats();
        }
    },
    
    // Удаление товара из корзины
    removeItem: function(productId) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const itemIndex = cart.findIndex(item => item.id === productId);
        
        if (itemIndex === -1) return;
        
        const itemName = cart[itemIndex].name;
        
        // Удаляем товар
        cart.splice(itemIndex, 1);
        
        // Сохраняем корзину
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Обновляем отображение
        this.displayCartItems();
        this.updateCartSummary();
        App.updateCartCount();
        
        // Обновляем статистику в личном кабинете
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateUserStats();
        }
        
        // Показываем уведомление
        App.showNotification(`${itemName} удален из корзины`, 'info');
    },
    
    // Очистка корзины
    clearCart: function() {
        localStorage.removeItem('cart');
        this.displayCartItems();
        this.updateCartSummary();
        App.updateCartCount();
        
        // Обновляем статистику в личном кабинете
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateUserStats();
        }
        
        App.showNotification('Корзина очищена', 'info');
    },
    
    // Обновление итоговой суммы
    updateCartSummary: function() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Расчет доставки (бесплатно от 5000 руб)
        const shipping = subtotal >= 5000 ? 0 : 300;
        
        // Расчет скидки по промокоду
        const discount = this.calculateDiscount(subtotal);
        
        // Итоговая сумма
        const totalAmount = subtotal + shipping - discount;
        
        // Обновляем элементы
        const totalItemsElement = document.getElementById('totalItems');
        const subtotalElement = document.getElementById('subtotal');
        const shippingElement = document.getElementById('shipping');
        const discountElement = document.getElementById('discount');
        const totalAmountElement = document.getElementById('totalAmount');
        
        if (totalItemsElement) totalItemsElement.textContent = totalItems;
        if (subtotalElement) subtotalElement.textContent = subtotal.toLocaleString() + ' ₽';
        if (shippingElement) shippingElement.textContent = shipping.toLocaleString() + ' ₽';
        if (discountElement) {
            discountElement.textContent = discount.toLocaleString() + ' ₽';
            discountElement.parentElement.style.display = discount > 0 ? 'flex' : 'none';
        }
        if (totalAmountElement) totalAmountElement.textContent = totalAmount.toLocaleString() + ' ₽';
        
        // Обновляем статистику в личном кабинете
        const statCart = document.getElementById('statCart');
        if (statCart) {
            statCart.textContent = totalItems;
        }
    },
    
    // Расчет скидки
    calculateDiscount: function(subtotal) {
        const activePromo = localStorage.getItem('activePromo');
        if (!activePromo) return 0;
        
        // Примеры промокодов
        const promoCodes = {
            'WELCOME10': 0.1, // 10% скидка
            'SUMMER20': 0.2,  // 20% скидка
            'FREESHIP': 300   // Бесплатная доставка
        };
        
        if (promoCodes[activePromo]) {
            const discount = promoCodes[activePromo];
            if (typeof discount === 'number' && discount < 1) {
                return subtotal * discount; // Процентная скидка
            } else {
                return discount; // Фиксированная скидка
            }
        }
        
        return 0;
    },
    
    // Применение промокода
    applyPromoCode: function() {
        const promoInput = document.getElementById('promoCode');
        if (!promoInput) return;
        
        const promoCode = promoInput.value.trim().toUpperCase();
        
        if (!promoCode) {
            App.showNotification('Введите промокод', 'error');
            return;
        }
        
        // Проверяем промокод
        const validPromoCodes = ['WELCOME10', 'SUMMER20', 'FREESHIP'];
        
        if (!validPromoCodes.includes(promoCode)) {
            App.showNotification('Неверный промокод', 'error');
            promoInput.value = '';
            return;
        }
        
        // Сохраняем активный промокод
        localStorage.setItem('activePromo', promoCode);
        
        // Обновляем итоговую сумму
        this.updateCartSummary();
        
        // Показываем уведомление
        App.showNotification('Промокод применен успешно!', 'success');
        
        // Очищаем поле ввода
        promoInput.value = '';
        
        // Меняем текст кнопки
        const applyPromoBtn = document.getElementById('applyPromo');
        if (applyPromoBtn) {
            applyPromoBtn.innerHTML = '<i class="fas fa-check"></i> Применен';
            applyPromoBtn.disabled = true;
            
            setTimeout(() => {
                applyPromoBtn.innerHTML = 'Применить';
                applyPromoBtn.disabled = false;
            }, 3000);
        }
    },
    
    // Оформление заказа
    checkout: function() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (cart.length === 0) {
            App.showNotification('Корзина пуста', 'error');
            return;
        }
        
        if (!currentUser) {
            App.showNotification('Для оформления заказа необходимо войти в систему', 'error');
            App.showModal('loginModal');
            return;
        }
        
        // Рассчитываем итоговую сумму
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = subtotal >= 5000 ? 0 : 300;
        const discount = this.calculateDiscount(subtotal);
        const totalAmount = subtotal + shipping - discount;
        
        // Создаем заказ
        const order = {
            id: Date.now(),
            userId: currentUser.id,
            items: [...cart],
            subtotal: subtotal,
            shipping: shipping,
            discount: discount,
            total: totalAmount,
            date: new Date().toISOString(),
            status: 'pending',
            shippingAddress: currentUser.address || '',
            paymentMethod: 'card',
            paymentStatus: 'pending'
        };
        
        // Сохраняем заказ
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Очищаем корзину и промокод
        localStorage.removeItem('cart');
        localStorage.removeItem('activePromo');
        
        // Обновляем отображение
        this.displayCartItems();
        this.updateCartSummary();
        App.updateCartCount();
        
        // Обновляем статистику в личном кабинете
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateUserStats();
            Dashboard.loadOrders();
        }
        
        // Показываем уведомление
        App.showNotification(`Заказ #${order.id} успешно оформлен!`, 'success');
        
        // Переходим в личный кабинет
        App.showSection('dashboard');
        
        // Активируем вкладку заказов
        const ordersTab = document.querySelector('.dashboard-nav-link[data-tab="orders"]');
        if (ordersTab) {
            ordersTab.click();
        }
    }
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});

// Глобальный доступ для отладки
window.Cart = Cart;