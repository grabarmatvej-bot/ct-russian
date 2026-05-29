// ===== ЛОГИКА ЭКРАНА ЗАДАНИЯ =====

var quizState = {
    topicId: null,
    topic: null,
    questionIndex: 0,
    selectedOption: null,
    answered: false,
    isCorrect: false,
    results: []
};

document.addEventListener('DOMContentLoaded', function () {
    showTelegramBackButton(function () {
    window.location.href = 'index.html';
});
    quizState.topicId = getPageData('currentTopicId');
    var originalTopic = TOPICS_DATA.find(function (t) { return t.id === quizState.topicId; });

    if (!originalTopic) {
        window.location.href = 'topics.html';
        return;
    }

    quizState.topic = {
        id: originalTopic.id,
        name: originalTopic.name,
        description: originalTopic.description,
        type: originalTopic.type,
        instruction: originalTopic.instruction,
        questions: shuffleArray(originalTopic.questions)
    };

    quizState.questionIndex = 0;
    quizState.selectedOption = null;
    quizState.answered = false;
    quizState.isCorrect = false;
    quizState.results = [];

    renderQuestion();
});


function shuffleArray(array) {
    var copy = array.slice();
    for (var i = copy.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = copy[i];
        copy[i] = copy[j];
        copy[j] = temp;
    }
    return copy;
}


function renderQuestion() {
    var screen = document.getElementById('quiz-screen');
    var topic = quizState.topic;
    var question = topic.questions[quizState.questionIndex];
    var total = topic.questions.length;


    // Общая статистика
    var progress = getProgress();
    var p = progress[quizState.topicId] || { solved: 0, correct: 0 };
    var totalSolved = p.solved || 0;
    var totalCorrect = p.correct || 0;
    var totalPercent = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

    // Прогресс-бар на основе общей статистики
    var totalProgressPercent = Math.min(100, Math.round((totalSolved / total) * 100));

    // Решено за сессию
    var sessionSolved = quizState.results.length;

    var html = '';

    // Шапка
    html += '<div class="quiz-header">';
    html += '<a href="topics.html" class="back-btn">←</a>';
    html += '<div class="quiz-title">' + topic.name + '</div>';
    html += '</div>';

    // Прогресс-бар (общий)
    html += '<div class="quiz-progress-bar">';
    html += '<div class="quiz-progress-fill" style="width:' + totalProgressPercent + '%"></div>';
    html += '</div>';

    // Решено за сессию
    html += '<div class="quiz-session-info">За эту сессию решено: <strong>' + sessionSolved + '</strong></div>';

    // Общая статистика
    html += '<div class="quiz-total-stats">';
    if (totalSolved > 0) {
        html += 'Всего решено: <strong>' + totalSolved + ' / ' + total + '</strong> · Верно: <strong>' + totalPercent + '%</strong>';
    } else {
        html += 'Это твой первый заход в эту тему 🚀';
    }
    html += '</div>';

    // Инструкция
    if (topic.instruction) {
        html += '<div class="quiz-instruction">' + topic.instruction + '</div>';
    }

    // Словосочетание
    html += '<div class="quiz-phrase">' + question.text + '</div>';

    // Варианты
    html += '<div class="quiz-options">';
    for (var i = 0; i < question.options.length; i++) {
        var classes = 'quiz-option';

        if (quizState.answered) {
            classes += ' disabled';
            if (i === question.correct) {
                classes += ' correct';
            } else if (i === quizState.selectedOption) {
                classes += ' wrong';
            }
        } else if (quizState.selectedOption === i) {
            classes += ' selected';
        }

        html += '<div class="' + classes + '" data-index="' + i + '">';
        html += '<div class="option-text" style="text-align:center;font-weight:600;">' + question.options[i] + '</div>';
        html += '</div>';
    }
    html += '</div>';

    // Подсказка
    if (quizState.answered && !quizState.isCorrect) {
        html += '<div class="quiz-explanation visible">';
        html += '<div class="quiz-explanation-title">💡 Подсказка</div>';
        html += '<div class="quiz-explanation-text">' + question.hint + '</div>';
        html += '</div>';
    }

    // Кнопки
    if (!quizState.answered) {
        var disabled = quizState.selectedOption === null ? ' disabled' : '';
        html += '<button class="quiz-btn" id="confirm-btn"' + disabled + '>Ответить</button>';
    } else if (quizState.questionIndex < total - 1) {
        html += '<button class="quiz-btn next" id="next-btn">Следующее →</button>';
    } else {
        html += '<button class="quiz-btn next" id="finish-btn">Посмотреть результат 🎉</button>';
    }

    html += '<button class="quiz-exit-btn" id="exit-btn">Выйти из темы</button>';

    screen.innerHTML = html;
    bindQuizEvents();
}


function bindQuizEvents() {
    var options = document.querySelectorAll('.quiz-option:not(.disabled)');
    for (var i = 0; i < options.length; i++) {
        options[i].addEventListener('click', function () {
            var index = parseInt(this.getAttribute('data-index'));
            selectOption(index);
        });
    }

    var confirmBtn = document.getElementById('confirm-btn');
    if (confirmBtn) confirmBtn.addEventListener('click', confirmAnswer);

    var nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.addEventListener('click', nextQuestion);

    var finishBtn = document.getElementById('finish-btn');
    if (finishBtn) finishBtn.addEventListener('click', finishQuiz);

    var exitBtn = document.getElementById('exit-btn');
    if (exitBtn) exitBtn.addEventListener('click', exitTopic);
}


function selectOption(index) {
    if (quizState.answered) return;
    quizState.selectedOption = index;
    renderQuestion();
}


function confirmAnswer() {
    if (quizState.selectedOption === null || quizState.answered) return;

    var question = quizState.topic.questions[quizState.questionIndex];
    quizState.answered = true;
    quizState.isCorrect = quizState.selectedOption === question.correct;

    quizState.results.push({
        questionId: question.id,
        selected: quizState.selectedOption,
        score: quizState.isCorrect ? 1 : 0
    });

    addAnswerToProgress(quizState.topicId, quizState.isCorrect);

    if (tg && tg.HapticFeedback) {
        if (quizState.isCorrect) {
            tg.HapticFeedback.notificationOccurred('success');
        } else {
            tg.HapticFeedback.notificationOccurred('error');
        }
    }

    if (quizState.isCorrect) {
        renderQuestion();
        setTimeout(function () {
            if (quizState.questionIndex < quizState.topic.questions.length - 1) {
                nextQuestion();
            } else {
                renderQuestion();
            }
        }, 600);
    } else {
        renderQuestion();
    }
}


function nextQuestion() {
    quizState.questionIndex++;
    quizState.selectedOption = null;
    quizState.answered = false;
    quizState.isCorrect = false;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


function finishQuiz() {
    setPageData('quizResults', quizState.results);
    setPageData('quizTopicId', quizState.topicId);
    window.location.href = 'result.html';
}


function exitTopic() {
    window.location.href = 'topics.html';
}
