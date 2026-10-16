document.addEventListener("DOMContentLoaded", () => {
    // 1. فحص الحماية: التأكد من تسجيل الدخول بكود 7777
    if (localStorage.getItem("NHN_LIVE_LOGGED_IN") !== "true") {
        window.location.href = "index.html";
        return;
    }

    // الروابط السحابية لملف المباريات على GitHub
    const MATCHES_URL = "https://raw.githubusercontent.com/mbdy08/matches/main/matches.json";
    const MATCHES_BACKUP_URL = "https://cdn.jsdelivr.net/gh/mbdy08/matches@main/matches.json";
    const TELEGRAM_URL = "https://t.me/nhnlive";
    const TELEGRAM_SUPPORT_URL = "https://t.me/nhnlive_support";
    const APP_DOWNLOAD_URL = "https://nhnlive.com/app/app-download.html";

    let allMatches = [];
    let currentDayTab = "today";
    let isArabic = false;
    let isDarkMode = true;
    let currentStreams = { HD: "", SD: "", "4K": "" };
    let currentActiveQuality = "HD";
    let hlsInstance = null;

    // قاموس الترجمة الكامل لصفحة المباريات والإعدادات
    const i18n = {
        en: {
            dir: "ltr",
            yesterday: "Yesterday",
            today: "Today",
            tomorrow: "Tomorrow",
            watchNow: "Watch Now",
            notStarted: "Not Started",
            live: "LIVE",
            finished: "Finished",
            noMatches: "No matches scheduled",
            loading: "Loading matches...",
            matchesNav: "Matches",
            settingsNav: "Settings",
            settingsTitle: "Settings & More",
            generalHeader: "General Settings",
            appHeader: "Application",
            infoHeader: "Information",
            langLabel: "Language",
            themeLabel: "Theme",
            notifLabel: "Notifications",
            downloadApp: "Download App (APK)",
            shareApp: "Share App with Friends",
            appVersion: "App Version",
            aboutUs: "About Us",
            privacyPolicy: "Privacy Policy",
            terms: "Terms of Service",
            contact: "Contact Support & Ads",
            shareMessage: "⚽ Download NHN LIVE app for live match schedules and scores:\n" + APP_DOWNLOAD_URL
        },
        ar: {
            dir: "rtl",
            yesterday: "الأمس",
            today: "اليوم",
            tomorrow: "الغد",
            watchNow: "اضغط هنا للمشاهدة",
            notStarted: "لم يبدأ بعد",
            live: "بث مباشر",
            finished: "انتهت",
            noMatches: "لا توجد مباريات",
            loading: "جاري تحميل جدول المباريات...",
            matchesNav: "المباريات",
            settingsNav: "إعدادات",
            settingsTitle: "الإعدادات والمزيد",
            generalHeader: "الإعدادات العامة",
            appHeader: "التطبيق",
            infoHeader: "معلومات",
            langLabel: "اللغة",
            themeLabel: "المظهر",
            notifLabel: "الإشعارات",
            downloadApp: "تحميل التطبيق (Android APK)",
            shareApp: "مشاركة التطبيق مع الأصدقاء",
            appVersion: "إصدار التطبيق",
            aboutUs: "من نحن",
            privacyPolicy: "سياسة الخصوصية",
            terms: "شروط الاستخدام",
            contact: "اتصل بنا (الدعم الفني والرعايات)",
            shareMessage: "⚽ حمّل الآن تطبيق NHN LIVE لمتابعة المباريات وجداول البث المباشر بأعلى جودة:\n" + APP_DOWNLOAD_URL
        }
    };

    // عناصر الواجهة
    const sectionMatches = document.getElementById("sectionMatches");
    const sectionSettings = document.getElementById("sectionSettings");
    const btnNavMatches = document.getElementById("btnNavMatches");
    const btnNavSettings = document.getElementById("btnNavSettings");

    const tabYesterday = document.getElementById("tabYesterday");
    const tabToday = document.getElementById("tabToday");
    const tabTomorrow = document.getElementById("tabTomorrow");
    const allDayTabs = [tabYesterday, tabToday, tabTomorrow];

    const matchesListContainer = document.getElementById("matchesListContainer");
    const loadingMatches = document.getElementById("loadingMatches");
    const noMatchesBox = document.getElementById("noMatchesBox");
    const btnTopTelegram = document.getElementById("btnTopTelegram");

    // عناصر المشغل المدمج
    const playerOverlayModal = document.getElementById("playerOverlayModal");
    const btnClosePlayer = document.getElementById("btnClosePlayer");
    const hlsVideoPlayer = document.getElementById("hlsVideoPlayer");
    const txtViewersCount = document.getElementById("txtViewersCount");
    const btnQualHd = document.getElementById("btnQualHd");
    const btnQualSd = document.getElementById("btnQualSd");
    const btnQual4k = document.getElementById("btnQual4k");
    const playerBuffering = document.getElementById("playerBuffering");

    // عناصر نافذة المعلومات المنبثقة
    const infoDialogModal = document.getElementById("infoDialogModal");
    const txtDialogTitle = document.getElementById("txtDialogTitle");
    const infoDialogBody = document.getElementById("infoDialogBody");
    const btnCloseInfoDialog = document.getElementById("btnCloseInfoDialog");

    // ==========================================
    // 1. جلب المباريات من السحابة (GitHub JSON)
    // ==========================================
    async function fetchMatches() {
        loadingMatches.style.display = "block";
        matchesListContainer.innerHTML = "";
        noMatchesBox.style.display = "none";

        try {
            const res = await fetch(`${MATCHES_URL}?t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                allMatches = normalizeMatchesData(data);
                filterMatchesByDay(currentDayTab);
            } else {
                throw new Error("Primary fetch failed");
            }
        } catch (e) {
            try {
                const backupRes = await fetch(MATCHES_BACKUP_URL);
                const data = await backupRes.json();
                allMatches = normalizeMatchesData(data);
                filterMatchesByDay(currentDayTab);
            } catch (err) {
                loadingMatches.style.display = "none";
                noMatchesBox.style.display = "block";
            }
        }
    }

    function normalizeMatchesData(list) {
        if (!Array.isArray(list)) return [];
        return list.map(item => {
            const fallbackStream = item.streamUrl || "";
            return {
                day: (item.day || "today").toLowerCase().trim(),
                league: item.leagueName || item.league || "",
                leagueLogo: formatLogoUrl(item.leagueLogo || item.league_logo || ""),
                homeTeam: item.team1Name || item.homeTeam || "",
                homeLogo: formatLogoUrl(item.team1Logo || item.homeLogo || ""),
                awayTeam: item.team2Name || item.awayTeam || "",
                awayLogo: formatLogoUrl(item.team2Logo || item.awayLogo || ""),
                time: item.matchTime || item.time || "",
                status: item.matchStatus || item.status || "",
                streamHd: item.streamHd || fallbackStream,
                streamSd: item.streamSd || "",
                stream4k: item.stream4k || "",
                viewers: item.viewers || "16.8K"
            };
        });
    }

    function formatLogoUrl(url) {
        if (!url || url === "ic_logo") return "https://raw.githubusercontent.com/mbdy08/matches/main/ic_logo.png";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        return "https://raw.githubusercontent.com/mbdy08/matches/main/" + url.replace(/^\/+/, "");
    }

    // ==========================================
    // 2. تصفية وعرض المباريات حسب اليوم
    // ==========================================
    function filterMatchesByDay(day) {
        currentDayTab = day;
        allDayTabs.forEach(tab => {
            tab.classList.toggle("active", tab.getAttribute("data-day") === day);
        });

        loadingMatches.style.display = "none";
        const filtered = allMatches.filter(m => m.day === day);

        if (filtered.length === 0) {
            matchesListContainer.innerHTML = "";
            noMatchesBox.style.display = "block";
            return;
        }

        noMatchesBox.style.display = "none";
        matchesListContainer.innerHTML = "";

        filtered.forEach(match => {
            const card = document.createElement("div");
            card.className = "match-card";

            const isLive = match.status.includes("مباشر") || match.status.toLowerCase().includes("live");
            const statusClass = isLive ? "status-val live" : "status-val";

            card.innerHTML = `
                <div class="match-league-header">
                    ${match.leagueLogo ? `<img src="${match.leagueLogo}" class="league-crest" alt="league" onerror="this.style.display='none'">` : ""}
                    <span class="league-name">${match.league}</span>
                </div>

                <div class="match-teams-row">
                    <div class="team-box">
                        <img src="${match.homeLogo}" class="team-logo" alt="${match.homeTeam}" onerror="this.src='https://raw.githubusercontent.com/mbdy08/matches/main/ic_logo.png'">
                        <span class="team-name">${match.homeTeam}</span>
                    </div>

                    <div class="match-time-box">
                        <span class="time-val">${match.time || "00:00"}</span>
                        <span class="${statusClass}">${match.status || (isArabic ? "لم يبدأ بعد" : "Not Started")}</span>
                    </div>

                    <div class="team-box">
                        <img src="${match.awayLogo}" class="team-logo" alt="${match.awayTeam}" onerror="this.src='https://raw.githubusercontent.com/mbdy08/matches/main/ic_logo.png'">
                        <span class="team-name">${match.awayTeam}</span>
                    </div>
                </div>

                <button class="btn-watch-match" data-hd="${match.streamHd}" data-sd="${match.streamSd}" data-4k="${match.stream4k}" data-viewers="${match.viewers}">
                    <span>${i18n[isArabic ? "ar" : "en"].watchNow}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>
            `;

            card.querySelector(".btn-watch-match").addEventListener("click", function() {
                const streams = {
                    HD: this.getAttribute("data-hd"),
                    SD: this.getAttribute("data-sd"),
                    "4K": this.getAttribute("data-4k")
                };
                const vCount = this.getAttribute("data-viewers");
                openLivePlayer(streams, vCount);
            });

            matchesListContainer.appendChild(card);
        });
    }

    tabYesterday.addEventListener("click", () => filterMatchesByDay("yesterday"));
    tabToday.addEventListener("click", () => filterMatchesByDay("today"));
    tabTomorrow.addEventListener("click", () => filterMatchesByDay("tomorrow"));

    // ==========================================
    // 3. مشغل الفيديو المدمج (HD / SD / 4K)
    // ==========================================
    function openLivePlayer(streams, viewers) {
        currentStreams = streams;
        txtViewersCount.textContent = viewers || "16.8K";
        currentActiveQuality = streams.HD ? "HD" : (streams.SD ? "SD" : "4K");

        playerOverlayModal.style.display = "flex";
        updateQualityButtonsUI();
        playStreamUrl(currentStreams[currentActiveQuality]);
    }

    function playStreamUrl(url) {
        if (!url) {
            alert(isArabic ? "هذه الجودة غير متوفرة لهذا البث" : "This quality stream is not available");
            return;
        }

        playerBuffering.style.display = "block";

        if (Hls.isSupported() && (url.includes(".m3u8") || url.includes(".ts") || !url.includes(".mp4"))) {
            if (hlsInstance) hlsInstance.destroy();
            hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(hlsVideoPlayer);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                playerBuffering.style.display = "none";
                hlsVideoPlayer.play().catch(() => {});
            });
            hlsInstance.on(Hls.Events.ERROR, () => {
                playerBuffering.style.display = "none";
            });
        } else {
            hlsVideoPlayer.src = url;
            hlsVideoPlayer.addEventListener("loadedmetadata", () => {
                playerBuffering.style.display = "none";
                hlsVideoPlayer.play().catch(() => {});
            });
        }
    }

    window.switchStreamQuality = function(q) {
        if (!currentStreams[q]) {
            alert(isArabic ? `جودة ${q} غير متوفرة` : `${q} quality is not available`);
            return;
        }
        currentActiveQuality = q;
        updateQualityButtonsUI();
        playStreamUrl(currentStreams[q]);
    };

    function updateQualityButtonsUI() {
        btnQualHd.classList.toggle("active", currentActiveQuality === "HD");
        btnQualSd.classList.toggle("active", currentActiveQuality === "SD");
        btnQual4k.classList.toggle("active", currentActiveQuality === "4K");
    }

    btnClosePlayer.addEventListener("click", () => {
        playerOverlayModal.style.display = "none";
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
        hlsVideoPlayer.pause();
        hlsVideoPlayer.src = "";
    });

    // ==========================================
    // 4. شريط التنقل السفلي (المباريات vs الإعدادات)
    // ==========================================
    btnNavMatches.addEventListener("click", () => {
        sectionSettings.style.display = "none";
        sectionMatches.style.display = "block";
        btnNavMatches.classList.add("active");
        btnNavSettings.classList.remove("active");
    });

    btnNavSettings.addEventListener("click", () => {
        sectionMatches.style.display = "none";
        sectionSettings.style.display = "block";
        btnNavSettings.classList.add("active");
        btnNavMatches.classList.remove("active");
    });

    // ==========================================
    // 5. تطبيق اللغات والمظهر في الإعدادات
    // ==========================================
    const btnSettingLangEn = document.getElementById("btnSettingLangEn");
    const btnSettingLangAr = document.getElementById("btnSettingLangAr");
    const btnSettingThemeDark = document.getElementById("btnSettingThemeDark");
    const btnSettingThemeLight = document.getElementById("btnSettingThemeLight");
    const btnSettingNotifOn = document.getElementById("btnSettingNotifOn");
    const btnSettingNotifOff = document.getElementById("btnSettingNotifOff");

    function applyLanguage(arabic) {
        isArabic = arabic;
        localStorage.setItem("NHN_LIVE_LANG", isArabic ? "ar" : "en");
        const t = i18n[isArabic ? "ar" : "en"];

        document.documentElement.lang = isArabic ? "ar" : "en";
        document.documentElement.dir = t.dir;

        btnSettingLangAr.classList.toggle("active", isArabic);
        btnSettingLangEn.classList.toggle("active", !isArabic);

        tabYesterday.textContent = t.yesterday;
        tabToday.textContent = t.today;
        tabTomorrow.textContent = t.tomorrow;
        document.getElementById("txtLoading").textContent = t.loading;
        document.getElementById("txtNoMatches").textContent = t.noMatches;

        document.getElementById("txtNavMatches").textContent = t.matchesNav;
        document.getElementById("txtNavSettings").textContent = t.settingsNav;
        document.getElementById("txtSettingsMainTitle").textContent = t.settingsTitle;
        document.getElementById("txtHeaderGeneral").textContent = t.generalHeader;
        document.getElementById("txtLabelLanguage").textContent = t.langLabel;
        document.getElementById("txtLabelTheme").textContent = t.themeLabel;
        document.getElementById("txtLabelNotification").textContent = t.notifLabel;

        document.getElementById("txtHeaderApp").textContent = t.appHeader;
        document.getElementById("txtLabelDownload").textContent = t.downloadApp;
        document.getElementById("txtLabelShare").textContent = t.shareApp;
        document.getElementById("txtLabelVersion").textContent = t.appVersion;

        document.getElementById("txtHeaderInfo").textContent = t.infoHeader;
        document.getElementById("txtLabelAbout").textContent = t.aboutUs;
        document.getElementById("txtLabelPrivacy").textContent = t.privacyPolicy;
        document.getElementById("txtLabelTerms").textContent = t.terms;
        document.getElementById("txtLabelContact").textContent = t.contact;

        filterMatchesByDay(currentDayTab);
    }

    btnSettingLangEn.addEventListener("click", () => applyLanguage(false));
    btnSettingLangAr.addEventListener("click", () => applyLanguage(true));

    // تبديل المظهر Dark / Light
    function applyTheme(dark) {
        isDarkMode = dark;
        localStorage.setItem("NHN_LIVE_THEME", dark ? "dark" : "light");
        document.body.className = dark ? "dark-theme" : "light-theme";
        btnSettingThemeDark.classList.toggle("active", dark);
        btnSettingThemeLight.classList.toggle("active", !dark);
    }

    btnSettingThemeDark.addEventListener("click", () => applyTheme(true));
    btnSettingThemeLight.addEventListener("click", () => applyTheme(false));

    // الإشعارات
    btnSettingNotifOn.addEventListener("click", () => {
        btnSettingNotifOn.classList.add("active");
        btnSettingNotifOff.classList.remove("active");
        alert(isArabic ? "تم تفعيل التنبيهات" : "Notifications enabled");
    });

    btnSettingNotifOff.addEventListener("click", () => {
        btnSettingNotifOff.classList.add("active");
        btnSettingNotifOn.classList.remove("active");
        alert(isArabic ? "تم إيقاف التنبيهات" : "Notifications disabled");
    });

    // مشاركة التطبيق
    document.getElementById("rowShareApp").addEventListener("click", async () => {
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

    document.getElementById("rowDownloadApp").addEventListener("click", () => {
        window.open(APP_DOWNLOAD_URL, "_blank");
    });

    btnTopTelegram.addEventListener("click", () => {
        window.open(TELEGRAM_URL, "_blank");
    });

    document.getElementById("rowContact").addEventListener("click", () => {
        window.open(TELEGRAM_SUPPORT_URL, "_blank");
    });

    // نوافذ المعلومات المنبثقة
    function showInfoModal(title, content) {
        txtDialogTitle.textContent = title;
        infoDialogBody.innerHTML = content;
        infoDialogModal.style.display = "flex";
    }

    document.getElementById("rowAboutUs").addEventListener("click", () => {
        showInfoModal(
            isArabic ? "من نحن" : "About Us",
            isArabic
                ? "منصة NHN LIVE هي مشغل وسائط رياضي متقدم مصمم لعرض جداول مباريات كرة القدم والنتائج المباشرة بأعلى سرعة وكفاءة."
                : "NHN LIVE is an advanced, lightweight sports platform built specifically to deliver real-time football fixtures and streaming."
        );
    });

    document.getElementById("rowPrivacyPolicy").addEventListener("click", () => {
        showInfoModal(
            isArabic ? "سياسة الخصوصية" : "Privacy Policy",
            isArabic
                ? "نحن نحترم خصوصيتك ونلتزم بحمايتها. لا يتطلب التطبيق التسجيل ولا يجمع أسماء أو أرقام هواتف أو بريداً إلكترونياً."
                : "We respect your privacy. The app requires no registration and collects no personal data, names, or emails."
        );
    });

    document.getElementById("rowTerms").addEventListener("click", () => {
        showInfoModal(
            isArabic ? "شروط الاستخدام" : "Terms of Service",
            isArabic
                ? "يعمل الموقع كواجهة عرض ومشغل وسائط ذكي ولا يستضيف أو يبث أي قنوات أو مباريات على سيرفراته الخاصة إطلاقاً."
                : "NHN LIVE functions strictly as a media interface and video player. The platform does NOT host or store any television streams."
        );
    });

    btnCloseInfoDialog.addEventListener("click", () => infoDialogModal.style.display = "none");
    infoDialogModal.addEventListener("click", (e) => {
        if (e.target === infoDialogModal) infoDialogModal.style.display = "none";
    });

    // استعادة الإعدادات المحفوظة
    const savedLang = localStorage.getItem("NHN_LIVE_LANG");
    applyLanguage(savedLang ? savedLang === "ar" : (navigator.language || "").startsWith("ar"));

    const savedTheme = localStorage.getItem("NHN_LIVE_THEME");
    applyTheme(savedTheme !== "light");

    // جلب المباريات
    fetchMatches();
});