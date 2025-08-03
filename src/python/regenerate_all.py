#!/usr/bin/env python3
"""
Script principal para regenerar completamente los códigos QR y datos de invitados
Combina limpieza y regeneración en un solo proceso
"""

import os
import sys
import subprocess
from pathlib import Path

def ejecutar_script(script_path, descripcion):
    """Ejecuta un script de Python y maneja errores."""
    print(f"\n🔄 {descripcion}...")
    print("-" * 50)
    
    try:
        # Cambiar al directorio del script
        script_dir = Path(script_path).parent
        original_dir = os.getcwd()
        os.chdir(script_dir)
        
        # Ejecutar el script
        result = subprocess.run([sys.executable, script_path], 
                              capture_output=True, text=True, encoding='utf-8')
        
        # Imprimir salida
        if result.stdout:
            print(result.stdout)
        if result.stderr:
            print("⚠️  Advertencias/Errores:")
            print(result.stderr)
        
        # Restaurar directorio original
        os.chdir(original_dir)
        
        if result.returncode == 0:
            print(f"✅ {descripcion} completado exitosamente")
            return True
        else:
            print(f"❌ Error en {descripcion}")
            return False
            
    except Exception as e:
        print(f"❌ Error ejecutando {script_path}: {e}")
        return False

def verificar_archivos():
    """Verifica que los archivos necesarios existan."""
    archivos_requeridos = [
        'data/invitados.csv',
        'src/python/clean_qr_codes.py',
        'src/python/generate_qr_codes.py'
    ]
    
    archivos_faltantes = []
    for archivo in archivos_requeridos:
        if not os.path.exists(archivo):
            archivos_faltantes.append(archivo)
    
    if archivos_faltantes:
        print("❌ Archivos faltantes:")
        for archivo in archivos_faltantes:
            print(f"  - {archivo}")
        return False
    
    return True

def mostrar_resumen():
    """Muestra un resumen del proceso."""
    print("\n" + "=" * 60)
    print("🎭 REGENERACIÓN COMPLETA DE CÓDIGOS QR")
    print("=" * 60)
    print("\n📋 Este proceso hará lo siguiente:")
    print("1. 🗑️  Limpiar todos los códigos QR existentes")
    print("2. 🗑️  Eliminar el archivo JSON de invitados")
    print("3. 🔄 Regenerar códigos QR con nuevos IDs")
    print("4. 📄 Crear nuevo archivo JSON con datos actualizados")
    print("\n⚠️  IMPORTANTE:")
    print("   - Los nuevos IDs serán diferentes a los actuales")
    print("   - Necesitarás actualizar tu sitio web con los nuevos archivos")
    print("   - Los códigos QR antiguos ya no funcionarán")

def main():
    """Función principal."""
    mostrar_resumen()
    
    # Confirmar acción
    print("\n" + "=" * 60)
    confirmacion = input("¿Continuar con la regeneración completa? (s/N): ").strip().lower()
    
    if confirmacion not in ['s', 'si', 'sí', 'y', 'yes']:
        print("❌ Operación cancelada")
        return
    
    # Verificar archivos
    if not verificar_archivos():
        print("\n❌ No se puede continuar. Verifica que todos los archivos existan.")
        return
    
    print("\n🚀 Iniciando proceso de regeneración...")
    
    # Paso 1: Limpiar códigos QR existentes
    if not ejecutar_script('src/python/clean_qr_codes.py', "Limpieza de códigos QR"):
        print("❌ Error en la limpieza. Deteniendo proceso.")
        return
    
    # Paso 2: Generar nuevos códigos QR
    if not ejecutar_script('src/python/generate_qr_codes.py', "Generación de nuevos códigos QR"):
        print("❌ Error en la generación. Verifica los logs.")
        return
    
    # Resumen final
    print("\n" + "=" * 60)
    print("🎉 ¡REGENERACIÓN COMPLETADA EXITOSAMENTE!")
    print("=" * 60)
    
    # Verificar resultados
    qr_count = 0
    if os.path.exists('qrcodes'):
        qr_count = len([f for f in os.listdir('qrcodes') if f.endswith('.png')])
    
    json_exists = os.path.exists('data/invitados.json')
    
    print(f"\n📊 Resultados:")
    print(f"  📱 Códigos QR generados: {qr_count}")
    print(f"  📄 Archivo JSON creado: {'✅' if json_exists else '❌'}")
    
    print(f"\n📋 Próximos pasos:")
    print("1. 📤 Sube los archivos a tu sitio web:")
    print("   - data/invitados.json")
    print("   - qrcodes/*.png")
    print("2. 🧪 Prueba la validación con un código QR")
    print("3. 📧 Distribuye los nuevos códigos QR a tus invitados")
    
    print(f"\n⚠️  Recordatorio:")
    print("   - Los códigos QR antiguos ya no funcionarán")
    print("   - Asegúrate de actualizar tu sitio web con los nuevos archivos")

if __name__ == "__main__":
    main() 