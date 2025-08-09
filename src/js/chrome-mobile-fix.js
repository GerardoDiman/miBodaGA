// chrome-mobile-fix.js - Soluciones específicas para Chrome móvil

console.log('🔧 chrome-mobile-fix.js cargado');

(function() {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔧 Chrome Mobile Fix inicializado');
        
        // --- DETECCIÓN AVANZADA DE PROBLEMAS EN CHROME MÓVIL ---
        function diagnoseChromeMobileIssues() {
            const userAgent = navigator.userAgent.toLowerCase();
            const isChrome = /chrome/.test(userAgent) && !/edge/.test(userAgent);
            const isChromeMobile = isChrome && /mobile|android|iphone|ipad/.test(userAgent);
            
            if (!isChromeMobile) {
                console.log('🔧 No es Chrome móvil, diagnóstico no necesario');
                return;
            }
            
            console.log('🔧 Diagnóstico de Chrome móvil iniciado...');
            
            // Probar localStorage
            let localStorageWorks = false;
            try {
                localStorage.setItem('test_chrome_mobile', 'test');
                localStorage.removeItem('test_chrome_mobile');
                localStorageWorks = true;
                console.log('✅ localStorage funciona en Chrome móvil');
            } catch (e) {
                console.warn('❌ localStorage falla en Chrome móvil:', e);
            }
            
            // Probar sessionStorage
            let sessionStorageWorks = false;
            try {
                sessionStorage.setItem('test_chrome_mobile', 'test');
                sessionStorage.removeItem('test_chrome_mobile');
                sessionStorageWorks = true;
                console.log('✅ sessionStorage funciona en Chrome móvil');
            } catch (e) {
                console.warn('❌ sessionStorage falla en Chrome móvil:', e);
            }
            
            // Probar cookies
            let cookiesWork = false;
            try {
                document.cookie = 'test_chrome_mobile=test;path=/;max-age=60';
                const cookieExists = document.cookie.includes('test_chrome_mobile=test');
                if (cookieExists) {
                    document.cookie = 'test_chrome_mobile=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    cookiesWork = true;
                    console.log('✅ Cookies funcionan en Chrome móvil');
                }
            } catch (e) {
                console.warn('❌ Cookies fallan en Chrome móvil:', e);
            }
            
            // Probar IndexedDB
            let indexedDBWorks = false;
            try {
                if ('indexedDB' in window) {
                    const request = indexedDB.open('test_chrome_mobile', 1);
                    request.onerror = () => console.warn('❌ IndexedDB falla en Chrome móvil');
                    request.onsuccess = () => {
                        indexedDBWorks = true;
                        console.log('✅ IndexedDB funciona en Chrome móvil');
                        request.result.close();
                        indexedDB.deleteDatabase('test_chrome_mobile');
                    };
                }
            } catch (e) {
                console.warn('❌ Error probando IndexedDB en Chrome móvil:', e);
            }
            
            // Resumen del diagnóstico
            const diagnosis = {
                localStorage: localStorageWorks,
                sessionStorage: sessionStorageWorks,
                cookies: cookiesWork,
                indexedDB: indexedDBWorks,
                timestamp: new Date().toISOString()
            };
            
            console.log('🔧 Diagnóstico completo de Chrome móvil:', diagnosis);
            
            // Guardar diagnóstico para debugging
            try {
                if (localStorageWorks) {
                    localStorage.setItem('chrome_mobile_diagnosis', JSON.stringify(diagnosis));
                } else if (sessionStorageWorks) {
                    sessionStorage.setItem('chrome_mobile_diagnosis', JSON.stringify(diagnosis));
                } else if (cookiesWork) {
                    document.cookie = `chrome_mobile_diagnosis=${encodeURIComponent(JSON.stringify(diagnosis))};path=/;max-age=3600`;
                }
            } catch (e) {
                console.warn('⚠️ No se pudo guardar el diagnóstico:', e);
            }
            
            return diagnosis;
        }
        
        // --- SISTEMA DE PERSISTENCIA ROBUSTO ---
        class RobustStorage {
            constructor() {
                this.storageMethods = [];
                this.initializeStorageMethods();
            }
            
            initializeStorageMethods() {
                // Prioridad 1: localStorage
                if (this.testStorage('localStorage')) {
                    this.storageMethods.push({
                        name: 'localStorage',
                        set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
                        get: (key) => {
                            try {
                                const item = localStorage.getItem(key);
                                return item ? JSON.parse(item) : null;
                            } catch (e) {
                                return null;
                            }
                        },
                        remove: (key) => localStorage.removeItem(key),
                        clear: () => localStorage.clear()
                    });
                }
                
                // Prioridad 2: sessionStorage
                if (this.testStorage('sessionStorage')) {
                    this.storageMethods.push({
                        name: 'sessionStorage',
                        set: (key, value) => sessionStorage.setItem(key, JSON.stringify(value)),
                        get: (key) => {
                            try {
                                const item = sessionStorage.getItem(key);
                                return item ? JSON.parse(item) : null;
                            } catch (e) {
                                return null;
                            }
                        },
                        remove: (key) => sessionStorage.removeItem(key),
                        clear: () => sessionStorage.clear()
                    });
                }
                
                // Prioridad 3: Cookies
                if (this.testCookies()) {
                    this.storageMethods.push({
                        name: 'cookies',
                        set: (key, value) => {
                            const cookieValue = encodeURIComponent(JSON.stringify(value));
                            document.cookie = `${key}=${cookieValue};path=/;max-age=86400`; // 24 horas
                        },
                        get: (key) => {
                            try {
                                const cookies = document.cookie.split(';');
                                const cookie = cookies.find(c => c.trim().startsWith(key + '='));
                                if (cookie) {
                                    const value = cookie.split('=')[1];
                                    return JSON.parse(decodeURIComponent(value));
                                }
                                return null;
                            } catch (e) {
                                return null;
                            }
                        },
                        remove: (key) => {
                            document.cookie = `${key}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
                        },
                        clear: () => {
                            // Limpiar cookies específicas de la aplicación
                            const cookies = document.cookie.split(';');
                            cookies.forEach(cookie => {
                                const key = cookie.split('=')[0].trim();
                                if (key.startsWith('boda_') || key.startsWith('chrome_mobile_')) {
                                    document.cookie = `${key}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
                                }
                            });
                        }
                    });
                }
                
                console.log(`🔧 Métodos de almacenamiento disponibles: ${this.storageMethods.map(m => m.name).join(', ')}`);
            }
            
            testStorage(type) {
                try {
                    const test = `${type}_test_${Date.now()}`;
                    window[type].setItem(test, test);
                    const result = window[type].getItem(test) === test;
                    window[type].removeItem(test);
                    return result;
                } catch (e) {
                    return false;
                }
            }
            
            testCookies() {
                try {
                    const test = `test_cookie_${Date.now()}`;
                    document.cookie = `${test}=test;path=/;max-age=60`;
                    const result = document.cookie.includes(test);
                    document.cookie = `${test}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
                    return result;
                } catch (e) {
                    return false;
                }
            }
            
            set(key, value) {
                for (const method of this.storageMethods) {
                    try {
                        method.set(key, value);
                        console.log(`✅ ${key} guardado en ${method.name}`);
                        return true;
                    } catch (e) {
                        console.warn(`❌ Error guardando ${key} en ${method.name}:`, e);
                    }
                }
                return false;
            }
            
            get(key) {
                for (const method of this.storageMethods) {
                    try {
                        const value = method.get(key);
                        if (value !== null) {
                            console.log(`✅ ${key} recuperado de ${method.name}`);
                            return value;
                        }
                    } catch (e) {
                        console.warn(`❌ Error leyendo ${key} de ${method.name}:`, e);
                    }
                }
                return null;
            }
            
            remove(key) {
                for (const method of this.storageMethods) {
                    try {
                        method.remove(key);
                    } catch (e) {
                        console.warn(`❌ Error removiendo ${key} de ${method.name}:`, e);
                    }
                }
            }
            
            clear() {
                for (const method of this.storageMethods) {
                    try {
                        method.clear();
                    } catch (e) {
                        console.warn(`❌ Error limpiando ${method.name}:`, e);
                    }
                }
            }
        }
        
        // --- FUNCIÓN DE RECUPERACIÓN PARA CHROME MÓVIL ---
        function recoverChromeMobileState() {
            console.log('🔧 Intentando recuperar estado en Chrome móvil...');
            
            const storage = new RobustStorage();
            
            // Buscar confirmación en múltiples fuentes
            const sources = [];
            
            // Buscar en todos los métodos de almacenamiento
            const confirmationKeys = [
                'boda_confirmado',
                'guest_confirmed',
                'invitado_confirmado',
                'rsvp_confirmed'
            ];
            
            for (const key of confirmationKeys) {
                const value = storage.get(key);
                if (value) {
                    sources.push({
                        type: 'storage',
                        key: key,
                        value: value
                    });
                }
            }
            
            // Buscar en localStorage específico
            try {
                const keys = Object.keys(localStorage);
                const bodaKeys = keys.filter(key => key.includes('boda_confirmado_'));
                if (bodaKeys.length > 0) {
                    sources.push({
                        type: 'localStorage',
                        keys: bodaKeys,
                        data: bodaKeys.map(key => ({
                            key: key,
                            value: localStorage.getItem(key)
                        }))
                    });
                }
            } catch (e) {
                console.warn('❌ Error leyendo localStorage:', e);
            }
            
            // Buscar en sessionStorage específico
            try {
                const keys = Object.keys(sessionStorage);
                const bodaKeys = keys.filter(key => key.includes('boda_confirmado_'));
                if (bodaKeys.length > 0) {
                    sources.push({
                        type: 'sessionStorage',
                        keys: bodaKeys,
                        data: bodaKeys.map(key => ({
                            key: key,
                            value: sessionStorage.getItem(key)
                        }))
                    });
                }
            } catch (e) {
                console.warn('❌ Error leyendo sessionStorage:', e);
            }
            
            // Buscar en cookies específicas
            try {
                const cookies = document.cookie.split(';');
                const bodaCookies = cookies.filter(cookie => 
                    cookie.trim().includes('boda_confirmado_')
                );
                if (bodaCookies.length > 0) {
                    sources.push({
                        type: 'cookies',
                        data: bodaCookies.map(cookie => {
                            const [key, value] = cookie.trim().split('=');
                            return { key, value };
                        })
                    });
                }
            } catch (e) {
                console.warn('❌ Error leyendo cookies:', e);
            }
            
            console.log('🔧 Estado recuperado de múltiples fuentes:', sources);
            
            // Si encontramos confirmación, intentar restaurar la UI
            if (sources.length > 0) {
                const confirmedKeys = sources.flatMap(source => {
                    if (source.type === 'storage') {
                        return source.value ? [source] : [];
                    } else if (source.data) {
                        return source.data.filter(item => item.value === 'true');
                    }
                    return [];
                });
                
                if (confirmedKeys.length > 0) {
                    console.log('✅ Confirmación encontrada, restaurando UI...');
                    
                    // Extraer ID del invitado de la primera clave confirmada
                    let guestId = null;
                    if (confirmedKeys[0].key) {
                        guestId = confirmedKeys[0].key.replace('boda_confirmado_', '');
                    }
                    
                    console.log('🔍 ID del invitado confirmado:', guestId);
                    
                    // Intentar restaurar la UI
                    if (window.updateUIBasedOnConfirmation) {
                        window.updateUIBasedOnConfirmation(true, guestId);
                        console.log('✅ UI restaurada exitosamente');
                    } else if (window.recoverGuestState) {
                        window.recoverGuestState(guestId);
                        console.log('✅ Estado del invitado recuperado');
                    } else {
                        console.warn('⚠️ Funciones de recuperación no disponibles, intentando redirección...');
                        // Intentar redirección como último recurso
                        if (guestId) {
                            const currentUrl = window.location.href;
                            if (!currentUrl.includes('id=')) {
                                const separator = currentUrl.includes('?') ? '&' : '?';
                                window.location.href = `${currentUrl}${separator}id=${guestId}`;
                            }
                        }
                    }
                }
            }
            
            return sources;
        }
        
        // --- FUNCIÓN DE PERSISTENCIA DE CONFIRMACIÓN ---
        function persistConfirmation(guestId, confirmationData) {
            console.log(`🔧 Persistiendo confirmación para invitado ${guestId}...`);
            
            const storage = new RobustStorage();
            
            // Guardar en múltiples formatos para máxima compatibilidad
            const keys = [
                `boda_confirmado_${guestId}`,
                `guest_confirmed_${guestId}`,
                `invitado_confirmado_${guestId}`,
                'boda_confirmado',
                'guest_confirmed',
                'invitado_confirmado'
            ];
            
            let success = false;
            for (const key of keys) {
                if (storage.set(key, confirmationData)) {
                    success = true;
                }
            }
            
            if (success) {
                console.log('✅ Confirmación persistida exitosamente');
                return true;
            } else {
                console.error('❌ No se pudo persistir la confirmación');
                return false;
            }
        }
        
        // --- INICIALIZACIÓN AUTOMÁTICA ---
        
        // Ejecutar diagnóstico si es Chrome móvil
        const userAgent = navigator.userAgent.toLowerCase();
        const isChromeMobile = /chrome/.test(userAgent) && !/edge/.test(userAgent) && /mobile|android|iphone|ipad/.test(userAgent);
        
        if (isChromeMobile) {
            console.log('🔧 Chrome móvil detectado, ejecutando diagnóstico...');
            
            // Ejecutar diagnóstico después de un breve delay
            setTimeout(() => {
                const diagnosis = diagnoseChromeMobileIssues();
                
                // Si hay problemas, intentar recuperar estado
                if (!diagnosis.localStorage || !diagnosis.sessionStorage) {
                    console.log('🔧 Problemas detectados, intentando recuperación...');
                    setTimeout(recoverChromeMobileState, 1000);
                }
            }, 2000);
            
            // Intentar recuperación adicional después de 5 segundos
            setTimeout(() => {
                console.log('🔧 Recuperación tardía en Chrome móvil...');
                recoverChromeMobileState();
            }, 5000);
        }
        
        // --- EXPONER FUNCIONES GLOBALMENTE ---
        window.diagnoseChromeMobileIssues = diagnoseChromeMobileIssues;
        window.recoverChromeMobileState = recoverChromeMobileState;
        window.persistConfirmation = persistConfirmation;
        window.RobustStorage = RobustStorage;
        
        // --- INTEGRACIÓN CON EL SISTEMA DE VALIDACIÓN ---
        window.recoverGuestState = function(guestId) {
            console.log(`🔧 Recuperando estado del invitado ${guestId}...`);
            
            if (window.performValidation) {
                window.performValidation(guestId);
            } else {
                console.warn('⚠️ Función performValidation no disponible');
            }
        };
        
        console.log('🔧 Chrome Mobile Fix completamente inicializado');
    });
})();
