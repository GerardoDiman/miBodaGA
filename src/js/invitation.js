// invitation.js

(function() {
    document.addEventListener('DOMContentLoaded', () => {

        // --- Referencias a Elementos HTML ---
        const guestNameElement = document.getElementById('guest-name-placeholder');
        const guestPassesElement = document.getElementById('guest-passes-placeholder');
        const guestKidsElement = document.getElementById('guest-kids-placeholder');
        const guestDetailsContainer = document.getElementById('guest-passes-details');
        const confirmButton = document.querySelector('.confirm-main-rsvp-button');
        const rsvpSectionElements = document.querySelectorAll('.rsvp-heading, .rsvp-deadline, .confirm-main-rsvp-button, .rsvp-contact-prompt, .rsvp-options');
        const qrDisplayContainer = document.getElementById('qr-code-display');
        const qrCodeTargetDiv = document.getElementById('qrcode-target');
        const qrGuestNameDisplay = document.getElementById('qr-guest-name-display');
        const validationViewContainer = document.getElementById('validation-view');

        // --- Configuraciones ---
        const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPma1X-J0EgAPsYkXYhNT2I8LCSdANRa6CfcQLtFTVp8Xy5AZY5tAKm1apsE-0i9yW/exec';
        const PUBLIC_SITE_URL_BASE = 'https://mibodaag.netlify.app/';
        const validationPagePath = '/validar.html';

        // --- Variables de Estado ---
        let invitadoActual = null;
        let confirmacionVerificada = false;
        let yaConfirmoSheet = false;

        // --- Funciones Helper ---

        /** Muestra un mensaje de error genérico o específico */
        function mostrarErrorCarga(mensaje = "Error al cargar datos") {
            console.error("Error Carga/Validación:", mensaje);
            if (guestNameElement) {
                // Limpiar completamente el elemento antes de asignar nuevo texto
                guestNameElement.textContent = '';
                guestNameElement.textContent = mensaje;
                console.log("Texto de error asignado:", guestNameElement.textContent);
                
                // Aplicar estilos CSS para "Invitación Genérica"
                if (mensaje === "Invitación Genérica") {
                    guestNameElement.style.fontFamily = "'Great Vibes', cursive";
                    guestNameElement.style.fontSize = "2.2em";
                    guestNameElement.style.fontWeight = "400";
                    guestNameElement.style.color = "var(--color-accent)";
                    
                    // Media queries para responsive
                    const mediaQuery768 = window.matchMedia("(max-width: 768px)");
                    const mediaQuery480 = window.matchMedia("(max-width: 480px)");
                    
                    if (mediaQuery480.matches) {
                        guestNameElement.style.fontSize = "1.8em";
                    } else if (mediaQuery768.matches) {
                        guestNameElement.style.fontSize = "2em";
                    }
                }
            }
            if (guestDetailsContainer) guestDetailsContainer.style.display = 'none';
            if (confirmButton) confirmButton.style.display = 'none';
            if (!validationViewContainer || validationViewContainer.style.display === 'none') {
                const mainSections = document.querySelectorAll('.container > section:not(#validation-view), .container > header, .container > main');
                mainSections.forEach(section => { if (section) section.style.display = 'none'; });
            }
            if (validationViewContainer && validationViewContainer.style.display !== 'none') {
                validationViewContainer.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">${mensaje}</p>`;
            }
        }

        /** Muestra el código QR pre-generado */
        function displayQrCode(invitado) {
            if (!qrDisplayContainer || !qrCodeTargetDiv || !qrGuestNameDisplay) {
                console.error("displayQrCode: Faltan elementos HTML para el QR."); return;
            }
            if (!invitado || typeof invitado.id !== 'string' || invitado.id.trim() === '') {
                console.error("displayQrCode: Datos inválidos para mostrar QR. Invitado:", invitado);
                qrCodeTargetDiv.innerHTML = '<p style="color: red; font-size: small;">Error: Datos inválidos</p>';
                qrGuestNameDisplay.textContent = '';
                qrDisplayContainer.style.display = 'flex';
                document.body.classList.add('qr-code-shown');
                if (confirmButton) confirmButton.style.display = 'none';
                return;
            }

            console.log("Mostrando código QR pre-generado para ID:", invitado.id);
            qrCodeTargetDiv.innerHTML = ''; // Limpiar contenido anterior

            // Construir la ruta al archivo QR pre-generado
            const qrImagePath = `qrcodes/${invitado.id}.png`;
            console.log("Ruta de la imagen QR:", qrImagePath);

            // Crear un elemento de imagen y establecer su fuente
            const qrImageElement = document.createElement('img');
            qrImageElement.src = qrImagePath;
            qrImageElement.alt = `Código QR para ${invitado.nombre}`;
            qrImageElement.style.maxWidth = '100%'; // Asegurar que la imagen se ajuste al contenedor
            qrImageElement.style.height = 'auto';

            // Añadir la imagen al contenedor
            qrCodeTargetDiv.appendChild(qrImageElement);

            qrGuestNameDisplay.textContent = invitado.nombre;
            qrDisplayContainer.style.display = 'flex';
            document.body.classList.add('qr-code-shown');
            if (confirmButton) confirmButton.style.display = 'none';
        }

        /** Actualiza la UI (botón/QR) basado en el estado de confirmación */
        function updateUIBasedOnConfirmation(confirmado) {
            console.log(`Actualizando UI - Estado Confirmado desde Sheet: ${confirmado}`);
            yaConfirmoSheet = confirmado;

            if (confirmado && invitadoActual) {
                displayQrCode(invitadoActual);
            } else if (!confirmado && invitadoActual) {
                rsvpSectionElements.forEach(el => {
                    if(el) {
                        const classes = el.classList;
                        if(classes.contains('rsvp-options')) { el.style.display = 'flex'; }
                        else if (classes.contains('confirm-main-rsvp-button')) { el.style.display = 'inline-block'; }
                        else { el.style.display = ''; }
                    }
                });
                if (qrDisplayContainer) qrDisplayContainer.style.display = 'none';
                document.body.classList.remove('qr-code-shown');
                if (confirmButton) {
                    confirmButton.textContent = "Confirmar";
                    confirmButton.style.backgroundColor = '';
                    confirmButton.style.borderColor = '';
                    confirmButton.disabled = false;
                    confirmButton.style.display = 'inline-block';
                }
            }
            const confirmationKey = `boda_confirmado_${invitadoActual?.id}`;
            if (confirmado) {
                try { 
                    localStorage.setItem(confirmationKey, 'true'); 
                    // Guardar también timestamp para sincronización futura
                    localStorage.setItem(`${confirmationKey}_timestamp`, Date.now().toString());
                } catch(e){ console.warn("No se pudo escribir en localStorage", e); }
            } else {
                try { 
                    localStorage.removeItem(confirmationKey); 
                    localStorage.removeItem(`${confirmationKey}_timestamp`);
                } catch(e){ console.warn("No se pudo borrar de localStorage", e); }
            }
        }

        /** Función de fallback cuando Google Sheets falla */
        function handleGoogleSheetsFailure() {
            console.warn("Google Sheets no disponible. Usando fallback local.");
            
            // Mostrar mensaje al usuario
            const fallbackMessage = document.createElement('div');
            fallbackMessage.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff9800;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 1000;
                font-size: 14px;
                max-width: 300px;
            `;
            fallbackMessage.innerHTML = `
                <strong>⚠️ Modo Offline</strong><br>
                Tu confirmación se guardará localmente.<br>
                Se sincronizará cuando el servicio esté disponible.
            `;
            document.body.appendChild(fallbackMessage);
            
            // Remover mensaje después de 5 segundos
            setTimeout(() => {
                if (fallbackMessage.parentNode) {
                    fallbackMessage.parentNode.removeChild(fallbackMessage);
                }
            }, 5000);
        }

        /** Sistema de sincronización automática */
        function setupAutoSync() {
            // Verificar si hay confirmaciones pendientes de sincronizar
            function checkPendingSyncs() {
                if (!invitadoActual) return;
                
                const confirmationKey = `boda_confirmado_${invitadoActual.id}`;
                const timestampKey = `${confirmationKey}_timestamp`;
                const syncKey = `${confirmationKey}_synced`;
                
                try {
                    const isConfirmed = localStorage.getItem(confirmationKey) === 'true';
                    const timestamp = localStorage.getItem(timestampKey);
                    const isSynced = localStorage.getItem(syncKey) === 'true';
                    
                    // Si está confirmado localmente pero no sincronizado
                    if (isConfirmed && !isSynced && timestamp) {
                        console.log("Encontrada confirmación pendiente de sincronizar");
                        syncPendingConfirmation();
                    }
                } catch (e) {
                    console.warn("Error verificando sincronización pendiente:", e);
                }
            }

            // Sincronizar confirmación pendiente
            function syncPendingConfirmation() {
                if (!invitadoActual) return;
                
                const dataToSend = { 
                    id: invitadoActual.id, 
                    nombre: invitadoActual.nombre, 
                    pases: invitadoActual.pases, 
                    ninos: invitadoActual.ninos 
                };

                fetch(GOOGLE_APPS_SCRIPT_URL, { 
                    method: 'POST', 
                    mode: 'no-cors', 
                    cache: 'no-cache', 
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
                    redirect: 'follow', 
                    body: JSON.stringify(dataToSend) 
                })
                .then(response => {
                    console.log("✅ Confirmación sincronizada exitosamente");
                    // Marcar como sincronizada
                    const syncKey = `boda_confirmado_${invitadoActual.id}_synced`;
                    localStorage.setItem(syncKey, 'true');
                    
                    // Mostrar notificación de sincronización
                    showSyncNotification();
                })
                .catch(error => {
                    console.warn("❌ Error sincronizando confirmación:", error);
                    // Intentar de nuevo en 30 segundos
                    setTimeout(syncPendingConfirmation, 30000);
                });
            }

            // Mostrar notificación de sincronización exitosa
            function showSyncNotification() {
                const syncMessage = document.createElement('div');
                syncMessage.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #4CAF50;
                    color: white;
                    padding: 10px 15px;
                    border-radius: 5px;
                    z-index: 1000;
                    font-size: 14px;
                    max-width: 300px;
                    animation: slideIn 0.3s ease-out;
                `;
                syncMessage.innerHTML = `
                    <strong>✅ Sincronizado</strong><br>
                    Tu confirmación se envió al servidor.
                `;
                document.body.appendChild(syncMessage);
                
                // Remover después de 3 segundos
                setTimeout(() => {
                    if (syncMessage.parentNode) {
                        syncMessage.parentNode.removeChild(syncMessage);
                    }
                }, 3000);
            }

            // Verificar sincronización cuando se recupera la conexión
            window.addEventListener('online', () => {
                console.log("🌐 Conexión recuperada. Verificando sincronización...");
                setTimeout(checkPendingSyncs, 2000); // Esperar 2 segundos para estabilizar
            });

            // Verificar sincronización periódicamente (cada 5 minutos)
            setInterval(checkPendingSyncs, 5 * 60 * 1000);

            // Verificar sincronización al cargar la página
            setTimeout(checkPendingSyncs, 3000);
        }

        // --- Lógica Principal al Cargar la Página ---
        const urlParams = new URLSearchParams(window.location.search);
        const guestId = urlParams.get('id') || urlParams.get('invitado'); // Soporte para ambos parámetros

        if (!guestId) {
            console.warn("No se especificó ID de invitado.");
            mostrarErrorCarga("Invitación Genérica");
            return;
        }
        console.log(`ID invitado: ${guestId}`);
        fetch('data/invitados.json')
            .then(response => {
                if (!response.ok) { throw new Error(`Error ${response.status} cargando data/invitados.json`); }
                return response.json();
            })
            .then(invitados => {
                invitadoActual = invitados.find(inv => inv.id === guestId);
                if (!invitadoActual) {
                    throw new Error(`Invitado con ID "${guestId}" no encontrado en invitados.json.`);
                }
                console.log("Datos del invitado cargados:", invitadoActual);

                // Limpiar cualquier texto anterior y asignar solo el nombre del invitado
                if (guestNameElement) {
                    guestNameElement.textContent = '';
                    guestNameElement.textContent = invitadoActual.nombre;
                    console.log("Nombre asignado:", guestNameElement.textContent);
                }
                guestPassesElement.textContent = invitadoActual.pases;
                guestKidsElement.textContent = invitadoActual.ninos;
                guestDetailsContainer.style.display = 'flex';

                const kidsSpanElement = guestDetailsContainer.querySelector('.guest-pass-kids');
                const separatorSpanElement = guestDetailsContainer.querySelector('.guest-pass-separator');
                const passesSpanElement = guestDetailsContainer.querySelector('.guest-pass-item:not(.guest-pass-kids)');
                if (invitadoActual.ninos === 0) {
                    if (kidsSpanElement) kidsSpanElement.style.display = 'none';
                    if (separatorSpanElement) separatorSpanElement.style.display = 'none';
                    if (invitadoActual.pases === 1) { if(passesSpanElement) passesSpanElement.innerHTML = `<span id="guest-passes-placeholder">${invitadoActual.pases}</span> - PASE`; }
                    else { if(passesSpanElement) passesSpanElement.innerHTML = `<span id="guest-passes-placeholder">${invitadoActual.pases}</span> - PASES`; }
                } else {
                    if (kidsSpanElement) kidsSpanElement.style.display = 'inline';
                    if (separatorSpanElement) separatorSpanElement.style.display = 'inline';
                    if(passesSpanElement) passesSpanElement.innerHTML = `<span id="guest-passes-placeholder">${invitadoActual.pases}</span> - PASES`;
                }

                console.log("Verificando estado de confirmación (JSONP)...");
                const callbackCheckStatus = 'handleCheckStatusResponse' + Date.now();
                const checkUrl = `${GOOGLE_APPS_SCRIPT_URL}?action=checkStatus&id=${guestId}&callback=${callbackCheckStatus}&t=${Date.now()}`;
                const scriptCheckTag = document.createElement('script');
                scriptCheckTag.src = checkUrl;
                let checkTimeoutId = setTimeout(() => {
                    console.warn("Timeout esperando respuesta checkStatus. Asumiendo no confirmado.");
                    updateUIBasedOnConfirmation(false);
                    try { delete window[callbackCheckStatus]; } catch(e){}
                }, 10000);

                scriptCheckTag.onerror = () => {
                    clearTimeout(checkTimeoutId);
                    console.error("Error al cargar script JSONP checkStatus.");
                    updateUIBasedOnConfirmation(false);
                    try { document.body.removeChild(scriptCheckTag); } catch (e) {}
                    try { delete window[callbackCheckStatus]; } catch (e) {}
                };

                window[callbackCheckStatus] = (data) => {
                    clearTimeout(checkTimeoutId);
                    console.log("Respuesta del checkStatus (JSONP):", data);
                    confirmacionVerificada = true;
                    updateUIBasedOnConfirmation(data.status === 'confirmed');
                    try { document.body.removeChild(scriptCheckTag); } catch (e) {}
                    try { delete window[callbackCheckStatus]; } catch (e) {}
                };
                document.body.appendChild(scriptCheckTag);
            })
            .catch(error => {
                console.error("Error cargando invitados.json:", error);
                mostrarErrorCarga(error.message || "Error al cargar datos iniciales");
            });

        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                if (!invitadoActual || yaConfirmoSheet || confirmButton.disabled) {
                    console.log("Clic en Confirmar ignorado.");
                    return;
                }

                confirmButton.disabled = true;
                confirmButton.textContent = "Confirmando...";
                const dataToSend = { id: invitadoActual.id, nombre: invitadoActual.nombre, pases: invitadoActual.pases, ninos: invitadoActual.ninos };

                // Intentar enviar a Google Sheets
                fetch(GOOGLE_APPS_SCRIPT_URL, { 
                    method: 'POST', 
                    mode: 'no-cors', 
                    cache: 'no-cache', 
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
                    redirect: 'follow', 
                    body: JSON.stringify(dataToSend) 
                })
                .then(response => {
                    console.log("Solicitud POST de confirmación enviada (no-cors).");
                    // Llamamos a displayQrCode para mostrar el QR después de confirmar
                    updateUIBasedOnConfirmation(true); 
                    
                    // Marcar como sincronizada
                    const syncKey = `boda_confirmado_${invitadoActual.id}_synced`;
                    try {
                        localStorage.setItem(syncKey, 'true');
                    } catch(e) {
                        console.warn("No se pudo marcar como sincronizada:", e);
                    }
                })
                .catch(error => {
                    console.error('Error de RED al enviar confirmación POST:', error);
                    
                    // Usar fallback local
                    handleGoogleSheetsFailure();
                    updateUIBasedOnConfirmation(true);
                    
                    // Marcar como NO sincronizada para sincronización futura
                    const syncKey = `boda_confirmado_${invitadoActual.id}_synced`;
                    try {
                        localStorage.setItem(syncKey, 'false');
                    } catch(e) {
                        console.warn("No se pudo marcar como no sincronizada:", e);
                    }
                    
                    // Mostrar mensaje de éxito con advertencia
                    const successMessage = document.createElement('div');
                    successMessage.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: #4CAF50;
                        color: white;
                        padding: 20px;
                        border-radius: 10px;
                        z-index: 1000;
                        text-align: center;
                        max-width: 400px;
                    `;
                    successMessage.innerHTML = `
                        <h3>✅ ¡Confirmado!</h3>
                        <p>Tu confirmación se guardó localmente.</p>
                        <p><small>Se sincronizará automáticamente cuando sea posible.</small></p>
                    `;
                    document.body.appendChild(successMessage);
                    
                    // Remover mensaje después de 3 segundos
                    setTimeout(() => {
                        if (successMessage.parentNode) {
                            successMessage.parentNode.removeChild(successMessage);
                        }
                    }, 3000);
                });
            });
        }

        // Inicializar el sistema de sincronización
        setupAutoSync();

    });
})();