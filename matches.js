document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("NHN_LIVE_LOGGED_IN") !== "true") {
        window.location.href = "index.html";
        return;
    }

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
    let uiHideTimer = null;
    let aspectModes = ["contain", "cover", "fill"];
    let currentAspectIndex = 0;

    function showToast(message) {
        let toast = document.getElementById("nhnToast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "nhnToast";
            toast.className = "nhn-toast-msg";
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add("show");
        clearTimeout(toast.timeoutId);
        toast.timeoutId = setTimeout(() => {
            toast.classList.remove("show");
        }, 2400);
    }

    const detailedInfoData = {
        about: {
            en: {
                nav: "About Us",
                hero: "About NHN LIVE",
                sub: "NHN LIVE • Global Sports Platform",
                cards: [
                    { id: "1", title: "Our Platform & Vision", body: "NHN LIVE is an advanced, lightweight sports platform built specifically to deliver real-time football fixtures, kick-off schedules, and scores directly to passionate fans." },
                    { id: "2", title: "Architecture & Speed", body: "Powered by native Android Media3 architecture, NHN LIVE ensures high-efficiency playback while saving phone battery and memory consumption." },
                    { id: "3", title: "Coverage Scope", body: "Comprehensive coverage of premier tournaments including the UEFA Champions League, Premier League, La Liga, and regional championships." }
                ]
            },
            ar: {
                nav: "من نحن",
                hero: "حول منصة NHN LIVE",
                sub: "NHN LIVE • المنصة الرياضية العالمية",
                cards: [
                    { id: "1", title: "رؤيتنا ومنصتنا", body: "منصة NHN LIVE هي منصة رياضية خفيفة ومتطورة صُممت خصيصاً لتقديم جداول مباريات كرة القدم ومواعيد البث المباشر والنتائج بدقة لعشاق كرة القدم." },
                    { id: "2", title: "السرعة والكفاءة", body: "تعتمد المنصة على بنية تشغيل متقدمة تضمن كفاءة البث واستقراره مع الحفاظ التام على أداء البطارية والذاكرة." },
                    { id: "3", title: "نطاق التغطية", body: "تغطية شاملة لأقوى البطولات العالمية والمحلية بما فيها دوري أبطال أوروبا، الدوري الإنجليزي، الدوري الإسباني، والبطولات الإقليمية." }
                ]
            }
        },
        terms: {
            en: {
                nav: "Terms of Service",
                hero: "Terms of Service & Disclaimer",
                sub: "NHN LIVE • Legal Terms",
                cards: [
                    { id: "1", title: "Media Interface", body: "NHN LIVE functions strictly as a smart video player interface and match schedule indexer." },
                    { id: "2", title: "No Content Hosting", body: "The platform does NOT host, stream, record, or store any television channels or copyrighted streams on its own servers." },
                    { id: "3", title: "External Sources", body: "All stream links are indexed from publicly accessible external web networks without direct liability." },
                    { id: "4", title: "Trademarks & IP", body: "All team crests, competition logos, and club names remain the exclusive intellectual property of their respective trademark holders." }
                ]
            },
            ar: {
                nav: "شروط الاستخدام",
                hero: "شروط الاستخدام وإخلاء المسؤولية",
                sub: "NHN LIVE • الشروط القانونية",
                cards: [
                    { id: "1", title: "واجهة وسائط ذكية", body: "تعمل منصة NHN LIVE حصرياً كواجهة عرض لمشغل الفيديو وفهرس لجداول المباريات الرياضية." },
                    { id: "2", title: "عدم استضافة المحتوى", body: "المنصة لا تستضيف ولا تبث ولا تسجل أو تخزن أي قنوات تلفزيونية أو بثوث محمية بحقوق النشر على خوادمها الخاصة." },
                    { id: "3", title: "المصادر الخارجية", body: "جميع روابط البث مفهرسة ومجلوبة من شبكات إنترنت عامة ومتاحة للعموم دون أي مسؤولية مباشرة." },
                    { id: "4", title: "العلامات التجارية والملكية", body: "جميع شعارات الأندية والبطولات والأسماء هي ملكية فكرية حصرية لمالكيها وعلاماتها التجارية الرسمية." }
                ]
            }
        },
        privacy: {
            en: {
                nav: "Privacy Policy",
                hero: "Privacy Policy",
                sub: "NHN LIVE • Last updated: September 2026",
                cards: [
                    { id: "1", title: "Introduction", body: "We respect your privacy and are committed to protecting it. This policy clarifies how data is handled when you use NHN LIVE." },
                    { id: "2", title: "Data We Process", body: "The app requires no registration and does not collect names, phone numbers, or emails. Minimal anonymous technical diagnostics may be processed to optimize streaming." },
                    { id: "3", title: "Permissions Required", body: "• Internet: Necessary for stream playback.\n• Storage: For saving optional preferences locally." },
                    { id: "4", title: "Data Utilization", body: "To deliver and optimize application performance. We never sell, rent, or trade your data with external third parties." },
                    { id: "5", title: "Third-Party Feeds", body: "The app may display media feeds from external public sources which operate under their own independent privacy terms." },
                    { id: "6", title: "Intellectual Property", body: "NHN LIVE operates solely as a media display tool and does not claim ownership of external broadcasts." },
                    { id: "7", title: "Data Security", body: "We implement standard technical measures to maintain connection integrity and protect local preference configurations." },
                    { id: "8", title: "Children's Privacy", body: "The application is not directed at children under the age of 13, and no personal data is knowingly solicited." },
                    { id: "9", title: "Your Controls", body: "You can clear cached data anytime via browser settings or storage." },
                    { id: "10", title: "Policy Updates", body: "Any updates to this policy are reflected here immediately. Continued usage represents agreement to updated terms." }
                ]
            },
            ar: {
                nav: "سياسة الخصوصية",
                hero: "سياسة الخصوصية",
                sub: "NHN LIVE • آخر تحديث: سبتمبر 2026",
                cards: [
                    { id: "1", title: "مقدمة", body: "نحترم خصوصيتك ونلتزم بحمايتها. توضّح هذه السياسة كيفية التعامل مع البيانات عند استخدامك للمنصة." },
                    { id: "2", title: "البيانات التي نجمعها", body: "لا تتطلب المنصة التسجيل ولا تجمع أي أسماء أو أرقام هواتف أو بريداً إلكترونياً." },
                    { id: "3", title: "الأذونات المطلوبة", body: "• الإنترنت: ضروري لتحميل جدول المباريات وتشغيل البث.\n• الذاكرة المحلية: لحفظ تفضيلاتك من الوضع واللغة." },
                    { id: "4", title: "استخدام البيانات", body: "لتحسين الأداء وضمان سرعة العرض. لا نقوم ببيع أو مشاركة أي بيانات مع أطراف ثالثة." },
                    { id: "5", title: "المصادر الخارجية", body: "قد تعرض المنصة خلاصات ومصادر خارجية تعمل بموجب سياسات خصوصيتها المستقلة." },
                    { id: "6", title: "الملكية الفكرية", body: "تعمل المنصة كأداة عرض ولا تدعي ملكية أي بث خارجي أو علامة تجارية." },
                    { id: "7", title: "أمان البيانات", body: "نعتمد معايير أمان قياسية وتشفير اتصالات لحماية استقرار المنصة." },
                    { id: "8", title: "خصوصية الأطفال", body: "التطبيق والمنصة غير موجهين لمن هم دون 13 عاماً." },
                    { id: "9", title: "التحكم بالبيانات", body: "يمكنك مسح البيانات المحفوظة محلياً في أي وقت بمسح كاش المتصفح." },
                    { id: "10", title: "تحديث السياسة", body: "أي تحديث يتم نشره هنا فوراً ويُعد استمرارك موافقة على التحديثات." }
                ]
            }
        }
    };

    const i18n = {
        en: {
            dir: "ltr",
            yesterday: "Yesterday",
            today: "Today",
            tomorrow: "Tomorrow",
            watchNow: "Watch Now",
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
            downloadApp: "Download App (APK)",
            shareApp: "Share App with Friends",
            appVersion: "App Version",
            aboutUs: "About Us",
            privacyPolicy: "Privacy Policy",
            terms: "Terms of Service",
            contact: "Contact Support & Ads",
            servers: "Servers",
            shareMessage: "⚽ Download NHN LIVE app for live match schedules:\n" + APP_DOWNLOAD_URL
        },
        ar: {
            dir: "rtl",
            yesterday: "الأمس",
            today: "اليوم",
            tomorrow: "الغد",
            watchNow: "اضغط هنا للمشاهدة",
            noMatches: "لا توجد مباريات مجدولة",
            loading: "جاري تحميل جدول المباريات...",
            matchesNav: "المباريات",
            settingsNav: "إعدادات",
            settingsTitle: "الإعدادات والمزيد",
            generalHeader: "الإعدادات العامة",
            appHeader: "التطبيق",
            infoHeader: "معلومات",
            langLabel: "اللغة",
            themeLabel: "المظهر",
            downloadApp: "تحميل التطبيق (Android APK)",
            shareApp: "مشاركة التطبيق مع الأصدقاء",
            appVersion: "إصدار التطبيق",
            aboutUs: "من نحن",
            privacyPolicy: "سياسة الخصوصية",
            terms: "شروط الاستخدام",
            contact: "اتصل بنا (الدعم الفني والرعايات)",
            servers: "الخوادم",
            shareMessage: "⚽ حمّل الآن تطبيق NHN LIVE لمتابعة المباريات وجداول البث المباشر بأعلى جودة:\n" + APP_DOWNLOAD_URL
        }
    };

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

    const playerOverlayModal = document.getElementById("playerOverlayModal");
    const videoContainerBox = document.getElementById("videoContainerBox");
    const hlsVideoPlayer = document.getElementById("hlsVideoPlayer");
    const playerBuffering = document.getElementById("playerBuffering");
    const btnClosePlayer = document.getElementById("btnClosePlayer");
    const btnPlayerRefresh = document.getElementById("btnPlayerRefresh");
    const btnReloadServer = document.getElementById("btnReloadServer");
    const txtPlayerChannelTitle = document.getElementById("txtPlayerChannelTitle");

    const dramaServersCapsule = document.getElementById("dramaServersCapsule");
    const dramaBottomControls = document.getElementById("dramaBottomControls");
    const scrubContainer = document.getElementById("scrubContainer");

    const btnQualHd = document.getElementById("btnQualHd");
    const btnQualSd = document.getElementById("btnQualSd");
    const btnQual4k = document.getElementById("btnQual4k");
    const txtViewersCount = document.getElementById("txtViewersCount");

    const btnTogglePlay = document.getElementById("btnTogglePlay");
    const iconPlay = document.getElementById("iconPlay");
    const iconPause = document.getElementById("iconPause");

    const btnAspectRatio = document.getElementById("btnAspectRatio");
    const btnCenterAlign = document.getElementById("btnCenterAlign");
    const btnOrientationToggle = document.getElementById("btnOrientationToggle");
    const btnToggleMute = document.getElementById("btnToggleMute");

    async function fetchMatches() {
        if (loadingMatches) loadingMatches.style.display = "block";
        if (matchesListContainer) matchesListContainer.innerHTML = "";
        if (noMatchesBox) noMatchesBox.style.display = "none";

        try {
            const res = await fetch(`${MATCHES_URL}?t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                allMatches = normalizeMatchesData(data);
                filterMatchesByDay(currentDayTab);
            } else {
                throw new Error("Primary failed");
            }
        } catch (e) {
            try {
                const backupRes = await fetch(MATCHES_BACKUP_URL);
                const data = await backupRes.json();
                allMatches = normalizeMatchesData(data);
                filterMatchesByDay(currentDayTab);
            } catch (err) {
                if (loadingMatches) loadingMatches.style.display = "none";
                if (noMatchesBox) noMatchesBox.style.display = "block";
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
                viewers: item.viewers || "12"
            };
        });
    }

    function formatLogoUrl(url) {
        if (!url || url === "ic_logo") return "https://raw.githubusercontent.com/mbdy08/matches/main/ic_logo.png";
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        return "https://raw.githubusercontent.com/mbdy08/matches/main/" + url.replace(/^\/+/, "");
    }

    function filterMatchesByDay(day) {
        currentDayTab = day;
        allDayTabs.forEach(tab => {
            if (tab) tab.classList.toggle("active", tab.getAttribute("data-day") === day);
        });

        if (loadingMatches) loadingMatches.style.display = "none";
        const filtered = allMatches.filter(m => m.day === day);

        if (filtered.length === 0) {
            if (matchesListContainer) matchesListContainer.innerHTML = "";
            if (noMatchesBox) noMatchesBox.style.display = "block";
            return;
        }

        if (noMatchesBox) noMatchesBox.style.display = "none";
        if (matchesListContainer) {
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

                    <button class="btn-watch-match" data-hd="${match.streamHd}" data-sd="${match.streamSd}" data-4k="${match.stream4k}" data-viewers="${match.viewers}" data-title="${match.homeTeam} - ${match.awayTeam} | ${match.league}">
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
                    const mTitle = this.getAttribute("data-title");
                    openDramaLivePlayer(streams, vCount, mTitle);
                });

                matchesListContainer.appendChild(card);
            });
        }
    }

    if (tabYesterday) tabYesterday.addEventListener("click", () => filterMatchesByDay("yesterday"));
    if (tabToday) tabToday.addEventListener("click", () => filterMatchesByDay("today"));
    if (tabTomorrow) tabTomorrow.addEventListener("click", () => filterMatchesByDay("tomorrow"));

    function openDramaLivePlayer(streams, viewers, title) {
        currentStreams = streams;
        if (txtViewersCount) txtViewersCount.textContent = viewers || "12";
        if (txtPlayerChannelTitle) txtPlayerChannelTitle.textContent = title || "NHN LIVE Stream";
        currentActiveQuality = streams.HD ? "HD" : (streams.SD ? "SD" : "4K");

        if (playerOverlayModal) playerOverlayModal.style.display = "flex";
        updateQualityButtonsUI();
        playStreamUrl(currentStreams[currentActiveQuality]);
        scheduleControlsFade();
    }

    function playStreamUrl(url) {
        if (!url) {
            showToast(isArabic ? "هذه الجودة غير متوفرة لهذا البث" : "This quality stream is not available");
            return;
        }

        // تحويل مسار البث تلقائياً إلى سيرفر toto10 المحمي الخاص بالموقع
        url = url.replace(/ouou1/g, "uouo2");

        if (playerBuffering) playerBuffering.style.display = "block";

        if (window.Hls && Hls.isSupported() && (url.includes(".m3u8") || url.includes(".ts") || !url.includes(".mp4"))) {
            if (hlsInstance) hlsInstance.destroy();
            hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(hlsVideoPlayer);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                if (playerBuffering) playerBuffering.style.display = "none";
                hlsVideoPlayer.play().catch(() => {});
                updatePlayPauseState(false);
            });
            hlsInstance.on(Hls.Events.ERROR, () => {
                if (playerBuffering) playerBuffering.style.display = "none";
            });
        } else if (hlsVideoPlayer) {
            hlsVideoPlayer.src = url;
            hlsVideoPlayer.addEventListener("loadedmetadata", () => {
                if (playerBuffering) playerBuffering.style.display = "none";
                hlsVideoPlayer.play().catch(() => {});
                updatePlayPauseState(false);
            });
        }
    }

    window.switchStreamQuality = function(q) {
        if (!currentStreams[q]) {
            showToast(isArabic ? `جودة ${q} غير متوفرة` : `${q} quality is not available`);
            return;
        }
        currentActiveQuality = q;
        updateQualityButtonsUI();
        playStreamUrl(currentStreams[q]);
    };

    function updateQualityButtonsUI() {
        if (btnQualHd) btnQualHd.classList.toggle("active", currentActiveQuality === "HD");
        if (btnQualSd) btnQualSd.classList.toggle("active", currentActiveQuality === "SD");
        if (btnQual4k) btnQual4k.classList.toggle("active", currentActiveQuality === "4K");
    }

    if (btnClosePlayer) {
        btnClosePlayer.addEventListener("click", () => {
            if (playerOverlayModal) playerOverlayModal.style.display = "none";
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
            if (hlsVideoPlayer) {
                hlsVideoPlayer.pause();
                hlsVideoPlayer.src = "";
            }
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        });
    }

    function reloadCurrentStream() {
        if (currentStreams[currentActiveQuality]) {
            playStreamUrl(currentStreams[currentActiveQuality]);
            showToast(isArabic ? "تم تحديث البث" : "Stream refreshed");
        }
    }
    if (btnPlayerRefresh) btnPlayerRefresh.addEventListener("click", reloadCurrentStream);
    if (btnReloadServer) btnReloadServer.addEventListener("click", reloadCurrentStream);

    function updatePlayPauseState(isPaused) {
        if (iconPlay) iconPlay.style.display = isPaused ? "block" : "none";
        if (iconPause) iconPause.style.display = isPaused ? "none" : "block";
    }

    if (btnTogglePlay) {
        btnTogglePlay.addEventListener("click", (e) => {
            e.stopPropagation();
            if (hlsVideoPlayer.paused) {
                hlsVideoPlayer.play();
                updatePlayPauseState(false);
            } else {
                hlsVideoPlayer.pause();
                updatePlayPauseState(true);
            }
            scheduleControlsFade();
        });
    }

    if (btnToggleMute) {
        btnToggleMute.addEventListener("click", (e) => {
            e.stopPropagation();
            hlsVideoPlayer.muted = !hlsVideoPlayer.muted;
            btnToggleMute.classList.toggle("muted", hlsVideoPlayer.muted);
            scheduleControlsFade();
        });
    }

    if (btnAspectRatio) {
        btnAspectRatio.addEventListener("click", (e) => {
            e.stopPropagation();
            currentAspectIndex = (currentAspectIndex + 1) % aspectModes.length;
            const chosen = aspectModes[currentAspectIndex];
            hlsVideoPlayer.style.objectFit = chosen;
            const namesAr = { contain: "الحجم الأصلي (Fit)", cover: "ملء الشاشة (Cover)", fill: "تمديد (Stretch)" };
            const namesEn = { contain: "Original (Fit)", cover: "Full Screen (Cover)", fill: "Stretch" };
            showToast(isArabic ? namesAr[chosen] : namesEn[chosen]);
            scheduleControlsFade();
        });
    }

    // زر التوسيع وملء الشاشة العلوي
    if (btnCenterAlign) {
        btnCenterAlign.addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
                if (!document.fullscreenElement) {
                    if (videoContainerBox.requestFullscreen) {
                        await videoContainerBox.requestFullscreen();
                    } else if (hlsVideoPlayer.webkitEnterFullscreen) {
                        hlsVideoPlayer.webkitEnterFullscreen();
                    }
                    if (screen.orientation && screen.orientation.lock) {
                        await screen.orientation.lock("landscape").catch(() => {});
                    }
                }
            } catch (err) {}

            if (hlsVideoPlayer.style.objectFit === "fill") {
                hlsVideoPlayer.style.objectFit = "contain";
                showToast(isArabic ? "الحجم الأصلي (Fit)" : "Original Size");
            } else {
                hlsVideoPlayer.style.objectFit = "fill";
                showToast(isArabic ? "تم ملء الشاشة بالكامل" : "Full Screen Fill");
            }

            scheduleControlsFade();
        });
    }

    if (btnOrientationToggle) {
        btnOrientationToggle.addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
                if (!document.fullscreenElement) {
                    if (videoContainerBox.requestFullscreen) {
                        await videoContainerBox.requestFullscreen();
                    } else if (hlsVideoPlayer.webkitEnterFullscreen) {
                        hlsVideoPlayer.webkitEnterFullscreen();
                    }
                    if (screen.orientation && screen.orientation.lock) {
                        await screen.orientation.lock("landscape").catch(() => {});
                    }
                } else {
                    await document.exitFullscreen();
                    if (screen.orientation && screen.orientation.unlock) {
                        screen.orientation.unlock();
                    }
                }
            } catch (err) {}
            scheduleControlsFade();
        });
    }

    function scheduleControlsFade() {
        if (dramaServersCapsule) dramaServersCapsule.classList.remove("controls-fade-out");
        if (dramaBottomControls) dramaBottomControls.classList.remove("controls-fade-out");
        if (scrubContainer) scrubContainer.classList.remove("controls-fade-out");
        clearTimeout(uiHideTimer);
        uiHideTimer = setTimeout(() => {
            if (!hlsVideoPlayer.paused) {
                if (dramaServersCapsule) dramaServersCapsule.classList.add("controls-fade-out");
                if (dramaBottomControls) dramaBottomControls.classList.add("controls-fade-out");
                if (scrubContainer) scrubContainer.classList.add("controls-fade-out");
            }
        }, 4500);
    }

    if (videoContainerBox) {
        videoContainerBox.addEventListener("click", (e) => {
            if (e.target === videoContainerBox || e.target === hlsVideoPlayer) {
                const isHidden = dramaServersCapsule && dramaServersCapsule.classList.contains("controls-fade-out");
                if (isHidden) {
                    scheduleControlsFade();
                } else {
                    if (dramaServersCapsule) dramaServersCapsule.classList.add("controls-fade-out");
                    if (dramaBottomControls) dramaBottomControls.classList.add("controls-fade-out");
                    if (scrubContainer) scrubContainer.classList.add("controls-fade-out");
                }
            } else {
                scheduleControlsFade();
            }
        });
    }

    if (btnNavMatches) {
        btnNavMatches.addEventListener("click", () => {
            if (sectionSettings) sectionSettings.style.display = "none";
            if (sectionMatches) sectionMatches.style.display = "block";
            btnNavMatches.classList.add("active");
            if (btnNavSettings) btnNavSettings.classList.remove("active");
        });
    }

    if (btnNavSettings) {
        btnNavSettings.addEventListener("click", () => {
            if (sectionMatches) sectionMatches.style.display = "none";
            if (sectionSettings) sectionSettings.style.display = "block";
            btnNavSettings.classList.add("active");
            if (btnNavMatches) btnNavMatches.classList.remove("active");
        });
    }

    const fullInfoOverlay = document.getElementById("fullInfoOverlay");
    const btnCloseFullInfo = document.getElementById("btnCloseFullInfo");
    const txtInfoNavTitle = document.getElementById("txtInfoNavTitle");
    const txtInfoHeroTitle = document.getElementById("txtInfoHeroTitle");
    const txtInfoHeroSubtitle = document.getElementById("txtInfoHeroSubtitle");
    const infoCardsList = document.getElementById("infoCardsList");

    function openDetailedSection(key) {
        const langKey = isArabic ? "ar" : "en";
        const data = detailedInfoData[key][langKey];

        if (txtInfoNavTitle) txtInfoNavTitle.textContent = data.nav;
        if (txtInfoHeroTitle) txtInfoHeroTitle.textContent = data.hero;
        if (txtInfoHeroSubtitle) txtInfoHeroSubtitle.textContent = data.sub;

        if (infoCardsList) {
            infoCardsList.innerHTML = "";
            data.cards.forEach(card => {
                const cardEl = document.createElement("div");
                cardEl.className = "info-card-item";
                cardEl.innerHTML = `
                    <div class="info-card-head">
                        <span class="info-card-title">${card.title}</span>
                        <div class="info-card-badge">${card.id}</div>
                    </div>
                    <div class="info-card-body">${card.body}</div>
                `;
                infoCardsList.appendChild(cardEl);
            });
        }

        if (fullInfoOverlay) fullInfoOverlay.style.display = "flex";
    }

    if (btnCloseFullInfo) {
        btnCloseFullInfo.addEventListener("click", () => {
            if (fullInfoOverlay) fullInfoOverlay.style.display = "none";
        });
    }

    const rowAbout = document.getElementById("rowAboutUs");
    if (rowAbout) rowAbout.addEventListener("click", () => openDetailedSection("about"));
    const rowPrivacy = document.getElementById("rowPrivacyPolicy");
    if (rowPrivacy) rowPrivacy.addEventListener("click", () => openDetailedSection("privacy"));
    const rowTerms = document.getElementById("rowTerms");
    if (rowTerms) rowTerms.addEventListener("click", () => openDetailedSection("terms"));

    const contactModalDialog = document.getElementById("contactModalDialog");
    const rowContact = document.getElementById("rowContact");
    if (rowContact) {
        rowContact.addEventListener("click", () => {
            if (contactModalDialog) contactModalDialog.style.display = "flex";
        });
    }

    if (contactModalDialog) {
        contactModalDialog.addEventListener("click", (e) => {
            if (e.target === contactModalDialog) contactModalDialog.style.display = "none";
        });
    }

    const btnContactTelegram = document.getElementById("btnContactTelegram");
    if (btnContactTelegram) {
        btnContactTelegram.addEventListener("click", () => {
            if (contactModalDialog) contactModalDialog.style.display = "none";
            window.open(TELEGRAM_SUPPORT_URL, "_blank");
        });
    }

    const btnContactEmail = document.getElementById("btnContactEmail");
    if (btnContactEmail) {
        btnContactEmail.addEventListener("click", () => {
            if (contactModalDialog) contactModalDialog.style.display = "none";
            window.location.href = "mailto:admin@nhnlive.com";
        });
    }

    const btnSettingLangEn = document.getElementById("btnSettingLangEn");
    const btnSettingLangAr = document.getElementById("btnSettingLangAr");
    const btnSettingThemeDark = document.getElementById("btnSettingThemeDark");
    const btnSettingThemeLight = document.getElementById("btnSettingThemeLight");

    function applyLanguage(arabic) {
        isArabic = arabic;
        localStorage.setItem("NHN_LIVE_LANG", isArabic ? "ar" : "en");
        const t = i18n[isArabic ? "ar" : "en"];

        document.documentElement.lang = isArabic ? "ar" : "en";
        document.documentElement.dir = t.dir;

        if (btnSettingLangAr) btnSettingLangAr.classList.toggle("active", isArabic);
        if (btnSettingLangEn) btnSettingLangEn.classList.toggle("active", !isArabic);

        if (tabYesterday) tabYesterday.textContent = t.yesterday;
        if (tabToday) tabToday.textContent = t.today;
        if (tabTomorrow) tabTomorrow.textContent = t.tomorrow;
        const txtLoading = document.getElementById("txtLoading");
        if (txtLoading) txtLoading.textContent = t.loading;
        const txtNoMatches = document.getElementById("txtNoMatches");
        if (txtNoMatches) txtNoMatches.textContent = t.noMatches;

        const txtNavMatches = document.getElementById("txtNavMatches");
        if (txtNavMatches) txtNavMatches.textContent = t.matchesNav;
        const txtNavSettings = document.getElementById("txtNavSettings");
        if (txtNavSettings) txtNavSettings.textContent = t.settingsNav;
        const txtSettingsMainTitle = document.getElementById("txtSettingsMainTitle");
        if (txtSettingsMainTitle) txtSettingsMainTitle.textContent = t.settingsTitle;
        const txtHeaderGeneral = document.getElementById("txtHeaderGeneral");
        if (txtHeaderGeneral) txtHeaderGeneral.textContent = t.generalHeader;
        const txtLabelLanguage = document.getElementById("txtLabelLanguage");
        if (txtLabelLanguage) txtLabelLanguage.textContent = t.langLabel;
        const txtLabelTheme = document.getElementById("txtLabelTheme");
        if (txtLabelTheme) txtLabelTheme.textContent = t.themeLabel;

        const txtHeaderApp = document.getElementById("txtHeaderApp");
        if (txtHeaderApp) txtHeaderApp.textContent = t.appHeader;
        const txtLabelDownload = document.getElementById("txtLabelDownload");
        if (txtLabelDownload) txtLabelDownload.textContent = t.downloadApp;
        const txtLabelShare = document.getElementById("txtLabelShare");
        if (txtLabelShare) txtLabelShare.textContent = t.shareApp;
        const txtLabelVersion = document.getElementById("txtLabelVersion");
        if (txtLabelVersion) txtLabelVersion.textContent = t.appVersion;

        const txtHeaderInfo = document.getElementById("txtHeaderInfo");
        if (txtHeaderInfo) txtHeaderInfo.textContent = t.infoHeader;
        const txtLabelAbout = document.getElementById("txtLabelAbout");
        if (txtLabelAbout) txtLabelAbout.textContent = t.aboutUs;
        const txtLabelPrivacy = document.getElementById("txtLabelPrivacy");
        if (txtLabelPrivacy) txtLabelPrivacy.textContent = t.privacyPolicy;
        const txtLabelTerms = document.getElementById("txtLabelTerms");
        if (txtLabelTerms) txtLabelTerms.textContent = t.terms;
        const txtLabelContact = document.getElementById("txtLabelContact");
        if (txtLabelContact) txtLabelContact.textContent = t.contact;

        const lblServersTxt = document.getElementById("lblServersTxt");
        if (lblServersTxt) lblServersTxt.textContent = t.servers;

        filterMatchesByDay(currentDayTab);
    }

    if (btnSettingLangEn) btnSettingLangEn.addEventListener("click", () => applyLanguage(false));
    if (btnSettingLangAr) btnSettingLangAr.addEventListener("click", () => applyLanguage(true));

    function applyTheme(dark) {
        isDarkMode = dark;
        localStorage.setItem("NHN_LIVE_THEME", dark ? "dark" : "light");
        document.body.className = dark ? "dark-theme" : "light-theme";
        if (btnSettingThemeDark) btnSettingThemeDark.classList.toggle("active", dark);
        if (btnSettingThemeLight) btnSettingThemeLight.classList.toggle("active", !dark);
    }

    if (btnSettingThemeDark) btnSettingThemeDark.addEventListener("click", () => applyTheme(true));
    if (btnSettingThemeLight) btnSettingThemeLight.addEventListener("click", () => applyTheme(false));

    const rowShare = document.getElementById("rowShareApp");
    if (rowShare) {
        rowShare.addEventListener("click", async () => {
            const msg = i18n[isArabic ? "ar" : "en"].shareMessage;
            if (navigator.share) {
                try {
                    await navigator.share({ title: "NHN LIVE", text: msg, url: APP_DOWNLOAD_URL });
                } catch (err) {}
            } else {
                navigator.clipboard.writeText(msg);
                showToast(isArabic ? "تم نسخ رابط التحميل" : "Download link copied");
            }
        });
    }

    const rowDownload = document.getElementById("rowDownloadApp");
    if (rowDownload) {
        rowDownload.addEventListener("click", () => {
            window.open(APP_DOWNLOAD_URL, "_blank");
        });
    }

    if (btnTopTelegram) {
        btnTopTelegram.addEventListener("click", () => {
            window.open(TELEGRAM_URL, "_blank");
        });
    }

    const savedLang = localStorage.getItem("NHN_LIVE_LANG");
    applyLanguage(savedLang ? savedLang === "ar" : (navigator.language || "").startsWith("ar"));

    const savedTheme = localStorage.getItem("NHN_LIVE_THEME");
    applyTheme(savedTheme !== "light");

    fetchMatches();
});