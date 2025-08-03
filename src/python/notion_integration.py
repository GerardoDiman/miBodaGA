#!/usr/bin/env python3
"""
Integración con Notion API para invitaciones dinámicas
"""

import requests
import json
import os
from datetime import datetime
import time

class NotionIntegration:
    def __init__(self, api_key, database_id):
        self.api_key = api_key
        self.database_id = database_id
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        }
    
    def get_database(self):
        """Obtener todos los registros de la base de datos"""
        url = f"{self.base_url}/databases/{self.database_id}/query"
        
        try:
            response = requests.post(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error obteniendo datos de Notion: {e}")
            return None
    
    def parse_guest_data(self, notion_data):
        """Convertir datos de Notion al formato de tu invitación"""
        guests = []
        
        for page in notion_data.get('results', []):
            properties = page.get('properties', {})
            
            # Determinar si Title es ID o Nombre
            title_property = properties.get('ID', {})
            if title_property.get('type') == 'title':
                # Title es ID
                guest_id = self._extract_title(title_property)
                guest_name = self._extract_text(properties.get('Nombre', {}))
            else:
                # Title es Nombre, buscar ID en columna separada
                guest_name = self._extract_title(properties.get('ID', {}))
                guest_id = self._extract_text(properties.get('ID_Alternativo', {}))
            
            # Extraer datos según la estructura de tu base de datos
            guest = {
                'id': guest_id,
                'nombre': guest_name,
                'pases': self._extract_number(properties.get('Pases', {})),
                'ninos': self._extract_number(properties.get('Niños', {})),
                'mesa': self._extract_number(properties.get('Mesa', {})),
                'email': self._extract_email(properties.get('Email', {})),
                'telefono': self._extract_phone(properties.get('Teléfono', {})),
                'confirmado': self._extract_checkbox(properties.get('Confirmado', {})),
                'fecha_confirmacion': self._extract_date(properties.get('Fecha Confirmación', {})),
                'notas': self._extract_text(properties.get('Notas', {})),
                'tipo_invitacion': self._extract_select(properties.get('Tipo de Invitación', {})),
                'enlace_invitacion': self._extract_text(properties.get('Enlace Invitación', {}))
            }
            
            # Solo incluir invitados válidos
            if guest['id'] and guest['nombre']:
                guests.append(guest)
        
        return guests
    
    def _extract_text(self, property_data):
        """Extraer texto de una propiedad de Notion"""
        if not property_data:
            return ""
        
        rich_text = property_data.get('rich_text', [])
        if rich_text:
            return rich_text[0].get('plain_text', '')
        return ""
    
    def _extract_number(self, property_data):
        """Extraer número de una propiedad de Notion"""
        if not property_data:
            return 0
        
        number = property_data.get('number')
        return number if number is not None else 0
    
    def _extract_email(self, property_data):
        """Extraer email de una propiedad de Notion"""
        if not property_data:
            return ""
        
        email = property_data.get('email')
        return email if email else ""
    
    def _extract_phone(self, property_data):
        """Extraer teléfono de una propiedad de Notion"""
        if not property_data:
            return ""
        
        phone = property_data.get('phone_number')
        return phone if phone else ""
    
    def _extract_checkbox(self, property_data):
        """Extraer checkbox de una propiedad de Notion"""
        if not property_data:
            return False
        
        return property_data.get('checkbox', False)
    
    def _extract_date(self, property_data):
        """Extraer fecha de una propiedad de Notion"""
        if not property_data:
            return None
        
        date_data = property_data.get('date')
        if date_data and date_data.get('start'):
            return date_data['start']
        return None
    
    def _extract_title(self, title_property):
        """Extraer texto de la propiedad Title"""
        if not title_property:
            return ""
        
        title_array = title_property.get('title', [])
        if title_array:
            return title_array[0].get('plain_text', '')
        return ""
    
    def _extract_select(self, property_data):
        """Extraer valor de una propiedad Select de Notion"""
        if not property_data:
            return "Completo"  # Valor por defecto
        
        select_value = property_data.get('select', {})
        if select_value:
            return select_value.get('name', 'Completo')
        return "Completo"
    
    def _is_valid_id(self, text):
        """Verificar si el texto es un ID válido (6 caracteres alfanuméricos)"""
        import re
        return bool(re.match(r'^[a-z0-9]{6}$', text))
    
    def update_guest_files(self, guests):
        """Actualizar archivos de invitados"""
        # Obtener ruta al directorio data desde la raíz del proyecto
        import os
        data_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'data')
        
        # Crear directorio data si no existe
        os.makedirs(data_dir, exist_ok=True)
        
        # Actualizar JSON
        json_path = os.path.join(data_dir, "invitados.json")
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(guests, f, ensure_ascii=False, indent=2)
        
        # Actualizar CSV
        csv_path = os.path.join(data_dir, "invitados.csv")
        with open(csv_path, 'w', encoding='utf-8', newline='') as f:
            import csv
            if guests:
                writer = csv.DictWriter(f, fieldnames=guests[0].keys())
                writer.writeheader()
                writer.writerows(guests)
        
        print(f"✅ Archivos actualizados: {len(guests)} invitados")
        print(f"   📁 JSON: {json_path}")
        print(f"   📁 CSV: {csv_path}")
        
        # Generar QR codes automáticamente
        self.generate_qr_codes(guests)
    
    def generate_qr_codes(self, guests):
        """Generar QR codes para todos los invitados y limpiar los obsoletos"""
        try:
            import qrcode
            import os
            
            # Crear directorio de QR codes si no existe
            qr_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'qrcodes')
            os.makedirs(qr_dir, exist_ok=True)
            
            # Obtener lista de IDs actuales de Notion
            current_ids = {guest['id'] for guest in guests}
            
            # Obtener todos los archivos QR existentes
            existing_qr_files = []
            if os.path.exists(qr_dir):
                for filename in os.listdir(qr_dir):
                    if filename.endswith('.png'):
                        qr_id = filename.replace('.png', '')
                        existing_qr_files.append(qr_id)
            
            # Eliminar QR codes obsoletos
            deleted_count = 0
            for qr_id in existing_qr_files:
                if qr_id not in current_ids:
                    qr_path = os.path.join(qr_dir, f"{qr_id}.png")
                    try:
                        os.remove(qr_path)
                        print(f"🗑️  QR eliminado: {qr_id}.png (ya no está en Notion)")
                        deleted_count += 1
                    except Exception as e:
                        print(f"⚠️  Error eliminando QR {qr_id}: {e}")
            
            # Generar QR codes para invitados actuales
            generated_count = 0
            for guest in guests:
                invite_id = guest['id']
                qr_path = os.path.join(qr_dir, f"{invite_id}.png")
                
                # Solo generar si no existe
                if not os.path.exists(qr_path):
                    try:
                        # URL de validación (siempre la misma)
                        validation_url = f"https://mibodaag.netlify.app/validar.html?id={invite_id}"
                        
                        # Crear QR code
                        qr = qrcode.QRCode(
                            version=1,
                            error_correction=qrcode.ERROR_CORRECT_L,
                            box_size=10,
                            border=4,
                        )
                        qr.add_data(validation_url)
                        qr.make(fit=True)
                        
                        # Crear imagen
                        img = qr.make_image(fill_color="black", back_color="white")
                        with open(qr_path, 'wb') as f:
                            img.save(f)
                        
                        generated_count += 1
                    except Exception as e:
                        print(f"⚠️  Error generando QR para {invite_id}: {e}")
            
            # Resumen de operaciones
            if generated_count > 0:
                print(f"🎯 QR codes generados: {generated_count} nuevos")
            if deleted_count > 0:
                print(f"🗑️  QR codes eliminados: {deleted_count} obsoletos")
            
        except ImportError:
            print("⚠️  Librería qrcode no disponible. Instala con: pip install qrcode[pil]")
        except Exception as e:
            print(f"⚠️  Error generando QR codes: {e}")
    
    def sync_guests(self):
        """Sincronizar invitados desde Notion"""
        print("🔄 Sincronizando invitados desde Notion...")
        
        # Obtener datos de Notion
        notion_data = self.get_database()
        if not notion_data:
            print("❌ No se pudieron obtener datos de Notion")
            return False
        
        # Parsear datos
        guests = self.parse_guest_data(notion_data)
        if not guests:
            print("❌ No se encontraron invitados válidos")
            return False
        
        # Actualizar archivos
        self.update_guest_files(guests)
        
        print(f"✅ Sincronización completada: {len(guests)} invitados")
        
        # Actualizar enlaces de invitación en Notion
        self.update_invitation_links(guests)
        
        return True
    
    def update_invitation_links(self, guests):
        """Actualizar enlaces de invitación en Notion según el tipo"""
        print("🔗 Actualizando enlaces de invitación en Notion...")
        
        updated_count = 0
        
        for guest in guests:
            invite_id = guest['id']
            page_id = guest.get('page_id')  # Necesitamos el page_id de Notion
            
            # Generar enlace según tipo
            if guest.get('tipo_invitacion') == 'Ceremonia':
                invitation_link = f"https://mibodaag.netlify.app/ceremonia.html?id={invite_id}"
            else:
                invitation_link = f"https://mibodaag.netlify.app/?id={invite_id}"
            
            # Solo actualizar si el enlace es diferente
            if guest.get('enlace_invitacion') != invitation_link:
                # Aquí necesitaríamos actualizar la propiedad en Notion
                # Por ahora solo mostramos el enlace generado
                print(f"📧 Enlace para {guest['nombre']}: {invitation_link}")
                updated_count += 1
        
        print(f"✅ Enlaces generados: {updated_count} invitados")
        print("💡 Copia estos enlaces y pégalos manualmente en Notion")

def main():
    """Función principal"""
    # Cargar variables de entorno desde .env
    from dotenv import load_dotenv
    import os
    
    # Cargar .env desde el directorio raíz del proyecto
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
    
    # Obtener configuración desde variables de entorno
    NOTION_API_KEY = os.getenv('NOTION_API_KEY')
    NOTION_DATABASE_ID = os.getenv('NOTION_DATABASE_ID')
    
    # Verificar configuración
    if not NOTION_API_KEY or NOTION_API_KEY == "tu_api_key_aqui":
        print("❌ Configura tu API key de Notion en el archivo .env")
        print("   Ejemplo: NOTION_API_KEY=secret_abc123def456ghi789")
        return
    
    if not NOTION_DATABASE_ID or NOTION_DATABASE_ID == "tu_database_id_aqui":
        print("❌ Configura tu Database ID de Notion en el archivo .env")
        print("   Ejemplo: NOTION_DATABASE_ID=12345678-1234-1234-1234-123456789abc")
        return
    
    # Crear instancia y sincronizar
    notion = NotionIntegration(NOTION_API_KEY, NOTION_DATABASE_ID)
    success = notion.sync_guests()
    
    if success:
        print("🎉 ¡Sincronización exitosa!")
    else:
        print("💥 Error en la sincronización")

if __name__ == "__main__":
    main() 