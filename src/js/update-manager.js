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
                // Aplicar actualización automáticamente sin mostrar notificación
                this.applyUpdateSilently();
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
                    // Aplicar actualización automáticamente sin notificación visible
                    this.applyUpdateSilently();
                }
            } catch (error) {
                console.error('Error verificando actualizaciones:', error);
            }
        }
    }

    showUpdateNotification() {
        // Actualización completamente silenciosa - sin notificaciones visibles
        // Solo log en consola para desarrolladores
        console.log('🔄 Nueva versión disponible - actualizando automáticamente...');
        
        // Aplicar actualización automáticamente sin mostrar notificación
        this.applyUpdateSilently();
    }

    // Método eliminado - ya no se usan notificaciones visuales
    // createUpdateNotification() { ... }

    async applyUpdateSilently() {
        try {
            if (this.swRegistration && this.swRegistration.waiting) {
                // Enviar mensaje al service worker para activar la nueva versión
                this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
                
                // Escuchar cuando el nuevo service worker tome control
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    // Recarga silenciosa sin mostrar nada al usuario
                    window.location.reload();
                });
            } else {
                // Recarga silenciosa con cache bypass
                window.location.reload(true);
            }
        } catch (error) {
            console.error('Error aplicando actualización silenciosa:', error);
            // Fallback: recarga normal
            window.location.reload();
        }
    }

    // Método original mantenido por compatibilidad (pero no se usa)
    async applyUpdate() {
        this.applyUpdateSilently();
    }

    // Métodos eliminados - ya no se usan notificaciones visuales
    // dismissUpdate(button) { ... }
    // hideNotification(notification) { ... }

    // Método público para forzar verificación de actualizaciones
    forceUpdate() {
        this.checkForUpdates();
    }
}

// Instancia global
const updateManager = new UpdateManager();

// Exportar para uso global
window.updateManager = updateManager;