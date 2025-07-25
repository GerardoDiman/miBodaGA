// validar.js
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        // --- Referencias a Elementos de validar.html ---
        const statusIcon = document.getElementById('validation-status-icon');
        const guestDetailsDiv = document.getElementById('guest-details');
        const guestNameEl = document.getElementById('val-guest-name');
        const passesEl = document.getElementById('val-passes');
        const kidsEl = document.getElementById('val-kids');
        const guestIdEl = document.getElementById('val-guest-id');
        const statusMessageEl = document.getElementById('status-message');
        const validationForm = document.getElementById('validation-form');
        const guestIdInput = document.getElementById('guest-id-input');

        // --- URL del Apps Script (¡¡REEMPLAZAR!!) ---
        const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPma1X-J0EgAPsYkXYhNT2I8LCSdANRa6CfcQLtFTVp8Xy5AZY5tAKm1apsE-0i9yW/exec';

        // --- Función para actualizar la UI con animaciones mejoradas ---
        function updateValidationUI(status, message, invitado = null) {
            // Limpiar clases anteriores
            statusIcon.classList.remove('fa-spinner', 'fa-spin', 'loading', 'fa-check-circle', 'success', 'fa-times-circle', 'error', 'fa-question-circle');
            statusMessageEl.classList.remove('loading-message', 'success', 'error');

            if (status === 'success' && invitado) {
                // Animación de éxito
                statusIcon.classList.add('fas', 'fa-check-circle', 'success');
                statusMessageEl.textContent = message || "¡Invitado Válido!";
                statusMessageEl.classList.add('success');
                
                // Actualizar detalles del invitado con animación
                guestNameEl.textContent = invitado.nombre || 'No disponible';
                passesEl.textContent = invitado.pases != null ? invitado.pases : '-';
                kidsEl.textContent = invitado.ninos != null ? invitado.ninos : '-';
                guestIdEl.textContent = invitado.id || '---';
                
                // Mostrar detalles con animación
                guestDetailsDiv.style.display = 'block';
                guestDetailsDiv.style.opacity = '0';
                guestDetailsDiv.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    guestDetailsDiv.style.transition = 'all 0.5s ease';
                    guestDetailsDiv.style.opacity = '1';
                    guestDetailsDiv.style.transform = 'translateY(0)';
                }, 100);
                
                // Ocultar formulario con animación
                if (validationForm) {
                    validationForm.style.transition = 'all 0.3s ease';
                    validationForm.style.opacity = '0';
                    validationForm.style.transform = 'translateY(-20px)';
                    setTimeout(() => {
                        validationForm.style.display = 'none';
                    }, 300);
                }
                
            } else { // Error o no encontrado
                statusIcon.classList.add('fas', 'fa-times-circle', 'error');
                statusMessageEl.textContent = message || "Invitado no encontrado o error.";
                statusMessageEl.classList.add('error');
                
                // Ocultar detalles
                guestDetailsDiv.style.display = 'none';
                
                // Mostrar formulario con animación
                if (validationForm) {
                    validationForm.style.display = 'block';
                    validationForm.style.opacity = '0';
                    validationForm.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        validationForm.style.transition = 'all 0.3s ease';
                        validationForm.style.opacity = '1';
                        validationForm.style.transform = 'translateY(0)';
                    }, 100);
                }
            }
        }

        // --- Función para realizar la validación con mejor UX ---
        function performValidation(guestId) {
            if (!guestId) {
                updateValidationUI('error', "Por favor, ingresa un ID de invitado válido.");
                return;
            }
            
            // Validar formato del ID
            if (!/^[a-z0-9]{6}$/.test(guestId)) {
                updateValidationUI('error', "El ID debe tener exactamente 6 caracteres (letras y números).");
                return;
            }
            
            console.log(`Validando ID: ${guestId}`);

            // Ocultar formulario y mostrar mensaje de carga
            if (validationForm) {
                validationForm.style.transition = 'all 0.3s ease';
                validationForm.style.opacity = '0';
                validationForm.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    validationForm.style.display = 'none';
                }, 300);
            }
            
            statusMessageEl.textContent = "Verificando invitado...";
            statusMessageEl.classList.add('loading-message');
            statusIcon.classList.add('fas', 'fa-spinner', 'fa-spin', 'loading');
            guestDetailsDiv.style.display = 'none';

            // --- Llamar al Apps Script usando JSONP ---
            const callbackFunctionName = 'handleValidationResponse' + Date.now();

            // Crear la URL para JSONP
            const validationUrl = `${GOOGLE_APPS_SCRIPT_URL}?action=getGuestDetails&id=${guestId}&callback=${callbackFunctionName}&t=${Date.now()}`;

            // Crear la etiqueta script
            const scriptTag = document.createElement('script');
            scriptTag.src = validationUrl;

            // Variable para controlar timeout
            let timeoutId = setTimeout(() => {
                console.error("Timeout esperando respuesta JSONP para:", callbackFunctionName);
                updateValidationUI('error', "No se recibió respuesta del servidor. Verifica tu conexión a internet.");
                // Limpiar
                try { delete window[callbackFunctionName]; } catch(e){}
                try { document.body.removeChild(scriptTag); } catch (e) {}
            }, 15000); // Timeout de 15 segundos

            // Manejar errores de carga del script
            scriptTag.onerror = () => {
                clearTimeout(timeoutId);
                console.error("Error al cargar el script JSONP desde:", validationUrl);
                updateValidationUI('error', "Error de comunicación con el servidor. Intenta de nuevo.");
                // Limpiar
                try { document.body.removeChild(scriptTag); } catch (e) {}
                try { delete window[callbackFunctionName]; } catch (e) {}
            };

            // Definir la función de callback global
            window[callbackFunctionName] = (data) => {
                clearTimeout(timeoutId);
                console.log("Respuesta JSONP recibida:", data);
                
                if (data.status === 'success' && data.invitado) {
                    updateValidationUI('success', "¡Invitado Válido! Acceso confirmado.", data.invitado);
                } else {
                    updateValidationUI('error', data.message || "Invitado no encontrado. Verifica el ID ingresado.");
                }

                // Limpiar después de ejecutar
                try { document.body.removeChild(scriptTag); } catch (e) {}
                try { delete window[callbackFunctionName]; } catch (e) {}
            };

            // Añadir el script al body
            console.log("Añadiendo script JSONP:", validationUrl);
            document.body.appendChild(scriptTag);
        }

        // --- Función para mostrar estado inicial mejorado ---
        function showInitialState() {
            // Limpiar clases del icono
            statusIcon.classList.remove('fas', 'fa-spinner', 'fa-spin', 'loading', 'fa-check-circle', 'success', 'fa-times-circle', 'error');
            statusIcon.classList.add('fas', 'fa-id-card');
            statusIcon.style.color = '#d1b7a0';
            
            // Limpiar clases del mensaje
            statusMessageEl.classList.remove('loading-message', 'success', 'error');
            statusMessageEl.textContent = "Ingresa tu ID de invitado para validar tu acceso.";
            
            // Ocultar detalles del invitado
            guestDetailsDiv.style.display = 'none';
            
            // Mostrar formulario con animación
            if (validationForm) {
                validationForm.style.display = 'block';
                validationForm.style.opacity = '0';
                validationForm.style.transform = 'translateY(20px)';
                validationForm.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    validationForm.style.opacity = '1';
                    validationForm.style.transform = 'translateY(0)';
                }, 100);
            }
            
            // Remover botón de nueva validación si existe
            const existingBtn = document.querySelector('.submit-btn[style*="margin-top: 20px"]');
            if (existingBtn) {
                existingBtn.remove();
            }
        }

        // --- Función para limpiar formulario ---
        function clearForm() {
            if (guestIdInput) {
                guestIdInput.value = '';
                guestIdInput.focus();
            }
        }

        // --- Lógica Principal ---
        const urlParams = new URLSearchParams(window.location.search);
        const guestIdFromUrl = urlParams.get('id');

        if (guestIdFromUrl) {
            // Si el ID está en la URL, validar directamente
            performValidation(guestIdFromUrl);
        } else {
            // Si no hay ID en la URL, mostrar el formulario
            showInitialState();

            if (validationForm) {
                validationForm.addEventListener('submit', (event) => {
                    event.preventDefault();
                    const guestIdFromInput = guestIdInput.value.trim();
                    performValidation(guestIdFromInput);
                });

                // Agregar validación en tiempo real
                if (guestIdInput) {
                    guestIdInput.addEventListener('input', (e) => {
                        const value = e.target.value;
                        if (value.length > 6) {
                            e.target.value = value.substring(0, 6);
                        }
                        // Convertir a minúsculas
                        e.target.value = value.toLowerCase();
                    });

                    // Agregar placeholder dinámico
                    guestIdInput.addEventListener('focus', () => {
                        if (!guestIdInput.value) {
                            guestIdInput.placeholder = 'Ej: xnfj1a';
                        }
                    });

                    guestIdInput.addEventListener('blur', () => {
                        if (!guestIdInput.value) {
                            guestIdInput.placeholder = 'Ej: xnfj1a';
                        }
                    });
                }
            }
        }

        // --- Función para agregar botón de "Nueva Validación" ---
        function addNewValidationButton() {
            // Remover botón existente si hay uno
            const existingBtn = document.querySelector('.submit-btn[style*="margin-top: 20px"]');
            if (existingBtn) {
                existingBtn.remove();
            }
            
            const newValidationBtn = document.createElement('button');
            newValidationBtn.className = 'submit-btn';
            newValidationBtn.style.marginTop = '20px';
            newValidationBtn.innerHTML = '<i class="fas fa-redo" style="margin-right: 8px;"></i>Nueva Validación';
            newValidationBtn.addEventListener('click', () => {
                console.log('Botón Nueva Validación clickeado');
                showInitialState();
                clearForm();
            });
            
            // Insertar después del status message
            statusMessageEl.parentNode.insertBefore(newValidationBtn, statusMessageEl.nextSibling);
        }

        // --- Función para mostrar estado de éxito con botón de nueva validación ---
        const originalUpdateValidationUI = updateValidationUI;
        updateValidationUI = function(status, message, invitado = null) {
            originalUpdateValidationUI(status, message, invitado);
            
            if (status === 'success') {
                // Agregar botón de nueva validación después de un delay
                setTimeout(addNewValidationButton, 1000);
            }
        };

    }); // Fin DOMContentLoaded
})();