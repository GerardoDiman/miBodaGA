#!/usr/bin/env python3
"""
Generador automático de QR codes para invitados de Notion
"""

import qrcode
import json
import os
from dotenv import load_dotenv
from notion_integration import NotionIntegration

def generate_qr_code(invite_id, output_path):
    """Generar QR code para un ID de invitación"""
    # URL de la invitación
    invitation_url = f"https://mibodaag.netlify.app/?id={invite_id}"
    
    # Crear QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(invitation_url)
    qr.make(fit=True)
    
    # Crear imagen
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Guardar imagen
    img.save(output_path)
    print(f"✅ QR generado: {invite_id}.png")

def main():
    """Función principal"""
    print("🎯 Generando QR codes para invitados de Notion...")
    
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
    
    # Crear directorio de QR codes si no existe
    qr_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'qrcodes')
    os.makedirs(qr_dir, exist_ok=True)
    
    # Generar QR codes para cada invitado
    generated_count = 0
    for guest in guests:
        invite_id = guest['id']
        qr_path = os.path.join(qr_dir, f"{invite_id}.png")
        
        # Solo generar si no existe
        if not os.path.exists(qr_path):
            try:
                generate_qr_code(invite_id, qr_path)
                generated_count += 1
            except Exception as e:
                print(f"❌ Error generando QR para {invite_id}: {e}")
        else:
            print(f"⏭️  QR ya existe: {invite_id}.png")
    
    print(f"\n🎉 Proceso completado!")
    print(f"📊 Total invitados: {len(guests)}")
    print(f"🆕 QR codes generados: {generated_count}")
    print(f"📁 Directorio: {qr_dir}")

if __name__ == "__main__":
    main() 