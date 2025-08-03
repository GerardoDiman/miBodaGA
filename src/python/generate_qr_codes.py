#!/usr/bin/env python3
"""
Script para generar códigos QR para invitados de boda
Versión mejorada que maneja diferentes estructuras de datos
"""

import csv
import json
import random
import string
import os
import codecs
import qrcode
from datetime import datetime

# --- Configuración ---
INPUT_CSV_FILENAME = 'data/invitados.csv'
OUTPUT_JSON_FILENAME = 'data/invitados.json'
QR_CODES_OUTPUT_FOLDER = 'qrcodes'
BASE_VALIDATION_URL = 'https://mibodaag.netlify.app/validar.html'  # <<-- ¡CONFIGURA ESTA URL!
ID_LENGTH = 6
ID_CHARACTERS = string.ascii_lowercase + string.digits

# Configuración de columnas (puede variar según el CSV)
COLUMNA_NOMBRE = 'nombre'
COLUMNA_PASES = 'pases'
COLUMNA_NINOS = 'ninos'

# --- Fin Configuración ---

def generar_id_unico(longitud, caracteres, ids_existentes):
    """Genera un ID aleatorio único que no exista en el set proporcionado."""
    while True:
        nuevo_id = ''.join(random.choices(caracteres, k=longitud))
        if nuevo_id not in ids_existentes:
            ids_existentes.add(nuevo_id)
            return nuevo_id

def generar_qr_code(id_invitado, nombre_invitado):
    """Genera un código QR para un invitado específico."""
    qr_data = f"{BASE_VALIDATION_URL}?id={id_invitado}"
    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Guardar la imagen del QR
    qr_filename = os.path.join(QR_CODES_OUTPUT_FOLDER, f'{id_invitado}.png')
    img.save(qr_filename)
    
    print(f"  ✅ Código QR generado para {nombre_invitado}: {qr_filename}")
    return qr_filename

def procesar_csv_existente():
    """Procesa el CSV existente y genera nuevos códigos QR."""
    lista_invitados_json = []
    ids_generados = set()
    
    # Crear carpeta de salida para QRs si no existe
    if not os.path.exists(QR_CODES_OUTPUT_FOLDER):
        os.makedirs(QR_CODES_OUTPUT_FOLDER)
        print(f"📁 Carpeta de salida para QRs creada: {QR_CODES_OUTPUT_FOLDER}")
    
    if not os.path.exists(INPUT_CSV_FILENAME):
        print(f"❌ Error: El archivo CSV '{INPUT_CSV_FILENAME}' no fue encontrado.")
        return False
    
    print(f"📄 Procesando archivo CSV: {INPUT_CSV_FILENAME}...")
    
    try:
        with open(INPUT_CSV_FILENAME, mode='r', newline='', encoding='utf-8-sig') as csvfile:
            reader = csv.DictReader(csvfile)
            
            # Verificar columnas disponibles
            headers = reader.fieldnames
            print(f"📋 Columnas detectadas: {headers}")
            
            for i, row in enumerate(reader):
                try:
                    # Extraer datos
                    nombre = row.get(COLUMNA_NOMBRE, '').strip()
                    pases_str = row.get(COLUMNA_PASES, '0').strip()
                    ninos_str = row.get(COLUMNA_NINOS, '0').strip()
                    
                    # Validar que el nombre no esté vacío
                    if not nombre:
                        print(f"⚠️  Advertencia: Fila {i+1} omitida porque el nombre está vacío.")
                        continue
                    
                    # Generar nuevo ID único
                    id_unico = generar_id_unico(ID_LENGTH, ID_CHARACTERS, ids_generados)
                    
                    # Generar código QR
                    generar_qr_code(id_unico, nombre)
                    
                    # Convertir pases y niños a enteros
                    try:
                        pases_int = int(pases_str) if pases_str else 0
                    except ValueError:
                        print(f"⚠️  Advertencia: Valor no numérico para 'Pases' en fila {i+1} ('{pases_str}'). Se usará 0.")
                        pases_int = 0
                    
                    try:
                        ninos_int = int(ninos_str) if ninos_str else 0
                    except ValueError:
                        print(f"⚠️  Advertencia: Valor no numérico para 'Niños' en fila {i+1} ('{ninos_str}'). Se usará 0.")
                        ninos_int = 0
                    
                    # Crear el diccionario para este invitado
                    invitado_dict = {
                        'id': id_unico,
                        'nombre': nombre,
                        'pases': pases_int,
                        'ninos': ninos_int,
                        'mesa': 0,
                        'email': '',
                        'telefono': '',
                        'confirmado': False,
                        'fecha_confirmacion': None,
                        'notas': ''
                    }
                    
                    # Añadir a la lista
                    lista_invitados_json.append(invitado_dict)
                    print(f"  👤 Procesado: {nombre} -> ID: {id_unico} (Pases: {pases_int}, Niños: {ninos_int})")
                    
                except Exception as e:
                    print(f"❌ Error procesando fila {i+1}: {e}")
                    continue
        
        # Escribir la lista completa en el archivo JSON
        with open(OUTPUT_JSON_FILENAME, mode='w', encoding='utf-8') as jsonfile:
            json.dump(lista_invitados_json, jsonfile, ensure_ascii=False, indent=2)
        
        print(f"\n🎉 ¡Éxito! Se ha creado el archivo JSON: {OUTPUT_JSON_FILENAME}")
        print(f"🎉 ¡Éxito! Se han generado {len(lista_invitados_json)} códigos QR en: {QR_CODES_OUTPUT_FOLDER}")
        print(f"📊 Total de invitados procesados: {len(lista_invitados_json)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error general durante el procesamiento: {e}")
        return False

def crear_csv_ejemplo():
    """Crea un archivo CSV de ejemplo con la estructura correcta."""
    ejemplo_csv = """nombre,pases,ninos
Familia García López,4,1
María González,2,0
Carlos Rodríguez,1,0
Familia Martínez,3,2
Ana López,1,0"""
    
    with open('data/invitados_ejemplo.csv', 'w', encoding='utf-8') as f:
        f.write(ejemplo_csv)
    
    print("📝 Archivo CSV de ejemplo creado: data/invitados_ejemplo.csv")
    print("📋 Puedes usar este archivo como base para tu lista de invitados")

def main():
    """Función principal."""
    print("🎭 Generador de Códigos QR para Boda")
    print("=" * 50)
    
    # Verificar URL
    if BASE_VALIDATION_URL == 'https://mibodaag.netlify.app/validar.html':
        print("⚠️  IMPORTANTE: Verifica que la URL en BASE_VALIDATION_URL sea correcta")
        print(f"   URL actual: {BASE_VALIDATION_URL}")
    
    # Verificar si existe el CSV
    if not os.path.exists(INPUT_CSV_FILENAME):
        print(f"❌ No se encontró el archivo {INPUT_CSV_FILENAME}")
        print("📝 Creando archivo CSV de ejemplo...")
        crear_csv_ejemplo()
        return
    
    # Procesar CSV existente
    if procesar_csv_existente():
        print("\n✅ Proceso completado exitosamente!")
        print("\n📋 Próximos pasos:")
        print("1. Verifica que los códigos QR se generaron correctamente")
        print("2. Sube los archivos JSON y QR a tu sitio web")
        print("3. Prueba la validación con uno de los códigos QR")
    else:
        print("\n❌ El proceso no se completó correctamente")

if __name__ == "__main__":
    main() 