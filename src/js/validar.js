// validar.js
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        // --- Referencias a Elementos de validar.html ---
        const statusIcon = document.getElementById('validation-status-icon');
        const guestDetailsDiv = document.getElementById('guest-details');
        const guestNameEl = document.getElementById('val-guest-name');
        const passesEl = document.getElementById('val-passes');
        const kidsEl = document.getElementById('val-kids');
        const guestIdEl = document.getElementById('val-guest-id');
        const statusMessageEl = document.getElementById('status-message');
        const validationForm = document.getElementById('validation-form');
        const guestIdInput = document.getElementById('guest-id-input');

        // --- URL del Apps Script (¡¡REEMPLAZAR!!) ---
        const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPma1X-J0EgAPsYkXYhNT2I8LCSdANRa6CfcQLtFTVp8Xy5AZY5tAKm1apsE-0i9yW/exec';

        // --- Función para actualizar la UI ---
        function updateValidationUI(status, message, invitado = null) {
            statusIcon.classList.remove('fa-spinner', 'fa-spin', 'loading', 'fa-check-circle', 'success', 'fa-times-circle', 'error');
            statusMessageEl.classList.remove('loading-message', 'success', 'error');

            if (status === 'success' && invitado) {
                statusIcon.classList.add('fas', 'fa-check-circle', 'success');
                guestNameEl.textContent = invitado.nombre || 'No disponible';
                passesEl.textContent = invitado.pases != null ? invitado.pases : '-';
                kidsEl.textContent = invitado.ninos != null ? invitado.ninos : '-';
                guestIdEl.textContent = invitado.id || '---';
                guestDetailsDiv.style.display = 'block';
                statusMessageEl.textContent = message || "¡Invitado Válido!";
                statusMessageEl.classList.add('success');
            } else { // Error o no encontrado
                statusIcon.classList.add('fas', 'fa-times-circle', 'error');
                guestDetailsDiv.style.display = 'none';
                statusMessageEl.textContent = message || "Invitado no encontrado o error.";
                statusMessageEl.classList.add('error');
            }
        }

        // --- Función para realizar la validación ---
        function performValidation(guestId) {
            if (!guestId) {
                updateValidationUI('error', "No se proporcionó ID de invitado.");
                return;
            }
            console.log(`Validando ID: ${guestId}`);

            // Ocultar formulario y mostrar mensaje de carga
            if (validationForm) validationForm.style.display = 'none';
            statusMessageEl.textContent = "Verificando invitado...";
            statusMessageEl.classList.add('loading-message');
            statusIcon.classList.add('fas', 'fa-spinner', 'fa-spin', 'loading');
            guestDetailsDiv.style.display = 'none'; // Ocultar detalles anteriores

            // --- Llamar al Apps Script usando JSONP ---
            const callbackFunctionName = 'handleValidationResponse' + Date.now(); // Nombre único para evitar colisiones

            // Crear la URL para JSONP
            const validationUrl = `${GOOGLE_APPS_SCRIPT_URL}?action=getGuestDetails&id=${guestId}&callback=${callbackFunctionName}&t=${Date.now()}`;

            // Crear la etiqueta script
            const scriptTag = document.createElement('script');
            scriptTag.src = validationUrl;

            // Variable para controlar timeout
            let timeoutId = setTimeout(() => {
                console.error("Timeout esperando respuesta JSONP para:", callbackFunctionName);
                updateValidationUI('error', "No se recibió respuesta del servidor (timeout).");
                // Limpiar
                try { delete window[callbackFunctionName]; } catch(e){} // Eliminar función global
                try { document.body.removeChild(scriptTag); } catch (e) {}
            }, 10000); // Timeout de 10 segundos (ajustable)

            // Manejar errores de carga del script (problemas de red, etc.)
            scriptTag.onerror = () => {
                clearTimeout(timeoutId); // Cancelar timeout
                console.error("Error al cargar el script JSONP desde:", validationUrl);
                updateValidationUI('error', "Error de comunicación con el servidor.");
                // Limpiar
                try { document.body.removeChild(scriptTag); } catch (e) {}
                try { delete window[callbackFunctionName]; } catch (e) {}
            };

            // Definir la función de callback global ANTES de añadir el script
            window[callbackFunctionName] = (data) => {
                clearTimeout(timeoutId); // Cancelar timeout al recibir respuesta
                console.log("Respuesta JSONP recibida:", data);
                if (data.status === 'success' && data.invitado) {
                    updateValidationUI('success', "¡Invitado Válido!", data.invitado);
                } else {
                    // Invitado no encontrado o error devuelto por el script
                    updateValidationUI('error', data.message || "Invitado no encontrado.");
                }

                // Limpiar después de ejecutar
                try { document.body.removeChild(scriptTag); } catch (e) {}
                try { delete window[callbackFunctionName]; } catch (e) {}

                // Mostrar formulario de nuevo si hubo error
                if (data.status !== 'success' && validationForm) {
                     validationForm.style.display = 'block';
                }
            };

            // Añadir el script al body para ejecutar la solicitud
            console.log("Añadiendo script JSONP:", validationUrl);
            document.body.appendChild(scriptTag);
        }

        // --- Lógica Principal ---
        const urlParams = new URLSearchParams(window.location.search);
        const guestIdFromUrl = urlParams.get('id'); // <--- Leer parámetro 'id'

        if (guestIdFromUrl) {
            // Si el ID está en la URL, validar directamente
            performValidation(guestIdFromUrl);
        } else {
            // Si no hay ID en la URL, mostrar el formulario y esperar envío
            if (validationForm) validationForm.style.display = 'block';
            statusMessageEl.textContent = "Ingresa tu ID para validar.";
            statusMessageEl.classList.remove('loading-message', 'success', 'error');
            statusIcon.classList.remove('fas', 'fa-spinner', 'fa-spin', 'loading', 'fa-check-circle', 'success', 'fa-times-circle', 'error');
            statusIcon.classList.add('fas', 'fa-question-circle'); // Icono de pregunta o similar

            if (validationForm) {
                validationForm.addEventListener('submit', (event) => {
                    event.preventDefault();
                    const guestIdFromInput = guestIdInput.value.trim();
                    performValidation(guestIdFromInput);
                });
            }
        }

    }); // Fin DOMContentLoaded
})();