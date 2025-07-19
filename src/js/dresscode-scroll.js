/* ========================================
   ANIMACIONES DE SCROLL PROGRESIVO - CÓDIGO DE VESTIMENTA
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    initializeDresscodeScrollAnimations();
});

/**
 * Inicializa las animaciones de scroll progresivo para el código de vestimenta
 */
function initializeDresscodeScrollAnimations() {
    const dresscodeElements = document.querySelectorAll('.dresscode-progressive-section .animate-on-scroll');
    
    if (dresscodeElements.length === 0) return;
    
    // Configurar Intersection Observer para las animaciones
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = parseInt(element.dataset.delay) || 0;
                
                // Aplicar animación con delay
                setTimeout(() => {
                    element.classList.add('visible');
                    
                    // Si es un contenedor de iconos, agregar efecto especial
                    if (element.classList.contains('dresscode-icon-container')) {
                        element.style.animation = 'dresscodeScaleIn 0.8s ease forwards';
                    }
                    
                    // Si es un separador, agregar efecto de expansión
                    if (element.classList.contains('dresscode-separator')) {
                        element.style.animation = 'dresscodeSeparator 1s ease forwards';
                    }
                    
                }, delay);
                
                // Una vez que se activa, dejar de observar
                observer.unobserve(element);
            }
        });
    }, observerOptions);
    
    // Observar todos los elementos
    dresscodeElements.forEach(element => {
        observer.observe(element);
    });
    
    // Función para reiniciar animaciones (útil para testing)
    window.resetDresscodeAnimations = () => {
        dresscodeElements.forEach(element => {
            element.classList.remove('visible');
            element.style.animation = '';
        });
    };
    
    // Función para forzar todas las animaciones (útil para testing)
    window.forceDresscodeAnimations = () => {
        dresscodeElements.forEach((element, index) => {
            const delay = parseInt(element.dataset.delay) || 0;
            setTimeout(() => {
                element.classList.add('visible');
                if (element.classList.contains('dresscode-icon-container')) {
                    element.style.animation = 'dresscodeScaleIn 0.8s ease forwards';
                }
                if (element.classList.contains('dresscode-separator')) {
                    element.style.animation = 'dresscodeSeparator 1s ease forwards';
                }
            }, delay);
        });
    };
}

/**
 * Función para manejar scroll suave entre secciones
 */
function smoothScrollToDresscode() {
    const dresscodeSection = document.querySelector('.dresscode-bg');
    if (dresscodeSection) {
        dresscodeSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/**
 * Función para verificar si un elemento está en el viewport
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Función para obtener el progreso de scroll de un elemento
 */
function getScrollProgress(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const elementTop = rect.top;
    const elementHeight = rect.height;
    
    if (elementTop > windowHeight) {
        return 0; // Elemento aún no visible
    } else if (elementTop + elementHeight < 0) {
        return 1; // Elemento completamente pasado
    } else {
        return Math.max(0, Math.min(1, (windowHeight - elementTop) / (windowHeight + elementHeight)));
    }
}

/**
 * Función para animar elementos basado en el progreso de scroll
 */
function animateOnScrollProgress() {
    const dresscodeSection = document.querySelector('.dresscode-bg');
    if (!dresscodeSection) return;
    
    const progress = getScrollProgress(dresscodeSection);
    const elements = dresscodeSection.querySelectorAll('.animate-on-scroll');
    
    elements.forEach((element, index) => {
        const elementProgress = Math.max(0, Math.min(1, (progress - index * 0.2) * 3));
        
        if (elementProgress > 0) {
            element.style.opacity = elementProgress;
            element.style.transform = `translateY(${30 * (1 - elementProgress)}px)`;
        }
    });
}

// Agregar event listener para scroll progresivo (opcional)
window.addEventListener('scroll', () => {
    // Solo ejecutar si la sección de dresscode está en el viewport
    const dresscodeSection = document.querySelector('.dresscode-bg');
    if (dresscodeSection && isElementInViewport(dresscodeSection)) {
        animateOnScrollProgress();
    }
});

// Exportar funciones para uso global
window.dresscodeScroll = {
    initialize: initializeDresscodeScrollAnimations,
    reset: () => window.resetDresscodeAnimations(),
    force: () => window.forceDresscodeAnimations(),
    scrollTo: smoothScrollToDresscode
}; 