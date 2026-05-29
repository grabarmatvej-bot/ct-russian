// ===== ЛОГИКА ГЛАВНОЙ СТРАНИЦЫ =====

document.addEventListener('DOMContentLoaded', function () {
    // Приветствие пользователя
    var userName = getTelegramUserName();
    var title = document.querySelector('.home-title');

    if (title && userName) {
        title.innerHTML = 'Привет, ' + userName + '! 👋';
    }

    // Подзаголовок (если был)
    var subtitle = document.querySelector('.home-subtitle');
    if (subtitle) {
        subtitle.textContent = 'ЦТ/ЦЭ Русский язык — твой помощник в подготовке';
    }

    // Статус подписки
    var badge = document.getElementById('subscription-badge');
    if (badge) {
        var status = getSubscriptionStatus();

        if (status.type === 'active') {
            badge.className = 'home-subscription-badge active';
            badge.textContent = '✅ Подписка до ' + status.dateText;
        } else if (status.type === 'trial') {
            badge.className = 'home-subscription-badge trial';
            badge.textContent = '⏳ Пробный период: ' + status.hoursLeft + ' ч.';
        } else {
            badge.className = 'home-subscription-badge expired';
            badge.textContent = '🔒 Подписка не активна';
        }
    }

    // На главной странице — нет кнопки "назад"
    hideTelegramBackButton();
});
