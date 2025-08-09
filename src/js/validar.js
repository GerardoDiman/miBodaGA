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
        
        if (elements.testQRBtn) {
            elements.testQRBtn.addEventListener('click', testQRDetection);
        }
        
        if (elements.guestIdInput) {
            elements.guestIdInput.addEventListener('input', handleGuestIdInput);
        }
        
        console.log('✅ Event listeners configurados');
    }
    
    function openCameraInterface() {
        console.log('📹 Abriendo interfaz de cámara...');
        
        try {
            if (elements.cameraInterface) {
                elements.cameraInterface.style.display = 'block';
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
                    
                    createVideoElement();
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
    
    function createVideoElement() {
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
        video.srcObject = cameraStream;
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
    
    function handleQRResult(qrData) {
        console.log('🎯 Procesando resultado QR:', qrData);
        
        try {
            if (qrData && qrData.length > 0) {
                console.log('✅ QR válido detectado');
                
                if (elements.guestIdInput) {
                    elements.guestIdInput.value = qrData;
                }
                
                closeCameraInterface();
                
                if (elements.statusMessage) {
                    elements.statusMessage.textContent = `QR detectado: ${qrData}`;
                    elements.statusMessage.className = 'status-message success-message';
                }
                
                setTimeout(() => {
                    if (elements.statusMessage) {
                        elements.statusMessage.textContent = 'Ingresa el ID del invitado o escanea el código QR';
                        elements.statusMessage.className = 'status-message';
                    }
                }, 3000);
                
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
        const url = window.VALIDAR_CONFIG?.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwPma1X-J0EgAPsYkXYhNT2I8LCSdANRa6CfcQLtFTVp8Xy5AZY5tAKm1apsE-0i9yW/exec';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'validateGuest',
                guestId: guestId
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
    
    function handleValidationResult(result) {
        console.log('✅ Resultado de validación:', result);
        
        if (result.success) {
            showGuestDetails(result.guest);
            if (result.confirmation) {
                showConfirmationDetails(result.confirmation);
            }
        } else {
            showErrorState(result.message || 'Invitado no encontrado');
        }
        
        resetValidationState();
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
        
        elements.guestDetails.innerHTML = `
            <div class="guest-info">
                <h3>✅ Invitado Validado</h3>
                <div class="guest-details-grid">
                    <div class="detail-item">
                        <strong>ID:</strong> ${guestData.id || '---'}
                    </div>
                    <div class="detail-item">
                        <strong>Nombre:</strong> ${guestData.names || '---'}
                    </div>
                    <div class="detail-item">
                        <strong>Email:</strong> ${guestData.email || '---'}
                    </div>
                    <div class="detail-item">
                        <strong>Teléfono:</strong> ${guestData.phone || '---'}
                    </div>
                    <div class="detail-item">
                        <strong>Estado:</strong> 
                        <span class="status-badge status-${guestData.status?.toLowerCase() || 'unknown'}">
                            ${guestData.status || 'Desconocido'}
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        elements.guestDetails.style.display = 'block';
        
        if (elements.statusMessage) {
            elements.statusMessage.textContent = '¡Invitado validado exitosamente!';
            elements.statusMessage.className = 'status-message success-message';
        }
        
        addNewValidationButton();
    }
    
    function showConfirmationDetails(confirmationData) {
        if (!elements.confirmationDetails) return;
        
        elements.confirmationDetails.innerHTML = `
            <div class="confirmation-info">
                <h4>📅 Confirmación</h4>
                <div class="confirmation-details-grid">
                    <div class="detail-item">
                        <strong>Fecha de confirmación:</strong> ${confirmationData.confirmationDate || '---'}
                    </div>
                    <div class="detail-item">
                        <strong>Asistentes:</strong> ${confirmationData.attendees || '---'}
                    </div>
                    <div class="detail-item">
                        <strong>Comentarios:</strong> ${confirmationData.comments || '---'}
                    </div>
                </div>
            </div>
        `;
        
        elements.confirmationDetails.style.display = 'block';
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
    }
    
    function resetToInitialState() {
        if (elements.statusMessage) {
            elements.statusMessage.textContent = 'Ingresa el ID del invitado o escanea el código QR';
            elements.statusMessage.className = 'status-message';
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
            margin-top: 20px;
            padding: 12px 24px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 500;
        `;
        
        newBtn.addEventListener('click', () => {
            resetToInitialState();
            if (elements.form) {
                elements.form.style.display = 'block';
            }
        });
        
        if (elements.guestDetails) {
            elements.guestDetails.appendChild(newBtn);
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
