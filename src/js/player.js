(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const audio = document.getElementById('background-audio');
        const toggleButton = document.getElementById('audio-toggle-button');
        const playPauseIcon = document.getElementById('play-pause-icon');
        const volumeSlider = document.getElementById('volume-slider');
        const volumeIcon = document.getElementById('volume-icon');

        // Validar que los elementos existen
        if (!audio || !toggleButton || !playPauseIcon || !volumeSlider || !volumeIcon) {
            console.error("Error: No se encontraron los elementos del reproductor de audio.");
            return;
        }

        // --- Configuración Inicial del Volumen ---
        const initialVolume = 0.3; // <<< Volumen inicial (30%). ¡AJUSTA ESTE VALOR! (0.0 a 1.0)
        audio.volume = initialVolume;
        volumeSlider.value = initialVolume * 100; // Sincronizar slider (0 a 100)
        updateVolumeIcon(initialVolume); // Actualizar icono inicial

        // --- INTENTAR AUTOPLAY AL CARGAR ---
        audio.play()
            .then(() => {
                playPauseIcon.classList.remove('fa-play');
                playPauseIcon.classList.add('fa-pause');
                console.log("Autoplay de audio iniciado correctamente.");
            })
            .catch(error => {
                console.warn("Autoplay de audio bloqueado por el navegador:", error);
                playPauseIcon.classList.remove('fa-pause');
                playPauseIcon.classList.add('fa-play');
            });

        // --- Event Listener Botón Play/Pause ---
        toggleButton.addEventListener('click', () => {
            if (audio.paused) {
                audio.play()
                    .then(() => {
                        playPauseIcon.classList.remove('fa-play');
                        playPauseIcon.classList.add('fa-pause');
                        console.log("Audio reproduciendo");
                    })
                    .catch(error => {
                        console.error("Error al intentar reproducir audio:", error);
                    });
            } else {
                audio.pause();
                playPauseIcon.classList.remove('fa-pause');
                playPauseIcon.classList.add('fa-play');
                console.log("Audio pausado");
            }
        });

        // --- Event Listener Slider de Volumen ---
        volumeSlider.addEventListener('input', () => {
            const newVolume = volumeSlider.value / 100;
            audio.volume = newVolume;
            updateVolumeIcon(newVolume);
        });

        // --- Event Listener Icono de Volumen (para Mute/Unmute) ---
        let previousVolume = audio.volume; // Guardar volumen antes de mutear
        volumeIcon.addEventListener('click', () => {
            if (audio.volume > 0) {
                previousVolume = audio.volume; // Guardar volumen actual
                audio.volume = 0;
                volumeSlider.value = 0;
                updateVolumeIcon(0);
            } else {
                const volumeToRestore = previousVolume > 0.01 ? previousVolume : initialVolume;
                audio.volume = volumeToRestore;
                volumeSlider.value = volumeToRestore * 100;
                updateVolumeIcon(volumeToRestore);
            }
        });

        // --- Función para actualizar el icono de volumen ---
        function updateVolumeIcon(volume) {
            volumeIcon.classList.remove('fa-volume-high', 'fa-volume-low', 'fa-volume-xmark');
            if (volume <= 0.01) {
                volumeIcon.classList.add('fa-volume-xmark');
            } else if (volume < 0.5) {
                volumeIcon.classList.add('fa-volume-low');
            } else {
                volumeIcon.classList.add('fa-volume-high');
            }
        }

        // --- Eventos Adicionales ---
        audio.addEventListener('ended', () => {
            if (!audio.loop) {
                playPauseIcon.classList.remove('fa-pause');
                playPauseIcon.classList.add('fa-play');
            }
        });

        audio.addEventListener('pause', () => {
            if (!audio.paused && playPauseIcon.classList.contains('fa-pause')) {
                playPauseIcon.classList.remove('fa-pause');
                playPauseIcon.classList.add('fa-play');
            }
        });

        audio.addEventListener('play', () => {
            if (!audio.paused && playPauseIcon.classList.contains('fa-play')) {
                playPauseIcon.classList.remove('fa-play');
                playPauseIcon.classList.add('fa-pause');
            }
        });
    });
})();