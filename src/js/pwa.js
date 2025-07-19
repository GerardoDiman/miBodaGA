// PWA Manager para miBodaGA

// Ocultar botón de instalación PWA inmediatamente
(function() {
    const style = document.createElement('style');
    style.textContent = `
        #pwa-install-button, .pwa-install-button {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            position: absolute !important;
            left: -9999px !important;
            top: -9999px !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
            pointer-events: none !important;
        }
    `;
    document.head.appendChild(style);
})();

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        
        this.init();
    }
    
    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOnlineOfflineHandling();
        this.setupUpdateNotification();
        this.checkInstallationStatus();
        this.removeExistingInstallButton();
    }
    
    // Registrar Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registrado:', registration);
                
                // Manejar actualizaciones
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
                
                // Manejar mensajes del Service Worker
                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
                        this.showUpdateNotification();
                    }
                });
                
            } catch (error) {
                console.error('Error registrando Service Worker:', error);
            }
        }
    }
    
    // Configurar prompt de instalación
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            // No mostrar botón de instalación manual
            // this.showInstallButton();
        });
        
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstallationSuccess();
        });
    }
    
    // Mostrar botón de instalación (DESHABILITADO)
    showInstallButton() {
        // Función deshabilitada - no mostrar botón de instalación manual
        return;
    }
    
    // Ocultar botón de instalación
    hideInstallButton() {
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
            installButton.remove();
        }
    }
    
    // Eliminar botón de instalación existente
    removeExistingInstallButton() {
        const existingButton = document.getElementById('pwa-install-button');
        if (existingButton) {
            existingButton.remove();
            console.log('Botón de instalación PWA eliminado');
        }
        
        // También buscar por clase por si acaso
        const buttonsByClass = document.querySelectorAll('.pwa-install-button');
        buttonsByClass.forEach(button => {
            button.remove();
            console.log('Botón de instalación PWA eliminado por clase');
        });
        
        // Observador para eliminar el botón si aparece después
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        if (node.id === 'pwa-install-button' || node.classList?.contains('pwa-install-button')) {
                            node.remove();
                            console.log('Botón de instalación PWA eliminado por observador');
                        }
                        // Buscar dentro del nodo agregado
                        const installButton = node.querySelector?.('#pwa-install-button, .pwa-install-button');
                        if (installButton) {
                            installButton.remove();
                            console.log('Botón de instalación PWA eliminado por observador (dentro del nodo)');
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Instalar aplicación
    async installApp() {
        if (!this.deferredPrompt) return;
        
        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('Usuario aceptó la instalación');
        } else {
            console.log('Usuario rechazó la instalación');
        }
        
        this.deferredPrompt = null;
        this.hideInstallButton();
    }
    
    // Verificar estado de instalación
    checkInstallationStatus() {
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true) {
            this.isInstalled = true;
            this.hideInstallButton();
        }
    }
    
    // Configurar manejo online/offline
    setupOnlineOfflineHandling() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showOnlineStatus();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineStatus();
        });
    }
    
    // Mostrar estado online
    showOnlineStatus() {
        this.showStatusMessage('Conexión restaurada', 'success');
    }
    
    // Mostrar estado offline
    showOfflineStatus() {
        this.showStatusMessage('Modo offline - Algunas funciones pueden no estar disponibles', 'info');
    }
    
    // Configurar notificación de actualización
    setupUpdateNotification() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                this.showStatusMessage('Aplicación actualizada. Recarga para ver los cambios.', 'info');
            });
        }
    }
    
    // Mostrar notificación de actualización
    showUpdateNotification() {
        const updateButton = document.createElement('button');
        updateButton.id = 'pwa-update-button';
        updateButton.className = 'pwa-update-button';
        updateButton.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            <span>Actualizar App</span>
        `;
        updateButton.setAttribute('aria-label', 'Actualizar aplicación');
        
        updateButton.addEventListener('click', () => {
            window.location.reload();
        });
        
        // Insertar en la parte superior
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(updateButton, container.firstChild);
        }
        
        this.addUpdateButtonStyles();
    }
    
    // Mostrar mensaje de estado
    showStatusMessage(message, type = 'info') {
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message ${type}`;
        statusDiv.textContent = message;
        statusDiv.setAttribute('role', 'alert');
        
        // Insertar al inicio del body
        document.body.insertBefore(statusDiv, document.body.firstChild);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.parentNode.removeChild(statusDiv);
            }
        }, 5000);
    }
    
    // Mostrar mensaje de instalación exitosa
    showInstallationSuccess() {
        this.showStatusMessage('¡Aplicación instalada exitosamente!', 'success');
    }
    
    // Solicitar permisos de notificación
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.showStatusMessage('Notificaciones habilitadas', 'success');
                return true;
            } else {
                this.showStatusMessage('Notificaciones deshabilitadas', 'info');
                return false;
            }
        }
        return false;
    }
    
    // Enviar notificación
    sendNotification(title, body, icon = '/assets/images/logo-192.png') {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: body,
                icon: icon,
                badge: '/assets/images/logo-72.png',
                vibrate: [100, 50, 100],
                tag: 'boda-notification'
            });
            
            notification.addEventListener('click', () => {
                window.focus();
                notification.close();
            });
            
            return notification;
        }
    }
    
    // Añadir estilos para botón de instalación (OCULTAR COMPLETAMENTE)
    addInstallButtonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .pwa-install-button {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                width: 0 !important;
                height: 0 !important;
                overflow: hidden !important;
                pointer-events: none !important;
            }
                border: none;
                border-radius: 25px;
                padding: 12px 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
                animation: slideIn 0.5s ease;
            }
            
            .pwa-install-button:hover {
                background: var(--color-accent-dark);
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(0,0,0,0.4);
            }
            
            .pwa-install-button:focus {
                outline: 3px solid var(--color-focus);
                outline-offset: 2px;
            }
            
            .pwa-update-button {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1001;
                background: var(--color-focus);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 15px 25px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 16px;
                font-weight: 500;
                box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                transition: all 0.3s ease;
            }
            
            .pwa-update-button:hover {
                background: #3a8eff;
                transform: translate(-50%, -50%) scale(1.05);
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @media (max-width: 768px) {
                .pwa-install-button {
                    top: 10px;
                    left: 10px;
                    padding: 10px 16px;
                    font-size: 12px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Añadir estilos para botón de actualización
    addUpdateButtonStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .pwa-update-button {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1001;
                background: var(--color-focus);
                color: white;
                border: none;
                border-radius: 8px;
                padding: 15px 25px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 16px;
                font-weight: 500;
                box-shadow: 0 8px 24px rgba(0,0,0,0.5);
                transition: all 0.3s ease;
            }
            
            .pwa-update-button:hover {
                background: #3a8eff;
                transform: translate(-50%, -50%) scale(1.05);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Obtener información de la PWA
    getPWAInfo() {
        return {
            isInstalled: this.isInstalled,
            isOnline: this.isOnline,
            supportsServiceWorker: 'serviceWorker' in navigator,
            supportsNotifications: 'Notification' in window,
            notificationPermission: 'Notification' in window ? Notification.permission : 'unsupported'
        };
    }
}

// Inicializar PWA Manager cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAManager;
} 