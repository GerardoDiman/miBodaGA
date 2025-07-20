#!/usr/bin/env python3
"""
Sincronización automática con Notion
Ejecuta este script para mantener sincronizados los datos
"""

import time
import schedule
from notion_integration import NotionIntegration
import os

def sync_job():
    """Tarea de sincronización"""
    print(f"\n🕐 {time.strftime('%Y-%m-%d %H:%M:%S')} - Iniciando sincronización...")
    
    # Cargar variables de entorno desde .env
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
    
    # Configuración
    NOTION_API_KEY = os.getenv('NOTION_API_KEY')
    NOTION_DATABASE_ID = os.getenv('NOTION_DATABASE_ID')
    
    if not NOTION_API_KEY or NOTION_API_KEY == 'tu_api_key_aqui':
        print("❌ Configura tu API key de Notion en el archivo .env")
        return
    
    if not NOTION_DATABASE_ID or NOTION_DATABASE_ID == 'tu_database_id_aqui':
        print("❌ Configura tu Database ID de Notion en el archivo .env")
        return
    
    # Ejecutar sincronización
    notion = NotionIntegration(NOTION_API_KEY, NOTION_DATABASE_ID)
    success = notion.sync_guests()
    
    if success:
        print("✅ Sincronización completada exitosamente")
    else:
        print("❌ Error en la sincronización")

def main():
    """Función principal con programación automática"""
    print("🚀 Iniciando sincronización automática con Notion")
    print("📅 Sincronización programada cada 30 minutos")
    print("⏹️  Presiona Ctrl+C para detener")
    
    # Programar sincronización cada 30 minutos
    schedule.every(30).minutes.do(sync_job)
    
    # Ejecutar sincronización inicial
    sync_job()
    
    # Mantener el script corriendo
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Verificar cada minuto
    except KeyboardInterrupt:
        print("\n👋 Sincronización automática detenida")

if __name__ == "__main__":
    main() 