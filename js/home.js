// ===== ЛОГИКА ГЛАВНОЙ СТРАНИЦЫ =====

document.addEventListener('DOMContentLoaded', function () {
    const badge = document.getElementById('subscription-badge');
    const status = getSubscriptionStatus();

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
});