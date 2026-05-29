// ===== ЛОГИКА ЭКРАНА РЕЗУЛЬТАТА =====

document.addEventListener('DOMContentLoaded', function () {
    var results = getPageData('quizResults');
    var topicId = getPageData('quizTopicId');

    if (!results || !topicId) {
        window.location.href = 'topics.html';
        return;
    }

    var screen = document.getElementById('result-screen');

    var totalQuestions = results.length;
    var totalScore = 0;
    var fullCorrect = 0;
    var partial = 0;
    var wrong = 0;

    for (var i = 0; i < results.length; i++) {
        totalScore += results[i].score;
        if (results[i].score === 1) fullCorrect++;
        else if (results[i].score > 0) partial++;
        else wrong++;
    }

    var percent = Math.round((totalScore / totalQuestions) * 100);

    var circleClass, title, desc;
    if (percent >= 80) {
        circleClass = 'good';
        title = 'Отличный результат! 🎉';
        desc = 'Ты отлично знаешь эту тему. Продолжай в том же духе!';
    } else if (percent >= 50) {
        circleClass = 'medium';
        title = 'Хороший результат 👍';
        desc = 'Неплохо, но есть над чем поработать. Попробуй ещё раз.';
    } else {
        circleClass = 'bad';
        title = 'Нужно подтянуть 💪';
        desc = 'Не расстраивайся! Повтори правила и попробуй снова.';
    }

    var html = '';

    html += '<div class="result-circle ' + circleClass + '">';
    html += '<div class="result-percent">' + percent + '%</div>';
    html += '<div class="result-label">верно</div>';
    html += '</div>';

    html += '<h2 class="result-title">' + title + '</h2>';
    html += '<p class="result-desc">' + desc + '</p>';

    html += '<div class="result-stats">';
    html += '<div class="result-stat-card">';
    html += '<div class="result-stat-value" style="color:#22c55e">' + fullCorrect + '</div>';
    html += '<div class="result-stat-label">Полностью верно</div>';
    html += '</div>';
    html += '<div class="result-stat-card">';
    html += '<div class="result-stat-value" style="color:#f59e0b">' + partial + '</div>';
    html += '<div class="result-stat-label">Частично</div>';
    html += '</div>';
    html += '<div class="result-stat-card">';
    html += '<div class="result-stat-value" style="color:#ef4444">' + wrong + '</div>';
    html += '<div class="result-stat-label">Неверно</div>';
    html += '</div>';
    html += '</div>';

    html += '<div class="result-buttons">';
    html += '<button class="result-btn primary" id="retry-btn">Пройти заново</button>';
    html += '<a href="topics.html" class="result-btn secondary">Вернуться к темам</a>';
    html += '</div>';

    screen.innerHTML = html;

    // Кнопка "Пройти заново"
    document.getElementById('retry-btn').addEventListener('click', function () {
        setPageData('currentTopicId', topicId);
        window.location.href = 'quiz.html';
    });
});