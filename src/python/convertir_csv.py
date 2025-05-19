import csv
import json
import random
import string
import os
import codecs
import qrcode # Importar la librería qrcode

# --- Configuración (igual que antes) ---
INPUT_CSV_FILENAME = 'invitados.csv'
OUTPUT_JSON_FILENAME = 'invitados.json'
QR_CODES_OUTPUT_FOLDER = 'qrcodes' # Carpeta para guardar los códigos QR
BASE_VALIDATION_URL = 'https://mibodaag.netlify.app//validar.html' # <<-- ¡CONFIGURA ESTA URL CON LA DE TU SITIO DESPLEGADO!
ID_LENGTH = 6
ID_CHARACTERS = string.ascii_lowercase + string.digits
COLUMNA_NOMBRE = 'Nombre'
COLUMNA_PASES = 'Pases'
COLUMNA_NINOS = 'Pases N'
JSON_KEY_ID = 'id'
JSON_KEY_NOMBRE = 'nombre'
JSON_KEY_PASES = 'pases'
JSON_KEY_NINOS = 'ninos'
# --- Fin Configuración ---

def generar_id_unico(longitud, caracteres, ids_existentes):
    """Genera un ID aleatorio único que no exista en el set proporcionado."""
    while True:
        nuevo_id = ''.join(random.choices(caracteres, k=longitud))
        if nuevo_id not in ids_existentes:
            ids_existentes.add(nuevo_id)
            return nuevo_id

def procesar_csv_a_json(archivo_csv, archivo_json):
    """Lee el CSV, añade IDs únicos y escribe el resultado en JSON."""
    lista_invitados_json = []
    ids_generados = set()

    # --- NUEVO: Crear carpeta de salida para QRs si no existe ---
    if not os.path.exists(QR_CODES_OUTPUT_FOLDER):
        os.makedirs(QR_CODES_OUTPUT_FOLDER)
        print(f"Carpeta de salida para QRs creada: {QR_CODES_OUTPUT_FOLDER}")
    # --- Fin NUEVO ---

    if not os.path.exists(archivo_csv):
        print(f"Error: El archivo CSV '{archivo_csv}' no fue encontrado.")
        print("Por favor, asegúrate de que el archivo esté en la misma carpeta que este script y el nombre sea correcto.")
        return False

    print(f"Procesando archivo CSV: {archivo_csv}...")

    try:
        # Abrir el archivo, AUN USAMOS utf-8-sig por si acaso
        with open(archivo_csv, mode='r', newline='', encoding='utf-8-sig') as csvfile:

            # --- NUEVO: Leer encabezados manualmente y limpiar BOM ---
            # Leer solo la primera línea para obtener los encabezados
            header_line = csvfile.readline()
            # Usar csv.reader para interpretar la línea (maneja comillas, etc.)
            header_reader = csv.reader([header_line])
            original_headers = next(header_reader) # Obtener la lista de encabezados

            # Limpiar el BOM del primer encabezado si está presente
            cleaned_headers = []
            bom_utf8_str = codecs.BOM_UTF8.decode('utf-8') # Obtener la representación string del BOM
            for i, header in enumerate(original_headers):
                if i == 0 and header.startswith(bom_utf8_str):
                    cleaned_header = header[len(bom_utf8_str):] # Quitar el BOM
                    cleaned_headers.append(cleaned_header)
                    print(f"  BOM UTF-8 detectado y eliminado del encabezado: '{header}' -> '{cleaned_header}'")
                else:
                    cleaned_headers.append(header.strip()) # Añadir y quitar espacios extra por si acaso
            # --- FIN LIMPIEZA MANUAL ---

            # Verificar que las columnas necesarias existen en los encabezados LIMPIOS
            if not all(col in cleaned_headers for col in [COLUMNA_NOMBRE, COLUMNA_PASES, COLUMNA_NINOS]):
                 print("\nError: El archivo CSV no contiene las columnas esperadas (después de limpiar):")
                 print(f"Se esperaba: '{COLUMNA_NOMBRE}', '{COLUMNA_PASES}', '{COLUMNA_NINOS}'")
                 print(f"Se encontró: {cleaned_headers}")
                 print("Por favor, verifica los nombres de las columnas en tu archivo CSV.")
                 return False

            # Ahora, crear DictReader usando el resto del archivo y los encabezados limpios
            # DictReader leerá desde la SEGUNDA línea porque ya leímos la primera
            reader = csv.DictReader(csvfile, fieldnames=cleaned_headers)

            # Iterar sobre cada fila del CSV (ahora empieza desde la primera fila de DATOS)
            for i, row in enumerate(reader):
                try:
                    # Extraer datos usando los nombres de columna configurados
                    nombre = row[COLUMNA_NOMBRE].strip()
                    pases_str = row[COLUMNA_PASES].strip()
                    ninos_str = row[COLUMNA_NINOS].strip()

                    # Validar que el nombre no esté vacío
                    if not nombre:
                         print(f"Advertencia: Fila de datos {i+1} omitida porque el nombre está vacío.")
                         continue

                    # Generar un ID único
                    id_unico = generar_id_unico(ID_LENGTH, ID_CHARACTERS, ids_generados)

                    # --- NUEVO: Generar Código QR ---
                    qr_data = f"{BASE_VALIDATION_URL}?id={id_unico}" # Datos para el QR (la URL de validación con el ID)
                    qr = qrcode.QRCode(
                        version=1, # Versión del QR (1 a 40)
                        error_correction=qrcode.constants.ERROR_CORRECT_L, # Nivel de corrección de error
                        box_size=10, # Tamaño de cada "caja" del QR
                        border=4, # Tamaño del borde
                    )
                    qr.add_data(qr_data)
                    qr.make(fit=True)

                    img = qr.make_image(fill_color="black", back_color="white") # Crear la imagen del QR

                    # Guardar la imagen del QR
                    qr_filename = os.path.join(QR_CODES_OUTPUT_FOLDER, f'{id_unico}.png')
                    img.save(qr_filename)
                    print(f"  Código QR generado para {nombre}: {qr_filename}")
                    # --- Fin NUEVO ---

                    # Convertir pases y niños a enteros (manejar posibles errores)
                    try:
                        pases_int = int(pases_str) if pases_str else 0
                    except ValueError:
                        print(f"Advertencia: Valor no numérico para 'Pases' en fila de datos {i+1} ('{pases_str}'). Se usará 0.")
                        pases_int = 0
                    try:
                        ninos_int = int(ninos_str) if ninos_str else 0
                    except ValueError:
                        print(f"Advertencia: Valor no numérico para 'Pases N' en fila de datos {i+1} ('{ninos_str}'). Se usará 0.")
                        ninos_int = 0

                    # Crear el diccionario para este invitado
                    invitado_dict = {
                        JSON_KEY_ID: id_unico,
                        JSON_KEY_NOMBRE: nombre,
                        JSON_KEY_PASES: pases_int,
                        JSON_KEY_NINOS: ninos_int
                    }

                    # Añadir a la lista
                    lista_invitados_json.append(invitado_dict)
                    print(f"  Procesado (fila de datos {i+1}): {nombre} -> ID: {id_unico}")

                except KeyError as e:
                     print(f"\nError: Falta la columna '{e}' en la fila de datos {i+1} o el encabezado limpio es incorrecto.")
                     print(f"Encabezados limpios detectados: {cleaned_headers}")
                     print(f"Fila con problema (datos crudos): {row}")
                     return False
                except Exception as e:
                    print(f"\nError inesperado procesando fila de datos {i+1}: {e}")
                    return False

        # Escribir la lista completa en el archivo JSON
        with open(archivo_json, mode='w', encoding='utf-8') as jsonfile:
            json.dump(lista_invitados_json, jsonfile, ensure_ascii=False, indent=2)

        print(f"\n¡Éxito! Se ha creado el archivo JSON: {archivo_json}")
        print(f"¡Éxito! Se han generado los códigos QR en la carpeta: {QR_CODES_OUTPUT_FOLDER}")
        return True

    except Exception as e:
        print(f"\nHa ocurrido un error general durante el procesamiento: {e}")
        return False

# --- Ejecutar la función ---
if __name__ == "__main__":
    procesar_csv_a_json(INPUT_CSV_FILENAME, OUTPUT_JSON_FILENAME)