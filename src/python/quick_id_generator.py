#!/usr/bin/env python3
"""
Generador rápido de IDs para invitados existentes
"""

import random
import string

def generar_id():
    """Genera un ID único de 6 caracteres."""
    caracteres = string.ascii_lowercase + string.digits
    return ''.join(random.choices(caracteres, k=6))

def main():
    print("🎯 Generador Rápido de IDs")
    print("=" * 40)
    
    # Lista de invitados (puedes modificar esta lista)
    invitados = [
        "Familia García López",
        "María González",
        "Carlos Rodríguez",
        "Ana Martínez",
        "Luis Pérez",
        "Carmen López",
        "Roberto Silva",
        "Patricia Torres",
        "Miguel Herrera",
        "Sofia Mendoza"
    ]
    
    print("\n📋 IDs generados para tus invitados:")
    print("-" * 50)
    
    for i, nombre in enumerate(invitados, 1):
        id_unico = generar_id()
        print(f"{i:2d}. {nombre:<25} → {id_unico}")
    
    print("\n📋 Para copiar a Notion:")
    print("-" * 30)
    for nombre in invitados:
        id_unico = generar_id()
        print(f"ID: {id_unico} | Nombre: {nombre}")
    
    print("\n✅ ¡Listo! Copia estos datos a tu base de datos de Notion")

if __name__ == "__main__":
    main() 