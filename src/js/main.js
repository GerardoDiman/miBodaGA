// Funcionalidad para añadir al calendario
document.getElementById('addToCalendar').addEventListener('click', function(e) {
    e.preventDefault();
      // Crear el evento
    const event = {
        title: 'Boda de Alejandra y Gerardo',
        description: '¡Celebra con nosotros nuestra boda!',
        start: '2025-10-11T17:00:00',
        end: '2025-10-12T02:00:00',
        location: 'Parroquia de San Sebastian, Comitán de Domínguez, Chiapas'
    };

    // Crear el link para Google Calendar
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start.replace(/[-:]/g, '')}/${event.end.replace(/[-:]/g, '')}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;

    // Abrir en una nueva ventana
    window.open(googleCalendarUrl, '_blank');
});