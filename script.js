document.addEventListener('DOMContentLoaded', () => {

    // База питань
    const questionsDatabase = {

        peaceful: [
            {
                question: "Що випадає при руйнуванні блоку дуба без інструментів?",
                answers: ["Дошки", "Колода дуба", "Палки", "Саджанець"],
                correct: 1
            },
            {
                question: "Який моб є маскотом гри Minecraft?",
                answers: ["Зомбі", "Скелет", "Кріпер", "Ендермен"],
                correct: 2
            },
            {
                question: "Що потрібно для крафту верстака?",
                answers: ["4 колоди", "4 дошки", "2 кругляка", "8 дошок"],
                correct: 1
            },
            {
                question: "Як відновити здоров'я персонажа?",
                answers: ["Поспати", "Поїсти їжу", "Попити води", "Зачекати вночі"],
                correct: 1
            }
        ],

        normal: [
            {
                question: "З чого крафтиться Око Ендера (Eye of Ender)?",
                answers: [
                    "Перлина Ендера + Вогняний порошок",
                    "Перлина Ендера + Алмаз",
                    "Око павука + Вогняний порошок",
                    "Сльоза Гаста + Алмаз"
                ],
                correct: 0
            },
            {
                question: "Який інструмент потрібен для видобутку алмазної руди?",
                answers: [
                    "Кам'яна кайла",
                    "Залізна кайла",
                    "Золота кайла",
                    "Дерев'яна кайла"
                ],
                correct: 1
            },
            {
                question: "Що відбувається з Кріпером при ударі блискавки?",
                answers: [
                    "Він вмирає",
                    "Стає Зарядженим кріпером",
                    "Розмножується",
                    "Перетворюється на Скелета"
                ],
                correct: 1
            },
            {
                question: "Скільки блоків охоплює 1 блок у Нижньому світі відносно Верхнього?",
                answers: ["4 блоки", "8 блоків", "16 блоків", "10 блоків"],
                correct: 1
            }
        ],

        hardcore: [
            {
                question: "Яка максимальна сила сигналу Редстоуну без повторювачів?",
                answers: ["10", "12", "15", "16"],
                correct: 2
            },
            {
                question: "Скільки всього існує кристалів Ендера на стовпах у бою з Драконом?",
                answers: ["4", "6", "8", "10"],
                correct: 3
            },
            {
                question: "Який ефект дає Зачароване Золоте Яблуко (Яблуко Нотча)?",
                answers: [
                    "Регенерація V, Опір II",
                    "Регенерація II, Поглинання IV, Опір I, Вогнестійкість I",
                    "Вогнестійкість II, Сила II",
                    "Швидкість II, Стрибучість II"
                ],
                correct: 1
            },
            {
                question: "Який блок НЕДОСТУПНИЙ для поршня (не рухається в Java Edition)?",
                answers: ["Скриня", "Обсидіан", "Печі", "Всі перераховані"],
                correct: 3
            }
        ]
    };

    // Елементи HTML
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');

    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const diffButtons = document.querySelectorAll('.diff-btn');

    const questionText = document.getElementById('question-text');
    const answersContainer = document.getElementById('answers-container');
    const timerDisplay = document.getElementById('timer');
    const scoreDisplay = document.getElementById('score-display');
    const finalScore = document.getElementById('final-score');

    // Змінні гри
    let currentDifficulty = 'peaceful';
    let currentQuestions = [];
    let questionIndex = 0;
    let score = 0;

    let globalTimer = null;
    let totalTimeLeft = 300;

    let transitionTimeout = null;
    let isAnswerProcessed = false;

    // Змінні для статистики часу
    let questionStartTime = 0;
    let totalAnswerTime = 0;

    // Перемішування елементів масиву (Алгоритм Фішера — Єйтса)
    function shuffle(array) {
        let arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    // Форматування часу MM:SS
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Очищення таймерів
    function clearAllProcesses() {
        if (globalTimer) {
            clearInterval(globalTimer);
            globalTimer = null;
        }

        if (transitionTimeout) {
            clearTimeout(transitionTimeout);
            transitionTimeout = null;
        }
    }

    // Вибір складності
    diffButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            diffButtons.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentDifficulty = btn.dataset.diff;
        });
    });

    // Початок гри
    startBtn.addEventListener('click', () => {
        clearAllProcesses();

        currentQuestions = shuffle(questionsDatabase[currentDifficulty]);
        questionIndex = 0;
        score = 0;
        totalAnswerTime = 0;

        scoreDisplay.innerText = `Бали: ${score}`;

        startScreen.classList.add('hide');
        quizScreen.classList.remove('hide');

        // Запуск таймера на 5 хвилин (300 сек)
        totalTimeLeft = 300;
        timerDisplay.innerText = `Час: ${formatTime(totalTimeLeft)}`;

        globalTimer = setInterval(() => {
            totalTimeLeft--;
            timerDisplay.innerText = `Час: ${formatTime(totalTimeLeft)}`;

            if (totalTimeLeft <= 0) {
                clearAllProcesses();
                endGame("Час вийшов!");
            }
        }, 1000);

        loadQuestion();
    });

    // Перезапуск гри
    restartBtn.addEventListener('click', () => {
        clearAllProcesses();
        resultScreen.classList.add('hide');
        startScreen.classList.remove('hide');
    });

    // Завантаження питання
    function loadQuestion() {
        if (transitionTimeout) {
            clearTimeout(transitionTimeout);
            transitionTimeout = null;
        }

        isAnswerProcessed = false;

        if (questionIndex >= currentQuestions.length) {
            clearAllProcesses();
            endGame("Гру завершено!");
            return;
        }

        // Записуємо час появи питання для підрахунку швидкості відповіді
        questionStartTime = Date.now();

        const q = currentQuestions[questionIndex];
        questionText.innerText = q.question;
        answersContainer.innerHTML = '';

        q.answers.forEach((ans, idx) => {
            const button = document.createElement('button');
            button.innerText = ans;
            button.classList.add('mc-btn', 'answer-btn');

            button.addEventListener('click', () => {
                handleAnswer(idx, button);
            });

            answersContainer.appendChild(button);
        });
    }

    // Перевірка відповіді
    function handleAnswer(selectedIndex, btn) {
        if (isAnswerProcessed) return;
        isAnswerProcessed = true;

        // Рахуємо час, витрачений на відповідь на це питання
        const answerDuration = (Date.now() - questionStartTime) / 1000;
        totalAnswerTime += answerDuration;

        const buttons = answersContainer.querySelectorAll('.answer-btn');
        buttons.forEach(b => b.disabled = true);

        const correctIdx = currentQuestions[questionIndex].correct;

        if (selectedIndex === correctIdx) {
            score += 10;
            scoreDisplay.innerText = `Бали: ${score}`;
            if (btn) btn.classList.add('correct');
        } else {
            if (btn) btn.classList.add('wrong');
            if (buttons[correctIdx]) {
                buttons[correctIdx].classList.add('correct');
            }
        }

        questionIndex++;

        // Пауза перед наступним питанням (1.2 сек)
        transitionTimeout = setTimeout(() => {
            loadQuestion();
        }, 1200);
    }

    // Загальна функція закінчення гри (перемога чи час вийшов)
    function endGame(statusMessage) {
        quizScreen.classList.add('hide');
        resultScreen.classList.remove('hide');

        const maxScore = currentQuestions.length * 10;
        // Кількість відповідей, на які реально встигли відповісти
        const answeredCount = questionIndex > 0 ? questionIndex : 1;
        const avgSpeed = (totalAnswerTime / answeredCount).toFixed(1);

        finalScore.innerHTML = `
            ${statusMessage}<br>
            Набрано балів: ${score} з ${maxScore}<br>
            Середня швидкість відповіді: ${avgSpeed} сек/питання
        `;
    }
});
