// validar.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a Elementos de validar.html ---
    const statusIcon = document.getElementById('validation-status-icon');
    const guestDetailsDiv = document.getElementById('guest-details');
    const guestNameEl = document.getElementById('val-guest-name');
    const passesEl = document.getElementById('val-passes');
    const kidsEl = document.getElementById('val-kids');
    const guestIdEl = document.getElementById('val-guest-id');
    const statusMessageEl = document.getElementById('status-message');

    // --- URL del Apps Script (¡¡REEMPLAZAR!!) ---
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzgPRD9WI4cj35G5LprFJKMjL4KNkKSN3fJtsBguv1SxRZikHf2uUiTmOPuo0tqQDTH/exec';

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

    // --- Lógica Principal ---
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('id'); // <--- Leer parámetro 'id'

    if (!guestId) {
        updateValidationUI('error', "No se proporcionó ID de invitado en la URL.");
        return;
    }
    console.log(`Validando ID: ${guestId}`);

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
          // Quitar el script tag si aún existe podría ser problemático aquí
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
    };

    // Añadir el script al body para ejecutar la solicitud
    console.log("Añadiendo script JSONP:", validationUrl);
    document.body.appendChild(scriptTag);

}); // Fin DOMContentLoaded