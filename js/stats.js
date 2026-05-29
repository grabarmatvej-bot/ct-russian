// ===== ЛОГИКА СТАТИСТИКИ =====

document.addEventListener('DOMContentLoaded', function () {
    showTelegramBackButton(function () {
    window.location.href = 'index.html';
});
    var content = document.getElementById('stats-content');
    var progress = getProgress();

    var totalSolved = 0;
    var totalCorrect = 0;
    var topicsStarted = 0;

    for (var i = 0; i < TOPICS_DATA.length; i++) {
        var p = progress[TOPICS_DATA[i].id];
        if (p && p.solved > 0) {
            topicsStarted++;
            totalSolved += p.solved;
            totalCorrect += p.correct;
        }
    }

    var overallPercent = totalSolved > 0
        ? Math.round((totalCorrect / totalSolved) * 100)
        : 0;

    var html = '';

    // Общие карточки
    html += '<div class="stats-overview">';
    html += '<div class="stats-card">';
    html += '<div class="stats-card-value">' + topicsStarted + '/' + TOPICS_DATA.length + '</div>';
    html += '<div class="stats-card-label">Тем начато</div>';
    html += '</div>';
    html += '<div class="stats-card">';
    html += '<div class="stats-card-value">' + totalSolved + '</div>';
    html += '<div class="stats-card-label">Заданий решено</div>';
    html += '</div>';
    html += '<div class="stats-card">';
    html += '<div class="stats-card-value">' + overallPercent + '%</div>';
    html += '<div class="stats-card-label">Средний балл</div>';
    html += '</div>';
    html += '</div>';

    // Список тем
    html += '<div class="stats-section-title">Результаты по темам</div>';

    for (var j = 0; j < TOPICS_DATA.length; j++) {
        var topic = TOPICS_DATA[j];
        var tp = progress[topic.id];
        var percentText, percentClass;

        if (!tp || tp.solved === 0) {
            percentText = '—';
            percentClass = 'none';
        } else {
            var pct = Math.round((tp.correct / tp.solved) * 100);
            percentText = pct + '%';
            if (pct >= 80) percentClass = 'good';
            else if (pct >= 50) percentClass = 'medium';
            else percentClass = 'bad';
        }

        html += '<div class="stats-topic-row">';
        html += '<div class="stats-topic-name">' + topic.name + '</div>';
        html += '<div class="stats-topic-percent ' + percentClass + '">' + percentText + '</div>';
        html += '</div>';
    }

    content.innerHTML = html;
});