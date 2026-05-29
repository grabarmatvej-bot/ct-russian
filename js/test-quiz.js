// ===== ПОЛНЫЙ ТЕСТ НА ОДНОЙ СТРАНИЦЕ =====

var fullTest = {
    testId: null,
    test: null,
    answers: {}
};

document.addEventListener('DOMContentLoaded', function () {
    fullTest.testId = getPageData('currentTestId');
    fullTest.test = TESTS_DATA.find(function (t) { return t.id === fullTest.testId; });

    if (!fullTest.test) {
        window.location.href = 'tests.html';
        return;
    }

    fullTest.answers = {};
    renderFullTest();
    renderSubmitArea();
});


// ===== РЕНДЕР ВСЕГО ТЕСТА =====
function renderFullTest() {
    var screen = document.getElementById('test-screen');
    var test = fullTest.test;
    var html = '';

    // Заголовок
    html += '<div class="page-header">';
    html += '<a href="tests.html" class="back-btn">←</a>';
    html += '<h2 class="page-title">' + test.name + '</h2>';
    html += '</div>';

    var lastSection = '';

    for (var i = 0; i < test.questions.length; i++) {
        var q = test.questions[i];

        // Разделитель Часть А / Часть В
        var currentSection = q.section || (q.id <= 18 ? 'А' : 'В');

        if (currentSection !== lastSection) {
            html += '<div class="full-test-divider">Часть ' + currentSection + '</div>';
            lastSection = currentSection;
        }

        html += renderFullTestQuestion(q, i);
    }

    screen.innerHTML = html;
    bindAllEvents();
}


// ===== РЕНДЕР ОДНОГО ВОПРОСА =====
function renderFullTestQuestion(question, index) {
    var qId = question.id;
    var answer = fullTest.answers[qId];
    var hasAnswer = false;

    if (question.type === 'choice') {
        hasAnswer = answer && answer.length > 0;
    } else if (question.type === 'input') {
        hasAnswer = answer && answer.trim().length > 0;
    } else if (question.type === 'match') {
        if (answer) {
            var keys = Object.keys(question.correct);
            var filled = 0;
            for (var k = 0; k < keys.length; k++) {
                if (answer[keys[k]]) filled++;
            }
            hasAnswer = filled === keys.length;
        }
    }

    var html = '<div class="full-test-question' + (hasAnswer ? ' answered' : '') + '" id="q-' + qId + '">';

    // Вопрос
    html += '<div class="quiz-question">' + question.text.replace(/\n/g, '<br>') + '</div>';

    // По типу
    if (question.type === 'choice') {
        html += renderFullChoice(question, index);
    } else if (question.type === 'input') {
        html += renderFullInput(question, index);
    } else if (question.type === 'match') {
        html += renderFullMatch(question, index);
    }

    html += '</div>';
    return html;
}


// ===== ТИП 1: ВЫБОР =====
function renderFullChoice(question, index) {
    var letters = ['А', 'Б', 'В', 'Г', 'Д'];
    var selected = fullTest.answers[question.id] || [];

    var html = '<div class="quiz-options">';
    for (var i = 0; i < question.options.length; i++) {
        var classes = 'quiz-option';
        if (selected.indexOf(i) !== -1) classes += ' selected';

        html += '<div class="' + classes + '" data-qid="' + question.id + '" data-index="' + i + '">';
        html += '<div class="option-letter">' + letters[i] + '</div>';
        html += '<div class="option-text">' + question.options[i] + '</div>';
        html += '</div>';
    }
    html += '</div>';
    return html;
}


// ===== ТИП 2: ВВОД =====
function renderFullInput(question, index) {
    var val = fullTest.answers[question.id] || '';
    var html = '<div class="quiz-input-wrapper">';
    html += '<input type="text" class="quiz-input" data-qid="' + question.id + '" placeholder="Введите ответ..." value="' + escapeHtml(val) + '" autocomplete="off" autocapitalize="off">';
    html += '</div>';
    return html;
}


// ===== ТИП 3: СООТВЕТСТВИЕ =====
function renderFullMatch(question, index) {
    var matchVals = fullTest.answers[question.id] || {};
    var letters = ['А', 'Б', 'В', 'Г', 'Д', 'Е'];
    var html = '';

    // Варианты
    html += '<div class="match-options-list">';
    html += '<div class="match-options-title">Варианты:</div>';
    for (var r = 0; r < question.rightItems.length; r++) {
        html += '<div class="match-options-item">' + question.rightItems[r] + '</div>';
    }
    html += '</div>';

    html += '<div class="match-container">';
    for (var i = 0; i < question.leftItems.length; i++) {
        var letter = letters[i];
        var currentVal = matchVals[letter] || '';

        html += '<div class="match-row">';
        html += '<div class="match-left">';
        html += '<div class="match-letter">' + letter + '</div>';
        html += '<div class="match-left-text">' + question.leftItems[i].replace(/^[А-Г]\.\s*/, '') + '</div>';
        html += '</div>';
        html += '<div class="match-arrow">→</div>';

        html += '<select class="match-select" data-qid="' + question.id + '" data-letter="' + letter + '">';
        html += '<option value="">—</option>';
        for (var j = 0; j < question.rightItems.length; j++) {
            var optNum = String(j + 1);
            var sel = currentVal === optNum ? ' selected' : '';
            html += '<option value="' + optNum + '"' + sel + '>' + optNum + '</option>';
        }
        html += '</select>';
        html += '</div>';
    }
    html += '</div>';

    return html;
}


// ===== КНОПКА ЗАВЕРШИТЬ =====
function renderSubmitArea() {
    var area = document.getElementById('submit-area');
    var total = fullTest.test.questions.length;
    var answered = countAnswered();

    var html = '';
    html += '<div class="full-test-progress-info">Отвечено: ' + answered + ' из ' + total + '</div>';
    html += '<button class="full-test-submit-btn" id="submit-btn">Завершить тест</button>';
    area.innerHTML = html;

    document.getElementById('submit-btn').addEventListener('click', function () {
        var unanswered = total - countAnswered();
        if (unanswered > 0) {
            if (!confirm('У вас ' + unanswered + ' вопрос(ов) без ответа. Завершить тест?')) {
                return;
            }
        }
        submitTest();
    });
}


function countAnswered() {
    var count = 0;
    var questions = fullTest.test.questions;
    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        var a = fullTest.answers[q.id];
        if (q.type === 'choice' && a && a.length > 0) count++;
        else if (q.type === 'input' && a && a.trim().length > 0) count++;
        else if (q.type === 'match' && a) {
            var keys = Object.keys(q.correct);
            var filled = true;
            for (var k = 0; k < keys.length; k++) {
                if (!a[keys[k]]) { filled = false; break; }
            }
            if (filled) count++;
        }
    }
    return count;
}


// ===== ПРИВЯЗКА СОБЫТИЙ =====
function bindAllEvents() {
    // Выбор
    var options = document.querySelectorAll('.quiz-option');
    for (var i = 0; i < options.length; i++) {
        options[i].addEventListener('click', function () {
            var qid = parseInt(this.getAttribute('data-qid'));
            var idx = parseInt(this.getAttribute('data-index'));
            toggleFullOption(qid, idx);
        });
    }

    // Ввод
    var inputs = document.querySelectorAll('.quiz-input[data-qid]');
    for (var j = 0; j < inputs.length; j++) {
        inputs[j].addEventListener('input', function () {
            var qid = parseInt(this.getAttribute('data-qid'));
            fullTest.answers[qid] = this.value;
            updateQuestionState(qid);
            updateSubmitArea();
        });
    }

    // Соответствие
    var selects = document.querySelectorAll('.match-select[data-qid]');
    for (var k = 0; k < selects.length; k++) {
        selects[k].addEventListener('change', function () {
            var qid = parseInt(this.getAttribute('data-qid'));
            var letter = this.getAttribute('data-letter');
            if (!fullTest.answers[qid]) fullTest.answers[qid] = {};
            fullTest.answers[qid][letter] = this.value;
            updateQuestionState(qid);
            updateSubmitArea();
        });
    }
}


function toggleFullOption(qid, index) {
    if (!fullTest.answers[qid]) fullTest.answers[qid] = [];

    var arr = fullTest.answers[qid];
    var pos = arr.indexOf(index);
    if (pos === -1) arr.push(index);
    else arr.splice(pos, 1);

    // Обновить визуал только этого вопроса
    var container = document.getElementById('q-' + qid);
    var opts = container.querySelectorAll('.quiz-option');
    for (var i = 0; i < opts.length; i++) {
        var idx = parseInt(opts[i].getAttribute('data-index'));
        if (arr.indexOf(idx) !== -1) {
            opts[i].classList.add('selected');
        } else {
            opts[i].classList.remove('selected');
        }
    }

    updateQuestionState(qid);
    updateSubmitArea();
}


function updateQuestionState(qid) {
    var container = document.getElementById('q-' + qid);
    var q = findQuestion(qid);
    var a = fullTest.answers[qid];
    var hasAnswer = false;

    if (q.type === 'choice') {
        hasAnswer = a && a.length > 0;
    } else if (q.type === 'input') {
        hasAnswer = a && a.trim().length > 0;
    } else if (q.type === 'match' && a) {
        var keys = Object.keys(q.correct);
        hasAnswer = true;
        for (var i = 0; i < keys.length; i++) {
            if (!a[keys[i]]) { hasAnswer = false; break; }
        }
    }

    if (hasAnswer) container.classList.add('answered');
    else container.classList.remove('answered');
}


function updateSubmitArea() {
    var total = fullTest.test.questions.length;
    var answered = countAnswered();
    var info = document.querySelector('.full-test-progress-info');
    if (info) info.textContent = 'Отвечено: ' + answered + ' из ' + total;
}


function findQuestion(qid) {
    for (var i = 0; i < fullTest.test.questions.length; i++) {
        if (fullTest.test.questions[i].id === qid) return fullTest.test.questions[i];
    }
    return null;
}


// ===== ТАБЛИЦА ПЕРЕВОДА БАЛЛОВ =====
var SCORE_TABLE = [
    0,1,2,3,4,5,6,7,9,10,12,14,16,18,20,22,
    23,25,27,28,29,31,32,34,35,36,37,38,39,41,42,43,
    44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,
    60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,
    76,77,78,79,80,81,82,83,84,85,87,89,90,92,96,98,100
];


// ===== ПОДСЧЁТ БАЛЛОВ =====
function submitTest() {
    var questions = fullTest.test.questions;
    var results = [];
    var primaryScore = 0;

    for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        var a = fullTest.answers[q.id];
        var points = 0;
        var maxPoints = getMaxPoints(q);

        if (q.type === 'choice') {
            points = calcChoicePoints(q, a);
        } else if (q.type === 'input') {
            points = calcInputPoints(q, a);
        } else if (q.type === 'match') {
            points = calcMatchPoints(q, a);
        }

        primaryScore += points;

        results.push({
            questionId: q.id,
            answer: a,
            points: points,
            maxPoints: maxPoints
        });
    }

    // Перевод
    var testScore = 0;
    if (primaryScore >= 0 && primaryScore <= 80) {
        testScore = SCORE_TABLE[primaryScore] || 0;
    } else {
        testScore = 100;
    }

    // Сохранить
    setPageData('fullTestResults', results);
    setPageData('fullTestPrimary', primaryScore);
    setPageData('fullTestScore', testScore);
    setPageData('currentTestId', fullTest.testId);
    setPageData('testName', fullTest.test.name);

    // Сохранить прогресс
    var correctCount = 0;
    for (var j = 0; j < results.length; j++) {
        if (results[j].points === results[j].maxPoints) correctCount++;
    }
    saveTopicProgress('test_' + fullTest.testId, [{score: testScore / 100}]);

    window.location.href = 'test-result.html';
}


// ===== ОПРЕДЕЛЕНИЕ МАКС. БАЛЛОВ ЗА ЗАДАНИЕ =====
function getMaxPoints(q) {
    // А1–А18: макс 2
    if (q.id >= 1 && q.id <= 18) return 2;

    // В1, В7, В13, В14, В16, В18 (id: 19,20,21,22,23,24): макс 2
    // В2–В6, В8–В12, В15, В17 (id: 25-36): макс 2
    // В19–В22 (id: 37-40): макс 2
    return 2;
}


// ===== ПОДСЧЁТ: ВЫБОР (А1–А18, В1,В7,В13,В14,В16,В18) =====
function calcChoicePoints(q, answer) {
    if (!answer || answer.length === 0) return 0;

    var correct = q.correct;
    var correctSelected = 0;
    var wrongSelected = 0;

    for (var i = 0; i < answer.length; i++) {
        if (correct.indexOf(answer[i]) !== -1) correctSelected++;
        else wrongSelected++;
    }

    var missed = correct.length - correctSelected;

    // Полностью верно: все правильные выбраны, лишних нет
    if (correctSelected === correct.length && wrongSelected === 0) return 2;

    // Для заданий, где частичный балл возможен (А1–А18 и В1,В7,В13,В14,В16,В18)
    // Частично верно: хотя бы один правильный, не более одной ошибки
    if (correctSelected > 0 && wrongSelected === 0 && missed > 0) return 1;
    if (correctSelected === correct.length && wrongSelected === 1) return 1;

    // Определяем группу задания для проверки, допустим ли частичный балл
    // В2-В6, В8-В12, В14, В15, В17 (type=input) не проходят сюда
    // В2-В6 etc. с type=input: только 2 или 0

    return 0;
}


// ===== ПОДСЧЁТ: ВВОД (В2–В6, В8–В12, В15, В17) =====
function calcInputPoints(q, answer) {
    if (!answer || answer.trim().length === 0) return 0;

    var userAnswer = answer.trim().toLowerCase().replace(/ё/g, 'е');

    for (var i = 0; i < q.correct.length; i++) {
        var correctAnswer = q.correct[i].trim().toLowerCase().replace(/ё/g, 'е');
        if (userAnswer === correctAnswer) return 2;
    }

    return 0;
}


// ===== ПОДСЧЁТ: СООТВЕТСТВИЕ (В19–В22) =====
function calcMatchPoints(q, answer) {
    if (!answer) return 0;

    var keys = Object.keys(q.correct);
    var matchCorrect = 0;

    for (var i = 0; i < keys.length; i++) {
        if (answer[keys[i]] === q.correct[keys[i]]) matchCorrect++;
    }

    // Все верно
    if (matchCorrect === keys.length) return 2;

    // Частично (хотя бы половина или больше)
    if (matchCorrect >= keys.length - 1 && matchCorrect > 0) return 1;

    return 0;
}


// ===== УТИЛИТЫ =====
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}