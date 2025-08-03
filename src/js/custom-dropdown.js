// ========================================
// DROPDOWNS PERSONALIZADOS
// ========================================

class CustomDropdown {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            placeholder: 'Selecciona...',
            searchable: false,
            ...options
        };
        
        this.isOpen = false;
        this.selectedValue = '';
        this.selectedText = '';
        this.items = [];
        
        this.init();
    }
    
    init() {
        this.parseOriginalSelect();
        this.createCustomDropdown();
        this.bindEvents();
        this.hideOriginalSelect();
    }
    
    parseOriginalSelect() {
        const options = this.element.querySelectorAll('option');
        this.items = Array.from(options).map(option => ({
            value: option.value,
            text: option.textContent.trim(),
            selected: option.selected,
            disabled: option.disabled
        }));
        
        // Encontrar el elemento seleccionado
        const selected = this.items.find(item => item.selected);
        if (selected) {
            this.selectedValue = selected.value;
            this.selectedText = selected.text;
        }
    }
    
    createCustomDropdown() {
        // Crear el contenedor principal
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'custom-dropdown';
        
        // Crear el botón principal
        this.button = document.createElement('button');
        this.button.type = 'button';
        this.button.className = 'custom-dropdown-button';
        this.button.setAttribute('aria-haspopup', 'listbox');
        this.button.setAttribute('aria-expanded', 'false');
        
        // Crear el texto del botón
        this.buttonText = document.createElement('span');
        this.buttonText.className = 'custom-dropdown-text';
        this.updateButtonText();
        
        // Crear la flecha
        this.arrow = document.createElement('span');
        this.arrow.className = 'custom-dropdown-arrow';
        this.arrow.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
        `;
        
        // Ensamblar el botón
        this.button.appendChild(this.buttonText);
        this.button.appendChild(this.arrow);
        
        // Crear la lista de opciones
        this.optionsList = document.createElement('div');
        this.optionsList.className = 'custom-dropdown-options';
        this.optionsList.setAttribute('role', 'listbox');
        
        this.createOptions();
        
        // Ensamblar el dropdown
        this.dropdown.appendChild(this.button);
        this.dropdown.appendChild(this.optionsList);
        
        // Insertar después del select original
        this.element.parentNode.insertBefore(this.dropdown, this.element.nextSibling);
        
        // Guardar referencia en el elemento
        this.element._customDropdownInstance = this;
        this.dropdown._customDropdownInstance = this;
    }
    
    createOptions() {
        this.optionsList.innerHTML = '';
        
        this.items.forEach((item, index) => {
            if (item.disabled) return;
            
            const option = document.createElement('div');
            option.className = 'custom-dropdown-option';
            option.textContent = item.text;
            option.setAttribute('data-value', item.value);
            option.setAttribute('data-index', index);
            option.setAttribute('role', 'option');
            
            if (item.value === this.selectedValue) {
                option.classList.add('selected');
                option.setAttribute('aria-selected', 'true');
            }
            
            this.optionsList.appendChild(option);
        });
    }
    
    updateButtonText() {
        if (this.selectedText) {
            this.buttonText.textContent = this.selectedText;
            this.buttonText.classList.remove('custom-dropdown-placeholder');
        } else {
            this.buttonText.textContent = this.options.placeholder;
            this.buttonText.classList.add('custom-dropdown-placeholder');
        }
    }
    
    bindEvents() {
        // Click en el botón
        this.button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });
        
        // Click en las opciones
        this.optionsList.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-dropdown-option');
            if (option) {
                this.selectOption(option);
            }
        });
        
        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target)) {
                this.close();
            }
        });
        
        // Teclado
        this.button.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    this.toggle();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (!this.isOpen) {
                        this.open();
                    } else {
                        this.focusNextOption();
                    }
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (!this.isOpen) {
                        this.open();
                    } else {
                        this.focusPrevOption();
                    }
                    break;
                case 'Escape':
                    this.close();
                    break;
            }
        });
        
        // Navegación con teclado en las opciones
        this.optionsList.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    const focused = this.optionsList.querySelector('.custom-dropdown-option:focus');
                    if (focused) {
                        this.selectOption(focused);
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.focusNextOption();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.focusPrevOption();
                    break;
                case 'Escape':
                    this.close();
                    this.button.focus();
                    break;
            }
        });
    }
    
    hideOriginalSelect() {
        this.element.style.display = 'none';
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        if (this.isOpen) return;
        
        // Cerrar otros dropdowns abiertos
        document.querySelectorAll('.custom-dropdown.open').forEach(dropdown => {
            if (dropdown !== this.dropdown) {
                dropdown.classList.remove('open');
            }
        });
        
        this.isOpen = true;
        this.dropdown.classList.add('open');
        this.button.setAttribute('aria-expanded', 'true');
        
        // Enfocar la opción seleccionada o la primera
        const selectedOption = this.optionsList.querySelector('.custom-dropdown-option.selected');
        const firstOption = this.optionsList.querySelector('.custom-dropdown-option');
        
        if (selectedOption) {
            selectedOption.focus();
        } else if (firstOption) {
            firstOption.focus();
        }
        
        // Dispatch evento personalizado
        this.element.dispatchEvent(new CustomEvent('dropdown:open', {
            detail: { dropdown: this }
        }));
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.dropdown.classList.remove('open');
        this.button.setAttribute('aria-expanded', 'false');
        
        // Dispatch evento personalizado
        this.element.dispatchEvent(new CustomEvent('dropdown:close', {
            detail: { dropdown: this }
        }));
    }
    
    selectOption(optionElement) {
        const value = optionElement.getAttribute('data-value');
        const text = optionElement.textContent;
        
        // Actualizar selección visual
        this.optionsList.querySelectorAll('.custom-dropdown-option').forEach(opt => {
            opt.classList.remove('selected');
            opt.setAttribute('aria-selected', 'false');
        });
        
        optionElement.classList.add('selected');
        optionElement.setAttribute('aria-selected', 'true');
        
        // Actualizar valores
        this.selectedValue = value;
        this.selectedText = text;
        
        // Actualizar el select original
        this.element.value = value;
        
        // Actualizar el botón
        this.updateButtonText();
        
        // Cerrar dropdown
        this.close();
        
        // Dispatch eventos
        this.element.dispatchEvent(new Event('change', { bubbles: true }));
        this.element.dispatchEvent(new CustomEvent('dropdown:select', {
            detail: { value, text, dropdown: this }
        }));
        
        console.log('🎯 Opción seleccionada:', { value, text });
    }
    
    focusNextOption() {
        const options = Array.from(this.optionsList.querySelectorAll('.custom-dropdown-option'));
        const currentIndex = options.findIndex(opt => opt === document.activeElement);
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        options[nextIndex].focus();
    }
    
    focusPrevOption() {
        const options = Array.from(this.optionsList.querySelectorAll('.custom-dropdown-option'));
        const currentIndex = options.findIndex(opt => opt === document.activeElement);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        options[prevIndex].focus();
    }
    
    updateOptions(newItems) {
        this.items = newItems;
        this.createOptions();
        this.updateButtonText();
    }
    
    refreshFromSelect() {
        // Re-parsear el select original para obtener las opciones actualizadas
        this.parseOriginalSelect();
        this.createOptions();
        this.updateButtonText();
        console.log('🔄 Dropdown actualizado con', this.items.length, 'opciones');
    }
    
    setValue(value) {
        const item = this.items.find(item => item.value === value);
        if (item) {
            this.selectedValue = value;
            this.selectedText = item.text;
            this.element.value = value;
            this.updateButtonText();
            this.createOptions();
        }
    }
    
    destroy() {
        if (this.dropdown && this.dropdown.parentNode) {
            this.dropdown.parentNode.removeChild(this.dropdown);
        }
        this.element.style.display = '';
    }
}

// Función para inicializar todos los dropdowns personalizados
function initCustomDropdowns() {
    console.log('🎨 Inicializando dropdowns personalizados...');
    
    const selects = document.querySelectorAll('.form-group select, #guest-count, #kids-count');
    const dropdowns = [];
    
    selects.forEach(select => {
        if (!select.dataset.customDropdownInitialized) {
            const placeholder = select.querySelector('option[value=""]')?.textContent || 'Selecciona...';
            
            const dropdown = new CustomDropdown(select, {
                placeholder: placeholder
            });
            
            dropdowns.push(dropdown);
            select.dataset.customDropdownInitialized = 'true';
            
            console.log('✅ Dropdown personalizado creado para:', select.id || select.className);
        }
    });
    
    return dropdowns;
}

// Función para actualizar dropdowns existentes
function updateCustomDropdowns() {
    console.log('🔄 Actualizando dropdowns personalizados...');
    
    const selects = document.querySelectorAll('.form-group select, #guest-count, #kids-count');
    
    selects.forEach(select => {
        if (select.dataset.customDropdownInitialized && select._customDropdownInstance) {
            console.log('🎯 Actualizando dropdown para:', select.id || select.className);
            const dropdown = select._customDropdownInstance;
            dropdown.refreshFromSelect();
        }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando sistema de dropdowns personalizados...');
    
    // Inicializar dropdowns existentes
    setTimeout(initCustomDropdowns, 100);
    
    // Observer para nuevos elementos
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.querySelector) {
                        const newSelects = node.querySelectorAll('.form-group select, #guest-count, #kids-count');
                        if (newSelects.length > 0) {
                            console.log('🔄 Nuevos selects detectados, inicializando dropdowns personalizados...');
                            setTimeout(initCustomDropdowns, 50);
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
});

// Función específica para actualizar un dropdown por ID
function updateDropdownById(selectId) {
    const select = document.getElementById(selectId);
    if (select && select._customDropdownInstance) {
        console.log('🎯 Actualizando dropdown específico:', selectId);
        select._customDropdownInstance.refreshFromSelect();
        return true;
    }
    console.warn('⚠️ No se pudo actualizar dropdown:', selectId);
    return false;
}

// Función para recrear un dropdown específico
function recreateDropdownById(selectId) {
    const select = document.getElementById(selectId);
    if (select) {
        console.log('🔄 Recreando dropdown:', selectId);
        
        // Destruir el dropdown existente si existe
        if (select._customDropdownInstance) {
            select._customDropdownInstance.destroy();
            select._customDropdownInstance = null;
            select.dataset.customDropdownInitialized = '';
        }
        
        // Crear nuevo dropdown
        const placeholder = select.querySelector('option[value=""]')?.textContent || 'Selecciona...';
        const dropdown = new CustomDropdown(select, { placeholder });
        
        console.log('✅ Dropdown recreado con', dropdown.items.length, 'opciones');
        return dropdown;
    }
    return null;
}

// Funciones globales
window.initCustomDropdowns = initCustomDropdowns;
window.updateCustomDropdowns = updateCustomDropdowns;
window.updateDropdownById = updateDropdownById;
window.recreateDropdownById = recreateDropdownById;
window.CustomDropdown = CustomDropdown;