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

        // --- ESTRATEGIA AGRESIVA DE AUTOPLAY ---
        let autoplayAttempted = false;

        // Función para intentar reproducir audio con múltiples estrategias
        function attemptAggressiveAutoplay() {
            if (autoplayAttempted) return;
            autoplayAttempted = true;
            
            console.log("Iniciando estrategia agresiva de autoplay...");
            
            // Estrategia 1: Intentar con muted inmediatamente
            audio.muted = true;
            audio.volume = 0;
            
            // Intentar reproducir inmediatamente
            audio.play()
                .then(() => {
                    console.log("Autoplay exitoso con muted");
                    // Desmutear después de un breve delay
                    setTimeout(() => {
                        audio.muted = false;
                        audio.volume = initialVolume;
                        playPauseIcon.classList.remove('fa-play');
                        playPauseIcon.classList.add('fa-pause');
                        console.log("Audio desmutado y reproduciendo");
                    }, 100);
                })
                .catch(error => {
                    console.warn("Estrategia 1 falló:", error);
                    
                    // Estrategia 2: Intentar con preload y user interaction simulation
                    audio.load();
                    audio.muted = true;
                    audio.volume = 0;
                    
                    // Simular interacción del usuario
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => {
                                console.log("Autoplay exitoso con preload");
                                setTimeout(() => {
                                    audio.muted = false;
                                    audio.volume = initialVolume;
                                    playPauseIcon.classList.remove('fa-play');
                                    playPauseIcon.classList.add('fa-pause');
                                }, 200);
                            })
                            .catch(error2 => {
                                console.warn("Estrategia 2 falló:", error2);
                                
                                // Estrategia 3: Intentar con diferentes configuraciones
                                audio.muted = false;
                                audio.volume = initialVolume;
                                audio.play()
                                    .then(() => {
                                        console.log("Autoplay exitoso con volumen normal");
                                        playPauseIcon.classList.remove('fa-play');
                                        playPauseIcon.classList.add('fa-pause');
                                    })
                                    .catch(error3 => {
                                        console.warn("Estrategia 3 falló:", error3);
                                        
                                        // Estrategia 4: Intentar después de un delay
                                        setTimeout(() => {
                                            audio.muted = true;
                                            audio.volume = 0;
                                            audio.play()
                                                .then(() => {
                                                    console.log("Autoplay exitoso con delay");
                                                    setTimeout(() => {
                                                        audio.muted = false;
                                                        audio.volume = initialVolume;
                                                        playPauseIcon.classList.remove('fa-play');
                                                        playPauseIcon.classList.add('fa-pause');
                                                    }, 300);
                                                })
                                                .catch(error4 => {
                                                    console.warn("Todas las estrategias de autoplay fallaron:", error4);
                                                    playPauseIcon.classList.remove('fa-pause');
                                                    playPauseIcon.classList.add('fa-play');
                                                });
                                        }, 500);
                                    });
                            });
                    }
                });
        }

        // Intentar autoplay inmediatamente al cargar
        attemptAggressiveAutoplay();

        // Intentar nuevamente después de un breve delay
        setTimeout(() => {
            if (audio.paused) {
                console.log("Reintentando autoplay después de delay...");
                attemptAggressiveAutoplay();
            }
        }, 1000);

        // Intentar una tercera vez después de más tiempo
        setTimeout(() => {
            if (audio.paused) {
                console.log("Último intento de autoplay...");
                attemptAggressiveAutoplay();
            }
        }, 3000);

        // --- Event Listener Botón Play/Pause ---
        toggleButton.addEventListener('click', () => {
            if (audio.paused) {
                audio.muted = false; // Asegurar que no esté muted
                audio.volume = initialVolume;
                audio.play()
                    .then(() => {
                        playPauseIcon.classList.remove('fa-play');
                        playPauseIcon.classList.add('fa-pause');
                        console.log("Audio reproduciendo manualmente");
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