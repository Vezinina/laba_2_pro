import UIComponent from './UIComponent.js';

/**
 * Виджет мониторинга системы
 */
export default class SystemMonitorWidget extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            title: config.title || 'Мониторинг системы',
            type: 'system'
        });
        
        this.systemData = {
            cpu: config.cpu || 25,
            memory: config.memory || 65,
            storage: config.storage || 45,
            network: config.network || 75,
            uptime: config.uptime || '12:34:56'
        };
        
        this.isMonitoring = true;
        this.updateInterval = null;
        
        this.renderContent();
        this.startMonitoring();
    }
    
    /**
     * Рендеринг содержимого виджета
     */
    renderContent() {
        const contentHTML = `
            <div class="system-container">
                <div class="system-stats">
                    <div class="system-stat">
                        <div class="stat-header">
                            <i class="fas fa-microchip"></i>
                            <span class="stat-title">CPU</span>
                            <span class="stat-value">${this.systemData.cpu}%</span>
                        </div>
                        <div class="stat-bar">
                            <div class="bar-fill cpu-fill" style="width: ${this.systemData.cpu}%"></div>
                        </div>
                    </div>
                    
                    <div class="system-stat">
                        <div class="stat-header">
                            <i class="fas fa-memory"></i>
                            <span class="stat-title">Память</span>
                            <span class="stat-value">${this.systemData.memory}%</span>
                        </div>
                        <div class="stat-bar">
                            <div class="bar-fill memory-fill" style="width: ${this.systemData.memory}%"></div>
                        </div>
                    </div>
                    
                    <div class="system-stat">
                        <div class="stat-header">
                            <i class="fas fa-hdd"></i>
                            <span class="stat-title">Хранилище</span>
                            <span class="stat-value">${this.systemData.storage}%</span>
                        </div>
                        <div class="stat-bar">
                            <div class="bar-fill storage-fill" style="width: ${this.systemData.storage}%"></div>
                        </div>
                    </div>
                    
                    <div class="system-stat">
                        <div class="stat-header">
                            <i class="fas fa-wifi"></i>
                            <span class="stat-title">Сеть</span>
                            <span class="stat-value">${this.systemData.network}%</span>
                        </div>
                        <div class="stat-bar">
                            <div class="bar-fill network-fill" style="width: ${this.systemData.network}%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="system-info">
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <span>Время работы:</span>
                        <strong>${this.systemData.uptime}</strong>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Дата:</span>
                        <strong>${new Date().toLocaleDateString('ru-RU')}</strong>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-user"></i>
                        <span>Пользователь:</span>
                        <strong>Система</strong>
                    </div>
                </div>
                
                <div class="system-controls">
                    <button class="system-btn ${this.isMonitoring ? 'monitoring-active' : ''}" id="toggle-monitoring">
                        <i class="fas fa-${this.isMonitoring ? 'pause' : 'play'}"></i>
                        ${this.isMonitoring ? 'Пауза' : 'Запуск'}
                    </button>
                    <button class="system-btn" id="refresh-system">
                        <i class="fas fa-sync-alt"></i> Обновить
                    </button>
                    <button class="system-btn" id="system-logs">
                        <i class="fas fa-file-alt"></i> Логи
                    </button>
                </div>
            </div>
        `;
        
        this.updateContent(contentHTML);
        this.bindSystemEvents();
    }
    
    /**
     * Привязка событий для виджета системы
     */
    bindSystemEvents() {
        // Переключение мониторинга
        const toggleBtn = this.contentElement.querySelector('#toggle-monitoring');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleMonitoring());
        }
        
        // Обновление данных
        const refreshBtn = this.contentElement.querySelector('#refresh-system');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.updateSystemData());
        }
        
        // Просмотр логов
        const logsBtn = this.contentElement.querySelector('#system-logs');
        if (logsBtn) {
            logsBtn.addEventListener('click', () => this.showLogs());
        }
    }
    
    /**
     * Запуск мониторинга
     */
    startMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(() => {
            if (this.isMonitoring) {
                this.updateSystemData();
            }
        }, 5000); // Обновление каждые 5 секунд
    }
    
    /**
     * Переключение мониторинга
     */
    toggleMonitoring() {
        this.isMonitoring = !this.isMonitoring;
        
        const toggleBtn = this.contentElement.querySelector('#toggle-monitoring');
        if (toggleBtn) {
            toggleBtn.innerHTML = `
                <i class="fas fa-${this.isMonitoring ? 'pause' : 'play'}"></i>
                ${this.isMonitoring ? 'Пауза' : 'Запуск'}
            `;
            toggleBtn.classList.toggle('monitoring-active', this.isMonitoring);
        }
        
        if (this.isMonitoring) {
            this.startMonitoring();
        }
    }
    
    /**
     * Обновление данных системы
     */
    updateSystemData() {
        // Имитация реальных данных системы
        this.systemData = {
            cpu: Math.min(100, Math.max(5, this.systemData.cpu + (Math.random() * 10 - 5))),
            memory: Math.min(100, Math.max(10, this.systemData.memory + (Math.random() * 5 - 2.5))),
            storage: Math.min(100, Math.max(30, this.systemData.storage + (Math.random() * 2 - 1))),
            network: Math.min(100, Math.max(20, this.systemData.network + (Math.random() * 20 - 10))),
            uptime: this.incrementUptime(this.systemData.uptime)
        };
        
        this.renderContent();
        this.saveToStorage();
    }
    
    /**
     * Увеличение времени работы
     */
    incrementUptime(uptime) {
        const parts = uptime.split(':').map(Number);
        let seconds = parts[0] * 3600 + parts[1] * 60 + parts[2] + 5;
        
        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);
        seconds %= 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Показать логи системы
     */
    showLogs() {
        const logs = [
            { time: '10:25:12', level: 'info', message: 'Система загружена' },
            { time: '10:25:15', level: 'info', message: 'Виджеты инициализированы' },
            { time: '10:26:30', level: 'warning', message: 'Загрузка CPU выше нормы' },
            { time: '10:27:45', level: 'info', message: 'Погода обновлена' },
            { time: '10:28:10', level: 'success', message: 'Все задачи выполнены' }
        ];
        
        const logsHTML = logs.map(log => `
            <div class="log-item log-${log.level}">
                <span class="log-time">[${log.time}]</span>
                <span class="log-level">${log.level.toUpperCase()}</span>
                <span class="log-message">${log.message}</span>
            </div>
        `).join('');
        
        alert(`Логи системы:\n\n${logs.map(l => `[${l.time}] ${l.level}: ${l.message}`).join('\n')}`);
    }
    
    /**
     * Сохранение в localStorage
     */
    saveToStorage() {
        try {
            const widgetData = JSON.parse(localStorage.getItem('widgetData') || '{}');
            widgetData[this.id] = {
                systemData: this.systemData,
                isMonitoring: this.isMonitoring,
                type: this.type
            };
            localStorage.setItem('widgetData', JSON.stringify(widgetData));
        } catch (error) {
            console.error('Ошибка сохранения данных системы:', error);
        }
    }
    
    /**
     * Получение текущего состояния
     */
    getState() {
        return {
            ...super.getState(),
            systemData: this.systemData,
            isMonitoring: this.isMonitoring
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