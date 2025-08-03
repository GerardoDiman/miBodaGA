# 🎭 Procesador Completo de Invitados desde Notion

Este script automatiza completamente el proceso de generar IDs únicos y QR codes para tus invitados desde Notion.

## 🚀 **¿Qué hace este script?**

1. **📥 Obtiene invitados desde Notion** (sin IDs)
2. **🎯 Genera IDs únicos** de 6 caracteres alfanuméricos
3. **📤 Actualiza Notion** con los nuevos IDs
4. **📱 Genera QR codes** automáticamente
5. **💾 Sincroniza archivos locales** (JSON)

## 📋 **Requisitos Previos**

### 1. Configurar Notion
- ✅ Base de datos creada en Notion
- ✅ Invitados agregados (sin IDs)
- ✅ API Key configurada
- ✅ Database ID configurado

### 2. Configurar Variables de Entorno
Crea o edita el archivo `.env`:
```env
NOTION_API_KEY=secret_tu_api_key_real_aqui
NOTION_DATABASE_ID=tu_database_id_real_aqui
```

### 3. Instalar Dependencias
```bash
npm run install-notion-deps
```

## 🎯 **Estructura de Base de Datos en Notion**

Tu base de datos debe tener estas columnas:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **ID** (Title) | Text | **VACÍO** - Se llenará automáticamente |
| **Nombre** | Text | Nombre completo del invitado |
| **Pases** | Número | Cantidad de pases adultos |
| **Niños** | Número | Cantidad de pases para niños |
| **Mesa** | Número | Número de mesa asignada |
| **Email** | Email | Email del invitado |
| **Teléfono** | Teléfono | Teléfono del invitado |
| **Notas** | Texto | Notas adicionales |

## 🚀 **Ejecutar el Proceso**

### Opción 1: Comando npm (Recomendado)
```bash
npm run process-notion-guests
```

### Opción 2: Ejecutar directamente
```bash
python src/python/process_notion_guests.py
```

## 📊 **Proceso Paso a Paso**

### **Paso 1: Obtener Invitados desde Notion**
```
📥 Obteniendo invitados desde Notion...
✅ Encontrados 15 invitados sin ID
```

### **Paso 2: Generar IDs Únicos**
```
🎯 Generando IDs únicos...
🔍 Verificando IDs existentes...
📊 Encontrados 0 IDs existentes
✅ Generados 15 IDs únicos
```

### **Paso 3: Actualizar Notion**
```
📤 Actualizando Notion con IDs...
  ✅ Juan Pérez → xnfj1a
  ✅ María García → 08wlx8
  ✅ Carlos López → 0o51gk
  ...
✅ Actualizados 15 invitados en Notion
```

### **Paso 4: Generar QR Codes**
```
📱 Generando QR codes...
  ✅ QR generado: xnfj1a.png
  ✅ QR generado: 08wlx8.png
  ✅ QR generado: 0o51gk.png
  ...
✅ Generados 15 QR codes nuevos
```

### **Paso 5: Sincronizar Archivos Locales**
```
💾 Sincronizando a archivos locales...
✅ Archivo JSON actualizado: data/invitados.json
📊 Total de invitados: 15
```

## 📋 **Resultado Final**

### **En Notion:**
- ✅ Todos los invitados tienen IDs únicos
- ✅ Los IDs son de 6 caracteres alfanuméricos
- ✅ No hay duplicados

### **En tu Proyecto:**
- ✅ Archivo `data/invitados.json` actualizado
- ✅ QR codes generados en `qrcodes/`
- ✅ Listo para sincronizar con tu sitio web

## 🔧 **Comandos Útiles**

```bash
# Procesar invitados desde Notion
npm run process-notion-guests

# Sincronizar solo desde Notion (sin procesar)
npm run sync-notion

# Generar QR codes manualmente
npm run generate-qr

# Limpiar QR codes existentes
npm run clean-qr
```

## ⚠️ **Notas Importantes**

### **Antes de Ejecutar:**
- ✅ Verifica que tu base de datos de Notion tenga la estructura correcta
- ✅ Asegúrate de que los invitados NO tengan IDs (campo ID vacío)
- ✅ Confirma que tu API Key y Database ID estén correctos

### **Durante la Ejecución:**
- ⏱️ El proceso puede tomar varios minutos dependiendo del número de invitados
- 🔄 Se hace una pausa entre actualizaciones para evitar rate limiting
- 📊 Se muestran progresos detallados en tiempo real

### **Después de la Ejecución:**
- ✅ Verifica que los IDs se agregaron correctamente en Notion
- ✅ Revisa los QR codes generados en la carpeta `qrcodes/`
- ✅ Prueba la validación con uno de los QR codes

## 🛠️ **Solución de Problemas**

### **Error: "No se encontraron invitados para procesar"**
- Verifica que los invitados en Notion NO tengan IDs
- Confirma que el campo "Nombre" esté lleno
- Revisa que la estructura de la base de datos sea correcta

### **Error: "API key no válida"**
- Verifica que `NOTION_API_KEY` esté correcta en `.env`
- Asegúrate de que la integración tenga permisos en la base de datos

### **Error: "Database no encontrado"**
- Verifica que `NOTION_DATABASE_ID` esté correcto en `.env`
- Confirma que la integración tenga acceso a la base de datos

### **Error: "Rate limit exceeded"**
- El script incluye pausas automáticas
- Si persiste, espera unos minutos y ejecuta nuevamente

## 📈 **Ejemplo de Uso Completo**

```bash
# 1. Configurar variables de entorno
echo "NOTION_API_KEY=secret_tu_api_key" > .env
echo "NOTION_DATABASE_ID=tu_database_id" >> .env

# 2. Instalar dependencias
npm run install-notion-deps

# 3. Ejecutar procesamiento completo
npm run process-notion-guests

# 4. Verificar resultados
ls qrcodes/
cat data/invitados.json
```

## 🎉 **Resultado Esperado**

Después de ejecutar el script, tendrás:

- ✅ **15 invitados** con IDs únicos en Notion
- ✅ **15 QR codes** generados en `qrcodes/`
- ✅ **Archivo JSON** actualizado con todos los datos
- ✅ **Sistema listo** para sincronizar con tu sitio web

**¡Tu invitación estará completamente lista para distribuir!** 🚀✨ 