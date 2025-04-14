// invitation.js

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
    const validationGuestName = document.getElementById('validation-guest-name');
    const validationPasses = document.getElementById('validation-passes');
    const validationKids = document.getElementById('validation-kids');

    // --- Configuraciones ---
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzgPRD9WI4cj35G5LprFJKMjL4KNkKSN3fJtsBguv1SxRZikHf2uUiTmOPuo0tqQDTH/exec'; // <<< ¡¡TU URL!!
    const BASE_INVITATION_URL = window.location.origin + window.location.pathname;

    // --- Variables de Estado ---
    let invitadoActual = null;
    let confirmacionVerificada = false; // ¿Se pudo verificar con el script?
    let yaConfirmoSheet = false; // ¿Está confirmado según la hoja?

    // --- Funciones Helper ---

    /** Muestra un mensaje de error genérico o específico */
    function mostrarErrorCarga(mensaje = "Error al cargar datos") {
        console.error("Error Carga/Validación:", mensaje);
        if (guestNameElement) guestNameElement.textContent = mensaje;
        if (guestDetailsContainer) guestDetailsContainer.style.display = 'none';
        if (confirmButton) confirmButton.style.display = 'none';
        rsvpSectionElements.forEach(el => { if(el) el.style.display = 'none'; }); // Ocultar sección RSVP
        if (qrDisplayContainer) qrDisplayContainer.style.display = 'none';
        if (validationViewContainer) {
             validationViewContainer.style.display= 'block'; // Mostrar vista de validación para error
             validationViewContainer.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">${mensaje}</p>`;
        }
    }

    /** Genera y muestra el código QR */
    function displayQrCode(invitado) {
        // 1. Verificar elementos HTML
        if (!qrDisplayContainer || !qrCodeTargetDiv || !qrGuestNameDisplay) {
            console.error("displayQrCode: Faltan elementos HTML para el QR.");
            return;
        }
        // 2. Verificar datos del invitado
        if (!invitado || typeof invitado.id !== 'string' || invitado.id.trim() === '') {
            console.error("displayQrCode: Datos inválidos para generar QR. Invitado:", invitado);
            qrCodeTargetDiv.innerHTML = '<p style="color: red; font-size: small;">Error: Datos inválidos</p>';
            qrGuestNameDisplay.textContent = '';
            qrDisplayContainer.style.display = 'flex';
            document.body.classList.add('qr-code-shown');
            if (confirmButton) confirmButton.style.display = 'none';
            return;
        }
         // 3. Verificar biblioteca QRCode
         if (typeof QRCode === 'undefined') {
             console.error("displayQrCode: La biblioteca QRCode no está definida/cargada.");
             qrCodeTargetDiv.innerHTML = '<p style="color: red; font-size: small;">Error: Biblioteca QR no cargada</p>';
             qrGuestNameDisplay.textContent = invitado.nombre;
             qrDisplayContainer.style.display = 'flex';
             document.body.classList.add('qr-code-shown');
             if (confirmButton) confirmButton.style.display = 'none';
             return;
         }

        console.log("Mostrando código QR para ID:", invitado.id);
        qrCodeTargetDiv.innerHTML = ''; // Limpiar

        // 4. Construir URL de Validación
        const validationPageUrl = `${BASE_INVITATION_URL.replace('index.html', 'validar.html')}?id=${invitado.id}`;
        console.log("URL para QR (validación):", validationPageUrl);

        // 5. Generar QR
        try {
            new QRCode(qrCodeTargetDiv, {
                text: validationPageUrl,
                width: 160,
                height: 160,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            console.log("Llamada a new QRCode completada.");

            // Verificar contenido generado (opcional)
             setTimeout(() => {
                 if (qrCodeTargetDiv.innerHTML.trim() === '') {
                     console.warn("displayQrCode: El div target sigue vacío después de llamar a new QRCode.");
                     qrCodeTargetDiv.innerHTML = '<p style="color: red; font-size: small;">Error al dibujar QR</p>';
                 }
             }, 100);

            // 6. Mostrar resultado
            qrGuestNameDisplay.textContent = invitado.nombre;
            qrDisplayContainer.style.display = 'flex';
            document.body.classList.add('qr-code-shown'); // Activar CSS para ocultar botón
            if (confirmButton) confirmButton.style.display = 'none'; // Ocultar explícito

        } catch(qrError) {
            console.error("displayQrCode: Error específico durante la generación del QR:", qrError);
            qrCodeTargetDiv.textContent = "Error al generar QR";
            qrGuestNameDisplay.textContent = invitado.nombre;
            qrDisplayContainer.style.display = 'flex';
            document.body.classList.add('qr-code-shown');
            if (confirmButton) confirmButton.style.display = 'none';
        }
    } // --- Fin de displayQrCode ---


    /** Muestra la vista de validación simple */
    function displayValidationView(invitado) {
        if (!validationViewContainer || !validationGuestName || !validationPasses || !validationKids || !invitado) {
            console.error("Faltan elementos o datos para la vista de validación.");
            mostrarErrorCarga("Error al mostrar validación");
            return;
        }
        console.log("Mostrando vista de validación para:", invitado.nombre);

        // Ocultar TODO excepto la vista de validación
        const elementsToHide = document.querySelectorAll('.container > section:not(#validation-view), .container > header, .container > main, .container > footer, #audio-controls-container');
        elementsToHide.forEach(el => { if(el) el.style.display = 'none'; }); // Añadido chequeo de nulidad por si acaso

        // Llenar datos de validación
        validationGuestName.textContent = invitado.nombre;
        validationPasses.textContent = invitado.pases;
        validationKids.textContent = invitado.ninos;
        const validationGuestIdEl = document.getElementById('val-guest-id'); // Obtenerlo aquí por si acaso
        if(validationGuestIdEl) validationGuestIdEl.textContent = invitado.id;


        // Mostrar el contenedor de validación
        validationViewContainer.style.display = 'block';
    }


    /** Actualiza la UI (botón/QR) basado en el estado de confirmación */
    function updateUIBasedOnConfirmation(confirmado) {
        console.log(`Actualizando UI - Estado Confirmado: ${confirmado}`);
        yaConfirmoSheet = confirmado; // Actualizar estado global

        if (confirmado && invitadoActual) {
            displayQrCode(invitadoActual); // Mostrar QR si está confirmado
        } else if (!confirmado && invitadoActual) {
            // Asegurar que la sección RSVP normal esté visible y el QR oculto
            rsvpSectionElements.forEach(el => {
                 if(el) { // Chequeo extra
                     const tagName = el.tagName.toLowerCase();
                     const classes = el.classList;
                     if(classes.contains('rsvp-options')) { el.style.display = 'flex'; }
                     else if (classes.contains('confirm-main-rsvp-button')) { el.style.display = 'inline-block'; }
                     else { el.style.display = ''; } // Resetear otros (heading, deadline, prompt)
                 }
            });
            if (qrDisplayContainer) qrDisplayContainer.style.display = 'none';
            document.body.classList.remove('qr-code-shown'); // Quitar clase CSS
            if (confirmButton) { // Asegurar estado correcto del botón
                confirmButton.textContent = "Confirmar";
                confirmButton.style.backgroundColor = '';
                confirmButton.style.borderColor = '';
                confirmButton.disabled = false;
                confirmButton.style.display = 'inline-block';
            }
        }

        // Actualizar LocalStorage como caché secundario
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
    const isValidationScan = urlParams.get('val') === '1';

    if (!guestId) {
        console.warn("No se especificó ID de invitado.");
        mostrarErrorCarga("Invitación Genérica");
        return;
    }
    console.log(`ID: ${guestId}, Es Validación: ${isValidationScan}`);

    // 1. Cargar datos del invitado desde JSON
    fetch('invitados.json')
        .then(response => {
            if (!response.ok) { throw new Error(`Error ${response.status} cargando invitados.json`); }
            return response.json();
        })
        .then(invitados => {
            invitadoActual = invitados.find(inv => inv.id === guestId);
            if (!invitadoActual) {
                throw new Error(`Invitado con ID "${guestId}" no encontrado en invitados.json.`);
            }
            console.log("Datos del invitado cargados:", invitadoActual);

            // Si es escaneo QR, mostrar validación y terminar el flujo aquí
            if (isValidationScan) {
                displayValidationView(invitadoActual);
                return Promise.reject('ValidationViewShown'); // Detener cadena para no verificar estado
            }

            // Si es invitación normal, mostrar datos básicos
            guestNameElement.textContent = invitadoActual.nombre;
            guestPassesElement.textContent = invitadoActual.pases;
            guestKidsElement.textContent = invitadoActual.ninos;
            guestDetailsContainer.style.display = 'flex';
            // Lógica ocultar/mostrar niños/pases (singular/plural)
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

            // 2. Verificar estado usando JSONP (solo para invitación normal)
            console.log("Verificando estado de confirmación (JSONP)...");
            const callbackCheckStatus = 'handleCheckStatusResponse' + Date.now();
            const checkUrl = `${GOOGLE_APPS_SCRIPT_URL}?action=checkStatus&id=${guestId}&callback=${callbackCheckStatus}&t=${Date.now()}`;
            const scriptCheckTag = document.createElement('script');
            scriptCheckTag.src = checkUrl;
            let checkTimeoutId = setTimeout(() => {
                 console.warn("Timeout esperando respuesta checkStatus. Asumiendo no confirmado.");
                 updateUIBasedOnConfirmation(false); // Asumir no confirmado
                 try { delete window[callbackCheckStatus]; } catch(e){}
            }, 10000); // Timeout 10s

            scriptCheckTag.onerror = () => {
                clearTimeout(checkTimeoutId);
                console.error("Error al cargar script JSONP checkStatus.");
                updateUIBasedOnConfirmation(false); // Asumir no confirmado
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
        // Este catch ahora maneja errores del fetch('invitados.json') o si era ValidationView
        .catch(error => {
            if (error === 'ValidationViewShown') {
                console.log("Mostrando vista de validación, flujo normal detenido.");
                return; // No es un error real para el usuario final de la invitación
            }
            console.error("Error en carga inicial o fetch invitados:", error);
            mostrarErrorCarga(error.message || "Error al cargar datos");
        });


    // --- Listener del Botón Confirmar ---
    if (confirmButton) {
        confirmButton.addEventListener('click', () => {
            if (!invitadoActual || yaConfirmoSheet || confirmButton.disabled) {
                console.log("Clic en Confirmar ignorado (sin datos, ya confirmado, o botón deshabilitado).");
                return;
            }

            confirmButton.disabled = true;
            confirmButton.textContent = "Confirmando...";
            const dataToSend = { id: invitadoActual.id, nombre: invitadoActual.nombre, pases: invitadoActual.pases, ninos: invitadoActual.ninos };

            console.log("Datos a enviar (POST):", dataToSend); // <<< AÑADE ESTE LOG
            let bodyString;
            try {
                bodyString = JSON.stringify(dataToSend);
                console.log("Body stringificado:", bodyString); // <<< AÑADE ESTE LOG
            } catch (stringifyError) {
                console.error("Error al stringificar dataToSend:", stringifyError);
                alert("Error interno al preparar datos. No se pudo confirmar.");
                confirmButton.disabled = false; // Rehabilitar botón
                confirmButton.textContent = "Confirmar";
                return; // Detener
            }

            fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // <<< VOLVER A AÑADIR ESTO
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8', // <<< Asegurar text/plain
                },
                redirect: 'follow',
                body: JSON.stringify(dataToSend)
            })
            .then(response => {
                // Con 'no-cors', no podemos leer 'response'. Asumimos éxito si no hay error de red.
                console.log("Solicitud POST de confirmación enviada (no-cors).");
    
                // Actualizar UI inmediatamente (feedback optimista)
                updateUIBasedOnConfirmation(true); // Mostrar QR, etc.
                 // Mostrar un mensaje de éxito más genérico ya que no leímos la respuesta real
                 // alert("¡Gracias por confirmar!"); // Opcional
    
            })
            .catch(error => {
                // Este catch ahora SÓLO captura errores de RED (ej. sin conexión, URL mal)
                console.error('Error de RED al enviar confirmación POST:', error);
                alert(`Hubo un error de red al intentar confirmar. Verifica tu conexión.`);
                // Rehabilitar botón SÓLO si el estado REAL NO es confirmado (yaConfirmoSheet es false)
                // La UI se revierte en el siguiente checkStatus si la confirmación falló en el script
                if (!yaConfirmoSheet) {
                   confirmButton.disabled = false;
                   confirmButton.textContent = "Confirmar";
                }
            });
        });
    } // Fin if (confirmButton)

}); // Fin de DOMContentLoaded