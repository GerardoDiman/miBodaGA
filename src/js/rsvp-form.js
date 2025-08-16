// rsvp-form.js - Manejo del formulario RSVP

(function() {
    document.addEventListener('DOMContentLoaded', () => {
        
        // --- Referencias a Elementos HTML ---
        const rsvpFormContainer = document.getElementById('rsvp-form-container');
        const rsvpForm = document.getElementById('rsvp-form');
        const guestCountSelect = document.getElementById('guest-count');
        const guestNamesTable = document.getElementById('guest-names-table');
        const guestNamesTbody = document.getElementById('guest-names-tbody');
        const kidsSection = document.getElementById('kids-section');
        const kidsCountSelect = document.getElementById('kids-count');
        const kidsNamesSection = document.getElementById('kids-names-section');
        const kidsNamesTable = document.getElementById('kids-names-table');
        const kidsNamesTbody = document.getElementById('kids-names-tbody');
        const guestPhoneInput = document.getElementById('guest-phone');
        const guestEmailInput = document.getElementById('guest-email');
        const rsvpFormClose = document.getElementById('rsvp-form-close');
        const rsvpFormCancel = document.getElementById('rsvp-form-cancel');
        const rsvpFormSubmit = document.querySelector('.rsvp-form-submit');
        const confirmButton = document.querySelector('.confirm-main-rsvp-button');
        
        // --- Configuraciones ---
        const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPma1X-J0EgAPsYkXYhNT2I8LCSdANRa6CfcQLtFTVp8Xy5AZY5tAKm1apsE-0i9yW/exec';
        // Fecha límite para realizar confirmaciones (inclusive hasta las 23:59:59 de ese día - hora local del navegador)
        const RSVP_DEADLINE = new Date('2025-09-20T23:59:59');
        
        // --- Variables de Estado ---
        let invitadoActual = null;
        let pasesDisponibles = 0;

        // --- Lógica de Fecha Límite ---
        function isPastRsvpDeadline() {
            const now = new Date();
            return now.getTime() > RSVP_DEADLINE.getTime();
        }

        function showDeadlineNotice() {
            // Si ya existe, no duplicar
            if (document.getElementById('rsvp-deadline-notice')) return;

            const notice = document.createElement('div');
            notice.id = 'rsvp-deadline-notice';
            notice.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(209, 72, 54, 0.95);
                color: #fff;
                padding: 24px;
                border-radius: 12px;
                z-index: 3000;
                text-align: center;
                max-width: 520px;
                width: calc(100% - 40px);
                box-shadow: 0 12px 40px rgba(0,0,0,0.5);
            `;
            const deadlineDate = RSVP_DEADLINE.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
            notice.innerHTML = `
                <h3 style="margin: 0 0 10px 0; font-size: 1.3em;">⚠️ Confirmación cerrada</h3>
                <p style="margin: 0 0 16px 0; line-height: 1.5;">
                    La confirmación estuvo disponible hasta el <strong>${deadlineDate}</strong>.
                    Ya no es posible confirmar.
                </p>
                <button type="button" aria-label="Cerrar aviso" style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.35);
                    color: #fff;
                    padding: 10px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9em;
                ">Entendido</button>
            `;
            const closeBtn = notice.querySelector('button');
            closeBtn.addEventListener('click', () => notice.remove());
            document.body.appendChild(notice);
        }

        function disableConfirmIfPastDeadline() {
            if (isPastRsvpDeadline() && confirmButton) {
                confirmButton.setAttribute('aria-disabled', 'true');
                confirmButton.disabled = true;
                confirmButton.textContent = 'Confirmación cerrada';
                confirmButton.style.opacity = '0.6';
                confirmButton.style.cursor = 'not-allowed';
            }
        }

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
            
            console.log('🔍 RSVP - Detección de navegador:', {
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
        
        // --- Funciones Helper ---
        
        /** Muestra el formulario RSVP */
        function showRsvpForm() {
            if (!invitadoActual) {
                console.error('No hay invitado actual para mostrar el formulario');
                return;
            }
            
            // Configurar opciones de pases disponibles
            setupGuestCountOptions();
            
            // Limpiar tabla existente
            guestNamesTbody.innerHTML = '';
            
            // Mostrar el formulario
            rsvpFormContainer.style.display = 'block';
            
            // Scroll suave hacia el formulario
            rsvpFormContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
            // Enfocar el primer campo
            setTimeout(() => {
                guestCountSelect.focus();
            }, 100);
            
            // Inicializar dropdowns personalizados después de mostrar el formulario
            setTimeout(() => {
                console.log('🎨 Inicializando dropdowns personalizados en showRsvpForm');
                if (window.initCustomDropdowns) {
                    window.initCustomDropdowns();
                }
                if (window.forceDropdownStyles) {
                    window.forceDropdownStyles();
                }
                
                // Verificar que los dropdowns se crearon correctamente
                setTimeout(() => {
                    const guestCountDropdown = guestCountSelect._customDropdownInstance;
                    const kidsCountDropdown = kidsCountSelect._customDropdownInstance;
                    
                    console.log('📊 Estado de dropdowns:');
                    console.log('- Guest Count Dropdown:', guestCountDropdown ? 'Creado' : 'No creado');
                    console.log('- Kids Count Dropdown:', kidsCountDropdown ? 'Creado' : 'No creado');
                    
                    if (guestCountDropdown) {
                        console.log('- Guest Count opciones:', guestCountDropdown.items.length);
                    }
                    if (kidsCountDropdown) {
                        console.log('- Kids Count opciones:', kidsCountDropdown.items.length);
                    }
                }, 100);
            }, 200);
        }
        
        /** Oculta el formulario RSVP */
        function hideRsvpForm() {
            rsvpFormContainer.style.display = 'none';
            
            // Limpiar formulario
            rsvpForm.reset();
            
            // Scroll suave hacia arriba
            document.querySelector('.rsvp-section').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
        
        /** Configura las opciones de pases disponibles */
        function setupGuestCountOptions() {
            if (!invitadoActual) return;
            
            // Limpiar opciones existentes
            guestCountSelect.innerHTML = '<option value="" style="background-color: rgba(30, 30, 30, 0.95) !important; color: var(--color-text) !important; padding: 12px 16px !important; border: none !important; font-family: var(--font-primary) !important; font-size: 0.9em !important; border-radius: 4px !important; margin: 2px 4px !important;">Selecciona...</option>';
            
            // Agregar opciones desde 1 hasta el número de pases disponibles
            for (let i = 1; i <= invitadoActual.pases; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `${i} ${i === 1 ? 'pase' : 'pases'}`;
                option.style.cssText = 'background-color: rgba(30, 30, 30, 0.95) !important; color: var(--color-text) !important; padding: 12px 16px !important; border: none !important; font-family: var(--font-primary) !important; font-size: 0.9em !important; border-radius: 4px !important; margin: 2px 4px !important;';
                guestCountSelect.appendChild(option);
            }
            
            // Configurar opciones de niños si hay niños disponibles
            if (invitadoActual.ninos && invitadoActual.ninos > 0) {
                kidsSection.style.display = 'block';
                setupKidsCountOptions();
            } else {
                kidsSection.style.display = 'none';
                kidsNamesSection.style.display = 'none';
            }
            
            pasesDisponibles = invitadoActual.pases;
            
            // Actualizar dropdowns personalizados después de cambiar opciones
            setTimeout(() => {
                console.log('🔄 Actualizando dropdowns después de setupGuestCountOptions');
                
                // Intentar actualizar primero
                if (!window.updateDropdownById || !window.updateDropdownById('guest-count')) {
                    // Si no funciona, recrear el dropdown
                    console.log('🔧 Recreando dropdown guest-count');
                    if (window.recreateDropdownById) {
                        window.recreateDropdownById('guest-count');
                    }
                }
                
                // Actualizar todos los dropdowns como respaldo
                if (window.updateCustomDropdowns) {
                    window.updateCustomDropdowns();
                }
            }, 100);
        }
        
        /** Configura las opciones de niños disponibles */
        function setupKidsCountOptions() {
            if (!invitadoActual || !invitadoActual.ninos) return;
            
            // Limpiar opciones existentes
            kidsCountSelect.innerHTML = '<option value="0" style="background-color: rgba(30, 30, 30, 0.95) !important; color: var(--color-text) !important; padding: 12px 16px !important; border: none !important; font-family: var(--font-primary) !important; font-size: 0.9em !important; border-radius: 4px !important; margin: 2px 4px !important;">0 niños</option>';
            
            // Agregar opciones desde 1 hasta el número de niños disponibles
            for (let i = 1; i <= invitadoActual.ninos; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `${i} ${i === 1 ? 'niño' : 'niños'}`;
                option.style.cssText = 'background-color: rgba(30, 30, 30, 0.95) !important; color: var(--color-text) !important; padding: 12px 16px !important; border: none !important; font-family: var(--font-primary) !important; font-size: 0.9em !important; border-radius: 4px !important; margin: 2px 4px !important;';
                kidsCountSelect.appendChild(option);
            }
            
            // Actualizar dropdowns personalizados después de cambiar opciones de niños
            setTimeout(() => {
                console.log('🔄 Actualizando dropdowns después de setupKidsCountOptions');
                
                // Intentar actualizar primero
                if (!window.updateDropdownById || !window.updateDropdownById('kids-count')) {
                    // Si no funciona, recrear el dropdown
                    console.log('🔧 Recreando dropdown kids-count');
                    if (window.recreateDropdownById) {
                        window.recreateDropdownById('kids-count');
                    }
                }
                
                // Actualizar todos los dropdowns como respaldo
                if (window.updateCustomDropdowns) {
                    window.updateCustomDropdowns();
                }
            }, 100);
        }
        
        /** Genera la tabla de nombres de invitados */
        function generateGuestNamesTable(guestCount) {
            const tablePlaceholder = document.getElementById('table-placeholder');
            const guestNamesTable = document.getElementById('guest-names-table');
            
            // Limpiar tabla existente
            guestNamesTbody.innerHTML = '';
            
            console.log(`Generando tabla para ${guestCount} pases`);
            
            // Ocultar placeholder y mostrar tabla
            if (tablePlaceholder) tablePlaceholder.style.display = 'none';
            if (guestNamesTable) guestNamesTable.style.display = 'table';
            
            // Generar filas según el número de pases seleccionados
            for (let i = 1; i <= guestCount; i++) {
                const row = document.createElement('tr');
                
                // Celda del número
                const numberCell = document.createElement('td');
                numberCell.textContent = i;
                numberCell.style.textAlign = 'center';
                numberCell.style.fontWeight = 'bold';
                numberCell.style.width = '50px';
                row.appendChild(numberCell);
                
                // Celda del input de nombre
                const nameCell = document.createElement('td');
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.placeholder = `Nombre completo ${i}`;
                nameInput.required = true;
                nameInput.className = 'guest-name-input';
                nameInput.setAttribute('data-row', i);
                nameCell.appendChild(nameInput);
                row.appendChild(nameCell);
                
                guestNamesTbody.appendChild(row);
            }
            
            // Enfocar el primer input después de generar la tabla
            setTimeout(() => {
                const firstInput = guestNamesTbody.querySelector('input');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        }
        
        /** Genera la tabla de nombres de niños */
        function generateKidsNamesTable(kidsCount) {
            const kidsTablePlaceholder = document.getElementById('kids-table-placeholder');
            const kidsNamesTable = document.getElementById('kids-names-table');
            
            // Limpiar tabla existente
            kidsNamesTbody.innerHTML = '';
            
            console.log(`Generando tabla para ${kidsCount} niños`);
            
            if (kidsCount > 0) {
                // Ocultar placeholder y mostrar tabla
                if (kidsTablePlaceholder) kidsTablePlaceholder.style.display = 'none';
                if (kidsNamesTable) kidsNamesTable.style.display = 'table';
                
                // Generar filas según el número de niños seleccionados
                for (let i = 1; i <= kidsCount; i++) {
                    const row = document.createElement('tr');
                    
                    // Celda del número
                    const numberCell = document.createElement('td');
                    numberCell.textContent = i;
                    numberCell.style.textAlign = 'center';
                    numberCell.style.fontWeight = 'bold';
                    numberCell.style.width = '50px';
                    row.appendChild(numberCell);
                    
                    // Celda del input de nombre
                    const nameCell = document.createElement('td');
                    const nameInput = document.createElement('input');
                    nameInput.type = 'text';
                    nameInput.placeholder = `Nombre completo ${i}`;
                    nameInput.required = true;
                    nameInput.className = 'kids-name-input';
                    nameInput.setAttribute('data-row', i);
                    nameCell.appendChild(nameInput);
                    row.appendChild(nameCell);
                    
                    kidsNamesTbody.appendChild(row);
                }
                
                // Enfocar el primer input después de generar la tabla
                setTimeout(() => {
                    const firstInput = kidsNamesTbody.querySelector('input');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }, 100);
            } else {
                // Mostrar placeholder y ocultar tabla
                if (kidsTablePlaceholder) kidsTablePlaceholder.style.display = 'flex';
                if (kidsNamesTable) kidsNamesTable.style.display = 'none';
            }
        }
        
        /** Obtiene los nombres de la tabla */
        function getGuestNamesFromTable() {
            const nameInputs = guestNamesTbody.querySelectorAll('input[type="text"]');
            const names = [];
            
            nameInputs.forEach(input => {
                const name = input.value.trim();
                if (name) {
                    names.push(name);
                }
            });
            
            return names;
        }
        
        /** Obtiene los nombres de niños de la tabla */
        function getKidsNamesFromTable() {
            const nameInputs = kidsNamesTbody.querySelectorAll('input[type="text"]');
            const names = [];
            
            nameInputs.forEach(input => {
                const name = input.value.trim();
                if (name) {
                    names.push(name);
                }
            });
            
            return names;
        }
        
        /** Valida el formulario antes de enviar */
        function validateForm() {
            const guestCount = guestCountSelect.value;
            const guestNames = getGuestNamesFromTable();
            const kidsCount = kidsCountSelect ? kidsCountSelect.value : '0';
            const kidsNames = getKidsNamesFromTable();
            const guestPhone = guestPhoneInput.value.trim();
            
            // Validar número de pases de adultos
            if (!guestCount || guestCount === '') {
                showFormError('Por favor selecciona el número de pases de adultos a utilizar.');
                guestCountSelect.focus();
                return false;
            }
            
            // Validar nombres de adultos
            if (guestNames.length === 0) {
                showFormError('Por favor escribe los nombres de los adultos.');
                const firstInput = guestNamesTbody.querySelector('input');
                if (firstInput) firstInput.focus();
                return false;
            }
            
            // Validar que todos los campos de nombre de adultos estén llenos
            const nameInputs = guestNamesTbody.querySelectorAll('input[type="text"]');
            for (let input of nameInputs) {
                if (!input.value.trim()) {
                    showFormError('Por favor completa todos los nombres de los adultos.');
                    input.focus();
                    return false;
                }
            }
            
            // Validar que el número de nombres de adultos coincida con el número de pases
            if (guestNames.length !== parseInt(guestCount)) {
                showFormError(`Has seleccionado ${guestCount} ${parseInt(guestCount) === 1 ? 'pase' : 'pases'} de adultos pero has escrito ${guestNames.length} ${guestNames.length === 1 ? 'nombre' : 'nombres'}. Por favor asegúrate de que coincidan.`);
                const firstInput = guestNamesTbody.querySelector('input');
                if (firstInput) firstInput.focus();
                return false;
            }
            
            // Validar niños si hay niños disponibles
            if (invitadoActual.ninos && invitadoActual.ninos > 0) {
                const selectedKidsCount = parseInt(kidsCount);
                
                // Si seleccionó niños, validar nombres
                if (selectedKidsCount > 0) {
                    if (kidsNames.length === 0) {
                        showFormError('Por favor escribe los nombres de los niños.');
                        const firstKidsInput = kidsNamesTbody.querySelector('input');
                        if (firstKidsInput) firstKidsInput.focus();
                        return false;
                    }
                    
                    // Validar que todos los campos de nombre de niños estén llenos
                    const kidsNameInputs = kidsNamesTbody.querySelectorAll('input[type="text"]');
                    for (let input of kidsNameInputs) {
                        if (!input.value.trim()) {
                            showFormError('Por favor completa todos los nombres de los niños.');
                            input.focus();
                            return false;
                        }
                    }
                    
                    // Validar que el número de nombres de niños coincida con el número seleccionado
                    if (kidsNames.length !== selectedKidsCount) {
                        showFormError(`Has seleccionado ${selectedKidsCount} ${selectedKidsCount === 1 ? 'niño' : 'niños'} pero has escrito ${kidsNames.length} ${kidsNames.length === 1 ? 'nombre' : 'nombres'}. Por favor asegúrate de que coincidan.`);
                        const firstKidsInput = kidsNamesTbody.querySelector('input');
                        if (firstKidsInput) firstKidsInput.focus();
                        return false;
                    }
                }
            }
            
            // Validar teléfono
            if (!guestPhone) {
                showFormError('Por favor proporciona un número de teléfono.');
                guestPhoneInput.focus();
                return false;
            }
            
            // Validar formato de teléfono (básico)
            const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(guestPhone)) {
                showFormError('Por favor ingresa un número de teléfono válido.');
                guestPhoneInput.focus();
                return false;
            }
            
            return true;
        }
        
        /** Muestra un error en el formulario */
        function showFormError(message) {
            // Remover errores anteriores
            const existingError = document.querySelector('.form-error');
            if (existingError) {
                existingError.remove();
            }
            
            // Crear y mostrar nuevo error
            const errorDiv = document.createElement('div');
            errorDiv.className = 'form-error';
            errorDiv.style.cssText = `
                background: rgba(255, 0, 0, 0.1);
                border: 1px solid rgba(255, 0, 0, 0.3);
                color: #ff6b6b;
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                font-size: 0.9em;
                text-align: center;
            `;
            errorDiv.textContent = message;
            
            // Insertar al inicio del formulario
            rsvpForm.insertBefore(errorDiv, rsvpForm.firstChild);
            
            // Remover automáticamente después de 5 segundos
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 5000);
        }
        
        /** Envía los datos del formulario a Google Sheets */
        function submitFormData(formData) {
            return new Promise((resolve, reject) => {
                const dataToSend = {
                    id: invitadoActual.id,
                    nombre: invitadoActual.nombre,
                    pases: invitadoActual.pases,
                    ninos: invitadoActual.ninos,
                    pasesUtilizados: formData.guestCount,
                    ninosUtilizados: formData.kidsCount || '0',
                    nombresInvitados: formData.guestNames.join(', '),
                    nombresNinos: formData.kidsNames.join(', ') || '',
                    telefono: formData.guestPhone,
                    email: formData.guestEmail || '',
                    timestamp: new Date().toISOString()
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
                    console.log('✅ Datos del formulario enviados exitosamente');
                    resolve(true);
                })
                .catch(error => {
                    console.error('❌ Error enviando datos del formulario:', error);
                    reject(error);
                });
            });
        }
        
        /** Muestra mensaje de éxito */
        function showSuccessMessage() {
            const successMessage = document.createElement('div');
            successMessage.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(76, 175, 80, 0.95);
                color: white;
                padding: 30px;
                border-radius: 15px;
                z-index: 2000;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            `;
            successMessage.innerHTML = `
                <h3 style="margin: 0 0 15px 0; font-size: 1.5em;">✅ ¡Confirmación Exitosa!</h3>
                <p style="margin: 0 0 20px 0; line-height: 1.5;">Gracias por confirmar tu asistencia. Te esperamos en nuestra boda.</p>
                <button onclick="this.parentElement.remove()" style="
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9em;
                ">Cerrar</button>
            `;
            document.body.appendChild(successMessage);
            
            // Remover automáticamente después de 5 segundos
            setTimeout(() => {
                if (successMessage.parentNode) {
                    successMessage.remove();
                }
            }, 5000);
        }
        
        // --- Event Listeners ---
        
        // Mostrar formulario al hacer clic en el botón confirmar
        if (confirmButton) {
            confirmButton.addEventListener('click', (e) => {
                e.preventDefault();
                // Bloquear apertura si pasó la fecha límite
                if (isPastRsvpDeadline()) {
                    showDeadlineNotice();
                    return;
                }
                if (!invitadoActual) {
                    console.error('No hay invitado actual');
                    return;
                }
                showRsvpForm();
            });
        }
        
        // Cerrar formulario con el botón X
        if (rsvpFormClose) {
            rsvpFormClose.addEventListener('click', hideRsvpForm);
        }
        
        // Cancelar formulario
        if (rsvpFormCancel) {
            rsvpFormCancel.addEventListener('click', hideRsvpForm);
        }
        
        // Remover el event listener para cerrar al hacer clic fuera del modal
        // ya que ahora el formulario está integrado en la sección
        
        // Event listener para cuando cambie el número de pases
        if (guestCountSelect) {
            guestCountSelect.addEventListener('change', (e) => {
                const selectedCount = parseInt(e.target.value);
                const tablePlaceholder = document.getElementById('table-placeholder');
                const guestNamesTable = document.getElementById('guest-names-table');
                
                console.log(`Pases seleccionados: ${selectedCount}`);
                
                if (selectedCount > 0) {
                    generateGuestNamesTable(selectedCount);
                } else {
                    guestNamesTbody.innerHTML = '';
                    // Mostrar placeholder y ocultar tabla
                    if (tablePlaceholder) tablePlaceholder.style.display = 'flex';
                    if (guestNamesTable) guestNamesTable.style.display = 'none';
                    console.log('Tabla limpiada - no hay pases seleccionados');
                }
            });
        }
        
        // Event listener para cuando cambie el número de niños
        if (kidsCountSelect) {
            kidsCountSelect.addEventListener('change', (e) => {
                const selectedCount = parseInt(e.target.value);
                console.log(`Niños seleccionados: ${selectedCount}`);
                
                if (selectedCount > 0) {
                    kidsNamesSection.style.display = 'block';
                    generateKidsNamesTable(selectedCount);
                } else {
                    kidsNamesSection.style.display = 'none';
                    kidsNamesTbody.innerHTML = '';
                    console.log('Tabla de niños limpiada - no hay niños seleccionados');
                }
            });
        }
        
        // Enviar formulario
        if (rsvpForm) {
            rsvpForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Validación de fecha límite también al enviar
                if (isPastRsvpDeadline()) {
                    showFormError('La confirmación por formulario cerró el 20 de septiembre de 2025. Por favor contáctanos por WhatsApp o por llamada.');
                    return;
                }

                // Validar formulario
                if (!validateForm()) {
                    return;
                }
                
                // Deshabilitar botón de envío
                rsvpFormSubmit.disabled = true;
                rsvpFormSubmit.textContent = 'Enviando...';
                
                // Recopilar datos del formulario
                const formData = {
                    guestCount: guestCountSelect.value,
                    guestNames: getGuestNamesFromTable(),
                    kidsCount: kidsCountSelect ? kidsCountSelect.value : '0',
                    kidsNames: getKidsNamesFromTable(),
                    guestPhone: guestPhoneInput.value.trim(),
                    guestEmail: guestEmailInput.value.trim()
                };
                
                try {
                    // Enviar datos a Google Sheets
                    await submitFormData(formData);
                    
                    // Guardar confirmación usando el sistema robusto de almacenamiento
                    if (invitadoActual && invitadoActual.id) {
                        const confirmationKey = `boda_confirmado_${invitadoActual.id}`;
                        const timestampKey = `${confirmationKey}_timestamp`;
                        
                        console.log('💾 Guardando confirmación usando sistema robusto...');
                        
                        const confirmationSaved = storageManager.setItem(confirmationKey, 'true');
                        const timestampSaved = storageManager.setItem(timestampKey, Date.now().toString());
                        
                        console.log('✅ Confirmación guardada:', {
                            confirmación: confirmationSaved,
                            timestamp: timestampSaved,
                            clave: confirmationKey
                        });
                        
                        // Para Chrome móvil, asegurar que también se guarde en cookies
                        const browserInfo = detectBrowserAndDevice();
                        if (browserInfo.isChromeMobile) {
                            try {
                                document.cookie = `${confirmationKey}=true;path=/;max-age=31536000`;
                                document.cookie = `${timestampKey}=${Date.now()};path=/;max-age=31536000`;
                                console.log('🍪 Confirmación también guardada en cookies para Chrome móvil');
                            } catch (e) {
                                console.warn('⚠️ No se pudo guardar en cookies para Chrome móvil:', e);
                            }
                        }
                    }
                    
                    // Mostrar mensaje de éxito
                    showSuccessMessage();
                    
                    // Ocultar formulario
                    hideRsvpForm();
                    
                    // Actualizar UI para mostrar QR inmediatamente
                    console.log('✅ Formulario enviado exitosamente, mostrando QR...');
                    
                    // Intentar usar la función global si está disponible
                    if (window.updateUIBasedOnConfirmation) {
                        window.updateUIBasedOnConfirmation(true);
                    } else {
                        // Fallback: mostrar QR directamente si la función no está disponible
                        console.log('⚠️ Función global no disponible, usando fallback local');
                        if (window.displayQrCode && invitadoActual) {
                            window.displayQrCode(invitadoActual);
                        } else {
                            // Fallback final: mostrar mensaje de éxito y ocultar botón
                            if (confirmButton) {
                                confirmButton.style.display = 'none';
                                confirmButton.disabled = true;
                            }
                            // Mostrar mensaje de que el QR se mostrará al recargar
                            const qrMessage = document.createElement('div');
                            qrMessage.style.cssText = `
                                background: rgba(76, 175, 80, 0.1);
                                border: 1px solid rgba(76, 175, 80, 0.3);
                                color: #4CAF50;
                                padding: 15px;
                                border-radius: 8px;
                                margin: 20px 0;
                                text-align: center;
                                font-size: 0.95em;
                            `;
                            qrMessage.innerHTML = `
                                <strong>✅ ¡Confirmación Exitosa!</strong><br>
                                Tu código QR se mostrará al recargar la página.
                            `;
                            
                            // Insertar el mensaje después del formulario
                            const rsvpSection = document.querySelector('.rsvp-section');
                            if (rsvpSection) {
                                rsvpSection.appendChild(qrMessage);
                            }
                        }
                    }
                    
                } catch (error) {
                    console.error('Error enviando formulario:', error);
                    showFormError('Hubo un error al enviar la confirmación. Por favor intenta de nuevo.');
                    
                    // Rehabilitar botón de envío
                    rsvpFormSubmit.disabled = false;
                    rsvpFormSubmit.textContent = 'Confirmar Asistencia';
                }
            });
        }
        
        // --- Inicialización ---
        
        // Función para inicializar el formulario con datos del invitado
        window.initRsvpForm = function(invitado) {
            invitadoActual = invitado;
            console.log('Formulario RSVP inicializado para:', invitado);
        };
        
        // Función para mostrar el formulario desde otros scripts
        window.showRsvpForm = showRsvpForm;
        
        // Función para ocultar el formulario desde otros scripts
        window.hideRsvpForm = hideRsvpForm;

        // Al cargar, si ya pasó la fecha límite, deshabilitar botón principal
        disableConfirmIfPastDeadline();

        // Exponer utilidades de fecha límite de forma global para otros módulos
        window.rsvpDeadline = {
            isPast: isPastRsvpDeadline,
            showNotice: showDeadlineNotice,
            deadline: RSVP_DEADLINE
        };
        
    });
})(); 