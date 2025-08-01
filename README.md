# miBodaGA - Invitación Digital de Boda

Una elegante invitación digital personalizada para la boda de Alejandra y Gerardo, con funcionalidades avanzadas de RSVP, galería interactiva y gestión de invitados.

## 🎯 Características

- **Invitaciones Personalizadas**: Cada invitado recibe un enlace único con su información
- **Sistema de RSVP**: Confirmación en tiempo real con integración a Google Sheets
- **Galería Interactiva**: Presentación de fotos con navegación suave
- **Reproductor de Audio**: Música de fondo con controles de volumen
- **Countdown Timer**: Cuenta regresiva dinámica hasta la fecha del evento
- **Diseño Responsive**: Optimizado para todos los dispositivos
- **Códigos QR**: Generación automática para cada invitado
- **Múltiples Opciones de RSVP**: WhatsApp, llamada telefónica y confirmación web

## 🚀 Instalación y Configuración

### Prerrequisitos
- Python 3.7+
- Node.js 16+ (para desarrollo y testing)
- Navegador web moderno
- Cuenta de Google (para Google Apps Script)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd miBodaGA
   ```

2. **Instalar dependencias**
   ```bash
   # Dependencias de Node.js (desarrollo)
   npm install
   
   # Dependencias de Python
   pip install qrcode pillow
   ```

3. **Configurar datos de invitados**
   - Coloca tu archivo `invitados.csv` en la carpeta `data/`
   - El CSV debe tener las columnas: `Nombre`, `Pases`, `Pases N`

4. **Generar invitados y códigos QR**
   ```bash
   npm run generate-invitados
   # O manualmente:
   cd src/python
   python convertir_csv.py
   ```

5. **Configurar Google Apps Script**
   - Crea un nuevo proyecto en [Google Apps Script](https://script.google.com/)
   - Copia el código del archivo `google-apps-script.js`
   - Configura la URL de tu sitio web en el script
   - Despliega como aplicación web

6. **Desplegar el sitio**
   - Sube los archivos a tu hosting (Netlify, Vercel, etc.)
   - Actualiza la URL en `src/python/convertir_csv.py`
   - Actualiza la URL en `src/js/invitation.js`

## 📁 Estructura del Proyecto

```
miBodaGA/
├── index.html              # Página principal
├── data/
│   ├── invitados.csv       # Lista de invitados (input)
│   └── invitados.json      # Datos procesados (output)
├── qrcodes/               # Códigos QR generados
├── assets/
│   ├── images/            # Imágenes del sitio
│   ├── audio/             # Archivos de audio
│   └── fonts/             # Fuentes personalizadas
├── src/
│   ├── css/
│   │   ├── styles.css     # CSS principal
│   │   └── sections/      # Módulos CSS
│   ├── js/
│   │   ├── invitation.js  # Lógica de invitados
│   │   ├── gallery.js     # Galería interactiva
│   │   ├── countdown.js   # Timer de cuenta regresiva
│   │   └── player.js      # Reproductor de audio
│   └── python/
│       └── convertir_csv.py # Script de procesamiento
└── README.md
```

## 🔧 Configuración

### Variables Importantes

En `src/python/convertir_csv.py`:
```python
BASE_VALIDATION_URL = 'https://tu-sitio.com/validar.html'
```

En `src/js/invitation.js`:
```javascript
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/TU_SCRIPT_ID/exec';
```

### Formato del CSV de Invitados

```csv
Nombre,Pases,Pases N
"Juan Pérez",2,0
"María García",3,1
```

## 🎨 Personalización

### Colores y Estilos
- Edita `src/css/sections/_base.css` para cambiar colores principales
- Modifica `src/css/sections/_backgrounds.css` para fondos personalizados

### Contenido
- Actualiza `index.html` con tu información personal
- Reemplaza imágenes en `assets/images/`
- Cambia el audio en `assets/audio/`

## 📱 Uso

### Para Invitados
1. Reciben un enlace único: `https://tu-sitio.com/?invitado=ID_UNICO`
2. Ven su información personalizada
3. Confirman asistencia con un clic
4. Reciben un código QR para el evento

### Para Organizadores
1. Monitorean confirmaciones en Google Sheets
2. Generan nuevos invitados con el script Python
3. Actualizan información desde el panel de control

## 🛠️ Desarrollo

### Scripts Disponibles
```bash
# Servidor de desarrollo
npm run dev

# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage

# Linting del código
npm run lint

# Formatear código
npm run format

# Generar invitados desde CSV
npm run generate-invitados
```

### Agregar Nuevas Funcionalidades
1. Crea nuevos módulos CSS en `src/css/sections/`
2. Añade JavaScript en `src/js/`
3. Actualiza `index.html` con nuevas secciones
4. Ejecuta tests: `npm test`
5. Verifica linting: `npm run lint`

### Testing
```bash
# Servidor local para desarrollo
npm run dev
# O manualmente:
python -m http.server 8000
```

## 📊 Funcionalidades Técnicas

- **SEO Optimizado**: Meta tags completos, Open Graph, sitemap.xml, robots.txt
- **Performance**: Lazy loading, preload de recursos críticos, Service Worker
- **Accesibilidad**: ARIA labels, navegación por teclado, mejor contraste, skip links
- **PWA**: Manifest, Service Worker, instalación offline, notificaciones push
- **Testing**: Tests unitarios con Jest, cobertura de código
- **Code Quality**: ESLint, Prettier, formateo automático
- **Seguridad**: Validación de datos, sanitización de inputs
- **Escalabilidad**: Arquitectura modular, fácil mantenimiento

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado para uso personal. Todos los derechos reservados.

## 👥 Autores

- **Alejandra & Gerardo** - Desarrollo inicial
- **Contribuidores** - Mejoras y funcionalidades adicionales

## 🙏 Agradecimientos

- Google Apps Script para la integración de RSVP
- Font Awesome para los iconos
- Google Fonts para las tipografías
- QRCode.js para la generación de códigos QR

---

**Fecha del Evento**: 11 de Octubre de 2025  
**Ubicación**: Comitán de Domínguez, Chiapas, México
