#!/usr/bin/env python3
"""
Script para generar enlaces de invitación según el tipo
"""

import os
import json
from notion_integration import NotionIntegration
from dotenv import load_dotenv

def generate_invitation_links():
    """Generar enlaces de invitación según el tipo"""
    
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
    
    print("🔗 Generando enlaces de invitación...")
    print("=" * 60)
    
    completo_count = 0
    ceremonia_count = 0
    
    for guest in guests:
        invite_id = guest['id']
        guest_name = guest['nombre']
        tipo = guest.get('tipo_invitacion', 'Completo')
        
        # Generar enlace según tipo
        if tipo == 'Ceremonia':
            invitation_link = f"https://mibodaag.netlify.app/ceremonia.html?id={invite_id}"
            ceremonia_count += 1
        else:
            invitation_link = f"https://mibodaag.netlify.app/?id={invite_id}"
            completo_count += 1
        
        print(f"👤 {guest_name}")
        print(f"   🆔 ID: {invite_id}")
        print(f"   📋 Tipo: {tipo}")
        print(f"   🔗 Enlace: {invitation_link}")
        print("-" * 40)
    
    print("=" * 60)
    print(f"📊 Resumen:")
    print(f"   🎉 Invitaciones Completas: {completo_count}")
    print(f"   ⛪ Invitaciones Ceremonia: {ceremonia_count}")
    print(f"   📈 Total: {len(guests)}")
    print()
    print("💡 Copia estos enlaces y pégalos en la propiedad 'Enlace Invitación' de Notion")
    print("   O usa el script de actualización automática si lo implementas.")

if __name__ == "__main__":
    generate_invitation_links() 