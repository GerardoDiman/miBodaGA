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
        
        // Inicializar cámara si está disponible
        initializeCamera();
        
        // Optimizar para móviles
        VALIDAR_CONFIG.optimizeForMobile();
        
        console.log('✅ Sistema inicializado correctamente');
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
            // Limpiar preview anterior
            elements.cameraPreview.innerHTML = `
                <div class="camera-placeholder">
                    <i class="fas fa-camera"></i>
                    <p>Iniciando cámara...</p>
                </div>
            `;
            
            // Solicitar permisos de cámara
            cameraStream = await VALIDAR_CONFIG.camera.requestPermission();
            
            // Crear elemento de video
            const video = VALIDAR_CONFIG.camera.createVideoElement();
            video.srcObject = cameraStream;
            
            // Crear canvas para procesamiento
            const canvas = VALIDAR_CONFIG.camera.createCanvas();
            
            // Limpiar preview y agregar video
            elements.cameraPreview.innerHTML = '';
            elements.cameraPreview.appendChild(video);
            elements.cameraPreview.appendChild(canvas);
            
            // Inicializar escáner QR
            qrScanner = VALIDAR_CONFIG.qrScanner.init(video, canvas, handleQRResult);
            
            // Agregar indicador de escaneo
            const indicator = document.createElement('div');
            indicator.className = 'scanning-indicator';
            elements.cameraPreview.appendChild(indicator);
            
            // Iniciar escaneo
            qrScanner.start();
            
            console.log('📷 Cámara iniciada correctamente');
            
        } catch (error) {
            console.error('❌ Error al iniciar cámara:', error);
            elements.cameraPreview.innerHTML = `
                <div class="camera-placeholder">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al acceder a la cámara</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }
    
    function stopCamera() {
        if (qrScanner) {
            qrScanner.stop();
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
        console.log('🔍 QR detectado:', qrData);
        
        // Validar formato del QR
        if (VALIDAR_CONFIG.isValidGuestId(qrData)) {
            // Cerrar cámara
            closeCameraInterface();
            
            // Llenar input con datos del QR
            elements.guestIdInput.value = qrData;
            
            // Mostrar notificación de éxito
            VALIDAR_CONFIG.showNotification(`QR escaneado: ${qrData}`, 'success');
            
            // Validar automáticamente
            validateGuest(qrData);
        } else {
            VALIDAR_CONFIG.showNotification('QR inválido. Formato esperado: 6 caracteres alfanuméricos', 'warning');
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
