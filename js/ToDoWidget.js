import UIComponent from './UIComponent.js';

/**
 * Виджет списка задач системы
 */
export default class ToDoWidget extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            title: config.title || 'Задачи системы',
            type: 'todo'
        });
        
        this.tasks = config.tasks || [
            { id: 1, text: 'Проверить логи системы', completed: false },
            { id: 2, text: 'Обновить системные пакеты', completed: true },
            { id: 3, text: 'Провести резервное копирование', completed: false },
            { id: 4, text: 'Оптимизировать базу данных', completed: false }
        ];
        
        this.renderContent();
    }
    
    /**
     * Рендеринг содержимого виджета
     */
    renderContent() {
        const tasksHTML = this.tasks.map(task => `
            <div class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <label class="todo-checkbox">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
                <span class="todo-text">${task.text}</span>
                <button class="todo-delete" title="Удалить задачу">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
        
        const contentHTML = `
            <div class="todo-container">
                <div class="todo-stats">
                    <span class="stat">
                        <i class="fas fa-tasks"></i>
                        Всего: ${this.tasks.length}
                    </span>
                    <span class="stat">
                        <i class="fas fa-check-circle"></i>
                        Выполнено: ${this.tasks.filter(t => t.completed).length}
                    </span>
                </div>
                
                <div class="todo-input-group">
                    <input type="text" 
                           class="todo-input" 
                           placeholder="Добавить новую задачу..."
                           maxlength="100">
                    <button class="todo-add-btn">
                        <i class="fas fa-plus"></i> Добавить
                    </button>
                </div>
                
                <div class="todo-list">
                    ${this.tasks.length ? tasksHTML : '<p class="empty-tasks">Нет задач</p>'}
                </div>
                
                <div class="todo-actions">
                    <button class="action-btn clear-completed">
                        <i class="fas fa-broom"></i> Очистить выполненные
                    </button>
                    <button class="action-btn mark-all">
                        <i class="fas fa-check-double"></i> Отметить все
                    </button>
                </div>
            </div>
        `;
        
        this.updateContent(contentHTML);
        this.bindTodoEvents();
    }
    
    /**
     * Привязка событий для задач
     */
    bindTodoEvents() {
        // Добавление новой задачи
        const addBtn = this.contentElement.querySelector('.todo-add-btn');
        const input = this.contentElement.querySelector('.todo-input');
        
        const addTask = () => {
            const text = input.value.trim();
            if (text) {
                const newTask = {
                    id: Date.now(),
                    text: text,
                    completed: false
                };
                
                this.tasks.push(newTask);
                this.renderContent();
                input.value = '';
                this.saveToStorage();
            }
        };
        
        if (addBtn && input) {
            addBtn.addEventListener('click', addTask);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addTask();
            });
        }
        
        // Делегирование событий для списка задач
        if (this.contentElement) {
            this.contentElement.addEventListener('click', (e) => {
                const todoItem = e.target.closest('.todo-item');
                if (!todoItem) return;
                
                const taskId = parseInt(todoItem.dataset.id);
                
                // Удаление задачи
                if (e.target.closest('.todo-delete')) {
                    e.stopPropagation();
                    this.tasks = this.tasks.filter(task => task.id !== taskId);
                    this.renderContent();
                    this.saveToStorage();
                    return;
                }
                
                // Переключение состояния выполнения
                if (e.target.closest('.todo-checkbox') || e.target.closest('.todo-text')) {
                    const task = this.tasks.find(t => t.id === taskId);
                    if (task) {
                        task.completed = !task.completed;
                        todoItem.classList.toggle('completed');
                        const checkbox = todoItem.querySelector('input[type="checkbox"]');
                        checkbox.checked = task.completed;
                        this.saveToStorage();
                    }
                }
            });
        }
        
        // Кнопки действий
        const clearBtn = this.contentElement.querySelector('.clear-completed');
        const markAllBtn = this.contentElement.querySelector('.mark-all');
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.tasks = this.tasks.filter(task => !task.completed);
                this.renderContent();
                this.saveToStorage();
            });
        }
        
        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => {
                const allCompleted = this.tasks.every(task => task.completed);
                this.tasks.forEach(task => {
                    task.completed = !allCompleted;
                });
                this.renderContent();
                this.saveToStorage();
            });
        }
    }
    
    /**
     * Сохранение задач в localStorage
     */
    saveToStorage() {
        try {
            const widgetData = JSON.parse(localStorage.getItem('widgetData') || '{}');
            widgetData[this.id] = {
                tasks: this.tasks,
                type: this.type
            };
            localStorage.setItem('widgetData', JSON.stringify(widgetData));
        } catch (error) {
            console.error('Ошибка сохранения задач:', error);
        }
    }
    
    /**
     * Получение текущего состояния
     */
    getState() {
        return {
            ...super.getState(),
            tasks: this.tasks
        };
    }
}