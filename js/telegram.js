// ===== ИНИЦИАЛИЗАЦИЯ TELEGRAM =====

var tg = window.Telegram && window.Telegram.WebApp;
var tgUser = null;

if (tg) {
    // Сообщаем Telegram, что приложение готово
    tg.ready();

    // Разворачиваем на весь экран
    tg.expand();

    // Включаем подтверждение закрытия (опционально)
    tg.enableClosingConfirmation();

    // Получаем данные пользователя
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        tgUser = tg.initDataUnsafe.user;
    }

    // Применяем цвета темы
    applyTelegramTheme();
}


// ===== ПРИМЕНЕНИЕ ТЕМЫ TELEGRAM =====
function applyTelegramTheme() {
    if (!tg || !tg.themeParams) return;

    var root = document.documentElement;
    var theme = tg.themeParams;

    if (theme.bg_color) root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
    if (theme.text_color) root.style.setProperty('--tg-theme-text-color', theme.text_color);
    if (theme.hint_color) root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
    if (theme.link_color) root.style.setProperty('--tg-theme-link-color', theme.link_color);
    if (theme.button_color) root.style.setProperty('--tg-theme-button-color', theme.button_color);
    if (theme.button_text_color) root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
    if (theme.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
}


// ===== УПРАВЛЕНИЕ КНОПКОЙ "НАЗАД" TELEGRAM =====
function showTelegramBackButton(callback) {
    if (!tg || !tg.BackButton) return;
    tg.BackButton.show();
    tg.BackButton.onClick(callback);
}

function hideTelegramBackButton() {
    if (!tg || !tg.BackButton) return;
    tg.BackButton.hide();
    tg.BackButton.offClick();
}


// ===== УТИЛИТЫ =====
function getTelegramUser() {
    return tgUser;
}

function getTelegramUserName() {
    if (!tgUser) return null;
    return tgUser.first_name || tgUser.username || 'друг';
}

function getTelegramUserId() {
    return tgUser ? tgUser.id : null;
}
