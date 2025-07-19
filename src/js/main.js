/* ========================================
   FUNCIONALIDADES PRINCIPALES
   ======================================== */

// Esperar a que el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initializeMainFeatures();
});

/**
 * Inicializa todas las funcionalidades principales
 */
function initializeMainFeatures() {
    initializeCalendarFeature();
    initializeSmoothScrolling();
    initializeBackToTop();
    initializeLazyLoading();
}

/**
 * Funcionalidad para añadir al calendario
 */
function initializeCalendarFeature() {
    const calendarButton = document.getElementById('addToCalendar');
    if (!calendarButton) return;

    calendarButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Crear el evento
        const event = {
            title: 'Boda de Alejandra y Gerardo',
            description: '¡Celebra con nosotros nuestra boda!',
            start: '2025-10-11T17:00:00',
            end: '2025-10-12T02:00:00',
            location: 'Parroquia de San Sebastian, Comitán de Domínguez, Chiapas'
        };

        // Crear el link para Google Calendar
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start.replace(/[-:]/g, '')}/${event.end.replace(/[-:]/g, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

        // Abrir en una nueva ventana
        window.open(googleCalendarUrl, '_blank');
    });
}

/**
 * Scroll suave para enlaces internos
 */
function initializeSmoothScrolling() {
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    
    internalLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Botón de volver arriba
 */
function initializeBackToTop() {
    // Crear botón si no existe
    if (!document.getElementById('back-to-top')) {
        const backToTopButton = document.createElement('button');
        backToTopButton.id = 'back-to-top';
        backToTopButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
        backToTopButton.className = 'back-to-top-btn';
        backToTopButton.setAttribute('aria-label', 'Volver arriba');
        document.body.appendChild(backToTopButton);
        
        // Estilos del botón
        const style = document.createElement('style');
        style.textContent = `
            .back-to-top-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: var(--color-accent);
                color: #000;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
                z-index: 1000;
                font-size: 1.2em;
            }
            .back-to-top-btn.visible {
                opacity: 1;
                visibility: visible;
            }
            .back-to-top-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 5px 15px rgba(209, 183, 160, 0.4);
            }
        `;
        document.head.appendChild(style);
        
        // Funcionalidad del botón
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // Mostrar/ocultar botón según scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
    }
}

/**
 * Carga diferida de imágenes
 */
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback para navegadores que no soportan IntersectionObserver
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    }
}

/**
 * Utilidad para mostrar notificaciones
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos de notificación
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        .notification.show {
            transform: translateX(0);
        }
        .notification-info {
            background: #2196F3;
        }
        .notification-success {
            background: #4CAF50;
        }
        .notification-error {
            background: #f44336;
        }
        .notification-warning {
            background: #ff9800;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * Utilidad para validar formularios
 */
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

/**
 * Utilidad para formatear fechas
 */
function formatDate(date, options = {}) {
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    };
    
    return new Intl.DateTimeFormat('es-ES', defaultOptions).format(date);
}

/**
 * Utilidad para debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utilidad para throttle
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}