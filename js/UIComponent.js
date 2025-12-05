/**
 * Базовый класс для всех UI-компонентов (виджетов)
 */
export default class UIComponent {
    constructor(config = {}) {
        this.id = config.id || `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.title = config.title || 'Без названия';
        this.type = config.type || 'base';
        this.isMinimized = false;
        this.isActive = true;
        this.order = config.order || 0;
        
        // DOM элементы
        this.element = null;
        this.headerElement = null;
        this.contentElement = null;
        
        // Конфигурация позиционирования
        this.position = config.position || this.getInitialPosition();
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        this.init();
    }
    
    /**
     * Получение начальной позиции
     */
    getInitialPosition() {
        // Случайная позиция в пределах панели
        const dashboard = document.getElementById('dashboard');
        if (dashboard) {
            const rect = dashboard.getBoundingClientRect();
            const maxX = Math.max(0, rect.width - 320); // ширина виджета + отступ
            const maxY = Math.max(0, rect.height - 250); // высота виджета + отступ
            
            return {
                x: Math.floor(Math.random() * maxX) + 20,
                y: Math.floor(Math.random() * maxY) + 20
            };
        }
        return { x: 20, y: 20 };
    }
    
    /**
     * Инициализация компонента
     */
    init() {
        this.createElement();
        this.bindEvents();
    }
    
    /**
     * Создание DOM-элемента виджета
     */
    createElement() {
        this.element = document.createElement('div');
        this.element.className = `widget widget-${this.type}`;
        this.element.id = this.id;
        this.element.dataset.type = this.type;
        
        // Устанавливаем начальную позицию
        this.applyPosition();
        
        // Заголовок виджета
        this.headerElement = document.createElement('div');
        this.headerElement.className = 'widget-header';
        this.headerElement.innerHTML = `
            <div class="widget-title">
                <i class="widget-icon ${this.getIcon()}"></i>
                <h3>${this.title}</h3>
            </div>
            <div class="widget-controls">
                <button class="widget-btn minimize-btn" title="Свернуть">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="widget-btn close-btn" title="Закрыть">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Контент виджета
        this.contentElement = document.createElement('div');
        this.contentElement.className = 'widget-content';
        
        // Собираем виджет
        this.element.appendChild(this.headerElement);
        this.element.appendChild(this.contentElement);
    }
    
    /**
     * Применение позиции к элементу
     */
    applyPosition() {
        if (this.element && this.position) {
            this.element.style.position = 'absolute';
            this.element.style.left = `${this.position.x}px`;
            this.element.style.top = `${this.position.y}px`;
            this.element.style.zIndex = '10';
        }
    }
    
    /**
     * Получение иконки для типа виджета
     */
    getIcon() {
        const icons = {
            'todo': 'fas fa-tasks',
            'quote': 'fas fa-quote-right',
            'weather': 'fas fa-cloud-sun',
            'system': 'fas fa-desktop'
        };
        return icons[this.type] || 'fas fa-cube';
    }
    
    /**
     * Привязка событий
     */
    bindEvents() {
        // Сохраняем ссылки на функции для удаления событий
        this.handleMinimize = (e) => {
            e.stopPropagation();
            this.toggleMinimize();
        };
        
        this.handleClose = (e) => {
            e.stopPropagation();
            this.destroy();
        };
        
        this.handleStartDrag = this.startDrag.bind(this);
        this.handleDrag = this.drag.bind(this);
        this.handleStopDrag = this.stopDrag.bind(this);
        
        // Сворачивание/разворачивание
        const minimizeBtn = this.headerElement.querySelector('.minimize-btn');
        const closeBtn = this.headerElement.querySelector('.close-btn');
        
        minimizeBtn.addEventListener('click', this.handleMinimize);
        closeBtn.addEventListener('click', this.handleClose);
        
        // Перетаскивание
        this.headerElement.addEventListener('mousedown', this.handleStartDrag);
        document.addEventListener('mousemove', this.handleDrag);
        document.addEventListener('mouseup', this.handleStopDrag);
        
        // Клик по заголовку для сворачивания
        this.headerElement.addEventListener('click', (e) => {
            if (!e.target.closest('.widget-controls')) {
                this.toggleMinimize();
            }
        });
    }
    
    /**
     * Начало перетаскивания
     */
    startDrag(e) {
        if (e.target.closest('.widget-btn')) return;
        
        this.isDragging = true;
        const rect = this.element.getBoundingClientRect();
        const dashboard = document.getElementById('dashboard');
        const dashboardRect = dashboard.getBoundingClientRect();
        
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        this.element.style.zIndex = '1000';
        this.element.classList.add('dragging');
        
        e.preventDefault();
    }
    
    /**
     * Процесс перетаскивания
     */
    drag(e) {
        if (!this.isDragging) return;
        
        const dashboard = document.getElementById('dashboard');
        const dashboardRect = dashboard.getBoundingClientRect();
        
        // Рассчитываем новую позицию
        let x = e.clientX - dashboardRect.left - this.dragOffset.x;
        let y = e.clientY - dashboardRect.top - this.dragOffset.y;
        
        // Ограничение перемещения внутри dashboard
        const widgetWidth = this.element.offsetWidth;
        const widgetHeight = this.element.offsetHeight;
        
        x = Math.max(0, Math.min(x, dashboardRect.width - widgetWidth));
        y = Math.max(0, Math.min(y, dashboardRect.height - widgetHeight));
        
        // Применяем позицию
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        
        // Сохраняем позицию
        this.position = { x, y };
    }
    
    /**
     * Остановка перетаскивания
     */
    stopDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.element.style.zIndex = '10';
        this.element.classList.remove('dragging');
        
        // Сохраняем позицию в localStorage
        this.savePosition();
    }
    
    /**
     * Сохранение позиции в localStorage
     */
    savePosition() {
        try {
            const positions = JSON.parse(localStorage.getItem('widgetPositions') || '{}');
            positions[this.id] = this.position;
            localStorage.setItem('widgetPositions', JSON.stringify(positions));
        } catch (e) {
            console.error('Ошибка сохранения позиции:', e);
        }
    }
    
    /**
     * Загрузка позиции из localStorage
     */
    loadPosition() {
        try {
            const positions = JSON.parse(localStorage.getItem('widgetPositions') || '{}');
            if (positions[this.id]) {
                this.position = positions[this.id];
                this.applyPosition();
            }
        } catch (e) {
            console.error('Ошибка загрузки позиции:', e);
        }
    }
    
    /**
     * Сворачивание/разворачивание виджета
     */
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        
        if (this.isMinimized) {
            this.contentElement.style.display = 'none';
            this.headerElement.querySelector('.minimize-btn i').className = 'fas fa-plus';
        } else {
            this.contentElement.style.display = 'block';
            this.headerElement.querySelector('.minimize-btn i').className = 'fas fa-minus';
        }
        
        this.element.classList.toggle('minimized');
    }
    
    /**
     * Рендеринг виджета
     */
    render() {
        // Загружаем сохраненную позицию
        setTimeout(() => this.loadPosition(), 0);
        return this.element;
    }
    
    /**
     * Обновление содержимого виджета
     */
    updateContent(content) {
        this.contentElement.innerHTML = content;
    }
    
    /**
     * Установка нового заголовка
     */
    setTitle(newTitle) {
        this.title = newTitle;
        const titleElement = this.headerElement.querySelector('h3');
        if (titleElement) {
            titleElement.textContent = newTitle;
        }
    }
    
    /**
     * Получение текущего состояния
     */
    getState() {
        return {
            id: this.id,
            type: this.type,
            title: this.title,
            position: this.position,
            isMinimized: this.isMinimized
        };
    }
    
    /**
     * Уничтожение виджета
     */
    destroy() {
        console.log('Уничтожение виджета:', this.id);
        
        // 1. Устанавливаем флаг неактивности
        this.isActive = false;
        
        // 2. Удаляем обработчики событий
        const minimizeBtn = this.headerElement?.querySelector('.minimize-btn');
        const closeBtn = this.headerElement?.querySelector('.close-btn');
        
        if (minimizeBtn && this.handleMinimize) {
            minimizeBtn.removeEventListener('click', this.handleMinimize);
        }
        
        if (closeBtn && this.handleClose) {
            closeBtn.removeEventListener('click', this.handleClose);
        }
        
        if (this.headerElement && this.handleStartDrag) {
            this.headerElement.removeEventListener('mousedown', this.handleStartDrag);
        }
        
        if (this.handleDrag) {
            document.removeEventListener('mousemove', this.handleDrag);
        }
        
        if (this.handleStopDrag) {
            document.removeEventListener('mouseup', this.handleStopDrag);
        }
        
        // 3. Удаляем из DOM
        if (this.element && this.element.parentNode) {
            console.log('Удаление элемента из DOM:', this.id);
            this.element.parentNode.removeChild(this.element);
            this.element = null;
        }
        
        // 4. Очищаем данные из localStorage
        try {
            const positions = JSON.parse(localStorage.getItem('widgetPositions') || '{}');
            delete positions[this.id];
            localStorage.setItem('widgetPositions', JSON.stringify(positions));
            
            const widgetData = JSON.parse(localStorage.getItem('widgetData') || '{}');
            delete widgetData[this.id];
            localStorage.setItem('widgetData', JSON.stringify(widgetData));
        } catch (e) {
            console.error('Ошибка очистки localStorage:', e);
        }
        
        // 5. Вызываем callback
        if (typeof this.onDestroy === 'function') {
            console.log('Вызов onDestroy для виджета:', this.id);
            this.onDestroy();
        }
        
        // 6. Очищаем все ссылки
        this.headerElement = null;
        this.contentElement = null;
        
        console.log('Виджет уничтожен:', this.id);
    }
}