// ===== ИНИЦИАЛИЗАЦИЯ TELEGRAM =====
const tg = window.Telegram && window.Telegram.WebApp;

if (tg) {
    tg.ready();
    tg.expand();
}