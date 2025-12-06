// Products module
const Products = {
    products: [],
    currentFilter: 'all',
    
    // Инициализация модуля
    init: function() {
        this.loadProducts();
        this.setupEventListeners();
        this.displayProducts();
    },
    
    // Загрузка товаров
    loadProducts: function() {
        // Данные товаров
        this.products = [
            {
                id: 1,
                name: 'Кольцо "Нежность"',
                category: 'rings',
                price: 2500,
                oldPrice: 3000,
                description: 'Серебряное кольцо с фианитом. Идеально подходит для повседневной носки.',
                image: 'ring1',
                rating: 4.8,
                reviews: 24,
                inStock: true,
                isNew: true,
                isPopular: true,
                features: ['Серебро 925 пробы', 'Фианит', 'Размеры: 16-20']
            },
            {
                id: 2,
                name: 'Серьги "Весенний ветер"',
                category: 'earrings',
                price: 3200,
                oldPrice: 3800,
                description: 'Золотые серьги с жемчугом. Элегантное украшение для особых случаев.',
                image: 'earrings1',
                rating: 4.9,
                reviews: 18,
                inStock: true,
                isNew: true,
                isOnSale: true,
                features: ['Золото 585 пробы', 'Жемчуг', 'Длина: 3 см']
            },
            {
                id: 3,
                name: 'Колье "Королевское"',
                category: 'necklaces',
                price: 5800,
                description: 'Колье с сапфиром и бриллиантами. Роскошное украшение для вечерних выходов.',
                image: 'necklace1',
                rating: 5.0,
                reviews: 12,
                inStock: true,
                isNew: false,
                isPopular: true,
                features: ['Белое золото', 'Сапфир', 'Бриллианты', 'Длина: 45 см']
            },
            {
                id: 4,
                name: 'Браслет "Гармония"',
                category: 'bracelets',
                price: 4200,
                oldPrice: 4800,
                description: 'Серебряный браслет с гранатами. Стильное украшение для любого образа.',
                image: 'bracelet1',
                rating: 4.7,
                reviews: 21,
                inStock: true,
                isNew: false,
                isOnSale: true,
                features: ['Серебро 925 пробы', 'Гранаты', 'Регулируемая длина']
            },
            {
                id: 5,
                name: 'Комплект "Свадебный"',
                category: 'sets',
                price: 12500,
                description: 'Полный комплект украшений для невесты. Серьги, колье и браслет в одном стиле.',
                image: 'set1',
                rating: 4.9,
                reviews: 8,
                inStock: true,
                isNew: true,
                features: ['Белое золото', 'Жемчуг', 'Бриллианты', 'Полный комплект']
            },
            {
                id: 6,
                name: 'Кольцо "Лунный свет"',
                category: 'rings',
                price: 3800,
                description: 'Кольцо с лунным камнем. Загадочное и элегантное украшение.',
                image: 'ring2',
                rating: 4.6,
                reviews: 15,
                inStock: true,
                isNew: true,
                features: ['Серебро 925 пробы', 'Лунный камень', 'Размеры: 16-20']
            },
            {
                id: 7,
                name: 'Серьги "Морская волна"',
                category: 'earrings',
                price: 2900,
                oldPrice: 3500,
                description: 'Серьги с аквамарином. Напоминают о море и лете.',
                image: 'earrings2',
                rating: 4.5,
                reviews: 19,
                inStock: true,
                isNew: false,
                isOnSale: true,
                features: ['Серебро 925 пробы', 'Аквамарин', 'Длина: 4 см']
            },
            {
                id: 8,
                name: 'Колье "Вечернее сияние"',
                category: 'necklaces',
                price: 6800,
                description: 'Колье с горным хрусталем. Игра света и тени в каждом камне.',
                image: 'necklace2',
                rating: 4.8,
                reviews: 11,
                inStock: true,
                isNew: true,
                features: ['Серебро 925 пробы', 'Горный хрусталь', 'Длина: 50 см']
            }
        ];
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Фильтры
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                // Обновляем активную кнопку
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
                
                // Устанавливаем фильтр
                this.currentFilter = button.dataset.filter;
                
                // Отображаем отфильтрованные товары
                this.displayProducts();
            });
        });
        
        // Обработчики для добавления в корзину и избранное
        document.addEventListener('click', (e) => {
            // Добавление в корзину
            if (e.target.closest('.btn-add-cart')) {
                const button = e.target.closest('.btn-add-cart');
                const productId = parseInt(button.dataset.productId);
                this.addToCart(productId);
            }
            
            // Добавление в избранное
            if (e.target.closest('.btn-favorite')) {
                const button = e.target.closest('.btn-favorite');
                const productId = parseInt(button.dataset.productId);
                this.toggleFavorite(productId, button);
            }
            
            // Удаление из избранного
            if (e.target.closest('.remove-favorite')) {
                const button = e.target.closest('.remove-favorite');
                const productId = parseInt(button.dataset.productId);
                this.removeFromFavorites(productId);
            }
        });
    },
    
    // Отображение товаров
    displayProducts: function() {
        const productsGrid = document.getElementById('productsGrid');
        if (!productsGrid) return;
        
        // Фильтруем товары
        let filteredProducts = this.products;
        if (this.currentFilter !== 'all') {
            filteredProducts = this.products.filter(product => 
                product.category === this.currentFilter
            );
        }
        
        // Очищаем сетку
        productsGrid.innerHTML = '';
        
        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = `
                <div class="empty-products">
                    <i class="fas fa-search"></i>
                    <h3>Товары не найдены</h3>
                    <p>Попробуйте изменить параметры фильтрации</p>
                    <button class="btn btn-primary" onclick="Products.currentFilter = 'all'; Products.displayProducts();">
                        Показать все товары
                    </button>
                </div>
            `;
            return;
        }
        
        // Отображаем каждый товар
        filteredProducts.forEach(product => {
            const productCard = this.createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    },
    
    // Создание карточки товара
    createProductCard: function(product) {
        const card = document.createElement('div');
        card.className = 'product-card hover-lift';
        card.dataset.productId = product.id;
        
        // Проверяем, находится ли товар в избранном
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isFavorite = favorites.includes(product.id);
        
        // Формируем HTML
        card.innerHTML = `
            <div class="product-image">
                <div class="product-badges">
                    ${product.isNew ? '<span class="product-badge badge-new">Новинка</span>' : ''}
                    ${product.isOnSale ? '<span class="product-badge badge-sale">Скидка</span>' : ''}
                    ${product.isPopular ? '<span class="product-badge badge-popular">Популярное</span>' : ''}
                </div>
                <i class="fas fa-gem"></i>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-meta">
                    <div class="product-price">
                        <span class="current-price">${product.price.toLocaleString()} ₽</span>
                        ${product.oldPrice ? `<span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>` : ''}
                    </div>
                    <div class="product-rating">
                        <i class="fas fa-star"></i>
                        <span>${product.rating}</span>
                        <span class="reviews-count">(${product.reviews})</span>
                    </div>
                </div>
                <div class="product-actions">
                    <button class="btn btn-add-cart" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> В корзину
                    </button>
                    <button class="btn-favorite ${isFavorite ? 'active' : ''}" data-product-id="${product.id}" title="${isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    },
    
    // Добавление товара в корзину
    addToCart: function(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Проверяем, есть ли уже товар в корзине
        const existingItemIndex = cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex !== -1) {
            // Увеличиваем количество
            cart[existingItemIndex].quantity += 1;
        } else {
            // Добавляем новый товар
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                quantity: 1
            });
        }
        
        // Сохраняем корзину
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Обновляем счетчик корзины
        App.updateCartCount();
        
        // Показываем уведомление
        App.showNotification(`${product.name} добавлен в корзину`, 'success');
        
        // Анимация кнопки
        const addButton = document.querySelector(`.btn-add-cart[data-product-id="${productId}"]`);
        if (addButton) {
            addButton.innerHTML = '<i class="fas fa-check"></i> Добавлено';
            addButton.classList.add('btn-primary');
            addButton.classList.remove('btn-add-cart');
            
            setTimeout(() => {
                addButton.innerHTML = '<i class="fas fa-shopping-cart"></i> В корзину';
                addButton.classList.remove('btn-primary');
                addButton.classList.add('btn-add-cart');
            }, 2000);
        }
    },
    
    // Переключение избранного
    toggleFavorite: function(productId, button) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        if (favorites.includes(productId)) {
            // Удаляем из избранного
            favorites = favorites.filter(id => id !== productId);
            button.classList.remove('active');
            button.title = 'Добавить в избранное';
            App.showNotification('Товар удален из избранного', 'info');
        } else {
            // Добавляем в избранное
            favorites.push(productId);
            button.classList.add('active');
            button.title = 'Удалить из избранного';
            App.showNotification('Товар добавлен в избранное', 'success');
        }
        
        // Сохраняем избранное
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Обновляем статистику в личном кабинете
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateUserStats();
        }
    },
    
    // Удаление из избранного
    removeFromFavorites: function(productId) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites = favorites.filter(id => id !== productId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // Обновляем отображение избранного
        if (typeof Dashboard !== 'undefined' && typeof Dashboard.displayFavorites === 'function') {
            Dashboard.displayFavorites();
        }
        
        // Обновляем статистику
        if (typeof Dashboard !== 'undefined') {
            Dashboard.updateUserStats();
        }
        
        App.showNotification('Товар удален из избранного', 'info');
    },
    
    // Получение товара по ID
    getProductById: function(productId) {
        return this.products.find(product => product.id === productId);
    },
    
    // Получение категории на русском
    getCategoryName: function(category) {
        const categories = {
            'rings': 'Кольца',
            'earrings': 'Серьги',
            'necklaces': 'Колье',
            'bracelets': 'Браслеты',
            'sets': 'Комплекты'
        };
        
        return categories[category] || category;
    }
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    Products.init();
});

// Глобальный доступ для отладки
window.Products = Products;