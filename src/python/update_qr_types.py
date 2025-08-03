#!/usr/bin/env python3
"""
Script para actualizar QR codes existentes según el tipo de invitación
"""

import os
import json
import qrcode
from notion_integration import NotionIntegration
from dotenv import load_dotenv

def update_existing_qr_codes():
    """Actualizar todos los QR codes existentes según el tipo de invitación"""
    
    # Cargar configuración
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
    
    NOTION_API_KEY = os.getenv('NOTION_API_KEY')
    NOTION_DATABASE_ID = os.getenv('NOTION_DATABASE_ID')
    
    if not NOTION_API_KEY or not NOTION_DATABASE_ID:
        print("❌ Configura las variables de entorno NOTION_API_KEY y NOTION_DATABASE_ID")
        return
    
    # Crear instancia de Notion
    notion = NotionIntegration(NOTION_API_KEY, NOTION_DATABASE_ID)
    
    # Obtener datos actuales de Notion
    notion_data = notion.get_database()
    if not notion_data:
        print("❌ No se pudieron obtener datos de Notion")
        return
    
    guests = notion.parse_guest_data(notion_data)
    if not guests:
        print("❌ No se encontraron invitados")
        return
    
    # Directorio de QR codes
    qr_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'qrcodes')
    os.makedirs(qr_dir, exist_ok=True)
    
    updated_count = 0
    created_count = 0
    
    for guest in guests:
        invite_id = guest['id']
        qr_path = os.path.join(qr_dir, f"{invite_id}.png")
        
        # Determinar URL según tipo de invitación
        if guest.get('tipo_invitacion') == 'Ceremonia':
            invitation_url = f"https://mibodaag.netlify.app/ceremonia.html?id={invite_id}"
        else:
            invitation_url = f"https://mibodaag.netlify.app/?id={invite_id}"
        
        # Crear QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(invitation_url)
        qr.make(fit=True)
        
        # Crear imagen
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Guardar QR code
        with open(qr_path, 'wb') as f:
            img.save(f)
        
        if os.path.exists(qr_path):
            updated_count += 1
            print(f"🔄 QR actualizado: {invite_id} ({guest.get('tipo_invitacion', 'Completo')})")
        else:
            created_count += 1
            print(f"✨ QR creado: {invite_id} ({guest.get('tipo_invitacion', 'Completo')})")
    
    print(f"\n✅ Proceso completado:")
    print(f"   🔄 QR codes actualizados: {updated_count}")
    print(f"   ✨ QR codes creados: {created_count}")
    print(f"   📊 Total procesados: {len(guests)}")

if __name__ == "__main__":
    update_existing_qr_codes() 