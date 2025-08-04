#!/usr/bin/env node

// Script para generar versiones automáticas y actualizar archivos HTML
const fs = require('fs');
const path = require('path');

// Generar timestamp para cache busting
const timestamp = Date.now();
const version = `2.0.${timestamp}`;

console.log(`🔄 Generando nueva versión: ${version}`);

// Archivos HTML a actualizar
const htmlFiles = ['index.html', 'ceremonia.html', 'validar.html'];

// Función para actualizar versiones en archivos HTML
function updateHtmlVersions(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Actualizar CSS
        content = content.replace(
            /href="src\/css\/styles\.css\?v=[^"]*"/g,
            `href="src/css/styles.css?v=${timestamp}"`
        );
        
        // Actualizar JS files
        content = content.replace(
            /src="src\/js\/([^"]*\.js)\?v=[^"]*"/g,
            `src="src/js/$1?v=${timestamp}"`
        );
        
        // Si no tienen versioning, agregarlo
        if (!content.includes('?v=')) {
            content = content.replace(
                /href="src\/css\/styles\.css"/g,
                `href="src/css/styles.css?v=${timestamp}"`
            );
            
            content = content.replace(
                /src="src\/js\/([^"]*\.js)"/g,
                `src="src/js/$1?v=${timestamp}"`
            );
        }
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Actualizado: ${filePath}`);
    } catch (error) {
        console.error(`❌ Error actualizando ${filePath}:`, error.message);
    }
}

// Actualizar service worker version
function updateServiceWorkerVersion() {
    try {
        let content = fs.readFileSync('sw.js', 'utf8');
        content = content.replace(
            /const VERSION = '[^']*';/,
            `const VERSION = '${version}';`
        );
        fs.writeFileSync('sw.js', content);
        console.log(`✅ Service Worker actualizado con versión: ${version}`);
    } catch (error) {
        console.error('❌ Error actualizando service worker:', error.message);
    }
}

// Ejecutar actualizaciones
htmlFiles.forEach(updateHtmlVersions);
updateServiceWorkerVersion();

// Crear archivo de versión para referencia
const versionInfo = {
    version: version,
    timestamp: timestamp,
    generated: new Date().toISOString(),
    files_updated: htmlFiles.concat(['sw.js'])
};

fs.writeFileSync('version.json', JSON.stringify(versionInfo, null, 2));
console.log(`📝 Información de versión guardada en version.json`);
console.log(`🚀 ¡Listo! Nueva versión ${version} generada`);