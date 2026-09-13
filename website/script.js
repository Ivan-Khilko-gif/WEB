document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Эффект наведения на карточки ---
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.5)';
            card.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
            card.style.borderColor = '#3a3a3d';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
            card.style.borderColor = 'var(--border-color)';
        });
    });


    // --- 2. Логика переключения табов (для архива) ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtons.length > 0) {
        
        // Функция включения нужной вкладки
        function activateTab(tabId) {
            const targetBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
            const targetContent = document.getElementById(tabId);
            
            // Если элементы найдены
            if (targetBtn && targetContent) {
                // Скрываем все вкладки и снимаем выделение со всех кнопок
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active-tab'));
                
                // Показываем только нужную
                targetBtn.classList.add('active');
                targetContent.classList.add('active-tab');
            }
        }

        // Клик по кнопкам внутри самого архива
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Предотвращаем стандартное поведение
                const tabId = button.getAttribute('data-tab');
                
                activateTab(tabId);
                
                // Безопасная смена хэша, которая работает из локальной папки!
                window.location.hash = tabId;
            });
        });

        // Функция, которая смотрит на адресную строку (какое слово написано после #)
        function checkHash() {
            // Получаем слово после # (например, practice)
            let hash = window.location.hash.replace('#', '');
            
            // Защита: проверяем, что такой раздел вообще существует
            if (hash === 'lectures' || hash === 'practice' || hash === 'labs') {
                activateTab(hash);
                // Чтобы браузер не "прыгал" резко вниз к элементу, прокручиваем наверх
                window.scrollTo(0, 0); 
            }
        }

        // 1. Срабатывает сразу, если мы пришли с главной страницы по кнопке
        checkHash();

        // 2. Срабатывает, если мы нажимаем стрелки "Вперед/Назад" в браузере
        window.addEventListener('hashchange', checkHash);
    }
});
