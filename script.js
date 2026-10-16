// إذا كان المستخدم قد فعّل الكود سابقاً، يتم توجيهه للمباريات فوراً دون طلب الكود
    if (localStorage.getItem("NHN_LIVE_LOGGED_IN") === "true") {
        window.location.href = "matches.html";
        return;
    }

document.addEventListener("DOMContentLoaded", () => {
    const SECRET_CODE = "7777";

    // الروابط المعتمدة
    const TELEGRAM_CHANNEL_URL = "https://t.me/nhnlive";
    const APP_DOWNLOAD_URL = "https://nhnlive.com/app/app-download.html";

    // حالة التطبيق
    let selectedTab = 0; // 0: Direct, 1: Web, 2: M3U, 3: Xtream
    let isArabic = false;

    // بنود سياسة الخصوصية العشرة (عربي وإنجليزي) بدون البند 11 وبدون زر التواصل
    const privacyData = {
        en: {
            headerTitle: "Privacy Policy",
            mainTitle: "Privacy Policy",
            subtitle: "NHN LIVE • Last updated: September 2026",
            cards: [
                { id: "1", title: "Introduction", body: "We respect your privacy and are committed to protecting it. This policy clarifies how data is handled when you use NHN LIVE." },
                { id: "2", title: "Data We Process", body: "The app requires no registration and does not collect names, phone numbers, or emails. Minimal anonymous technical diagnostics may be processed to optimize streaming." },
                { id: "3", title: "Permissions Required", body: "• Internet: Necessary for stream playback.\n• Notifications: Optional for match kick-off alerts.\n• Storage: For saving optional downloads." },
                { id: "4", title: "Data Utilization", body: "To deliver and optimize application performance. We never sell, rent, or trade your data with external third parties." },
                { id: "5", title: "Third-Party Feeds", body: "The app may display media feeds from external public sources which operate under their own independent privacy terms." },
                { id: "6", title: "Intellectual Property", body: "NHN LIVE operates solely as a media display tool and does not claim ownership of external broadcasts. All trademarks belong to their respective owners." },
                { id: "7", title: "Data Security", body: "We implement standard technical measures to maintain connection integrity and protect local preference configurations." },
                { id: "8", title: "Children's Privacy", body: "The application is not directed at children under the age of 13, and no personal data is knowingly solicited." },
                { id: "9", title: "Your Controls", body: "You can clear cached data anytime via browser settings or app storage." },
                { id: "10", title: "Policy Updates", body: "Any updates to this policy are reflected here immediately. Continued usage represents agreement to updated terms." }
            ]
        },
        ar: {
            headerTitle: "سياسة الخصوصية",
            mainTitle: "سياسة الخصوصية",
            subtitle: "NHN LIVE • آخر تحديث: سبتمبر 2026",
            cards: [
                { id: "1", title: "مقدّمة", body: "نحترم خصوصيتك ونلتزم بحمايتها. توضّح هذه السياسة البيانات التي نتعامل معها عند استخدامك لتطبيق NHN LIVE، وكيف نستخدمها وحقوقك تجاهها." },
                { id: "2", title: "البيانات التي نجمعها", body: "لا يطلب التطبيق التسجيل ولا يجمع أسماء أو أرقام هواتف أو بريداً إلكترونياً. تُعالج بيانات تقنية مجهولة الهوية لتحسين استقرار البث." },
                { id: "3", title: "الأذونات المطلوبة", body: "• الإنترنت: ضروري لتحميل المحتوى وتشغيل البث.\n• الإشعارات: اختياري لإعلامك بالمباريات والتحديثات.\n• التخزين: لحفظ الملفات التي تختار تنزيلها بنفسك." },
                { id: "4", title: "كيف نستخدم البيانات", body: "لتشغيل التطبيق وتحسين السرعة وإصلاح الأعطال. لا نبيع بياناتك ولا نشاركها لأغراض تسويقية." },
                { id: "5", title: "الخدمات والمحتوى الخارجي", body: "يعرض التطبيق مصادر بث عامة ومفتوحة تخضع لسياسات الخصوصية الخاصة بمزوديها الأصليين." },
                { id: "6", title: "حقوق الملكية والمحتوى", body: "يعمل التطبيق كواجهة عرض ولا يدّعي ملكية المحتوى التابع لأطراف أخرى. جميع الحقوق محفوظة لمالكيها الأصليين." },
                { id: "7", title: "أمان البيانات", body: "نستخدم اتصالات مشفرة وإجراءات تقنية مناسبة لحماية استقرار التطبيق وتفضيلات المستخدم." },
                { id: "8", title: "خصوصية الأطفال", body: "التطبيق غير موجّه للأطفال دون سن 13 عاماً، ولا نجمع بياناتهم الشخصية عن قصد." },
                { id: "9", title: "حقوقك والتحكم", body: "يمكنك مسح البيانات المحلية في أي وقت عبر إعدادات المتصفح." },
                { id: "10", title: "تعديلات السياسة", body: "قد نحدّث هذه السياسة دورياً ويظهر تاريخ التحديث أعلى الصفحة ويُعد استمرارك موافقة عليها." }
            ]
        }
    };

    // قاموس ترجمة باقي الواجهة
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
            shareMessage: "⚽ Download NHN LIVE app now for live match schedules and streaming in top quality!\n📥 Direct Download:\n" + APP_DOWNLOAD_URL
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
            shareMessage: "⚽ حمّل الآن تطبيق NHN LIVE لمتابعة المباريات وجداول البث المباشر بأعلى جودة!\n📥 رابط التحميل المباشر:\n" + APP_DOWNLOAD_URL
        }
    };

    // عناصر الواجهة
    const btnMenu = document.getElementById("btnMenu");
    const floatingSideMenu = document.getElementById("floatingSideMenu");
    const btnSidePrivacy = document.getElementById("btnSidePrivacy");
    const btnSideTelegram = document.getElementById("btnSideTelegram");
    const btnSideWhatsapp = document.getElementById("btnSideWhatsapp");
    const btnSideShare = document.getElementById("btnSideShare");

    const privacyModal = document.getElementById("privacyModal");
    const btnClosePrivacy = document.getElementById("btnClosePrivacy");
    const privacyCardsContainer = document.getElementById("privacyCardsContainer");

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

    // ==========================================
    // القائمة الجانبية العائمة
    // ==========================================
    btnMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        floatingSideMenu.style.display = (floatingSideMenu.style.display === "none") ? "flex" : "none";
    });

    document.addEventListener("click", (e) => {
        if (!floatingSideMenu.contains(e.target) && e.target !== btnMenu) {
            floatingSideMenu.style.display = "none";
        }
    });

    // 1. فتح نافذة سياسة الخصوصية
    btnSidePrivacy.addEventListener("click", () => {
        floatingSideMenu.style.display = "none";
        renderPrivacyPolicy();
        privacyModal.style.display = "flex";
    });

    btnClosePrivacy.addEventListener("click", () => {
        privacyModal.style.display = "none";
    });

    // 2. الانتقال إلى قناة التيليجرام
    btnSideTelegram.addEventListener("click", () => {
        floatingSideMenu.style.display = "none";
        window.open(TELEGRAM_CHANNEL_URL, "_blank");
    });

    // 3. المشاركة عبر واتساب
    btnSideWhatsapp.addEventListener("click", () => {
        floatingSideMenu.style.display = "none";
        const msg = i18n[isArabic ? "ar" : "en"].shareMessage;
        const whatsappUrl = "https://api.whatsapp.com/send?text=" + encodeURIComponent(msg);
        window.open(whatsappUrl, "_blank");
    });

    // 4. ميزة المشاركة الشاملة (Share)
    btnSideShare.addEventListener("click", async () => {
        floatingSideMenu.style.display = "none";
        const msg = i18n[isArabic ? "ar" : "en"].shareMessage;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "NHN LIVE",
                    text: msg,
                    url: APP_DOWNLOAD_URL
                });
            } catch (err) {}
        } else {
            // بديل عند عدم دعم المتصفح لميزة المشاركة (نسخ الرابط)
            try {
                await navigator.clipboard.writeText(msg);
                alert(isArabic ? "تم نسخ رابط التحميل إلى الحافظة بنجاح!" : "Download link copied to clipboard!");
            } catch (e) {
                window.open(APP_DOWNLOAD_URL, "_blank");
            }
        }
    });

    // ==========================================
    // رسم وعرض بنود سياسة الخصوصية العشرة
    // ==========================================
    function renderPrivacyPolicy() {
        const langKey = isArabic ? "ar" : "en";
        const p = privacyData[langKey];

        document.getElementById("txtPrivacyHeaderTitle").textContent = p.headerTitle;
        document.getElementById("txtPrivacyMainTitle").textContent = p.mainTitle;
        document.getElementById("txtPrivacySubtitle").textContent = p.subtitle;

        privacyCardsContainer.innerHTML = "";

        p.cards.forEach(card => {
            const cardEl = document.createElement("div");
            cardEl.className = "privacy-item-card";

            cardEl.innerHTML = `
                <div class="privacy-card-top">
                    <span class="privacy-card-title">${card.title}</span>
                    <div class="privacy-card-badge">${card.id}</div>
                </div>
                <div class="privacy-card-body">${card.body}</div>
            `;

            privacyCardsContainer.appendChild(cardEl);
        });
    }

    // ==========================================
    // منطق التفعيل وإدخال الأكواد
    // ==========================================
    function unlockApp() {
        localStorage.setItem("NHN_LIVE_LOGGED_IN", "true");
        window.location.href = "matches.html";
    }

    function handlePlayStream(inputVal) {
        const val = inputVal.trim();
        if (val === SECRET_CODE) {
            unlockApp();
            return;
        }

        if (val.startsWith("http://") || val.startsWith("https://")) {
            alert((isArabic ? "جاري تشغيل الرابط: " : "Playing URL: ") + val);
        } else {
            alert(i18n[isArabic ? "ar" : "en"].invalidCodeOrUrl);
        }
    }

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
        if (privacyModal.style.display === "flex") {
            renderPrivacyPolicy();
        }
    }

    tabDirect.addEventListener("click", () => switchTab(0));
    tabWeb.addEventListener("click", () => switchTab(1));
    tabM3u.addEventListener("click", () => switchTab(2));
    tabXtream.addEventListener("click", () => switchTab(3));

    btnPlayNow.addEventListener("click", () => {
        handlePlayStream(etStreamUrl.value);
    });

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

    const savedLang = localStorage.getItem("NHN_LIVE_LANG");
    if (savedLang) {
        applyLanguage(savedLang === "ar");
    } else {
        const userLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
        applyLanguage(userLang.startsWith("ar"));
    }
});