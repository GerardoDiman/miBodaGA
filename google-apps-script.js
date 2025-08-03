/**
 * código.gs (Google Apps Script) - VERSIÓN ACTUALIZADA CON COLUMNA MESA
 * Maneja la confirmación (POST) y la verificación/obtención de detalles (GET) 
 * para la invitación de boda con el nuevo formulario RSVP.
 */

// ========================================================================
// FUNCIÓN PRINCIPAL PARA CONFIRMACIONES (Solicitudes POST)
// ========================================================================
function doPost(e) {
    var lock = LockService.getScriptLock();
    lock.waitLock(30000); // Esperar hasta 30 segundos por el bloqueo
    
    // --- Configuración ---
    var confirmSheetName = "Hoja 1"; // Nombre EXACTO de la hoja donde se registran confirmaciones
    var idConfirmColIndex = 2; // Índice de columna del ID en la hoja de confirmaciones (B=2)
    // --- Fin Configuración ---
    
    Logger.log("Iniciando doPost...");
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(confirmSheetName);
    
    if (!sheet) {
        Logger.log("Error: Hoja de confirmaciones no encontrada: " + confirmSheetName);
        return sendJsonResponse({
            "status": "error",
            "message": "Error de configuración interna: Hoja de confirmaciones no encontrada."
        });
    }
    
    var data;
    try {
        Logger.log("Datos POST recibidos (crudo): " + e.postData.contents);
        data = JSON.parse(e.postData.contents);
        Logger.log("Datos POST parseados (JSON): " + JSON.stringify(data));
    } catch (error) {
        Logger.log("Error al parsear datos JSON recibidos: " + error);
        return sendJsonResponse({
            "status": "error",
            "message": "Error al procesar datos recibidos: " + error
        });
    }
    
    // Validar datos esenciales (actualizado para nuevo formato)
    if (!data || !data.id || !data.nombre || data.pases == null || data.ninos == null) {
        Logger.log("Error: Faltan datos requeridos en la solicitud POST. Datos recibidos: " + JSON.stringify(data));
        return sendJsonResponse({
            "status": "error",
            "message": "Faltan datos requeridos (id, nombre, pases, ninos)."
        });
    }
    
    // Validar nuevos campos del formulario RSVP
    if (!data.pasesUtilizados || !data.nombresInvitados || !data.telefono) {
        Logger.log("Error: Faltan datos del formulario RSVP. Datos recibidos: " + JSON.stringify(data));
        return sendJsonResponse({
            "status": "error",
            "message": "Faltan datos del formulario RSVP (pasesUtilizados, nombresInvitados, telefono)."
        });
    }
    
    Logger.log(`Datos recibidos validados: ID=${data.id}, Nombre=${data.nombre}, Pases=${data.pases}, Niños=${data.ninos}`);
    Logger.log(`Nuevos datos RSVP: PasesUtilizados=${data.pasesUtilizados}, Telefono=${data.telefono}, Email=${data.email || 'No proporcionado'}`);
    
    try {
        // Verificar si el ID ya existe en la hoja de confirmaciones
        Logger.log("doPost: Verificando existencia de ID: '" + data.id + "' en columna " + idConfirmColIndex);
        var idExists = checkIdExists(sheet, data.id, idConfirmColIndex);
        Logger.log("doPost: Resultado de checkIdExists: " + idExists);
        
        if (idExists) {
            Logger.log("doPost: ID ya existía en la hoja de confirmaciones, no se añadirá fila.");
            return sendJsonResponse({
                "status": "already_confirmed",
                "message": "Ya has confirmado previamente."
            });
        }
        
        // Si no existe, proceder a añadir la fila con los nuevos campos
        Logger.log("doPost: ID no existía, añadiendo nueva fila con datos del formulario RSVP...");
        
        var timestamp = new Date();
        var formTimestamp = data.timestamp ? new Date(data.timestamp) : timestamp;
        
        // Orden de columnas actualizado para incluir MESA:
        // A=Timestamp, B=ID, C=Nombre, D=Pases, E=Niños, F=Estado, G=PasesUtilizados, H=NinosUtilizados, I=NombresInvitados, J=NombresNinos, K=Telefono, L=Email, M=TimestampFormulario, N=Mesa
        var newRow = [
            timestamp,                    // A: Timestamp del servidor
            data.id,                     // B: ID del invitado
            data.nombre,                 // C: Nombre del invitado
            data.pases,                  // D: Pases asignados originalmente
            data.ninos,                  // E: Niños asignados originalmente
            "Confirmado",                // F: Estado
            data.pasesUtilizados,        // G: Pases utilizados (nuevo)
            data.ninosUtilizados || "0", // H: Niños utilizados (nuevo)
            data.nombresInvitados,       // I: Nombres de invitados (nuevo)
            data.nombresNinos || "",     // J: Nombres de niños (nuevo)
            data.telefono,               // K: Teléfono de contacto (nuevo)
            data.email || "",            // L: Email (opcional, nuevo)
            formTimestamp,               // M: Timestamp del formulario (nuevo)
            ""                           // N: Mesa (se llenará manualmente)
        ];
        
        sheet.appendRow(newRow); // Añade la fila al final
        
        Logger.log("doPost: Fila añadida exitosamente a '" + confirmSheetName + "' con datos del formulario RSVP.");
        Logger.log("Datos de la fila: " + JSON.stringify(newRow));
        
        // Devolver respuesta de éxito
        return sendJsonResponse({
            "status": "success",
            "message": "Confirmación registrada para " + data.nombre + " con " + data.pasesUtilizados + " pases."
        });
        
    } catch (error) {
        // Capturar cualquier otro error durante la verificación o escritura
        Logger.log("Error grave en el bloque try de doPost: " + error + "\nStack: " + error.stack);
        return sendJsonResponse({
            "status": "error",
            "message": "Error interno del servidor al registrar la confirmación: " + error
        });
    } finally {
        // Asegurarse de liberar el bloqueo siempre
        lock.releaseLock();
        Logger.log("doPost finalizado.");
    }
}

// ========================================================================
// FUNCIÓN PRINCIPAL PARA SOLICITUDES GET (Verificar Estado, Obtener Detalles)
// ========================================================================
function doGet(e){
    var callback = e.parameter.callback; // Para JSONP
    var action = e.parameter.action;
    var guestId = e.parameter.id;
    
    Logger.log(`Iniciando doGet: action=${action}, id=${guestId}, callback=${callback}`);
    
    // --- Acción: checkStatus ---
    if (action === "checkStatus" && guestId) {
        var confirmSheetName = "Hoja 1"; // Nombre de la hoja de confirmaciones
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName(confirmSheetName);
        
        if (!sheet) {
            Logger.log("Error checkStatus: Hoja '" + confirmSheetName + "' no encontrada.");
            return sendJsonResponsep({
                "status": "error",
                "message": "Hoja de confirmaciones no encontrada."
            }, callback);
        }
        
        try {
            var idConfirmCol = 2; // Columna B para ID en Hoja 1 (¡Verifica!)
            Logger.log(`CheckStatus: Buscando ID '${guestId}' en hoja '${confirmSheetName}', columna ${idConfirmCol}`);
            
            var idExists = checkIdExists(sheet, guestId, idConfirmCol);
            Logger.log(`CheckStatus para ${guestId}: ${idExists ? 'Confirmado' : 'No Confirmado'}`);
            
            return sendJsonResponsep({
                "status": idExists ? "confirmed" : "not_confirmed"
            }, callback); // Devolver JSONP
            
        } catch (error) {
            Logger.log("Error en doGet (checkStatus): " + error + "\nStack: " + error.stack);
            return sendJsonResponsep({
                "status": "error",
                "message": "Error al verificar estado: " + error
            }, callback); // Devolver JSONP
        }
        
    // --- Acción: getGuestDetails ---
    } else if (action === "getGuestDetails" && guestId) {
        // *** ¡CONFIGURA ESTO! ¿Dónde están los detalles originales? ***
        var dataSheetName = "Hoja 1"; // <-- ¿Nombre de hoja con Nombre, Pases, Niños? (Puede ser "Hoja 1" o "Lista Maestra", etc.)
        var idCol = 2; // <-- Columna del ID en dataSheetName (B=2)
        var nameCol = 3; // <-- Columna del Nombre (C=3)
        var passesCol = 4; // <-- Columna de Pases (D=4)
        var kidsCol = 5; // <-- Columna de Niños (E=5)
        var mesaCol = 14; // <-- Columna de Mesa (N=14) - NUEVA COLUMNA
        // ---------------------------------------------------------
        
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var dataSheet = ss.getSheetByName(dataSheetName);
        
        if (!dataSheet) {
            Logger.log("Error getGuestDetails: Hoja '" + dataSheetName + "' no encontrada.");
            return sendJsonResponsep({
                "status": "error",
                "message": "Hoja de datos '" + dataSheetName + "' no encontrada."
            }, callback); // Usa JSONP
        }
        
        try {
            var dataRange = dataSheet.getDataRange();
            var values = dataRange.getValues();
            var invitadoEncontrado = null;
            
            Logger.log(`GetGuestDetails: Buscando ID '${guestId}' en hoja '${dataSheetName}', columna ${idCol}`);
            
            for (var i = 1; i < values.length; i++) { // Empezar en 1 para saltar encabezado
                var idEnHoja = values[i][idCol - 1];
                var idEnHojaStr = idEnHoja ? String(idEnHoja).trim() : '';
                var guestIdStr = String(guestId).trim();
                
                // Logger.log("Fila " + (i+1) + ": Comparando '" + guestIdStr + "' con '" + idEnHojaStr + "'"); // Log opcional detallado
                
                if (idEnHoja && idEnHojaStr === guestIdStr) {
                    Logger.log("GetGuestDetails: ¡Coincidencia encontrada en fila " + (i+1) + "!");
                    
                    // Extraer datos de las columnas configuradas
                    invitadoEncontrado = {
                        id: idEnHojaStr,
                        nombre: String(values[i][nameCol - 1] || 'N/D').trim(), // Nombre de col nameCol
                        pases: parseInt(values[i][passesCol - 1]) || 0, // Pases de col passesCol
                        ninos: parseInt(values[i][kidsCol - 1]) || 0, // Niños de col kidsCol
                        mesa: String(values[i][mesaCol - 1] || '').trim() // Mesa de col mesaCol - NUEVA COLUMNA
                    };
                    
                    // Verificar si ya confirmó su asistencia
                    var confirmSheetName = "Hoja 1"; // Nombre de la hoja de confirmaciones
                    var confirmSheet = ss.getSheetByName(confirmSheetName);
                    
                    if (confirmSheet) {
                        var confirmRange = confirmSheet.getDataRange();
                        var confirmValues = confirmRange.getValues();
                        
                        // Buscar confirmación en la hoja de confirmaciones
                        for (var j = 1; j < confirmValues.length; j++) {
                            var confirmId = confirmValues[j][1]; // Columna B = ID
                            var confirmIdStr = confirmId ? String(confirmId).trim() : '';
                            
                            if (confirmIdStr === guestIdStr) {
                                // Encontró confirmación, agregar datos adicionales
                                invitadoEncontrado.confirmado = true;
                                invitadoEncontrado.fechaConfirmacion = confirmValues[j][0]; // Columna A = Timestamp
                                invitadoEncontrado.estado = confirmValues[j][5] || 'Confirmado'; // Columna F = Estado
                                invitadoEncontrado.pasesUtilizados = parseInt(confirmValues[j][6]) || 0; // Columna G = Pases utilizados
                                invitadoEncontrado.ninosUtilizados = parseInt(confirmValues[j][7]) || 0; // Columna H = Niños utilizados
                                invitadoEncontrado.nombresInvitados = confirmValues[j][8] || ''; // Columna I = Nombres invitados
                                invitadoEncontrado.nombresNinos = confirmValues[j][9] || ''; // Columna J = Nombres niños
                                invitadoEncontrado.telefono = confirmValues[j][10] || ''; // Columna K = Teléfono
                                invitadoEncontrado.email = confirmValues[j][11] || ''; // Columna L = Email
                                invitadoEncontrado.timestampFormulario = confirmValues[j][12]; // Columna M = Timestamp formulario
                                invitadoEncontrado.mesaConfirmacion = confirmValues[j][13] || ''; // Columna N = Mesa (de confirmación)
                                break;
                            }
                        }
                    }
                    
                    // Si no se encontró confirmación, marcar como no confirmado
                    if (!invitadoEncontrado.confirmado) {
                        invitadoEncontrado.confirmado = false;
                        invitadoEncontrado.estado = 'Pendiente';
                    }
                    break; // Detener al encontrar
                }
            }
            
            if (invitadoEncontrado) {
                Logger.log("GetGuestDetails - Datos encontrados: " + JSON.stringify(invitadoEncontrado));
                return sendJsonResponsep({
                    "status": "success",
                    "invitado": invitadoEncontrado
                }, callback); // Usa JSONP
            } else {
                Logger.log("GetGuestDetails - ID NO encontrado en " + dataSheetName + ": " + guestId);
                return sendJsonResponsep({
                    "status": "not_found",
                    "message": "Invitado no encontrado."
                }, callback); // Usa JSONP
            }
            
        } catch (error) {
            Logger.log("Error en doGet (getGuestDetails): " + error + "\nStack: " + error.stack);
            return sendJsonResponsep({
                "status": "error",
                "message": "Error al obtener detalles: " + error
            }, callback); // Usa JSONP
        }
        
    // --- Respuesta por defecto ---
    } else {
        var defaultMessage = "El script de confirmación está activo.";
        if(!action) defaultMessage += " Falta parámetro 'action'.";
        if(!guestId && (action === 'checkStatus' || action === 'getGuestDetails')) defaultMessage += " Falta parámetro 'id'.";
        
        Logger.log("doGet: Acción no reconocida o parámetros faltantes. Callback: " + callback);
        
        if(callback) {
            // Si se esperaba JSONP, devolver error JSONP
            return sendJsonResponsep({
                "status": "error",
                "message": "Acción inválida o faltan parámetros requeridos (action, id)."
            }, callback);
        } else {
            // Si no, devolver HTML simple
            return HtmlService.createHtmlOutput(defaultMessage);
        }
    }
}

// ========================================================================
// FUNCIONES HELPER
// ========================================================================

/**
 * Verifica si un ID existe en la hoja y columna dadas.
 * @param {Sheet} sheet La hoja donde buscar.
 * @param {string} idToCheck El ID a buscar.
 * @param {number} columnIndex El índice (basado en 1) de la columna donde buscar el ID.
 * @return {boolean} True si el ID existe, False si no.
 */
function checkIdExists(sheet, idToCheck, columnIndex) {
    if (!sheet || !idToCheck || !columnIndex || columnIndex < 1) {
        Logger.log("checkIdExists: Parámetros inválidos.");
        return false; // Evitar errores si los parámetros son malos
    }
    
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var idToCheckStr = String(idToCheck).trim(); // ID a buscar como string limpio
    
    Logger.log(`checkIdExists: Buscando '${idToCheckStr}' en columna ${columnIndex}. Total filas (con encabezado): ${values.length}`);
    
    for (var i = 1; i < values.length; i++) { // Empezar en 1 para saltar encabezado
        // Verificar que la celda y la columna existan antes de acceder
        if (values[i] && values[i].length >= columnIndex && values[i][columnIndex - 1]) {
            var idEnHojaStr = String(values[i][columnIndex - 1]).trim();
            if (idEnHojaStr === idToCheckStr) {
                Logger.log(`checkIdExists: Encontrado en fila ${i + 1}`);
                return true; // Existe
            }
        } else {
            // Opcional: Log si una fila es más corta de lo esperado o la celda está vacía
            // Logger.log(`checkIdExists: Fila ${i + 1} - Celda en columna ${columnIndex} vacía o inválida.`);
        }
    }
    
    Logger.log(`checkIdExists: ID '${idToCheckStr}' NO encontrado.`);
    return false; // No existe
}

/**
 * Envía respuesta JSON estándar (usada por doPost).
 * @param {Object} payload El objeto a convertir en JSON.
 * @return {ContentService.TextOutput} La respuesta JSON.
 */
function sendJsonResponse(payload) {
    return ContentService.createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Envía respuesta JSONP (usada por doGet cuando hay callback).
 * @param {Object} payload El objeto a convertir en JSON.
 * @param {string} callbackFunctionName El nombre de la función JS de callback.
 * @return {ContentService.TextOutput} La respuesta JSONP o JSON.
 */
function sendJsonResponsep(payload, callbackFunctionName) {
    if (!callbackFunctionName) {
        Logger.log("Enviando respuesta como JSON (sin callback)");
        return sendJsonResponse(payload);
    }
    
    var jsonString = JSON.stringify(payload);
    var jsonp = callbackFunctionName + "(" + jsonString + ");";
    
    Logger.log("Enviando JSONP: " + jsonp.substring(0,150) + "...");
    
    return ContentService.createTextOutput(jsonp)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
} 