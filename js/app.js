document.addEventListener("DOMContentLoaded", () => {
    inyectarElementos();
    initLoader();
    initCursor();
    initPageTransitions();
    initHeaderBehavior();
    initMobileMenu();
    initRevealAnimations();
});
function inyectarElementos() {
    if (!document.querySelector('.site-loader')) {
        const elementos = `
            <div class="site-loader">
                <h1 class="loader-logo">Amplify<span>.</span></h1>
                <div class="loader-line"></div>
            </div>
            <div class="custom-cursor"></div>
            <div class="page-transition"></div>
        `;
        document.body.insertAdjacentHTML('afterbegin', elementos);
    }
}
/* ==========================================
   CURSOR CON INERCIA (LERP) Y EFECTO MAGNÉTICO
========================================== */
function initCursor() {
    const cursor = document.querySelector(".custom-cursor");
    if (!cursor) return;
    /* ==========================================
       BASE
    ========================================== */
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let currentScale = 1;
    let interactiveScale = 4;
    let magnifierScale = 1;
    let zoomLevel = 2.5;
    let activeImage = null;
    /* ==========================================
       LERP
    ========================================== */
    function animateCursor() {
        currentX += (mouseX - currentX) * 0.14;
        currentY += (mouseY - currentY) * 0.14;
        cursor.style.left = currentX + "px";
        cursor.style.top = currentY + "px";
        cursor.style.transform =
            `translate(-50%, -50%) scale(${currentScale})`;
        /* ==========================================
        MAGNIFIER POSITION
        ========================================== */
        if (activeImage) {
            const rect = activeImage.getBoundingClientRect();
            const relativeX =
                ((currentX - rect.left) / rect.width) * 100;
            const relativeY =
                ((currentY - rect.top) / rect.height) * 100;
            cursor.style.backgroundPosition =
                `${relativeX}% ${relativeY}%`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    /* ==========================================
       TRACK REAL MOUSE
    ========================================== */
    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    /* ==========================================
       INTERACTIVE ELEMENTS
    ========================================== */
    const interactiveElements = document.querySelectorAll(
        "a, button, .hover-lift, h1, h2, h3, .marquee"
    );
    interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", () => {
            cursor.classList.remove("zoom-mode");
            activeImage = null;
            cursor.style.backgroundImage = "none";
            cursor.classList.add("active");
            const rect = el.getBoundingClientRect();
            currentScale = Math.min(
                Math.max(rect.height / 18, 3),
                6
            );
        });
        el.addEventListener("mouseleave", () => {
            cursor.classList.remove("active");
            currentScale = 1;
            if (
                el.classList.contains('primary-button') ||
                el.classList.contains('header-cta') ||
                el.classList.contains('secondary-button')
            ) {
                el.style.transform = `translate(0px, 0px)`;
            }
        });
        /* ==========================================
        MAGNETISM
        ========================================== */
        if (
            el.classList.contains('primary-button') ||
            el.classList.contains('header-cta') ||
            el.classList.contains('secondary-button')
        ) {
            el.addEventListener("mousemove", (e) => {
                const rect = el.getBoundingClientRect();
                const x =
                    e.clientX - rect.left - rect.width / 2;
                const y =
                    e.clientY - rect.top - rect.height / 2;
                el.style.transform =
                    `translate(${x * 0.25}px, ${y * 0.25}px)`;
            });
        }
    });
    /* ==========================================
       IMAGE MAGNIFIER
    ========================================== */
    const imageElements = document.querySelectorAll(
        ".portfolio-image, .hero-image-main, .area-image"
    );
    imageElements.forEach((el) => {
        el.addEventListener("mouseenter", () => {
            cursor.classList.remove("active");
            cursor.classList.add("zoom-mode");
            activeImage = el;
            const rect = el.getBoundingClientRect();
            currentScale = Math.min(
                Math.max(rect.width / 160, 4),
                8
            );
            const image = el.querySelector("img");
            if (image) {
                cursor.style.backgroundImage =
                    `url(${image.src})`;
                cursor.style.backgroundRepeat =
                    "no-repeat";
                cursor.style.backgroundSize =
                    `${zoomLevel * 100}%`;
            }
        });
        el.addEventListener("mouseleave", () => {
            cursor.classList.remove("zoom-mode");
            activeImage = null;
            currentScale = 1;
            cursor.style.backgroundImage = "none";
        });
    });
    
    /* ==========================================
       DYNAMIC MAGNIFIER SIZE + ZOOM
    ========================================== */
    window.addEventListener("wheel", (e) => {
        if (!activeImage) return;
        /* ==========================================
           BLOQUEAR SCROLL DE LA PÁGINA
        ========================================== */
        e.preventDefault();
        /* ==========================================
           AUMENTAR TAMAÑO DEL CÍRCULO
           SCROLL HACIA ABAJO = MÁS GRANDE
        ========================================== */
        magnifierScale += e.deltaY * 0.008;
        /* ==========================================
           LIMITES GIGANTES
        ========================================== */
        magnifierScale = Math.max(1, Math.min(18, magnifierScale));
        /* ==========================================
           ESCALA FINAL DEL CURSOR
        ========================================== */
        currentScale = magnifierScale;
        /* ==========================================
           ZOOM INTERNO DE LA IMAGEN
        ========================================== */
        zoomLevel += e.deltaY * -0.0015;
        zoomLevel = Math.max(1.8, Math.min(8, zoomLevel));
        cursor.style.backgroundSize =
            `${zoomLevel * 100}%`;
    }, { passive: false });
}
// --- 1. Loader Control ---
function initLoader() {
    const loader = document.querySelector(".site-loader");
    if (!loader) return;
    // Si ya vio la animación en esta sesión, se ocultará instantáneamente
    if (sessionStorage.getItem('loader-viewed')) {
        loader.style.display = 'none';
        return;
    }
    // Si es la primera vez, muestra y marca como visto
    window.addEventListener('load', () => {
        loader.classList.add("hidden");
        sessionStorage.setItem('loader-viewed', 'true');
        setTimeout(() => loader.style.display = 'none', 1000);
    });
}
// --- 2. Transiciones de página---
function initPageTransitions() {
    const transitionLayer = document.querySelector(".page-transition");
    
    document.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            
            // Validaciones para saltar transiciones (en links externos o anchors)
            if (href && href.startsWith('/') || href.startsWith('.')) {
                e.preventDefault();
                
                // Mostrar animación de salida (el loader apareciendo de nuevo)
                const loader = document.querySelector(".site-loader");
                if (loader) {
                    loader.style.display = 'flex';
                    loader.classList.remove("hidden");
                }
                
                // Espera a que la animación termine antes de navegar
                setTimeout(() => {
                    window.location.href = href;
                }, 800); // Ajusta según la duración de la animación de salida
            }
        });
    });
}
// --- 3. Header Behavior ---
function initHeaderBehavior() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    let lastScroll = 0;
    
    window.addEventListener("scroll", () => {
        const currentScroll = window.scrollY;
        
        // Cambio de estado mediante clase, nunca estilos directos
        if (currentScroll > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
        
        // Ocultar al hacer scroll hacia abajo
        header.style.transform = (currentScroll > lastScroll && currentScroll > 120) 
            ? "translateY(-100%)" 
            : "translateY(0%)";
            
        lastScroll = currentScroll;
    });
}
function initMobileMenu() {
    const btn = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".main-navigation");
    if (!btn || !nav) return;
    btn.addEventListener("click", () => {
        nav.classList.toggle("mobile-active");
        btn.classList.toggle("active");
        document.body.style.overflow = nav.classList.contains("mobile-active") ? "hidden" : "";
    });
}
function initRevealAnimations() {
    const elements = document.querySelectorAll(".fade-up, .fade-left, .fade-right, .scale-in");
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = "running";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    elements.forEach(el => {
        el.style.animationPlayState = "paused";
        observer.observe(el);
    });
}
        /* ==========================================
           MODULOS_COMPATIDOS
        ========================================== */
async function loadComponent(id, file) {
    const response = await fetch(file);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
}
// Cargar al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('navbar-placeholder', '/components/navbar.html');
    loadComponent('footer-placeholder', '/components/footer.html');
});
let scrollState = 'zoom'; // 'zoom' o 'slider'
let currentScale = 1;
let sliderPosition = 0;
window.addEventListener('wheel', (e) => {
    if (scrollState === 'zoom') {
        // Lógica de Zoom
        currentScale += e.deltaY * 0.001;
        
        if (currentScale >= 2.0) { // Umbral para cambiar de estado
            scrollState = 'slider';
        }
        
        // Aplicar a tu Card principal
        document.querySelector('.card-principal').style.transform = `scale(${currentScale})`;
        e.preventDefault(); // Evita que la página haga scroll normal
    } else if (scrollState === 'slider') {
        // Lógica de Slider Horizontal
        sliderPosition += e.deltaY;
        
        // Límites para evitar que se pierda en el vacío
        sliderPosition = Math.max(0, Math.min(sliderPosition, maxScroll));
        
        // Aplicar movimiento horizontal
        document.querySelector('.slider-container').style.transform = `translateX(-${sliderPosition}px)`;
        
        // Regresar al estado zoom si hace scroll arriba y llega al inicio
        if (sliderPosition <= 0 && e.deltaY < 0) {
            scrollState = 'zoom';
        }
    }
}, { passive: false });






// Asegurarnos de que el DOM esté listo antes de inyectar
document.addEventListener('DOMContentLoaded', async () => {
    await loadHeader(); // Usa await para que la ejecución se pause hasta que el header exista
    
    // Si tiene otras funciones de inicialización global (como el loader), llámalas aquí
});

async function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    // Detectamos si la URL actual contiene '/es/'
    const isSpanish = window.location.pathname.includes('/es/');
    const headerFile = isSpanish ? '/components/header_es.html' : '/components/header_en.html';

    try {
        const response = await fetch(headerFile);
        headerPlaceholder.innerHTML = await response.text();

        // 1. Dinamismo del botón de idioma (Calcula la ruta espejo exacta)
        const langBtn = document.getElementById('langToggle');
        if (langBtn) {
            let currentPath = window.location.pathname;
            // Estandarizar rutas vacías al index
            if (currentPath === '/' || currentPath === '/es/') {
                currentPath += 'index.html';
            }

            if (isSpanish) {
                // Si esta en ES, quitamos el /es/ para volver al EN
                langBtn.href = currentPath.replace('/es/', '/');
            } else {
                // Si estamos en EN, inyectamos /es/ al inicio
                langBtn.href = '/es' + currentPath;
            }
        }

        // 2. INICIALIZAR ANIMACIONES Y MENÚ MÓVIL
        // Al usar 'await', ahora estamos 100% seguros de que el <header> ya existe en el DOM
        if (typeof initHeaderBehavior === 'function') {
            initHeaderBehavior();
        }
        
        // Nota: Si hay una función separada que controla el clic del menú hamburguesa, 
        // debe inicializarla aquí también.

    } catch (error) {
        console.error('Error inyectando el componente Header:', error);
    }
}