#!/usr/bin/env python3
"""
Script de prueba para verificar permisos de Notion API
"""

import os
import json
import requests
from dotenv import load_dotenv

def test_notion_permissions():
    """Probar permisos de la API de Notion"""
    
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
    
    print("🧪 Probando permisos de Notion API...")
    print("=" * 60)
    
    try:
        # 1. Probar lectura de la base de datos
        print("1️⃣ Probando lectura de base de datos...")
        db_url = f"https://api.notion.com/v1/databases/{NOTION_DATABASE_ID}"
        response = requests.get(db_url, headers=headers)
        response.raise_for_status()
        print("✅ Lectura exitosa")
        
        # 2. Obtener una página de ejemplo
        print("2️⃣ Obteniendo páginas...")
        query_url = f"https://api.notion.com/v1/databases/{NOTION_DATABASE_ID}/query"
        response = requests.post(query_url, headers=headers, json={})
        response.raise_for_status()
        
        pages = response.json().get('results', [])
        if not pages:
            print("❌ No se encontraron páginas")
            return
        
        # Tomar la primera página para la prueba
        test_page = pages[0]
        page_id = test_page['id']
        page_properties = test_page.get('properties', {})
        
        print(f"✅ Encontradas {len(pages)} páginas")
        print(f"🔍 Probando con página: {page_id}")
        
        # 3. Probar actualización de una propiedad simple
        print("3️⃣ Probando actualización...")
        
        # Intentar actualizar la propiedad "Notas" (que sabemos que existe)
        update_url = f"https://api.notion.com/v1/pages/{page_id}"
        
        # Crear un payload de prueba
        test_payload = {
            "properties": {
                "Notas": {
                    "rich_text": [
                        {
                            "text": {
                                "content": "Prueba de API - " + str(int(time.time()))
                            }
                        }
                    ]
                }
            }
        }
        
        response = requests.patch(update_url, headers=headers, json=test_payload)
        
        if response.status_code == 200:
            print("✅ Actualización exitosa")
            print("🎉 El token tiene permisos de escritura")
            
            # Ahora probar con "Enlace Invitación"
            print("4️⃣ Probando actualización de 'Enlace Invitación'...")
            
            link_payload = {
                "properties": {
                    "Enlace Invitación": {
                        "rich_text": [
                            {
                                "text": {
                                    "content": "https://mibodaag.netlify.app/?id=TEST123"
                                }
                            }
                        ]
                    }
                }
            }
            
            response = requests.patch(update_url, headers=headers, json=link_payload)
            
            if response.status_code == 200:
                print("✅ Actualización de 'Enlace Invitación' exitosa")
                print("🎉 Todo funciona correctamente")
            else:
                print(f"❌ Error actualizando 'Enlace Invitación': {response.status_code}")
                print(f"Respuesta: {response.text}")
                
        else:
            print(f"❌ Error en actualización: {response.status_code}")
            print(f"Respuesta: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {e}")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")

if __name__ == "__main__":
    import time
    test_notion_permissions() 