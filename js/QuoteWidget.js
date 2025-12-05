import UIComponent from './UIComponent.js';

/**
 * Виджет цитат дня (упрощенная версия с локальными цитатами)
 */
export default class QuoteWidget extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            title: config.title || 'Цитата дня',
            type: 'quote'
        });
        
        this.localQuotes = [
            { text: "Код — это поэзия логики.", author: "Анонимный программист" },
            { text: "Сложность убивает. Она высасывает жизнь из разработчиков.", author: "Рэй Оззи" },
            { text: "Преждевременная оптимизация — корень всех зол.", author: "Дональд Кнут" },
            { text: "Программирование — это искусство создавать решения для проблем, которых ещё нет.", author: "Грейс Хоппер" },
            { text: "Лучше один раз отладить, чем сто раз услышать 'Это не баг, это фича'.", author: "Народная мудрость" },
            { text: "Первый блин комом, первый код — баг.", author: "Пословица IT-шника" },
            { text: "Работает? Не трогай!", author: "Золотое правило программиста" }
        ];
        
        // Получаем случайную цитату
        const randomIndex = Math.floor(Math.random() * this.localQuotes.length);
        const randomQuote = this.localQuotes[randomIndex];
        this.currentQuote = config.quote || randomQuote.text;
        this.author = config.author || randomQuote.author;
        
        this.renderContent();
    }
    
    /**
     * Рендеринг содержимого виджета
     */
    renderContent() {
        const contentHTML = `
            <div class="quote-container">
                <div class="quote-content">
                    <div class="quote-text">
                        <i class="fas fa-quote-left"></i>
                        ${this.currentQuote}
                        <i class="fas fa-quote-right"></i>
                    </div>
                    <div class="quote-author">
                        — ${this.author}
                    </div>
                </div>
                
                <div class="quote-controls">
                    <button class="quote-btn refresh-quote">
                        <i class="fas fa-sync-alt"></i> Новая цитата
                    </button>
                    <button class="quote-btn favorite-quote" title="Добавить в избранное">
                        <i class="far fa-star"></i>
                    </button>
                </div>
                
                <div class="quote-info">
                    <p><i class="fas fa-info-circle"></i> Цитаты обновляются по клику</p>
                </div>
            </div>
        `;
        
        this.updateContent(contentHTML);
        this.bindQuoteEvents();
    }
    
    /**
     * Привязка событий для виджета цитат
     */
    bindQuoteEvents() {
        // Обновление цитаты
        const refreshBtn = this.contentElement.querySelector('.refresh-quote');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadNewQuote());
        }
        
        // Добавление в избранное
        const favoriteBtn = this.contentElement.querySelector('.favorite-quote');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        }
    }
    
    /**
     * Загрузка новой цитаты
     */
    loadNewQuote() {
        // Получаем случайную цитату из локального списка
        const randomIndex = Math.floor(Math.random() * this.localQuotes.length);
        const randomQuote = this.localQuotes[randomIndex];
        
        this.currentQuote = randomQuote.text;
        this.author = randomQuote.author;
        
        this.renderContent();
    }
    
    /**
     * Добавление/удаление из избранного
     */
    toggleFavorite() {
        const favoriteBtn = this.contentElement.querySelector('.favorite-quote');
        const isFavorite = favoriteBtn.querySelector('i').classList.contains('fas');
        
        if (isFavorite) {
            // Удаляем из избранного
            favoriteBtn.innerHTML = '<i class="far fa-star"></i>';
            favoriteBtn.title = 'Добавить в избранное';
            alert('Цитата удалена из избранного');
        } else {
            // Добавляем в избранное
            favoriteBtn.innerHTML = '<i class="fas fa-star"></i>';
            favoriteBtn.title = 'Удалить из избранного';
            alert('Цитата добавлена в избранное!');
        }
    }
    
    /**
     * Получение текущего состояния
     */
    getState() {
        return {
            ...super.getState(),
            quote: this.currentQuote,
            author: this.author
        };
    }
}