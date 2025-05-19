// --- gallery.js ---

(function() {
    // Obtener los elementos necesarios del DOM
    const prevButton = document.querySelector('.gallery-prev');
    const nextButton = document.querySelector('.gallery-next');
    const slides = document.querySelectorAll('.gallery-slide'); // Obtiene TODOS los slides

    // Verificar si hay elementos de galería antes de continuar
    if (prevButton && nextButton && slides.length > 0) {

        let currentSlideIndex = 0; // Índice del slide que se está mostrando actualmente

        // Función para mostrar un slide específico y ocultar los demás
        function showSlide(index) {
            // Recorrer todos los slides
            slides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.add('active'); // Mostrar el slide deseado
                    slide.setAttribute('aria-hidden', 'false'); // Accesibilidad
                } else {
                    slide.classList.remove('active'); // Ocultar los demás
                    slide.setAttribute('aria-hidden', 'true'); // Accesibilidad
                }
            });
        }

        // Función para manejar la navegación
        function navigateSlides(direction) {
            if (direction === 'next') {
                currentSlideIndex = (currentSlideIndex + 1) % slides.length;
            } else if (direction === 'prev') {
                currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
            }
            showSlide(currentSlideIndex);
        }

        // Event listener para el botón "Siguiente"
        nextButton.addEventListener('click', () => navigateSlides('next'));

        // Event listener para el botón "Anterior"
        prevButton.addEventListener('click', () => navigateSlides('prev'));

        // Agregar soporte para navegación con teclado
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight') {
                navigateSlides('next');
            } else if (event.key === 'ArrowLeft') {
                navigateSlides('prev');
            }
        });

        // Mostrar el primer slide inicialmente (asegura estado correcto al cargar)
        showSlide(currentSlideIndex);

    } else {
        // Opcional: Mensaje si no se encuentran elementos de galería
        console.log("Elementos de la galería no encontrados. La funcionalidad de galería no se activará.");
        // Podrías ocultar los botones si no hay slides suficientes, por ejemplo.
        if (slides.length <= 1 && prevButton && nextButton) {
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
        }
    }
})();