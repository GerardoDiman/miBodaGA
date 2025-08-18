#!/usr/bin/env python3
"""
Sincronización completa desde Notion
1. Obtiene TODOS los invitados desde Notion (con y sin ID)
2. Preserva datos existentes del JSON local
3. Actualiza con información más reciente de Notion
4. Genera QR codes para invitados nuevos
5. Mantiene la integridad de los datos
"""

import requests
import json
import os
import time
import qrcode
from datetime import datetime
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class NotionCompleteSync:
    def __init__(self):
        self.api_key = os.getenv('NOTION_API_KEY')
        self.database_id = os.getenv('NOTION_DATABASE_ID')
        self.base_url = "https://api.notion.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        }
        
        if not self.api_key or self.api_key == "tu_api_key_aqui":
            raise ValueError("❌ Configura NOTION_API_KEY en el archivo .env")
        if not self.database_id or self.database_id == "tu_database_id_aqui":
            raise ValueError("❌ Configura NOTION_DATABASE_ID en el archivo .env")
    
    def get_all_guests_from_notion(self):
        """Obtiene TODOS los invitados desde Notion"""
        print("📥 Obteniendo TODOS los invitados desde Notion...")
        
        url = f"{self.base_url}/databases/{self.database_id}/query"
        
        try:
            response = requests.post(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            
            guests = []
            for page in data.get('results', []):
                properties = page.get('properties', {})
                
                # Extraer datos según la estructura de tu base de datos
                guest = {
                    'page_id': page['id'],
                    'id': self._extract_id(properties),
                    'nombre': self._extract_text(properties.get('Nombre', {})),
                    'pases': self._extract_number(properties.get('Pases', {})),
                    'ninos': self._extract_number(properties.get('Niños', {})),
                    'mesa': self._extract_number(properties.get('Mesa', {})),
                    'email': self._extract_email(properties.get('Email', {})),
                    'telefono': self._extract_phone(properties.get('Teléfono', {})),
                    'notas': self._extract_text(properties.get('Notas', {})),
                    'confirmado': self._extract_checkbox(properties.get('Confirmado', {})),
                    'fecha_confirmacion': self._extract_date(properties.get('Fecha Confirmación', {}))
                }
                
                # Solo incluir si tiene nombre
                if guest['nombre']:
                    guests.append(guest)
            
            print(f"✅ Encontrados {len(guests)} invitados en Notion")
            return guests
            
        except Exception as e:
            print(f"❌ Error obteniendo datos de Notion: {e}")
            return []
    
    def _extract_id(self, properties):
        """Extraer ID de una propiedad de Notion"""
        id_property = properties.get('ID', {})
        if id_property.get('type') == 'title':
            title_array = id_property.get('title', [])
            if title_array:
                return title_array[0].get('plain_text', '').strip()
        return ""
    
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
        
        checkbox = property_data.get('checkbox')
        return checkbox if checkbox is not None else False
    
    def _extract_date(self, property_data):
        """Extraer fecha de una propiedad de Notion"""
        if not property_data:
            return None
        
        date_data = property_data.get('date')
        if date_data and date_data.get('start'):
            return date_data['start']
        return None
    
    def generate_id_for_guest(self, guest, existing_ids):
        """Genera ID único para un invitado que no lo tiene"""
        if guest['id']:
            return guest['id']
        
        import random
        import string
        
        while True:
            new_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
            if new_id not in existing_ids:
                return new_id
    
    def update_notion_with_id(self, guest, new_id):
        """Actualiza Notion con un nuevo ID"""
        try:
            url = f"{self.base_url}/pages/{guest['page_id']}"
            
            update_data = {
                "properties": {
                    "ID": {
                        "title": [
                            {
                                "text": {
                                    "content": new_id
                                }
                            }
                        ]
                    }
                }
            }
            
            response = requests.patch(url, headers=self.headers, json=update_data)
            response.raise_for_status()
            
            print(f"  ✅ ID actualizado en Notion: {guest['nombre']} → {new_id}")
            return True
            
        except Exception as e:
            print(f"  ❌ Error actualizando ID en Notion para {guest['nombre']}: {e}")
            return False
    
    def sync_to_local_files(self, notion_guests):
        """Sincroniza todos los datos de Notion a archivos locales"""
        print("💾 Sincronizando a archivos locales...")
        
        # Rutas de archivos
        base_dir = os.path.dirname(__file__)
        json_path = os.path.join(base_dir, '..', '..', 'data', 'invitados.json')
        qr_dir = os.path.join(base_dir, '..', '..', 'qrcodes')
        
        os.makedirs(os.path.dirname(json_path), exist_ok=True)
        os.makedirs(qr_dir, exist_ok=True)
        
        # Cargar invitados existentes del JSON
        existing_guests = []
        if os.path.exists(json_path):
            try:
                with open(json_path, 'r', encoding='utf-8') as f:
                    existing_guests = json.load(f)
                print(f"📖 Cargados {len(existing_guests)} invitados del JSON local")
            except Exception as e:
                print(f"⚠️ Error cargando JSON local: {e}")
                existing_guests = []
        
        # Crear diccionario de invitados existentes por ID
        existing_by_id = {guest['id']: guest for guest in existing_guests}
        
        # Procesar invitados de Notion
        updated_guests = []
        new_guests = 0
        updated_guests_count = 0
        qr_generated = 0
        
        for notion_guest in notion_guests:
            # Generar ID si no tiene
            if not notion_guest['id']:
                existing_ids = {guest['id'] for guest in existing_guests}
                notion_guest['id'] = self.generate_id_for_guest(notion_guest, existing_ids)
                
                # Actualizar en Notion
                if self.update_notion_with_id(notion_guest, notion_guest['id']):
                    time.sleep(0.1)  # Pausa para evitar rate limiting
            
            # Preparar datos del invitado
            guest_data = {
                'id': notion_guest['id'],
                'nombre': notion_guest['nombre'],
                'pases': notion_guest['pases'],
                'ninos': notion_guest['ninos'],
                'mesa': notion_guest['mesa'],
                'email': notion_guest['email'],
                'telefono': notion_guest['telefono'],
                'notas': notion_guest['notas'],
                'confirmado': notion_guest['confirmado'],
                'fecha_confirmacion': notion_guest['fecha_confirmacion']
            }
            
            # Verificar si es nuevo o existente
            if notion_guest['id'] in existing_by_id:
                # Actualizar invitado existente, preservando confirmaciones
                existing_guest = existing_by_id[notion_guest['id']]
                guest_data['confirmado'] = existing_guest.get('confirmado', False)
                guest_data['fecha_confirmacion'] = existing_guest.get('fecha_confirmacion', None)
                updated_guests_count += 1
                print(f"  🔄 Actualizado: {guest_data['nombre']} ({guest_data['id']})")
            else:
                # Nuevo invitado
                new_guests += 1
                print(f"  ➕ Nuevo: {guest_data['nombre']} ({guest_data['id']})")
                
                # Generar QR code para nuevo invitado
                qr_path = os.path.join(qr_dir, f"{guest_data['id']}.png")
                if not os.path.exists(qr_path):
                    try:
                        invitation_url = f"https://mibodaag.netlify.app/validar.html?id={guest_data['id']}"
                        
                        qr = qrcode.QRCode(
                            version=1,
                            error_correction=qrcode.constants.ERROR_CORRECT_L,
                            box_size=10,
                            border=4,
                        )
                        qr.add_data(invitation_url)
                        qr.make(fit=True)
                        
                        img = qr.make_image(fill_color="black", back_color="white")
                        img.save(qr_path)
                        
                        print(f"    📱 QR generado: {guest_data['id']}.png")
                        qr_generated += 1
                        
                    except Exception as e:
                        print(f"    ❌ Error generando QR para {guest_data['id']}: {e}")
                else:
                    print(f"    ⏭️ QR ya existe: {guest_data['id']}.png")
            
            updated_guests.append(guest_data)
        
        # Guardar archivo JSON actualizado
        try:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(updated_guests, f, ensure_ascii=False, indent=2)
            
            print(f"\n✅ Sincronización completada:")
            print(f"📊 Total de invitados: {len(updated_guests)}")
            print(f"🆕 Invitados nuevos: {new_guests}")
            print(f"🔄 Invitados actualizados: {updated_guests_count}")
            print(f"📱 QR codes generados: {qr_generated}")
            print(f"💾 Archivo guardado: {json_path}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error guardando archivo: {e}")
            return False
    
    def sync_all(self):
        """Proceso completo de sincronización"""
        print("🔄 Sincronización Completa desde Notion")
        print("=" * 60)
        
        try:
            # Paso 1: Obtener todos los invitados desde Notion
            notion_guests = self.get_all_guests_from_notion()
            if not notion_guests:
                print("❌ No se encontraron invitados en Notion")
                return False
            
            # Paso 2: Sincronizar a archivos locales
            success = self.sync_to_local_files(notion_guests)
            
            if success:
                print("\n🎉 ¡Sincronización exitosa!")
                print("📋 Próximos pasos:")
                print("1. Verifica que todos los invitados estén en el archivo JSON")
                print("2. Revisa los QR codes generados en la carpeta qrcodes/")
                print("3. Prueba la validación con los QR codes")
            else:
                print("\n❌ La sincronización no se completó correctamente")
            
            return success
            
        except Exception as e:
            print(f"❌ Error en el proceso: {e}")
            return False

def main():
    """Función principal"""
    try:
        syncer = NotionCompleteSync()
        success = syncer.sync_all()
        
        if not success:
            print("\n❌ El proceso no se completó correctamente")
            
    except Exception as e:
        print(f"❌ Error inicializando: {e}")
        print("Verifica tu configuración en el archivo .env")

if __name__ == "__main__":
    main()
