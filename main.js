function updateBanner(text, level) {
    var banner = document.getElementById('alertBanner');
    banner.className = 'banner banner-' + level;
    banner.textContent = text;
    playCyberSound(level);
}

document.getElementById('btnResetMap').addEventListener('click', function () {
    playCyberSound('click');
    moveMapTo(defaultLat, defaultLon, 'DOHA BASE', 3);
});

document.getElementById('btnAnalyzePhone').addEventListener('click', function () {
    var raw = document.getElementById('phoneInput').value.trim();
    if (!raw) {
        updateBanner('[ ! ] يرجى إدخال رقم المتصل أولاً!', 'warning');
        return;
    }

    var entity = document.getElementById('entityInput').value.trim();
    var flags = {
        otp: document.getElementById('cbOtp').checked,
        money: document.getElementById('cbMoney').checked,
        link: document.getElementById('cbLink').checked,
        threat: document.getElementById('cbThreat').checked,
        data: document.getElementById('cbData').checked
    };

    var res = analyzePhoneData(raw, entity, flags);
    document.getElementById('intelReport').value = res.report;

    if (res.lat !== null && res.lon !== null) {
        moveMapTo(res.lat, res.lon, res.label, 7);
    }

    if (res.score >= 50) {
        updateBanner('🚨 [ DANGER // خطر ' + res.score + '% ]: متصل محتال ونصاب! أغلق المكالمة فوراً!', 'danger');
    } else if (res.score >= 25) {
        updateBanner('⚠️ [ WARNING // خطر ' + res.score + '% ]: اشتباه مرتفع! تواصل مع الشركة رسمياً.', 'warning');
    } else {
        updateBanner('✓ [ CLEAR // خطر ' + res.score + '% ]: لا توجد مؤشرات احتيال واضحة.', 'clear');
    }
});

document.getElementById('btnScanUrl').addEventListener('click', async function () {
    var url = document.getElementById('urlInput').value.trim();
    if (!url) {
        updateBanner('[ ! ] ضع الرابط في الخانة المخصصة أولاً!', 'warning');
        return;
    }

    playCyberSound('click');
    updateBanner('📡 [ SCANNING URL... ] جاري فحص النطاق وتتبع موقع السيرفر...', 'clear');

    try {
        var res = await analyzeUrlData(url);
        document.getElementById('intelReport').value = res.report;

        if (res.lat !== null && res.lon !== null) {
            moveMapTo(res.lat, res.lon, res.label, 9);
        }

        if (res.score >= 40) {
            updateBanner('🚨 [ DANGER // خطر ' + res.score + '% ]: رابط احتيالي أو غير آمن!', 'danger');
        } else {
            updateBanner('✓ [ VERIFIED // خطر ' + res.score + '% ]: تم فحص الرابط وتحديد موقع السيرفر.', 'clear');
        }
    } catch (err) {
        updateBanner('❌ صيغة الرابط غير صحيحة! تأكد من كتابته بشكل سليم.', 'warning');
    }
});

document.getElementById('btnScanSms').addEventListener('click', function () {
    var msg = document.getElementById('smsEmailInput').value.trim();
    if (!msg) {
        updateBanner('[ ! ] الصق نص الرسالة المشبوهة في الخانة الثالثة أولاً!', 'warning');
        return;
    }

    var res = analyzeSmsData(msg);
    if (res.firstUrl) {
        document.getElementById('urlInput').value = res.firstUrl;
    }
    document.getElementById('intelReport').value = res.report;

    if (res.score >= 50) {
        updateBanner('🚨 رسالة احتيالية خطيرة (' + res.score + '%)!', 'danger');
    } else {
        updateBanner('✓ تم تحليل الرسالة (' + res.score + '%).', 'clear');
    }
});

document.getElementById('btnScanEmail').addEventListener('click', function () {
    var email = document.getElementById('smsEmailInput').value.trim();
    if (email.indexOf('@') === -1) {
        updateBanner('[ ! ] أدخل بريداً إلكترونياً صحيحاً في الخانة الثالثة!', 'warning');
        return;
    }
    playCyberSound('click');
    var domain = email.split('@').pop().toLowerCase();
    var tempDomains = Array.of('tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'yopmail.com');
    
    var report = Array.of('=== تقرير فحص البريد الإلكتروني: ' + email + ' ===', '• نطاق البريد: ' + domain);
    if (tempDomains.indexOf(domain) !== -1) {
        report.push('🚨 [تحذير خطير]: هذا بريد مؤقت وهمي يُستخدم للاحتيال وإخفاء الهوية!');
        document.getElementById('intelReport').value = report.join('\n');
        updateBanner('🚨 تحذير: بريد مؤقت وهمي!', 'danger');
    } else {
        report.push('🌐 تم فتح صفحة فحص التسريبات العالمية (Have I Been Pwned) للتحقق من سجل هذا البريد.');
        document.getElementById('intelReport').value = report.join('\n');
        updateBanner('✓ تم فحص النطاق وفتح صفحة التحقق من التسريبات.', 'clear');
        window.open('https://haveibeenpwned.com' + encodeURIComponent(email), '_blank');
    }
});

document.getElementById('btnGoogle').addEventListener('click', function () {
    var num = document.getElementById('phoneInput').value.trim();
    if (num) {
        playCyberSound('click');
        var q = encodeURIComponent('"' + num + '" scam OR spam OR نصب OR احتيال');
        window.open('https://google.com' + q, '_blank');
    }
});

document.getElementById('btnWhatsapp').addEventListener('click', function () {
    var num = document.getElementById('phoneInput').value.trim().split('+').join('').split(' ').join('').split('-').join('');
    if (num) {
        playCyberSound('click');
        window.open('https://wa.me' + num, '_blank');
    }
});

document.getElementById('btnCopyReport').addEventListener('click', function () {
    var text = document.getElementById('intelReport').value;
    if (text) {
        var official = 'بلاغ اشتباه في محاولة احتيال إلكتروني / هاتفي\nالتاريخ: ' + new Date().toLocaleString() + '\nنظام الرصد: Global Scam Radar\n--------------------------------------\n' + text;
        navigator.clipboard.writeText(official);
        updateBanner('📋 تم نسخ صيغة البلاغ الرسمي جاهزة للإرسال (مطراش2)!', 'clear');
    }
});

document.getElementById('btnReset').addEventListener('click', function () {
    var textIds = Array.of('phoneInput', 'entityInput', 'urlInput', 'smsEmailInput', 'intelReport');
    textIds.forEach(function (id) {
        document.getElementById(id).value = '';
    });

    var checkIds = Array.of('cbOtp', 'cbMoney', 'cbLink', 'cbThreat', 'cbData');
    checkIds.forEach(function (id) {
        document.getElementById(id).checked = false;
    });

    moveMapTo(defaultLat, defaultLon, 'DOHA BASE', 3);
    updateBanner('[ SYSTEM READY ] تم تصفير الرادار وجاهز لرصد جديد...', 'clear');
});

document.getElementById('btnTestSound').addEventListener('click', function () {
    playCyberSound('danger');
});
