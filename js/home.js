// ===== ЛОГИКА ГЛАВНОЙ СТРАНИЦЫ =====

document.addEventListener('DOMContentLoaded', function () {
    // ВРЕМЕННАЯ ДИАГНОСТИКА
    var debugInfo = '';
    debugInfo += 'tg существует: ' + (typeof tg !== 'undefined' && tg !== null) + '\n';

    if (typeof tg !== 'undefined' && tg) {
        debugInfo += 'tg.initData: ' + (tg.initData ? 'есть (' + tg.initData.length + ' символов)' : 'пусто') + '\n';
        debugInfo += 'tg.initDataUnsafe: ' + JSON.stringify(tg.initDataUnsafe) + '\n';
    }

    debugInfo += 'tgUser: ' + JSON.stringify(typeof tgUser !== 'undefined' ? tgUser : 'undefined') + '\n';

    // Показать инфу прямо на экране
    var debugDiv = document.createElement('div');
    debugDiv.style.cssText = 'background:#ffeb3b;color:#000;padding:10px;font-size:11px;white-space:pre-wrap;word-break:break-all;border:2px solid red;margin:10px;';
    debugDiv.textContent = debugInfo;
    document.body.insertBefore(debugDiv, document.body.firstChild);

    // ----- ОСНОВНОЙ КОД -----
    var userName = (typeof getTelegramUserName === 'function') ? getTelegramUserName() : null;
    var title = document.querySelector('.home-title');

    if (title && userName) {
        title.innerHTML = 'Привет, ' + userName + '! 👋';
    }

    var subtitle = document.querySelector('.home-subtitle');
    if (subtitle) {
        subtitle.textContent = 'ЦТ/ЦЭ Русский язык — твой помощник в подготовке';
    }

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

    if (typeof hideTelegramBackButton === 'function') {
        hideTelegramBackButton();
    }
});
