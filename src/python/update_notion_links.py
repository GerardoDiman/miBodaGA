#!/usr/bin/env python3
"""
Script para actualizar automáticamente los enlaces de invitación en Notion
"""

import os
import json
import requests
from notion_integration import NotionIntegration
from dotenv import load_dotenv

class NotionLinkUpdater:
    def __init__(self, api_key, database_id):
        self.api_key = api_key
        self.database_id = database_id
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        }
    
    def update_invitation_links(self):
        """Actualizar enlaces de invitación en Notion"""
        
        # Obtener datos actuales
        notion = NotionIntegration(self.api_key, self.database_id)
        notion_data = notion.get_database()
        
        if not notion_data:
            print("❌ No se pudieron obtener datos de Notion")
            return
        
        guests = notion.parse_guest_data(notion_data)
        if not guests:
            print("❌ No se encontraron invitados")
            return
        
        print("🔗 Actualizando enlaces de invitación en Notion...")
        print("=" * 60)
        
        updated_count = 0
        error_count = 0
        
        for page in notion_data.get('results', []):
            page_id = page['id']
            properties = page.get('properties', {})
            
            # Extraer datos del invitado
            guest_id = self._extract_guest_id(properties)
            guest_name = self._extract_guest_name(properties)
            tipo_invitacion = self._extract_select(properties.get('Tipo de Invitación', {}))
            current_link = self._extract_text(properties.get('Enlace Invitación', {}))
            
            if not guest_id or not guest_name:
                continue
            
            # Generar nuevo enlace según tipo
            if tipo_invitacion == 'Ceremonia':
                new_link = f"https://boda-alegera.com/ceremonia.html?id={guest_id}"
            else:
                new_link = f"https://boda-alegera.com/?id={guest_id}"
            
            # Solo actualizar si el enlace es diferente
            if current_link != new_link:
                success = self._update_page_property(page_id, 'Enlace Invitación', new_link)
                
                if success:
                    print(f"✅ {guest_name} - {new_link}")
                    updated_count += 1
                else:
                    print(f"❌ Error actualizando {guest_name}")
                    error_count += 1
        
        print("=" * 60)
        print(f"📊 Resumen:")
        print(f"   ✅ Enlaces actualizados: {updated_count}")
        print(f"   ❌ Errores: {error_count}")
        print(f"   📈 Total procesados: {len(guests)}")
    
    def _extract_guest_id(self, properties):
        """Extraer ID del invitado"""
        title_property = properties.get('ID', {})
        if title_property.get('type') == 'title':
            title_array = title_property.get('title', [])
            if title_array:
                return title_array[0].get('plain_text', '')
        return ""
    
    def _extract_guest_name(self, properties):
        """Extraer nombre del invitado"""
        # Buscar en la propiedad "Nombre"
        nombre_prop = properties.get('Nombre', {})
        if nombre_prop.get('type') == 'rich_text':
            rich_text = nombre_prop.get('rich_text', [])
            if rich_text:
                return rich_text[0].get('plain_text', '')
        
        # Si no hay propiedad "Nombre", buscar en el título
        title_property = properties.get('ID', {})
        if title_property.get('type') == 'title':
            title_array = title_property.get('title', [])
            if title_array:
                return title_array[0].get('plain_text', '')
        return ""
    
    def _extract_guest_name(self, properties):
        """Extraer nombre del invitado"""
        # Buscar en la propiedad "Nombre"
        nombre_prop = properties.get('Nombre', {})
        if nombre_prop.get('type') == 'rich_text':
            rich_text = nombre_prop.get('rich_text', [])
            if rich_text:
                return rich_text[0].get('plain_text', '')
        
        # Si no hay propiedad "Nombre", buscar en el título
        title_property = properties.get('ID', {})
        if title_property.get('type') == 'title':
            title_array = title_property.get('title', [])
            if title_array:
                return title_array[0].get('plain_text', '')
        return ""
    
    def _extract_text(self, property_data):
        """Extraer texto de una propiedad de Notion"""
        if not property_data:
            return ""
        
        rich_text = property_data.get('rich_text', [])
        if rich_text:
            return rich_text[0].get('plain_text', '')
        return ""
    
    def _extract_select(self, property_data):
        """Extraer valor de una propiedad Select de Notion"""
        if not property_data:
            return "Completo"
        
        select_value = property_data.get('select', {})
        if select_value:
            return select_value.get('name', 'Completo')
        return "Completo"
    
    def _update_page_property(self, page_id, property_name, new_value):
        """Actualizar una propiedad específica en Notion"""
        url = f"{self.base_url}/pages/{page_id}"
        
        payload = {
            "properties": {
                property_name: {
                    "rich_text": [
                        {
                            "text": {
                                "content": new_value
                            }
                        }
                    ]
                }
            }
        }
        
        try:
            response = requests.patch(url, headers=self.headers, json=payload)
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            print(f"Error actualizando página {page_id}: {e}")
            return False

def main():
    """Función principal"""
    # Cargar configuración
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
    
    NOTION_API_KEY = os.getenv('NOTION_API_KEY')
    NOTION_DATABASE_ID = os.getenv('NOTION_DATABASE_ID')
    
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        print("❌ Configura las variables de entorno NOTION_API_KEY y NOTION_DATABASE_ID")
        return
    
    # Crear instancia y actualizar
    updater = NotionLinkUpdater(NOTION_API_KEY, NOTION_DATABASE_ID)
    updater.update_invitation_links()

if __name__ == "__main__":
    main() 