// validar.js
(function() {
    document.addEventListener('DOMContentLoaded', () => {
        // --- Referencias a Elementos de validar.html ---
        const statusIcon = document.getElementById('validation-status-icon');
        const guestDetailsDiv = document.getElementById('guest-details');
        const confirmationDetailsDiv = document.getElementById('confirmation-details');
        const guestNameEl = document.getElementById('val-guest-name');
        const passesEl = document.getElementById('val-passes');
        const kidsEl = document.getElementById('val-kids');
        const guestIdEl = document.getElementById('val-guest-id');
        const statusEl = document.getElementById('val-status');
        const mesaEl = document.getElementById('val-mesa');
        const mesaRow = document.getElementById('mesa-row');
        const passesUsedEl = document.getElementById('val-passes-used');
        const kidsUsedEl = document.getElementById('val-kids-used');
        const adultNamesEl = document.getElementById('val-adult-names');
        const kidsNamesEl = document.getElementById('val-kids-names');
        const kidsNamesRow = document.getElementById('kids-names-row');
        const phoneEl = document.getElementById('val-phone');
        const emailEl = document.getElementById('val-email');
        const emailRow = document.getElementById('email-row');
        const confirmationDateEl = document.getElementById('val-confirmation-date');
        const statusMessageEl = document.getElementById('status-message');
        const validationForm = document.getElementById('validation-form');
        const guestIdInput = document.getElementById('guest-id-input');

        // --- URL del Apps Script (¡¡REEMPLAZAR!!) ---
        const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPma1X-J0EgAPsYkXYhNT2I8LCSdANRa6CfcQLtFTVp8Xy5AZY5tAKm1apsE-0i9yW/exec';

        // --- INTEGRACIÓN CON CHROME MOBILE FIX ---
        let robustStorage = null;
        let isInitializingStorage = false;
        
        // Inicializar almacenamiento robusto si está disponible
        function initializeRobustStorage() {
            if (isInitializingStorage) {
                console.log('⚠️ Ya se está inicializando el almacenamiento, ignorando llamada adicional');
                return false;
            }
            
            isInitializingStorage = true;
            
            if (window.RobustStorage) {
                robustStorage = new window.RobustStorage();
                console.log('✅ Almacenamiento robusto inicializado');
                // Resetear el flag después de un delay
                setTimeout(() => {
                    isInitializingStorage = false;
                }, 1000);
                return true;
            } else {
                console.warn('⚠️ RobustStorage no disponible, usando localStorage estándar');
                // Resetear el flag después de un delay
                setTimeout(() => {
                    isInitializingStorage = false;
                }, 1000);
                return false;
            }
        }
        
        // Función para persistir confirmación de invitado
        let isPersistingConfirmation = false;
        
        function persistGuestConfirmation(guestId, guestData) {
            if (!guestId || isPersistingConfirmation) {
                console.log('⚠️ Persistencia de confirmación ignorada:', { guestId, isPersistingConfirmation });
                return false;
            }
            
            isPersistingConfirmation = true;
            
            const confirmationData = {
                guestId: guestId,
                guestData: guestData,
                confirmedAt: new Date().toISOString(),
                timestamp: Date.now()
            };
            
            // Usar almacenamiento robusto si está disponible
            if (robustStorage && window.persistConfirmation) {
                const result = window.persistConfirmation(guestId, confirmationData);
                // Resetear el flag después de un delay
                setTimeout(() => {
                    isPersistingConfirmation = false;
                }, 1000);
                return result;
            }
            
            // Fallback a localStorage estándar
            try {
                localStorage.setItem(`boda_confirmado_${guestId}`, JSON.stringify(confirmationData));
                localStorage.setItem('boda_confirmado', JSON.stringify(confirmationData));
                console.log('✅ Confirmación persistida en localStorage');
                // Resetear el flag después de un delay
                setTimeout(() => {
                    isPersistingConfirmation = false;
                }, 1000);
                return true;
            } catch (e) {
                console.warn('❌ Error persistiendo en localStorage:', e);
                // Resetear el flag después de un delay
                setTimeout(() => {
                    isPersistingConfirmation = false;
                }, 1000);
                return false;
            }
        }
        
        // Función para recuperar confirmación de invitado
        let isRecoveringConfirmation = false;
        
        function recoverGuestConfirmation(guestId) {
            if (!guestId || isRecoveringConfirmation) {
                console.log('⚠️ Recuperación de confirmación ignorada:', { guestId, isRecoveringConfirmation });
                return null;
            }
            
            isRecoveringConfirmation = true;
            
            // Usar almacenamiento robusto si está disponible
            if (robustStorage) {
                const data = robustStorage.get(`boda_confirmado_${guestId}`);
                // Resetear el flag después de un delay
                setTimeout(() => {
                    isRecoveringConfirmation = false;
                }, 500);
                return data;
            }
            
            // Fallback a localStorage estándar
            try {
                const data = localStorage.getItem(`boda_confirmado_${guestId}`);
                // Resetear el flag después de un delay
                setTimeout(() => {
                    isRecoveringConfirmation = false;
                }, 500);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                console.warn('❌ Error recuperando de localStorage:', e);
                // Resetear el flag después de un delay
                setTimeout(() => {
                    isRecoveringConfirmation = false;
                }, 500);
                return null;
            }
        }
        
        // Función para limpiar confirmación de invitado
        let isClearingConfirmation = false;
        
        function clearGuestConfirmation(guestId) {
            if (!guestId || isClearingConfirmation) {
                console.log('⚠️ Limpieza de confirmación ignorada:', { guestId, isClearingConfirmation });
                return;
            }
            
            isClearingConfirmation = true;
            
            // Usar almacenamiento robusto si está disponible
            if (robustStorage) {
                robustStorage.remove(`boda_confirmado_${guestId}`);
                robustStorage.remove('boda_confirmado');
            }
            
            // Fallback a localStorage estándar
            try {
                localStorage.removeItem(`boda_confirmado_${guestId}`);
                localStorage.removeItem('boda_confirmado');
                console.log('✅ Confirmación limpiada de localStorage');
            } catch (e) {
                console.warn('❌ Error limpiando de localStorage:', e);
            }
            
            // Resetear el flag después de un delay
            setTimeout(() => {
                isClearingConfirmation = false;
            }, 500);
        }

        // --- Función para formatear nombres como lista ---
        let isFormattingNames = false;
        
        function formatNamesAsList(namesString) {
            if (!namesString || isFormattingNames) {
                console.log('⚠️ Formateo de nombres ignorado:', { namesString, isFormattingNames });
                return 'No disponible';
            }
            
            isFormattingNames = true;
            
            try {
                // Si es un string, dividir por comas y formatear
                if (typeof namesString === 'string') {
                    const names = namesString.split(',').map(name => name.trim()).filter(name => name);
                    if (names.length === 0) {
                        // Resetear el flag después de un delay
                        setTimeout(() => {
                            isFormattingNames = false;
                        }, 500);
                        return 'No disponible';
                    }
                    
                    const formattedNames = names.map(name => `<li>${name}</li>`).join('');
                    // Resetear el flag después de un delay
                    setTimeout(() => {
                        isFormattingNames = false;
                    }, 500);
                    return `<ul style="margin: 0; padding-left: 20px;">${formattedNames}</ul>`;
                }
                
                // Resetear el flag después de un delay
                setTimeout(() => {
                    isFormattingNames = false;
                }, 500);
                return 'Formato no válido';
            } catch (e) {
                console.error('Error formateando nombres:', e);
                // Resetear el flag después de un delay
                setTimeout(() => {
                    isFormattingNames = false;
                }, 500);
                return 'Error en formato';
            }
        }

        // --- Función para actualizar la UI de validación ---
        let isUpdatingUI = false;
        
        function updateValidationUI(status, message, invitado = null) {
            // Evitar actualizaciones duplicadas
            if (isUpdatingUI) {
                console.log('⚠️ Ya se está actualizando la UI, ignorando llamada adicional');
                return;
            }
            
            isUpdatingUI = true;
            
            // Limpiar clases anteriores
            statusIcon.classList.remove('fa-spinner', 'fa-spin', 'loading', 'fa-check-circle', 'success', 'fa-times-circle', 'error', 'fa-question-circle');
            statusMessageEl.classList.remove('loading-message', 'success', 'error');

            if (status === 'success' && invitado) {
                // Animación de éxito
                statusIcon.classList.add('fas', 'fa-check-circle', 'success');
                statusMessageEl.textContent = message || "¡Invitado Válido!";
                statusMessageEl.classList.add('success');
                
                // Actualizar detalles básicos del invitado
                guestNameEl.textContent = invitado.nombre || 'No disponible';
                passesEl.textContent = invitado.pases != null ? invitado.pases : '-';
                kidsEl.textContent = invitado.ninos != null ? invitado.ninos : '-';
                guestIdEl.textContent = invitado.id || '---';
                
                // Mostrar información de mesa si está disponible
                if (invitado.mesa && invitado.mesa.trim() !== '') {
                    if (mesaEl) mesaEl.textContent = invitado.mesa;
                    if (mesaRow) mesaRow.style.display = 'block';
                } else {
                    if (mesaRow) mesaRow.style.display = 'none';
                }
                
                // Actualizar estado
                if (statusEl) {
                    const estado = invitado.estado || 'Pendiente';
                    statusEl.textContent = estado;
                    
                    // Cambiar el color según el estado
                    if (estado === 'Confirmado') {
                        statusEl.style.color = '#4CAF50';
                        statusEl.style.fontWeight = 'bold';
                    } else {
                        statusEl.style.color = '#ffc107';
                        statusEl.style.fontWeight = 'bold';
                    }
                }
                
                // Mostrar detalles básicos con animación
                guestDetailsDiv.style.display = 'block';
                guestDetailsDiv.style.opacity = '0';
                guestDetailsDiv.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    guestDetailsDiv.style.transition = 'all 0.5s ease';
                    guestDetailsDiv.style.opacity = '1';
                    guestDetailsDiv.style.transform = 'translateY(0)';
                }, 100);
                
                // Si el invitado está confirmado, mostrar detalles de confirmación
                if (invitado.confirmado || invitado.estado === 'Confirmado') {
                    showConfirmationDetails(invitado);
                }
                
                // Persistir confirmación para recuperación en Chrome móvil
                if (invitado.id) {
                    persistGuestConfirmation(invitado.id, invitado);
                }
                
            } else if (status === 'error') {
                // Animación de error
                statusIcon.classList.add('fas', 'fa-times-circle', 'error');
                statusMessageEl.textContent = message || "Error en la validación";
                statusMessageEl.classList.add('error');
                
                // Ocultar detalles del invitado
                guestDetailsDiv.style.display = 'none';
                if (confirmationDetailsDiv) {
                    confirmationDetailsDiv.style.display = 'none';
                }
            }
            
            // Resetear el flag después de un delay
            setTimeout(() => {
                isUpdatingUI = false;
            }, 1000);
        }
        
        // --- Función para mostrar detalles de confirmación ---
        let isShowingConfirmation = false;
        
        function showConfirmationDetails(invitado) {
            if (!confirmationDetailsDiv || isShowingConfirmation) {
                console.log('⚠️ Mostrar confirmación ignorada:', { confirmationDetailsDiv, isShowingConfirmation });
                return;
            }
            
            isShowingConfirmation = true;
            
            // Actualizar detalles de confirmación
            if (passesUsedEl) passesUsedEl.textContent = invitado.pases_utilizados || invitado.pases || '---';
            if (kidsUsedEl) kidsUsedEl.textContent = invitado.ninos_utilizados || invitado.ninos || '---';
            if (adultNamesEl) adultNamesEl.innerHTML = formatNamesAsList(invitado.nombres_adultos || invitado.nombre);
            if (phoneEl) phoneEl.textContent = invitado.telefono || 'No especificado';
            if (emailEl) emailEl.textContent = invitado.email || 'No especificado';
            if (confirmationDateEl) {
                const fecha = invitado.fecha_confirmacion || invitado.confirmed_at || '---';
                confirmationDateEl.textContent = fecha;
            }
            
            // Mostrar nombres de niños si hay
            if (invitado.nombres_ninos && invitado.nombres_ninos.trim() !== '') {
                if (kidsNamesEl) kidsNamesEl.innerHTML = formatNamesAsList(invitado.nombres_ninos);
                if (kidsNamesRow) kidsNamesRow.style.display = 'block';
            } else {
                if (kidsNamesRow) kidsNamesRow.style.display = 'none';
            }
            
            // Mostrar email si está disponible
            if (invitado.email && invitado.email.trim() !== '') {
                if (emailRow) emailRow.style.display = 'block';
            } else {
                if (emailRow) emailRow.style.display = 'none';
            }
            
            // Mostrar detalles de confirmación con animación
            confirmationDetailsDiv.style.display = 'block';
            confirmationDetailsDiv.style.opacity = '0';
            confirmationDetailsDiv.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                confirmationDetailsDiv.style.transition = 'all 0.5s ease';
                confirmationDetailsDiv.style.opacity = '1';
                confirmationDetailsDiv.style.transform = 'translateY(0)';
            }, 200);
            
            // Resetear el flag después de un delay
            setTimeout(() => {
                isShowingConfirmation = false;
            }, 1000);
        }

        // --- Función para validar invitado ---
        let isPerformingValidation = false;
        
        function performValidation(guestId) {
            if (!guestId) {
                updateValidationUI('error', "Por favor, ingresa un ID de invitado válido.");
                return;
            }
            
            // Evitar validaciones duplicadas
            if (isPerformingValidation) {
                console.log('⚠️ Ya se está realizando una validación, ignorando llamada adicional');
                return;
            }
            
            isPerformingValidation = true;
            
            // Validar formato del ID
            if (!/^[a-z0-9]{6}$/.test(guestId)) {
                updateValidationUI('error', "El ID debe tener exactamente 6 caracteres (letras y números).");
                isPerformingValidation = false;
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
            if (confirmationDetailsDiv) {
                confirmationDetailsDiv.style.display = 'none';
            }

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
                isPerformingValidation = false;
            }, 15000); // Timeout de 15 segundos

            // Manejar errores de carga del script
            scriptTag.onerror = () => {
                clearTimeout(timeoutId);
                console.error("Error al cargar el script JSONP desde:", validationUrl);
                updateValidationUI('error', "Error de comunicación con el servidor. Intenta de nuevo.");
                // Limpiar
                try { document.body.removeChild(scriptTag); } catch (e) {}
                try { delete window[callbackFunctionName]; } catch (e) {}
                isPerformingValidation = false;
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
                isPerformingValidation = false;
            };

            // Añadir el script al body
            console.log("Añadiendo script JSONP:", validationUrl);
            document.body.appendChild(scriptTag);
        }

        // --- Función para mostrar estado inicial mejorado ---
        let isShowingInitialState = false;
        
        function showInitialState() {
            // Evitar ejecuciones duplicadas
            if (isShowingInitialState) {
                console.log('⚠️ Ya se está mostrando el estado inicial, ignorando llamada adicional');
                return;
            }
            
            isShowingInitialState = true;
            
            // Limpiar clases del icono
            statusIcon.classList.remove('fas', 'fa-spinner', 'fa-spin', 'loading', 'fa-check-circle', 'success', 'fa-times-circle', 'error');
            statusIcon.classList.add('fas', 'fa-id-card');
            statusIcon.style.color = '#d1b0a0';
            
            // Limpiar clases del mensaje
            statusMessageEl.classList.remove('loading-message', 'success', 'error');
            statusMessageEl.textContent = "Ingresa tu ID de invitado para validar tu acceso.";
            
            // Ocultar todos los detalles del invitado
            guestDetailsDiv.style.display = 'none';
            if (confirmationDetailsDiv) {
                confirmationDetailsDiv.style.display = 'none';
            }
            
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
            
            // Resetear el flag después de un delay
            setTimeout(() => {
                isShowingInitialState = false;
            }, 1000);
        }

        // --- Función para limpiar formulario ---
        let isClearingForm = false;
        
        function clearForm() {
            if (isClearingForm) {
                console.log('⚠️ Ya se está limpiando el formulario, ignorando llamada adicional');
                return;
            }
            
            isClearingForm = true;
            
            if (guestIdInput) {
                guestIdInput.value = '';
                guestIdInput.focus();
            }
            
            // Resetear el flag después de un delay
            setTimeout(() => {
                isClearingForm = false;
            }, 500);
        }
        
        // --- Función para recuperar estado del invitado ---
        let isRecoveringState = false;
        
        function recoverGuestState(guestId) {
            if (!guestId || isRecoveringState) {
                console.log('⚠️ Recuperación de estado ignorada:', { guestId, isRecoveringState });
                return;
            }
            
            isRecoveringState = true;
            console.log(`🔧 Recuperando estado del invitado ${guestId}...`);
            
            // Verificar si hay confirmación persistida
            const confirmation = recoverGuestConfirmation(guestId);
            if (confirmation && confirmation.guestData) {
                console.log('✅ Estado del invitado recuperado de almacenamiento local');
                updateValidationUI('success', "¡Invitado Válido! Acceso confirmado.", confirmation.guestData);
                isRecoveringState = false;
                return;
            }
            
            // Si no hay confirmación persistida, validar desde el servidor
            console.log('🔍 No hay confirmación persistida, validando desde servidor...');
            performValidation(guestId);
            
            // Resetear el flag después de un delay
            setTimeout(() => {
                isRecoveringState = false;
            }, 3000);
        }

        // --- Lógica Principal ---
        const urlParams = new URLSearchParams(window.location.search);
        const guestIdFromUrl = urlParams.get('id');

        // Inicializar almacenamiento robusto
        initializeRobustStorage();
        
        // Variable para controlar si ya se está procesando una validación
        let isProcessingValidation = false;
        
        // Función para manejar la lógica de validación de manera controlada ---
        let isHandlingValidation = false;
        
        function handleValidationLogic() {
            if (isHandlingValidation) {
                console.log('⚠️ Ya se está manejando la lógica de validación, ignorando llamada adicional');
                return;
            }
            
            isHandlingValidation = true;
            
            if (guestIdFromUrl) {
                // Si el ID está en la URL, validar directamente
                console.log('🔍 ID encontrado en URL, validando directamente:', guestIdFromUrl);
                performValidation(guestIdFromUrl);
            } else {
                // Si no hay ID en la URL, mostrar el formulario
                console.log('📝 No hay ID en URL, mostrando formulario');
                showInitialState();
            }
            
            // Resetear el flag después de un delay
            setTimeout(() => {
                isHandlingValidation = false;
            }, 2000);
        }
        
        // Intentar recuperar estado si es Chrome móvil, pero solo si no hay ID en la URL
        if (window.recoverChromeMobileState && !guestIdFromUrl) {
            console.log('🔧 Chrome móvil detectado, intentando recuperar estado...');
            setTimeout(() => {
                window.recoverChromeMobileState();
            }, 1000);
        } else if (guestIdFromUrl) {
            // Si hay ID en la URL, procesar inmediatamente
            console.log('🔍 ID en URL detectado, procesando validación inmediatamente');
            handleValidationLogic();
        } else {
            // Si no hay ID en URL, mostrar formulario
            console.log('📝 Inicializando formulario de validación');
            handleValidationLogic();
        }

        if (!guestIdFromUrl) {
            // Solo configurar el formulario si no hay ID en la URL
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
        let isAddingNewButton = false;
        
        function addNewValidationButton() {
            // Evitar ejecuciones duplicadas
            if (isAddingNewButton) {
                console.log('⚠️ Ya se está agregando el botón de nueva validación, ignorando llamada adicional');
                return;
            }
            
            isAddingNewButton = true;
            
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
            
            // Resetear el flag después de un delay
            setTimeout(() => {
                isAddingNewButton = false;
            }, 1000);
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
        
        // --- EXPONER FUNCIONES GLOBALMENTE PARA INTEGRACIÓN ---
        window.performValidation = performValidation;
        window.recoverGuestState = recoverGuestState;
        
        let isUpdatingUIBasedOnConfirmation = false;
        
        window.updateUIBasedOnConfirmation = function(confirmed, guestId) {
            if (isUpdatingUIBasedOnConfirmation) {
                console.log('⚠️ Ya se está actualizando la UI basada en confirmación, ignorando llamada adicional');
                return;
            }
            
            isUpdatingUIBasedOnConfirmation = true;
            
            if (confirmed && guestId) {
                console.log('🔧 Actualizando UI basada en confirmación para:', guestId);
                recoverGuestState(guestId);
            }
            
            // Resetear el flag después de un delay
            setTimeout(() => {
                isUpdatingUIBasedOnConfirmation = false;
            }, 2000);
        };

    }); // Fin DOMContentLoaded
})();