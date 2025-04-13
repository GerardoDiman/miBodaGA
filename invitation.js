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
        rsvpSectionElements.forEach(el => el.style.display = 'none');
        if (qrDisplayContainer) qrDisplayContainer.style.display = 'none';
         if (validationViewContainer) validationViewContainer.style.display= 'block'; // Mostrar vista de validación para error
         if (validationViewContainer) validationViewContainer.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">${mensaje}</p>`;
    }

    /** Genera y muestra el código QR */
    function displayQrCode(invitado) {
        // 1. Verificar si los elementos HTML necesarios existen
        // (Asegúrate que qrDisplayContainer, qrCodeTargetDiv, qrGuestNameDisplay estén definidos fuera o pasados como argumento)
        if (!qrDisplayContainer || !qrCodeTargetDiv || !qrGuestNameDisplay) {
            console.error("displayQrCode: Faltan elementos HTML para el QR.");
            return; // No continuar si falta algo
        }
        // 2. Verificar si tenemos datos válidos del invitado y un ID
        if (!invitado || typeof invitado.id !== 'string' || invitado.id.trim() === '') {
            console.error("displayQrCode: Datos inválidos para generar QR. Invitado:", invitado);
            qrCodeTargetDiv.innerHTML = '<p style="color: red; font-size: small;">Error: Datos inválidos</p>'; // Mensaje de error
            qrGuestNameDisplay.textContent = '';
            qrDisplayContainer.style.display = 'flex'; // Mostrar el contenedor con el error
            document.body.classList.add('qr-code-shown'); // Ocultar botón
            if (confirmButton) confirmButton.style.display = 'none'; // Ocultar explícito
            return; // No continuar
        }
    
        console.log("Mostrando código QR para ID:", invitado.id); // Log del ID
        console.log("Elemento target para QR:", qrCodeTargetDiv); // Log del div target
    
        // 3. Limpiar contenido anterior
        qrCodeTargetDiv.innerHTML = '';
    
        // 4. Verificar si la biblioteca QRCode está disponible
        if (typeof QRCode === 'undefined') {
             console.error("displayQrCode: La biblioteca QRCode no está definida/cargada.");
             qrCodeTargetDiv.innerHTML = '<p style="color: red; font-size: small;">Error: Biblioteca QR no cargada</p>';
             qrGuestNameDisplay.textContent = invitado.nombre;
             qrDisplayContainer.style.display = 'flex'; // Mostrar contenedor con error
             document.body.classList.add('qr-code-shown');
             if (confirmButton) confirmButton.style.display = 'none';
             return; // No continuar
        }
    
        // 5. Construir la URL para la página de validación
        //    Usa 'id' como nombre del parámetro para que coincida con validar.js
        const validationPageUrl = `${window.location.origin}/validar.html?id=${invitado.id}`;
        console.log("URL para QR (validación):", validationPageUrl);
    
        // 6. Intentar generar el QR dentro de try...catch
        try {
            console.log("Intentando generar QR con URL:", validationPageUrl);
            new QRCode(qrCodeTargetDiv, {
                text: validationPageUrl, // <<< USAR LA URL DE VALIDACIÓN
                width: 160,
                height: 160,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H // Nivel alto de corrección es bueno para URLs
            });
            console.log("Llamada a new QRCode completada.");
    
            // Verificar si se añadió algo al div después de un instante
             setTimeout(() => {
                 if (qrCodeTargetDiv.innerHTML.trim() === '') {
                     console.warn("displayQrCode: El div target sigue vacío después de llamar a new QRCode.");
                     qrCodeTargetDiv.innerHTML = '<p style="color: red; font-size: small;">Error al dibujar QR</p>';
                 } else {
                     console.log("Contenido generado en qrCodeTargetDiv:", qrCodeTargetDiv.innerHTML.substring(0, 50) + "...");
                 }
             }, 100);
    
            // Mostrar nombre y contenedor QR
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
        elementsToHide.forEach(el => el.style.display = 'none');

        // Llenar datos de validación
        validationGuestName.textContent = invitado.nombre;
        validationPasses.textContent = invitado.pases;
        validationKids.textContent = invitado.ninos;

        // Mostrar el contenedor de validación
        validationViewContainer.style.display = 'block';
    }

    /** Actualiza la UI (botón/QR) basado en el estado de confirmación */
    function updateUIBasedOnConfirmation(confirmado) {
        console.log(`Actualizando UI - Estado Confirmado: ${confirmado}`);
        yaConfirmoSheet = confirmado;
        if (confirmado && invitadoActual) {
            displayQrCode(invitadoActual); // Mostrar QR
            if (confirmButton) { // Actualizar botón aunque esté oculto
                confirmButton.textContent = "¡Confirmado!";
                confirmButton.style.backgroundColor = '#4CAF50';
                confirmButton.disabled = true;
            }
        } else if (!confirmado && invitadoActual) {
            // Asegurar que la sección RSVP normal esté visible y el QR oculto
            rsvpSectionElements.forEach(el => {
                 // Restaurar display por defecto (quitando inline style)
                 // O poner el display correcto si conoces el original (ej. 'block', 'flex')
                 if(el.classList.contains('rsvp-options')) {
                     el.style.display = 'flex'; // Las opciones usan flex
                 } else if (el.classList.contains('confirm-main-rsvp-button')) {
                     el.style.display = 'inline-block'; // El botón principal
                 } else {
                     el.style.display = ''; // Otros elementos (heading, deadline, prompt)
                 }
            });
            if (qrDisplayContainer) qrDisplayContainer.style.display = 'none';
            document.body.classList.remove('qr-code-shown'); // Quitar clase CSS
            if (confirmButton) {
                confirmButton.textContent = "Confirmar";
                confirmButton.style.backgroundColor = ''; // Resetear color
                confirmButton.style.borderColor = ''; // Resetear borde si se cambió
                confirmButton.disabled = false;
                confirmButton.style.display = 'inline-block'; // Asegurar visibilidad
            }
        }
        // Actualizar LocalStorage como caché secundario
        const confirmationKey = `boda_confirmado_${invitadoActual?.id}`;
        if (confirmado) {
            try { localStorage.setItem(confirmationKey, 'true'); } catch(e){}
        } else {
            try { localStorage.removeItem(confirmationKey); } catch(e){}
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

            // Si es escaneo QR, mostrar validación y terminar
            if (isValidationScan) {
                displayValidationView(invitadoActual);
                return Promise.reject('ValidationViewShown'); // Detener cadena
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

            // 2. Verificar estado de confirmación con Google Script
            console.log("Verificando estado de confirmación...");
            const checkUrl = `${GOOGLE_APPS_SCRIPT_URL}?action=checkStatus&id=${guestId}&t=${Date.now()}`;
            return fetch(checkUrl); // Pasar la promesa al siguiente .then
        })
        .then(response => {
             // Este .then sólo se ejecuta si NO es validación y el fetch anterior fue OK
             if (!response.ok) { throw new Error(`Error ${response.status} verificando estado.`); }
             return response.json();
        })
        .then(data => {
             // Este .then sólo se ejecuta si NO es validación y el JSON de estado se parseó OK
             console.log("Respuesta del checkStatus:", data);
             confirmacionVerificada = true;
             updateUIBasedOnConfirmation(data.status === 'confirmed'); // Actualizar UI según estado
        })
        .catch(error => {
            // Manejar errores de fetch JSON, invitado no encontrado, o fetch de estado
            if (error === 'ValidationViewShown') {
                console.log("Mostrando vista de validación, flujo normal detenido.");
                return; // Error esperado, no mostrar mensaje genérico
            }
            console.error("Error en flujo inicial:", error);
            mostrarErrorCarga(error.message || "Error al cargar datos");
        });


    // --- Listener del Botón Confirmar ---
    if (confirmButton) {
        confirmButton.addEventListener('click', () => {
            // Verificar estado antes de enviar
            if (!invitadoActual || yaConfirmoSheet || confirmButton.disabled) {
                console.log("Confirmación no posible (sin datos, ya confirmado, o botón deshabilitado).");
                return;
            }

            confirmButton.disabled = true;
            confirmButton.textContent = "Confirmando...";
            const dataToSend = { id: invitadoActual.id, nombre: invitadoActual.nombre, pases: invitadoActual.pases, ninos: invitadoActual.ninos };

            // Enviar confirmación (POST)
            fetch(GOOGLE_APPS_SCRIPT_URL, { method: 'POST', cache: 'no-cache', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow', body: JSON.stringify(dataToSend) })
                .then(response => { // Manejar la respuesta del POST
                    if (!response.ok) {
                        // Si hay error, intentar leer mensaje del script
                         return response.json().catch(() => response.text()).then(err => {
                             throw new Error((typeof err === 'object' && err.message) || err || `Error del servidor al confirmar: ${response.status}`);
                         });
                    }
                    return response.json(); // Parsear respuesta de éxito o already_confirmed
                })
                .then(data => { // Procesar respuesta parseada
                    console.log("Respuesta del doPost:", data);
                    if (data.status === 'success' || data.status === 'already_confirmed') {
                        // Éxito o ya confirmado, mostrar QR
                        updateUIBasedOnConfirmation(true); // Actualizar UI al estado confirmado (mostrará QR)
                         if (data.status === 'already_confirmed') {
                              alert(data.message || "Ya habías confirmado previamente."); // Notificar si ya estaba
                         }
                    } else {
                        // Si el script devolvió status != success/already_confirmed
                        throw new Error(data.message || "Respuesta inesperada del servidor al confirmar.");
                    }
                })
                .catch(error => { // Capturar errores de red o del procesamiento de respuesta
                    console.error('Error al enviar/procesar confirmación POST:', error);
                     const displayError = (error.message && error.message.includes("Failed to fetch"))
                         ? "Error de red. Verifica tu conexión."
                         : (error.message || "Error desconocido.");
                    alert(`Hubo un error al confirmar: ${displayError}. Inténtalo de nuevo.`);
                    // Rehabilitar botón SÓLO si el estado REAL no es confirmado
                    if (!yaConfirmoSheet) {
                       confirmButton.disabled = false;
                       confirmButton.textContent = "Confirmar";
                    }
                });
        });
    } // Fin if (confirmButton)

}); // Fin de DOMContentLoaded