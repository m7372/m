document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get("id");
    const videoTitle = urlParams.get("title") || "مشاهدة";
    
    document.getElementById("video-title").textContent = decodeURIComponent(videoTitle);

    const video = document.getElementById("main-video");
    const videoWrapper = document.getElementById("video-wrapper");
    const loader = document.getElementById("player-loader");
    const playPauseBtn = document.getElementById("play-pause-btn");
    const progressBar = document.getElementById("progress-bar");
    const timeDisplay = document.getElementById("time-display");
    const muteBtn = document.getElementById("mute-btn");
    const volumeBar = document.getElementById("volume-bar");
    const speedSelect = document.getElementById("speed-select");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const backBtn = document.getElementById("back-btn");
    const controls = document.getElementById("controls");

    let hls = null;
    let hideControlsTimeout;

    // زر الرجوع (يدعم الريموت)
    backBtn.addEventListener("click", () => history.back());

    // 1. جلب رابط الفيديو (Stream)
    async function loadStream() {
        loader.style.display = "block";
        const data = await fetchAPI("stream", { realid: videoId });
        
        // استخراج الرابط بذكاء (سواء من Worker أو الـ API الأصلي)
        let streamUrl = null;
        if (data) {
            if (typeof data === 'string') {
                streamUrl = data;
            } else {
                streamUrl = data.url || data.stream || data.m3u8 || (data.data && data.data.url);
            }
        }

        if (streamUrl) {
            initPlayer(streamUrl);
        } else {
            loader.textContent = "عذراً، رابط المشاهدة غير متوفر حالياً.";
        }
    }

    // 2. تهيئة المشغل
    function initPlayer(url) {
        loader.style.display = "none";
        
        if (window.Hls && Hls.isSupported() && url.includes(".m3u8")) {
            hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(e => console.log("Autoplay blocked"));
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // لدعم Safari / iOS
            video.src = url;
            video.addEventListener('loadedmetadata', () => {
                video.play().catch(e => console.log("Autoplay blocked"));
            });
        } else {
            video.src = url;
            video.play().catch(e => console.log("Autoplay blocked"));
        }
    }

    loadStream();

    // 3. أحداث الفيديو والتحكم
    video.addEventListener("click", togglePlay);
    video.addEventListener("dblclick", toggleFullscreen);
    
    playPauseBtn.addEventListener("click", togglePlay);
    video.addEventListener("play", () => playPauseBtn.textContent = "⏸️");
    video.addEventListener("pause", () => playPauseBtn.textContent = "▶️");

    function togglePlay() {
        if (video.paused) video.play();
        else video.pause();
    }

    // شريط التقدم
    video.addEventListener("timeupdate", () => {
        if (!video.duration) return;
        const percent = (video.currentTime / video.duration) * 100;
        progressBar.value = percent;
        timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    });

    progressBar.addEventListener("input", () => {
        const time = (progressBar.value / 100) * video.duration;
        video.currentTime = time;
    });

    // الصوت
    muteBtn.addEventListener("click", () => {
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? "🔇" : "🔊";
    });
    
    volumeBar.addEventListener("input", () => {
        video.volume = volumeBar.value;
        video.muted = video.volume === 0;
        muteBtn.textContent = video.muted ? "🔇" : "🔊";
    });

    // السرعة
    speedSelect.addEventListener("change", () => {
        video.playbackRate = parseFloat(speedSelect.value);
    });

    // ملء الشاشة
    fullscreenBtn.addEventListener("click", toggleFullscreen);
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (videoWrapper.requestFullscreen) {
                videoWrapper.requestFullscreen().catch(err => console.log(err));
            } else if (videoWrapper.webkitRequestFullscreen) {
                videoWrapper.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    // إخفاء/إظهار عناصر التحكم تلقائياً
    function showControls() {
        controls.classList.add("active");
        clearTimeout(hideControlsTimeout);
        hideControlsTimeout = setTimeout(() => {
            if (!video.paused) controls.classList.remove("active");
        }, 3000);
    }

    videoWrapper.addEventListener("mousemove", showControls);
    videoWrapper.addEventListener("touchstart", showControls);

    // --- اختصارات الريموت ولوحة المفاتيح ---
    document.addEventListener("keydown", (e) => {
        showControls();
        switch(e.key) {
            case " ":
            case "Enter":
            case "MediaPlayPause":
                e.preventDefault();
                togglePlay();
                break;
            case "ArrowRight":
                e.preventDefault();
                video.currentTime = Math.min(video.currentTime + 10, video.duration);
                break;
            case "ArrowLeft":
                e.preventDefault();
                video.currentTime = Math.max(video.currentTime - 10, 0);
                break;
            case "ArrowUp":
                e.preventDefault();
                video.volume = Math.min(video.volume + 0.1, 1);
                volumeBar.value = video.volume;
                break;
            case "ArrowDown":
                e.preventDefault();
                video.volume = Math.max(video.volume - 0.1, 0);
                volumeBar.value = video.volume;
                break;
            case "f":
            case "F":
                toggleFullscreen();
                break;
            case "m":
            case "M":
                video.muted = !video.muted;
                muteBtn.textContent = video.muted ? "🔇" : "🔊";
                break;
            case "Escape":
            case "Backspace":
                history.back(); // يدعم زر الرجوع في الريموت
                break;
        }
    });

    // دالة مساعدة لتنسيق الوقت
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        const mStr = m.toString().padStart(h > 0 ? 2 : 1, '0');
        const sStr = s.toString().padStart(2, '0');
        return h > 0 ? `${h}:${mStr}:${sStr}` : `${mStr}:${sStr}`;
    }
});
