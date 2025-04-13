// invitation.js
document.addEventListener('DOMContentLoaded', () => {

    // --- Referencias a Elementos ---
    const guestNameElement = document.getElementById('guest-name-placeholder');
    const guestPassesElement = document.getElementById('guest-passes-placeholder');
    const guestKidsElement = document.getElementById('guest-kids-placeholder');
    const guestDetailsContainer = document.getElementById('guest-passes-details');
    const confirmButton = document.querySelector('.confirm-main-rsvp-button');
    const rsvpSectionElements = document.querySelectorAll('.rsvp-heading, .rsvp-deadline, .confirm-main-rsvp-button, .rsvp-contact-prompt, .rsvp-options'); // Elementos a ocultar/mostrar
    const qrDisplayContainer = document.getElementById('qr-code-display');
    const qrCodeTargetDiv = document.getElementById('qrcode-target');
    const qrGuestNameDisplay = document.getElementById('qr-guest-name-display');

    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzgPRD9WI4cj35G5LprFJKMjL4KNkKSN3fJtsBguv1SxRZikHf2uUiTmOPuo0tqQDTH/exec'; // <<< ¡¡TU URL!!

    let invitadoActual = null; // Datos del invitado cargados desde JSON
    let confirmacionVerificada = false; // Para saber si ya chequeamos con el script
    let yaConfirmoSheet = false; // Estado según Google Sheet

    // --- Funciones Helper ---
    function mostrarErrorCarga(mensaje = "Error al cargar datos") {
        if (guestNameElement) guestNameElement.textContent = mensaje;
        if (guestDetailsContainer) guestDetailsContainer.style.display = 'none';
        if (confirmButton) confirmButton.style.display = 'none';
        rsvpSectionElements.forEach(el => el.style.display = 'none'); // Ocultar sección RSVP
         if (qrDisplayContainer) qrDisplayContainer.style.display = 'none';
    }

    function displayQrCode(invitado) {
        // 1. Verificar si los elementos HTML necesarios existen
        if (!qrDisplayContainer || !qrCodeTargetDiv || !qrGuestNameDisplay) {
            console.error("displayQrCode: Faltan elementos HTML para el QR.");
            return; // No continuar si falta algo
        }
        // 2. Verificar si tenemos datos válidos del invitado y un ID
        if (!invitado || typeof invitado.id !== 'string' || invitado.id.trim() === '') {
            console.error("displayQrCode: Datos inválidos para generar QR. Invitado:", invitado);
            qrCodeTargetDiv.innerHTML = 'Error: Datos inválidos'; // Mensaje de error
            qrGuestNameDisplay.textContent = '';
            qrDisplayContainer.style.display = 'flex'; // Mostrar el contenedor con el error
            document.body.classList.add('qr-code-shown');
            if (confirmButton) confirmButton.style.display = 'none';
            return; // No continuar
        }

        console.log("Mostrando código QR para ID:", invitado.id); // Log del ID
        console.log("Elemento target para QR:", qrCodeTargetDiv); // Log del div target

        // 3. Limpiar contenido anterior
        qrCodeTargetDiv.innerHTML = '';

        // 4. Verificar si la biblioteca QRCode está disponible
        if (typeof QRCode === 'undefined') {
             console.error("displayQrCode: La biblioteca QRCode no está definida/cargada.");
             qrCodeTargetDiv.innerHTML = 'Error: Biblioteca QR no cargada';
             qrGuestNameDisplay.textContent = invitado.nombre;
             qrDisplayContainer.style.display = 'flex';
             document.body.classList.add('qr-code-shown');
             if (confirmButton) confirmButton.style.display = 'none';
             return; // No continuar
        }

        // 5. Intentar generar el QR dentro de try...catch
        try {
            console.log("Intentando generar QR...");
            new QRCode(qrCodeTargetDiv, {
                text: invitado.id, // Usar el ID único
                width: 160,
                height: 160,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            console.log("Llamada a new QRCode completada."); // Log de éxito (si no hay error síncrono)

            // Verificar si se añadió algo al div (img o canvas)
             setTimeout(() => { // Esperar un instante por si la generación es asíncrona
                 if (qrCodeTargetDiv.innerHTML.trim() === '') {
                     console.warn("displayQrCode: El div target sigue vacío después de llamar a new QRCode.");
                     qrCodeTargetDiv.innerHTML = 'Error al dibujar QR'; // Indicar problema
                 } else {
                     console.log("Contenido generado en qrCodeTargetDiv:", qrCodeTargetDiv.innerHTML.substring(0, 100) + "..."); // Muestra inicio del HTML interno
                 }
             }, 100); // Pequeña espera

            // Mostrar nombre y contenedor
            qrGuestNameDisplay.textContent = invitado.nombre;
            qrDisplayContainer.style.display = 'flex';
            document.body.classList.add('qr-code-shown');
            if (confirmButton) confirmButton.style.display = 'none';

        } catch(qrError) {
            console.error("displayQrCode: Error específico durante la generación del QR:", qrError);
            qrCodeTargetDiv.textContent = "Error al generar QR"; // Mostrar mensaje de error
            qrGuestNameDisplay.textContent = invitado.nombre; // Mostrar nombre aún con error
            qrDisplayContainer.style.display = 'flex'; // Mostrar contenedor con error
            document.body.classList.add('qr-code-shown');
            if (confirmButton) confirmButton.style.display = 'none';
        }
    }

    function updateUIBasedOnConfirmation(confirmado) {
         yaConfirmoSheet = confirmado;
         if (confirmado && invitadoActual) {
             displayQrCode(invitadoActual); // Mostrar QR si está confirmado
             // Opcional: Actualizar estado botón aunque esté oculto por la clase .qr-code-shown
              if (confirmButton) {
                 confirmButton.textContent = "¡Confirmado!";
                 confirmButton.style.backgroundColor = '#4CAF50';
                 confirmButton.disabled = true;
              }
         } else if (!confirmado && invitadoActual) {
             // Asegurar que elementos de confirmación estén visibles y QR oculto
             rsvpSectionElements.forEach(el => el.style.display = ''); // Resetear display
              if (qrDisplayContainer) qrDisplayContainer.style.display = 'none';
              document.body.classList.remove('qr-code-shown');
              if (confirmButton) {
                 confirmButton.textContent = "Confirmar";
                 confirmButton.style.backgroundColor = '';
                 confirmButton.style.borderColor = '';
                 confirmButton.disabled = false;
                 confirmButton.style.display = 'inline-block'; // Asegurar visibilidad
              }
         }
         // También guardar/borrar en localStorage si se quiere usar como caché secundario
         const confirmationKey = `boda_confirmado_${invitadoActual?.id}`;
         if (confirmado) {
              try { localStorage.setItem(confirmationKey, 'true'); } catch(e){}
         } else {
              try { localStorage.removeItem(confirmationKey); } catch(e){}
         }
    }


    // --- Lógica Principal ---
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('invitado');

    if (!guestId) {
        console.warn("No se especificó ID de invitado.");
        mostrarErrorCarga("Invitación Genérica");
        return;
    }
    console.log(`ID encontrado: ${guestId}`);

    // 1. Cargar datos del invitado DESDE JSON PRIMERO para tener el nombre
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
            console.log("Invitado encontrado en JSON:", invitadoActual);
            // Mostrar datos básicos inmediatamente
            guestNameElement.textContent = invitadoActual.nombre;
            guestPassesElement.textContent = invitadoActual.pases;
            guestKidsElement.textContent = invitadoActual.ninos;
            guestDetailsContainer.style.display = 'flex'; // Mostrar pases/niños
             // Lógica para ocultar niños si es 0 (como antes)
             const kidsSpanElement = guestDetailsContainer.querySelector('.guest-pass-kids');
             const separatorSpanElement = guestDetailsContainer.querySelector('.guest-pass-separator');
             if (invitadoActual.ninos === 0) {
                 if (kidsSpanElement) kidsSpanElement.style.display = 'none';
                 if (separatorSpanElement) separatorSpanElement.style.display = 'none';
                 const passesSpanElement = guestDetailsContainer.querySelector('.guest-pass-item:not(.guest-pass-kids)');
                 if (invitadoActual.pases === 1) { if(passesSpanElement) passesSpanElement.innerHTML = `<span id="guest-passes-placeholder">${invitadoActual.pases}</span> - PASE`; }
                 else { if(passesSpanElement) passesSpanElement.innerHTML = `<span id="guest-passes-placeholder">${invitadoActual.pases}</span> - PASES`; }
             } else {
                 if (kidsSpanElement) kidsSpanElement.style.display = 'inline';
                 if (separatorSpanElement) separatorSpanElement.style.display = 'inline';
                 const passesSpanElement = guestDetailsContainer.querySelector('.guest-pass-item:not(.guest-pass-kids)');
                 if(passesSpanElement) passesSpanElement.innerHTML = `<span id="guest-passes-placeholder">${invitadoActual.pases}</span> - PASES`;
             }


            // 2. AHORA, verificar estado de confirmación con Google Script
            console.log("Verificando estado de confirmación...");
            const checkUrl = `${GOOGLE_APPS_SCRIPT_URL}?action=checkStatus&id=${guestId}&t=${Date.now()}`; // Añadir timestamp para evitar caché
            return fetch(checkUrl); // Devolver la promesa del fetch
        })
        .then(response => {
             if (!response.ok) { throw new Error(`Error ${response.status} verificando estado.`); }
             return response.json();
        })
        .then(data => {
             console.log("Respuesta del checkStatus:", data);
             confirmacionVerificada = true;
             updateUIBasedOnConfirmation(data.status === 'confirmed');
        })
        .catch(error => {
            console.error("Error en carga inicial o verificación de estado:", error);
            // Si falla la verificación, podríamos asumir que no está confirmado o mostrar error
             mostrarErrorCarga("Error al cargar datos"); // O un mensaje más específico
             // O permitir confirmar de todas formas si falló el check:
             // if (invitadoActual && confirmButton) { confirmButton.style.display = 'inline-block'; }
        });


    // --- Listener del Botón Confirmar ---
    if (confirmButton) {
        confirmButton.addEventListener('click', () => {
            if (!invitadoActual || yaConfirmoSheet || confirmButton.disabled) {
                console.log("Confirmación no posible o ya realizada.");
                return;
            }

            confirmButton.disabled = true;
            confirmButton.textContent = "Confirmando...";
            const dataToSend = { id: invitadoActual.id, nombre: invitadoActual.nombre, pases: invitadoActual.pases, ninos: invitadoActual.ninos };

            fetch(GOOGLE_APPS_SCRIPT_URL, { method: 'POST', cache: 'no-cache', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, redirect: 'follow', body: JSON.stringify(dataToSend) })
                .then(response => {
                    if (!response.ok) { return response.json().catch(() => response.text()).then(err => { throw new Error(err || response.statusText); }); }
                    return response.json();
                })
                .then(data => {
                    console.log("Respuesta del doPost:", data);
                    if (data.status === 'success' || data.status === 'already_confirmed') {
                         // Mostrar QR en ambos casos (éxito o si ya estaba confirmado pero el check inicial falló)
                         displayQrCode(invitadoActual);
                         try { localStorage.setItem(`boda_confirmado_${invitadoActual.id}`, 'true'); } catch (e) {}
                         yaConfirmoSheet = true; // Marcar como confirmado
                    } else {
                        throw new Error(data.message || "Respuesta inesperada al confirmar.");
                    }
                })
                .catch(error => {
                    console.error('Error al enviar/procesar confirmación POST:', error);
                    alert(`Hubo un error al confirmar: ${error.message}. Inténtalo de nuevo.`);
                    // Rehabilitar solo si NO está ya confirmado en la hoja
                    if (!yaConfirmoSheet) {
                       confirmButton.disabled = false;
                       confirmButton.textContent = "Confirmar";
                    }
                });
        });
    }

}); // Fin DOMContentLoaded