// ===== РЕЗУЛЬТАТ ПОЛНОГО ТЕСТА =====

document.addEventListener('DOMContentLoaded', function () {
    var results = getPageData('fullTestResults');
    var primaryScore = getPageData('fullTestPrimary');
    var testScore = getPageData('fullTestScore');
    var testId = getPageData('currentTestId');
    var testName = getPageData('testName') || 'Тест';

    if (!results) {
        window.location.href = 'tests.html';
        return;
    }

    var test = TESTS_DATA.find(function (t) { return t.id === testId; });

    // ===== ВЕРХНЯЯ ЧАСТЬ: ОБЩИЙ РЕЗУЛЬТАТ =====
    var screen = document.getElementById('result-screen');

    var maxPrimary = 80;
    var percent = Math.round((testScore / 100) * 100);

    var circleClass;
    if (testScore >= 80) circleClass = 'good';
    else if (testScore >= 50) circleClass = 'medium';
    else circleClass = 'bad';

    var title, desc;
    if (testScore >= 80) {
        title = 'Отличный результат! 🎉';
        desc = 'Ты отлично справился с тестом!';
    } else if (testScore >= 50) {
        title = 'Хороший результат 👍';
        desc = 'Неплохо! Но есть над чем поработать.';
    } else {
        title = 'Нужно подтянуть 💪';
        desc = 'Повтори темы и попробуй снова!';
    }

    var fullCorrect = 0;
    var partial = 0;
    var wrong = 0;
    for (var i = 0; i < results.length; i++) {
        if (results[i].points === results[i].maxPoints) fullCorrect++;
        else if (results[i].points > 0) partial++;
        else wrong++;
    }

    var html = '';

    html += '<div class="result-circle ' + circleClass + '">';
    html += '<div class="result-percent">' + testScore + '</div>';
    html += '<div class="result-label">тестовый балл</div>';
    html += '</div>';

    html += '<h2 class="result-title">' + title + '</h2>';
    html += '<p class="result-desc">' + desc + '</p>';

    // Баллы
    html += '<div class="test-result-scores">';
    html += '<div class="test-result-score-row">';
    html += '<span class="test-result-score-label">Первичный балл</span>';
    html += '<span class="test-result-score-value">' + primaryScore + ' / ' + maxPrimary + '</span>';
    html += '</div>';
    html += '<div class="test-result-score-row">';
    html += '<span class="test-result-score-label">Тестовый балл</span>';
    html += '<span class="test-result-score-value">' + testScore + ' / 100</span>';
    html += '</div>';
    html += '</div>';

    // Статистика
    html += '<div class="result-stats">';
    html += '<div class="result-stat-card">';
    html += '<div class="result-stat-value" style="color:#22c55e">' + fullCorrect + '</div>';
    html += '<div class="result-stat-label">Верно (2б)</div>';
    html += '</div>';
    html += '<div class="result-stat-card">';
    html += '<div class="result-stat-value" style="color:#f59e0b">' + partial + '</div>';
    html += '<div class="result-stat-label">Частично (1б)</div>';
    html += '</div>';
    html += '<div class="result-stat-card">';
    html += '<div class="result-stat-value" style="color:#ef4444">' + wrong + '</div>';
    html += '<div class="result-stat-label">Неверно (0б)</div>';
    html += '</div>';
    html += '</div>';

    // Кнопки
    html += '<div class="result-buttons">';
    html += '<button class="result-btn primary" id="retry-btn">Пройти заново</button>';
    html += '<a href="tests.html" class="result-btn secondary">Вернуться к тестам</a>';
    html += '</div>';

    screen.innerHTML = html;

    // Кнопка заново
    document.getElementById('retry-btn').addEventListener('click', function () {
        setPageData('currentTestId', testId);
        window.location.href = 'test-quiz.html';
    });

    // ===== НИЖНЯЯ ЧАСТЬ: РАЗБОР ЗАДАНИЙ =====
    if (!test) return;

    var reviewSection = document.getElementById('review-section');
    var reviewHtml = '';

    reviewHtml += '<div style="padding: 0 16px 40px;">';
    reviewHtml += '<div class="test-review-title">Разбор заданий</div>';

    var letters = ['А', 'Б', 'В', 'Г', 'Д'];

    for (var q = 0; q < results.length; q++) {
        var res = results[q];
        var question = test.questions[q];

        var qClass = '';
        var badgeClass = '';
        var badgeText = '';

        if (res.points === res.maxPoints) {
            qClass = 'q-correct';
            badgeClass = 'b-full';
            badgeText = res.points + ' / ' + res.maxPoints + ' баллов ✅';
        } else if (res.points > 0) {
            qClass = 'q-partial';
            badgeClass = 'b-partial';
            badgeText = res.points + ' / ' + res.maxPoints + ' баллов ⚠️';
        } else {
            qClass = 'q-wrong';
            badgeClass = 'b-zero';
            badgeText = '0 / ' + res.maxPoints + ' баллов ❌';
        }

        reviewHtml += '<div class="test-review-question ' + qClass + '">';
        reviewHtml += '<div class="test-review-score-badge ' + badgeClass + '">' + badgeText + '</div>';
        reviewHtml += '<div class="quiz-question">' + question.text.replace(/\n/g, '<br>') + '</div>';

        // Показать ответы по типу
        if (question.type === 'choice') {
            reviewHtml += renderReviewChoice(question, res.answer);
        } else if (question.type === 'input') {
            reviewHtml += renderReviewInput(question, res.answer);
        } else if (question.type === 'match') {
            reviewHtml += renderReviewMatch(question, res.answer);
        }

        // Объяснение
        reviewHtml += '<div class="quiz-explanation visible">';
        reviewHtml += '<div class="quiz-explanation-title">💡 Объяснение</div>';
        reviewHtml += '<div class="quiz-explanation-text">' + question.explanation + '</div>';
        reviewHtml += '</div>';

        reviewHtml += '</div>';
    }

    reviewHtml += '</div>';
    reviewSection.innerHTML = reviewHtml;
});


// ===== РАЗБОР: ВЫБОР =====
function renderReviewChoice(question, answer) {
    var letters = ['А', 'Б', 'В', 'Г', 'Д'];
    var selected = answer || [];
    var html = '<div class="quiz-options">';

    for (var i = 0; i < question.options.length; i++) {
        var classes = 'quiz-option disabled';
        var isCorrect = question.correct.indexOf(i) !== -1;
        var isSelected = selected.indexOf(i) !== -1;

        if (isCorrect) classes += ' correct';
        else if (isSelected && !isCorrect) classes += ' wrong';

        html += '<div class="' + classes + '">';
        html += '<div class="option-letter">' + letters[i] + '</div>';
        html += '<div class="option-text">' + question.options[i] + '</div>';
        html += '</div>';
    }

    html += '</div>';
    return html;
}


// ===== РАЗБОР: ВВОД =====
function renderReviewInput(question, answer) {
    var html = '';
    var userAnswer = answer ? answer.trim() : '(нет ответа)';
    var isCorrect = false;

    if (answer) {
        var normalized = answer.trim().toLowerCase().replace(/ё/g, 'е');
        for (var i = 0; i < question.correct.length; i++) {
            if (normalized === question.correct[i].trim().toLowerCase().replace(/ё/g, 'е')) {
                isCorrect = true;
                break;
            }
        }
    }

    html += '<div class="user-answer-line ' + (isCorrect ? 'ua-correct' : 'ua-wrong') + '">';
    html += 'Ваш ответ: <strong>' + escapeHtml(userAnswer) + '</strong>';
    html += '</div>';

    if (!isCorrect) {
        html += '<div class="user-answer-line ua-missed">';
        html += 'Правильный ответ: <strong>' + question.correct[0] + '</strong>';
        html += '</div>';
    }

    return html;
}


// ===== РАЗБОР: СООТВЕТСТВИЕ =====
function renderReviewMatch(question, answer) {
    var matchLetters = ['А', 'Б', 'В', 'Г', 'Д', 'Е'];
    var html = '';
    var keys = Object.keys(question.correct);

    for (var i = 0; i < keys.length; i++) {
        var letter = keys[i];
        var userVal = (answer && answer[letter]) ? answer[letter] : '—';
        var correctVal = question.correct[letter];
        var isCorrect = userVal === correctVal;

        html += '<div class="user-answer-line ' + (isCorrect ? 'ua-correct' : 'ua-wrong') + '">';
        html += letter + ' → ' + userVal;
        if (!isCorrect) {
            html += ' (правильно: ' + correctVal + ')';
        }
        html += '</div>';
    }

    return html;
}


function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}