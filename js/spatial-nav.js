// محرك تنقل ذكي بالأسهم (Spatial Navigation) لدعم أجهزة التلفاز والريموت
document.addEventListener("keydown", (e) => {
    const keys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (!keys.includes(e.key)) return;

    // لا نريد تعطيل الأسهم إذا كان المستخدم يكتب في مربع البحث
    if (document.activeElement.tagName === "INPUT" && document.activeElement.type === "text") {
        return; 
    }
    
    // ولا في شريط الصوت
    if (document.activeElement.type === "range") {
        return;
    }

    const focusableElements = Array.from(document.querySelectorAll('a, button, input, select, [tabindex="0"]'))
        .filter(el => el.offsetWidth > 0 && el.offsetHeight > 0 && getComputedStyle(el).visibility !== 'hidden');
    
    if (focusableElements.length === 0) return;

    const currentElement = document.activeElement;
    if (!currentElement || !focusableElements.includes(currentElement)) {
        focusableElements[0].focus();
        return;
    }

    e.preventDefault(); // منع التمرير الافتراضي

    const currentRect = currentElement.getBoundingClientRect();
    let bestElement = null;
    let minDistance = Infinity;

    focusableElements.forEach(el => {
        if (el === currentElement) return;
        const rect = el.getBoundingClientRect();
        
        const elCenterX = rect.left + rect.width / 2;
        const elCenterY = rect.top + rect.height / 2;
        const curCenterX = currentRect.left + currentRect.width / 2;
        const curCenterY = currentRect.top + currentRect.height / 2;

        const dx = elCenterX - curCenterX;
        const dy = elCenterY - curCenterY;

        let isInDirection = false;
        let distance = Infinity;

        switch (e.key) {
            case "ArrowRight":
                if (dx > 10) {
                    isInDirection = true;
                    distance = Math.abs(dx) + Math.abs(dy) * 2;
                }
                break;
            case "ArrowLeft":
                if (dx < -10) {
                    isInDirection = true;
                    distance = Math.abs(dx) + Math.abs(dy) * 2;
                }
                break;
            case "ArrowDown":
                if (dy > 10) {
                    isInDirection = true;
                    distance = Math.abs(dy) + Math.abs(dx) * 2;
                }
                break;
            case "ArrowUp":
                if (dy < -10) {
                    isInDirection = true;
                    distance = Math.abs(dy) + Math.abs(dx) * 2;
                }
                break;
        }

        if (isInDirection && distance < minDistance) {
            minDistance = distance;
            bestElement = el;
        }
    });

    if (bestElement) {
        bestElement.focus();
        bestElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

// إخفاء المؤشر عند استخدام الريموت
let mouseTimer;
document.addEventListener("mousemove", () => {
    document.body.style.cursor = "default";
    clearTimeout(mouseTimer);
    mouseTimer = setTimeout(() => {
        document.body.style.cursor = "none";
    }, 3000);
});

document.addEventListener("keydown", (e) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Escape"].includes(e.key)) {
        document.body.style.cursor = "none";
    }
});
