// validar-config.js - Configuración simplificada para el sistema de validación
window.VALIDAR_CONFIG = {
    // URL del Google Apps Script (¡¡REEMPLAZAR CON TU URL REAL!!)
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwPma1X-J0EgAPsYkXYhNT2I8LCSdANRa6CfcQLtFTVp8Xy5AZY5tAKm1apsE-0i9yW/exec',
    
    // Configuración de la aplicación
    APP_NAME: 'Sistema de Validación - Boda A&G',
    VERSION: '1.0.0',
    
    // Configuración de la base de datos
    DATABASE: {
        GUESTS_TABLE: 'Invitados',
        CONFIRMATIONS_TABLE: 'Confirmaciones'
    },
    
    // Configuración de cámara y QR
    CAMERA: {
        ENABLED: true,
        AUTO_START: false,
        TIMEOUT: 30000, // 30 segundos
        QUALITY: 'high', // low, medium, high
        FACING_MODE: 'environment', // environment (trasera) o user (frontal)
        ZOOM_LEVEL: 1.0,
        FLASH_SUPPORT: true,
        // Configuración de resolución para mejor calidad
        RESOLUTION: {
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 }
        },
        // Configuración de frame rate para mejor detección
        FRAME_RATE: { ideal: 30, min: 15 }
    },
    
    // Configuración de QR
    QR: {
        SCAN_TIMEOUT: 5000, // 5 segundos por escaneo (más rápido)
        RETRY_ATTEMPTS: 5, // Más intentos
        MIN_SIZE: 80, // Tamaño mínimo más pequeño para mejor detección
        SUPPORTED_FORMATS: ['QR_CODE', 'CODE_128', 'CODE_39'],
        // Configuración de escaneo en tiempo real
        SCAN_INTERVAL: 100, // Escanear cada 100ms
        CONFIDENCE_THRESHOLD: 0.7 // Umbral de confianza para detección
    },
    
    // Configuración de validación
    VALIDATION: {
        MAX_RETRIES: 3,
        TIMEOUT: 10000, // 10 segundos
        DEBOUNCE_DELAY: 500 // 500ms
    },
    
    // Configuración de UI
    UI: {
        ANIMATION_DURATION: 300,
        SUCCESS_DELAY: 2000,
        ERROR_DELAY: 4000
    },
    
    // Mensajes del sistema
    MESSAGES: {
        LOADING: 'Verificando invitado...',
        SUCCESS: '¡Invitado validado exitosamente!',
        ERROR: 'Error al validar invitado. Intenta nuevamente.',
        NOT_FOUND: 'Invitado no encontrado. Verifica el ID ingresado.',
        NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
        INVALID_ID: 'ID de invitado inválido. Debe tener 6 caracteres.',
        VALIDATING: 'Validando...',
        RETRY: 'Reintentando...'
    },
    
    // Estados de validación
    STATUSES: {
        CONFIRMED: 'Confirmado',
        PENDING: 'Pendiente',
        CANCELLED: 'Cancelado',
        UNKNOWN: 'Desconocido'
    },
    
    // Colores de estado
    COLORS: {
        SUCCESS: '#4CAF50',
        WARNING: '#ffc107',
        ERROR: '#f44336',
        INFO: '#2196F3'
    },
    
    // Función para optimizar dispositivos móviles
    optimizeForMobile: function() {
        if (this.isMobileDevice()) {
            // Reducir animaciones en móviles
            document.body.style.setProperty('--animation-duration', '0.2s');
            
            // Prevenir zoom accidental
            document.addEventListener('touchstart', function(e) {
                if (e.touches.length > 1) {
                    e.preventDefault();
                }
            }, { passive: false });
            
            // Optimizar scroll táctil
            document.body.style.setProperty('--scroll-behavior', 'smooth');
        }
    },
    
    // Funciones de cámara y QR
    camera: {
        // Verificar si la cámara está disponible
        isAvailable: function() {
            return navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
        },
        
        // Obtener permisos de cámara
        requestPermission: function() {
            return navigator.mediaDevices.getUserMedia({ 
                video: {
                    facingMode: VALIDAR_CONFIG.CAMERA.FACING_MODE,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
        },
        
        // Crear elemento de video para cámara
        createVideoElement: function() {
            const video = document.createElement('video');
            video.id = 'qr-camera';
            video.style.cssText = `
                width: 100%;
                max-width: 400px;
                height: auto;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            `;
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
            return video;
        },
        
        // Crear canvas para procesamiento de imagen
        createCanvas: function() {
            const canvas = document.createElement('canvas');
            canvas.id = 'qr-canvas';
            canvas.style.display = 'none';
            return canvas;
        },
        
        // Iniciar cámara con configuración optimizada
        startCamera: async function(videoElement, onSuccess, onError) {
            try {
                const constraints = {
                    video: {
                        facingMode: VALIDAR_CONFIG.CAMERA.FACING_MODE,
                        width: VALIDAR_CONFIG.CAMERA.RESOLUTION.width,
                        height: VALIDAR_CONFIG.CAMERA.RESOLUTION.height,
                        frameRate: VALIDAR_CONFIG.CAMERA.FRAME_RATE,
                        // Configuraciones adicionales para mejor calidad
                        aspectRatio: { ideal: 16/9 },
                        resizeMode: 'none'
                    }
                };
                
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                videoElement.srcObject = stream;
                
                // Esperar a que el video esté listo
                await new Promise((resolve) => {
                    videoElement.onloadedmetadata = resolve;
                });
                
                // Configurar el video para mejor rendimiento
                videoElement.play();
                videoElement.style.transform = 'scaleX(-1)'; // Espejo para cámara frontal
                
                console.log('📹 Cámara iniciada con resolución:', 
                    videoElement.videoWidth + 'x' + videoElement.videoHeight);
                
                if (onSuccess) onSuccess(stream);
                return stream;
                
            } catch (error) {
                console.error('❌ Error al iniciar cámara:', error);
                if (onError) onError(error);
                throw error;
            }
        }
    },
    
    // Funciones de escaneo QR
    qrScanner: {
        // Inicializar escáner QR
        init: function(videoElement, canvasElement, onResult) {
            if (!VALIDAR_CONFIG.camera.isAvailable()) {
                throw new Error('Cámara no disponible en este dispositivo');
            }
            
            const canvas = canvasElement;
            const ctx = canvas.getContext('2d');
            let scanning = false;
            
            // Función de escaneo
            const scanFrame = () => {
                if (!scanning) return;
                
                try {
                    // Dibujar frame actual en canvas
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    
                    // Obtener datos de imagen
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    
                    // Aquí iría la lógica de detección QR
                    // Por ahora simulamos detección
                    this.detectQRCode(imageData, onResult);
                    
                } catch (error) {
                    console.error('Error en escaneo:', error);
                }
                
                // Continuar escaneo
                if (scanning) {
                    requestAnimationFrame(scanFrame);
                }
            };
            
            // Iniciar/Detener escaneo
            return {
                start: () => {
                    scanning = true;
                    scanFrame();
                },
                stop: () => {
                    scanning = false;
                }
            };
        },
        
        // Detectar código QR (usando jsQR real)
        detectQRCode: function(imageData, onResult) {
            try {
                // Usar jsQR para detectar códigos QR
                if (typeof jsQR !== 'undefined') {
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    
                    if (code) {
                        console.log('🔍 QR detectado:', code.data);
                        onResult(code.data);
                        return true;
                    }
                } else {
                    // Fallback: simulación para desarrollo
                    console.log('⚠️ jsQR no disponible, usando simulación');
                    const mockDetection = Math.random() < 0.005; // 0.5% de probabilidad
                    
                    if (mockDetection) {
                        const mockQRData = 'ABC123'; // Simular datos QR detectados
                        onResult(mockQRData);
                        return true;
                    }
                }
                
                return false;
            } catch (error) {
                console.error('❌ Error en detección QR:', error);
                return false;
            }
        }
    }
};

// Función de utilidad para obtener configuración
window.getConfig = function(key) {
    return window.VALIDAR_CONFIG[key] || null;
};

// Función de utilidad para obtener mensaje
window.getMessage = function(key) {
    return window.VALIDAR_CONFIG.MESSAGES[key] || key;
};

// Función de utilidad para obtener color de estado
window.getStatusColor = function(status) {
    const statusColors = {
        'Confirmado': window.VALIDAR_CONFIG.COLORS.SUCCESS,
        'Pendiente': window.VALIDAR_CONFIG.COLORS.WARNING,
        'Cancelado': window.VALIDAR_CONFIG.COLORS.ERROR,
        'Desconocido': window.VALIDAR_CONFIG.COLORS.INFO
    };
    return statusColors[status] || window.VALIDAR_CONFIG.COLORS.INFO;
};

// Función de utilidad para validar ID de invitado
window.isValidGuestId = function(id) {
    return id && typeof id === 'string' && id.length === 6 && /^[a-z0-9]{6}$/.test(id);
};

// Función de utilidad para formatear fecha
window.formatDate = function(dateString) {
    if (!dateString) return '---';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '---';
        
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return '---';
    }
};

// Función de utilidad para formatear nombres
window.formatNames = function(names) {
    if (!names) return '---';
    
    if (Array.isArray(names)) {
        return names.join(', ');
    }
    
    if (typeof names === 'string') {
        return names;
    }
    
    return '---';
};

// Función de utilidad para formatear teléfono
window.formatPhone = function(phone) {
    if (!phone) return '---';
    
    // Formatear número de teléfono mexicano
    const cleaned = phone.toString().replace(/\D/g, '');
    
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    
    if (cleaned.length === 11 && cleaned.startsWith('52')) {
        const number = cleaned.slice(2);
        return `+52 (${number.slice(0, 3)}) ${number.slice(3, 7)}-${number.slice(7)}`;
    }
    
    return phone;
};

// Función de utilidad para formatear email
window.formatEmail = function(email) {
    if (!email) return '---';
    
    // Validar formato básico de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
        return email.toLowerCase();
    }
    
    return '---';
};

// Función de utilidad para mostrar notificación
window.showNotification = function(message, type = 'info', duration = 3000) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos de la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${window.getStatusColor(type === 'success' ? 'Confirmado' : type === 'error' ? 'Cancelado' : 'Pendiente')};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-weight: 500;
        max-width: 300px;
        word-wrap: break-word;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remover
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
};

// Función de utilidad para logging
window.log = function(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
    
    switch (type) {
        case 'error':
            console.error(logMessage);
            break;
        case 'warn':
            console.warn(logMessage);
            break;
        case 'debug':
            console.debug(logMessage);
            break;
        default:
            console.log(logMessage);
    }
};

// Función de utilidad para manejo de errores
window.handleError = function(error, context = '') {
    const errorMessage = error.message || error.toString();
    const fullContext = context ? `${context}: ${errorMessage}` : errorMessage;
    
    window.log(fullContext, 'error');
    window.showNotification(window.getMessage('ERROR'), 'error');
    
    // Re-lanzar error para manejo superior si es necesario
    throw new Error(fullContext);
};

// Función de utilidad para debounce
window.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Función de utilidad para throttle
window.throttle = function(func, limit) {
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
};

// Función de utilidad para validar conexión a internet
window.checkInternetConnection = function() {
    return navigator.onLine;
};

// Función de utilidad para detectar dispositivo móvil
window.isMobileDevice = function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
};

// Inicializar optimizaciones cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    window.VALIDAR_CONFIG.optimizeForMobile();
    window.log('Configuración de validación cargada', 'info');
});

// Exportar configuración para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.VALIDAR_CONFIG;
}
