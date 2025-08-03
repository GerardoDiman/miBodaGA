// ========================================
// FORZADOR ULTRA AGRESIVO DE ESTILOS PARA DROPDOWNS
// ========================================

// Función para forzar estilos en dropdowns usando múltiples métodos
function forceDropdownStyles() {
    console.log('🔧 Aplicando estilos forzados a dropdowns...');
    
    const selects = document.querySelectorAll('.form-group select, #guest-count, #kids-count');
    
    selects.forEach(select => {
        console.log('🎯 Aplicando estilos a:', select.id || select.className);
        
        // Método 1: setProperty con !important
        const styles = {
            'appearance': 'none',
            '-webkit-appearance': 'none',
            '-moz-appearance': 'none',
            'background-image': "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%23ffffff stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226,9 12,15 18,9%22%3e%3c/polyline%3e%3c/svg%3e')",
            'background-repeat': 'no-repeat',
            'background-position': 'right 12px center',
            'background-size': '16px',
            'padding-right': '40px',
            'cursor': 'pointer',
            'position': 'relative',
            'background-color': 'rgba(255, 255, 255, 0.1)',
            'backdrop-filter': 'blur(10px)',
            'border': '1px solid rgba(255, 255, 255, 0.2)',
            'border-radius': '8px',
            'box-shadow': '0 4px 15px rgba(0, 0, 0, 0.1)',
            'color': 'var(--color-text)',
            'font-family': 'var(--font-primary)',
            'font-size': '0.9em',
            'transition': 'all 0.3s ease'
        };
        
        Object.entries(styles).forEach(([property, value]) => {
            select.style.setProperty(property, value, 'important');
        });
        
        // Método 2: Aplicar estilos directamente a las opciones
        const options = select.querySelectorAll('option');
        options.forEach(option => {
            const optionStyles = {
                'background-color': 'rgba(30, 30, 30, 0.95)',
                'color': 'var(--color-text)',
                'padding': '12px 16px',
                'border': 'none',
                'font-family': 'var(--font-primary)',
                'font-size': '0.9em',
                'border-radius': '4px',
                'margin': '2px 4px'
            };
            
            Object.entries(optionStyles).forEach(([property, value]) => {
                option.style.setProperty(property, value, 'important');
            });
        });
        
        // Método 3: Eventos para el focus
        select.addEventListener('focus', function() {
            this.style.setProperty('background-image', "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%23d1b7a0 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%2218,15 12,9 6,15%22%3e%3c/polyline%3e%3c/svg%3e')", 'important');
            this.style.setProperty('background-color', 'rgba(255, 255, 255, 0.15)', 'important');
            this.style.setProperty('border-color', 'var(--color-accent)', 'important');
            this.style.setProperty('box-shadow', '0 4px 20px rgba(209, 183, 160, 0.2)', 'important');
        });
        
        select.addEventListener('blur', function() {
            this.style.setProperty('background-image', "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%23ffffff stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226,9 12,15 18,9%22%3e%3c/polyline%3e%3c/svg%3e')", 'important');
            this.style.setProperty('background-color', 'rgba(255, 255, 255, 0.1)', 'important');
            this.style.setProperty('border-color', 'rgba(255, 255, 255, 0.2)', 'important');
            this.style.setProperty('box-shadow', '0 4px 15px rgba(0, 0, 0, 0.1)', 'important');
        });
        
        // Método 4: Observer para nuevas opciones
        const optionObserver = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeName === 'OPTION') {
                        const optionStyles = {
                            'background-color': 'rgba(30, 30, 30, 0.95)',
                            'color': 'var(--color-text)',
                            'padding': '12px 16px',
                            'border': 'none',
                            'font-family': 'var(--font-primary)',
                            'font-size': '0.9em',
                            'border-radius': '4px',
                            'margin': '2px 4px'
                        };
                        
                        Object.entries(optionStyles).forEach(([property, value]) => {
                            node.style.setProperty(property, value, 'important');
                        });
                    }
                });
            });
        });
        
        optionObserver.observe(select, {
            childList: true,
            subtree: true
        });
    });
    
    console.log('✅ Estilos aplicados a', selects.length, 'dropdowns');
}

// Función para aplicar estilos con retraso
function applyStylesWithDelay() {
    setTimeout(forceDropdownStyles, 100);
    setTimeout(forceDropdownStyles, 500);
    setTimeout(forceDropdownStyles, 1000);
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando forzador de estilos de dropdowns...');
    
    // Aplicar estilos inmediatamente
    forceDropdownStyles();
    
    // Aplicar estilos con retrasos múltiples
    applyStylesWithDelay();
    
    // Aplicar estilos cuando se abra el formulario RSVP
    document.addEventListener('rsvpFormShown', function() {
        console.log('📋 Formulario RSVP abierto, aplicando estilos...');
        applyStylesWithDelay();
    });
    
    // Observer para detectar cambios en el DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.querySelector) {
                        const newSelects = node.querySelectorAll('.form-group select, #guest-count, #kids-count');
                        if (newSelects.length > 0) {
                            console.log('🔄 Nuevos selects detectados, aplicando estilos...');
                            setTimeout(forceDropdownStyles, 50);
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Aplicar estilos cada 2 segundos durante los primeros 10 segundos
    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        forceDropdownStyles();
        if (attempts >= 5) {
            clearInterval(interval);
        }
    }, 2000);
});

// Función global para ser llamada desde otros scripts
window.forceDropdownStyles = forceDropdownStyles;
window.applyStylesWithDelay = applyStylesWithDelay; 