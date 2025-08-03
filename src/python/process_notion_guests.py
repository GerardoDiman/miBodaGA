#!/usr/bin/env python3
"""
Procesador completo de invitados desde Notion
1. Obtiene lista desde Notion (sin IDs)
2. Genera IDs aleatorios únicos
3. Actualiza Notion con los IDs
4. Genera QR codes automáticamente
"""

import requests
import json
import random
import string
import os
import time
from datetime import datetime
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

class NotionGuestProcessor:
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
    
    def get_guests_from_notion(self):
        """Obtiene todos los invitados desde Notion"""
        print("📥 Obteniendo invitados desde Notion...")
        
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
                    'nombre': self._extract_text(properties.get('Nombre', {})),
                    'pases': self._extract_number(properties.get('Pases', {})),
                    'ninos': self._extract_number(properties.get('Niños', {})),
                    'mesa': self._extract_number(properties.get('Mesa', {})),
                    'email': self._extract_email(properties.get('Email', {})),
                    'telefono': self._extract_phone(properties.get('Teléfono', {})),
                    'notas': self._extract_text(properties.get('Notas', {}))
                }
                
                # Solo incluir si tiene nombre y no tiene ID
                if guest['nombre'] and not self._has_id(properties):
                    guests.append(guest)
            
            print(f"✅ Encontrados {len(guests)} invitados sin ID")
            return guests
            
        except Exception as e:
            print(f"❌ Error obteniendo datos de Notion: {e}")
            return []
    
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
    
    def _has_id(self, properties):
        """Verificar si ya tiene un ID"""
        id_property = properties.get('ID', {})
        if id_property.get('type') == 'title':
            title_array = id_property.get('title', [])
            if title_array and title_array[0].get('plain_text', '').strip():
                return True
        return False
    
    def generate_unique_ids(self, guests):
        """Genera IDs únicos para los invitados"""
        print("🎯 Generando IDs únicos...")
        
        # Obtener IDs existentes para evitar duplicados
        existing_ids = self._get_existing_ids()
        
        for guest in guests:
            # Generar ID único
            while True:
                new_id = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
                if new_id not in existing_ids:
                    guest['generated_id'] = new_id
                    existing_ids.add(new_id)
                    break
        
        print(f"✅ Generados {len(guests)} IDs únicos")
        return guests
    
    def _get_existing_ids(self):
        """Obtiene todos los IDs existentes en Notion"""
        print("🔍 Verificando IDs existentes...")
        
        url = f"{self.base_url}/databases/{self.database_id}/query"
        existing_ids = set()
        
        try:
            response = requests.post(url, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            
            for page in data.get('results', []):
                properties = page.get('properties', {})
                id_property = properties.get('ID', {})
                
                if id_property.get('type') == 'title':
                    title_array = id_property.get('title', [])
                    if title_array:
                        existing_id = title_array[0].get('plain_text', '').strip()
                        if existing_id:
                            existing_ids.add(existing_id)
            
            print(f"📊 Encontrados {len(existing_ids)} IDs existentes")
            return existing_ids
            
        except Exception as e:
            print(f"⚠️ Error obteniendo IDs existentes: {e}")
            return set()
    
    def update_notion_with_ids(self, guests_with_ids):
        """Actualiza Notion con los nuevos IDs"""
        print("📤 Actualizando Notion con IDs...")
        
        updated_count = 0
        
        for guest in guests_with_ids:
            try:
                # Actualizar la página en Notion
                url = f"{self.base_url}/pages/{guest['page_id']}"
                
                # Preparar datos para actualizar
                update_data = {
                    "properties": {
                        "ID": {
                            "title": [
                                {
                                    "text": {
                                        "content": guest['generated_id']
                                    }
                                }
                            ]
                        }
                    }
                }
                
                response = requests.patch(url, headers=self.headers, json=update_data)
                response.raise_for_status()
                
                print(f"  ✅ {guest['nombre']} → {guest['generated_id']}")
                updated_count += 1
                
                # Pausa para evitar rate limiting
                time.sleep(0.1)
                
            except Exception as e:
                print(f"  ❌ Error actualizando {guest['nombre']}: {e}")
        
        print(f"✅ Actualizados {updated_count} invitados en Notion")
        return updated_count
    
    def generate_qr_codes(self, guests_with_ids):
        """Genera QR codes para los invitados"""
        print("📱 Generando QR codes...")
        
        try:
            import qrcode
            
            # Crear directorio de QR codes si no existe
            qr_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'qrcodes')
            os.makedirs(qr_dir, exist_ok=True)
            
            generated_count = 0
            
            for guest in guests_with_ids:
                invite_id = guest['generated_id']
                qr_path = os.path.join(qr_dir, f"{invite_id}.png")
                
                # Solo generar si no existe
                if not os.path.exists(qr_path):
                    try:
                        # URL de la invitación
                        invitation_url = f"https://mibodaag.netlify.app/validar.html?id={invite_id}"
                        
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
                        img.save(qr_path)
                        
                        print(f"  ✅ QR generado: {invite_id}.png")
                        generated_count += 1
                        
                    except Exception as e:
                        print(f"  ❌ Error generando QR para {invite_id}: {e}")
                else:
                    print(f"  ⏭️ QR ya existe: {invite_id}.png")
            
            print(f"✅ Generados {generated_count} QR codes nuevos")
            
        except ImportError:
            print("⚠️ Librería qrcode no disponible. Instala con: pip install qrcode[pil]")
        except Exception as e:
            print(f"⚠️ Error generando QR codes: {e}")
    
    def sync_to_local_files(self, guests_with_ids):
        """Sincroniza los datos actualizados a archivos locales"""
        print("💾 Sincronizando a archivos locales...")
        
        # Actualizar JSON
        json_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'invitados.json')
        os.makedirs(os.path.dirname(json_path), exist_ok=True)
        
        guests_for_json = []
        for guest in guests_with_ids:
            guests_for_json.append({
                'id': guest['generated_id'],
                'nombre': guest['nombre'],
                'pases': guest['pases'],
                'ninos': guest['ninos'],
                'mesa': guest['mesa'],
                'email': guest['email'],
                'telefono': guest['telefono'],
                'notas': guest['notas'],
                'confirmado': False,
                'fecha_confirmacion': None
            })
        
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(guests_for_json, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Archivo JSON actualizado: {json_path}")
        print(f"📊 Total de invitados: {len(guests_for_json)}")
    
    def process_all(self):
        """Proceso completo"""
        print("🎭 Procesador Completo de Invitados")
        print("=" * 60)
        
        try:
            # Paso 1: Obtener invitados desde Notion
            guests = self.get_guests_from_notion()
            if not guests:
                print("❌ No se encontraron invitados para procesar")
                return False
            
            # Paso 2: Generar IDs únicos
            guests_with_ids = self.generate_unique_ids(guests)
            
            # Paso 3: Actualizar Notion
            updated_count = self.update_notion_with_ids(guests_with_ids)
            
            # Paso 4: Generar QR codes
            self.generate_qr_codes(guests_with_ids)
            
            # Paso 5: Sincronizar archivos locales
            self.sync_to_local_files(guests_with_ids)
            
            print("\n🎉 ¡Proceso completado exitosamente!")
            print(f"📊 Resumen:")
            print(f"  - Invitados procesados: {len(guests)}")
            print(f"  - IDs generados: {len(guests_with_ids)}")
            print(f"  - Notion actualizado: {updated_count}")
            print(f"  - QR codes generados: {len(guests_with_ids)}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error en el proceso: {e}")
            return False

def main():
    """Función principal"""
    try:
        processor = NotionGuestProcessor()
        success = processor.process_all()
        
        if success:
            print("\n📋 Próximos pasos:")
            print("1. Verifica que los IDs se agregaron correctamente en Notion")
            print("2. Revisa los QR codes generados en la carpeta qrcodes/")
            print("3. Prueba la validación con uno de los QR codes")
        else:
            print("\n❌ El proceso no se completó correctamente")
            
    except Exception as e:
        print(f"❌ Error inicializando: {e}")
        print("Verifica tu configuración en el archivo .env")

if __name__ == "__main__":
    main() 