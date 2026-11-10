document.addEventListener("DOMContentLoaded", () => {
    const splash = document.getElementById("splash-screen");
    const mainApp = document.getElementById("main-app");
    const moviesGrid = document.getElementById("movies-grid");
    const loading = document.getElementById("loading");
    const searchInput = document.getElementById("search-input");
    const searchBtn = document.getElementById("search-btn");
    const sectionTitle = document.getElementById("main-section-title");

    // 1. إدارة شاشة البداية (Splash)
    const enterSite = () => {
        splash.style.opacity = "0";
        setTimeout(() => {
            splash.classList.add("hidden");
            mainApp.classList.remove("hidden");
            loadLatestMovies(); // تحميل البيانات بعد الدخول
        }, 500);
    };

    splash.addEventListener("click", enterSite);
    document.addEventListener("keydown", (e) => {
        if (!splash.classList.contains("hidden") && (e.key === "Enter" || e.key === " " || e.key === "OK")) {
            enterSite();
        }
    });

    // 2. تحميل أحدث الأفلام
    async function loadLatestMovies() {
        loading.classList.remove("hidden");
        loading.style.display = "block";
        moviesGrid.innerHTML = "";
        sectionTitle.textContent = "أحدث الإضافات";
        
        const data = await fetchAPI("posts", { page: 1 });
        
        if (data && data.posts) {
            renderMovies(data.posts);
        } else {
            moviesGrid.innerHTML = "<p>حدث خطأ في جلب البيانات. تأكد من اتصالك بالإنترنت.</p>";
        }
        loading.style.display = "none";
    }

    // 3. البحث
    async function performSearch() {
        const query = searchInput.value.trim();
        if (!query) return loadLatestMovies();

        loading.style.display = "block";
        moviesGrid.innerHTML = "";
        sectionTitle.textContent = `نتائج البحث عن: ${query}`;

        const data = await fetchAPI("search", { search: query });
        
        if (data && (data.posts || data.results)) {
            renderMovies(data.posts || data.results);
        } else {
            moviesGrid.innerHTML = "<p>لا توجد نتائج مطابقة.</p>";
        }
        loading.style.display = "none";
    }

    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") performSearch();
    });

    // 4. رسم البطاقات
    function renderMovies(posts) {
        posts.forEach(post => {
            const card = document.createElement("div");
            card.className = "movie-card";
            card.tabIndex = 0; // لدعم الريموت
            
            const imgSrc = post.thumbnail || 'https://via.placeholder.com/300x450?text=No+Image';
            card.innerHTML = `
                <img src="${imgSrc}" alt="${post.title}" loading="lazy">
                <div class="card-title">${post.title}</div>
            `;
            
            // عند الضغط (بالماوس أو الريموت OK)
            const openVideo = () => {
                window.location.href = `watch.html?id=${post.realid}&title=${encodeURIComponent(post.title)}`;
            };

            card.addEventListener("click", openVideo);
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter") openVideo();
            });

            moviesGrid.appendChild(card);
        });
    }
});
