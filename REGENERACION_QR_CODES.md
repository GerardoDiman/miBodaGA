# Regeneración de Códigos QR para Invitados

## Resumen

Este proceso te permite regenerar completamente los códigos QR y datos de invitados para tu sitio web de boda. Es útil cuando:

- Has actualizado el Google Apps Script
- Quieres cambiar la estructura de datos
- Necesitas nuevos IDs para los invitados
- Los códigos QR actuales tienen problemas

## Archivos Creados

### 1. `src/python/generate_qr_codes.py`
**Propósito**: Script principal para generar códigos QR y JSON de invitados
- Lee el archivo CSV de invitados
- Genera IDs únicos para cada invitado
- Crea códigos QR que apuntan a tu sitio web
- Genera el archivo JSON con todos los datos

### 2. `src/python/clean_qr_codes.py`
**Propósito**: Limpia códigos QR y archivos JSON existentes
- Elimina todos los códigos QR antiguos
- Borra el archivo JSON de invitados
- Prepara el sistema para regeneración

### 3. `src/python/regenerate_all.py`
**Propósito**: Script principal que combina limpieza y regeneración
- Ejecuta automáticamente ambos scripts
- Maneja errores y muestra progreso
- Proporciona resumen final

## Configuración Requerida

### 1. URL de tu sitio web
Edita el archivo `src/python/generate_qr_codes.py` y cambia:
```python
BASE_VALIDATION_URL = 'https://mibodaag.netlify.app/validar.html'
```
Por la URL correcta de tu sitio web.

### 2. Estructura del CSV
Tu archivo `data/invitados.csv` debe tener estas columnas:
```csv
nombre,pases,ninos
Familia García López,4,1
María González,2,0
Carlos Rodríguez,1,0
```

### 3. Dependencias Python
Asegúrate de tener instalado:
```bash
pip install qrcode pillow
```

## Proceso de Regeneración

### Opción 1: Proceso Automático (Recomendado)
```bash
python src/python/regenerate_all.py
```

Este script:
1. ✅ Limpia códigos QR existentes
2. ✅ Elimina archivo JSON
3. ✅ Regenera códigos QR con nuevos IDs
4. ✅ Crea nuevo archivo JSON
5. ✅ Muestra resumen final

### Opción 2: Proceso Manual
```bash
# Paso 1: Limpiar
python src/python/clean_qr_codes.py

# Paso 2: Generar nuevos códigos
python src/python/generate_qr_codes.py
```

## Estructura de Archivos Generados

### Códigos QR
- **Ubicación**: `qrcodes/`
- **Formato**: `{id}.png`
- **Ejemplo**: `abc123.png`, `def456.png`

### Archivo JSON
- **Ubicación**: `data/invitados.json`
- **Estructura**:
```json
[
  {
    "id": "abc123",
    "nombre": "Familia García López",
    "pases": 4,
    "ninos": 1,
    "mesa": 0,
    "email": "",
    "telefono": "",
    "confirmado": false,
    "fecha_confirmacion": null,
    "notas": ""
  }
]
```

## URLs de Validación

Los códigos QR generados apuntan a URLs como:
```
https://mibodaag.netlify.app/validar.html?id=abc123
```

Donde `abc123` es el ID único del invitado.

## Pasos Después de la Regeneración

### 1. Subir archivos al sitio web
- Sube `data/invitados.json` a tu sitio
- Sube todos los archivos de `qrcodes/` a tu sitio

### 2. Probar la validación
- Escanea un código QR generado
- Verifica que llegue a la página correcta
- Prueba el formulario RSVP

### 3. Distribuir códigos QR
- Imprime los códigos QR
- Envíalos a tus invitados
- Los códigos antiguos ya no funcionarán

## Solución de Problemas

### Error: "No se encontró el archivo CSV"
- Verifica que `data/invitados.csv` existe
- Asegúrate de que tenga la estructura correcta

### Error: "URL incorrecta"
- Edita `BASE_VALIDATION_URL` en `generate_qr_codes.py`
- Verifica que la URL sea accesible

### Error: "Dependencias faltantes"
```bash
pip install qrcode pillow
```

### Códigos QR no se generan
- Verifica permisos de escritura en la carpeta `qrcodes/`
- Asegúrate de que Python tenga acceso al directorio

## Notas Importantes

⚠️ **ADVERTENCIAS**:
- Los códigos QR antiguos dejarán de funcionar
- Los nuevos IDs serán diferentes
- Necesitas actualizar tu sitio web con los nuevos archivos
- Haz una copia de seguridad antes de regenerar

✅ **BENEFICIOS**:
- IDs únicos y seguros
- Códigos QR optimizados
- Estructura de datos consistente
- Compatibilidad con el nuevo Google Apps Script

## Comandos Útiles

```bash
# Verificar estructura de archivos
ls -la data/
ls -la qrcodes/

# Contar códigos QR generados
ls qrcodes/*.png | wc -l

# Ver contenido del JSON
cat data/invitados.json

# Probar un código QR específico
python -c "import qrcode; qr = qrcode.QRCode(); qr.add_data('https://mibodaag.netlify.app/validar.html?id=test'); qr.make(); img = qr.make_image(); img.save('test.png')"
``` 