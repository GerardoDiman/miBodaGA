// --- countdown.js ---

// --- CONFIGURACIÓN ---
// ¡¡IMPORTANTE!! Cambia esta fecha a la fecha y hora EXACTA de tu boda.
// Formato: Mes Día, Año HH:MM:SS (Mes en inglés)
// Ejemplo: 'Oct 11, 2024 16:00:00' para el 11 de Octubre de 2024 a las 4:00 PM
const weddingDateString = 'Oct 11, 2025 20:00:00';
// --------------------

// Obtener los elementos del DOM donde mostraremos los números
const daysElement = document.getElementById('days');
const hoursElement = document.getElementById('hours');
const minutesElement = document.getElementById('minutes');
const secondsElement = document.getElementById('seconds');
const countdownContainer = document.getElementById('countdown'); // El contenedor general

// Convertir la fecha de la boda a un objeto Date y obtener su valor en milisegundos
const weddingDate = new Date(weddingDateString).getTime();

// Función para actualizar el contador
function updateCountdown() {
    // Obtener la fecha y hora actual en milisegundos
    const now = new Date().getTime();

    // Calcular la diferencia entre la fecha de la boda y ahora
    const distance = weddingDate - now;

    // Si la fecha ya pasó
    if (distance < 0) {
        clearInterval(interval); // Detener el intervalo
        if (countdownContainer) {
             // Opcional: Mostrar un mensaje cuando la cuenta llega a cero
             countdownContainer.innerHTML = "<p class='countdown-finished'>¡EL GRAN DÍA HA LLEGADO!</p>";
             // O podrías simplemente poner todo a 0
             // daysElement.textContent = '0';
             // hoursElement.textContent = '0';
             // minutesElement.textContent = '0';
             // secondsElement.textContent = '0';
        }
        return; // Salir de la función
    }

    // Calcular días, horas, minutos y segundos
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Actualizar el contenido de los elementos HTML
    // Usamos textContent porque solo estamos cambiando el texto
    if (daysElement) daysElement.textContent = days;
    if (hoursElement) hoursElement.textContent = hours;
    if (minutesElement) minutesElement.textContent = minutes;
    if (secondsElement) secondsElement.textContent = seconds;
}

// Llamar a la función una vez inmediatamente para que no se vean los números estáticos iniciales
updateCountdown();

// Actualizar el contador cada segundo (1000 milisegundos)
const interval = setInterval(updateCountdown, 1000);

// Opcional: Añadir estilo para el mensaje final en styles.css
/*
.countdown-finished {
    font-family: 'Playfair Display', serif;
    font-size: 1.5em;
    color: #d1b7a0;
    text-align: center;
    padding: 20px 0;
}
*/