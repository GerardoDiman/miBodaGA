#!/usr/bin/env python3
"""
Limpieza de QR codes obsoletos
Elimina QR codes de invitados que ya no están en Notion
"""

import os
import json
from dotenv import load_dotenv
from notion_integration import NotionIntegration

def clean_obsolete_qr_codes():
    """Limpiar QR codes de invitados que ya no están en Notion"""
    print("🧹 Limpiando QR codes obsoletos...")
    
    # Cargar variables de entorno
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
    
    NOTION_API_KEY = os.getenv('NOTION_API_KEY')
    NOTION_DATABASE_ID = os.getenv('NOTION_DATABASE_ID')
    
    if not NOTION_API_KEY or NOTION_API_KEY == 'tu_api_key_aqui':
        print("❌ Configura tu API key de Notion en el archivo .env")
        return
    
    if not NOTION_DATABASE_ID or NOTION_DATABASE_ID == 'tu_database_id_aqui':
        print("❌ Configura tu Database ID de Notion en el archivo .env")
        return
    
    # Obtener datos de Notion
    notion = NotionIntegration(NOTION_API_KEY, NOTION_DATABASE_ID)
    notion_data = notion.get_database()
    
    if not notion_data:
        print("❌ No se pudieron obtener datos de Notion")
        return
    
    # Parsear invitados
    guests = notion.parse_guest_data(notion_data)
    
    if not guests:
        print("❌ No se encontraron invitados válidos")
        return
    
    # Obtener lista de IDs actuales de Notion
    current_ids = {guest['id'] for guest in guests}
    print(f"📊 Invitados actuales en Notion: {len(current_ids)}")
    
    # Obtener todos los archivos QR existentes
    qr_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'qrcodes')
    existing_qr_files = []
    
    if os.path.exists(qr_dir):
        for filename in os.listdir(qr_dir):
            if filename.endswith('.png'):
                qr_id = filename.replace('.png', '')
                existing_qr_files.append(qr_id)
    
    print(f"📁 QR codes existentes: {len(existing_qr_files)}")
    
    # Encontrar QR codes obsoletos
    obsolete_qr_codes = [qr_id for qr_id in existing_qr_files if qr_id not in current_ids]
    
    if not obsolete_qr_codes:
        print("✅ No hay QR codes obsoletos para eliminar")
        return
    
    print(f"🗑️  QR codes obsoletos encontrados: {len(obsolete_qr_codes)}")
    
    # Confirmar eliminación
    print("\nQR codes que se eliminarán:")
    for qr_id in obsolete_qr_codes:
        print(f"  - {qr_id}.png")
    
    # Eliminar QR codes obsoletos
    deleted_count = 0
    for qr_id in obsolete_qr_codes:
        qr_path = os.path.join(qr_dir, f"{qr_id}.png")
        try:
            os.remove(qr_path)
            print(f"✅ Eliminado: {qr_id}.png")
            deleted_count += 1
        except Exception as e:
            print(f"❌ Error eliminando {qr_id}.png: {e}")
    
    print(f"\n🎉 Limpieza completada!")
    print(f"🗑️  QR codes eliminados: {deleted_count}")
    print(f"📁 QR codes restantes: {len(existing_qr_files) - deleted_count}")

def main():
    """Función principal"""
    clean_obsolete_qr_codes()

if __name__ == "__main__":
    main() 