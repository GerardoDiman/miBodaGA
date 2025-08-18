#!/usr/bin/env python3
"""
Script para restaurar invitados perdidos
1. Lee el archivo CSV con invitados originales
2. Lee el archivo JSON actual
3. Fusiona ambos preservando todos los invitados
4. Genera QR codes para los invitados restaurados
"""

import json
import csv
import os
import qrcode
from datetime import datetime

def restore_lost_guests():
    """Restaura invitados perdidos desde CSV"""
    print("🔄 Restaurando invitados perdidos...")
    
    # Rutas de archivos
    base_dir = os.path.dirname(__file__)
    csv_path = os.path.join(base_dir, '..', '..', 'data', 'invitados.csv')
    json_path = os.path.join(base_dir, '..', '..', 'data', 'invitados.json')
    qr_dir = os.path.join(base_dir, '..', '..', 'qrcodes')
    
    # Crear directorio de QR codes si no existe
    os.makedirs(qr_dir, exist_ok=True)
    
    # Cargar invitados actuales del JSON
    current_guests = []
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                current_guests = json.load(f)
            print(f"📖 Cargados {len(current_guests)} invitados del JSON actual")
        except Exception as e:
            print(f"⚠️ Error cargando JSON: {e}")
            current_guests = []
    
    # Crear set de IDs existentes
    existing_ids = {guest['id'] for guest in current_guests}
    
    # Cargar invitados del CSV
    csv_guests = []
    if os.path.exists(csv_path):
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    csv_guests.append(row)
            print(f"📖 Cargados {len(csv_guests)} invitados del CSV")
        except Exception as e:
            print(f"⚠️ Error cargando CSV: {e}")
            csv_guests = []
    
    # Fusionar invitados
    restored_count = 0
    qr_generated = 0
    
    for csv_guest in csv_guests:
        guest_id = csv_guest.get('id', '').strip()
        
        if guest_id and guest_id not in existing_ids:
            # Convertir datos del CSV al formato JSON
            restored_guest = {
                'id': guest_id,
                'nombre': csv_guest.get('nombre', '').strip(),
                'pases': int(csv_guest.get('pases', 0)) if csv_guest.get('pases') else 0,
                'ninos': int(csv_guest.get('ninos', 0)) if csv_guest.get('ninos') else 0,
                'mesa': int(csv_guest.get('mesa', 0)) if csv_guest.get('mesa') else 0,
                'email': csv_guest.get('email', '').strip(),
                'telefono': csv_guest.get('telefono', '').strip(),
                'confirmado': csv_guest.get('confirmado', 'False').lower() == 'true',
                'fecha_confirmacion': csv_guest.get('fecha_confirmacion', '') if csv_guest.get('fecha_confirmacion') else None,
                'notas': csv_guest.get('notas', '').strip()
            }
            
            # Agregar al JSON
            current_guests.append(restored_guest)
            existing_ids.add(guest_id)
            restored_count += 1
            
            print(f"  ➕ Restaurado: {restored_guest['nombre']} ({guest_id})")
            
            # Generar QR code si no existe
            qr_path = os.path.join(qr_dir, f"{guest_id}.png")
            if not os.path.exists(qr_path):
                try:
                    invitation_url = f"https://mibodaag.netlify.app/validar.html?id={guest_id}"
                    
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
                    
                    print(f"    📱 QR generado: {guest_id}.png")
                    qr_generated += 1
                    
                except Exception as e:
                    print(f"    ❌ Error generando QR para {guest_id}: {e}")
            else:
                print(f"    ⏭️ QR ya existe: {guest_id}.png")
        else:
            if guest_id:
                print(f"  ⏭️ Ya existe: {csv_guest.get('nombre', '')} ({guest_id})")
    
    # Guardar archivo JSON actualizado
    try:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(current_guests, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Restauración completada:")
        print(f"📊 Total de invitados: {len(current_guests)}")
        print(f"🔄 Invitados restaurados: {restored_count}")
        print(f"📱 QR codes generados: {qr_generated}")
        print(f"💾 Archivo guardado: {json_path}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error guardando archivo: {e}")
        return False

def main():
    """Función principal"""
    print("🔄 Restaurador de Invitados Perdidos")
    print("=" * 50)
    
    success = restore_lost_guests()
    
    if success:
        print("\n🎉 ¡Restauración exitosa!")
        print("📋 Próximos pasos:")
        print("1. Verifica que todos los invitados estén en el archivo JSON")
        print("2. Revisa los QR codes generados en la carpeta qrcodes/")
        print("3. Prueba la validación con los QR codes restaurados")
    else:
        print("\n❌ La restauración no se completó correctamente")

if __name__ == "__main__":
    main()
