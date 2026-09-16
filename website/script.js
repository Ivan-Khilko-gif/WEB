document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Эффект наведения на карточки
    // ==========================================
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

    // ==========================================
    // 2. Логика переключения табов архива (Лекции / Практика / Лабораторные)
    // ==========================================
    const archiveTabButtons = document.querySelectorAll('.tabs-container .tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    function activateArchiveTab(tabId) {
        if (!tabId) return;

        const targetContent = document.getElementById(tabId);

        if (targetContent) {
            archiveTabButtons.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
            });

            tabContents.forEach(content => {
                content.classList.toggle('active-tab', content.id === tabId);
            });
        }
    }

    if (archiveTabButtons.length > 0) {
        archiveTabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = button.getAttribute('data-tab');
                if (tabId) {
                    activateArchiveTab(tabId);
                    window.location.hash = tabId;
                }
            });
        });

        function checkHash() {
            const hash = window.location.hash.replace('#', '');
            if (['lectures', 'practice', 'labs'].includes(hash)) {
                activateArchiveTab(hash);
            }
        }

        checkHash();
        window.addEventListener('hashchange', checkHash);
    }

    // ==========================================
    // 3. Панель просмотра и навигация по программам
    // ==========================================
    const panel = document.getElementById('viewer-panel');
    const allCards = Array.from(document.querySelectorAll('.card'));
    let currentProgramIndex = -1;

    // Элементы панели просмотра
    const iframe = document.getElementById('viewer-iframe');
    const placeholder = document.getElementById('viewer-placeholder');
    const title = document.getElementById('viewer-title');
    const closeBtn = document.getElementById('viewer-close');
    const viewerTabBtns = panel ? panel.querySelectorAll('.viewer-tabs .tab-btn') : [];
    const codeContainer = document.getElementById('viewer-code-container');
    const codeContent = document.getElementById('viewer-code-content');

    // Элементы навигации
    const btnPrev = document.getElementById('prev-program-btn');
    const btnNext = document.getElementById('next-program-btn');

    let currentDemoUrl = '';
    let currentCodeUrl = '';

    // --- Вспомогательные функции ---

    function updateNavButtons() {
        if (!btnPrev || !btnNext) return;
        btnPrev.disabled = currentProgramIndex <= 0;
        btnNext.disabled = currentProgramIndex >= allCards.length - 1 || currentProgramIndex === -1;
    }

    async function switchViewerTab(tabType) {
        if (!panel) return;

        viewerTabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabType);
        });

        if (placeholder) placeholder.style.display = 'none';

        if (tabType === 'demo') {
            if (codeContainer) codeContainer.style.display = 'none';
            if (iframe) {
                iframe.style.display = 'block';
                if (currentDemoUrl) iframe.src = currentDemoUrl;
            }
        } else if (tabType === 'code') {
            if (iframe) {
                iframe.style.display = 'none';
                iframe.src = 'about:blank';
            }

            if (codeContainer) {
                codeContainer.style.display = 'block';

                if (codeContent) {
                    if (!currentCodeUrl) {
                        codeContent.textContent = 'Путь к файлу с кодом не указан.';
                        return;
                    }

                    codeContent.textContent = 'Загрузка кода...';
                    try {
                        const response = await fetch(currentCodeUrl);
                        if (!response.ok) {
                            throw new Error(`Не удалось загрузить файл (Статус: ${response.status})`);
                        }
                        const text = await response.text();
                        codeContent.textContent = text;
                    } catch (err) {
                        codeContent.textContent = 'Ошибка при чтении файла:\n' + err.message;
                    }
                }
            }
        }
    }

    function switchProgram(newIndex) {
        if (newIndex >= 0 && newIndex < allCards.length) {
            currentProgramIndex = newIndex;
            
            // Проверяем, какая вкладка сейчас активна в панели ("demo" или "code")
            const activeTabBtn = document.querySelector('.viewer-tabs .tab-btn.active');
            const activeTabType = activeTabBtn ? activeTabBtn.dataset.tab : 'demo';
            
            // ИСПРАВЛЕНО: добавлены обратные кавычки для шаблонной строки
            let targetButton = allCards[currentProgramIndex].querySelector(`.open-viewer-btn[data-type="${activeTabType}"]`);
            
            // Фолбэк: если кнопки с нужным типом нет, берем любую доступную кнопку в карточке
            if (!targetButton) {
                targetButton = allCards[currentProgramIndex].querySelector('.open-viewer-btn');
            }

            if (targetButton) {
                targetButton.click(); // Эмулируем клик, чтобы запустить основную логику открытия
            }
            updateNavButtons();
        }
    }

    // --- Обработчики событий ---

    // Делегирование клика на кнопки открытия (объединяет логику открытия и запоминания индекса)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.open-viewer-btn');

        if (btn) {
            e.preventDefault();

            // 1. Обновляем индекс текущей программы
            const cardElement = btn.closest('.card');
            currentProgramIndex = allCards.indexOf(cardElement);
            updateNavButtons();

            // 2. Собираем данные
            currentDemoUrl = btn.dataset.demo || btn.getAttribute('href') || '';
            currentCodeUrl = btn.dataset.code || btn.getAttribute('href') || '';
            const cardTitle = btn.dataset.title || (cardElement ? cardElement.querySelector('.card-title')?.textContent : 'Просмотр');

            // 3. Обновляем UI панели
            if (title) title.textContent = cardTitle;
            const initialTab = btn.dataset.type || 'demo';
            switchViewerTab(initialTab);

            // 4. Прокрутка к панели
            if (panel) {
                panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });

    // Переключение табов внутри самой панели просмотра
    viewerTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchViewerTab(btn.dataset.tab);
        });
    });

    // Кнопка закрытия панели
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (iframe) {
                iframe.src = 'about:blank';
                iframe.style.display = 'none';
            }
            if (codeContainer) {
                codeContainer.style.display = 'none';
            }
            if (placeholder) placeholder.style.display = 'flex';
            if (title) title.textContent = 'Выберите программу из списка выше';
            
            // Опционально: сбрасываем индекс при закрытии
            // currentProgramIndex = -1;
            // updateNavButtons();
        });
    }

    // Кнопки навигации "Вперёд" / "Назад"
    if (btnPrev) {
        btnPrev.addEventListener('click', () => switchProgram(currentProgramIndex - 1));
    }
    if (btnNext) {
        btnNext.addEventListener('click', () => switchProgram(currentProgramIndex + 1));
    }

});