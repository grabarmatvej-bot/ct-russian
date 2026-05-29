// ===== ЛОГИКА ГЛАВНОЙ СТРАНИЦЫ =====

document.addEventListener('DOMContentLoaded', async function () {
    // Авторизация + загрузка данных с сервера
    var user = await authUser();
    if (user) {
        await loadProgressFromServer();
    }

    // Приветствие
    var userName = (typeof getTelegramUserName === 'function') ? getTelegramUserName() : null;
    var title = document.querySelector('.home-title');

    if (title && userName) {
        title.innerHTML = 'Привет, ' + userName + '! 👋';
    }

    var subtitle = document.querySelector('.home-subtitle');
    if (subtitle) {
        subtitle.textContent = 'ЦТ/ЦЭ Русский язык — твой помощник в подготовке';
    }

    // Статус подписки — с сервера
    var badge = document.getElementById('subscription-badge');
    if (badge) {
        badge.className = 'home-subscription-badge';
        badge.textContent = '⏳ Загрузка...';

        var status = await loadSubscriptionFromServer();

        if (!status) {
            // Если сервер недоступен — fallback на localStorage
            status = getSubscriptionStatus();
        }

        if (status.type === 'active') {
            badge.className = 'home-subscription-badge active';
            if (status.dateText === 'Навсегда' || status.hoursLeft > 24 * 365) {
                badge.textContent = '♾️ Подписка навсегда';
            } else {
                badge.textContent = '✅ Подписка до ' + status.dateText;
            }
        } else if (status.type === 'trial') {
            badge.className = 'home-subscription-badge trial';
            badge.textContent = '⏳ Пробный период: ' + status.hoursLeft + ' ч.';
        } else {
            badge.className = 'home-subscription-badge expired';
            badge.textContent = '🔒 Подписка не активна';
        }
    }

    if (typeof hideTelegramBackButton === 'function') {
        hideTelegramBackButton();
    }
});
