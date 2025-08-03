# Sistema de Tipos de Invitación

## Configuración en Notion

### 1. Agregar Propiedades en Notion

En tu base de datos de Notion, agrega estas propiedades:

#### Propiedad "Tipo de Invitación"
- **Nombre**: `Tipo de Invitación`
- **Tipo**: `Select`
- **Opciones**:
  - `Completo` (incluye Tornaboda)
  - `Ceremonia` (solo ceremonia)

#### Propiedad "Enlace Invitación"
- **Nombre**: `Enlace Invitación`
- **Tipo**: `Text`
- **Propósito**: Almacenar el enlace específico según el tipo

### 2. Configurar Invitados

Para cada invitado, selecciona el tipo apropiado:

#### Invitados "Completo" (index.html)
- Familia cercana
- Amigos íntimos
- Padrinos y madrinas
- Personas que quieren ir a todo el evento

#### Invitados "Ceremonia" (ceremonia.html)
- Compañeros de trabajo
- Conocidos
- Familia extendida
- Personas que prefieren eventos más cortos

## Sistema de Enlaces

### QR Codes (Validación)
Los QR codes siempre apuntan a la página de validación:
- **URL**: `https://mibodaag.netlify.app/validar.html?id=ABC123`
- **Propósito**: Validar entrada al evento

### Enlaces de Invitación
Los enlaces de invitación se generan según el tipo:

- **Completo**: `https://mibodaag.netlify.app/?id=ABC123`
- **Ceremonia**: `https://mibodaag.netlify.app/ceremonia.html?id=ABC123`

### Generar Enlaces (Solo mostrar)
```bash
cd src/python
python generate_invitation_links.py
```

### Actualizar Enlaces en Notion (Automático)
```bash
cd src/python
python update_notion_links.py
```

## Estructura de Datos

Los invitados ahora incluyen los campos `tipo_invitacion` y `enlace_invitacion`:

```json
{
  "id": "ABC123",
  "nombre": "Juan Pérez",
  "pases": 2,
  "ninos": 0,
  "mesa": 5,
  "tipo_invitacion": "Completo",
  "enlace_invitacion": "https://mibodaag.netlify.app/?id=ABC123"
}
```

## URLs Generadas

### Invitación Completa
- URL: `https://mibodaag.netlify.app/?id=ABC123`
- Incluye: Ceremonia, Recepción, Tornaboda

### Invitación Ceremonia
- URL: `https://mibodaag.netlify.app/ceremonia.html?id=ABC123`
- Incluye: Solo Ceremonia y Recepción

## Ventajas del Sistema

1. **Control de costos** - Menos gente en la Tornaboda
2. **Experiencia personalizada** - Cada invitado ve solo lo relevante
3. **Flexibilidad** - Puedes cambiar el tipo según las circunstancias
4. **Organización clara** - Sabes exactamente quién va a qué

## Comandos Útiles

```bash
# Sincronizar desde Notion (incluye generación de QR)
python notion_integration.py

# Generar enlaces de invitación (solo mostrar)
python generate_invitation_links.py

# Actualizar enlaces en Notion (automático)
python update_notion_links.py

# Verificar configuración
python notion_config.py
``` 