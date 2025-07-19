// ===========================================================================
// SISTEMA DE ANIMACIONES DINÁMICAS
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
            this.setupTypingEffect();
            this.setupParticleSystem();
            this.setupCountdownAnimation();
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
                .countdown-timer .time-unit
            `);

            elementsToAnimate.forEach(element => {
                this.observer.observe(element);
            });
        }

        // Animar elemento individual
        animateElement(element) {
            const animationType = this.getAnimationType(element);
            
            switch(animationType) {
                case 'fadeInUp':
                    element.style.animation = 'fadeInUp 0.8s ease-out forwards';
                    break;
                case 'fadeInLeft':
                    element.style.animation = 'fadeInLeft 0.8s ease-out forwards';
                    break;
                case 'fadeInRight':
                    element.style.animation = 'fadeInRight 0.8s ease-out forwards';
                    break;
                case 'scaleIn':
                    element.style.animation = 'scaleIn 0.6s ease-out forwards';
                    break;
                case 'stagger':
                    this.animateStaggeredChildren(element);
                    break;
                default:
                    element.classList.add('animate-in');
            }
        }

        // Determinar tipo de animación basado en la clase del elemento
        getAnimationType(element) {
            if (element.classList.contains('registry-block') || 
                element.classList.contains('sponsor-card') || 
                element.classList.contains('lodging-block')) {
                return 'scaleIn';
            }
            if (element.classList.contains('location-block')) {
                return 'fadeInLeft';
            }
            if (element.classList.contains('countdown-timer')) {
                return 'stagger';
            }
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

        // Efectos de scroll
        setupScrollEffects() {
            let ticking = false;
            
            const updateScrollEffects = () => {
                const scrolled = window.pageYOffset;
                const parallaxElements = document.querySelectorAll('.section-background-wrapper::before');
                
                parallaxElements.forEach(element => {
                    const speed = 0.5;
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
                .location-block
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
            element.style.transform = 'translateY(-3px) scale(1.02)';
            element.style.boxShadow = '0 10px 25px rgba(209, 183, 160, 0.3)';
        }

        removeHoverEffect(element) {
            element.style.transform = '';
            element.style.boxShadow = '';
        }

        // Efectos parallax
        setupParallaxEffects() {
            const parallaxElements = document.querySelectorAll('.section-background-wrapper');
            
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                
                parallaxElements.forEach(element => {
                    const speed = 0.3;
                    const yPos = -(scrolled * speed);
                    element.style.transform = `translateY(${yPos}px)`;
                });
            });
        }

        // Efecto de typing para el nombre del invitado
        setupTypingEffect() {
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

            // Iniciar typing después de un delay
            setTimeout(typeWriter, 1000);
        }

        // Sistema de partículas flotantes
        setupParticleSystem() {
            const particleContainer = document.createElement('div');
            particleContainer.className = 'particle-container';
            particleContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
                overflow: hidden;
            `;
            document.body.appendChild(particleContainer);

            // Crear partículas
            for (let i = 0; i < 20; i++) {
                this.createParticle(particleContainer);
            }
        }

        createParticle(container) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(209, 183, 160, 0.3);
                border-radius: 50%;
                animation: particleFloat ${Math.random() * 10 + 10}s linear infinite;
                left: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 10}s;
            `;
            container.appendChild(particle);

            // Recrear partícula cuando termine la animación
            particle.addEventListener('animationend', () => {
                particle.remove();
                setTimeout(() => this.createParticle(container), 1000);
            });
        }

        // Animación del contador regresivo
        setupCountdownAnimation() {
            const countdownElements = document.querySelectorAll('.time-unit .number');
            
            countdownElements.forEach(element => {
                element.addEventListener('DOMSubtreeModified', () => {
                    element.style.animation = 'pulse 0.5s ease-out';
                    setTimeout(() => {
                        element.style.animation = '';
                    }, 500);
                });
            });
        }
    }

    // Efectos de cursor personalizado
    class CustomCursor {
        constructor() {
            this.cursor = null;
            this.init();
        }

        init() {
            this.createCursor();
            this.setupCursorEvents();
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
                transition: transform 0.1s ease;
                mix-blend-mode: difference;
            `;
            document.body.appendChild(this.cursor);
        }

        setupCursorEvents() {
            document.addEventListener('mousemove', (e) => {
                this.cursor.style.left = e.clientX - 10 + 'px';
                this.cursor.style.top = e.clientY - 10 + 'px';
            });

            // Efecto hover en elementos interactivos
            const interactiveElements = document.querySelectorAll('button, a, .interactive');
            interactiveElements.forEach(element => {
                element.addEventListener('mouseenter', () => {
                    this.cursor.style.transform = 'scale(2)';
                });
                element.addEventListener('mouseleave', () => {
                    this.cursor.style.transform = 'scale(1)';
                });
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