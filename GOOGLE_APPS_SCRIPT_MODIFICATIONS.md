# Modificaciones Necesarias para Google Apps Script

## Resumen de Cambios

Tu Google Apps Script actual necesita ser modificado para manejar los nuevos campos del formulario RSVP. El frontend ahora envía datos adicionales que incluyen información detallada sobre los invitados.

## Nuevos Campos del Formulario RSVP

El frontend ahora envía estos campos adicionales:

```javascript
{
    id: invitadoActual.id,
    nombre: invitadoActual.nombre,
    pases: invitadoActual.pases,
    ninos: invitadoActual.ninos,
    pasesUtilizados: formData.guestCount,        // NUEVO
    nombresInvitados: formData.guestNames,       // NUEVO
    telefono: formData.guestPhone,               // NUEVO
    email: formData.guestEmail || '',            // NUEVO
    timestamp: new Date().toISOString()          // NUEVO
}
```

## Modificaciones Requeridas en doPost()

### 1. Validación de Nuevos Campos

Agregar validación para los nuevos campos después de la validación existente:

```javascript
// Validar nuevos campos del formulario RSVP
if (!data.pasesUtilizados || !data.nombresInvitados || !data.telefono) {
    Logger.log("Error: Faltan datos del formulario RSVP. Datos recibidos: " + JSON.stringify(data));
    return sendJsonResponse({
        "status": "error",
        "message": "Faltan datos del formulario RSVP (pasesUtilizados, nombresInvitados, telefono)."
    });
}
```

### 2. Estructura de Datos Actualizada

Cambiar la estructura de `newRow` para incluir los nuevos campos:

```javascript
// Orden de columnas actualizado para incluir nuevos campos:
// A=Timestamp, B=ID, C=Nombre, D=Pases, E=Niños, F=Estado, G=PasesUtilizados, H=NombresInvitados, I=Telefono, J=Email, K=TimestampFormulario
var newRow = [
    timestamp,                    // A: Timestamp del servidor
    data.id,                     // B: ID del invitado
    data.nombre,                 // C: Nombre del invitado
    data.pases,                  // D: Pases asignados originalmente
    data.ninos,                  // E: Niños asignados originalmente
    "Confirmado",                // F: Estado
    data.pasesUtilizados,        // G: Pases utilizados (nuevo)
    data.nombresInvitados,       // H: Nombres de invitados (nuevo)
    data.telefono,               // I: Teléfono de contacto (nuevo)
    data.email || "",            // J: Email (opcional, nuevo)
    formTimestamp                // K: Timestamp del formulario (nuevo)
];
```

### 3. Logging Mejorado

Agregar logging para los nuevos campos:

```javascript
Logger.log(`Nuevos datos RSVP: PasesUtilizados=${data.pasesUtilizados}, Telefono=${data.telefono}, Email=${data.email || 'No proporcionado'}`);
```

## Estructura de Columnas en Google Sheets

Tu hoja de Google Sheets debe tener estas columnas en orden:

| Columna | Nombre | Descripción |
|---------|--------|-------------|
| A | Timestamp | Fecha/hora del servidor |
| B | ID | ID del invitado |
| C | Nombre | Nombre del invitado |
| D | Pases | Pases asignados originalmente |
| E | Niños | Niños asignados originalmente |
| F | Estado | Estado de confirmación |
| G | PasesUtilizados | Pases que realmente usará |
| H | NombresInvitados | Nombres de las personas que asistirán |
| I | Telefono | Teléfono de contacto |
| J | Email | Email (opcional) |
| K | TimestampFormulario | Fecha/hora del formulario |

## Código Completo Modificado

El archivo `google-apps-script.js` contiene la versión completa modificada de tu código. Los cambios principales son:

1. **Validación mejorada**: Verifica que todos los nuevos campos estén presentes
2. **Estructura de datos expandida**: Incluye todos los nuevos campos en el registro
3. **Logging detallado**: Registra información sobre los nuevos campos
4. **Manejo de timestamps**: Procesa tanto el timestamp del servidor como el del formulario

## Pasos para Implementar

1. **Copia el código modificado** del archivo `google-apps-script.js`
2. **Reemplaza tu código actual** en Google Apps Script
3. **Verifica la estructura de columnas** en tu Google Sheets
4. **Prueba el formulario** para asegurar que los datos se registren correctamente

## Notas Importantes

- **Compatibilidad**: El código mantiene compatibilidad con el sistema anterior
- **Validación**: Se valida que los campos requeridos estén presentes
- **Logging**: Se registra información detallada para debugging
- **Manejo de errores**: Se mantiene el manejo robusto de errores existente

## Pruebas Recomendadas

1. **Formulario completo**: Llena todos los campos y verifica que se guarden
2. **Formulario sin email**: Verifica que funcione sin email (campo opcional)
3. **Validación de pases**: Verifica que el número de nombres coincida con pases utilizados
4. **Datos duplicados**: Verifica que no permita confirmaciones duplicadas 