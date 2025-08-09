// test-chrome-mobile-integration.js
// Archivo de prueba para verificar la integración del Chrome Mobile Fix

console.log('🧪 Test de integración Chrome Mobile iniciado');

(function() {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🧪 DOM cargado, ejecutando pruebas...');
        
        // Función para ejecutar todas las pruebas
        function runAllTests() {
            console.log('🧪 Ejecutando todas las pruebas...');
            
            // Test 1: Verificar que RobustStorage esté disponible
            testRobustStorage();
            
            // Test 2: Verificar funciones de persistencia
            testPersistenceFunctions();
            
            // Test 3: Verificar recuperación de estado
            testStateRecovery();
            
            // Test 4: Verificar integración con validación
            testValidationIntegration();
            
            console.log('🧪 Todas las pruebas completadas');
        }
        
        // Test 1: RobustStorage
        function testRobustStorage() {
            console.log('🧪 Test 1: Verificando RobustStorage...');
            
            if (window.RobustStorage) {
                console.log('✅ RobustStorage disponible');
                
                try {
                    const storage = new window.RobustStorage();
                    console.log('✅ RobustStorage instanciado correctamente');
                    
                    // Test básico de almacenamiento
                    const testData = { test: 'data', timestamp: Date.now() };
                    const success = storage.set('test_key', testData);
                    
                    if (success) {
                        console.log('✅ Almacenamiento básico funciona');
                        
                        const retrieved = storage.get('test_key');
                        if (retrieved && retrieved.test === testData.test) {
                            console.log('✅ Recuperación básica funciona');
                        } else {
                            console.warn('⚠️ Recuperación básica falló');
                        }
                        
                        // Limpiar
                        storage.remove('test_key');
                    } else {
                        console.warn('⚠️ Almacenamiento básico falló');
                    }
                    
                } catch (e) {
                    console.error('❌ Error instanciando RobustStorage:', e);
                }
                
            } else {
                console.warn('⚠️ RobustStorage no disponible');
            }
        }
        
        // Test 2: Funciones de persistencia
        function testPersistenceFunctions() {
            console.log('🧪 Test 2: Verificando funciones de persistencia...');
            
            if (window.persistConfirmation) {
                console.log('✅ persistConfirmation disponible');
                
                // Test de persistencia
                const testGuestId = 'test123';
                const testData = {
                    guestId: testGuestId,
                    guestData: { nombre: 'Test Guest', pases: 2 },
                    confirmedAt: new Date().toISOString()
                };
                
                const success = window.persistConfirmation(testGuestId, testData);
                if (success) {
                    console.log('✅ Persistencia de confirmación funciona');
                } else {
                    console.warn('⚠️ Persistencia de confirmación falló');
                }
                
            } else {
                console.warn('⚠️ persistConfirmation no disponible');
            }
        }
        
        // Test 3: Recuperación de estado
        function testStateRecovery() {
            console.log('🧪 Test 3: Verificando recuperación de estado...');
            
            if (window.recoverChromeMobileState) {
                console.log('✅ recoverChromeMobileState disponible');
                
                // Simular recuperación
                try {
                    window.recoverChromeMobileState();
                    console.log('✅ Recuperación de estado ejecutada');
                } catch (e) {
                    console.error('❌ Error en recuperación de estado:', e);
                }
                
            } else {
                console.warn('⚠️ recoverChromeMobileState no disponible');
            }
        }
        
        // Test 4: Integración con validación
        function testValidationIntegration() {
            console.log('🧪 Test 4: Verificando integración con validación...');
            
            if (window.performValidation) {
                console.log('✅ performValidation disponible');
            } else {
                console.warn('⚠️ performValidation no disponible');
            }
            
            if (window.recoverGuestState) {
                console.log('✅ recoverGuestState disponible');
            } else {
                console.warn('⚠️ recoverGuestState no disponible');
            }
            
            if (window.updateUIBasedOnConfirmation) {
                console.log('✅ updateUIBasedOnConfirmation disponible');
            } else {
                console.warn('⚠️ updateUIBasedOnConfirmation no disponible');
            }
        }
        
        // Ejecutar pruebas después de un delay para asegurar que todo esté cargado
        setTimeout(runAllTests, 2000);
        
        // Ejecutar pruebas adicionales después de 5 segundos
        setTimeout(() => {
            console.log('🧪 Ejecutando pruebas tardías...');
            
            // Verificar que las funciones estén disponibles globalmente
            const globalFunctions = [
                'diagnoseChromeMobileIssues',
                'recoverChromeMobileState',
                'persistConfirmation',
                'RobustStorage'
            ];
            
            globalFunctions.forEach(funcName => {
                if (window[funcName]) {
                    console.log(`✅ ${funcName} disponible globalmente`);
                } else {
                    console.warn(`⚠️ ${funcName} NO disponible globalmente`);
                }
            });
            
        }, 5000);
        
        // Exponer función de prueba globalmente
        window.runChromeMobileTests = runAllTests;
        
        console.log('🧪 Test de integración Chrome Mobile configurado');
    });
})();
