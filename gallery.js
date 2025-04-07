// --- gallery.js ---

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
                slide.style.display = 'block'; // Asegurarse de que sea visible
            } else {
                slide.classList.remove('active'); // Ocultar los demás
                slide.style.display = 'none'; // Asegurarse de que esté oculto
            }
        });
    }

    // Event listener para el botón "Siguiente"
    nextButton.addEventListener('click', () => {
        // Calcular el índice del siguiente slide
        // El operador % (módulo) asegura que volvamos al inicio (0) si estamos en el último slide
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        showSlide(currentSlideIndex); // Mostrar el nuevo slide
    });

    // Event listener para el botón "Anterior"
    prevButton.addEventListener('click', () => {
        // Calcular el índice del slide anterior
        // Sumamos slides.length antes del módulo para evitar resultados negativos si currentSlideIndex es 0
        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        showSlide(currentSlideIndex); // Mostrar el nuevo slide
    });

    // Mostrar el primer slide inicialmente (asegura estado correcto al cargar)
    // Aunque el HTML ya tenga 'active', esto lo refuerza y maneja el display: none/block
    showSlide(currentSlideIndex);

} else {
    // Opcional: Mensaje si no se encuentran elementos de galería
    console.log("Elementos de la galería no encontrados. La funcionalidad de galería no se activará.");
    // Podrías ocultar los botones si no hay slides suficientes, por ejemplo.
    if(slides.length <= 1 && prevButton && nextButton){
        prevButton.style.display = 'none';
        nextButton.style.display = 'none';
    }
}