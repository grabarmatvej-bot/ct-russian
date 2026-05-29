// ===== ОБРАЩЕНИЕ К СЕРВЕРУ =====

// Адрес сервера
var API_URL = 'https://ct-russian-server-mnl4.vercel.app';

// Кэш текущего пользователя
var currentUser = null;
var serverProgress = null;


// ===== УНИВЕРСАЛЬНЫЙ ЗАПРОС =====
async function apiRequest(path, data) {
    if (!tg || !tg.initData) {
        console.warn('Telegram initData отсутствует');
        return null;
    }

    try {
        var response = await fetch(API_URL + path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                initData: tg.initData,
                ...data
            })
        });

        if (!response.ok) {
            console.error('Ошибка запроса:', response.status);
            return null;
        }

        return await response.json();
    } catch (e) {
        console.error('Ошибка сети:', e);
        return null;
    }
}


// ===== АВТОРИЗАЦИЯ =====
async function authUser() {
    var result = await apiRequest('/api/auth', {});
    if (result && result.user) {
        currentUser = result.user;
        return result.user;
    }
    return null;
}


// ===== ПОЛУЧИТЬ ПРОГРЕСС =====
async function loadProgressFromServer() {
    var result = await apiRequest('/api/progress/get', {});
    if (result && result.progress) {
        serverProgress = result.progress;
        // Сохраним в localStorage как кэш, чтобы старый код работал
        localStorage.setItem('quiz_progress', JSON.stringify(result.progress));
        return result.progress;
    }
    return null;
}


// ===== ДОБАВИТЬ ОТВЕТ =====
async function sendAnswerToServer(topicId, isCorrect) {
    return await apiRequest('/api/progress/add', {
        topicId: topicId,
        isCorrect: isCorrect
    });
}