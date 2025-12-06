// Map module
const Map = {
    map: null,
    stores: [],
    userMarker: null,
    
    // Initialize map
    init: function() {
        this.loadStores();
        this.initMap();
        this.displayStoreCards();
        this.setupEventListeners();
    },
    
    // Load stores data
    loadStores: function() {
        this.stores = [
            {
                id: 1,
                name: 'Центральный магазин',
                address: 'Москва, ул. Примерная, 10',
                coordinates: [55.7558, 37.6173],
                phone: '+7 (999) 123-45-67',
                hours: '10:00 - 22:00',
                description: 'Наш флагманский магазин в центре Москвы'
            },
            {
                id: 2,
                name: 'Магазин на Арбате',
                address: 'Москва, ул. Арбат, 25',
                coordinates: [55.7495, 37.5907],
                phone: '+7 (999) 123-45-68',
                hours: '11:00 - 23:00',
                description: 'Магазин в историческом центре города'
            },
            {
                id: 3,
                name: 'ТЦ Авиапарк',
                address: 'Москва, Ходынский бульвар, 4',
                coordinates: [55.7897, 37.5355],
                phone: '+7 (999) 123-45-69',
                hours: '10:00 - 22:00',
                description: 'Магазин в крупнейшем торговом центре Москвы'
            },
            {
                id: 4,
                name: 'Санкт-Петербург',
                address: 'Санкт-Петербург, Невский пр., 45',
                coordinates: [59.9343, 30.3351],
                phone: '+7 (812) 123-45-67',
                hours: '10:00 - 21:00',
                description: 'Наш магазин в культурной столице России'
            }
        ];
    },
    
    // Initialize Leaflet map
    initMap: function() {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('Map element not found!');
            return;
        }
        
        try {
            // Check if Leaflet is loaded
            if (typeof L === 'undefined') {
                console.error('Leaflet library not loaded!');
                return;
            }
            
            // Initialize map centered on Moscow
            this.map = L.map('map', {
                zoomControl: true,
                scrollWheelZoom: true
            }).setView([55.7558, 37.6173], 10);
            
            // Add OpenStreetMap tiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19
            }).addTo(this.map);
            
            // Add markers for each store
            this.addStoreMarkers();
            
            // Add scale control
            L.control.scale().addTo(this.map);
            
            console.log('Map initialized successfully');
            
        } catch (error) {
            console.error('Error initializing map:', error);
            this.showMapError();
        }
    },
    
    // Add markers for stores
    addStoreMarkers: function() {
        if (!this.map) return;
        
        // Custom store icon
        const storeIcon = L.divIcon({
            className: 'store-marker',
            html: '<div class="store-marker-inner"><i class="fas fa-store"></i></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40]
        });
        
        // Add markers for each store
        this.stores.forEach(store => {
            const marker = L.marker(store.coordinates, { icon: storeIcon })
                .addTo(this.map)
                .bindPopup(this.createStorePopup(store));
            
            // Store marker reference
            marker.storeId = store.id;
            
            // Add click event to center map on marker
            marker.on('click', () => {
                this.centerOnStore(store.id);
            });
        });
    },
    
    // Create popup content for store
    createStorePopup: function(store) {
        return `
            <div class="store-popup">
                <h3>${store.name}</h3>
                <p><i class="fas fa-map-pin"></i> ${store.address}</p>
                <p><i class="fas fa-phone"></i> ${store.phone}</p>
                <p><i class="fas fa-clock"></i> ${store.hours}</p>
                <p class="store-popup-description">${store.description}</p>
            </div>
        `;
    },
    
    // Display store cards
    displayStoreCards: function() {
        const storeCardsContainer = document.getElementById('storeCards');
        if (!storeCardsContainer) return;
        
        storeCardsContainer.innerHTML = '';
        
        this.stores.forEach(store => {
            const card = this.createStoreCard(store);
            storeCardsContainer.appendChild(card);
        });
    },
    
    // Create store card element
    createStoreCard: function(store) {
        const card = document.createElement('div');
        card.className = 'store-card';
        card.dataset.storeId = store.id;
        
        card.innerHTML = `
            <div class="store-card-header">
                <h4>${store.name}</h4>
                <button class="btn btn-outline btn-sm" onclick="Map.centerOnStore(${store.id})">
                    <i class="fas fa-map-marker-alt"></i> Показать на карте
                </button>
            </div>
            <div class="store-card-body">
                <p><i class="fas fa-map-pin"></i> ${store.address}</p>
                <p><i class="fas fa-phone"></i> ${store.phone}</p>
                <p><i class="fas fa-clock"></i> ${store.hours}</p>
                <p class="store-description">${store.description}</p>
            </div>
        `;
        
        return card;
    },
    
    // Center map on specific store
    centerOnStore: function(storeId) {
        const store = this.stores.find(s => s.id === storeId);
        if (store && this.map) {
            this.map.setView(store.coordinates, 15);
            
            // Open popup for the store
            setTimeout(() => {
                this.map.eachLayer((layer) => {
                    if (layer instanceof L.Marker && layer.storeId === storeId) {
                        layer.openPopup();
                    }
                });
            }, 300);
        }
    },
    
    // Get user location
    getUserLocation: function() {
        if (!navigator.geolocation) {
            App.showNotification('Геолокация не поддерживается вашим браузером', 'error');
            return;
        }
        
        App.showNotification('Определяем ваше местоположение...', 'info');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                
                this.addUserMarker(userLat, userLng);
                this.centerOnUser(userLat, userLng);
                
                App.showNotification('Местоположение определено!', 'success');
            },
            (error) => {
                console.error('Geolocation error:', error);
                let message = 'Не удалось определить местоположение';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Доступ к геолокации запрещен';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Информация о местоположении недоступна';
                        break;
                    case error.TIMEOUT:
                        message = 'Время ожидания истекло';
                        break;
                }
                
                App.showNotification(message, 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    },
    
    // Add user marker to map
    addUserMarker: function(lat, lng) {
        if (!this.map) return;
        
        // Remove existing user marker
        if (this.userMarker) {
            this.map.removeLayer(this.userMarker);
        }
        
        // Custom user icon
        const userIcon = L.divIcon({
            className: 'user-marker-icon',
            html: '<div class="user-marker"><i class="fas fa-user"></i></div>',
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });
        
        // Add new user marker
        this.userMarker = L.marker([lat, lng], { icon: userIcon })
            .addTo(this.map)
            .bindPopup('Ваше местоположение')
            .openPopup();
    },
    
    // Center map on user location
    centerOnUser: function(lat, lng) {
        if (this.map) {
            this.map.setView([lat, lng], 13);
        }
    },
    
    // Setup event listeners
    setupEventListeners: function() {
        // Locate me button
        const locateMeBtn = document.getElementById('locateMe');
        if (locateMeBtn) {
            locateMeBtn.addEventListener('click', () => {
                this.getUserLocation();
            });
        }
    },
    
    // Show error message if map fails to load
    showMapError: function() {
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem; text-align: center;">
                    <i class="fas fa-map-marked-alt" style="font-size: 3rem; color: var(--pastel-lavender); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--primary-color); margin-bottom: 1rem;">Карта временно недоступна</h3>
                    <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Проверьте подключение к интернету и попробуйте обновить страницу</p>
                    <button class="btn btn-primary" onclick="Map.init()">
                        <i class="fas fa-sync-alt"></i> Попробовать снова
                    </button>
                </div>
            `;
        }
    }
};

// Add CSS for map markers
const mapMarkerCSS = `
.store-marker {
    background: white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    border: 3px solid var(--primary-color);
}

.store-marker-inner {
    color: var(--primary-color);
    font-size: 18px;
}

.user-marker-icon .user-marker {
    background: var(--accent-color);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    border: 3px solid white;
    color: white;
    font-size: 18px;
}

.store-popup {
    min-width: 200px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.store-popup h3 {
    color: var(--primary-color);
    margin: 0 0 10px 0;
    font-size: 16px;
}

.store-popup p {
    margin: 5px 0;
    font-size: 14px;
    display: flex;
    align-items: center;
}

.store-popup i {
    color: var(--primary-color);
    width: 16px;
    margin-right: 8px;
}

.store-popup-description {
    font-style: italic;
    color: #666;
    margin-top: 10px !important;
    padding-top: 10px;
    border-top: 1px solid #eee;
}
`;

// Add marker CSS to document
const markerStyleSheet = document.createElement('style');
markerStyleSheet.textContent = mapMarkerCSS;
document.head.appendChild(markerStyleSheet);

// Initialize map when stores section is shown
document.addEventListener('DOMContentLoaded', function() {
    const storesSection = document.getElementById('stores');
    if (storesSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        if (!Map.map) {
                            Map.init();
                        }
                    }, 300);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(storesSection);
    }
});

// Глобальный доступ для отладки
window.Map = Map;