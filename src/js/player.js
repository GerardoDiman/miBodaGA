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

        // --- ESTRATEGIA ROBUSTA DE AUTOPLAY ---
        let autoplayAttempted = false;
        let userInteracted = false;

        // Función para intentar reproducir audio
        function attemptAutoplay() {
            if (autoplayAttempted || userInteracted) return;
            
            autoplayAttempted = true;
            
            // Estrategia 1: Intentar autoplay directo (con muted para mayor compatibilidad)
            audio.muted = true; // Comenzar muted para mayor compatibilidad
            audio.play()
                .then(() => {
                    audio.muted = false; // Desmutear después de iniciar
                    audio.volume = initialVolume;
                    playPauseIcon.classList.remove('fa-play');
                    playPauseIcon.classList.add('fa-pause');
                    console.log("Autoplay de audio iniciado correctamente.");
                })
                .catch(error => {
                    console.warn("Autoplay directo bloqueado:", error);
                    
                    // Estrategia 2: Intentar con volumen 0 y luego subir
                    audio.volume = 0;
                    audio.muted = true;
                    audio.play()
                        .then(() => {
                            audio.muted = false;
                            audio.volume = initialVolume;
                            playPauseIcon.classList.remove('fa-play');
                            playPauseIcon.classList.add('fa-pause');
                            console.log("Autoplay iniciado con estrategia de volumen 0.");
                        })
                        .catch(error2 => {
                            console.warn("Autoplay con volumen 0 también bloqueado:", error2);
                            
                            // Estrategia 3: Intentar después de un pequeño delay
                            setTimeout(() => {
                                audio.muted = true;
                                audio.volume = initialVolume;
                                audio.play()
                                    .then(() => {
                                        audio.muted = false;
                                        playPauseIcon.classList.remove('fa-play');
                                        playPauseIcon.classList.add('fa-pause');
                                        console.log("Autoplay iniciado con delay.");
                                    })
                                    .catch(error3 => {
                                        console.warn("Todas las estrategias de autoplay fallaron:", error3);
                                        playPauseIcon.classList.remove('fa-pause');
                                        playPauseIcon.classList.add('fa-play');
                                    });
                            }, 1000);
                        });
                });
        }

        // Intentar autoplay inmediatamente
        attemptAutoplay();

        // Detectar interacción del usuario para intentar autoplay nuevamente
        const userInteractionEvents = ['click', 'touchstart', 'keydown', 'scroll'];
        userInteractionEvents.forEach(eventType => {
            document.addEventListener(eventType, () => {
                if (!userInteracted && !audio.paused) {
                    userInteracted = true;
                    return; // Ya está reproduciéndose
                }
                
                if (!userInteracted) {
                    userInteracted = true;
                    // Intentar reproducir después de la primera interacción del usuario
                    setTimeout(() => {
                        if (audio.paused) {
                            audio.muted = false; // Asegurar que no esté muted
                            audio.volume = initialVolume;
                            audio.play()
                                .then(() => {
                                    playPauseIcon.classList.remove('fa-play');
                                    playPauseIcon.classList.add('fa-pause');
                                    console.log("Audio iniciado después de interacción del usuario.");
                                })
                                .catch(error => {
                                    console.warn("No se pudo iniciar audio después de interacción:", error);
                                });
                        }
                    }, 100);
                }
            }, { once: true }); // Solo ejecutar una vez por tipo de evento
        });

        // --- Event Listener Botón Play/Pause ---
        toggleButton.addEventListener('click', () => {
            if (audio.paused) {
                audio.muted = false; // Asegurar que no esté muted
                audio.volume = initialVolume;
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