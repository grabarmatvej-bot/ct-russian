
// ===== ЛОГИКА СТРАНИЦЫ ПОДПИСКИ =====

document.addEventListener('DOMContentLoaded', async function () {
    // Кнопка назад
    if (typeof showTelegramBackButton === 'function') {
        showTelegramBackButton(function () {
            window.location.href = 'index.html';
        });
    }

    // Авторизация
    await authUser();

    // Показать текущий статус подписки
    var status = await loadSubscriptionFromServer();
    showSubscriptionStatus(status);

    // Привязка кнопок
    var buttons = document.querySelectorAll('.plan-btn[data-plan]');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('click', function () {
            var planId = this.getAttribute('data-plan');
            handlePurchase(planId);
        });
    }
});


function showSubscriptionStatus(status) {
    var container = document.querySelector('.subscribe-screen');
    if (!container || !status) return;

    // Проверяем, нет ли уже плашки статуса
    var existing = document.getElementById('current-sub-status');
    if (existing) existing.remove();

    var statusBlock = document.createElement('div');
    statusBlock.id = 'current-sub-status';
    statusBlock.style.cssText = 'text-align:center; padding:12px; margin-bottom:20px; border-radius:14px; font-weight:600; font-size:14px;';

    if (status.type === 'active') {
        statusBlock.style.background = 'rgba(34, 197, 94, 0.15)';
        statusBlock.style.color = '#22c55e';
        if (status.dateText === 'Навсегда' || status.hoursLeft > 24 * 365) {
            statusBlock.textContent = '♾️ У вас подписка навсегда';
        } else {
            statusBlock.textContent = '✅ Подписка активна до ' + status.dateText;
        }
    } else if (status.type === 'trial') {
        statusBlock.style.background = 'rgba(234, 179, 8, 0.15)';
        statusBlock.style.color = '#eab308';
        statusBlock.textContent = '⏳ Пробный период: ' + status.hoursLeft + ' ч.';
    } else {
        statusBlock.style.background = 'rgba(239, 68, 68, 0.15)';
        statusBlock.style.color = '#ef4444';
        statusBlock.textContent = '🔒 Подписка не активна';
    }

    // Вставляем после заголовка
    var pageHeader = container.querySelector('.page-header');
    if (pageHeader) {
        pageHeader.parentNode.insertBefore(statusBlock, pageHeader.nextSibling);
    } else {
        container.insertBefore(statusBlock, container.firstChild);
    }
}


async function handlePurchase(planId) {
    if (!tg) {
        alert('Откройте приложение в Telegram');
        return;
    }

    // Тактильный отклик
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    // Создаём счёт на сервере
    var result = await apiRequest('/api/payment/create-invoice', {
        planId: planId
    });

    if (!result || !result.invoiceLink) {
        alert('Не удалось создать счёт. Попробуйте позже.');
        return;
    }

    // Открываем окно оплаты Telegram
    tg.openInvoice(result.invoiceLink, function (status) {
        // status может быть: 'paid', 'cancelled', 'failed', 'pending'

        if (status === 'paid') {
            if (tg.HapticFeedback) {
                tg.HapticFeedback.notificationOccurred('success');
            }

            // Подождём 2 секунды, чтобы webhook успел обработаться
            setTimeout(async function () {
                var newStatus = await loadSubscriptionFromServer();
                showSubscriptionStatus(newStatus);
                showSuccessMessage();
            }, 2000);

        } else if (status === 'cancelled') {
            console.log('Оплата отменена');
        } else if (status === 'failed') {
            alert('Ошибка оплаты. Попробуйте ещё раз.');
        }
    });
}


function showSuccessMessage() {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px;';

    overlay.innerHTML =
        '<div style="background:var(--tg-theme-bg-color, #fff); border-radius:20px; padding:32px 24px; text-align:center; max-width:320px;">' +
        '<div style="font-size:64px; margin-bottom:16px;">🎉</div>' +
        '<div style="font-size:20px; font-weight:700; margin-bottom:8px;">Оплата прошла!</div>' +
        '<div style="font-size:14px; color:var(--tg-theme-hint-color, #888); margin-bottom:24px;">Подписка активирована. Спасибо!</div>' +
        '<button onclick="this.parentElement.parentElement.remove()" style="width:100%; padding:14px; border:none; border-radius:14px; background:linear-gradient(135deg, #22c55e, #16a34a); color:white; font-size:16px; font-weight:700; cursor:pointer;">Отлично!</button>' +
        '</div>';

    document.body.appendChild(overlay);
}
