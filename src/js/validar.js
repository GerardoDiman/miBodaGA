// validar.js - Sistema de validación con escaneo QR y cámara
(function() {
    'use strict';
    
    // Estado global de la aplicación
    const appState = {
        isProcessing: false,
        currentGuestId: null,
        lastValidation: null
    };
    
    // Referencias a elementos DOM
    let elements = {};
    
    // Variables de cámara
    let cameraStream = null;
    let qrScanner = null;
    let currentCamera = 'environment'; // environment o user
    
    // URL del Apps Script (¡¡REEMPLAZAR CON TU URL REAL!!)
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPma1X-J0EgAPsYkXYhNT2I8LCSdANRa6CfcQLtFTVp8Xy5AZY5tAKm1apsE-0i9yW/exec';
    
    // Inicialización cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', initializeApp);
    
    function initializeApp() {
        console.log('🚀 Inicializando sistema de validación con cámara...');
        
        // Inicializar elementos DOM
        initializeElements();
        
        // Configurar eventos
        setupEventListeners();
        
        // Verificar disponibilidad de cámara (sin iniciarla automáticamente)
        checkCameraAvailability();
        
        // Optimizar para móviles
        VALIDAR_CONFIG.optimizeForMobile();
        
        console.log('✅ Sistema inicializado correctamente');
    }
    
    function checkCameraAvailability() {
        if (!VALIDAR_CONFIG.camera.isAvailable()) {
            console.log('📱 Cámara no disponible en este dispositivo');
            if (elements.scanQRBtn) {
                elements.scanQRBtn.style.display = 'none';
            }
            return;
        }
        
        console.log('📱 Cámara disponible - botón de escaneo activado');
        // La cámara se inicializará solo cuando el usuario haga clic en "Escanear QR"
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
            statusMessage: document.getElementById('status-message'),
            guestDetails: document.getElementById('guest-details'),
            confirmationDetails: document.getElementById('confirmation-details')
        };
    }
    
    function setupEventListeners() {
        // Formulario de validación
        if (elements.form) {
            elements.form.addEventListener('submit', handleValidationSubmit);
        }
        
        // Botón de escaneo QR
        if (elements.scanQRBtn) {
            elements.scanQRBtn.addEventListener('click', openCameraInterface);
        }
        
        // Controles de cámara
        if (elements.closeCameraBtn) {
            elements.closeCameraBtn.addEventListener('click', closeCameraInterface);
        }
        
        if (elements.switchCameraBtn) {
            elements.switchCameraBtn.addEventListener('click', switchCamera);
        }
        
        if (elements.toggleFlashBtn) {
            elements.toggleFlashBtn.addEventListener('click', toggleFlash);
        }
        
        // Validación en tiempo real del input
        if (elements.guestIdInput) {
            elements.guestIdInput.addEventListener('input', handleGuestIdInput);
        }
    }
    
    // Funciones de cámara y QR
    function initializeCamera() {
        if (!VALIDAR_CONFIG.camera.isAvailable()) {
            console.log('📱 Cámara no disponible en este dispositivo');
            if (elements.scanQRBtn) {
                elements.scanQRBtn.style.display = 'none';
            }
            return;
        }
        
        console.log('📷 Cámara disponible, inicializando...');
    }
    
    function openCameraInterface() {
        if (!VALIDAR_CONFIG.camera.isAvailable()) {
            VALIDAR_CONFIG.showNotification('Cámara no disponible en este dispositivo', 'error');
            return;
        }
        
        elements.cameraInterface.style.display = 'flex';
        startCamera();
    }
    
    function closeCameraInterface() {
        stopCamera();
        elements.cameraInterface.style.display = 'none';
    }
    
    async function startCamera() {
        try {
            console.log('📹 Iniciando cámara...');
            
            // Usar la configuración optimizada
            cameraStream = await VALIDAR_CONFIG.camera.startCamera(
                elements.cameraPreview.querySelector('video') || createVideoElement(),
                (stream) => {
                    console.log('✅ Cámara iniciada correctamente');
                    // Iniciar escaneo de QR en tiempo real
                    startQRScanning();
                },
                (error) => {
                    console.error('❌ Error al iniciar cámara:', error);
                    showCameraError(error);
                }
            );
            
        } catch (error) {
            console.error('❌ Error crítico al iniciar cámara:', error);
            showCameraError(error);
        }
    }
    
    function createVideoElement() {
        // Limpiar preview anterior
        elements.cameraPreview.innerHTML = '';
        
        const video = document.createElement('video');
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        
        elements.cameraPreview.appendChild(video);
        return video;
    }
    
    function startQRScanning() {
        if (!qrScanner) {
            // Agregar indicador visual de escaneo
            addScanningIndicator();
            
            qrScanner = setInterval(() => {
                const video = elements.cameraPreview.querySelector('video');
                if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
                    scanFrame(video);
                }
            }, VALIDAR_CONFIG.QR.SCAN_INTERVAL);
        }
    }
    
    function addScanningIndicator() {
        // Remover indicador anterior si existe
        const existingIndicator = elements.cameraPreview.querySelector('.scanning-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        const indicator = document.createElement('div');
        indicator.className = 'scanning-indicator';
        elements.cameraPreview.appendChild(indicator);
        
        // Mostrar mensaje de estado
        if (elements.statusMessage) {
            elements.statusMessage.textContent = 'Escaneando código QR... Coloca el código frente a la cámara';
            elements.statusMessage.className = 'status-message loading-message';
        }
    }
    
    function scanFrame(video) {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            
            // Usar jsQR para detectar códigos
            if (typeof jsQR !== 'undefined') {
                const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: "dontInvert",
                });
                
                if (code) {
                    console.log('🔍 QR detectado:', code.data);
                    handleQRResult(code.data);
                    stopQRScanning();
                }
            }
            
        } catch (error) {
            console.error('❌ Error en escaneo de frame:', error);
        }
    }
    
    function stopQRScanning() {
        if (qrScanner) {
            clearInterval(qrScanner);
            qrScanner = null;
        }
    }
    
    function stopCamera() {
        if (qrScanner) {
            clearInterval(qrScanner); // Limpiar el intervalo de escaneo
            qrScanner = null;
        }
        
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
            cameraStream = null;
        }
        
        console.log('📷 Cámara detenida');
    }
    
    function switchCamera() {
        currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
        VALIDAR_CONFIG.CAMERA.FACING_MODE = currentCamera;
        
        // Reiniciar cámara con nueva configuración
        stopCamera();
        startCamera();
    }
    
    function toggleFlash() {
        if (cameraStream) {
            const videoTrack = cameraStream.getVideoTracks()[0];
            if (videoTrack.getCapabilities && videoTrack.getCapabilities().torch) {
                const currentTorch = videoTrack.getSettings().torch;
                videoTrack.applyConstraints({
                    advanced: [{ torch: !currentTorch }]
                });
            }
        }
    }
    
    function handleQRResult(qrData) {
        console.log('🎯 Código QR detectado:', qrData);
        
        // Validar formato del código QR
        if (VALIDAR_CONFIG.validation.isValidGuestId(qrData)) {
            // Llenar el input con el código detectado
            if (elements.guestIdInput) {
                elements.guestIdInput.value = qrData;
                elements.guestIdInput.focus();
            }
            
            // Mostrar mensaje de éxito
            if (elements.statusMessage) {
                elements.statusMessage.textContent = `✅ QR detectado: ${qrData}. Presiona "Validar Invitado" para continuar.`;
                elements.statusMessage.className = 'status-message success-message';
            }
            
            // Cerrar interfaz de cámara
            closeCameraInterface();
            
            // Limpiar estado de escaneo
            stopQRScanning();
            
        } else {
            // Código QR inválido
            if (elements.statusMessage) {
                elements.statusMessage.textContent = `❌ Código QR inválido: ${qrData}. Debe tener 6 caracteres alfanuméricos.`;
                elements.statusMessage.className = 'status-message error-message';
            }
            
            // Continuar escaneando para otro código
            console.log('🔄 Continuando escaneo...');
        }
    }
    
    function showCameraError(error) {
        console.error('📷 Error de cámara:', error);
        
        let errorMessage = 'Error al acceder a la cámara';
        if (error.name === 'NotAllowedError') {
            errorMessage = 'Permiso de cámara denegado. Por favor, permite el acceso a la cámara.';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No se encontró ninguna cámara en este dispositivo.';
        } else if (error.name === 'NotReadableError') {
            errorMessage = 'La cámara está siendo usada por otra aplicación.';
        } else if (error.name === 'OverconstrainedError') {
            errorMessage = 'La cámara no soporta la resolución solicitada.';
        }
        
        elements.cameraPreview.innerHTML = `
            <div class="camera-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${errorMessage}</p>
                <button type="button" onclick="location.reload()" class="retry-btn">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
        
        // Mostrar mensaje en el estado principal
        if (elements.statusMessage) {
            elements.statusMessage.textContent = 'Error de cámara. Puedes ingresar el ID manualmente.';
            elements.statusMessage.className = 'status-message error-message';
        }
    }
    
    // Funciones de validación
    function handleGuestIdInput(event) {
        const input = event.target;
        const value = input.value.toUpperCase();
        
        // Solo permitir caracteres alfanuméricos
        input.value = value.replace(/[^A-Z0-9]/g, '');
        
        // Validar longitud
        if (value.length === 6) {
            input.classList.add('valid');
            input.classList.remove('invalid');
        } else {
            input.classList.remove('valid');
            if (value.length > 0) {
                input.classList.add('invalid');
            } else {
                input.classList.remove('invalid');
            }
        }
    }
    
    function handleValidationSubmit(event) {
        event.preventDefault();
        
        const guestId = elements.guestIdInput.value.trim();
        
        if (!guestId) {
            VALIDAR_CONFIG.showNotification('Por favor ingresa un ID de invitado', 'warning');
            elements.guestIdInput.focus();
            return;
        }
        
        if (!VALIDAR_CONFIG.isValidGuestId(guestId)) {
            VALIDAR_CONFIG.showNotification('ID inválido. Debe tener 6 caracteres alfanuméricos', 'error');
            elements.guestIdInput.focus();
            return;
        }
        
        validateGuest(guestId);
    }
    
    async function validateGuest(guestId) {
        if (appState.isProcessing) {
            console.log('⏳ Validación en progreso...');
            return;
        }
        
        appState.isProcessing = true;
        appState.currentGuestId = guestId;
        
        try {
            // Mostrar estado de carga
            showLoadingState();
            
            // Realizar validación
            const result = await performValidation(guestId);
            
            // Procesar resultado
            handleValidationResult(result);
            
        } catch (error) {
            console.error('❌ Error en validación:', error);
            handleValidationError(error);
        } finally {
            appState.isProcessing = false;
        }
    }
    
    function showLoadingState() {
        if (elements.statusMessage) {
            elements.statusMessage.textContent = 'Verificando invitado...';
            elements.statusMessage.className = 'status-message loading-message';
        }
        
        if (elements.validateBtn) {
            elements.validateBtn.disabled = true;
            elements.validateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando...';
        }
    }
    
    async function performValidation(guestId) {
        const url = `${GOOGLE_APPS_SCRIPT_URL}?action=validate&guestId=${encodeURIComponent(guestId)}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }
    
    function handleValidationResult(result) {
        console.log('✅ Resultado de validación:', result);
        
        if (result.success) {
            showGuestDetails(result.data);
            VALIDAR_CONFIG.showNotification('Invitado validado correctamente', 'success');
        } else {
            showErrorState(result.message || 'Error en la validación');
        }
    }
    
    function handleValidationError(error) {
        console.error('❌ Error de validación:', error);
        
        let errorMessage = 'Error de conexión. Verifica tu internet.';
        
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = 'No se pudo conectar con el servidor. Verifica la URL del Apps Script.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showErrorState(errorMessage);
        VALIDAR_CONFIG.showNotification(errorMessage, 'error');
    }
    
    function showGuestDetails(guestData) {
        // Ocultar mensaje de estado
        if (elements.statusMessage) {
            elements.statusMessage.style.display = 'none';
        }
        
        // Mostrar detalles del invitado
        if (elements.guestDetails) {
            elements.guestDetails.style.display = 'block';
            elements.guestDetails.innerHTML = `
                <h3>✅ Invitado Validado</h3>
                <p><strong>ID:</strong> ${guestData.id || 'N/A'}</p>
                <p><strong>Nombre:</strong> ${guestData.nombre || 'N/A'}</p>
                <p><strong>Estado:</strong> ${guestData.estado || 'N/A'}</p>
                <p><strong>Pases:</strong> ${guestData.pases || 'N/A'}</p>
                <p><strong>Mesa:</strong> ${guestData.mesa || 'N/A'}</p>
            `;
        }
        
        // Mostrar detalles de confirmación si existen
        if (guestData.confirmacion && elements.confirmationDetails) {
            elements.confirmationDetails.style.display = 'block';
            elements.confirmationDetails.innerHTML = `
                <h3>📋 Confirmación</h3>
                <p><strong>Fecha:</strong> ${guestData.confirmacion.fecha || 'N/A'}</p>
                <p><strong>Asistentes:</strong> ${guestData.confirmacion.asistentes || 'N/A'}</p>
            `;
        }
        
        // Resetear formulario
        if (elements.guestIdInput) {
            elements.guestIdInput.value = '';
            elements.guestIdInput.classList.remove('valid', 'invalid');
        }
        
        // Resetear botón
        if (elements.validateBtn) {
            elements.validateBtn.disabled = false;
            elements.validateBtn.innerHTML = '<i class="fas fa-search"></i> Validar Invitado';
        }
    }
    
    function showErrorState(message) {
        if (elements.statusMessage) {
            elements.statusMessage.textContent = message;
            elements.statusMessage.className = 'status-message error-message';
            elements.statusMessage.style.display = 'block';
        }
        
        // Ocultar detalles del invitado
        if (elements.guestDetails) {
            elements.guestDetails.style.display = 'none';
        }
        
        if (elements.confirmationDetails) {
            elements.confirmationDetails.style.display = 'none';
        }
        
        // Resetear botón
        if (elements.validateBtn) {
            elements.validateBtn.disabled = false;
            elements.validateBtn.innerHTML = '<i class="fas fa-search"></i> Validar Invitado';
        }
    }
    
    // Función para limpiar estado y volver al inicio
    function resetToInitialState() {
        // Limpiar estado
        appState.isProcessing = false;
        appState.currentGuestId = null;
        
        // Ocultar detalles
        if (elements.guestDetails) {
            elements.guestDetails.style.display = 'none';
        }
        
        if (elements.confirmationDetails) {
            elements.confirmationDetails.style.display = 'none';
        }
        
        // Mostrar mensaje inicial
        if (elements.statusMessage) {
            elements.statusMessage.textContent = 'Ingresa el ID del invitado para validar';
            elements.statusMessage.className = 'status-message';
            elements.statusMessage.style.display = 'block';
        }
        
        // Resetear formulario
        if (elements.guestIdInput) {
            elements.guestIdInput.value = '';
            elements.guestIdInput.classList.remove('valid', 'invalid');
            elements.guestIdInput.focus();
        }
        
        // Resetear botón
        if (elements.validateBtn) {
            elements.validateBtn.disabled = false;
            elements.validateBtn.innerHTML = '<i class="fas fa-search"></i> Validar Invitado';
        }
        
        console.log('🔄 Estado reseteado al inicial');
    }
    
    // Agregar botón de nueva validación
    function addNewValidationButton() {
        const newValidationBtn = document.createElement('button');
        newValidationBtn.type = 'button';
        newValidationBtn.className = 'validate-btn new-validation-btn';
        newValidationBtn.innerHTML = '<i class="fas fa-plus"></i> Nueva Validación';
        newValidationBtn.addEventListener('click', resetToInitialState);
        
        // Insertar después del botón de validar
        if (elements.validateBtn && elements.validateBtn.parentNode) {
            elements.validateBtn.parentNode.insertBefore(newValidationBtn, elements.validateBtn.nextSibling);
        }
    }
    
    // Limpiar recursos al cerrar la página
    window.addEventListener('beforeunload', () => {
        stopCamera();
    });
    
})();
