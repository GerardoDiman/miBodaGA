// ========================================
// SCRIPT FINAL PARA DROPDOWNS
// ========================================

// Función para forzar estilos usando múltiples métodos
function forceFinalDropdownStyles() {
    console.log('🎯 Aplicando estilos finales a dropdowns...');
    
    // Método 1: Usando CSS personalizado
    const style = document.createElement('style');
    style.textContent = `
        /* Estilos ultra específicos para dropdowns */
        .form-group select,
        #guest-count,
        #kids-count {
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e") !important;
            background-repeat: no-repeat !important;
            background-position: right 12px center !important;
            background-size: 16px !important;
            padding-right: 40px !important;
            cursor: pointer !important;
            position: relative !important;
            background-color: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(10px) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
            border-radius: 8px !important;
            color: var(--color-text) !important;
            font-family: var(--font-primary) !important;
            font-size: 0.9em !important;
            transition: all 0.3s ease !important;
        }
        
        .form-group select:focus,
        #guest-count:focus,
        #kids-count:focus {
            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d1b7a0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='18,15 12,9 6,15'%3e%3c/polyline%3e%3c/svg%3e") !important;
            background-color: rgba(255, 255, 255, 0.15) !important;
            border-color: var(--color-accent) !important;
            box-shadow: 0 4px 20px rgba(209, 183, 160, 0.2) !important;
        }
        
        .form-group select option,
        #guest-count option,
        #kids-count option,
        option {
            background-color: rgba(30, 30, 30, 0.95) !important;
            color: var(--color-text) !important;
            padding: 12px 16px !important;
            border: none !important;
            font-family: var(--font-primary) !important;
            font-size: 0.9em !important;
            border-radius: 4px !important;
            margin: 2px 4px !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
        }
        
        .form-group select option:hover,
        #guest-count option:hover,
        #kids-count option:hover,
        option:hover {
            background-color: var(--color-accent) !important;
            color: var(--color-background) !important;
        }
        
        .form-group select option:checked,
        #guest-count option:checked,
        #kids-count option:checked,
        option:checked,
        option:selected {
            background-color: var(--color-accent) !important;
            color: var(--color-background) !important;
            font-weight: 600 !important;
        }
    `;
    document.head.appendChild(style);
    
    // Método 2: Aplicar estilos directamente a los elementos
    const selects = document.querySelectorAll('.form-group select, #guest-count, #kids-count');
    
    selects.forEach(select => {
        // Aplicar estilos usando setProperty
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
        
        // Aplicar estilos a las opciones
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
    });
    
    console.log('✅ Estilos finales aplicados a', selects.length, 'dropdowns');
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando script final para dropdowns...');
    
    // Aplicar estilos inmediatamente
    forceFinalDropdownStyles();
    
    // Aplicar estilos con retrasos
    setTimeout(forceFinalDropdownStyles, 100);
    setTimeout(forceFinalDropdownStyles, 500);
    setTimeout(forceFinalDropdownStyles, 1000);
    setTimeout(forceFinalDropdownStyles, 2000);
    
    // Aplicar estilos cuando se abra el formulario RSVP
    document.addEventListener('rsvpFormShown', function() {
        console.log('📋 Formulario RSVP abierto, aplicando estilos finales...');
        setTimeout(forceFinalDropdownStyles, 100);
        setTimeout(forceFinalDropdownStyles, 500);
    });
    
    // Observer para nuevos elementos
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.querySelector) {
                        const newSelects = node.querySelectorAll('.form-group select, #guest-count, #kids-count');
                        if (newSelects.length > 0) {
                            console.log('🔄 Nuevos selects detectados, aplicando estilos finales...');
                            setTimeout(forceFinalDropdownStyles, 50);
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
    
    // Aplicar estilos cada 3 segundos durante los primeros 15 segundos
    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        forceFinalDropdownStyles();
        if (attempts >= 5) {
            clearInterval(interval);
        }
    }, 3000);
});

// Función global
window.forceFinalDropdownStyles = forceFinalDropdownStyles; 