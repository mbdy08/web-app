document.addEventListener("DOMContentLoaded", () => {
    const SECRET_CODE = "7777";
    const TELEGRAM_CHANNEL_URL = "https://t.me/nhnlive";
    const APP_DOWNLOAD_URL = "https://nhnlive.com/app/app-download.html";

    // 1. إذا كان المستخدم قد فعّل الكود سابقاً، يتم توجيهه للمباريات فوراً
    if (localStorage.getItem("NHN_LIVE_LOGGED_IN") === "true") {
        window.location.href = "matches.html";
        return;
    }

    let selectedTab = 0; // 0: Direct, 1: Web, 2: M3U, 3: Xtream
    let isArabic = false;
    let directHls = null;

    // دالة مساعدة لربط الأحداث بأمان دون توقف الكود إذا لم يوجد عنصر
    function safeAddListener(id, event, handler) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, handler);
        return el;
    }

    // نصوص الترجمة للواجهة الأولى
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
            shareMessage: "⚽ Download NHN LIVE app now for live match schedules and streaming!\n📥 Link:\n" + APP_DOWNLOAD_URL
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
            shareMessage: "⚽ حمّل الآن تطبيق NHN LIVE لمتابعة المباريات وجداول البث المباشر بأعلى جودة:\n📥 رابط التحميل:\n" + APP_DOWNLOAD_URL
        }
    };

    // عناصر الصفحة الأولى
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
    const floatingSideMenu = document.getElementById("floatingSideMenu");
    const privacyModal = document.getElementById("privacyModal");
    const languageModal = document.getElementById("languageModal");
    const tvXtreamError = document.getElementById("tvXtreamError");

    // المشغل المباشر للروابط الخارجية
    const directPlayerModal = document.getElementById("directPlayerModal");
    const directVideoPlayer = document.getElementById("directVideoPlayer");

    // التفعيل والانتقال إلى صفحة المباريات
    function unlockApp() {
        localStorage.setItem("NHN_LIVE_LOGGED_IN", "true");
        window.location.href = "matches.html";
    }

    // تشغيل الروابط الخارجية أو كود 7777
    function handlePlayStream(inputVal) {
        const val = (inputVal || "").trim();

        if (val === SECRET_CODE) {
            unlockApp();
            return;
        }

        if (val.startsWith("http://") || val.startsWith("https://")) {
            playRealStream(val);
        } else {
            alert(i18n[isArabic ? "ar" : "en"].invalidCodeOrUrl);
        }
    }

    function playRealStream(url) {
        if (directPlayerModal && directVideoPlayer) {
            directPlayerModal.style.display = "flex";
            if (window.Hls && Hls.isSupported() && (url.includes(".m3u8") || url.includes(".ts") || !url.includes(".mp4"))) {
                if (directHls) directHls.destroy();
                directHls = new Hls({ enableWorker: true, lowLatencyMode: true });
                directHls.loadSource(url);
                directHls.attachMedia(directVideoPlayer);
                directHls.on(Hls.Events.MANIFEST_PARSED, () => {
                    directVideoPlayer.play().catch(() => {});
                });
            } else {
                directVideoPlayer.src = url;
                directVideoPlayer.play().catch(() => {});
            }
        } else {
            window.open(url, "_blank");
        }
    }

    // تبديل التبويبات
    function switchTab(index) {
        selectedTab = index;
        allTabs.forEach((tab, i) => {
            if (tab) tab.classList.toggle("active", i === index);
        });

        if (sectionUrlInput) sectionUrlInput.style.display = "none";
        if (sectionXtreamMenu) sectionXtreamMenu.style.display = "none";
        if (sectionNhnCodeInput) sectionNhnCodeInput.style.display = "none";
        if (sectionXtreamLoginInput) sectionXtreamLoginInput.style.display = "none";
        if (tvXtreamError) tvXtreamError.style.display = "none";

        const t = i18n[isArabic ? "ar" : "en"];

        if (index === 0) {
            if (headerMainTitle) headerMainTitle.textContent = t.directHeaderTitle;
            if (headerSubtitle) headerSubtitle.textContent = t.directHeaderSubtitle;
            if (cardTopTitle) cardTopTitle.textContent = t.directCardTitle;
            if (cardTopSubtitle) cardTopSubtitle.textContent = t.directCardSubtitle;
            if (sectionUrlInput) sectionUrlInput.style.display = "block";
        } else if (index === 1) {
            if (headerMainTitle) headerMainTitle.textContent = t.webHeaderTitle;
            if (headerSubtitle) headerSubtitle.textContent = t.webHeaderSubtitle;
            if (cardTopTitle) cardTopTitle.textContent = t.webCardTitle;
            if (cardTopSubtitle) cardTopSubtitle.textContent = t.webCardSubtitle;
            if (sectionUrlInput) sectionUrlInput.style.display = "block";
        } else if (index === 2) {
            if (headerMainTitle) headerMainTitle.textContent = t.m3uHeaderTitle;
            if (headerSubtitle) headerSubtitle.textContent = t.m3uHeaderSubtitle;
            if (cardTopTitle) cardTopTitle.textContent = t.m3uCardTitle;
            if (cardTopSubtitle) cardTopSubtitle.textContent = t.m3uCardSubtitle;
            if (sectionUrlInput) sectionUrlInput.style.display = "block";
        } else if (index === 3) {
            if (headerMainTitle) headerMainTitle.textContent = t.xtreamHeaderTitle;
            if (headerSubtitle) headerSubtitle.textContent = t.xtreamHeaderSubtitle;
            if (cardTopTitle) cardTopTitle.textContent = t.xtreamCardTitle;
            if (cardTopSubtitle) cardTopSubtitle.textContent = t.xtreamCardSubtitle;
            if (sectionXtreamMenu) sectionXtreamMenu.style.display = "block";
        }
    }

    // تطبيق اللغة
    function applyLanguage(arabic) {
        isArabic = arabic;
        localStorage.setItem("NHN_LIVE_LANG", isArabic ? "ar" : "en");
        const t = i18n[isArabic ? "ar" : "en"];

        document.documentElement.lang = isArabic ? "ar" : "en";
        document.documentElement.dir = t.dir;

        const btnAr = document.getElementById("btnChooseArabic");
        const btnEn = document.getElementById("btnChooseEnglish");
        if (btnAr) btnAr.classList.toggle("active", isArabic);
        if (btnEn) btnEn.classList.toggle("active", !isArabic);

        const txtPlayNow = document.getElementById("txtPlayNow");
        if (txtPlayNow) txtPlayNow.textContent = t.playNow;
        if (etStreamUrl) etStreamUrl.placeholder = t.pastePlaceholder;

        const txtAddProfile = document.getElementById("txtAddProfile");
        if (txtAddProfile) txtAddProfile.textContent = t.addProfile;
        const txtChooseConnect = document.getElementById("txtChooseConnect");
        if (txtChooseConnect) txtChooseConnect.textContent = t.chooseConnect;
        const txtOptNhnCode = document.getElementById("txtOptNhnCode");
        if (txtOptNhnCode) txtOptNhnCode.textContent = t.optNhnCode;
        const txtOptXtreamIptv = document.getElementById("txtOptXtreamIptv");
        if (txtOptXtreamIptv) txtOptXtreamIptv.textContent = t.optXtreamIptv;

        const txtNhnCodeTitle = document.getElementById("txtNhnCodeTitle");
        if (txtNhnCodeTitle) txtNhnCodeTitle.textContent = t.nhnCodeTitle;
        const txtNhnCodeSubtitle = document.getElementById("txtNhnCodeSubtitle");
        if (txtNhnCodeSubtitle) txtNhnCodeSubtitle.textContent = t.nhnCodeSubtitle;
        if (etNhnCode) etNhnCode.placeholder = t.enterCodePlaceholder;
        const txtConnectNhn = document.getElementById("txtConnectNhn");
        if (txtConnectNhn) txtConnectNhn.textContent = t.connect;

        switchTab(selectedTab);
    }

    // ربط نقرات التبويبات
    safeAddListener("tabDirect", "click", () => switchTab(0));
    safeAddListener("tabWeb", "click", () => switchTab(1));
    safeAddListener("tabM3u", "click", () => switchTab(2));
    safeAddListener("tabXtream", "click", () => switchTab(3));

    // زر Play now
    safeAddListener("btnPlayNow", "click", () => {
        if (etStreamUrl) handlePlayStream(etStreamUrl.value);
    });

    // قائمة Xtream
    safeAddListener("rowNhnCodeOption", "click", () => {
        if (sectionXtreamMenu) sectionXtreamMenu.style.display = "none";
        if (sectionNhnCodeInput) sectionNhnCodeInput.style.display = "block";
    });

    safeAddListener("rowXtreamServerOption", "click", () => {
        if (sectionXtreamMenu) sectionXtreamMenu.style.display = "none";
        if (sectionXtreamLoginInput) sectionXtreamLoginInput.style.display = "block";
    });

    safeAddListener("btnCancelXtreamMenu", "click", () => switchTab(0));
    safeAddListener("btnCancelNhnCode", "click", () => {
        if (sectionNhnCodeInput) sectionNhnCodeInput.style.display = "none";
        if (sectionXtreamMenu) sectionXtreamMenu.style.display = "block";
    });

    safeAddListener("btnConnectNhnCode", "click", () => {
        const code = (etNhnCode ? etNhnCode.value : "").trim();
        if (code === SECRET_CODE) {
            unlockApp();
        } else {
            alert(i18n[isArabic ? "ar" : "en"].invalidCode);
        }
    });

    safeAddListener("btnCancelXtreamLogin", "click", () => {
        if (sectionXtreamLoginInput) sectionXtreamLoginInput.style.display = "none";
        if (sectionXtreamMenu) sectionXtreamMenu.style.display = "block";
    });

    // زر القائمة العائمة (3 شخطات)
    safeAddListener("btnMenu", "click", (e) => {
        e.stopPropagation();
        if (floatingSideMenu) {
            floatingSideMenu.style.display = (floatingSideMenu.style.display === "none" || !floatingSideMenu.style.display) ? "flex" : "none";
        }
    });

    document.addEventListener("click", (e) => {
        const btnMenu = document.getElementById("btnMenu");
        if (floatingSideMenu && !floatingSideMenu.contains(e.target) && e.target !== btnMenu) {
            floatingSideMenu.style.display = "none";
        }
    });

    // أيقونات القائمة الجانبية
    safeAddListener("btnSidePrivacy", "click", () => {
        if (floatingSideMenu) floatingSideMenu.style.display = "none";
        if (privacyModal) privacyModal.style.display = "flex";
    });

    safeAddListener("btnClosePrivacy", "click", () => {
        if (privacyModal) privacyModal.style.display = "none";
    });

    safeAddListener("btnSideTelegram", "click", () => {
        if (floatingSideMenu) floatingSideMenu.style.display = "none";
        window.open(TELEGRAM_CHANNEL_URL, "_blank");
    });

    safeAddListener("btnSideWhatsapp", "click", () => {
        if (floatingSideMenu) floatingSideMenu.style.display = "none";
        const msg = i18n[isArabic ? "ar" : "en"].shareMessage;
        window.open("https://api.whatsapp.com/send?text=" + encodeURIComponent(msg), "_blank");
    });

    safeAddListener("btnSideShare", "click", async () => {
        if (floatingSideMenu) floatingSideMenu.style.display = "none";
        const msg = i18n[isArabic ? "ar" : "en"].shareMessage;
        if (navigator.share) {
            try {
                await navigator.share({ title: "NHN LIVE", text: msg, url: APP_DOWNLOAD_URL });
            } catch (err) {}
        } else {
            navigator.clipboard.writeText(msg);
            alert(isArabic ? "تم نسخ رابط التحميل" : "Download link copied");
        }
    });

    // نافذة اختيار اللغة
    safeAddListener("btnLanguage", "click", () => {
        if (languageModal) languageModal.style.display = "flex";
    });

    safeAddListener("btnChooseArabic", "click", () => {
        applyLanguage(true);
        if (languageModal) languageModal.style.display = "none";
    });

    safeAddListener("btnChooseEnglish", "click", () => {
        applyLanguage(false);
        if (languageModal) languageModal.style.display = "none";
    });

    if (languageModal) {
        languageModal.addEventListener("click", (e) => {
            if (e.target === languageModal) languageModal.style.display = "none";
        });
    }

    // إغلاق المشغل الخارجي
    safeAddListener("btnCloseDirectPlayer", "click", () => {
        if (directPlayerModal) directPlayerModal.style.display = "none";
        if (directHls) {
            directHls.destroy();
            directHls = null;
        }
        if (directVideoPlayer) {
            directVideoPlayer.pause();
            directVideoPlayer.src = "";
        }
    });

    // زر اللصق من الحافظة
    document.querySelectorAll(".paste-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
            const targetId = btn.getAttribute("data-target");
            const targetInput = document.getElementById(targetId);
            try {
                const text = await navigator.clipboard.readText();
                if (text && targetInput) targetInput.value = text;
            } catch (err) {}
        });
    });

    // استعادة اللغة
    const savedLang = localStorage.getItem("NHN_LIVE_LANG");
    applyLanguage(savedLang ? savedLang === "ar" : (navigator.language || "").startsWith("ar"));
});