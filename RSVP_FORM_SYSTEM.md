# Sistema de RSVP con Formulario

## Descripción General

El nuevo sistema de RSVP permite un control más detallado de las confirmaciones de asistencia. En lugar de confirmar automáticamente, ahora se muestra un formulario que permite:

1. **Seleccionar el número de pases a utilizar** (de los disponibles)
2. **Escribir los nombres de los invitados** que asistirán
3. **Proporcionar información de contacto** (teléfono obligatorio, email opcional)
4. **Validación automática** para asegurar que los datos sean correctos

## Flujo del Sistema

### 1. Inicio
- El invitado accede a su invitación personalizada con su ID único
- Se cargan sus datos desde `data/invitados.json`
- Se muestra la información del invitado (nombre, pases disponibles)

### 2. Confirmación
- Al hacer clic en "CONFIRMAR" se abre un modal con el formulario
- El formulario se pre-configura con las opciones de pases disponibles
- El invitado debe completar todos los campos obligatorios

### 3. Validación
El sistema valida:
- ✅ Número de pases seleccionado
- ✅ Nombres de invitados escritos
- ✅ Teléfono de contacto (formato básico)
- ✅ Coincidencia entre número de pases y número de nombres

### 4. Envío
- Los datos se envían a Google Sheets con información adicional
- Se incluye timestamp de la confirmación
- Se maneja el modo offline con sincronización automática

## Estructura de Datos

### Datos del Invitado (invitados.json)
```json
{
  "id": "abc123",
  "nombre": "Juan Pérez",
  "pases": 3,
  "ninos": 0
}
```

### Datos del Formulario (enviados a Google Sheets)
```json
{
  "id": "abc123",
  "nombre": "Juan Pérez",
  "pases": 3,
  "ninos": 0,
  "pasesUtilizados": 2,
  "nombresInvitados": "Juan Pérez, María Pérez",
  "telefono": "+52 963 123 4567",
  "email": "juan@email.com",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## Archivos Modificados

### HTML
- `index.html`: Agregado formulario modal con todos los campos necesarios

### CSS
- `src/css/sections/_rsvp.css`: Estilos completos para el formulario modal

### JavaScript
- `src/js/rsvp-form.js`: **NUEVO** - Lógica completa del formulario
- `src/js/invitation.js`: Modificado para integrar con el formulario

## Características del Formulario

### Campos del Formulario
1. **Número de pases a utilizar**
   - Dropdown con opciones desde 1 hasta pases disponibles
   - Validación automática

2. **Nombres de los invitados**
   - Textarea para escribir nombres separados por comas
   - Validación de coincidencia con número de pases

3. **Teléfono de contacto** (obligatorio)
   - Input tipo tel con validación de formato
   - Regex básico para números internacionales

4. **Email** (opcional)
   - Input tipo email con validación automática del navegador

### Validaciones Implementadas
- ✅ Campos obligatorios completados
- ✅ Formato de teléfono válido
- ✅ Número de nombres coincide con pases seleccionados
- ✅ Email válido (si se proporciona)

### Interfaz de Usuario
- **Modal responsive** que se adapta a móviles
- **Backdrop blur** para mejor enfoque
- **Animaciones suaves** en apertura/cierre
- **Mensajes de error** claros y específicos
- **Botones de acción** (Cancelar/Confirmar)

## Integración con Google Sheets

### Estructura de Datos Enviados
Los datos se envían al Google Apps Script con la siguiente estructura:

```javascript
{
  id: "abc123",                    // ID único del invitado
  nombre: "Juan Pérez",            // Nombre del invitado principal
  pases: 3,                        // Pases totales asignados
  ninos: 0,                        // Niños asignados
  pasesUtilizados: 2,              // Pases que realmente usará
  nombresInvitados: "Juan, María", // Nombres de quienes asistirán
  telefono: "+52 963 123 4567",   // Teléfono de contacto
  email: "juan@email.com",         // Email (opcional)
  timestamp: "2025-01-15T10:30:00.000Z" // Fecha/hora de confirmación
}
```

### Manejo de Errores
- **Modo offline**: Los datos se guardan localmente y se sincronizan cuando hay conexión
- **Reintentos automáticos**: El sistema intenta enviar datos pendientes
- **Notificaciones**: Mensajes claros sobre el estado de la sincronización

## Ventajas del Nuevo Sistema

### Para los Novios
- ✅ **Control detallado**: Saben exactamente quién asistirá
- ✅ **Información de contacto**: Pueden contactar a los invitados si es necesario
- ✅ **Datos estructurados**: Información organizada en Google Sheets
- ✅ **Flexibilidad**: Los invitados pueden usar menos pases de los asignados

### Para los Invitados
- ✅ **Claridad**: Saben exactamente cuántos pases tienen
- ✅ **Flexibilidad**: Pueden usar menos pases si es necesario
- ✅ **Información clara**: Formulario intuitivo y fácil de usar
- ✅ **Confirmación**: Reciben confirmación visual de su reservación

## Configuración del Google Apps Script

El Google Apps Script debe estar configurado para recibir los nuevos campos:

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  
  // Nuevos campos disponibles
  const pasesUtilizados = data.pasesUtilizados;
  const nombresInvitados = data.nombresInvitados;
  const telefono = data.telefono;
  const email = data.email;
  const timestamp = data.timestamp;
  
  // Procesar y guardar en Google Sheets
  // ...
}
```

## Próximos Pasos

1. **Actualizar Google Apps Script** para manejar los nuevos campos
2. **Probar el sistema** con invitados reales
3. **Monitorear** las confirmaciones en Google Sheets
4. **Ajustar validaciones** según feedback de usuarios

## Notas Técnicas

- El formulario es completamente responsive
- Funciona offline con sincronización automática
- Validaciones del lado del cliente para mejor UX
- Integración transparente con el sistema existente
- Mantiene compatibilidad con el sistema de QR existente 