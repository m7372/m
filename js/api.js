const WORKER_URL = "https://mo.m737217130.workers.dev/";
const MAIN_API = "https://wecima.bar/api.php";

// الهيدرز الخاصة بالـ API الأساسي
const API_HEADERS = {
    "X-App-Key": "sv_x9k2m7p4q8n3r6t1w5y0z",
    "Accept": "application/json, text/plain, */*",
    "X-Device-ID": "3b29c9ef4e872d8a",
    "User-Agent": "okhttp/4.12.0",
    "X-Device-Name": "Samsung SM-S901B",
    "X-App-Chk": "cebe2159",
    "X-App-Sig": "0de08ec6cd0526dcc699041ed8e6dfb3"
};

async function fetchAPI(action, params = {}) {
    // 1. محاولة جلب البيانات من Worker (لأنه أسرع وبدون CORS)
    try {
        let workerUrl = `${WORKER_URL}?action=${action}`;
        for (let key in params) {
            workerUrl += `&${key}=${encodeURIComponent(params[key])}`;
        }
        
        let response = await fetch(workerUrl);
        if (response.ok) {
            let data = await response.json();
            // تحقق مما إذا كان الرد يحتوي على بيانات صالحة وليس خطأ
            if (data && !data.error && (data.posts || data.results || data.stream || data.categories || data.url)) {
                return data;
            }
        }
    } catch (e) {
        console.warn("Worker failed, trying main API...", e);
    }

    // 2. Fallback: جلب من الـ API الأساسي (عبر CORS Proxy)
    try {
        let apiUrl = `${MAIN_API}?action=${action}`;
        for (let key in params) {
            apiUrl += `&${key}=${encodeURIComponent(params[key])}`;
        }
        
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
        
        let response = await fetch(proxyUrl, { headers: API_HEADERS });
        if (response.ok) {
            return await response.json();
        }
    } catch (e) {
        console.error("Main API failed too", e);
    }

    return null;
}
