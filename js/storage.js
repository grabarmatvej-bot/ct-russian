// ===== РАБОТА С LOCALSTORAGE =====

// --- Прогресс ---
function getProgress() {
    try {
        const data = localStorage.getItem('quiz_progress');
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}

function saveTopicProgress(topicId, results) {
    // Эта функция теперь не используется для накопления.
    // Оставлена для совместимости со старым кодом (тесты по годам).
    var progress = getProgress();

    var totalScore = results.reduce(function (sum, r) { return sum + r.score; }, 0);
    var fullCorrect = results.filter(function (r) { return r.score === 1; }).length;

    var existing = progress[topicId];
    if (!existing || totalScore > (existing.totalScore || 0)) {
        progress[topicId] = {
            solved: results.length,
            correct: fullCorrect,
            totalScore: totalScore,
            lastAttempt: Date.now()
        };
    }

    localStorage.setItem('quiz_progress', JSON.stringify(progress));
}


// ===== НАКОПИТЕЛЬНОЕ СОХРАНЕНИЕ (для тем) =====
function addAnswerToProgress(topicId, isCorrect) {
    var progress = getProgress();

    var existing = progress[topicId] || { solved: 0, correct: 0 };

    progress[topicId] = {
        solved: (existing.solved || 0) + 1,
        correct: (existing.correct || 0) + (isCorrect ? 1 : 0),
        lastAttempt: Date.now()
    };

    localStorage.setItem('quiz_progress', JSON.stringify(progress));
}


// --- Подписка ---
function getSubscriptionStatus() {
    try {
        const data = localStorage.getItem('subscription');

        if (!data) {
            const trial = {
                type: 'trial',
                startedAt: Date.now(),
                expiresAt: Date.now() + 24 * 60 * 60 * 1000
            };
            localStorage.setItem('subscription', JSON.stringify(trial));
            return { type: 'trial', hoursLeft: 24, dateText: '' };
        }

        const sub = JSON.parse(data);
        const now = Date.now();

        if (sub.type === 'forever') {
            return { type: 'active', dateText: 'Навсегда' };
        }

        if (now < sub.expiresAt) {
            const hoursLeft = Math.ceil((sub.expiresAt - now) / (1000 * 60 * 60));
            const dateText = new Date(sub.expiresAt).toLocaleDateString('ru-RU');

            if (sub.type === 'trial') {
                return { type: 'trial', hoursLeft: hoursLeft, dateText: dateText };
            }
            return { type: 'active', hoursLeft: hoursLeft, dateText: dateText };
        }

        return { type: 'expired', hoursLeft: 0, dateText: '' };

    } catch (e) {
        return { type: 'expired', hoursLeft: 0, dateText: '' };
    }
}


// --- Передача данных между страницами ---
function setPageData(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

function getPageData(key) {
    try {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}
