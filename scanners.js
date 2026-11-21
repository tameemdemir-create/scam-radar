const OFFICIAL_QATAR_ENTITIES = {
    "+97444407777": "بنك قطر الوطني (QNB)",
    "+97444448444": "مصرف قطر الإسلامي (QIB)",
    "+97444490000": "البنك التجاري القطري (Commercial Bank)",
    "+9748008555": "بنك دخان (Dukhan Bank)",
    "+97444253333": "مصرف الريان (Masraf Al Rayan)",
    "+97444456000": "بنك الدوحة (Doha Bank)",
    "+974111": "خدمة عملاء Ooredoo قطر",
    "+9748007111": "خدمة عملاء Vodafone قطر",
    "+974104": "بريد قطر (Qatar Post)"
};

const COUNTRY_CODES = {
    "+974": { name: "قطر (Qatar)", coords: Array.of(25.2854, 51.5310), tz: "Asia/Qatar" },
    "+966": { name: "السعودية (Saudi Arabia)", coords: Array.of(24.7136, 46.6753), tz: "Asia/Riyadh" },
    "+971": { name: "الإمارات (UAE)", coords: Array.of(25.2048, 55.2708), tz: "Asia/Dubai" },
    "+965": { name: "الكويت (Kuwait)", coords: Array.of(29.3759, 47.9774), tz: "Asia/Kuwait" },
    "+973": { name: "البحرين (Bahrain)", coords: Array.of(26.0667, 50.5577), tz: "Asia/Bahrain" },
    "+968": { name: "عُمان (Oman)", coords: Array.of(23.5880, 58.3829), tz: "Asia/Muscat" },
    "+962": { name: "الأردن (Jordan)", coords: Array.of(31.9454, 35.9284), tz: "Asia/Amman" },
    "+961": { name: "لبنان (Lebanon)", coords: Array.of(33.8938, 35.5018), tz: "Asia/Beirut" },
    "+20":  { name: "مصر (Egypt)", coords: Array.of(30.0444, 31.2357), tz: "Africa/Cairo" },
    "+90":  { name: "تركيا (Turkey)", coords: Array.of(39.9334, 32.8597), tz: "Europe/Istanbul" },
    "+44":  { name: "المملكة المتحدة (UK)", coords: Array.of(51.5074, -0.1278), tz: "Europe/London" },
    "+1":   { name: "الولايات المتحدة / كندا", coords: Array.of(38.9072, -77.0369), tz: "America/New_York" },
    "+91":  { name: "الهند (India)", coords: Array.of(28.6139, 77.2090), tz: "Asia/Kolkata" },
    "+92":  { name: "باكستان (Pakistan)", coords: Array.of(33.6844, 73.0479), tz: "Asia/Karachi" },
    "+880": { name: "بنغلاديش (Bangladesh)", coords: Array.of(23.8103, 90.4125), tz: "Asia/Dhaka" },
    "+63":  { name: "الفلبين (Philippines)", coords: Array.of(14.5995, 120.9842), tz: "Asia/Manila" },
    "+234": { name: "نيجيريا (Nigeria)", coords: Array.of(9.0765, 7.3986), tz: "Africa/Lagos" }
};

function analyzePhoneData(rawInput, entity, flags) {
    let raw = rawInput.trim().replace(/[\s\-]/g, '');
    if (!raw.startsWith('+')) raw = '+' + raw;

    let report = Array.of(`=== 1. الملف الاستخباراتي للرقم: ${raw} ===`, `• الجهة المدّعاة: ${entity || 'غير محدد'}`);
    let score = 0;
    let coords = null;
    let label = "";

    const official = OFFICIAL_QATAR_ENTITIES[raw];
    if (official) {
        report.push(`✅ [تطابق رسمي]: مسجل رسمياً لـ ${official}.`);
        report.push('• تنبيه أمني: تأكد أن المكالمة واردة وليست مزورة (Spoofed)، ولا تشارك OTP أبداً.');
    }

    let matchedCountry = null;
    const sortedPrefixes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length);
    for (const prefix of sortedPrefixes) {
        if (raw.startsWith(prefix)) {
            matchedCountry = COUNTRY_CODES[prefix];
            break;
        }
    }

    if (matchedCountry) {
        const localTime = new Date().toLocaleTimeString('en-US', { timeZone: matchedCountry.tz, hour: '2-digit', minute: '2-digit' });
        report.push(`• الدولة / المنطقة: ${matchedCountry.name}`);
        report.push(`• الإحداثيات: (${matchedCountry.coords.at(0)}, ${matchedCountry.coords.at(1)})`);
        report.push(`• الساعة الآن عند المتصل: ${localTime}`);
        coords = matchedCountry.coords;
        label = matchedCountry.name;
    } else {
        report.push('• الدولة: رمز اتصال دولي غير مدرج في القائمة السريعة.');
        score += 20;
    }

    report.push('\n=== 2. تحليل سلوك المتصل ومؤشرات الاحتيال ===');
    if (flags.otp) { score += 100; report.push('[!] طلب كود OTP: محاولة اختراق حسابات مؤكدة!'); }
    if (flags.money) { score += 85; report.push('[!] طلب دفع رسوم أو بيانات بطاقة: احتيال مالي مؤكد!'); }
    if (flags.link) { score += 90; report.push('[!] أرسل رابطاً أو طلب AnyDesk: محاولة اختراق للجهاز!'); }
    if (flags.data) { score += 75; report.push('[!] طلب بطاقة شخصية (QID) أو كلمة مرور.'); }
    if (flags.threat) { score += 40; report.push('[!] استخدام أسلوب التهديد أو الاستعجال.'); }

    score = Math.min(score, 100);
    report.push(`\n>>> نسبة الخطر المقدرة للمكالمة: ${score}% <<<`);

    return { report: report.join('\n'), score, coords, label };
}

async function analyzeUrlData(rawUrl) {
    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;

    const parsed = new URL(url);
    const domain = parsed.hostname;
    let score = 0;
    let report = Array.of(`=== التقرير الاستخباراتي لفحص الرابط: ${domain} ===`);
    let coords = null;
    let label = "";

    if (!url.startsWith('https://')) {
        score += 40;
        report.push('🚨 [تحذير أمان]: الموقع غير مشفر (يستخدم HTTP)!');
    }

    const badTlds = Array.of('.xyz', '.top', '.club', '.online', '.site', '.info', '.tk', '.ml', '.ga', '.cf', '.vip', '.icu', '.work');
    if (badTlds.some(tld => domain.endsWith(tld))) {
        score += 45;
        report.push('🚨 [مؤشر تصيد]: يستخدم امتداد نطاق رخيص وشائع في مواقع الاحتيال!');
    }

    const brands = Array.of('qnb', 'qib', 'cbq', 'dukhan', 'alrayan', 'dhl', 'aramex', 'qpost', 'ooredoo', 'vodafone', 'amazon', 'paypal', 'metrash');
    for (const b of brands) {
        if (domain.includes(b) && !domain.endsWith(`${b}.com`) && !domain.endsWith(`${b}.com.qa`) && !domain.endsWith(`${b}.qa`)) {
            score += 75;
            report.push(`🚨 [انتحال هوية خطير]: الرابط يقلد اسم (${b.toUpperCase()}) بنطاق مزيف!`);
            break;
        }
    }

    const dnsRes = await fetch(`https://dns.google{domain}&type=A`).then(r => r.json());
    if (dnsRes.Answer && dnsRes.Answer.length > 0) {
        const ip = dnsRes.Answer.find(a => a.type === 1)?.data || dnsRes.Answer.at(0).data;
        report.push(`• عنوان الخادم (IP Address): ${ip}`);

        const geo = await fetch(`https://ipwho.is{ip}`).then(r => r.json());
        if (geo.success) {
            report.push(`• موقع السيرفر الجغرافي: ${geo.city}, ${geo.country}`);
            report.push(`• الإحداثيات: (${geo.latitude}, ${geo.longitude})`);
            report.push(`• شركة الاستضافة (ISP): ${geo.connection?.isp || 'غير محدد'}`);
            coords = Array.of(geo.latitude, geo.longitude);
            label = `SERVER: ${geo.country.toUpperCase()}`;
        }
    } else {
        score += 60;
        report.push('❌ [نتيجة الفحص]: النطاق غير موجود أو تم إغلاقه بسبب البلاغات!');
    }

    score = Math.min(score, 100);
    report.push(`\n>>> نسبة الخطر المقدرة للرابط: ${score}% <<<`);

    return { report: report.join('\n'), score, coords, label };
}

function analyzeSmsData(msg) {
    let score = 0;
    let report = Array.of('=== تقرير تحليل الرسالة النصية (SMS / WhatsApp) ===');
    const urls = msg.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi);
    if (urls) {
        score += 40;
        report.push(`• روابط مكتشفة داخل الرسالة: ${urls.join(', ')}`);
    }

    const keywords = Array.of('otp', 'رمز التحقق', 'كود التفعيل', 'تحديث البيانات', 'إيقاف الحساب', 'رسوم جمركية', 'شحنة', 'anydesk', 'suspended', 'verify');
    const found = keywords.filter(k => msg.toLowerCase().includes(k));
    if (found.length > 0) {
        score += found.length * 25;
        report.push(`🚨 كلمات احتيالية مكتشفة: ${found.join(', ')}`);
    }

    score = Math.min(score, 100);
    report.push(`\n>>> نسبة خطورة الرسالة: ${score}% <<<`);

    return { report: report.join('\n'), score, firstUrl: urls ? urls.at(0) : null };
}
