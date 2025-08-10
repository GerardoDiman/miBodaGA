// validar.js - Sistema de validación con escaneo QR y cámara
(function() {
    'use strict';
    
    // Estado global
    let elements = {};
    let cameraStream = null;
    let qrScanner = null;
    let currentCamera = 'environment';
    
    // Inicialización
    document.addEventListener('DOMContentLoaded', initializeApp);
    
    function initializeApp() {
        console.log('🚀 Inicializando sistema de validación...');
        
        try {
            initializeElements();
            setupEventListeners();
            checkCameraAvailability();
            
            if (window.VALIDAR_CONFIG && window.VALIDAR_CONFIG.optimizeForMobile) {
                window.VALIDAR_CONFIG.optimizeForMobile();
            }
            
            console.log('✅ Sistema inicializado correctamente');
        } catch (error) {
            console.error('❌ Error en inicialización:', error);
        }
    }
    
    function checkCameraAvailability() {
        if (!window.VALIDAR_CONFIG || !window.VALIDAR_CONFIG.camera || !window.VALIDAR_CONFIG.camera.isAvailable()) {
            console.log('📱 Cámara no disponible');
            if (elements.scanQRBtn) {
                elements.scanQRBtn.style.display = 'none';
            }
            return;
        }
        console.log('📱 Cámara disponible');
    }
    
    function initializeElements() {
        elements = {
            form: document.querySelector('.validation-form'),
            guestIdInput: document.getElementById('guestId'),
            validateBtn: document.getElementById('validateBtn'),
            scanQRBtn: document.getElementById('scanQRBtn'),
            cameraInterface: document.getElementById('cameraInterface'),
            cameraPreview: document.getElementById('cameraPreview'),
            closeCameraBtn: document.getElementById('closeCameraBtn'),
            switchCameraBtn: document.getElementById('switchCameraBtn'),
            toggleFlashBtn: document.getElementById('toggleFlashBtn'),
            testQRBtn: document.getElementById('testQRBtn'),
            statusMessage: document.getElementById('status-message'),
            guestDetails: document.getElementById('guest-details'),
            confirmationDetails: document.getElementById('confirmation-details')
        };
        console.log('🔍 Elementos inicializados:', Object.keys(elements));
    }
    
    function setupEventListeners() {
        console.log('🎯 Configurando event listeners...');
        
        if (elements.form) {
            elements.form.addEventListener('submit', handleValidationSubmit);
        }
        
        if (elements.scanQRBtn) {
            elements.scanQRBtn.addEventListener('click', openCameraInterface);
            console.log('✅ Botón QR configurado');
        }
        
        if (elements.closeCameraBtn) {
            elements.closeCameraBtn.addEventListener('click', closeCameraInterface);
        }
        
        if (elements.switchCameraBtn) {
            elements.switchCameraBtn.addEventListener('click', switchCamera);
        }
        
        if (elements.toggleFlashBtn) {
            elements.toggleFlashBtn.addEventListener('click', toggleFlash);
        }
        
        // testQRBtn eliminado del HTML
        
        if (elements.guestIdInput) {
            elements.guestIdInput.addEventListener('input', handleGuestIdInput);
        }
        
        console.log('✅ Event listeners configurados');
    }
    
    function openCameraInterface() {
        console.log('📹 Abriendo interfaz de cámara...');
        
        try {
            // Elevar la interfaz de cámara al body para evitar stacking/overflow del contenedor
            if (elements.cameraInterface && elements.cameraInterface.parentElement !== document.body) {
                document.body.appendChild(elements.cameraInterface);
            }
            if (elements.cameraInterface) {
                elements.cameraInterface.style.display = 'block';
                elements.cameraInterface.style.zIndex = '9999';
            }
            
            if (elements.form) {
                elements.form.style.display = 'none';
            }
            
            startCamera();
            
        } catch (error) {
            console.error('❌ Error al abrir cámara:', error);
            showCameraError(error);
        }
    }
    
    function closeCameraInterface() {
        console.log('📹 Cerrando interfaz de cámara...');
        
        stopCamera();
        stopQRScanning();
        
        if (elements.cameraInterface) {
            elements.cameraInterface.style.display = 'none';
        }
        
        if (elements.form) {
            elements.form.style.display = 'block';
        }
        
        if (elements.cameraPreview) {
            elements.cameraPreview.innerHTML = '';
        }
        
        resetToInitialState();
    }
    
    async function startCamera() {
        try {
            console.log('📹 Iniciando cámara...');
            
            if (!window.VALIDAR_CONFIG || !window.VALIDAR_CONFIG.camera) {
                throw new Error('Configuración de cámara no disponible');
            }
            
            console.log('🔧 Configuración:', window.VALIDAR_CONFIG.CAMERA);
            
            if (elements.cameraPreview) {
                elements.cameraPreview.innerHTML = '';
            }
            
            const stream = await window.VALIDAR_CONFIG.camera.startCamera(
                null,
                (stream) => {
                    console.log('✅ Stream de cámara obtenido exitosamente');
                    console.log('🎥 Tipo de cámara:', currentCamera);

                    // Asegurar que el stream esté disponible antes de crear el video
                    cameraStream = stream;
                    createVideoElement(stream);
                    startQRScanning();
                },
                (error) => {
                    console.error('❌ Error al iniciar cámara:', error);
                    showCameraError(error);
                }
            );
            
            cameraStream = stream;
            
        } catch (error) {
            console.error('❌ Error en startCamera:', error);
            showCameraError(error);
        }
    }
    
    function createVideoElement(providedStream) {
        console.log('🎬 Creando elemento de video...');
        
        if (!elements.cameraPreview) {
            console.error('❌ Camera preview no encontrado');
            return;
        }
        
        const existingVideo = elements.cameraPreview.querySelector('video');
        if (existingVideo) {
            existingVideo.remove();
        }
        
        const video = document.createElement('video');
        const streamToUse = providedStream || cameraStream;
        if (!streamToUse) {
            console.warn('⚠️ Stream de cámara no disponible al crear el video');
        }
        video.srcObject = streamToUse || null;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        
        if (currentCamera === 'user') {
            console.log('🪞 Aplicando espejo para cámara frontal');
            video.style.transform = 'scaleX(-1)';
        }
        
        console.log('✅ Video creado, agregando al DOM...');
        elements.cameraPreview.appendChild(video);
        
        video.onloadedmetadata = () => {
            console.log('📱 Video metadata cargada:', video.videoWidth, 'x', video.videoHeight);
            // Forzar play por si el autoplay no se dispara inmediatamente
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch((e) => console.warn('⚠️ Autoplay bloqueado, se intentará nuevamente al interactuar:', e));
            }
        };
        
        video.oncanplay = () => {
            console.log('▶️ Video puede reproducirse');
        };
        
        video.onplay = () => {
            console.log('🎬 Video iniciado');
        };
        
        console.log('✅ Elemento de video creado y configurado');
    }
    
    function startQRScanning() {
        console.log('🚀 Iniciando escaneo QR...');
        
        if (!qrScanner) {
            const interval = window.VALIDAR_CONFIG?.QR?.SCAN_INTERVAL || 100;
            console.log('✅ Creando intervalo de escaneo cada', interval, 'ms');
            
            addScanningIndicator();
            
            qrScanner = setInterval(() => {
                const video = elements.cameraPreview?.querySelector('video');
                if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
                    if (Math.random() < 0.01) {
                        console.log('📹 Frame listo para escaneo');
                    }
                    scanFrame(video);
                }
            }, interval);
            
            console.log('✅ Intervalo de escaneo creado, ID:', qrScanner);
        }
    }
    
    function addScanningIndicator() {
        console.log('🎯 Agregando indicador de escaneo...');
        
        if (!elements.cameraPreview) return;
        
        const existingIndicator = elements.cameraPreview.querySelector('.scanning-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        const indicator = document.createElement('div');
        indicator.className = 'scanning-indicator';
        elements.cameraPreview.appendChild(indicator);
        
        const cameraInfo = document.createElement('div');
        cameraInfo.className = 'camera-info';
        cameraInfo.innerHTML = `
            <small style="color: #666; font-size: 0.8em;">
                📱 ${currentCamera === 'environment' ? 'Cámara trasera' : 'Cámara frontal'}
                ${currentCamera === 'user' ? '(Espejo activado)' : ''}
            </small>
        `;
        elements.cameraPreview.appendChild(cameraInfo);
        
        if (elements.statusMessage) {
            elements.statusMessage.textContent = 'Escaneando código QR... Coloca el código frente a la cámara';
            elements.statusMessage.className = 'status-message loading-message';
            elements.statusMessage.style.display = 'block';
        }
        
        console.log('✅ Indicador de escaneo agregado');
    }
    
    function scanFrame(video) {
        if (!video || !video.videoWidth || !video.videoHeight) {
            return;
        }
        
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            if (typeof jsQR === 'undefined') {
                console.warn('⚠️ jsQR no disponible');
                return;
            }
            
            let code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert"
            });
            
            if (!code) {
                code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "attemptBoth"
                });
            }
            
            if (code) {
                console.log('🔍 QR detectado:', code.data);
                
                if (qrScanner) {
                    clearInterval(qrScanner);
                    qrScanner = null;
                }
                
                handleQRResult(code.data);
            }
            
        } catch (error) {
            console.error('❌ Error en escaneo:', error);
        }
    }
    
    function stopQRScanning() {
        if (qrScanner) {
            console.log('🛑 Deteniendo escaneo QR...');
            clearInterval(qrScanner);
            qrScanner = null;
        }
    }
    
    function stopCamera() {
        console.log('📹 Deteniendo cámara...');
        
        if (cameraStream) {
            const tracks = cameraStream.getTracks();
            tracks.forEach(track => {
                track.stop();
            });
            cameraStream = null;
        }
    }
    
    function switchCamera() {
        console.log('🔄 Cambiando cámara...');
        
        stopCamera();
        stopQRScanning();
        
        currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
        console.log('📱 Nueva cámara:', currentCamera);
        
        startCamera();
    }
    
    function toggleFlash() {
        console.log('💡 Alternando flash...');
        // Implementación básica del flash
    }
    
    function testQRDetection() {
        console.log('🧪 Probando detección QR...');
        
        const video = elements.cameraPreview?.querySelector('video');
        if (video) {
            scanFrame(video);
        } else {
            console.log('❌ No hay video disponible para testing');
        }
    }
    
    // Extraer ID de invitado desde el dato del QR
    function getGuestIdFromQR(qrData) {
        if (!qrData) return null;
        // Intentar como URL con parámetro ?id=xxxxxx
        try {
            const url = new URL(qrData);
            const id = url.searchParams.get('id');
            if (id && /^[a-z0-9]{6}$/i.test(id)) {
                return id.toLowerCase();
            }
        } catch (_) { /* no es URL */ }
        // Fallback: primer token de 6 alfanuméricos
        const match = String(qrData).match(/[a-z0-9]{6}/i);
        return match ? match[0].toLowerCase() : null;
    }

    function handleQRResult(qrData) {
        console.log('🎯 Procesando resultado QR:', qrData);
        
        try {
            const guestId = getGuestIdFromQR(qrData);
            if (guestId) {
                console.log('✅ QR válido detectado. ID extraído:', guestId);

                if (elements.guestIdInput) {
                    elements.guestIdInput.value = guestId;
                }

                // Mostrar feedback y validar automáticamente
                if (elements.statusMessage) {
                    elements.statusMessage.textContent = `QR detectado: ${guestId}`;
                    elements.statusMessage.className = 'status-message success-message';
                }

                // Cerrar cámara y lanzar validación
                closeCameraInterface();
                validateGuest(guestId);

            } else {
                console.log('⚠️ QR inválido, reiniciando escaneo...');
                setTimeout(() => {
                    startQRScanning();
                }, 2000);
            }
            
        } catch (error) {
            console.error('❌ Error procesando QR:', error);
        }
    }
    
    function showCameraError(error) {
        console.error('📹 Error de cámara:', error);
        
        let errorMessage = 'Error al acceder a la cámara';
        
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Permiso de cámara denegado. Permite el acceso a la cámara en tu navegador.';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No se encontró ninguna cámara en tu dispositivo.';
        } else if (error.name === 'NotReadableError') {
            errorMessage = 'La cámara está siendo usada por otra aplicación.';
        }
        
        if (elements.statusMessage) {
            elements.statusMessage.textContent = errorMessage;
            elements.statusMessage.className = 'status-message error-message';
        }
    }
    
    function handleGuestIdInput(event) {
        const input = event.target;
        const value = input.value.trim();
        
        if (value.length === 6 && /^[a-z0-9]{6}$/.test(value)) {
            input.classList.remove('invalid');
            input.classList.add('valid');
        } else if (value.length > 0) {
            input.classList.remove('valid');
            input.classList.add('invalid');
        } else {
            input.classList.remove('valid', 'invalid');
        }
    }
    
    function handleValidationSubmit(event) {
        event.preventDefault();
        
        const guestId = elements.guestIdInput?.value?.trim();
        
        if (!guestId) {
            showErrorState('Por favor ingresa un ID de invitado');
            return;
        }
        
        if (!window.isValidGuestId || !window.isValidGuestId(guestId)) {
            showErrorState('ID de invitado inválido. Debe tener 6 caracteres alfanuméricos.');
            return;
        }
        
        validateGuest(guestId);
    }
    
    async function validateGuest(guestId) {
        try {
            showLoadingState();
            
            const result = await performValidation(guestId);
            handleValidationResult(result);
            
        } catch (error) {
            console.error('❌ Error en validación:', error);
            handleValidationError(error);
        }
    }
    
    function showLoadingState() {
        if (elements.statusMessage) {
            elements.statusMessage.textContent = 'Verificando invitado...';
            elements.statusMessage.className = 'status-message loading-message';
        }
        
        if (elements.validateBtn) {
            elements.validateBtn.disabled = true;
            elements.validateBtn.textContent = 'Validando...';
        }
    }
    
    async function performValidation(guestId) {
        // Usar JSONP con doGet para evitar CORS en Apps Script
        const baseUrl = window.VALIDAR_CONFIG?.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwPma1X-J0EgAPsYkXYhNT2I8LCSdANRa6CfcQLtFTVp8Xy5AZY5tAKm1apsE-0i9yW/exec';
        const callbackName = `VALIDAR_JSONP_CB_${Date.now()}`;
        const url = `${baseUrl}?action=getGuestDetails&id=${encodeURIComponent(guestId)}&callback=${callbackName}`;

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            let timeoutId;

            window[callbackName] = function(response) {
                clearTimeout(timeoutId);
                try {
                    resolve(response);
                } finally {
                    cleanup();
                }
            };

            function cleanup() {
                if (script.parentNode) script.parentNode.removeChild(script);
                try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
            }

            script.onerror = function() {
                clearTimeout(timeoutId);
                cleanup();
                reject(new Error('JSONP request failed'));
            };

            timeoutId = setTimeout(() => {
                cleanup();
                reject(new Error('JSONP timeout'));
            }, 10000);

            script.src = url;
            document.body.appendChild(script);
        });
    }
    
    function handleValidationResult(result) {
        console.log('✅ Resultado de validación:', result);
        
        // Adaptar respuesta de Apps Script (JSONP) o de API directa
        if (result && (result.success || result.status === 'success')) {
            const invitado = result.guest || result.invitado || {};
            renderGuest(invitado);
        } else if (result && (result.status === 'not_found')) {
            showErrorState('Invitado no encontrado');
        } else if (result && result.message) {
            showErrorState(result.message);
        } else {
            showErrorState('Error de validación');
        }
        
        resetValidationState();
    }

    function adaptGuestData(invitado) {
        // Normalizar estructura a la que espera la UI
        return {
            id: invitado.id || invitado.ID || '',
            names: invitado.nombre || invitado.name || '',
            email: invitado.email || '',
            phone: invitado.telefono || invitado.phone || '',
            status: invitado.estado || (invitado.confirmado ? 'Confirmado' : 'Pendiente') || 'Desconocido',
            passes: invitado.pases || 0,
            kids: invitado.ninos || 0,
            table: invitado.mesa || ''
        };
    }
    
    function handleValidationError(error) {
        console.error('❌ Error de validación:', error);
        
        let message = 'Error al validar invitado';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            message = 'Error de conexión. Verifica tu internet.';
        } else if (error.message) {
            message = error.message;
        }
        
        showErrorState(message);
        resetValidationState();
    }
    
    function showGuestDetails(guestData) {
        if (!elements.guestDetails) return;

        // Llenar spans existentes en validar.html
        const nameEl = document.getElementById('val-guest-name');
        const idEl = document.getElementById('val-guest-id');
        const statusEl = document.getElementById('val-status');
        const passesEl = document.getElementById('val-passes');
        const kidsEl = document.getElementById('val-kids');
        const mesaRow = document.getElementById('mesa-row');
        const mesaEl = document.getElementById('val-mesa');

        if (nameEl) nameEl.textContent = guestData.names || guestData.nombre || '---';
        if (idEl) idEl.textContent = guestData.id || '---';
        if (statusEl) {
            const statusText = guestData.status || guestData.estado || 'Desconocido';
            statusEl.textContent = statusText;
            statusEl.classList.remove('status-confirmed', 'status-pending');
            if (/confirmado/i.test(statusText)) statusEl.classList.add('status-confirmed');
            else if (/pendiente/i.test(statusText)) statusEl.classList.add('status-pending');
        }
        if (passesEl) passesEl.textContent = String(guestData.passes ?? guestData.pases ?? '0');
        if (kidsEl) kidsEl.textContent = String(guestData.kids ?? guestData.ninos ?? '0');
        const mesaValue = guestData.table ?? guestData.mesa ?? '';
        if (mesaRow) mesaRow.style.display = mesaValue ? 'block' : 'none';
        if (mesaEl) mesaEl.textContent = mesaValue || '---';

        // Ocultar formulario de validación mientras se muestran datos
        if (elements.form) {
            elements.form.style.display = 'none';
        }

        elements.guestDetails.style.display = 'block';

        if (elements.statusMessage) {
            elements.statusMessage.style.display = 'none';
        }

        addNewValidationButton();
    }
    
    function showConfirmationDetails(invitado) {
        if (!elements.confirmationDetails) return;

        const passesUsedEl = document.getElementById('val-passes-used');
        const kidsUsedEl = document.getElementById('val-kids-used');
        const adultNamesEl = document.getElementById('val-adult-names');
        const kidsNamesRow = document.getElementById('kids-names-row');
        const kidsNamesEl = document.getElementById('val-kids-names');
        const phoneEl = document.getElementById('val-phone');
        const emailRow = document.getElementById('email-row');
        const emailEl = document.getElementById('val-email');
        const dateEl = document.getElementById('val-confirmation-date');

        const formatDate = (window.formatDate || ((d)=>d));
        const formatPhone = (window.formatPhone || ((p)=>p));
        const formatEmail = (window.formatEmail || ((e)=>e));

        if (passesUsedEl) passesUsedEl.textContent = String(invitado.pasesUtilizados ?? 0);
        if (kidsUsedEl) kidsUsedEl.textContent = String(invitado.ninosUtilizados ?? 0);
        if (adultNamesEl) adultNamesEl.textContent = invitado.nombresInvitados || invitado.nombre || '---';
        const kidsNames = invitado.nombresNinos || '';
        if (kidsNamesRow) kidsNamesRow.style.display = kidsNames ? 'block' : 'none';
        if (kidsNamesEl) kidsNamesEl.textContent = kidsNames || '---';
        if (phoneEl) phoneEl.textContent = formatPhone(invitado.telefono || '');
        const email = invitado.email || '';
        if (emailRow) emailRow.style.display = email ? 'block' : 'none';
        if (emailEl) emailEl.textContent = formatEmail(email) || '---';
        if (dateEl) dateEl.textContent = formatDate(invitado.fechaConfirmacion || '');

        elements.confirmationDetails.style.display = 'block';
    }

    function renderGuest(invitado) {
        const guest = adaptGuestData(invitado);
        showGuestDetails(guest);
        if (invitado && (invitado.confirmado || invitado.fechaConfirmacion || invitado.pasesUtilizados != null)) {
            showConfirmationDetails(invitado);
        } else {
            if (elements.confirmationDetails) elements.confirmationDetails.style.display = 'none';
        }
    }
    
    function showErrorState(message) {
        if (elements.statusMessage) {
            elements.statusMessage.textContent = message;
            elements.statusMessage.className = 'status-message error-message';
        }
        
        if (elements.guestDetails) {
            elements.guestDetails.style.display = 'none';
        }
        
        if (elements.confirmationDetails) {
            elements.confirmationDetails.style.display = 'none';
        }

        // Asegurar que el botón de nueva validación no aparezca en el formulario
        const existingBtn = document.querySelector('.new-validation-btn');
        if (existingBtn && existingBtn.parentNode) {
            existingBtn.parentNode.removeChild(existingBtn);
        }
    }
    
    function resetToInitialState() {
        if (elements.statusMessage) {
            elements.statusMessage.textContent = 'Ingresa el ID del invitado o escanea el código QR';
            elements.statusMessage.className = 'status-message';
            elements.statusMessage.style.display = 'block';
        }
        
        if (elements.guestDetails) {
            elements.guestDetails.style.display = 'none';
        }
        
        if (elements.confirmationDetails) {
            elements.confirmationDetails.style.display = 'none';
        }
        
        if (elements.guestIdInput) {
            elements.guestIdInput.value = '';
            elements.guestIdInput.classList.remove('valid', 'invalid');
        }

        // Quitar el botón de "Validar Otro Invitado" si existe
        const existingBtn = document.querySelector('.new-validation-btn');
        if (existingBtn && existingBtn.parentNode) {
            existingBtn.parentNode.removeChild(existingBtn);
        }
    }
    
    function resetValidationState() {
        if (elements.validateBtn) {
            elements.validateBtn.disabled = false;
            elements.validateBtn.textContent = 'Validar Invitado';
        }
    }
    
    function addNewValidationButton() {
        const existingBtn = document.querySelector('.new-validation-btn');
        if (existingBtn) {
            existingBtn.remove();
        }

        const newBtn = document.createElement('button');
        newBtn.type = 'button';
        newBtn.className = 'new-validation-btn';
        newBtn.textContent = 'Validar Otro Invitado';
        newBtn.style.cssText = `
            margin-top: 24px;
            padding: 12px 24px;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
        `;
        // Color verde oscuro (forzar sobre CSS con !important)
        const darkGreen = '#1B5E20';
        const darkGreenHover = '#2E7D32';
        newBtn.style.setProperty('background', darkGreen, 'important');

        newBtn.addEventListener('mouseenter', () => {
            newBtn.style.setProperty('background', darkGreenHover, 'important');
        });
        newBtn.addEventListener('mouseleave', () => {
            newBtn.style.setProperty('background', darkGreen, 'important');
        });

        newBtn.addEventListener('click', () => {
            resetToInitialState();
            if (elements.form) {
                elements.form.style.display = 'block';
            }
        });

        // Insertarlo al final, después de confirmationDetails si existe, si no después de guestDetails
        const container = document.querySelector('.validation-container');
        if (elements.confirmationDetails) {
            elements.confirmationDetails.insertAdjacentElement('afterend', newBtn);
        } else if (elements.guestDetails) {
            elements.guestDetails.insertAdjacentElement('afterend', newBtn);
        } else if (container) {
            container.appendChild(newBtn);
        } else {
            document.body.appendChild(newBtn);
        }
    }
    
    // Función global para testing
    window.testValidarJS = function() {
        console.log('🧪 Testing validar.js...');
        console.log('Elementos:', elements);
        console.log('Cámara:', { cameraStream, qrScanner, currentCamera });
        return 'validar.js funcionando correctamente';
    };
    
})();
