// Update Manager - Manejo de actualizaciones de la aplicación
class UpdateManager {
    constructor() {
        this.swRegistration = null;
        this.isUpdateAvailable = false;
        this.showUpdateNotifications = false; // Desactivar notificaciones visibles
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator) {
            try {
                // Registrar service worker silenciosamente
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                
                // Escuchar mensajes del service worker (silencioso)
                navigator.serviceWorker.addEventListener('message', (event) => {
                    this.handleServiceWorkerMessage(event);
                });

                // Verificar actualizaciones cada 30 segundos (silencioso)
                setInterval(() => {
                    this.checkForUpdates();
                }, 30000);

                // Verificar inmediatamente (silenciosamente)
                this.checkForUpdates();

            } catch (error) {
                // Error silencioso - no mostrar nada
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
                // Error silencioso - no mostrar nada
            }
        }
    }

    showUpdateNotification() {
        // Mantener actualización silenciosa: no mostrar notificaciones
        this.applyUpdateSilently();
    }

    // Método eliminado - ya no se usan notificaciones visuales
    // createUpdateNotification() { ... }

    async applyUpdateSilently() {
        try {
            // Ya no forzamos recarga; la estrategia Network First obtendrá la última versión en el próximo request
            return;
        } catch (error) {
            // Error silencioso - recarga normal sin mostrar nada
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