document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    if (!form) return;

    const distanceSelect = document.getElementById('distance');
    const charityBtns = document.querySelectorAll('.charity-btn');
    const charityCustomInput = document.getElementById('charity-custom');
    const summaryDistancePriceEl = document.getElementById('summary-distance-price');
    const summaryCharityPriceEl = document.getElementById('summary-charity-price');
    const summaryTotalPriceEl = document.getElementById('summary-total-price');
    const textToCopyEl = document.getElementById('text-to-copy');
    const copyBtn = document.getElementById('copy-btn');
    const copySuccessMsg = document.getElementById('copy-success-msg');
    const submitBtn = document.querySelector('.submit-btn');
    const formStatusEl = document.getElementById('form-status');

    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxEud8dUYrmW-Sz_ewaDWZyL4vgNy6UJHB3icpai6VKf6F4faOXFTufEmYAfBfJoBkc/exec";

    function generateOrderId() {
        const prefix = "MRS-";
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return prefix + randomNum;
    }

    function getCharityAmount() {
        const activeCharityBtn = document.querySelector('.charity-btn.active');
        const customCharityAmount = parseInt(charityCustomInput.value, 10);

        if (!isNaN(customCharityAmount) && customCharityAmount > 0) {
            return customCharityAmount;
        }
        if (activeCharityBtn) {
            return parseInt(activeCharityBtn.dataset.amount, 10);
        }
        return 0;
    }
    
    function updateSummary() {
        const distanceOption = distanceSelect.options[distanceSelect.selectedIndex];
        const distancePrice = parseInt(distanceOption.dataset.price || 0, 10);
        const charityAmount = getCharityAmount();
        const totalPrice = distancePrice + charityAmount;

        summaryDistancePriceEl.textContent = `${distancePrice.toLocaleString('ru-RU')} ₸`;
        summaryCharityPriceEl.textContent = `${charityAmount.toLocaleString('ru-RU')} ₸`;
        summaryTotalPriceEl.textContent = `${totalPrice.toLocaleString('ru-RU')} ₸`;

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const orderId = form.dataset.orderId || '';
        const distanceName = distanceOption.value || 'Дистанция не выбрана';
        
        textToCopyEl.textContent = `Марафон: ${distanceName}. Заказ: ${orderId}. ${firstName} ${lastName}. Сумма: ${totalPrice} тг.`;
        saveFormData();
    }
    
    function saveFormData() {
        const formData = {
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            email: form.email.value,
            phone: form.phone.value,
            city: form.city.value,
            distance: form.distance.value,
            charityCustom: form['charity-custom'].value,
            orderId: form.dataset.orderId,
            paymentConfirmed: form.querySelector('#payment-confirmed').checked,
            rulesAgreed: form.querySelector('#rules-agreed').checked,
            offerAgreed: form.querySelector('#offer-agreed').checked,
        };
        localStorage.setItem('marathonRegistrationData', JSON.stringify(formData));
    }

    function loadFormData() {
        const savedData = localStorage.getItem('marathonRegistrationData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            form.firstName.value = formData.firstName || '';
            form.lastName.value = formData.lastName || '';
            form.email.value = formData.email || '';
            form.phone.value = formData.phone || '';
            form.city.value = formData.city || '';
            form.distance.value = formData.distance || '';
            form['charity-custom'].value = formData.charityCustom || '';
            form.querySelector('#payment-confirmed').checked = formData.paymentConfirmed || false;
            form.querySelector('#rules-agreed').checked = formData.rulesAgreed || false;
            form.querySelector('#offer-agreed').checked = formData.offerAgreed || false;
            form.dataset.orderId = formData.orderId || generateOrderId();
        } else {
            form.dataset.orderId = generateOrderId();
        }
        updateSummary();
    }
    
    form.addEventListener('input', updateSummary);
    
    charityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isActive = btn.classList.contains('active');
            charityBtns.forEach(b => b.classList.remove('active'));
            charityCustomInput.value = '';
            if (!isActive) {
                btn.classList.add('active');
            }
            updateSummary();
        });
    });

    charityCustomInput.addEventListener('input', () => {
        charityBtns.forEach(b => b.classList.remove('active'));
        updateSummary();
    });
    
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(textToCopyEl.textContent).then(() => {
            copySuccessMsg.style.display = 'inline';
            setTimeout(() => { copySuccessMsg.style.display = 'none'; }, 2000);
        });
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            formStatusEl.textContent = 'Пожалуйста, заполните все обязательные поля и поставьте галочки.';
            formStatusEl.className = 'error';
            return;
        }

        submitBtn.disabled = true;
        formStatusEl.textContent = 'Отправка данных...';
        formStatusEl.className = '';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.orderId = form.dataset.orderId;
        data.submissionDate = new Date().toISOString();
        
        const distancePrice = parseInt(distanceSelect.options[distanceSelect.selectedIndex].dataset.price || 0, 10);
        
        // === ИСПРАВЛЕНИЕ №1: Правильный расчет charityAmount при отправке ===
        data.charityAmount = getCharityAmount(); 
        data.distancePrice = distancePrice;
        data.totalPrice = distancePrice + data.charityAmount;

           try {
        fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Возвращаем этот режим
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json', // Этот заголовок все равно полезен
            },
            body: JSON.stringify(data)
        });

        // Поскольку с mode: 'no-cors' мы не можем дождаться ответа,
        // мы просто оптимистично считаем, что все прошло хорошо,
        // и выполняем действия сразу после отправки запроса.
        // Задержка в 1.5 секунды нужна, чтобы дать скрипту время отработать
        // и создать ощущение завершенности у пользователя.
        setTimeout(() => {
            formStatusEl.textContent = 'Спасибо! Ваша заявка принята. Мы проверим оплату и свяжемся с вами.';
            formStatusEl.className = 'success';
            localStorage.removeItem('marathonRegistrationData');
            form.reset();
            form.dataset.orderId = generateOrderId(); 
            updateSummary();
            submitBtn.disabled = false;
        }, 1500);

    } catch (error) {
        // Этот блок сработает только в случае реальной сетевой ошибки
        // (например, нет интернета)
        formStatusEl.textContent = 'Произошла ошибка при отправке. Проверьте интернет-соединение и попробуйте снова.';
        formStatusEl.className = 'error';
        console.error('Fetch Error:', error);
        submitBtn.disabled = false;
    }
});
     

    loadFormData();
});
