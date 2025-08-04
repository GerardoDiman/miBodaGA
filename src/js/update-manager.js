// Update Manager - Manejo de actualizaciones de la aplicación
class UpdateManager {
    constructor() {
        this.swRegistration = null;
        this.isUpdateAvailable = false;
        this.showUpdateNotifications = true;
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator) {
            try {
                // Registrar service worker
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registrado');

                // Escuchar mensajes del service worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event);
                });

                // Verificar actualizaciones cada 30 segundos
                setInterval(() => {
                    this.checkForUpdates();
                }, 30000);

                // Verificar inmediatamente
                this.checkForUpdates();

            } catch (error) {
                console.error('❌ Error registrando Service Worker:', error);
            }
        }
    }

    handleServiceWorkerMessage(event) {
        const { type, message } = event.data;

        switch (type) {
            case 'UPDATE_AVAILABLE':
                this.showUpdateNotification();
                break;
        }
    }

    async checkForUpdates() {
        if (this.swRegistration) {
            try {
                await this.swRegistration.update();
                
                // Verificar si hay un service worker esperando
                if (this.swRegistration.waiting && !this.isUpdateAvailable) {
                    this.isUpdateAvailable = true;
                    this.showUpdateNotification();
                }
            } catch (error) {
                console.error('Error verificando actualizaciones:', error);
            }
        }
    }

    showUpdateNotification() {
        if (!this.showUpdateNotifications) return;

        // Crear notificación discreta
        const notification = this.createUpdateNotification();
        document.body.appendChild(notification);

        // Auto-ocultar después de 8 segundos si no se interactúa
        setTimeout(() => {
            if (document.body.contains(notification)) {
                this.hideNotification(notification);
            }
        }, 8000);
    }

    createUpdateNotification() {
        // Remover notificaciones existentes
        const existingNotifications = document.querySelectorAll('.update-notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <div class="update-icon">🔄</div>
                <div class="update-text">
                    <strong>Nueva versión disponible</strong>
                    <p>Toca para actualizar y ver los últimos cambios</p>
                </div>
                <button class="update-btn" onclick="updateManager.applyUpdate()">
                    Actualizar
                </button>
                <button class="update-close" onclick="updateManager.dismissUpdate(this)">
                    ×
                </button>
            </div>
        `;

        // Estilos inline para asegurar que se vean correctamente
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 0;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            max-width: 350px;
            font-family: 'Montserrat', sans-serif;
            animation: slideInRight 0.5s ease-out;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            
            .update-content {
                display: flex;
                align-items: center;
                padding: 16px;
                gap: 12px;
                position: relative;
            }
            
            .update-icon {
                font-size: 24px;
                animation: rotate 2s linear infinite;
            }
            
            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .update-text {
                flex: 1;
                line-height: 1.4;
            }
            
            .update-text strong {
                display: block;
                margin-bottom: 4px;
                font-size: 14px;
            }
            
            .update-text p {
                margin: 0;
                font-size: 12px;
                opacity: 0.9;
            }
            
            .update-btn {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: white;
                padding: 8px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
                font-weight: 500;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            
            .update-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-1px);
            }
            
            .update-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.3s ease;
            }
            
            .update-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }
        `;

        if (!document.querySelector('#update-notification-styles')) {
            style.id = 'update-notification-styles';
            document.head.appendChild(style);
        }

        return notification;
    }

    async applyUpdate() {
        try {
            if (this.swRegistration && this.swRegistration.waiting) {
                // Enviar mensaje al service worker para activar la nueva versión
                this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
                
                // Escuchar cuando el nuevo service worker tome control
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    window.location.reload();
                });
            } else {
                // Forzar recarga con cache bypass
                window.location.reload(true);
            }
        } catch (error) {
            console.error('Error aplicando actualización:', error);
            // Fallback: recarga normal
            window.location.reload();
        }
    }

    dismissUpdate(button) {
        const notification = button.closest('.update-notification');
        this.hideNotification(notification);
        
        // No mostrar más notificaciones por 10 minutos
        this.showUpdateNotifications = false;
        setTimeout(() => {
            this.showUpdateNotifications = true;
        }, 10 * 60 * 1000);
    }

    hideNotification(notification) {
        notification.style.animation = 'slideOutRight 0.5s ease-in';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 500);
    }

    // Método público para forzar verificación de actualizaciones
    forceUpdate() {
        this.checkForUpdates();
    }
}

// Instancia global
const updateManager = new UpdateManager();

// Exportar para uso global
window.updateManager = updateManager;