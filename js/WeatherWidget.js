import UIComponent from './UIComponent.js';

/**
 * Виджет погоды (упрощенная версия без API для тестирования)
 */
export default class WeatherWidget extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            title: config.title || 'Погода',
            type: 'weather'
        });
        
        this.city = config.city || 'Москва';
        this.weatherData = config.weatherData || this.getDemoWeather();
        this.lastUpdate = new Date();
        
        this.renderContent();
        
        // Автообновление каждые 5 минут
        this.updateInterval = setInterval(() => this.updateWeather(), 5 * 60 * 1000);
    }
    
    /**
     * Получение демо-данных о погоде
     */
    getDemoWeather() {
        const conditions = ['ясно', 'облачно', 'дождь', 'снег', 'туман'];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        
        return {
            main: {
                temp: Math.floor(Math.random() * 30) - 5, // от -5 до 25 градусов
                feels_like: Math.floor(Math.random() * 30) - 5,
                humidity: Math.floor(Math.random() * 60) + 30 // 30-90%
            },
            weather: [{
                description: randomCondition,
                icon: this.getConditionIcon(randomCondition)
            }],
            wind: {
                speed: (Math.random() * 10).toFixed(1)
            }
        };
    }
    
    /**
     * Получение иконки для погодных условий
     */
    getConditionIcon(condition) {
        const iconMap = {
            'ясно': '01d',
            'облачно': '03d',
            'дождь': '09d',
            'снег': '13d',
            'туман': '50d'
        };
        return iconMap[condition] || '01d';
    }
    
    /**
     * Рендеринг содержимого виджета
     */
    renderContent() {
        const temp = this.weatherData.main.temp;
        const feelsLike = this.weatherData.main.feels_like;
        const description = this.weatherData.weather[0].description;
        const humidity = this.weatherData.main.humidity;
        const windSpeed = this.weatherData.wind.speed;
        const icon = this.getWeatherIcon(this.weatherData.weather[0].icon);
        
        const contentHTML = `
            <div class="weather-container">
                <div class="weather-header">
                    <div class="city-selector">
                        <input type="text" 
                               class="city-input" 
                               value="${this.city}" 
                               placeholder="Введите город">
                        <button class="city-search-btn">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div class="last-update">
                        <i class="far fa-clock"></i>
                        ${this.formatTime(this.lastUpdate)}
                    </div>
                </div>
                
                <div class="weather-main">
                    <div class="weather-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="weather-temp">
                        <span class="temp-value">${Math.round(temp)}</span>
                        <span class="temp-unit">°C</span>
                    </div>
                    <div class="weather-desc">
                        ${description}
                    </div>
                </div>
                
                <div class="weather-details">
                    <div class="detail-item">
                        <i class="fas fa-temperature-low"></i>
                        <span class="detail-label">Ощущается:</span>
                        <span class="detail-value">${Math.round(feelsLike)}°C</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-tint"></i>
                        <span class="detail-label">Влажность:</span>
                        <span class="detail-value">${humidity}%</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-wind"></i>
                        <span class="detail-label">Ветер:</span>
                        <span class="detail-value">${windSpeed} м/с</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span class="detail-label">Город:</span>
                        <span class="detail-value">${this.city}</span>
                    </div>
                </div>
                
                <div class="weather-controls">
                    <button class="weather-btn refresh-weather">
                        <i class="fas fa-sync-alt"></i> Обновить
                    </button>
                    <button class="weather-btn change-unit">
                        <i class="fas fa-thermometer-half"></i> Демо-данные
                    </button>
                </div>
            </div>
        `;
        
        this.updateContent(contentHTML);
        this.bindWeatherEvents();
    }
    
    /**
     * Получение иконки погоды
     */
    getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': 'fas fa-sun',
            '01n': 'fas fa-moon',
            '02d': 'fas fa-cloud-sun',
            '02n': 'fas fa-cloud-moon',
            '03d': 'fas fa-cloud',
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-cloud',
            '04n': 'fas fa-cloud',
            '09d': 'fas fa-cloud-rain',
            '09n': 'fas fa-cloud-rain',
            '10d': 'fas fa-cloud-sun-rain',
            '10n': 'fas fa-cloud-moon-rain',
            '11d': 'fas fa-bolt',
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake',
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog',
            '50n': 'fas fa-smog'
        };
        
        return iconMap[iconCode] || 'fas fa-cloud';
    }
    
    /**
     * Привязка событий для виджета погоды
     */
    bindWeatherEvents() {
        // Обновление погоды
        const refreshBtn = this.contentElement.querySelector('.refresh-weather');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.updateWeather());
        }
        
        // Поиск города
        const searchBtn = this.contentElement.querySelector('.city-search-btn');
        const cityInput = this.contentElement.querySelector('.city-input');
        
        const searchCity = () => {
            const newCity = cityInput.value.trim();
            if (newCity && newCity !== this.city) {
                this.city = newCity;
                this.updateWeather();
            }
        };
        
        if (searchBtn) {
            searchBtn.addEventListener('click', searchCity);
        }
        
        if (cityInput) {
            cityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') searchCity();
            });
        }
        
        // Кнопка демо-данных
        const demoBtn = this.contentElement.querySelector('.change-unit');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => {
                this.updateWeather();
                alert(`Погода для ${this.city} обновлена (демо-данные)`);
            });
        }
    }
    
    /**
     * Обновление данных о погоде
     */
    updateWeather() {
        this.weatherData = this.getDemoWeather();
        this.lastUpdate = new Date();
        
        // Обновляем заголовок с температурой
        const temp = Math.round(this.weatherData.main.temp);
        this.setTitle(`Погода: ${this.city} (${temp}°C)`);
        
        this.renderContent();
    }
    
    /**
     * Форматирование времени
     */
    formatTime(date) {
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    /**
     * Получение текущего состояния
     */
    getState() {
        return {
            ...super.getState(),
            city: this.city,
            weatherData: this.weatherData,
            lastUpdate: this.lastUpdate
        };
    }
    
    /**
     * Уничтожение виджета с очисткой интервала
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        super.destroy();
    }
}