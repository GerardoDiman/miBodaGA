#!/usr/bin/env python3
"""
Script para diagnosticar la estructura de la base de datos de Notion
"""

import os
import json
import requests
from dotenv import load_dotenv

def diagnose_notion_structure():
    """Diagnosticar la estructura de la base de datos de Notion"""
    
    # Cargar configuración
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
    
    NOTION_API_KEY = os.getenv('NOTION_API_KEY')
    NOTION_DATABASE_ID = os.getenv('NOTION_DATABASE_ID')
    
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        print("❌ Configura las variables de entorno NOTION_API_KEY y NOTION_DATABASE_ID")
        return
    
    headers = {
        "Authorization": f"Bearer {NOTION_API_KEY}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
    }
    
    # 1. Obtener información de la base de datos
    print("🔍 Diagnosticando estructura de Notion...")
    print("=" * 60)
    
    try:
        # Obtener propiedades de la base de datos
        db_url = f"https://api.notion.com/v1/databases/{NOTION_DATABASE_ID}"
        response = requests.get(db_url, headers=headers)
        response.raise_for_status()
        
        db_info = response.json()
        properties = db_info.get('properties', {})
        
        print("📋 Propiedades encontradas en la base de datos:")
        print("-" * 40)
        
        for prop_name, prop_info in properties.items():
            prop_type = prop_info.get('type', 'unknown')
            print(f"   📝 {prop_name}: {prop_type}")
            
            # Mostrar detalles específicos para propiedades de texto
            if prop_type == 'rich_text':
                print(f"      └─ Tipo: Rich Text")
            elif prop_type == 'select':
                options = prop_info.get('select', {}).get('options', [])
                print(f"      └─ Opciones: {[opt.get('name') for opt in options]}")
        
        print()
        
        # 2. Verificar si existe la propiedad "Enlace Invitación"
        if 'Enlace Invitación' in properties:
            print("✅ Propiedad 'Enlace Invitación' encontrada")
            link_prop = properties['Enlace Invitación']
            if link_prop.get('type') == 'rich_text':
                print("✅ Tipo correcto (rich_text)")
            else:
                print(f"❌ Tipo incorrecto: {link_prop.get('type')}")
        else:
            print("❌ Propiedad 'Enlace Invitación' NO encontrada")
            print("💡 Necesitas crear esta propiedad en Notion")
        
        # 3. Verificar si existe la propiedad "Tipo de Invitación"
        if 'Tipo de Invitación' in properties:
            print("✅ Propiedad 'Tipo de Invitación' encontrada")
            tipo_prop = properties['Tipo de Invitación']
            if tipo_prop.get('type') == 'select':
                print("✅ Tipo correcto (select)")
                options = tipo_prop.get('select', {}).get('options', [])
                option_names = [opt.get('name') for opt in options]
                print(f"   └─ Opciones: {option_names}")
            else:
                print(f"❌ Tipo incorrecto: {tipo_prop.get('type')}")
        else:
            print("❌ Propiedad 'Tipo de Invitación' NO encontrada")
            print("💡 Necesitas crear esta propiedad en Notion")
        
        print()
        print("=" * 60)
        print("📝 Instrucciones para crear las propiedades:")
        print()
        print("1. Ve a tu base de datos de Notion")
        print("2. Haz clic en 'Add a property'")
        print("3. Crea estas propiedades:")
        print()
        print("   📋 'Tipo de Invitación':")
        print("      - Tipo: Select")
        print("      - Opciones: Completo, Ceremonia")
        print()
        print("   📋 'Enlace Invitación':")
        print("      - Tipo: Text")
        print("      - Propósito: Almacenar enlaces")
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Error accediendo a Notion: {e}")
        return

if __name__ == "__main__":
    diagnose_notion_structure() 