// Espera a que todo el HTML esté cargado y listo
document.addEventListener('DOMContentLoaded', () => {

    // Obtener referencias a los elementos HTML que actualizaremos
    const guestNameElement = document.getElementById('guest-name-placeholder');
    const guestPassesElement = document.getElementById('guest-passes-placeholder');
    const guestKidsElement = document.getElementById('guest-kids-placeholder');
    const guestDetailsContainer = document.getElementById('guest-passes-details'); // El <span> que contiene pases/niños

    // Verificar si los elementos existen (buena práctica)
    if (!guestNameElement || !guestPassesElement || !guestKidsElement || !guestDetailsContainer) {
        console.error("Error: No se encontraron todos los elementos placeholder necesarios en el HTML.");
        // Podrías mostrar un error genérico en la página aquí si lo deseas
        if(guestNameElement) guestNameElement.textContent = "Error en la página";
        return; // Detener la ejecución si faltan elementos clave
    }

    // --- PASO 1: Obtener el ID del invitado desde la URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const guestId = urlParams.get('invitado'); // Busca el parámetro "?invitado=CODIGO"

    // Verificar si se proporcionó un ID en la URL
    if (!guestId) {
        console.warn("No se especificó un código de invitado en la URL.");
        guestNameElement.textContent = "Invitación Genérica"; // Mostrar un título genérico
        guestDetailsContainer.style.display = 'none'; // Ocultar pases/niños
        // Podrías ocultar otras secciones o mostrar un mensaje diferente
        return; // Detener si no hay ID
    }

    console.log(`ID de invitado encontrado en URL: ${guestId}`);

    // --- PASO 2: Cargar los datos de los invitados desde invitados.json ---
    fetch('invitados.json') // Asegúrate que el archivo esté en la misma ruta o ajusta la ruta
        .then(response => {
            // Verificar si la respuesta del servidor fue exitosa
            if (!response.ok) {
                // Lanza un error si hubo problemas (ej. archivo no encontrado 404)
                throw new Error(`Error al cargar invitados.json: ${response.status} ${response.statusText}`);
            }
            // Convertir la respuesta a formato JSON
            return response.json();
        })
        .then(invitados => {
            // --- PASO 3: Buscar al invitado específico usando el ID ---
            console.log("Datos de invitados cargados:", invitados); // Para depuración
            const invitadoActual = invitados.find(inv => inv.id === guestId);

            // --- PASO 4: Actualizar el HTML con los datos encontrados ---
            if (invitadoActual) {
                console.log("Invitado encontrado:", invitadoActual);

                // Actualizar Nombre
                guestNameElement.textContent = invitadoActual.nombre;

                // Actualizar Pases y Niños (placeholders)
                guestPassesElement.textContent = invitadoActual.pases;
                guestKidsElement.textContent = invitadoActual.ninos;

                // Mostrar el contenedor principal de la línea
                guestDetailsContainer.style.display = 'flex'; // Asegurar que el contenedor sea visible

                // Referencias a los spans específicos
                const kidsSpanElement = guestDetailsContainer.querySelector('.guest-pass-kids');
                const separatorSpanElement = guestDetailsContainer.querySelector('.guest-pass-separator');

                if (invitadoActual.ninos === 0) {
                    // Ocultar sección Niños y separador si no hay niños
                    if (kidsSpanElement) kidsSpanElement.style.display = 'none';
                    if (separatorSpanElement) separatorSpanElement.style.display = 'none';

                    // Opcional: Cambiar "PASES" a "PASE" si solo hay 1 pase
                    const passesSpanElement = guestDetailsContainer.querySelector('.guest-pass-item:not(.guest-pass-kids)'); // Selecciona el primer item (Pases)
                    if (invitadoActual.pases === 1) {
                        if (passesSpanElement) passesSpanElement.innerHTML = `<span id="guest-passes-placeholder">${invitadoActual.pases}</span> - PASE`;
                    } else {
                        if (passesSpanElement) passesSpanElement.innerHTML = `<span id="guest-passes-placeholder">${invitadoActual.pases}</span> - PASES`; // Asegurar plural
                    }

                } else {
                    // Asegurarse que estén visibles si hay niños
                    if (kidsSpanElement) kidsSpanElement.style.display = 'inline'; // O 'inline-block'
                    if (separatorSpanElement) separatorSpanElement.style.display = 'inline'; // O 'inline-block'

                    // Asegurar texto plural para pases
                    const passesSpanElement = guestDetailsContainer.querySelector('.guest-pass-item:not(.guest-pass-kids)');
                     if (passesSpanElement) passesSpanElement.innerHTML = `<span id="guest-passes-placeholder">${invitadoActual.pases}</span> - PASES`;
                }

            } else {
                // ... (Manejo ID no encontrado) ...
                guestNameElement.textContent = "Invitación No Válida";
                guestDetailsContainer.style.display = 'none';
            }
})});