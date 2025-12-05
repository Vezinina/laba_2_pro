// Главный модуль приложения
class SystemMonitorApp {
    constructor() {
        this.dashboard = null;
        this.startTime = new Date();
        this.uptimeInterval = null;
        
        this.init();
    }
    
    /**
     * Инициализация приложения
     */
    async init() {
        console.log('Инициализация приложения System Monitor...');
        
        try {
            // Динамически импортируем Dashboard
            const { default: Dashboard } = await import('./Dashboard.js');
            
            // Инициализируем панель
            this.dashboard = new Dashboard('dashboard');
            
            // Привязываем события
            this.bindEvents();
            
            // Запускаем таймер времени работы
            this.startUptimeTimer();
            
            // Обновляем статус системы
            this.updateSystemStatus();
            
            console.log('Приложение инициализировано');
        } catch (error) {
            console.error('Ошибка инициализации приложения:', error);
        }
    }
    
    /**
     * Привязка всех событий
     */
    bindEvents() {
        // Кнопки добавления виджетов
        document.getElementById('add-todo').addEventListener('click', () => {
            if (this.dashboard) {
                this.dashboard.addWidget('todo');
                this.showNotification('Виджет задач добавлен', 'success');
            }
        });
        
        document.getElementById('add-quote').addEventListener('click', () => {
            if (this.dashboard) {
                this.dashboard.addWidget('quote');
                this.showNotification('Виджет цитат добавлен', 'success');
            }
        });
        
        document.getElementById('add-weather').addEventListener('click', () => {
            if (this.dashboard) {
                this.dashboard.addWidget('weather');
                this.showNotification('Виджет погоды добавлен', 'success');
            }
        });
        
        document.getElementById('add-system').addEventListener('click', () => {
            if (this.dashboard) {
                this.dashboard.addWidget('system');
                this.showNotification('Виджет мониторинга добавлен', 'success');
            }
        });
        
        // Управление панелью
        document.getElementById('reset-layout').addEventListener('click', () => {
            if (this.dashboard) {
                this.dashboard.resetLayout();
                this.showNotification('Расположение виджетов сброшено', 'info');
            }
        });
        
        document.getElementById('save-state').addEventListener('click', () => {
            if (this.dashboard) {
                this.dashboard.saveToStorage();
                this.showNotification('Состояние сохранено', 'success');
            }
        });
        
        document.getElementById('clear-all').addEventListener('click', () => {
            if (this.dashboard && confirm('Удалить все виджеты?')) {
                this.dashboard.clearAllWidgets();
                this.showNotification('Все виджеты удалены', 'warning');
            }
        });
        
        // Обновление времени
        setInterval(() => this.updateLastUpdateTime(), 1000);
    }
    
    /**
     * Запуск таймера времени работы
     */
    startUptimeTimer() {
        this.uptimeInterval = setInterval(() => {
            const now = new Date();
            const diff = now - this.startTime;
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            const uptimeElement = document.getElementById('uptime');
            if (uptimeElement) {
                uptimeElement.textContent = 
                    `${hours.toString().padStart(2, '0')}:` +
                    `${minutes.toString().padStart(2, '0')}:` +
                    `${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    /**
     * Обновление статуса системы
     */
    updateSystemStatus() {
        const statusElement = document.getElementById('system-status');
        if (statusElement) {
            // Имитация случайного изменения статуса
            const statuses = [
                { class: 'status-active', text: 'Система активна', icon: 'fa-circle' },
                { class: 'status-warning', text: 'Высокая нагрузка', icon: 'fa-exclamation-circle' },
                { class: 'status-ok', text: 'Работает стабильно', icon: 'fa-check-circle' }
            ];
            
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            statusElement.className = randomStatus.class;
            statusElement.innerHTML = `<i class="fas ${randomStatus.icon}"></i> ${randomStatus.text}`;
            
            // Обновляем каждые 30 секунд
            setTimeout(() => this.updateSystemStatus(), 30000);
        }
    }
    
    /**
     * Обновление времени последнего обновления
     */
    updateLastUpdateTime() {
        const updateElement = document.getElementById('last-update');
        if (updateElement) {
            const now = new Date();
            updateElement.textContent = 
                `Последнее обновление: ${now.toLocaleTimeString('ru-RU')}`;
        }
    }
    
    /**
     * Показать уведомление
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    /**
     * Получение статистики приложения
     */
    getAppStats() {
        if (!this.dashboard) return null;
        
        const dashboardStats = this.dashboard.getStats();
        const uptime = new Date() - this.startTime;
        
        return {
            ...dashboardStats,
            uptime: `${Math.floor(uptime / 1000)} секунд`,
            startTime: this.startTime.toLocaleString('ru-RU')
        };
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SystemMonitorApp();
    
    console.log('System Monitor App готов к работе!');
    console.log('Для отладки доступна команда: app.getAppStats()');
});