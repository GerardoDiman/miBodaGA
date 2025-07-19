// --- gallery.js ---

(function() {
    // Obtener los elementos necesarios del DOM
    const prevButton = document.querySelector('.gallery-prev');
    const nextButton = document.querySelector('.gallery-next');
    const prevButtonMobile = document.querySelector('.gallery-prev-mobile');
    const nextButtonMobile = document.querySelector('.gallery-next-mobile');
    const slides = document.querySelectorAll('.gallery-slide');
    const indicators = document.querySelectorAll('.gallery-indicator');

    // Verificar si hay elementos de galería antes de continuar
    if (slides.length > 0) {

        let currentSlideIndex = 0;
        const totalSlides = slides.length;

        // Función para mostrar un slide específico y ocultar los demás
        function showSlide(index) {
            // Recorrer todos los slides
            slides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.add('active');
                    slide.setAttribute('aria-hidden', 'false');
                } else {
                    slide.classList.remove('active');
                    slide.setAttribute('aria-hidden', 'true');
                }
            });

            // Actualizar indicadores
            indicators.forEach((indicator, i) => {
                if (i === index) {
                    indicator.classList.add('active');
                } else {
                    indicator.classList.remove('active');
                }
            });
        }

        // Función para manejar la navegación
        function navigateSlides(direction) {
            if (direction === 'next') {
                currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
            } else if (direction === 'prev') {
                currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
            }
            showSlide(currentSlideIndex);
        }

        // Función para ir a un slide específico
        function goToSlide(index) {
            if (index >= 0 && index < totalSlides) {
                currentSlideIndex = index;
                showSlide(currentSlideIndex);
            }
        }

        // Event listeners para botones de navegación
        if (prevButton) {
            prevButton.addEventListener('click', () => navigateSlides('prev'));
        }
        if (nextButton) {
            nextButton.addEventListener('click', () => navigateSlides('next'));
        }
        if (prevButtonMobile) {
            prevButtonMobile.addEventListener('click', () => navigateSlides('prev'));
        }
        if (nextButtonMobile) {
            nextButtonMobile.addEventListener('click', () => navigateSlides('next'));
        }

        // Event listeners para indicadores
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => goToSlide(index));
        });

        // Agregar soporte para navegación con teclado
        document.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight') {
                navigateSlides('next');
            } else if (event.key === 'ArrowLeft') {
                navigateSlides('prev');
            }
        });

        // Mostrar el primer slide inicialmente
        showSlide(currentSlideIndex);

        // Ocultar botones si solo hay una imagen
        if (totalSlides <= 1) {
            [prevButton, nextButton, prevButtonMobile, nextButtonMobile].forEach(button => {
                if (button) button.style.display = 'none';
            });
            const indicatorsContainer = document.querySelector('.gallery-indicators');
            if (indicatorsContainer) indicatorsContainer.style.display = 'none';
        }

    } else {
        console.log("Elementos de la galería no encontrados. La funcionalidad de galería no se activará.");
    }
})();