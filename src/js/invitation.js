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
            if (guestNameElement) guestNameElement.textContent = mensaje;
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
                try { localStorage.setItem(confirmationKey, 'true'); } catch(e){ console.warn("No se pudo escribir en localStorage", e); }
            } else {
                try { localStorage.removeItem(confirmationKey); } catch(e){ console.warn("No se pudo borrar de localStorage", e); }
            }
        }

        // --- Lógica Principal al Cargar la Página ---
        const urlParams = new URLSearchParams(window.location.search);
        const guestId = urlParams.get('invitado');

        if (!guestId) {
            console.warn("No se especificó ID de invitado.");
            mostrarErrorCarga("Invitación Genérica");
            return;
        }
        console.log(`ID invitado: ${guestId}`);        fetch('data/invitados.json')
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

                guestNameElement.textContent = invitadoActual.nombre;
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

                fetch(GOOGLE_APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', cache: 'no-cache', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow', body: JSON.stringify(dataToSend) })
                    .then(response => {
                        console.log("Solicitud POST de confirmación enviada (no-cors).");
                        // Llamamos a displayQrCode para mostrar el QR después de confirmar
                        updateUIBasedOnConfirmation(true); 
                    })
                    .catch(error => {
                        console.error('Error de RED al enviar confirmación POST:', error);
                        alert(`Hubo un error de red al intentar confirmar. Verifica tu conexión.`);
                        if (!yaConfirmoSheet) {
                            confirmButton.disabled = false;
                            confirmButton.textContent = "Confirmar";
                        }
                    });
            });
        }

    });
})();