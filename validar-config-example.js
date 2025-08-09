// validar-config-example.js - ARCHIVO DE EJEMPLO
// COPIA ESTE ARCHIVO A validar-config.js Y CONFIGURA SEGÚN TUS NECESIDADES

window.VALIDAR_CONFIG = {
    // 🔗 URL del Google Apps Script - ¡¡OBLIGATORIO!!
    // Reemplaza con la URL real de tu Google Apps Script
    GOOGLE_APPS_SCRIPT_URL: 'https://script.google.com/macros/s/TU_ID_UNICO_AQUI/exec',
    
    // 📱 Configuración de la aplicación
    APP_NAME: 'Sistema de Validación - Boda A&G',
    VERSION: '1.0.0',
    
    // 🗄️ Configuración de la base de datos
    // Asegúrate de que tu Google Apps Script tenga acceso a estas hojas
    DATABASE: {
        GUESTS_TABLE: 'Invitados',        // Nombre de la hoja de invitados
        CONFIRMATIONS_TABLE: 'Confirmaciones'  // Nombre de la hoja de confirmaciones
    },
    
    // ⚡ Configuración de validación
    VALIDATION: {
        MAX_RETRIES: 3,        // Máximo de reintentos en caso de error
        TIMEOUT: 10000,        // Timeout en milisegundos (10 segundos)
        DEBOUNCE_DELAY: 500    // Delay para evitar spam (500ms)
    },
    
    // 🎨 Configuración de UI
    UI: {
        ANIMATION_DURATION: 300,    // Duración de animaciones en ms
        SUCCESS_DELAY: 2000,       // Tiempo que se muestra mensaje de éxito
        ERROR_DELAY: 4000          // Tiempo que se muestra mensaje de error
    },
    
    // 💬 Mensajes del sistema - Personaliza según tu idioma/preferencias
    MESSAGES: {
        LOADING: 'Verificando invitado...',
        SUCCESS: '¡Invitado validado exitosamente!',
        ERROR: 'Error al validar invitado. Intenta nuevamente.',
        NOT_FOUND: 'Invitado no encontrado. Verifica el ID ingresado.',
        NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
        INVALID_ID: 'ID de invitado inválido. Debe tener 6 caracteres.',
        VALIDATING: 'Validando...',
        RETRY: 'Reintentando...'
    },
    
    // 📊 Estados de validación - Ajusta según tu sistema
    STATUSES: {
        CONFIRMED: 'Confirmado',    // Estado cuando el invitado confirma
        PENDING: 'Pendiente',       // Estado cuando está pendiente
        CANCELLED: 'Cancelado',     // Estado cuando cancela
        UNKNOWN: 'Desconocido'      // Estado por defecto
    },
    
    // 🎨 Colores de estado - Personaliza según tu tema
    COLORS: {
        SUCCESS: '#4CAF50',    // Verde para confirmado
        WARNING: '#ffc107',    // Amarillo para pendiente
        ERROR: '#f44336',      // Rojo para cancelado
        INFO: '#2196F3'        // Azul para información
    }
};

// ============================================================================
// 📋 INSTRUCCIONES DE CONFIGURACIÓN
// ============================================================================

/*
PASO 1: CONFIGURAR GOOGLE APPS SCRIPT
=====================================

1. Ve a https://script.google.com/
2. Crea un nuevo proyecto
3. Copia el código de tu Google Apps Script
4. Publica como aplicación web
5. Copia la URL de publicación
6. Pégala en GOOGLE_APPS_SCRIPT_URL arriba

PASO 2: VERIFICAR ESTRUCTURA DE BASE DE DATOS
==============================================

Tu Google Apps Script debe tener acceso a dos hojas:

HOJA 1: "Invitados"
- Columna A: ID del invitado (6 caracteres)
- Columna B: Nombre completo
- Columna C: Pases asignados
- Columna D: Niños asignados
- Columna E: Mesa (opcional)

HOJA 2: "Confirmaciones"  
- Columna A: ID del invitado
- Columna B: Estado (Confirmado/Pendiente/Cancelado)
- Columna C: Pases utilizados
- Columna D: Niños utilizados
- Columna E: Nombres adultos
- Columna F: Nombres niños
- Columna G: Teléfono
- Columna H: Email
- Columna I: Fecha de confirmación

PASO 3: PERSONALIZAR MENSAJES
==============================

Modifica los mensajes en la sección MESSAGES según tu idioma y preferencias.

PASO 4: PERSONALIZAR COLORES
=============================

Cambia los colores en la sección COLORS para que coincidan con tu tema de boda.

PASO 5: AJUSTAR CONFIGURACIÓN TÉCNICA
=====================================

- MAX_RETRIES: Número de reintentos en caso de error
- TIMEOUT: Tiempo máximo de espera para respuesta
- DEBOUNCE_DELAY: Tiempo entre validaciones para evitar spam

PASO 6: PROBAR EL SISTEMA
==========================

1. Guarda este archivo como validar-config.js
2. Abre test-validar-simple.html en tu navegador
3. Ejecuta todos los tests
4. Verifica que no haya errores
5. Abre validar.html y prueba con un ID válido

PASO 7: VERIFICAR EN MÓVIL
===========================

1. Abre validar.html en tu dispositivo móvil
2. Verifica que la interfaz se vea correctamente
3. Prueba la funcionalidad táctil
4. Verifica que las notificaciones funcionen

PASO 8: MONITOREAR LOGS
========================

1. Abre la consola del navegador (F12)
2. Ejecuta una validación
3. Verifica que no haya errores
4. Revisa los logs de información

*/

// ============================================================================
// 🔍 VERIFICACIÓN AUTOMÁTICA DE CONFIGURACIÓN
// ============================================================================

// Función para verificar que la configuración esté completa
window.verifyConfig = function() {
    const config = window.VALIDAR_CONFIG;
    const errors = [];
    const warnings = [];
    
    // Verificar URL del Apps Script
    if (!config.GOOGLE_APPS_SCRIPT_URL || 
        config.GOOGLE_APPS_SCRIPT_URL.includes('TU_ID_UNICO_AQUI')) {
        errors.push('❌ URL del Google Apps Script no configurada');
    }
    
    // Verificar que la URL sea válida
    if (config.GOOGLE_APPS_SCRIPT_URL && 
        !config.GOOGLE_APPS_SCRIPT_URL.includes('script.google.com')) {
        warnings.push('⚠️ La URL del Apps Script no parece ser válida');
    }
    
    // Verificar configuración de base de datos
    if (!config.DATABASE.GUESTS_TABLE || !config.DATABASE.CONFIRMATIONS_TABLE) {
        errors.push('❌ Tablas de base de datos no configuradas');
    }
    
    // Verificar mensajes
    if (!config.MESSAGES.LOADING || !config.MESSAGES.SUCCESS || !config.MESSAGES.ERROR) {
        warnings.push('⚠️ Algunos mensajes del sistema no están configurados');
    }
    
    // Mostrar resultados
    if (errors.length > 0) {
        console.error('🚨 ERRORES DE CONFIGURACIÓN:');
        errors.forEach(error => console.error(error));
    }
    
    if (warnings.length > 0) {
        console.warn('⚠️ ADVERTENCIAS DE CONFIGURACIÓN:');
        warnings.forEach(warning => console.warn(warning));
    }
    
    if (errors.length === 0 && warnings.length === 0) {
        console.log('✅ Configuración verificada correctamente');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
};

// Ejecutar verificación cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Verificando configuración...');
    const configStatus = window.verifyConfig();
    
    if (!configStatus.isValid) {
        console.error('❌ El sistema no puede funcionar con la configuración actual');
        console.error('📋 Revisa las instrucciones de configuración arriba');
    } else {
        console.log('🎉 Sistema listo para usar');
    }
});

// ============================================================================
// 📱 CONFIGURACIÓN ESPECÍFICA PARA MÓVIL
// ============================================================================

// Configuración adicional para dispositivos móviles
window.MOBILE_CONFIG = {
    // Reducir animaciones en móvil para mejor rendimiento
    REDUCE_ANIMATIONS: true,
    
    // Tamaño mínimo de elementos táctiles
    MIN_TOUCH_TARGET: 48,
    
    // Prevenir zoom accidental
    PREVENT_ZOOM: true,
    
    // Optimizar scroll táctil
    OPTIMIZE_TOUCH_SCROLL: true
};

// ============================================================================
// 🧪 CONFIGURACIÓN DE TESTING
// ============================================================================

// Configuración para modo de pruebas
window.TEST_CONFIG = {
    // Habilitar modo de pruebas
    ENABLED: false,
    
    // Simular respuestas del servidor
    MOCK_RESPONSES: {
        'abc123': {
            success: true,
            guest: {
                id: 'abc123',
                name: 'Juan Pérez',
                status: 'Confirmado',
                passes: 2,
                kids: 1
            }
        }
    },
    
    // Simular latencia de red
    MOCK_LATENCY: 1000
};

// ============================================================================
// 📊 CONFIGURACIÓN DE LOGGING
// ============================================================================

// Configuración del sistema de logging
window.LOG_CONFIG = {
    // Nivel de logging (debug, info, warn, error)
    LEVEL: 'info',
    
    // Habilitar logging en consola
    CONSOLE: true,
    
    // Habilitar logging en localStorage
    STORAGE: false,
    
    // Habilitar logging remoto (para debugging)
    REMOTE: false,
    
    // URL para logging remoto
    REMOTE_URL: ''
};

// ============================================================================
// 🔒 CONFIGURACIÓN DE SEGURIDAD
// ============================================================================

// Configuración de seguridad
window.SECURITY_CONFIG = {
    // Validar formato de ID de invitado
    VALIDATE_ID_FORMAT: true,
    
    // Prevenir múltiples validaciones simultáneas
    PREVENT_DUPLICATE_REQUESTS: true,
    
    // Rate limiting (máximo de intentos por minuto)
    RATE_LIMIT: 10,
    
    // Timeout para sesiones
    SESSION_TIMEOUT: 300000 // 5 minutos
};

// ============================================================================
// 📝 NOTAS IMPORTANTES
// ============================================================================

/*
⚠️ IMPORTANTE:
- NO subas este archivo a producción sin configurarlo
- Cambia TODOS los valores de ejemplo por valores reales
- Verifica que tu Google Apps Script funcione correctamente
- Prueba en diferentes dispositivos antes de usar en producción
- Mantén una copia de respaldo de la configuración

🔧 SOPORTE:
- Si tienes problemas, revisa la consola del navegador
- Usa el archivo de pruebas para diagnosticar problemas
- Verifica que todos los archivos se carguen correctamente
- Comprueba que la URL del Apps Script sea accesible

📱 OPTIMIZACIÓN:
- El sistema se optimiza automáticamente para móvil
- Las animaciones se reducen en dispositivos de bajo rendimiento
- El scroll táctil se optimiza automáticamente
- Se previene el zoom accidental en inputs

🎯 PRÓXIMOS PASOS:
1. Configura la URL del Google Apps Script
2. Verifica la estructura de tu base de datos
3. Personaliza mensajes y colores
4. Ejecuta las pruebas
5. Prueba en dispositivos móviles
6. ¡Listo para usar!
*/
