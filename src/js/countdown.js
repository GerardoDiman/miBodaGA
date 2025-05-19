// countdown.js

(function() {
    document.addEventListener('DOMContentLoaded', () => {

        // --- ¡¡IMPORTANTE!! Define la Fecha y Hora Exacta de la Boda ---
        // Formato: 'YYYY-MM-DDTHH:mm:ss' (Año-Mes-DíaTHora:Minutos:Segundos)
        // Ejemplo: 11 de Octubre de 2025 a las 17:00 (5 PM)
        const weddingDateString = '2025-10-11T17:00:00';
        // -------------------------------------------------------------

        const weddingDate = new Date(weddingDateString).getTime(); // Convierte la fecha a milisegundos

        // Obtener referencias a los elementos donde mostraremos los números
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        const countdownTimerEl = document.getElementById('countdown'); // Contenedor general
        const countdownIntroEl = document.querySelector('.countdown-intro'); // "SOLO FALTAN"
        const countdownOutroEl = document.querySelector('.countdown-outro'); // "PARA LA BODA"

        // Verificar que todos los elementos existan
        if (!daysEl || !hoursEl || !minutesEl || !secondsEl || !countdownTimerEl || !countdownIntroEl || !countdownOutroEl) {
            console.error("Error: No se encontraron todos los elementos HTML necesarios para el countdown.");
            // Ocultar toda la sección de countdown si falta algo
            [countdownTimerEl, countdownIntroEl, countdownOutroEl].forEach(el => {
                if (el) el.style.display = 'none';
            });
            return; // Detener si faltan elementos
        }

        // Función para añadir un cero delante si el número es menor a 10
        const formatTime = time => time < 10 ? `0${time}` : time;

        // Función que actualiza el contador cada segundo
        const updateCountdown = () => {
            const now = new Date().getTime(); // Hora actual en milisegundos
            const distance = weddingDate - now; // Diferencia en milisegundos

            // Si la fecha ya pasó
            if (distance < 0) {
                clearInterval(intervalId); // Detener el intervalo
                countdownTimerEl.innerHTML = "<p class='wedding-day-message'>¡Llegó el Gran Día!</p>"; // Mensaje final
                [countdownIntroEl, countdownOutroEl].forEach(el => el.style.display = 'none');
                // Aplicar estilo al mensaje final (opcional)
                const messageEl = countdownTimerEl.querySelector('.wedding-day-message');
                if (messageEl) {
                    messageEl.classList.add('wedding-day-style');
                }
                return; // Salir de la función
            }

            // Cálculos para días, horas, minutos y segundos
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Actualizar el contenido de los elementos HTML
            daysEl.textContent = days; // No formateamos días usualmente
            hoursEl.textContent = formatTime(hours);
            minutesEl.textContent = formatTime(minutes);
            secondsEl.textContent = formatTime(seconds);
        };

        // Ejecutar la función una vez inmediatamente para evitar el delay inicial
        updateCountdown();

        // Establecer un intervalo para que se actualice cada segundo (1000 ms)
        const intervalId = setInterval(updateCountdown, 1000);

    }); // Fin de DOMContentLoaded
})();