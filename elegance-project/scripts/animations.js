// Animations module
const Animations = {
    // Инициализация
    init: function() {
        this.setupFloatingAnimations();
        this.setupScrollAnimations();
        this.setupHoverEffects();
    },
    
    // Настройка плавающих анимаций
    setupFloatingAnimations: function() {
        const floatingElements = document.querySelectorAll('.floating-ring, .floating-earrings, .floating-necklace');
        
        floatingElements.forEach((element, index) => {
            const duration = 3 + Math.random() * 2;
            const delay = index * 0.5;
            
            element.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
        });
    },
    
    // Настройка анимаций при прокрутке
    setupScrollAnimations: function() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);
        
        // Наблюдаем за элементами с анимацией при прокрутке
        document.querySelectorAll('.feature-card, .product-card, .store-card').forEach(element => {
            element.classList.add('stagger-item');
            observer.observe(element);
        });
    },
    
    // Настройка эффектов при наведении
    setupHoverEffects: function() {
        // Добавляем эффект ripple для кнопок
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn')) {
                const button = e.target.closest('.btn');
                this.createRippleEffect(button, e);
            }
        }.bind(this));
    },
    
    // Создание эффекта ripple
    createRippleEffect: function(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    },
    
    // Показ элемента с анимацией
    showWithAnimation: function(element, animationClass = 'fade-in') {
        element.classList.add(animationClass);
        element.style.display = '';
        
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, 1000);
    },
    
    // Скрытие элемента с анимацией
    hideWithAnimation: function(element, animationClass = 'fade-out', callback) {
        element.classList.add(animationClass);
        
        setTimeout(() => {
            element.style.display = 'none';
            element.classList.remove(animationClass);
            if (callback) callback();
        }, 500);
    }
};

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    Animations.init();
});

// Глобальный доступ для отладки
window.Animations = Animations;