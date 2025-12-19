// Импорты
import ToDoWidget from './ToDoWidget.js';
import QuoteWidget from './QuoteWidget.js';
import SystemMonitorWidget from './SystemMonitorWidget.js';

/**
 * Класс для управления панелью виджетов
 */
export default class Dashboard {
    constructor(containerId = 'dashboard') {
        console.log('Инициализация Dashboard');
        this.container = document.getElementById(containerId);
        this.widgets = new Map();
        this.nextPosition = { x: 20, y: 20 };
        this.widgetSpacing = 20;
        
        if (!this.container) {
            console.error(`Контейнер с ID "${containerId}" не найден!`);
            return;
        }
        
        console.log('Контейнер найден:', this.container);
        this.createEmptyState();
        this.loadFromStorage();
        this.updateWidgetCount();
    }
    
    /**
     * Создание состояния пустой панели
     */
    createEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-th-large fa-3x"></i>
            <h3>Панель управления пуста</h3>
            <p>Добавьте виджеты с помощью панели слева</p>
        `;
        this.container.appendChild(emptyState);
    }
    
    /**
     * Добавление виджета
     */
    addWidget(widgetType, config = {}) {
        console.log(`Попытка добавить виджет типа: ${widgetType}`);
        
        let widget;
        
        // Используем предоставленную позицию или получаем следующую
        const position = config.position || this.getNextPosition();
        
        try {
            switch (widgetType) {
                case 'todo':
                    widget = new ToDoWidget({
                        ...config,
                        title: config.title || 'Задачи системы',
                        position: position,
                        order: this.widgets.size
                    });
                    break;
                    
                case 'quote':
                    widget = new QuoteWidget({
                        ...config,
                        title: config.title || 'Цитата дня',
                        position: position,
                        order: this.widgets.size
                    });
                    break;
                    
                case 'weather':
                    widget = new WeatherWidget({
                        ...config,
                        title: config.title || 'Погода',
                        position: position,
                        order: this.widgets.size
                    });
                    break;
                    
                case 'system':
                    widget = new SystemMonitorWidget({
                        ...config,
                        title: config.title || 'Мониторинг системы',
                        position: position,
                        order: this.widgets.size
                    });
                    break;
                    
                default:
                    console.error(`Неизвестный тип виджета: ${widgetType}`);
                    return null;
            }
        } catch (error) {
            console.error(`Ошибка создания виджета ${widgetType}:`, error);
            return null;
        }
        
        // Добавляем в коллекцию
        this.widgets.set(widget.id, widget);
        
        // Добавляем в DOM
        const widgetElement = widget.render();
        if (widgetElement) {
            this.container.appendChild(widgetElement);
        } else {
            console.error('Не удалось получить элемент виджета');
            this.widgets.delete(widget.id);
            return null;
        }
        
        // Убираем состояние пустой панели
        this.hideEmptyState();
        
        // Сохраняем в localStorage
        this.saveToStorage();
        
        // Обновляем счетчик
        this.updateWidgetCount();
        
        // Настраиваем обработчик уничтожения
        widget.onDestroy = () => {
            this.removeWidget(widget.id);
        };
        
        console.log(`Добавлен виджет: ${widgetType} (ID: ${widget.id})`);
        return widget;
    }
    
    /**
     * Получение следующей позиции для виджета
     */
    getNextPosition() {
        const widgetWidth = 300;
        const widgetHeight = 200;
        const dashboardWidth = this.container.offsetWidth;
        
        // Пытаемся найти свободное место
        let x = this.nextPosition.x;
        let y = this.nextPosition.y;
        let attempts = 0;
        const maxAttempts = 50;
        
        // Проверяем, не пересекается ли позиция с существующими виджетами
        while (this.isPositionOccupied(x, y, widgetWidth, widgetHeight) && attempts < maxAttempts) {
            x += widgetWidth + this.widgetSpacing;
            
            // Если не помещается в строку - переносим
            if (x + widgetWidth > dashboardWidth) {
                x = 20;
                y += widgetHeight + this.widgetSpacing;
            }
            
            attempts++;
        }
        
        // Сохраняем позицию для следующего виджета
        this.nextPosition = {
            x: x + widgetWidth + this.widgetSpacing,
            y: y
        };
        
        // Если вышли за пределы - сбрасываем
        if (this.nextPosition.x + widgetWidth > dashboardWidth) {
            this.nextPosition.x = 20;
            this.nextPosition.y += widgetHeight + this.widgetSpacing;
        }
        
        return { x, y };
    }
    
    /**
     * Проверка, занята ли позиция
     */
    isPositionOccupied(x, y, width, height) {
        for (const widget of this.widgets.values()) {
            const wx = widget.position.x;
            const wy = widget.position.y;
            const wWidth = 300;
            const wHeight = 200;
            
            // Проверка пересечения прямоугольников
            if (x < wx + wWidth &&
                x + width > wx &&
                y < wy + wHeight &&
                y + height > wy) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Удаление виджета
     */
    removeWidget(widgetId) {
        const widget = this.widgets.get(widgetId);
        
        if (widget) {
            console.log('Удаление виджета:', widgetId, widget);
            
            // Проверяем, активен ли виджет
            if (!widget.isActive) {
                console.log('Виджет уже неактивен:', widgetId);
                this.widgets.delete(widgetId);
                this.updateWidgetCount();
                return;
            }
            
            // Уничтожаем виджет
            widget.destroy();
            
            // Удаляем из коллекции
            this.widgets.delete(widgetId);
            
            // Сохраняем в localStorage
            this.saveToStorage();
            
            // Обновляем счетчик
            this.updateWidgetCount();
            
            // Показываем состояние пустой панели если виджетов нет
            if (this.widgets.size === 0) {
                this.showEmptyState();
            }
            
            console.log(`Удален виджет: ${widgetId}`);
        } else {
            console.log('Виджет не найден в коллекции:', widgetId);
        }
    }
    
    /**
     * Очистка всех виджетов
     */
    clearAllWidgets() {
        console.log('Очистка всех виджетов, количество:', this.widgets.size);
        
        // Создаем копию массива ID, чтобы избежать проблем с итерацией
        const widgetIds = Array.from(this.widgets.keys());
        
        widgetIds.forEach(widgetId => {
            this.removeWidget(widgetId);
        });
        
        // Очищаем localStorage
        localStorage.removeItem('dashboardState');
        localStorage.removeItem('widgetPositions');
        localStorage.removeItem('widgetData');
        
        this.showEmptyState();
        this.updateWidgetCount();
    }
    
    /**
     * Сброс расположения виджетов
     */
    resetLayout() {
        const widgetWidth = 300;
        const widgetHeight = 200;
        const dashboardWidth = this.container.offsetWidth;
        const maxWidgetsPerRow = Math.floor((dashboardWidth - 20) / (widgetWidth + 20));
        
        let x = 20;
        let y = 20;
        let row = 0;
        let col = 0;
        
        // Создаем массив виджетов для сортировки
        const widgetArray = Array.from(this.widgets.values());
        
        // Располагаем виджеты в сетку
        widgetArray.forEach((widget, index) => {
            // Рассчитываем позицию
            x = 20 + col * (widgetWidth + 20);
            y = 20 + row * (widgetHeight + 20);
            
            // Обновляем позицию виджета
            widget.position = { x, y };
            
            // Применяем новую позицию
            const element = document.getElementById(widget.id);
            if (element) {
                element.style.left = `${x}px`;
                element.style.top = `${y}px`;
            }
            
            // Переходим к следующей колонке
            col++;
            
            // Если строка заполнена - переходим на следующую
            if (col >= maxWidgetsPerRow) {
                col = 0;
                row++;
            }
        });
        
        // Сохраняем позиции
        this.savePositionsToStorage();
        
        // Сбрасываем позицию для новых виджетов
        this.nextPosition = { x: 20, y: 20 };
    }
    
    /**
     * Сохранение позиций в localStorage
     */
    savePositionsToStorage() {
        const positions = {};
        this.widgets.forEach(widget => {
            positions[widget.id] = widget.position;
        });
        localStorage.setItem('widgetPositions', JSON.stringify(positions));
    }
    
    /**
     * Сохранение состояния панели
     */
    saveToStorage() {
        try {
            const state = {
                widgets: [],
                nextPosition: this.nextPosition
            };
            
            this.widgets.forEach(widget => {
                state.widgets.push(widget.getState());
            });
            
            localStorage.setItem('dashboardState', JSON.stringify(state));
            console.log('Состояние сохранено в localStorage');
        } catch (error) {
            console.error('Ошибка сохранения в localStorage:', error);
        }
    }
    
    /**
     * Загрузка состояния из localStorage
     */
    loadFromStorage() {
        try {
            const savedState = localStorage.getItem('dashboardState');
            
            if (savedState) {
                const state = JSON.parse(savedState);
                
                // Восстанавливаем виджеты
                state.widgets.forEach(widgetState => {
                    this.addWidget(widgetState.type, {
                        ...widgetState,
                        position: widgetState.position
                    });
                });
                
                // Восстанавливаем позицию для новых виджетов
                if (state.nextPosition) {
                    this.nextPosition = state.nextPosition;
                }
                
                console.log(`Загружено ${state.widgets.length} виджетов из сохранения`);
            }
        } catch (error) {
            console.error('Ошибка загрузки из localStorage:', error);
        }
    }
    
    /**
     * Обновление счетчика виджетов
     */
    updateWidgetCount() {
        const countElement = document.getElementById('widget-count');
        const activeElement = document.getElementById('active-widgets');
        
        if (countElement) {
            countElement.textContent = this.widgets.size;
        }
        
        if (activeElement) {
            if (this.widgets.size === 0) {
                activeElement.textContent = 'Нет активных виджетов';
            } else {
                activeElement.textContent = `Активных виджетов: ${this.widgets.size}`;
            }
        }
    }
    
    /**
     * Показать уведомление
     */
    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Добавляем в DOM
        document.body.appendChild(notification);
        
        // Удаляем через 3 секунды
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    /**
     * Скрыть состояние пустой панели
     */
    hideEmptyState() {
        const emptyState = this.container.querySelector('.empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }
    
    /**
     * Показать состояние пустой панели
     */
    showEmptyState() {
        const emptyState = this.container.querySelector('.empty-state');
        if (emptyState) {
            emptyState.style.display = 'flex';
        }
    }
    
    /**
     * Получение статистики по виджетам
     */
    getStats() {
        const stats = {
            total: this.widgets.size,
            byType: {},
            memoryUsage: this.calculateMemoryUsage()
        };
        
        this.widgets.forEach(widget => {
            stats.byType[widget.type] = (stats.byType[widget.type] || 0) + 1;
        });
        
        return stats;
    }
    
    /**
     * Расчет использования памяти
     */
    calculateMemoryUsage() {
        let estimatedMemory = 0;
        this.widgets.forEach(widget => {
            estimatedMemory += 1024;
            if (widget.type === 'todo' && widget.tasks) {
                estimatedMemory += widget.tasks.length * 256;
            }
        });
        
        return `${(estimatedMemory / 1024).toFixed(2)} KB`;
    }
}
