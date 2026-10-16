document.addEventListener("DOMContentLoaded", () => {
    const SECRET_CODE = "7777";

    // حالة التطبيق
    let selectedTab = 0; // 0: Direct, 1: Web, 2: M3U, 3: Xtream
    let isArabic = false;

    // قاموس الترجمة الكامل لجميع النصوص
    const i18n = {
        en: {
            dir: "ltr",
            directHeaderTitle: "Direct Stream",
            directHeaderSubtitle: "Paste a valid URL to start playback.",
            directCardTitle: "Direct",
            directCardSubtitle: "Open the URL directly",

            webHeaderTitle: "Web Stream",
            webHeaderSubtitle: "Paste a valid URL to continue.",
            webCardTitle: "Web",
            webCardSubtitle: "Open source in Web mode",

            m3uHeaderTitle: "M3U Stream",
            m3uHeaderSubtitle: "Paste a valid URL to continue.",
            m3uCardTitle: "M3U",
            m3uCardSubtitle: "Open source in playlist mode",

            xtreamHeaderTitle: "Xtream IPTV",
            xtreamHeaderSubtitle: "Choose a saved profile or add a new IPTV account.",
            xtreamCardTitle: "Xtream Codes",
            xtreamCardSubtitle: "Your IPTV profiles",

            playNow: "Play now",
            pastePlaceholder: "Paste a valid URL",
            addProfile: "Add Profile",
            chooseConnect: "Choose how you want to connect.",
            optNhnCode: "NHN Code",
            optXtreamIptv: "Xtream IPTV",
            cancel: "Cancel",

            nhnCodeTitle: "NHN Code",
            nhnCodeSubtitle: "Enter your activation code.",
            enterCodePlaceholder: "Enter code",
            connect: "Connect",

            xtreamLoginTitle: "Xtream Codes Login",
            xtreamLoginSubtitle: "Enter the server, username and password supplied by your IPTV provider.",
            connectIptv: "Connect IPTV",
            modalTitle: "Choose App Language",

            invalidCodeOrUrl: "Invalid code or URL!",
            invalidCode: "Invalid activation code!",
            fillAllFields: "Please fill in all server fields!",
            clipboardEmpty: "Clipboard is empty or access denied.",
            pasted: "Pasted!"
        },
        ar: {
            dir: "rtl",
            directHeaderTitle: "البث المباشر (Direct Stream)",
            directHeaderSubtitle: "أدخل رابط بث صالح لبدء التشغيل أو رمز الدخول.",
            directCardTitle: "Direct",
            directCardSubtitle: "تشغيل الرابط المباشر",

            webHeaderTitle: "بث الويب (Web Stream)",
            webHeaderSubtitle: "أدخل رابط صفحة البث للمتابعة.",
            webCardTitle: "Web",
            webCardSubtitle: "فتح المصدر بوضع الويب",

            m3uHeaderTitle: "قوائم M3U (M3U Stream)",
            m3uHeaderSubtitle: "أدخل رابط قائمة M3U للمتابعة.",
            m3uCardTitle: "M3U",
            m3uCardSubtitle: "فتح المصدر بوضع القائمة",

            xtreamHeaderTitle: "Xtream IPTV",
            xtreamHeaderSubtitle: "اختر ملفاً محفوظاً أو أضف حساب IPTV جديد.",
            xtreamCardTitle: "Xtream Codes",
            xtreamCardSubtitle: "ملفات IPTV الخاصة بك",

            playNow: "تشغيل الآن",
            pastePlaceholder: "أدخل رابط بث صالح",
            addProfile: "إضافة ملف",
            chooseConnect: "اختر طريقة الاتصال المناسبة.",
            optNhnCode: "رمز NHN",
            optXtreamIptv: "Xtream IPTV",
            cancel: "إلغاء",

            nhnCodeTitle: "رمز NHN",
            nhnCodeSubtitle: "أدخل رمز التفعيل الخاص بك.",
            enterCodePlaceholder: "أدخل الرمز",
            connect: "اتصال",

            xtreamLoginTitle: "تسجيل حساب Xtream",
            xtreamLoginSubtitle: "أدخل رابط السيرفر واسم المستخدم وكلمة المرور المزودة من اشتراكك.",
            connectIptv: "اتصال بالسيرفر",
            modalTitle: "اختر لغة التطبيق",

            invalidCodeOrUrl: "كود غير صحيح أو رابط غير صالح!",
            invalidCode: "رمز التفعيل غير صحيح!",
            fillAllFields: "يرجى ملء جميع حقول السيرفر!",
            clipboardEmpty: "الحافظة فارغة أو تم رفض الإذن.",
            pasted: "تم اللصق!"
        }
    };

    // عناصر الصفحة
    const headerMainTitle = document.getElementById("headerMainTitle");
    const headerSubtitle = document.getElementById("headerSubtitle");
    const cardTopTitle = document.getElementById("cardTopTitle");
    const cardTopSubtitle = document.getElementById("cardTopSubtitle");

    const tabDirect = document.getElementById("tabDirect");
    const tabWeb = document.getElementById("tabWeb");
    const tabM3u = document.getElementById("tabM3u");
    const tabXtream = document.getElementById("tabXtream");
    const allTabs = [tabDirect, tabWeb, tabM3u, tabXtream];

    const sectionUrlInput = document.getElementById("sectionUrlInput");
    const sectionXtreamMenu = document.getElementById("sectionXtreamMenu");
    const sectionNhnCodeInput = document.getElementById("sectionNhnCodeInput");
    const sectionXtreamLoginInput = document.getElementById("sectionXtreamLoginInput");

    const etStreamUrl = document.getElementById("etStreamUrl");
    const etNhnCode = document.getElementById("etNhnCode");
    const btnPlayNow = document.getElementById("btnPlayNow");

    const rowNhnCodeOption = document.getElementById("rowNhnCodeOption");
    const rowXtreamServerOption = document.getElementById("rowXtreamServerOption");
    const btnCancelXtreamMenu = document.getElementById("btnCancelXtreamMenu");

    const btnConnectNhnCode = document.getElementById("btnConnectNhnCode");
    const btnCancelNhnCode = document.getElementById("btnCancelNhnCode");

    const etXtreamServer = document.getElementById("etXtreamServer");
    const etXtreamUser = document.getElementById("etXtreamUser");
    const etXtreamPass = document.getElementById("etXtreamPass");
    const btnSaveAndConnect = document.getElementById("btnSaveAndConnect");
    const btnCancelXtreamLogin = document.getElementById("btnCancelXtreamLogin");
    const tvXtreamError = document.getElementById("tvXtreamError");

    const languageModal = document.getElementById("languageModal");
    const btnLanguage = document.getElementById("btnLanguage");
    const btnChooseArabic = document.getElementById("btnChooseArabic");
    const btnChooseEnglish = document.getElementById("btnChooseEnglish");

    // وظيفة فتح السيرفر الخاص بالمباريات عند إدخال الكود 7777
    function unlockApp() {
        localStorage.setItem("NHN_LIVE_LOGGED_IN", "true");
        alert(isArabic ? "✅ تم تفعيل الكود بنجاح! يتم الانتقال إلى جدول المباريات..." : "✅ Activation Successful! Redirecting to Matches...");
        // هنا سنربط الانتقال إلى صفحة المباريات عند تصميمها بالخطوة التالية
        console.log("APP UNLOCKED WITH SECRET CODE: " + SECRET_CODE);
    }

    // فحص الرابط أو كود 7777 في الخانات المباشرة
    function handlePlayStream(inputVal) {
        const val = inputVal.trim();
        if (val === SECRET_CODE) {
            unlockApp();
            return;
        }

        if (val.startsWith("http://") || val.startsWith("https://")) {
            alert((isArabic ? "جاري تشغيل الرابط: " : "Playing URL: ") + val);
            // فتح المشغل أو تشغيل الفيديو
        } else {
            alert(i18n[isArabic ? "ar" : "en"].invalidCodeOrUrl);
        }
    }

    // تبديل التبويبات الأربعة
    function switchTab(index) {
        selectedTab = index;
        allTabs.forEach((tab, i) => {
            if (i === index) tab.classList.add("active");
            else tab.classList.remove("active");
        });

        sectionUrlInput.style.display = "none";
        sectionXtreamMenu.style.display = "none";
        sectionNhnCodeInput.style.display = "none";
        sectionXtreamLoginInput.style.display = "none";
        tvXtreamError.style.display = "none";

        const t = i18n[isArabic ? "ar" : "en"];

        if (index === 0) {
            headerMainTitle.textContent = t.directHeaderTitle;
            headerSubtitle.textContent = t.directHeaderSubtitle;
            cardTopTitle.textContent = t.directCardTitle;
            cardTopSubtitle.textContent = t.directCardSubtitle;
            sectionUrlInput.style.display = "block";
        } else if (index === 1) {
            headerMainTitle.textContent = t.webHeaderTitle;
            headerSubtitle.textContent = t.webHeaderSubtitle;
            cardTopTitle.textContent = t.webCardTitle;
            cardTopSubtitle.textContent = t.webCardSubtitle;
            sectionUrlInput.style.display = "block";
        } else if (index === 2) {
            headerMainTitle.textContent = t.m3uHeaderTitle;
            headerSubtitle.textContent = t.m3uHeaderSubtitle;
            cardTopTitle.textContent = t.m3uCardTitle;
            cardTopSubtitle.textContent = t.m3uCardSubtitle;
            sectionUrlInput.style.display = "block";
        } else if (index === 3) {
            headerMainTitle.textContent = t.xtreamHeaderTitle;
            headerSubtitle.textContent = t.xtreamHeaderSubtitle;
            cardTopTitle.textContent = t.xtreamCardTitle;
            cardTopSubtitle.textContent = t.xtreamCardSubtitle;
            sectionXtreamMenu.style.display = "block";
        }
    }

    // تطبيق اللغة وتحديث كامل النصوص
    function applyLanguage(arabic) {
        isArabic = arabic;
        localStorage.setItem("NHN_LIVE_LANG", isArabic ? "ar" : "en");
        const t = i18n[isArabic ? "ar" : "en"];

        document.documentElement.lang = isArabic ? "ar" : "en";
        document.documentElement.dir = t.dir;

        btnChooseArabic.classList.toggle("active", isArabic);
        btnChooseEnglish.classList.toggle("active", !isArabic);

        document.getElementById("txtPlayNow").textContent = t.playNow;
        etStreamUrl.placeholder = t.pastePlaceholder;
        document.getElementById("txtAddProfile").textContent = t.addProfile;
        document.getElementById("txtChooseConnect").textContent = t.chooseConnect;
        document.getElementById("txtOptNhnCode").textContent = t.optNhnCode;
        document.getElementById("txtOptXtreamIptv").textContent = t.optXtreamIptv;
        document.getElementById("txtCancelMenu").textContent = t.cancel;

        document.getElementById("txtNhnCodeTitle").textContent = t.nhnCodeTitle;
        document.getElementById("txtNhnCodeSubtitle").textContent = t.nhnCodeSubtitle;
        etNhnCode.placeholder = t.enterCodePlaceholder;
        document.getElementById("txtConnectNhn").textContent = t.connect;
        document.getElementById("txtCancelNhn").textContent = t.cancel;

        document.getElementById("txtXtreamLoginTitle").textContent = t.xtreamLoginTitle;
        document.getElementById("txtXtreamLoginSubtitle").textContent = t.xtreamLoginSubtitle;
        document.getElementById("txtConnectXtream").textContent = t.connectIptv;
        document.getElementById("txtCancelXtream").textContent = t.cancel;
        document.getElementById("txtModalTitle").textContent = t.modalTitle;

        switchTab(selectedTab);
    }

    // أحداث الضغط على التبويبات
    tabDirect.addEventListener("click", () => switchTab(0));
    tabWeb.addEventListener("click", () => switchTab(1));
    tabM3u.addEventListener("click", () => switchTab(2));
    tabXtream.addEventListener("click", () => switchTab(3));

    // زر تشغيل الرابط (Direct / Web / M3U)
    btnPlayNow.addEventListener("click", () => {
        handlePlayStream(etStreamUrl.value);
    });

    // تنقلات قائمة Xtream
    rowNhnCodeOption.addEventListener("click", () => {
        sectionXtreamMenu.style.display = "none";
        sectionNhnCodeInput.style.display = "block";
    });

    rowXtreamServerOption.addEventListener("click", () => {
        sectionXtreamMenu.style.display = "none";
        sectionXtreamLoginInput.style.display = "block";
        tvXtreamError.style.display = "none";
    });

    btnCancelXtreamMenu.addEventListener("click", () => switchTab(0));

    btnCancelNhnCode.addEventListener("click", () => {
        sectionNhnCodeInput.style.display = "none";
        sectionXtreamMenu.style.display = "block";
    });

    // زر تفعيل NHN Code بكود 7777
    btnConnectNhnCode.addEventListener("click", () => {
        const code = etNhnCode.value.trim();
        if (code === SECRET_CODE) {
            unlockApp();
        } else {
            alert(i18n[isArabic ? "ar" : "en"].invalidCode);
        }
    });

    btnCancelXtreamLogin.addEventListener("click", () => {
        sectionXtreamLoginInput.style.display = "none";
        sectionXtreamMenu.style.display = "block";
        tvXtreamError.style.display = "none";
    });

    // تسجيل وفحص حساب Xtream حقيقي
    btnSaveAndConnect.addEventListener("click", async () => {
        let server = etXtreamServer.value.trim();
        const user = etXtreamUser.value.trim();
        const pass = etXtreamPass.value.trim();
        tvXtreamError.style.display = "none";

        if (!server || !user || !pass) {
            tvXtreamError.textContent = i18n[isArabic ? "ar" : "en"].fillAllFields;
            tvXtreamError.style.display = "block";
            return;
        }

        if (!server.startsWith("http://") && !server.startsWith("https://")) {
            server = "http://" + server;
        }

        const testUrl = `${server.replace(/\/+$/, '')}/player_api.php?username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`;

        try {
            tvXtreamError.textContent = isArabic ? "جاري الاتصال بالسيرفر..." : "Connecting to Xtream server...";
            tvXtreamError.style.display = "block";

            const res = await fetch(testUrl);
            if (res.ok) {
                const data = await res.json();
                if (data.user_info && data.user_info.auth === 1) {
                    alert(isArabic ? "✅ تم الاتصال بنجاح بسيرفر IPTV!" : "✅ Connected successfully to IPTV server!");
                } else {
                    tvXtreamError.textContent = "Server returned invalid authentication.";
                }
            } else {
                tvXtreamError.textContent = `Server HTTP error: ${res.status}`;
            }
        } catch (err) {
            tvXtreamError.textContent = `Unable to connect: ${err.message}. Make sure server allows CORS or is online.`;
        }
    });

    // ميزة اللصق التلقائي من الحافظة
    document.querySelectorAll(".paste-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const targetId = btn.getAttribute("data-target");
            const targetInput = document.getElementById(targetId);
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    targetInput.value = text;
                } else {
                    alert(i18n[isArabic ? "ar" : "en"].clipboardEmpty);
                }
            } catch (err) {
                alert(i18n[isArabic ? "ar" : "en"].clipboardEmpty);
            }
        });
    });

    // نافذة اختيار اللغة
    btnLanguage.addEventListener("click", () => {
        languageModal.style.display = "flex";
    });

    languageModal.addEventListener("click", (e) => {
        if (e.target === languageModal) languageModal.style.display = "none";
    });

    btnChooseArabic.addEventListener("click", () => {
        applyLanguage(true);
        languageModal.style.display = "none";
    });

    btnChooseEnglish.addEventListener("click", () => {
        applyLanguage(false);
        languageModal.style.display = "none";
    });

    // التعرف التلقائي على لغة الجهاز عند أول دخول
    const savedLang = localStorage.getItem("NHN_LIVE_LANG");
    if (savedLang) {
        applyLanguage(savedLang === "ar");
    } else {
        const userLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
        applyLanguage(userLang.startsWith("ar"));
    }
});