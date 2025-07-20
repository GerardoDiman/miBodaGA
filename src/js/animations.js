// ===========================================================================
// SISTEMA DE ANIMACIONES DINÁMICAS AVANZADAS
// ===========================================================================

(function() {
    'use strict';

    // Configuración de animaciones
    const animationConfig = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
        staggerDelay: 100
    };

    // Clase principal de animaciones
    class AnimationManager {
        constructor() {
            this.observer = null;
            this.animatedElements = new Set();
            this.init();
        }

        init() {
            this.setupIntersectionObserver();
            this.setupScrollEffects();
            this.setupHoverEffects();
            this.setupParallaxEffects();
            this.setupTextEffects();
            this.setupGalleryEffects();
            this.setupCountdownEffects();
            this.setupGlitchEffects();
        }

        // Configurar Intersection Observer para animaciones de scroll
        setupIntersectionObserver() {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                        this.animateElement(entry.target);
                        this.animatedElements.add(entry.target);
                    }
                });
            }, animationConfig);

                    // Observar elementos que necesitan animación
        const elementsToAnimate = document.querySelectorAll(`
            .section-background-wrapper,
            .registry-block,
            .sponsor-card,
            .lodging-block,
            .location-block,
            .gallery-slide,
            .section-title,
            .section-title-container,
            .countdown-timer,
            .money-shower-section,
            .final-section .couple-names,
            .final-section .wedding-date,
            .gallery-container,
            .gallery-indicators,
            .gallery-navigation,
            .dress-code-container,
            .itinerary-section,
            .locations-section,
            .gifts-section,
            .lodging-section,
            .rsvp-section,
            .parents-section,
            .sponsors-section,
            .filter-section,
            .itinerary-item,
            .dresscode-progressive-section,
            .dresscode-gender-title,
            .dresscode-icon-container,
            .dresscode-requirements,
            .dresscode-separator,
            .social-filter-buttons,
            .wedding-hashtag,
            .registry-links,
            .money-shower-icon,
            .money-shower-title,
            .money-shower-description,
            .lodging-container,
            .rsvp-heading,
            .rsvp-deadline,
            .confirm-main-rsvp-button,
            .rsvp-options,
            .rsvp-option,
            .final-title,
            .add-calendar-btn,
            .guest-info,
            .wedding-logo,
            .countdown-intro,
            .countdown-outro,
            .message-box,
            .parents-container,
            .parent-content,
            .sponsors-container,
            h1, h2
        `);

            elementsToAnimate.forEach(element => {
                this.observer.observe(element);
            });
        }

        // Animar elemento individual
        animateElement(element) {
            const animationType = this.getAnimationType(element);
            
            // Si no debe tener animación por scroll, salir
            if (animationType === 'none') {
                return;
            }
            
            // Agregar clase visible para activar la animación CSS
            element.classList.add('visible');
            
            // Para animaciones especiales que requieren JavaScript
            switch(animationType) {
                case 'stagger':
                    this.animateStaggeredChildren(element);
                    break;
                case 'typewriter':
                    this.animateTypewriter(element);
                    break;
                case 'countdownDrop':
                    // La animación se maneja automáticamente por CSS
                    break;
                case 'depth3D':
                case 'fadeInUp':
                case 'fadeInLeft':
                case 'fadeInRight':
                case 'scaleIn':
                case 'bounceIn':
                case 'slideUp':
                case 'rotateIn':
                default:
                    // Las animaciones se manejan automáticamente por CSS
                    break;
            }
        }

        // Determinar tipo de animación basado en la clase del elemento
        getAnimationType(element) {
            // No agregar animate-on-scroll a elementos que ya tienen animaciones de carga
            const elementsWithInitialAnimations = [
                '.photo-container',
                '.date-info',
                '.intro-text',
                'h1',
                '.wedding-logo',
                '.countdown-intro',
                '.countdown-outro',
                '.message-box',
                '.final-section .couple-names',
                '.final-section .wedding-date'
            ];
            
            const hasInitialAnimation = elementsWithInitialAnimations.some(selector => 
                element.matches(selector)
            );
            
            if (hasInitialAnimation) {
                return 'none'; // No aplicar animación por scroll
            }
            
            // Agregar clase animate-on-scroll si no la tiene
            if (!element.classList.contains('animate-on-scroll')) {
                element.classList.add('animate-on-scroll');
            }
            
            // Animaciones específicas para sponsor cards (invitados de honor)
            if (element.classList.contains('sponsor-card')) {
                const sponsorCards = document.querySelectorAll('.sponsor-card');
                const cardIndex = Array.from(sponsorCards).indexOf(element);
                
                // Asignar diferentes animaciones según la posición
                const animations = [
                    'slide-in-left',
                    'slide-in-right', 
                    'slide-in-bottom',
                    'slide-in-top',
                    'zoom-in',
                    'wave-in',
                    'bounce-elastic',
                    'slide-smooth'
                ];
                
                const animationClass = animations[cardIndex % animations.length];
                element.classList.add(animationClass);
                return 'sponsorCard';
            }
            
            // Determinar variante de animación
            if (element.classList.contains('registry-block') || 
                element.classList.contains('sponsor-card') || 
                element.classList.contains('lodging-block')) {
                element.classList.add('depth-3d');
                return 'depth3D';
            }
            if (element.classList.contains('location-block') ||
                element.classList.contains('itinerary-item')) {
                element.classList.add('fade-in-left');
                return 'fadeInLeft';
            }
            if (element.classList.contains('rsvp-options') ||
                element.classList.contains('sponsors-container') ||
                element.classList.contains('lodging-container')) {
                element.classList.add('stagger-children');
                return 'stagger';
            }
            if (element.classList.contains('countdown-timer')) {
                element.classList.add('countdown-drop');
                return 'countdownDrop';
            }
            if (element.classList.contains('section-title-container') ||
                element.classList.contains('section-title') ||
                element.classList.contains('rsvp-heading') ||
                element.classList.contains('final-title')) {
                element.classList.add('scale-in');
                return 'scaleIn';
            }
            if (element.classList.contains('gallery-container') ||
                element.classList.contains('gallery-indicators') ||
                element.classList.contains('gallery-navigation') ||
                element.classList.contains('social-filter-buttons')) {
                element.classList.add('fade-in-right');
                return 'fadeInRight';
            }
            if (element.classList.contains('dresscode-gender-title') ||
                element.classList.contains('money-shower-title') ||
                element.classList.contains('parent-title')) {
                element.classList.add('scale-in');
                return 'scaleIn';
            }
            if (element.classList.contains('dresscode-icon-container') ||
                element.classList.contains('money-shower-icon') ||
                element.classList.contains('wedding-logo')) {
                element.classList.add('scale-in');
                return 'scaleIn';
            }
            if (element.classList.contains('dresscode-requirements') ||
                element.classList.contains('money-shower-description') ||
                element.classList.contains('rsvp-deadline') ||
                element.classList.contains('message-box')) {
                element.classList.add('fade-in-left');
                return 'fadeInLeft';
            }
            if (element.classList.contains('confirm-main-rsvp-button') ||
                element.classList.contains('add-calendar-btn')) {
                element.classList.add('bounce-in');
                return 'bounceIn';
            }
            if (element.classList.contains('wedding-hashtag')) {
                element.classList.add('fade-in-right');
                return 'fadeInRight';
            }
            if (element.classList.contains('countdown-intro') ||
                element.classList.contains('countdown-outro')) {
                element.classList.add('slide-up');
                return 'slideUp';
            }
            if (element.classList.contains('dresscode-separator')) {
                element.classList.add('rotate-in');
                return 'rotateIn';
            }
            
            // Por defecto, usar fade-in-up
            element.classList.add('fade-in-up');
            return 'fadeInUp';
        }

        // Animar elementos hijos con delay escalonado
        animateStaggeredChildren(parent) {
            const children = parent.children;
            Array.from(children).forEach((child, index) => {
                setTimeout(() => {
                    child.style.animation = 'fadeInUp 0.6s ease-out forwards';
                }, index * animationConfig.staggerDelay);
            });
        }

        // Efecto typewriter para el nombre del invitado
        animateTypewriter(element) {
            const guestName = element.querySelector('.guest-name');
            if (!guestName) return;

            const originalText = guestName.textContent;
            guestName.textContent = '';
            guestName.style.overflow = 'hidden';
            guestName.style.whiteSpace = 'nowrap';

            let i = 0;
            const typeWriter = () => {
                if (i < originalText.length) {
                    guestName.textContent += originalText.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                }
            };

            // Iniciar el efecto typewriter después de un pequeño delay
            setTimeout(typeWriter, 200);
        }

        // Efectos de scroll avanzados
        setupScrollEffects() {
            let ticking = false;
            
            const updateScrollEffects = () => {
                const scrolled = window.pageYOffset;
                const parallaxElements = document.querySelectorAll('.section-background-wrapper');
                
                parallaxElements.forEach((element, index) => {
                    const speed = 0.3 + (index * 0.1);
                    const yPos = -(scrolled * speed);
                    element.style.transform = `translateY(${yPos}px)`;
                });
                
                ticking = false;
            };

            const requestTick = () => {
                if (!ticking) {
                    requestAnimationFrame(updateScrollEffects);
                    ticking = true;
                }
            };

            window.addEventListener('scroll', requestTick);
        }

        // Efectos hover mejorados
        setupHoverEffects() {
            const interactiveElements = document.querySelectorAll(`
                .confirm-main-rsvp-button,
                .rsvp-button,
                .registry-button,
                .add-calendar-btn,
                .gallery-arrow,
                .location-block,
                .registry-block,
                .sponsor-card,
                .lodging-block
            `);

            interactiveElements.forEach(element => {
                element.addEventListener('mouseenter', (e) => {
                    this.addHoverEffect(e.target);
                });

                element.addEventListener('mouseleave', (e) => {
                    this.removeHoverEffect(e.target);
                });
            });
        }

        addHoverEffect(element) {
            if (element.classList.contains('location-block')) {
                element.style.animation = 'slide3D 0.6s ease-out';
            } else if (element.classList.contains('registry-block') || 
                       element.classList.contains('sponsor-card') || 
                       element.classList.contains('lodging-block')) {
                element.style.animation = 'depth-3d 0.6s ease-out';
            } else {
                element.style.transform = 'translateY(-3px) scale(1.02)';
                element.style.boxShadow = '0 10px 25px rgba(209, 183, 160, 0.3)';
            }
        }

        removeHoverEffect(element) {
            element.style.transform = '';
            element.style.boxShadow = '';
            element.style.animation = '';
        }

        // Efectos parallax avanzados
        setupParallaxEffects() {
            const parallaxElements = document.querySelectorAll('.section-background-wrapper');
            
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                
                parallaxElements.forEach((element, index) => {
                    const speed = 0.2 + (index * 0.05);
                    const yPos = -(scrolled * speed);
                    element.style.transform = `translateY(${yPos}px)`;
                });
            });
        }

        // Efectos de texto avanzados
        setupTextEffects() {
            // Efecto typewriter para el nombre del invitado
            const guestName = document.getElementById('guest-name-placeholder');
            if (!guestName) return;

            const text = guestName.textContent;
            guestName.textContent = '';
            guestName.style.overflow = 'hidden';
            guestName.style.whiteSpace = 'nowrap';

            let i = 0;
            const typeWriter = () => {
                if (i < text.length) {
                    guestName.textContent += text.charAt(i);
                    i++;
                    setTimeout(typeWriter, 100);
                }
            };

            setTimeout(typeWriter, 1000);

            // Efecto elegante para títulos
            const titles = document.querySelectorAll('h1, h2');
            titles.forEach(title => {
                title.addEventListener('mouseenter', () => {
                    title.style.animation = 'elegantGlow 2s ease-in-out infinite';
                });
                
                title.addEventListener('mouseleave', () => {
                    title.style.animation = '';
                });
            });
        }

        // Efectos de galería avanzados
        setupGalleryEffects() {
            const galleryImages = document.querySelectorAll('.gallery-slide img');
            
            galleryImages.forEach(img => {
                img.addEventListener('mouseenter', () => {
                    img.style.animation = 'kenBurns 8s ease-in-out infinite';
                });
                
                img.addEventListener('mouseleave', () => {
                    img.style.animation = '';
                });
            });
        }

        // Efectos del contador regresivo
        setupCountdownEffects() {
            const countdownElements = document.querySelectorAll('.time-unit .number');
            
            countdownElements.forEach(element => {
                element.addEventListener('DOMSubtreeModified', () => {
                    element.style.animation = 'numberDrop 0.5s ease-out';
                    setTimeout(() => {
                        element.style.animation = '';
                    }, 500);
                });
            });

            // Efecto de celebración cuando llegue a cero
            const checkCountdown = () => {
                const days = document.getElementById('days');
                const hours = document.getElementById('hours');
                const minutes = document.getElementById('minutes');
                const seconds = document.getElementById('seconds');
                
                if (days && hours && minutes && seconds) {
                    const totalSeconds = parseInt(days.textContent) * 86400 + 
                                       parseInt(hours.textContent) * 3600 + 
                                       parseInt(minutes.textContent) * 60 + 
                                       parseInt(seconds.textContent);
                    
                    if (totalSeconds <= 0) {
                        this.triggerCelebration();
                    }
                }
            };

            // Verificar cada segundo
            setInterval(checkCountdown, 1000);
        }

        // Efecto de celebración
        triggerCelebration() {
            const countdownTimer = document.getElementById('countdown');
            if (countdownTimer) {
                countdownTimer.style.animation = 'celebration 2s ease-in-out';
                setTimeout(() => {
                    countdownTimer.style.animation = '';
                }, 2000);
            }
        }

        // Efectos elegantes para títulos
        setupGlitchEffects() {
            const elegantElements = document.querySelectorAll('h1, h2, .section-title');
            
            elegantElements.forEach(element => {
                element.addEventListener('mouseenter', () => {
                    element.style.animation = 'elegantGlow 2s ease-in-out infinite';
                });
                
                element.addEventListener('mouseleave', () => {
                    element.style.animation = '';
                });
            });
        }
    }

    // Efectos de cursor personalizado (solo para dispositivos de escritorio)
    class CustomCursor {
        constructor() {
            this.cursor = null;
            this.isTouchDevice = this.detectTouchDevice();
            this.init();
        }

        detectTouchDevice() {
            // Detectar dispositivos táctiles
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            
            // Detectar dispositivos móviles por tamaño de pantalla
            const isMobile = window.innerWidth <= 768;
            
            // Detectar si es un dispositivo móvil por User Agent
            const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            return hasTouch || isMobile || isMobileUA;
        }

        init() {
            // Solo inicializar en dispositivos de escritorio
            if (!this.isTouchDevice) {
                this.createCursor();
                this.setupCursorEvents();
                this.setupCursorVisibility();
            }
        }

        createCursor() {
            this.cursor = document.createElement('div');
            this.cursor.className = 'custom-cursor';
            this.cursor.style.cssText = `
                position: fixed;
                width: 20px;
                height: 20px;
                background: rgba(209, 183, 160, 0.8);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: transform 0.1s ease, opacity 0.3s ease;
                mix-blend-mode: difference;
                opacity: 0;
            `;
            document.body.appendChild(this.cursor);
        }

        setupCursorEvents() {
            document.addEventListener('mousemove', (e) => {
                if (this.cursor) {
                    this.cursor.style.left = e.clientX - 10 + 'px';
                    this.cursor.style.top = e.clientY - 10 + 'px';
                    this.cursor.style.opacity = '1';
                }
            });

            // Efecto hover en elementos interactivos
            const interactiveElements = document.querySelectorAll('button, a, .interactive');
            interactiveElements.forEach(element => {
                element.addEventListener('mouseenter', () => {
                    if (this.cursor) {
                        this.cursor.style.transform = 'scale(2)';
                    }
                });
                element.addEventListener('mouseleave', () => {
                    if (this.cursor) {
                        this.cursor.style.transform = 'scale(1)';
                    }
                });
            });
        }

        setupCursorVisibility() {
            let timeout;
            
            document.addEventListener('mousemove', () => {
                if (this.cursor) {
                    this.cursor.style.opacity = '1';
                    clearTimeout(timeout);
                    
                    timeout = setTimeout(() => {
                        if (this.cursor) {
                            this.cursor.style.opacity = '0';
                        }
                    }, 3000); // Ocultar después de 3 segundos sin movimiento
                }
            });
        }
    }

    // Efectos de sonido sutiles
    class SoundEffects {
        constructor() {
            this.audioContext = null;
            this.init();
        }

        init() {
            if ('AudioContext' in window || 'webkitAudioContext' in window) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.setupSoundEffects();
            }
        }

        setupSoundEffects() {
            const interactiveElements = document.querySelectorAll('button, a');
            interactiveElements.forEach(element => {
                element.addEventListener('click', () => {
                    this.playClickSound();
                });
            });
        }

        playClickSound() {
            if (!this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        }
    }

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', () => {
        new AnimationManager();
        new CustomCursor();
        new SoundEffects();
    });

})(); 