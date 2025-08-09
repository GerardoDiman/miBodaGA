// test-validar-debug.js
// Archivo de prueba para debuggear el comportamiento cíclico en validar.html

console.log('🧪 Test de debug para validar.html iniciado');

(function() {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🧪 DOM cargado, configurando debug...');

        // Función para monitorear llamadas a funciones críticas
        function setupFunctionMonitoring() {
            console.log('🔍 Configurando monitoreo de funciones...');

            // Monitorear performValidation
            if (window.performValidation) {
                const originalPerformValidation = window.performValidation;
                window.performValidation = function(guestId) {
                    console.log('🔍 performValidation llamada con:', guestId);
                    console.trace('Stack trace de performValidation');
                    return originalPerformValidation.call(this, guestId);
                };
                console.log('✅ Monitoreo de performValidation configurado');
            }

            // Monitorear recoverGuestState
            if (window.recoverGuestState) {
                const originalRecoverGuestState = window.recoverGuestState;
                window.recoverGuestState = function(guestId) {
                    console.log('🔍 recoverGuestState llamada con:', guestId);
                    console.trace('Stack trace de recoverGuestState');
                    return originalRecoverGuestState.call(this, guestId);
                };
                console.log('✅ Monitoreo de recoverGuestState configurado');
            }

            // Monitorear updateUIBasedOnConfirmation
            if (window.updateUIBasedOnConfirmation) {
                const originalUpdateUIBasedOnConfirmation = window.updateUIBasedOnConfirmation;
                window.updateUIBasedOnConfirmation = function(confirmed, guestId) {
                    console.log('🔍 updateUIBasedOnConfirmation llamada con:', { confirmed, guestId });
                    console.trace('Stack trace de updateUIBasedOnConfirmation');
                    return originalUpdateUIBasedOnConfirmation.call(this, confirmed, guestId);
                };
                console.log('✅ Monitoreo de updateUIBasedOnConfirmation configurado');
            }
        }

        // Función para verificar estado de flags
        function checkFlagsStatus() {
            console.log('🔍 Verificando estado de flags...');
            
            // Verificar si las funciones están disponibles
            const functions = [
                'performValidation',
                'recoverGuestState', 
                'updateUIBasedOnConfirmation',
                'recoverChromeMobileState'
            ];
            
            functions.forEach(funcName => {
                if (window[funcName]) {
                    console.log(`✅ ${funcName} disponible`);
                } else {
                    console.warn(`⚠️ ${funcName} NO disponible`);
                }
            });
        }

        // Función para simular el comportamiento problemático
        function simulateProblematicBehavior() {
            console.log('🧪 Simulando comportamiento problemático...');
            
            // Simular múltiples llamadas simultáneas
            if (window.performValidation) {
                console.log('🔍 Simulando múltiples llamadas a performValidation...');
                
                // Primera llamada
                setTimeout(() => {
                    console.log('🔍 Llamada 1 a performValidation');
                    window.performValidation('test123');
                }, 100);
                
                // Segunda llamada (simulando conflicto)
                setTimeout(() => {
                    console.log('🔍 Llamada 2 a performValidation');
                    window.performValidation('test123');
                }, 200);
                
                // Tercera llamada (simulando conflicto)
                setTimeout(() => {
                    console.log('🔍 Llamada 3 a performValidation');
                    window.performValidation('test123');
                }, 300);
            }
        }

        // Configurar monitoreo
        setupFunctionMonitoring();
        
        // Verificar estado inicial
        checkFlagsStatus();
        
        // Ejecutar simulación después de un delay
        setTimeout(simulateProblematicBehavior, 2000);
        
        // Verificar estado después de 5 segundos
        setTimeout(() => {
            console.log('🧪 Estado después de 5 segundos:');
            checkFlagsStatus();
        }, 5000);

        // Exponer funciones de debug globalmente
        window.debugValidar = {
            checkFlags: checkFlagsStatus,
            simulateProblem: simulateProblematicBehavior,
            setupMonitoring: setupFunctionMonitoring
        };

        console.log('🧪 Test de debug configurado. Usa window.debugValidar para controlar');
    });
})();
