// ========================================
// ENHANCER ULTRA AGRESIVO PARA DROPDOWNS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 Iniciando enhancer ultra agresivo para dropdowns...');
    
    // Función para aplicar estilos forzados a los dropdowns
    function enhanceDropdowns() {
        const selects = document.querySelectorAll('.form-group select, #guest-count, #kids-count');
        
        console.log('🔧 Encontré', selects.length, 'dropdowns para estilizar');
        
        selects.forEach(select => {
            console.log('🎯 Estilizando:', select.id || select.className);
            
            // Aplicar estilos directamente al elemento usando múltiples métodos
            const styles = {
                'appearance': 'none',
                'webkitAppearance': 'none',
                'mozAppearance': 'none',
                'backgroundImage': "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e\")",
                'backgroundRepeat': 'no-repeat',
                'backgroundPosition': 'right 12px center',
                'backgroundSize': '16px',
                'paddingRight': '40px',
                'cursor': 'pointer',
                'position': 'relative',
                'backgroundColor': 'rgba(255, 255, 255, 0.1)',
                'backdropFilter': 'blur(10px)',
                'border': '1px solid rgba(255, 255, 255, 0.2)',
                'borderRadius': '8px',
                'boxShadow': '0 4px 15px rgba(0, 0, 0, 0.1)',
                'color': 'var(--color-text)',
                'fontFamily': 'var(--font-primary)',
                'fontSize': '0.9em',
                'transition': 'all 0.3s ease'
            };
            
            // Aplicar estilos usando múltiples métodos
            Object.entries(styles).forEach(([property, value]) => {
                select.style[property] = value;
                select.style.setProperty(property.replace(/([A-Z])/g, '-$1').toLowerCase(), value, 'important');
            });
            
            // Aplicar estilos a todas las opciones
            const options = select.querySelectorAll('option');
            options.forEach(option => {
                const optionStyles = {
                    'backgroundColor': 'rgba(30, 30, 30, 0.95)',
                    'color': 'var(--color-text)',
                    'padding': '12px 16px',
                    'border': 'none',
                    'fontFamily': 'var(--font-primary)',
                    'fontSize': '0.9em',
                    'borderRadius': '4px',
                    'margin': '2px 4px'
                };
                
                Object.entries(optionStyles).forEach(([property, value]) => {
                    option.style[property] = value;
                    option.style.setProperty(property.replace(/([A-Z])/g, '-$1').toLowerCase(), value, 'important');
                });
            });
            
            // Eventos para el focus
            select.addEventListener('focus', function() {
                this.style.backgroundImage = "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d1b7a0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='18,15 12,9 6,15'%3e%3c/polyline%3e%3c/svg%3e\")";
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                this.style.borderColor = 'var(--color-accent)';
                this.style.boxShadow = '0 4px 20px rgba(209, 183, 160, 0.2)';
            });
            
            select.addEventListener('blur', function() {
                this.style.backgroundImage = "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e\")";
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            });
        });
        
        console.log('✅ Estilos aplicados a', selects.length, 'dropdowns');
    }
    
    // Aplicar estilos inmediatamente
    enhanceDropdowns();
    
    // Aplicar estilos con múltiples retrasos
    setTimeout(enhanceDropdowns, 100);
    setTimeout(enhanceDropdowns, 500);
    setTimeout(enhanceDropdowns, 1000);
    setTimeout(enhanceDropdowns, 2000);
    
    // Aplicar estilos cuando se abra el formulario RSVP
    document.addEventListener('rsvpFormShown', function() {
        console.log('📋 Formulario RSVP abierto, aplicando estilos...');
        setTimeout(enhanceDropdowns, 100);
        setTimeout(enhanceDropdowns, 500);
    });
    
    // Aplicar estilos cuando se agreguen nuevos elementos dinámicamente
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.querySelector) {
                        const newSelects = node.querySelectorAll('.form-group select, #guest-count, #kids-count');
                        if (newSelects.length > 0) {
                            console.log('🔄 Nuevos selects detectados, aplicando estilos...');
                            setTimeout(enhanceDropdowns, 50);
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
    
    // Aplicar estilos cada segundo durante los primeros 10 segundos
    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        enhanceDropdowns();
        if (attempts >= 10) {
            clearInterval(interval);
        }
    }, 1000);
    
    // Función global para ser llamada desde otros scripts
    window.enhanceDropdowns = enhanceDropdowns;
}); 