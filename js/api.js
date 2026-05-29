// ===== ОБРАЩЕНИЕ К СЕРВЕРУ =====

var API_URL = 'https://ct-russian-server-mnl4.vercel.app';

var currentUser = null;
var serverProgress = null;


// ===== УНИВЕРСАЛЬНЫЙ ЗАПРОС =====
async function apiRequest(path, data) {
    console.log('🔵 apiRequest:', path);

    if (!tg) {
        console.error('❌ tg не определён');
        return null;
    }

    if (!tg.initData) {
        console.error('❌ tg.initData пустой');
        return null;
    }

    console.log('✅ initData есть, длина:', tg.initData.length);

    try {
        var url = API_URL + path;
        console.log('📡 Отправляем POST на:', url);

        var response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                initData: tg.initData,
                ...data
            })
        });

        console.log('📥 Ответ сервера, статус:', response.status);

        if (!response.ok) {
            var errorText = await response.text();
            console.error('❌ Ошибка сервера:', response.status, errorText);
            return null;
        }

        var result = await response.json();
        console.log('✅ Получены данные:', result);
        return result;

    } catch (e) {
        console.error('❌ Ошибка сети:', e.message, e);
        return null;
    }
}


// ===== АВТОРИЗАЦИЯ =====
async function authUser() {
    console.log('🔐 Начинаем авторизацию...');
    var result = await apiRequest('/api/auth', {});
    if (result && result.user) {
        currentUser = result.user;
        console.log('✅ Авторизация успешна:', currentUser);
        return result.user;
    }
    console.error('❌ Авторизация не удалась');
    return null;
}


// ===== ПОЛУЧИТЬ ПРОГРЕСС =====
async function loadProgressFromServer() {
    var result = await apiRequest('/api/progress/get', {});
    if (result && result.progress) {
        serverProgress = result.progress;
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
