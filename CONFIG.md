# 📋 Configuración del Proyecto - miBodaGA

## 🏗️ Estructura del Proyecto

```
miBodaGA/
├── index.html                 # Página principal
├── validar.html              # Página de validación de invitados
├── manifest.json             # Configuración PWA
├── sw.js                     # Service Worker
├── package.json              # Dependencias y scripts
├── CONFIG.md                 # Este archivo
├── README.md                 # Documentación principal
├── assets/                   # Recursos estáticos
│   ├── audio/               # Archivos de audio
│   ├── fonts/               # Fuentes personalizadas
│   └── images/              # Imágenes del proyecto
├── data/                    # Datos de invitados
│   ├── invitados.csv        # Lista de invitados
│   └── invitados.json       # Datos en formato JSON
├── qrcodes/                 # Códigos QR generados
├── src/                     # Código fuente
│   ├── css/                 # Estilos CSS
│   │   ├── styles.css       # Archivo principal de estilos
│   │   ├── styles.min.css   # Versión minificada
│   │   └── sections/        # Estilos por sección
│   ├── js/                  # JavaScript
│   │   ├── main.js          # Funcionalidades principales
│   │   ├── animations.js    # Animaciones
│   │   ├── countdown.js     # Contador regresivo
│   │   ├── gallery.js       # Galería de fotos
│   │   ├── invitation.js    # Sistema de invitaciones
│   │   ├── player.js        # Reproductor de audio
│   │   ├── pwa.js           # Funcionalidades PWA
│   │   └── validar.js       # Validación de invitados
│   └── python/              # Scripts de Python
│       └── convertir_csv.py # Conversión de datos
└── tests/                   # Pruebas unitarias
    ├── setup.js             # Configuración de pruebas
    └── test_invitation.js   # Pruebas del sistema de invitaciones
```

## 🎨 Sistema de Estilos CSS

### Organización por Secciones:
- `_base.css` - Variables, reset y utilidades base
- `_utilities.css` - Clases utilitarias
- `_accessibility.css` - Accesibilidad y navegación por teclado
- `_audio.css` - Controles de audio
- `_layout.css` - Estructura y layout principal
- `_backgrounds.css` - Fondos y efectos visuales
- `_header.css` - Encabezado y navegación
- `_footer.css` - Pie de página
- `_galeria.css` - Galería de fotos
- `_detalles.css` - Sección de detalles
- `_itinerario.css` - Itinerario de eventos
- `_dresscode.css` - Código de vestimenta
- `_dresscodeblock.css` - Bloque de código de vestimenta
- `_ubicaciones.css` - Ubicaciones y mapas
- `_regalos.css` - Sección de regalos
- `_rsvp.css` - Sistema RSVP
- `_gift-title-fix.css` - Fix específico para título de regalos
- `_social.css` - Redes sociales y hashtag
- `_hospedaje.css` - Información de hospedaje
- `_parents.css` - Sección de padres
- `_sponsors.css` - Patrocinadores
- `_final.css` - Sección final
- `_moneyshower.css` - Lluvia de sobres
- `_animations.css` - Animaciones y efectos
- `_mediaqueries.css` - Media queries responsivas

## 🔧 Configuración de Desarrollo

### Scripts Disponibles:
```bash
npm run dev              # Servidor de desarrollo (puerto 8000)
npm run build            # Construcción del proyecto
npm run test             # Ejecutar pruebas
npm run test:watch       # Pruebas en modo watch
npm run test:coverage    # Pruebas con cobertura
npm run lint             # Linting del código
npm run format           # Formateo del código
npm run generate-invitados # Generar datos de invitados
```

### Dependencias Principales:
- **qrcode**: Generación de códigos QR
- **eslint**: Linting de JavaScript
- **jest**: Framework de pruebas
- **prettier**: Formateo de código

## 📱 Funcionalidades PWA

### Características:
- ✅ Instalable como aplicación
- ✅ Funcionamiento offline
- ✅ Notificaciones push
- ✅ Sincronización en segundo plano
- ✅ Actualizaciones automáticas

### Archivos PWA:
- `manifest.json` - Configuración de la aplicación
- `sw.js` - Service Worker
- `src/js/pwa.js` - Funcionalidades PWA

## 🎵 Sistema de Audio

### Características:
- ✅ Reproducción automática (con consentimiento)
- ✅ Controles de volumen
- ✅ Botón de silencio
- ✅ Indicador visual de estado
- ✅ Persistencia de preferencias

## 📊 Sistema de Invitaciones

### Funcionalidades:
- ✅ Generación de códigos QR únicos
- ✅ Validación de invitados
- ✅ Sistema RSVP
- ✅ Integración con WhatsApp
- ✅ Llamadas telefónicas directas

### Archivos de Datos:
- `data/invitados.csv` - Lista principal de invitados
- `data/invitados.json` - Datos procesados
- `qrcodes/` - Códigos QR generados

## 🖼️ Galería de Fotos

### Características:
- ✅ Navegación con flechas
- ✅ Indicadores de posición
- ✅ Navegación por teclado
- ✅ Responsive design
- ✅ Animaciones suaves

## 📱 Responsive Design

### Breakpoints:
- **Desktop**: > 768px
- **Tablet**: 481px - 768px
- **Mobile**: ≤ 480px
- **Small Mobile**: ≤ 375px
- **Tiny Mobile**: ≤ 320px

### Características:
- ✅ Diseño mobile-first
- ✅ Imágenes adaptativas
- ✅ Tipografía escalable
- ✅ Navegación optimizada

## ♿ Accesibilidad

### Características:
- ✅ Navegación por teclado
- ✅ Etiquetas ARIA
- ✅ Contraste de colores
- ✅ Textos alternativos
- ✅ Reducción de movimiento

## 🧪 Testing

### Cobertura de Pruebas:
- ✅ Sistema de invitaciones
- ✅ Generación de QR
- ✅ Validación de datos
- ✅ Funcionalidades PWA

### Ejecutar Pruebas:
```bash
npm test                    # Todas las pruebas
npm run test:watch         # Modo watch
npm run test:coverage      # Con cobertura
```

## 🚀 Despliegue

### Opciones de Hosting:
1. **GitHub Pages** - Gratuito, fácil configuración
2. **Netlify** - Despliegue automático, funciones serverless
3. **Vercel** - Optimizado para PWA
4. **Firebase Hosting** - Integración con Google

### Pasos para Despliegue:
1. Construir el proyecto: `npm run build`
2. Subir archivos al hosting
3. Configurar HTTPS (requerido para PWA)
4. Verificar manifest.json y service worker

## 🔒 Seguridad

### Consideraciones:
- ✅ Validación de datos en cliente y servidor
- ✅ Sanitización de inputs
- ✅ HTTPS obligatorio para PWA
- ✅ Headers de seguridad
- ✅ Protección contra XSS

## 📈 Optimización

### Performance:
- ✅ Lazy loading de imágenes
- ✅ Minificación de CSS/JS
- ✅ Compresión de assets
- ✅ Caching optimizado
- ✅ Service Worker para offline

### SEO:
- ✅ Meta tags optimizados
- ✅ Sitemap.xml
- ✅ Robots.txt
- ✅ Estructura semántica
- ✅ Open Graph tags

## 🛠️ Mantenimiento

### Tareas Regulares:
- ✅ Actualizar dependencias
- ✅ Revisar logs de errores
- ✅ Verificar funcionalidades PWA
- ✅ Optimizar imágenes
- ✅ Actualizar datos de invitados

### Monitoreo:
- ✅ Analytics de uso
- ✅ Errores de JavaScript
- ✅ Performance metrics
- ✅ Uptime monitoring

---

**Última actualización**: Diciembre 2024
**Versión**: 1.0.0
**Autor**: Alejandra & Gerardo 