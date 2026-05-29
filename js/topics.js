// ===== ЛОГИКА СПИСКА ТЕМ =====

document.addEventListener('DOMContentLoaded', async function () {
    // Сначала загрузим прогресс с сервера
    await loadProgressFromServer();

    var list = document.getElementById('topics-list');
    var progress = getProgress();

    TOPICS_DATA.forEach(function (topic, index) {
        var p = progress[topic.id] || { solved: 0, correct: 0 };
        var total = topic.questions.length;
        var solved = p.solved || 0;
        var correct = p.correct || 0;
        var percent = solved > 0 ? Math.round((correct / solved) * 100) : 0;

        var progressText;
        if (solved > 0) {
            progressText = 'Решено: ' + solved + ' / ' + total + ' · Верно: ' + percent + '%';
        } else {
            progressText = total + ' заданий';
        }

        var progressWidth = solved > 0
            ? Math.min(100, Math.round((solved / total) * 100))
            : 0;

        var card = document.createElement('button');
        card.className = 'topic-card';
        card.innerHTML =
            '<div class="topic-number">' + (index + 1) + '</div>' +
            '<div class="topic-info">' +
                '<div class="topic-name">' + topic.name + '</div>' +
                '<div class="topic-progress-text">' + progressText + '</div>' +
                '<div class="topic-progress-bar">' +
                    '<div class="topic-progress-fill" style="width:' + progressWidth + '%"></div>' +
                '</div>' +
            '</div>' +
            '<div class="topic-arrow">›</div>';

        card.addEventListener('click', function () {
            setPageData('currentTopicId', topic.id);
            window.location.href = 'quiz.html';
        });

        list.appendChild(card);
    });
});