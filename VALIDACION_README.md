# 🎯 Sistema de Validación de Invitados - Boda A&G

## 📋 Descripción

Este sistema permite validar invitados para la boda de Alejandra y Gerardo utilizando códigos QR únicos. Los invitados pueden verificar su estado, confirmar asistencia y obtener información detallada sobre su reserva.

## 🚀 Características Principales

- ✅ **Validación de Invitados**: Verificación rápida mediante ID único de 6 caracteres
- 📱 **Diseño Responsivo**: Optimizado para dispositivos móviles y desktop
- 🎨 **Interfaz Moderna**: Diseño elegante con animaciones suaves
- 🔄 **Sincronización en Tiempo Real**: Conexión directa con Google Apps Script
- 📊 **Gestión de Estado**: Control de confirmaciones y pases asignados
- 🔒 **Validación Robusta**: Verificación de datos y manejo de errores

## 📁 Estructura de Archivos

```
miBodaGA/
├── validar.html                 # Página principal de validación
├── src/js/
│   ├── validar.js              # Lógica principal del sistema
│   └── validar-config.js       # Configuración y utilidades
├── test-validar-simple.html    # Archivo de pruebas
└── VALIDACION_README.md        # Este archivo
```

## ⚙️ Configuración

### 1. URL del Google Apps Script

**IMPORTANTE**: Debes reemplazar la URL del Google Apps Script en `src/js/validar-config.js`:

```javascript
GOOGLE_APPS_SCRIPT_URL: 'TU_URL_REAL_AQUI'
```

### 2. Estructura de la Base de Datos

El sistema espera que tu Google Apps Script tenga acceso a dos hojas:

- **Invitados**: Información básica de los invitados
- **Confirmaciones**: Estado de confirmación y detalles

## 🧪 Testing

### Archivo de Pruebas

Usa `test-validar-simple.html` para verificar que todo funcione correctamente:

1. Abre el archivo en tu navegador
2. Ejecuta cada test individualmente
3. Verifica que todos los tests pasen

### Tests Disponibles

1. **Configuración**: Verifica que la configuración se cargue correctamente
2. **Funciones de Utilidad**: Comprueba que todas las funciones estén disponibles
3. **Validación de ID**: Test de la función de validación de IDs
4. **Formateo**: Verifica las funciones de formateo de datos
5. **Notificaciones**: Test del sistema de notificaciones
6. **Detección de Dispositivo**: Verifica la detección automática
7. **Test Completo**: Ejecuta todos los tests automáticamente

## 📱 Uso del Sistema

### Para Invitados

1. **Acceder**: Navegar a `validar.html`
2. **Ingresar ID**: Escribir el código de 6 caracteres del QR
3. **Validar**: Hacer clic en "Validar Invitado"
4. **Ver Resultado**: Revisar información y estado de confirmación

### Para Administradores

1. **Monitoreo**: Revisar logs en la consola del navegador
2. **Configuración**: Modificar `validar-config.js` según necesidades
3. **Testing**: Usar archivo de pruebas para verificar funcionalidad

## 🔧 Personalización

### Colores y Estilos

Los colores principales se pueden modificar en `validar-config.js`:

```javascript
COLORS: {
    SUCCESS: '#4CAF50',    // Verde para confirmado
    WARNING: '#ffc107',    // Amarillo para pendiente
    ERROR: '#f44336',      // Rojo para cancelado
    INFO: '#2196F3'        // Azul para información
}
```

### Mensajes del Sistema

Personaliza los mensajes en la sección `MESSAGES`:

```javascript
MESSAGES: {
    LOADING: 'Verificando invitado...',
    SUCCESS: '¡Invitado validado exitosamente!',
    ERROR: 'Error al validar invitado. Intenta nuevamente.',
    // ... más mensajes
}
```

### Configuración de Validación

Ajusta parámetros de validación:

```javascript
VALIDATION: {
    MAX_RETRIES: 3,        // Máximo de reintentos
    TIMEOUT: 10000,        // Timeout en milisegundos
    DEBOUNCE_DELAY: 500    // Delay para evitar spam
}
```

## 📊 Funciones de Utilidad Disponibles

### Validación
- `isValidGuestId(id)`: Valida formato de ID de invitado
- `checkInternetConnection()`: Verifica conexión a internet

### Formateo
- `formatDate(dateString)`: Formatea fechas en español
- `formatNames(names)`: Formatea listas de nombres
- `formatPhone(phone)`: Formatea números de teléfono mexicanos
- `formatEmail(email)`: Valida y formatea emails

### UI
- `showNotification(message, type, duration)`: Muestra notificaciones
- `getStatusColor(status)`: Obtiene color según estado
- `optimizeForMobile()`: Optimiza para dispositivos móviles

### Utilidades
- `debounce(func, wait)`: Implementa debounce para funciones
- `throttle(func, limit)`: Implementa throttle para funciones
- `log(message, type)`: Sistema de logging
- `handleError(error, context)`: Manejo centralizado de errores

## 🚨 Solución de Problemas

### Problemas Comunes

1. **"Configuración no encontrada"**
   - Verifica que `validar-config.js` se cargue antes que `validar.js`
   - Revisa la consola del navegador para errores

2. **"Error al validar invitado"**
   - Verifica la URL del Google Apps Script
   - Comprueba la conexión a internet
   - Revisa los logs en la consola

3. **"Funciones no disponibles"**
   - Ejecuta el archivo de pruebas
   - Verifica que todos los scripts se carguen correctamente

4. **Problemas en móvil**
   - Verifica que `optimizeForMobile()` se ejecute
   - Comprueba la configuración del viewport

### Debugging

1. **Consola del Navegador**: Revisa errores y logs
2. **Archivo de Pruebas**: Ejecuta tests para identificar problemas
3. **Network Tab**: Verifica que las peticiones se envíen correctamente

## 🔄 Actualizaciones

### Versión del Sistema

El sistema incluye un parámetro de versión en el script principal:

```html
<script src="src/js/validar.js?v=1754370293418"></script>
```

**Cambia este número** cada vez que actualices el archivo para evitar problemas de caché.

### Cache Busting

Para forzar la recarga de archivos:

1. Cambia el parámetro `v=` en el script
2. Usa `Ctrl+F5` (Windows) o `Cmd+Shift+R` (Mac) para recarga forzada
3. Limpia el caché del navegador si es necesario

## 📱 Optimización para Móvil

### Características Automáticas

- **Detección de Dispositivo**: Se activa automáticamente
- **Reducción de Animaciones**: Mejora el rendimiento
- **Scroll Táctil**: Optimizado para pantallas táctiles
- **Prevención de Zoom**: Evita zoom accidental en inputs

### Responsive Design

- **Breakpoints**: 480px, 768px, 1024px
- **Orientación**: Soporte para landscape y portrait
- **Touch Targets**: Mínimo 48px para elementos táctiles

## 🔒 Seguridad

### Validación de Entrada

- **Sanitización**: Todos los inputs se validan antes de procesar
- **Formato de ID**: Solo acepta IDs de 6 caracteres alfanuméricos
- **Rate Limiting**: Debounce y throttle para prevenir spam

### Manejo de Errores

- **Try-Catch**: Todas las operaciones críticas están protegidas
- **Logging**: Registro de errores para debugging
- **Fallbacks**: Manejo graceful de errores

## 📈 Rendimiento

### Optimizaciones Implementadas

- **Lazy Loading**: Scripts se cargan solo cuando es necesario
- **Debouncing**: Evita múltiples llamadas simultáneas
- **Throttling**: Limita la frecuencia de ejecución
- **Mobile Optimization**: Reducción de animaciones en dispositivos móviles

### Monitoreo

- **Console Logs**: Información detallada de operaciones
- **Performance Metrics**: Tiempo de respuesta y uso de recursos
- **Error Tracking**: Captura y reporta errores automáticamente

## 🤝 Soporte

### Recursos de Ayuda

1. **Archivo de Pruebas**: `test-validar-simple.html`
2. **Console Logs**: Información detallada en la consola del navegador
3. **Documentación**: Este archivo README

### Contacto

Para soporte técnico o preguntas sobre el sistema, revisa:
- Los logs en la consola del navegador
- El archivo de pruebas para identificar problemas
- La documentación de Google Apps Script

## 📝 Changelog

### v1.0.0 (Actual)
- ✅ Sistema de validación completo
- ✅ Interfaz responsiva y moderna
- ✅ Integración con Google Apps Script
- ✅ Sistema de notificaciones
- ✅ Optimización para móvil
- ✅ Archivo de pruebas completo
- ✅ Documentación detallada

---

**¡El sistema está listo para usar!** 🎉

Recuerda:
1. Configurar la URL del Google Apps Script
2. Probar con el archivo de pruebas
3. Verificar que funcione en dispositivos móviles
4. Monitorear los logs para detectar problemas
