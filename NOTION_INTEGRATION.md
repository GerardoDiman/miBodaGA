# 🔗 Integración con Notion

Esta integración permite sincronizar automáticamente tu base de datos de invitados desde Notion, haciendo que tu invitación sea **completamente dinámica**.

## 🚀 **Ventajas de la Integración**

- ✅ **Actualización en tiempo real** - Los cambios en Notion se reflejan automáticamente
- ✅ **Gestión centralizada** - Administra todos tus invitados desde Notion
- ✅ **Sincronización automática** - Sin intervención manual
- ✅ **Backup automático** - Tus datos están seguros en Notion
- ✅ **Colaboración fácil** - Múltiples personas pueden editar la lista

## 📋 **Configuración Paso a Paso**

### **1. Crear la Base de Datos en Notion**

Crea una nueva base de datos en Notion con esta estructura:

#### **Opción A: Title como ID (Recomendado)**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **ID** (Title) | Text | ID único de 6 caracteres (ej: xnfj1a) |
| **Nombre** | Text | Nombre completo del invitado |
| **Pases** | Número | Cantidad de pases adultos |
| **Niños** | Número | Cantidad de pases para niños |
| **Mesa** | Número | Número de mesa asignada |
| **Email** | Email | Email del invitado |
| **Teléfono** | Teléfono | Teléfono del invitado |
| **Confirmado** | Checkbox | Si ya confirmó asistencia |
| **Fecha Confirmación** | Fecha | Fecha de confirmación |
| **Notas** | Texto | Notas adicionales |
| **QR Generado** | Checkbox | Si ya se generó el QR |
| **Enviado** | Checkbox | Si ya se envió la invitación |

#### **Opción B: Title como Nombre**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **ID** (Title) | Text | Nombre completo del invitado |
| **ID_Alternativo** | Text | ID único de 6 caracteres (ej: xnfj1a) |
| **Pases** | Número | Cantidad de pases adultos |
| **Niños** | Número | Cantidad de pases para niños |
| **Mesa** | Número | Número de mesa asignada |
| **Email** | Email | Email del invitado |
| **Teléfono** | Teléfono | Teléfono del invitado |
| **Confirmado** | Checkbox | Si ya confirmó asistencia |
| **Fecha Confirmación** | Fecha | Fecha de confirmación |
| **Notas** | Texto | Notas adicionales |
| **QR Generado** | Checkbox | Si ya se generó el QR |
| **Enviado** | Checkbox | Si ya se envió la invitación |

### **¿Cuál Opción Elegir?**

**Opción A (Title como ID) - Recomendada:**
- ✅ Más simple y directo
- ✅ Búsqueda rápida por ID
- ✅ Menos columnas
- ✅ Ideal para sistemas con IDs únicos

**Opción B (Title como Nombre):**
- ✅ Más descriptivo
- ✅ Fácil de leer en Notion
- ✅ Búsqueda por nombre
- ✅ Ideal si prefieres ver nombres en la vista principal

### **Paso 2: Configurar las Columnas**

Crea estas columnas exactamente como se muestran:

| Nombre de Columna | Tipo | Configuración |
|-------------------|------|---------------|
| **ID** (Title) | Text | Campo obligatorio |
| **Nombre** | Text | Campo obligatorio |
| **Pases** | Number | Valor por defecto: 1 |
| **Niños** | Number | Valor por defecto: 0 |
| **Mesa** | Number | Valor por defecto: 0 |
| **Email** | Email | Opcional |
| **Teléfono** | Phone | Opcional |
| **Confirmado** | Checkbox | Por defecto: No marcado |
| **Fecha Confirmación** | Date | Opcional |
| **Notas** | Text | Opcional |
| **QR Generado** | Checkbox | Por defecto: No marcado |
| **Enviado** | Checkbox | Por defecto: No marcado |

### **Paso 3: Agregar Datos de Ejemplo**

Agrega algunos invitados de ejemplo:

| ID | Nombre | Pases | Niños | Mesa | Email | Confirmado |
|----|--------|-------|-------|------|-------|------------|
| xnfj1a | Juan Pérez | 2 | 1 | 5 | juan@email.com | ☐ |
| 08wlx8 | María García | 1 | 0 | 3 | maria@email.com | ☐ |
| 0o51gk | Carlos López | 2 | 0 | 7 | carlos@email.com | ☐ |
| 0wggak | Ana Martínez | 1 | 1 | 2 | ana@email.com | ☐ |

### **2. Obtener API Key de Notion**

1. Ve a [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Crea una nueva integración
3. Dale un nombre (ej: "Mi Boda GA")
4. Copia el **Internal Integration Token**

### **3. Obtener Database ID**

1. Abre tu base de datos en Notion
2. Copia la URL
3. El Database ID está en la URL: `https://notion.so/workspace/DATABASE_ID?v=...`

### **4. Configurar Variables de Entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
NOTION_API_KEY=secret_tu_api_key_aqui
NOTION_DATABASE_ID=tu_database_id_aqui
```

### **5. Instalar Dependencias**

```bash
npm run install-notion-deps
```

## 🔧 **Comandos Disponibles**

### **Sincronización Manual**
```bash
npm run sync-notion
```

### **Sincronización Automática**
```bash
npm run sync-notion-auto
```

### **Instalar Dependencias**
```bash
npm run install-notion-deps
```

## 📊 **Flujo de Trabajo**

### **Escenario 1: Agregar Nuevo Invitado**
1. Agrega el invitado en Notion
2. Ejecuta `npm run sync-notion`
3. El invitado aparece automáticamente en tu invitación

### **Escenario 2: Actualizar Datos**
1. Modifica datos en Notion
2. Ejecuta `npm run sync-notion`
3. Los cambios se reflejan inmediatamente

### **Escenario 3: Sincronización Automática**
1. Ejecuta `npm run sync-notion-auto`
2. El script se ejecuta cada 30 minutos automáticamente
3. Los cambios se sincronizan sin intervención

## 🎯 **Estructura de Datos**

### **Entrada (Notion)**
```json
{
  "ID": "xnfj1a",
  "Nombre": "Juan Pérez",
  "Pases": 2,
  "Niños": 1,
  "Mesa": 5,
  "Email": "juan@email.com",
  "Teléfono": "+1234567890",
  "Confirmado": false,
  "Notas": "Alergia a mariscos"
}
```

### **Salida (Tu Sistema)**
```json
{
  "id": "xnfj1a",
  "nombre": "Juan Pérez",
  "pases": 2,
  "ninos": 1,
  "mesa": 5,
  "email": "juan@email.com",
  "telefono": "+1234567890",
  "confirmado": false,
  "notas": "Alergia a mariscos"
}
```

## 🔄 **Sincronización Automática**

### **Configuración de Cron (Linux/Mac)**
```bash
# Sincronizar cada hora
0 * * * * cd /ruta/a/tu/proyecto && npm run sync-notion

# Sincronizar cada 30 minutos
*/30 * * * * cd /ruta/a/tu/proyecto && npm run sync-notion
```

### **Configuración de Task Scheduler (Windows)**
1. Abre Task Scheduler
2. Crea una nueva tarea
3. Programa la ejecución de `npm run sync-notion`
4. Configura para ejecutar cada 30 minutos

## 🛠️ **Solución de Problemas**

### **Error: "API key no válida"**
- Verifica que la API key esté correcta
- Asegúrate de que la integración tenga permisos en la base de datos

### **Error: "Database no encontrado"**
- Verifica el Database ID
- Asegúrate de que la integración tenga acceso a la base de datos

### **Error: "Campos no encontrados"**
- Verifica que la estructura de la base de datos coincida con el esquema
- Ajusta los nombres de los campos en `notion_config.py`

### **Error: "Sin permisos"**
- En Notion, ve a tu base de datos
- Haz clic en "Share" en la esquina superior derecha
- Agrega tu integración con permisos de "Can edit"

## 📱 **Ejemplo de Uso**

### **1. Configurar Notion**
```bash
# Instalar dependencias
npm run install-notion-deps

# Configurar variables de entorno
echo "NOTION_API_KEY=secret_tu_api_key" > .env
echo "NOTION_DATABASE_ID=tu_database_id" >> .env
```

### **2. Probar Sincronización**
```bash
# Sincronización manual
npm run sync-notion

# Verificar archivos actualizados
cat data/invitados.json
```

### **3. Activar Sincronización Automática**
```bash
# Iniciar sincronización automática
npm run sync-notion-auto
```

## 🎉 **Resultado Final**

Con esta integración, tu invitación será **completamente dinámica**:

- ✅ **Cambios en tiempo real** desde Notion
- ✅ **Gestión colaborativa** de invitados
- ✅ **Backup automático** de datos
- ✅ **Sincronización sin intervención**
- ✅ **Escalabilidad** para cualquier cantidad de invitados

**¡Tu invitación se actualizará automáticamente cada vez que modifiques Notion!** 🚀✨ 