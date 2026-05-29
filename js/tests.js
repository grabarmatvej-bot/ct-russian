// ===== ЛОГИКА СТРАНИЦЫ ТЕСТОВ ПО ГОДАМ =====

document.addEventListener('DOMContentLoaded', function () {
    showTelegramBackButton(function () {
    window.location.href = 'index.html';
});
    var list = document.getElementById('tests-list');
    var progress = getProgress();

    TESTS_DATA.forEach(function (test, index) {
        var p = progress['test_' + test.id] || { solved: 0, correct: 0 };
        var total = test.questions.length;
        var solved = p.solved;
        var percent = solved > 0 ? Math.round((p.correct / solved) * 100) : 0;
        var progressWidth = total > 0 ? Math.round((solved / total) * 100) : 0;

        var progressText = solved > 0
            ? solved + '/' + total + ' решено · ' + percent + '% верно'
            : total + ' заданий';

        var card = document.createElement('button');
        card.className = 'topic-card';
        card.innerHTML =
            '<div class="topic-number" style="background:linear-gradient(135deg,#f59e0b,#f97316);">' + (index + 1) + '</div>' +
            '<div class="topic-info">' +
                '<div class="topic-name">' + test.name + '</div>' +
                '<div class="topic-progress-text">' + progressText + '</div>' +
                '<div class="topic-progress-bar">' +
                    '<div class="topic-progress-fill" style="width:' + progressWidth + '%;background:linear-gradient(90deg,#f59e0b,#f97316);"></div>' +
                '</div>' +
            '</div>' +
            '<div class="topic-arrow">›</div>';

        card.addEventListener('click', function () {
            setPageData('currentTestId', test.id);
            setPageData('quizMode', 'test');
            window.location.href = 'test-quiz.html';
        });

        list.appendChild(card);
    });
});