document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    if (!form) return;

    // Переменные для всех элементов формы
    const transferCheckbox = document.getElementById('transfer');
    const summaryTransferPriceEl = document.getElementById('summary-transfer-price');
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

    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxtK_1Z-dBuYnjSn8M7-I5hE618_2sbkGuEuaKRxr1NvLl0dV5T7qUKQXhroooxoutz/exec";

    function generateOrderId() {
        const prefix = "MRS-";
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return prefix + randomNum;
    }

    function getCharityAmount() {
        const activeCharityBtn = document.querySelector('.charity-btn.active');
        const customCharityAmount = parseInt(charityCustomInput.value, 10);
        if (!isNaN(customCharityAmount) && customCharityAmount > 0) return customCharityAmount;
        if (activeCharityBtn) return parseInt(activeCharityBtn.dataset.amount, 10);
        return 0;
    }
    
    function updateSummary() {
        const distanceOption = distanceSelect.options[distanceSelect.selectedIndex];
        const distancePrice = parseInt(distanceOption.dataset.price || 0, 10);
        const charityAmount = getCharityAmount();
        const transferPrice = transferCheckbox.checked ? parseInt(transferCheckbox.dataset.price, 10) : 0;
        const totalPrice = distancePrice + charityAmount + transferPrice;

        summaryDistancePriceEl.textContent = `${distancePrice.toLocaleString('ru-RU')} ₸`;
        summaryTransferPriceEl.textContent = `${transferPrice.toLocaleString('ru-RU')} ₸`;
        summaryCharityPriceEl.textContent = `${charityAmount.toLocaleString('ru-RU')} ₸`;
        summaryTotalPriceEl.textContent = `${totalPrice.toLocaleString('ru-RU')} ₸`;

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const orderId = form.dataset.orderId || '';
        const distanceName = distanceOption.value || 'Дистанция не выбрана';
        const transferText = transferCheckbox.checked ? "Трансфер: Иә." : "";
        
        textToCopyEl.textContent = `Марафон: ${distanceName}. ${transferText} Заказ: ${orderId}. ${firstName} ${lastName}. Сумма: ${totalPrice} тг.`;
        saveFormData();
    }
    
    function saveFormData() {
        const formData = {
            firstName: form.firstName.value, lastName: form.lastName.value, email: form.email.value, phone: form.phone.value, city: form.city.value, distance: form.distance.value,
            transfer: transferCheckbox.checked,
            charityCustom: form['charity-custom'].value, orderId: form.dataset.orderId,
            paymentConfirmed: form.querySelector('#payment-confirmed').checked, rulesAgreed: form.querySelector('#rules-agreed').checked, offerAgreed: form.querySelector('#offer-agreed').checked,
        };
        localStorage.setItem('marathonRegistrationData', JSON.stringify(formData));
    }

    function loadFormData() {
        const savedData = localStorage.getItem('marathonRegistrationData');
        if (savedData) {
            const formData = JSON.parse(savedData);
            form.firstName.value = formData.firstName || ''; form.lastName.value = formData.lastName || ''; form.email.value = formData.email || ''; form.phone.value = formData.phone || ''; form.city.value = formData.city || ''; form.distance.value = formData.distance || '';
            transferCheckbox.checked = formData.transfer || false;
            form['charity-custom'].value = formData.charityCustom || '';
            form.querySelector('#payment-confirmed').checked = formData.paymentConfirmed || false; form.querySelector('#rules-agreed').checked = formData.rulesAgreed || false; form.querySelector('#offer-agreed').checked = formData.offerAgreed || false;
            form.dataset.orderId = formData.orderId || generateOrderId();
        } else {
            form.dataset.orderId = generateOrderId();
        }
        updateSummary();
    }
    
    form.addEventListener('input', updateSummary);
    transferCheckbox.addEventListener('change', updateSummary);
    
    charityBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isActive = btn.classList.contains('active');
            charityBtns.forEach(b => b.classList.remove('active'));
            charityCustomInput.value = '';
            if (!isActive) btn.classList.add('active');
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

        // Собираем данные из формы
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.orderId = form.dataset.orderId;
        data.submissionDate = new Date().toLocaleString("ru-RU", {timeZone: "Asia/Almaty"});
        
        // ======================= ИСПРАВЛЕНИЕ ЗДЕСЬ =======================
        // Рассчитываем все цены ПЕРЕД отправкой и добавляем их в объект data
        const distancePrice = parseInt(distanceSelect.options[distanceSelect.selectedIndex].dataset.price || 0, 10);
        const transferPrice = transferCheckbox.checked ? parseInt(transferCheckbox.dataset.price, 10) : 0;
        const charityAmount = getCharityAmount();
        
        // Явно добавляем все три числовых значения в отправляемый объект
        data.distancePrice = distancePrice;
        data.transferPrice = transferPrice; // <-- Эта строка добавляет цену трансфера в отправку
        data.charityAmount = charityAmount;
        data.totalPrice = distancePrice + transferPrice + charityAmount; // Считаем итоговую сумму
        // =================================================================

        try {
            fetch(SCRIPT_URL, {
                method: 'POST', mode: 'no-cors', cache: 'no-cache', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            setTimeout(() => {
                formStatusEl.textContent = 'Спасибо! Ваша заявка принята. Мы проверим оплату и свяжемся с вами.';
                formStatusEl.className = 'success';
                localStorage.removeItem('marathonRegistrationData');
                form.reset();
                transferCheckbox.checked = false;
                form.dataset.orderId = generateOrderId(); 
                updateSummary();
                submitBtn.disabled = false;
            }, 1500);

        } catch (error) {
            formStatusEl.textContent = 'Произошла ошибка при отправке. Проверьте интернет-соединение и попробуйте снова.';
            formStatusEl.className = 'error';
            submitBtn.disabled = false;
        }
    });

    loadFormData();
});
