// invitation.js

console.log('🎯 invitation.js cargado');

(function() {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🎯 DOMContentLoaded ejecutado');

        // --- Referencias a Elementos HTML ---
        const guestNameElement = document.getElementById('guest-name-placeholder');
        const guestPassesElement = document.getElementById('guest-passes-placeholder');
        const guestKidsElement = document.getElementById('guest-kids-placeholder');
        const guestDetailsContainer = document.getElementById('guest-passes-details');
        const confirmButton = document.querySelector('.confirm-main-rsvp-button');
        const rsvpSectionElements = document.querySelectorAll('.rsvp-heading, .rsvp-deadline, .confirm-main-rsvp-button, .rsvp-contact-prompt, .rsvp-options');
        const qrDisplayContainer = document.getElementById('qr-code-display');
        const qrCodeTargetDiv = document.getElementById('qrcode-target');
        const qrGuestNameDisplay = document.getElementById('qr-guest-name-display');
        const validationViewContainer = document.getElementById('validation-view');

        // --- Configuraciones ---
        const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPma1X-J0EgAPsYkXYhNT2I8LCSdANRa6CfcQLtFTVp8Xy5AZY5tAKm1apsE-0i9yW/exec';
        const PUBLIC_SITE_URL_BASE = 'https://mibodaag.netlify.app/';
        const validationPagePath = '/validar.html';

        // --- Variables de Estado ---
        let invitadoActual = null;
        let confirmacionVerificada = false;
        let yaConfirmoSheet = false;

        // --- DETECCIÓN MEJORADA DE NAVEGADOR Y DISPOSITIVO ---
        function detectBrowserAndDevice() {
            const userAgent = navigator.userAgent.toLowerCase();
            const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
            const isChromeMobile = isChrome && /mobile|android|iphone|ipad/.test(userAgent);
            const isIncognito = !window.localStorage || !window.sessionStorage;
            const isPrivateMode = isIncognito || (() => {
                try {
                    localStorage.setItem('test', 'test');
                    localStorage.removeItem('test');
                    return false;
                } catch (e) {
                    return true;
                }
            })();
            
            console.log('🔍 Detección de navegador:', {
                isChrome,
                isChromeMobile,
                isIncognito,
                isPrivateMode,
                userAgent: navigator.userAgent
            });
            
            return { isChrome, isChromeMobile, isIncognito, isPrivateMode };
        }

        // --- ALMACENAMIENTO ROBUSTO CON FALLBACKS ---
        const storageManager = {
            // Intentar usar localStorage primero
            setItem: function(key, value) {
                try {
                    if (window.localStorage) {
                        localStorage.setItem(key, value);
                        return true;
                    }
                } catch (e) {
                    console.warn('localStorage falló, intentando sessionStorage:', e);
                }
                
                try {
                    if (window.sessionStorage) {
                        sessionStorage.setItem(key, value);
                        return true;
                    }
                } catch (e) {
                    console.warn('sessionStorage también falló:', e);
                }
                
                // Fallback: usar cookies
                try {
                    document.cookie = `${key}=${value};path=/;max-age=31536000`; // 1 año
                    return true;
                } catch (e) {
                    console.error('Todos los métodos de almacenamiento fallaron:', e);
                    return false;
                }
            },
            
            getItem: function(key) {
                try {
                    if (window.localStorage) {
                        return localStorage.getItem(key);
                    }
                } catch (e) {
                    console.warn('localStorage falló al leer:', e);
                }
                
                try {
                    if (window.sessionStorage) {
                        return sessionStorage.getItem(key);
                    }
                } catch (e) {
                    console.warn('sessionStorage falló al leer:', e);
                }
                
                // Fallback: leer de cookies
                try {
                    const cookies = document.cookie.split(';');
                    for (let cookie of cookies) {
                        const [cookieKey, cookieValue] = cookie.trim().split('=');
                        if (cookieKey === key) {
                            return cookieValue;
                        }
                    }
                } catch (e) {
                    console.error('Error leyendo cookies:', e);
                }
                
                return null;
            },
            
            removeItem: function(key) {
                try {
                    if (window.localStorage) {
                        localStorage.removeItem(key);
                    }
                } catch (e) {
                    console.warn('localStorage falló al remover:', e);
                }
                
                try {
                    if (window.sessionStorage) {
                        sessionStorage.removeItem(key);
                    }
                } catch (e) {
                    console.warn('sessionStorage falló al remover:', e);
                }
                
                // Fallback: expirar cookie
                try {
                    document.cookie = `${key}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
                } catch (e) {
                    console.error('Error expirando cookie:', e);
                }
            }
        };

        // --- Función para generar mensaje de WhatsApp dinámico ---
        function generateWhatsAppMessage(invitado) {
            if (!invitado || !invitado.nombre || !invitado.id) {
                return "Hola Luis, tengo dudas respecto a la confirmación.\n¿Me puedes apoyar?";
            }
            
            const nombre = invitado.nombre.trim();
            const id = invitado.id.trim();
            
            // Validar que nombre e ID no estén vacíos
            if (!nombre || !id) {
                return "Hola Luis, tengo dudas respecto a la confirmación.\n¿Me puedes apoyar?";
            }
            
            return `Hola Luis, soy ${nombre} (ID: ${id}).\nTengo dudas respecto a la confirmación.\n¿Me puedes apoyar?`;
        }

        // --- Función para actualizar enlaces de WhatsApp ---
        function updateWhatsAppLinks(invitado) {
            const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
            const message = generateWhatsAppMessage(invitado);
            const encodedMessage = encodeURIComponent(message);
            
            console.log('Actualizando enlaces de WhatsApp:', {
                invitado: invitado ? { nombre: invitado.nombre, id: invitado.id } : null,
                message: message,
                linksFound: whatsappLinks.length
            });
            
            whatsappLinks.forEach((link, index) => {
                const currentHref = link.getAttribute('href');
                const baseUrl = currentHref.split('?')[0];
                const newHref = `${baseUrl}?text=${encodedMessage}`;
                link.setAttribute('href', newHref);
                console.log(`Enlace ${index + 1} actualizado:`, newHref);
            });
        }

        // --- Funciones Helper ---

        /** Muestra un mensaje de error genérico o específico */
        function mostrarErrorCarga(mensaje = "Error al cargar datos") {
            console.error("Error Carga/Validación:", mensaje);
            if (guestNameElement) {
                // Limpiar completamente el elemento antes de asignar nuevo texto
                guestNameElement.textContent = '';
                guestNameElement.textContent = mensaje;
                console.log("Texto de error asignado:", guestNameElement.textContent);
                
                // Aplicar estilos CSS para "Invitación Genérica"
                if (mensaje === "Invitación Genérica") {
                    guestNameElement.style.fontFamily = "'Great Vibes', cursive";
                    guestNameElement.style.fontSize = "2.2em";
                    guestNameElement.style.fontWeight = "400";
                    guestNameElement.style.color = "var(--color-accent)";
                    
                    // Media queries para responsive
                    const mediaQuery768 = window.matchMedia("(max-width: 768px)");
                    const mediaQuery480 = window.matchMedia("(max-width: 480px)");
                    
                    if (mediaQuery480.matches) {
                        guestNameElement.style.fontSize = "1.8em";
                    } else if (mediaQuery768.matches) {
                        guestNameElement.style.fontSize = "2em";
                    }
                }
            }
            if (guestDetailsContainer) guestDetailsContainer.style.display = 'none';
            if (confirmButton) confirmButton.style.display = 'none';
            if (!validationViewContainer || validationViewContainer.style.display === 'none') {
                const mainSections = document.querySelectorAll('.container > section:not(#validation-view), .container > header, .container > main');
                mainSections.forEach(section => { if (section) section.style.display = 'none'; });
            }
            if (validationViewContainer && validationViewContainer.style.display !== 'none') {
                validationViewContainer.innerHTML = `<p style="color: red; text-align: center; padding: 20px;">${mensaje}</p>`;
            }
        }

        /** Muestra el código QR pre-generado */
        function displayQrCode(invitado) {
            if (!qrDisplayContainer || !qrCodeTargetDiv || !qrGuestNameDisplay) {
                console.error("displayQrCode: Faltan elementos HTML para el QR."); return;
            }
            if (!invitado || typeof invitado.id !== 'string' || invitado.id.trim() === '') {
                console.error("displayQrCode: Datos inválidos para mostrar QR. Invitado:", invitado);
                qrCodeTargetDiv.innerHTML = '<p style="color: red; font-size: small;">Error: Datos inválidos</p>';
                qrGuestNameDisplay.textContent = '';
                qrDisplayContainer.style.display = 'flex';
                document.body.classList.add('qr-code-shown');
                if (confirmButton) confirmButton.style.display = 'none';
                return;
            }

            console.log("Mostrando código QR pre-generado para ID:", invitado.id);
            qrCodeTargetDiv.innerHTML = ''; // Limpiar contenido anterior

            // Construir la ruta al archivo QR pre-generado
            const qrImagePath = `qrcodes/${invitado.id}.png`;
            console.log("Ruta de la imagen QR:", qrImagePath);

            // Crear un elemento de imagen y establecer su fuente
            const qrImageElement = document.createElement('img');
            qrImageElement.src = qrImagePath;
            qrImageElement.alt = `Código QR para ${invitado.nombre}`;
            qrImageElement.style.maxWidth = '100%'; // Asegurar que la imagen se ajuste al contenedor
            qrImageElement.style.height = 'auto';

            // Añadir la imagen al contenedor
            qrCodeTargetDiv.appendChild(qrImageElement);

            qrGuestNameDisplay.textContent = invitado.nombre;
            qrDisplayContainer.style.display = 'flex';
            document.body.classList.add('qr-code-shown');
            if (confirmButton) confirmButton.style.display = 'none';
        }

        /** Actualiza la UI (botón/QR) basado en el estado de confirmación */
        function updateUIBasedOnConfirmation(confirmado) {
            console.log(`🔄 Actualizando UI - Estado Confirmado: ${confirmado}`);
            yaConfirmoSheet = confirmado;

            if (confirmado && invitadoActual) {
                console.log('✅ Mostrando QR para invitado confirmado');
                displayQrCode(invitadoActual);
            } else if (!confirmado && invitadoActual) {
                console.log('❌ Mostrando botón de confirmación para invitado no confirmado');
                rsvpSectionElements.forEach(el => {
                    if(el) {
                        const classes = el.classList;
                        if(classes.contains('rsvp-options')) { el.style.display = 'flex'; }
                        else if (classes.contains('confirm-main-rsvp-button')) { el.style.display = 'inline-block'; }
                        else { el.style.display = ''; }
                    }
                });
                if (qrDisplayContainer) qrDisplayContainer.style.display = 'none';
                document.body.classList.remove('qr-code-shown');
                if (confirmButton) {
                    confirmButton.textContent = "Confirmar";
                    confirmButton.style.backgroundColor = '';
                    confirmButton.style.borderColor = '';
                    confirmButton.disabled = false;
                    confirmButton.style.display = 'inline-block';
                }
            }
            
            // Guardar estado usando el sistema robusto de almacenamiento
            if (invitadoActual?.id) {
                const confirmationKey = `boda_confirmado_${invitadoActual.id}`;
                const timestampKey = `${confirmationKey}_timestamp`;
                
                if (confirmado) {
                    const success = storageManager.setItem(confirmationKey, 'true');
                    const timestampSuccess = storageManager.setItem(timestampKey, Date.now().toString());
                    console.log(`💾 Estado guardado: confirmación=${success}, timestamp=${timestampSuccess}`);
                    
                    // Para Chrome móvil, asegurar que también se guarde en cookies
                    const browserInfo = detectBrowserAndDevice();
                    if (browserInfo.isChromeMobile) {
                        try {
                            document.cookie = `${confirmationKey}=true;path=/;max-age=31536000`;
                            document.cookie = `${timestampKey}=${Date.now()};path=/;max-age=31536000`;
                            console.log('🍪 Estado también guardado en cookies para Chrome móvil');
                        } catch (e) {
                            console.warn('⚠️ No se pudo guardar en cookies para Chrome móvil:', e);
                        }
                    }
                } else {
                    storageManager.removeItem(confirmationKey);
                    storageManager.removeItem(timestampKey);
                    console.log('🗑️ Estado de confirmación removido del almacenamiento');
                }
            }
        }

        /** Verifica si el invitado ya confirmó localmente */
        function checkLocalConfirmation() {
            if (!invitadoActual) return false;
            
            const confirmationKey = `boda_confirmado_${invitadoActual.id}`;
            const timestampKey = `${confirmationKey}_timestamp`;
            
            // Detectar navegador y dispositivo
            const browserInfo = detectBrowserAndDevice();
            console.log('🔍 Verificando confirmación local para:', invitadoActual.id, 'en navegador:', browserInfo);
            
            try {
                const isConfirmed = storageManager.getItem(confirmationKey) === 'true';
                const timestamp = storageManager.getItem(timestampKey);
                console.log(`✅ Verificación local: ${invitadoActual.id} confirmado = ${isConfirmed}, timestamp = ${timestamp}`);
                
                // Para Chrome móvil, verificar también en cookies como respaldo
                if (browserInfo.isChromeMobile && !isConfirmed) {
                    console.log('🔍 Chrome móvil detectado, verificando cookies como respaldo...');
                    const cookieValue = document.cookie.split(';').find(cookie => 
                        cookie.trim().startsWith(`${confirmationKey}=`)
                    );
                    if (cookieValue) {
                        const cookieConfirmed = cookieValue.split('=')[1] === 'true';
                        console.log(`🍪 Confirmación encontrada en cookies: ${cookieConfirmed}`);
                        if (cookieConfirmed) {
                            // Migrar de cookies al almacenamiento principal si es posible
                            try {
                                storageManager.setItem(confirmationKey, 'true');
                                storageManager.setItem(timestampKey, Date.now().toString());
                                console.log('✅ Confirmación migrada de cookies al almacenamiento principal');
                            } catch (e) {
                                console.warn('⚠️ No se pudo migrar la confirmación:', e);
                            }
                            return true;
                        }
                    }
                }
                
                return isConfirmed;
            } catch(e) {
                console.warn("⚠️ Error verificando confirmación local:", e);
                
                // Fallback: verificar solo cookies
                try {
                    const cookieValue = document.cookie.split(';').find(cookie => 
                        cookie.trim().startsWith(`${confirmationKey}=`)
                    );
                    if (cookieValue) {
                        const cookieConfirmed = cookieValue.split('=')[1] === 'true';
                        console.log(`🍪 Fallback a cookies: confirmado = ${cookieConfirmed}`);
                        return cookieConfirmed;
                    }
                } catch (cookieError) {
                    console.error("❌ Error en fallback de cookies:", cookieError);
                }
                
                return false;
            }
        }

        /** Función de fallback cuando Google Sheets falla */
        function handleGoogleSheetsFailure() {
            console.warn("Google Sheets no disponible. Usando fallback local.");
            
            // Mostrar mensaje al usuario
            const fallbackMessage = document.createElement('div');
            fallbackMessage.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff9800;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 1000;
                font-size: 14px;
                max-width: 300px;
            `;
            fallbackMessage.innerHTML = `
                <strong>⚠️ Modo Offline</strong><br>
                Tu confirmación se guardará localmente.<br>
                Se sincronizará cuando el servicio esté disponible.
            `;
            document.body.appendChild(fallbackMessage);
            
            // Remover mensaje después de 5 segundos
            setTimeout(() => {
                if (fallbackMessage.parentNode) {
                    fallbackMessage.parentNode.removeChild(fallbackMessage);
                }
            }, 5000);
        }

        /** Sistema de sincronización automática */
        function setupAutoSync() {
            // Verificar si hay confirmaciones pendientes de sincronizar
            function checkPendingSyncs() {
                if (!invitadoActual) return;
                
                const confirmationKey = `boda_confirmado_${invitadoActual.id}`;
                const timestampKey = `${confirmationKey}_timestamp`;
                const syncKey = `${confirmationKey}_synced`;
                
                try {
                    const isConfirmed = storageManager.getItem(confirmationKey) === 'true';
                    const timestamp = storageManager.getItem(timestampKey);
                    const isSynced = storageManager.getItem(syncKey) === 'true';
                    
                    console.log(`🔍 Verificando sincronización: confirmado=${isConfirmed}, sincronizado=${isSynced}`);
                    
                    // Si está confirmado localmente pero no sincronizado
                    if (isConfirmed && !isSynced && timestamp) {
                        console.log("✅ Encontrada confirmación pendiente de sincronizar");
                        syncPendingConfirmation();
                    }
                } catch (e) {
                    console.warn("⚠️ Error verificando sincronización pendiente:", e);
                }
            }

            // Sincronizar confirmación pendiente
            function syncPendingConfirmation() {
                if (!invitadoActual) return;
                
                const dataToSend = { 
                    id: invitadoActual.id, 
                    nombre: invitadoActual.nombre, 
                    pases: invitadoActual.pases, 
                    ninos: invitadoActual.ninos 
                };

                fetch(GOOGLE_APPS_SCRIPT_URL, { 
                    method: 'POST', 
                    mode: 'no-cors', 
                    cache: 'no-cache', 
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
                    redirect: 'follow', 
                    body: JSON.stringify(dataToSend) 
                })
                .then(response => {
                    console.log("✅ Confirmación sincronizada exitosamente");
                    // Marcar como sincronizada
                    const syncKey = `boda_confirmado_${invitadoActual.id}_synced`;
                    storageManager.setItem(syncKey, 'true');
                    
                    // Mostrar notificación de sincronización
                    showSyncNotification();
                })
                .catch(error => {
                    console.warn("❌ Error sincronizando confirmación:", error);
                    // Intentar de nuevo en 30 segundos
                    setTimeout(syncPendingConfirmation, 30000);
                });
            }

            // Mostrar notificación de sincronización exitosa
            function showSyncNotification() {
                const syncMessage = document.createElement('div');
                syncMessage.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #4CAF50;
                    color: white;
                    padding: 10px 15px;
                    border-radius: 5px;
                    z-index: 1000;
                    font-size: 14px;
                    max-width: 300px;
                    animation: slideIn 0.3s ease-out;
                `;
                syncMessage.innerHTML = `
                    <strong>✅ Sincronizado</strong><br>
                    Tu confirmación se envió al servidor.
                `;
                document.body.appendChild(syncMessage);
                
                // Remover después de 3 segundos
                setTimeout(() => {
                    if (syncMessage.parentNode) {
                        syncMessage.parentNode.removeChild(syncMessage);
                    }
                }, 3000);
            }

            // Verificar sincronización cuando se recupera la conexión
            window.addEventListener('online', () => {
                console.log("🌐 Conexión recuperada. Verificando sincronización...");
                setTimeout(checkPendingSyncs, 2000); // Esperar 2 segundos para estabilizar
            });

            // Verificar sincronización periódicamente (cada 5 minutos)
            setInterval(checkPendingSyncs, 5 * 60 * 1000);

            // Verificar sincronización al cargar la página
            setTimeout(checkPendingSyncs, 3000);
        }

        // --- Lógica Principal al Cargar la Página ---
        const urlParams = new URLSearchParams(window.location.search);
        const guestId = urlParams.get('id') || urlParams.get('invitado'); // Soporte para ambos parámetros

        // ========================================
        // ANIMACIÓN DE TYPING PARA NOMBRES DE PADRES
        // ========================================
        
        function initTypingAnimation() {
            console.log('Inicializando animación de typing...');
            
            // Observer para detectar cuando la sección de padres es visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    console.log('IntersectionObserver detectado:', entry.isIntersecting, entry.target);
                    
                    if (entry.isIntersecting) {
                        const parentSection = entry.target;
                        const typingElements = parentSection.querySelectorAll('.typing-animation');
                        
                        console.log('Elementos de typing encontrados:', typingElements.length);
                        
                        if (typingElements.length === 0) {
                            console.log('No se encontraron elementos con clase typing-animation');
                            return;
                        }
                        
                        // Verificar que la sección no esté completamente visible al inicio
                        const rect = parentSection.getBoundingClientRect();
                        const isFullyVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
                        
                        console.log('Sección completamente visible al inicio:', isFullyVisible);
                        
                        // Si está completamente visible al inicio, esperar un poco antes de animar
                        const initialDelay = isFullyVisible ? 2000 : 500;
                        
                        console.log('Iniciando animación con delay:', initialDelay);
                        
                        // Animar cada elemento con un delay
                        typingElements.forEach((element, index) => {
                            setTimeout(() => {
                                console.log('Añadiendo clase animate al elemento:', index);
                                element.classList.add('animate');
                                
                                // Remover la clase animate después de la animación y añadir completed
                                setTimeout(() => {
                                    console.log('Removiendo animate y añadiendo completed al elemento:', index);
                                    element.classList.remove('animate');
                                    element.classList.add('completed');
                                }, element.classList.contains('parent-subtitle') ? 1500 : 2500); // Duración más corta para subtítulos
                            }, initialDelay + (index * 1200)); // 1.2 segundos entre cada elemento
                        });
                        
                        // Desconectar el observer después de activar la animación
                        observer.unobserve(parentSection);
                        console.log('Observer desconectado');
                    }
                });
            }, {
                threshold: 0.1, // Activar cuando 10% de la sección sea visible (más sensible)
                rootMargin: '0px 0px -100px 0px' // Más margen para activar antes
            });
            
            // Observar la sección de padres
            const parentsSection = document.querySelector('.parents-section');
            if (parentsSection) {
                console.log('Sección de padres encontrada, iniciando observación');
                observer.observe(parentsSection);
            } else {
                console.log('No se encontró la sección de padres');
            }
        }
        
        // Inicializar la animación de typing (siempre se ejecuta)
        initTypingAnimation();

        if (!guestId) {
            console.warn("No se especificó ID de invitado.");
            mostrarErrorCarga("Invitación Genérica");
            // Actualizar enlaces de WhatsApp con mensaje genérico
            updateWhatsAppLinks(null);
            return;
        }
        console.log(`ID invitado: ${guestId}`);
        fetch('data/invitados.json')
            .then(response => {
                if (!response.ok) { throw new Error(`Error ${response.status} cargando data/invitados.json`); }
                return response.json();
            })
            .then(invitados => {
                invitadoActual = invitados.find(inv => inv.id === guestId);
                if (!invitadoActual) {
                    throw new Error(`Invitado con ID "${guestId}" no encontrado en invitados.json.`);
                }
                console.log("Datos del invitado cargados:", invitadoActual);

                // Limpiar cualquier texto anterior y asignar solo el nombre del invitado
                if (guestNameElement) {
                    guestNameElement.textContent = '';
                    guestNameElement.textContent = invitadoActual.nombre;
                    console.log("Nombre asignado:", guestNameElement.textContent);
                }

                // Actualizar enlaces de WhatsApp con información del invitado
                updateWhatsAppLinks(invitadoActual);
                guestPassesElement.textContent = invitadoActual.pases;
                guestKidsElement.textContent = invitadoActual.ninos;
                guestDetailsContainer.style.display = 'flex';

                const kidsSpanElement = guestDetailsContainer.querySelector('.guest-pass-kids');
                const separatorSpanElement = guestDetailsContainer.querySelector('.guest-pass-separator');
                const passesSpanElement = guestDetailsContainer.querySelector('.guest-pass-item:not(.guest-pass-kids)');
                if (invitadoActual.ninos === 0) {
                    if (kidsSpanElement) kidsSpanElement.style.display = 'none';
                    if (separatorSpanElement) separatorSpanElement.style.display = 'none';
                    if (invitadoActual.pases === 1) { if(passesSpanElement) passesSpanElement.innerHTML = `<span id="guest-passes-placeholder">${invitadoActual.pases}</span> - PASE`; }
                    else { if(passesSpanElement) passesSpanElement.innerHTML = `<span id="guest-passes-placeholder">${invitadoActual.pases}</span> - PASES`; }
                } else {
                    if (kidsSpanElement) kidsSpanElement.style.display = 'inline';
                    if (separatorSpanElement) separatorSpanElement.style.display = 'inline';
                    if(passesSpanElement) passesSpanElement.innerHTML = `<span id="guest-passes-placeholder">${invitadoActual.pases}</span> - PASES`;
                }

                // Verificar confirmación local inmediatamente después de cargar datos del invitado
                console.log("🔍 Verificando confirmación local al cargar datos...");
                const localConfirmation = checkLocalConfirmation();
                
                if (localConfirmation) {
                    console.log("✅ Confirmación local encontrada al cargar datos, mostrando QR inmediatamente");
                    updateUIBasedOnConfirmation(true);
                    
                    // Para Chrome móvil, verificar también en el servidor como respaldo
                    const browserInfo = detectBrowserAndDevice();
                    if (browserInfo.isChromeMobile) {
                        console.log("📱 Chrome móvil detectado, verificando también en servidor como respaldo...");
                        // Continuar con la verificación del servidor pero no bloquear la UI
                    } else {
                        return; // No necesitamos verificar con Google Sheets si ya confirmó localmente
                    }
                } else {
                    console.log("❌ No se encontró confirmación local, verificando en servidor...");
                }

                console.log("🌐 Verificando estado de confirmación en servidor...");
                
                // Detectar navegador para ajustar la estrategia
                const browserInfo = detectBrowserAndDevice();
                
                // Para Chrome móvil, usar timeout más corto y fallback más agresivo
                const timeoutDuration = browserInfo.isChromeMobile ? 5000 : 10000;
                const fallbackStrategy = browserInfo.isChromeMobile ? 'aggressive' : 'standard';
                
                console.log(`📱 Estrategia de verificación: ${fallbackStrategy}, timeout: ${timeoutDuration}ms`);
                
                const callbackCheckStatus = 'handleCheckStatusResponse' + Date.now();
                const checkUrl = `${GOOGLE_APPS_SCRIPT_URL}?action=checkStatus&id=${guestId}&callback=${callbackCheckStatus}&t=${Date.now()}`;
                const scriptCheckTag = document.createElement('script');
                scriptCheckTag.src = checkUrl;
                
                let checkTimeoutId = setTimeout(() => {
                    console.warn(`⏰ Timeout (${timeoutDuration}ms) esperando respuesta checkStatus.`);
                    
                    if (fallbackStrategy === 'aggressive') {
                        console.log("📱 Chrome móvil: usando fallback agresivo - asumiendo estado local");
                        // En Chrome móvil, confiar más en el estado local
                        const localState = checkLocalConfirmation();
                        updateUIBasedOnConfirmation(localState);
                    } else {
                        console.log("🖥️ Desktop: asumiendo no confirmado");
                        updateUIBasedOnConfirmation(false);
                    }
                    
                    try { delete window[callbackCheckStatus]; } catch(e){}
                }, timeoutDuration);

                scriptCheckTag.onerror = () => {
                    clearTimeout(checkTimeoutId);
                    console.error("❌ Error al cargar script JSONP checkStatus.");
                    
                    if (fallbackStrategy === 'aggressive') {
                        console.log("📱 Chrome móvil: fallback agresivo en error - usando estado local");
                        const localState = checkLocalConfirmation();
                        updateUIBasedOnConfirmation(localState);
                    } else {
                        updateUIBasedOnConfirmation(false);
                    }
                    
                    try { document.body.removeChild(scriptCheckTag); } catch (e) {}
                    try { delete window[callbackCheckStatus]; } catch (e) {}
                };

                window[callbackCheckStatus] = (data) => {
                    clearTimeout(checkTimeoutId);
                    console.log("✅ Respuesta del checkStatus (JSONP):", data);
                    confirmacionVerificada = true;
                    updateUIBasedOnConfirmation(data.status === 'confirmed');
                    try { document.body.removeChild(scriptCheckTag); } catch (e) {}
                    try { delete window[callbackCheckStatus]; } catch (e) {}
                };
                
                // Añadir el script al DOM
                document.body.appendChild(scriptCheckTag);
            })
            .catch(error => {
                console.error("Error cargando invitados.json:", error);
                mostrarErrorCarga(error.message || "Error al cargar datos iniciales");
            });

        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                if (!invitadoActual || yaConfirmoSheet || confirmButton.disabled) {
                    console.log("Clic en Confirmar ignorado.");
                    return;
                }

                // Inicializar el formulario RSVP con los datos del invitado
                if (window.initRsvpForm) {
                    window.initRsvpForm(invitadoActual);
                }
                
                // Mostrar el formulario RSVP
                if (window.showRsvpForm) {
                    window.showRsvpForm();
                }
            });
        }

        // Inicializar el sistema de sincronización
        setupAutoSync();

        // Exponer funciones globalmente para que otros scripts puedan usarlas
        window.updateUIBasedOnConfirmation = updateUIBasedOnConfirmation;
        window.checkLocalConfirmation = checkLocalConfirmation;
        window.displayQrCode = displayQrCode;

    });
})();