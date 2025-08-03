#!/usr/bin/env python3
"""
Generador de IDs únicos para invitados
Crea IDs de 6 caracteres alfanuméricos únicos para cada invitado
"""

import random
import string
import json
import os
from datetime import datetime

# Configuración
ID_LENGTH = 6
ID_CHARACTERS = string.ascii_lowercase + string.digits
OUTPUT_FILE = 'guest_ids.json'

def generar_id_unico(longitud, caracteres, ids_existentes):
    """Genera un ID aleatorio único que no exista en el set proporcionado."""
    while True:
        nuevo_id = ''.join(random.choices(caracteres, k=longitud))
        if nuevo_id not in ids_existentes:
            ids_existentes.add(nuevo_id)
            return nuevo_id

def generar_ids_para_lista(invitados):
    """Genera IDs únicos para una lista de invitados."""
    ids_generados = set()
    invitados_con_ids = []
    
    print("🎯 Generando IDs únicos para invitados...")
    print("-" * 50)
    
    for i, invitado in enumerate(invitados, 1):
        # Generar ID único
        id_unico = generar_id_unico(ID_LENGTH, ID_CHARACTERS, ids_generados)
        
        # Crear entrada con ID
        invitado_con_id = {
            'id': id_unico,
            'nombre': invitado['nombre'],
            'pases': invitado.get('pases', 1),
            'ninos': invitado.get('ninos', 0),
            'mesa': invitado.get('mesa', 0),
            'email': invitado.get('email', ''),
            'telefono': invitado.get('telefono', ''),
            'notas': invitado.get('notas', '')
        }
        
        invitados_con_ids.append(invitado_con_id)
        
        print(f"  {i:2d}. {invitado['nombre']:<25} → ID: {id_unico}")
    
    return invitados_con_ids

def guardar_en_json(invitados_con_ids):
    """Guarda los invitados con IDs en un archivo JSON."""
    data = {
        'fecha_generacion': datetime.now().isoformat(),
        'total_invitados': len(invitados_con_ids),
        'invitados': invitados_con_ids
    }
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Archivo guardado: {OUTPUT_FILE}")
    print(f"📊 Total de invitados: {len(invitados_con_ids)}")

def mostrar_instrucciones_notion(invitados_con_ids):
    """Muestra instrucciones para copiar a Notion."""
    print("\n" + "=" * 60)
    print("📋 INSTRUCCIONES PARA COPIAR A NOTION")
    print("=" * 60)
    
    print("\n1. Abre tu base de datos en Notion")
    print("2. Agrega una nueva fila por cada invitado:")
    print()
    
    for invitado in invitados_con_ids:
        print(f"   📝 {invitado['nombre']}")
        print(f"      ID: {invitado['id']}")
        print(f"      Pases: {invitado['pases']}")
        print(f"      Niños: {invitado['ninos']}")
        if invitado['mesa']:
            print(f"      Mesa: {invitado['mesa']}")
        if invitado['email']:
            print(f"      Email: {invitado['email']}")
        if invitado['telefono']:
            print(f"      Teléfono: {invitado['telefono']}")
        if invitado['notas']:
            print(f"      Notas: {invitado['notas']}")
        print()

def generar_desde_csv():
    """Genera IDs desde un archivo CSV existente."""
    csv_file = 'data/invitados.csv'
    
    if not os.path.exists(csv_file):
        print(f"❌ No se encontró el archivo {csv_file}")
        return None
    
    import csv
    invitados = []
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                invitado = {
                    'nombre': row.get('nombre', '').strip(),
                    'pases': int(row.get('pases', 1)),
                    'ninos': int(row.get('ninos', 0)),
                    'mesa': int(row.get('mesa', 0)),
                    'email': row.get('email', '').strip(),
                    'telefono': row.get('telefono', '').strip(),
                    'notas': row.get('notas', '').strip()
                }
                if invitado['nombre']:  # Solo incluir si tiene nombre
                    invitados.append(invitado)
    except Exception as e:
        print(f"❌ Error leyendo CSV: {e}")
        return None
    
    return invitados

def generar_desde_lista_manual():
    """Genera IDs desde una lista manual de invitados."""
    print("📝 Ingresa los invitados manualmente")
    print("Presiona Enter sin nombre para terminar")
    print("-" * 40)
    
    invitados = []
    contador = 1
    
    while True:
        print(f"\n--- Invitado #{contador} ---")
        nombre = input("Nombre: ").strip()
        
        if not nombre:
            break
        
        try:
            pases = int(input("Pases (1): ") or "1")
            ninos = int(input("Niños (0): ") or "0")
            mesa = int(input("Mesa (0): ") or "0")
            email = input("Email: ").strip()
            telefono = input("Teléfono: ").strip()
            notas = input("Notas: ").strip()
        except ValueError:
            print("❌ Valor inválido, usando valores por defecto")
            pases, ninos, mesa = 1, 0, 0
            email = telefono = notas = ""
        
        invitado = {
            'nombre': nombre,
            'pases': pases,
            'ninos': ninos,
            'mesa': mesa,
            'email': email,
            'telefono': telefono,
            'notas': notas
        }
        
        invitados.append(invitado)
        contador += 1
    
    return invitados

def main():
    """Función principal."""
    print("🎭 Generador de IDs para Invitados")
    print("=" * 50)
    
    # Verificar si existe CSV
    if os.path.exists('data/invitados.csv'):
        print("📄 Se encontró archivo CSV existente")
        opcion = input("¿Usar datos del CSV? (s/N): ").strip().lower()
        
        if opcion in ['s', 'si', 'sí', 'y', 'yes']:
            invitados = generar_desde_csv()
        else:
            invitados = generar_desde_lista_manual()
    else:
        print("📝 No se encontró CSV, ingresando datos manualmente")
        invitados = generar_desde_lista_manual()
    
    if not invitados:
        print("❌ No se pudieron obtener datos de invitados")
        return
    
    # Generar IDs
    invitados_con_ids = generar_ids_para_lista(invitados)
    
    # Guardar en JSON
    guardar_en_json(invitados_con_ids)
    
    # Mostrar instrucciones para Notion
    mostrar_instrucciones_notion(invitados_con_ids)
    
    print("\n🎉 ¡Proceso completado!")
    print("\n📋 Próximos pasos:")
    print("1. Copia los datos a tu base de datos de Notion")
    print("2. Ejecuta: npm run sync-notion")
    print("3. Los QR codes se generarán automáticamente")

if __name__ == "__main__":
    main() 