#!/usr/bin/env python3
"""
Script para limpiar y regenerar códigos QR
Elimina los códigos QR existentes y regenera nuevos
"""

import os
import shutil
import glob

def limpiar_qr_codes():
    """Limpia todos los códigos QR existentes."""
    qr_folder = 'qrcodes'
    
    if os.path.exists(qr_folder):
        # Eliminar todos los archivos .png en la carpeta
        png_files = glob.glob(os.path.join(qr_folder, '*.png'))
        
        if png_files:
            print(f"🗑️  Eliminando {len(png_files)} códigos QR existentes...")
            for file in png_files:
                try:
                    os.remove(file)
                    print(f"  ✅ Eliminado: {os.path.basename(file)}")
                except Exception as e:
                    print(f"  ❌ Error eliminando {file}: {e}")
        else:
            print("📭 No se encontraron códigos QR para eliminar")
    else:
        print("📁 La carpeta qrcodes no existe")

def limpiar_json():
    """Limpia el archivo JSON de invitados."""
    json_file = 'data/invitados.json'
    
    if os.path.exists(json_file):
        try:
            os.remove(json_file)
            print(f"🗑️  Eliminado archivo JSON: {json_file}")
        except Exception as e:
            print(f"❌ Error eliminando JSON: {e}")
    else:
        print("📄 El archivo JSON no existe")

def main():
    """Función principal."""
    print("🧹 Limpiador de Códigos QR")
    print("=" * 30)
    
    # Confirmar acción
    print("⚠️  Esta acción eliminará todos los códigos QR existentes y el archivo JSON")
    print("   Los nuevos códigos se generarán con IDs diferentes")
    
    confirmacion = input("¿Continuar? (s/N): ").strip().lower()
    
    if confirmacion in ['s', 'si', 'sí', 'y', 'yes']:
        print("\n🧹 Iniciando limpieza...")
        
        # Limpiar códigos QR
        limpiar_qr_codes()
        
        # Limpiar JSON
        limpiar_json()
        
        print("\n✅ Limpieza completada!")
        print("\n📋 Próximos pasos:")
        print("1. Ejecuta el script generate_qr_codes.py para regenerar todo")
        print("2. Verifica que los nuevos códigos QR se generaron correctamente")
        print("3. Actualiza tu sitio web con los nuevos archivos")
    else:
        print("❌ Operación cancelada")

if __name__ == "__main__":
    main() 