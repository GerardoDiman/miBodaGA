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
            description: '¡Celebra con nosotros nuestra boda! Ven a compartir este momento especial con nosotros. 👰🤍🤵',
            start: '2025-10-11T16:00:00',
            end: '2025-10-12T02:00:00',
            location: 'Templo de San José, Comitán de Domínguez, Chiapas'
        };

        // Detectar el sistema operativo para mostrar opciones apropiadas
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        const isMobile = /mobile|android|iphone|ipad/.test(userAgent);

        if (isMobile) {
            // En móviles, mostrar opciones nativas
            showMobileCalendarOptions(event);
        } else {
            // En desktop, abrir Google Calendar directamente
            openGoogleCalendar(event);
        }
    });
}

/**
 * Mostrar opciones de calendario para móviles
 */
function showMobileCalendarOptions(event) {
    // Crear modal con opciones
    const modal = document.createElement('div');
    modal.className = 'calendar-modal';
    modal.innerHTML = `
        <div class="calendar-modal-content">
            <h3>Añadir al calendario</h3>
            <p>Selecciona tu aplicación de calendario preferida:</p>
            <div class="calendar-options">
                <button class="calendar-option" data-type="google">
                    <i class="fab fa-google"></i> Google Calendar
                </button>
                <button class="calendar-option" data-type="outlook">
                    <i class="fas fa-envelope"></i> Outlook
                </button>
                <button class="calendar-option" data-type="apple">
                    <i class="fab fa-apple"></i> Apple Calendar
                </button>
                <button class="calendar-option" data-type="ics">
                    <i class="fas fa-download"></i> Descargar (.ics)
                </button>
            </div>
            <button class="calendar-modal-close">Cancelar</button>
        </div>
    `;

    // Estilos del modal
    const style = document.createElement('style');
    style.textContent = `
        .calendar-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        .calendar-modal-content {
            background: white;
            padding: 20px;
            border-radius: 10px;
            max-width: 400px;
            width: 90%;
            text-align: center;
        }
        .calendar-modal-content h3 {
            margin-bottom: 15px;
            color: #2c3b0e;
        }
        .calendar-options {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin: 20px 0;
        }
        .calendar-option {
            padding: 12px;
            border: 1px solid #2c3b0e;
            background: transparent;
            color: #2c3b0e;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }
        .calendar-option:hover {
            background: #2c3b0e;
            color: white;
        }
        .calendar-modal-close {
            padding: 8px 16px;
            border: 1px solid #ccc;
            background: transparent;
            color: #666;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        }
    `;
    document.head.appendChild(style);

    // Event listeners
    modal.querySelector('.calendar-modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.querySelectorAll('.calendar-option').forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;
            handleCalendarSelection(type, event);
            document.body.removeChild(modal);
        });
    });

    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });

    document.body.appendChild(modal);
}

/**
 * Manejar la selección de calendario
 */
function handleCalendarSelection(type, event) {
    switch (type) {
        case 'google':
            openGoogleCalendar(event);
            break;
        case 'outlook':
            openOutlookCalendar(event);
            break;
        case 'apple':
            openAppleCalendar(event);
            break;
        case 'ics':
            downloadICSFile(event);
            break;
    }
}

/**
 * Abrir Google Calendar
 */
function openGoogleCalendar(event) {
    // Formatear fechas correctamente para Google Calendar
    // Google Calendar requiere formato: YYYYMMDDTHHMMSSZ
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    // Convertir a formato requerido por Google Calendar
    const formatDateForGoogle = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
    };
    
    const startDateFormatted = formatDateForGoogle(startDate);
    const endDateFormatted = formatDateForGoogle(endDate);
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateFormatted}/${endDateFormatted}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(googleCalendarUrl, '_blank');
}

/**
 * Abrir Outlook Calendar
 */
function openOutlookCalendar(event) {
    // Formatear fechas correctamente para Outlook
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    
    // Outlook requiere formato ISO 8601
    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();
    
    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title)}&startdt=${startDateISO}&enddt=${endDateISO}&body=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
    
    window.open(outlookUrl, '_blank');
}

/**
 * Abrir Apple Calendar (solo en iOS)
 */
function openAppleCalendar(event) {
    // Crear archivo .ics temporal
    const icsContent = generateICSContent(event);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'boda-alejandra-gerardo.ics';
    link.click();
    
    URL.revokeObjectURL(url);
}

/**
 * Descargar archivo .ics
 */
function downloadICSFile(event) {
    const icsContent = generateICSContent(event);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'boda-alejandra-gerardo.ics';
    link.click();
    
    URL.revokeObjectURL(url);
}

/**
 * Generar contenido del archivo .ics
 */
function generateICSContent(event) {
    const startDate = new Date(event.start).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(event.end).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    // Calcular el recordatorio: un día antes a las 8:00 PM
    const reminderDate = new Date(event.start);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(20, 0, 0, 0); // 8:00 PM
    const reminderDateISO = reminderDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Boda Alejandra y Gerardo//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:boda-alejandra-gerardo-${Date.now()}@miBodaGA.com
DTSTAMP:${now}
DTSTART:${startDate}
DTEND:${endDate}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-P1DT4H
ACTION:DISPLAY
DESCRIPTION:Recordatorio: Boda de Alejandra y Gerardo mañana
END:VALARM
END:VEVENT
END:VCALENDAR`;
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