#!/usr/bin/env python3
"""
Configuración para integración con Notion
"""

import os
from pathlib import Path

# Configuración de Notion
NOTION_API_KEY = os.getenv('NOTION_API_KEY', '')
NOTION_DATABASE_ID = os.getenv('NOTION_DATABASE_ID', '')

# Estructura esperada de la base de datos de Notion
NOTION_DATABASE_SCHEMA = {
    # Title (automático) - Puede ser ID o Nombre
    'ID': 'title',                 # Propiedad automática de Notion - ID único
    
    # Opción 1: Si Title es ID, necesitas esta columna
    'Nombre': 'rich_text',         # Nombre completo del invitado
    
    # Opción 2: Si Title es Nombre, necesitas esta columna  
    'ID_Alternativo': 'rich_text', # ID único del invitado (6 caracteres)
    
    # Campos comunes
    'Pases': 'number',             # Número de pases adultos
    'Niños': 'number',             # Número de pases para niños
    'Mesa': 'number',              # Número de mesa asignada
    'Email': 'email',              # Email del invitado
    'Teléfono': 'phone_number',    # Teléfono del invitado
    'Confirmado': 'checkbox',      # Si ya confirmó asistencia
    'Fecha Confirmación': 'date',  # Fecha de confirmación
    'Notas': 'rich_text',          # Notas adicionales
    'QR Generado': 'checkbox',     # Si ya se generó el QR
    'Enviado': 'checkbox'          # Si ya se envió la invitación
}

# Configuración de Title
TITLE_CONFIG = {
    'use_as_id': True,            # True = Title es ID, False = Title es Nombre
    'name': 'Name'                # Nombre de la propiedad Title (normalmente 'Name')
}

# Mapeo de campos de Notion a tu sistema
FIELD_MAPPING = {
    'notion_field': 'your_field',
    'ID': 'id',
    'Nombre': 'nombre',
    'Pases': 'pases',
    'Niños': 'ninos',
    'Email': 'email',
    'Teléfono': 'telefono',
    'Confirmado': 'confirmado',
    'Fecha Confirmación': 'fecha_confirmacion',
    'Notas': 'notas'
}

def validate_config():
    """Validar que la configuración esté completa"""
    errors = []
    
    if not NOTION_API_KEY:
        errors.append("NOTION_API_KEY no está configurada")
    
    if not NOTION_DATABASE_ID:
        errors.append("NOTION_DATABASE_ID no está configurada")
    
    return errors

def get_config():
    """Obtener configuración completa"""
    return {
        'api_key': NOTION_API_KEY,
        'database_id': NOTION_DATABASE_ID,
        'schema': NOTION_DATABASE_SCHEMA,
        'field_mapping': FIELD_MAPPING
    } 