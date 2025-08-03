/**
 * código.gs (Google Apps Script) - VERSIÓN ACTUALIZADA
 * Maneja la confirmación (POST) y la verificación/obtención de detalles (GET) 
 * para la invitación de boda con el nuevo sistema de formulario RSVP
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
    
    // Validar datos esenciales (actualizado para nuevos campos)
    if (!data || !data.id || !data.nombre || data.pasesUtilizados == null || 
        !data.nombresInvitados || !data.telefono) {
        Logger.log("Error: Faltan datos requeridos en la solicitud POST. Datos recibidos: " + JSON.stringify(data));
        return sendJsonResponse({
            "status": "error",
            "message": "Faltan datos requeridos (id, nombre, pasesUtilizados, nombresInvitados, telefono)."
        });
    }
    
    Logger.log(`Datos recibidos validados: ID=${data.id}, Nombre=${data.nombre}, PasesUtilizados=${data.pasesUtilizados}, Telefono=${data.telefono}`);
    
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
        
        // Si no existe, proceder a añadir la fila
        Logger.log("doPost: ID no existía, añadiendo nueva fila...");
        var timestamp = new Date();
        
        // Orden de columnas actualizado para nuevos campos:
        // A=Timestamp, B=ID, C=Nombre, D=PasesUtilizados, E=NombresInvitados, F=Telefono, G=Email, H=Estado
        var newRow = [
            timestamp,
            data.id,
            data.nombre,
            data.pasesUtilizados,
            data.nombresInvitados,
            data.telefono,
            data.email || '',
            "Confirmado"
        ];
        
        sheet.appendRow(newRow); // Añade la fila al final
        Logger.log("doPost: Fila añadida exitosamente a '" + confirmSheetName + "'. Datos: " + JSON.stringify(newRow));
        
        // Devolver respuesta de éxito
        return sendJsonResponse({
            "status": "success",
            "message": "Confirmación registrada para " + data.nombre
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
            var idConfirmCol = 2; // Columna B para ID en Hoja 1
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
        // Configuración para obtener detalles del invitado
        var dataSheetName = "Lista Maestra"; // Hoja con los datos originales
        var idCol = 1; // Columna A del ID
        var nameCol = 2; // Columna B del Nombre
        var passesCol = 3; // Columna C de Pases
        var kidsCol = 4; // Columna D de Niños
        
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var dataSheet = ss.getSheetByName(dataSheetName);
        
        if (!dataSheet) {
            Logger.log("Error getGuestDetails: Hoja '" + dataSheetName + "' no encontrada.");
            return sendJsonResponsep({
                "status": "error",
                "message": "Hoja de datos '" + dataSheetName + "' no encontrada."
            }, callback);
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
                
                if (idEnHoja && idEnHojaStr === guestIdStr) {
                    Logger.log("GetGuestDetails: ¡Coincidencia encontrada en fila " + (i+1) + "!");
                    
                    // Extraer datos de las columnas configuradas
                    invitadoEncontrado = {
                        id: idEnHojaStr,
                        nombre: String(values[i][nameCol - 1] || 'N/D').trim(),
                        pases: parseInt(values[i][passesCol - 1]) || 0,
                        ninos: parseInt(values[i][kidsCol - 1]) || 0
                    };
                    break; // Detener al encontrar
                }
            }
            
            if (invitadoEncontrado) {
                Logger.log("GetGuestDetails - Datos encontrados: " + JSON.stringify(invitadoEncontrado));
                return sendJsonResponsep({
                    "status": "success",
                    "invitado": invitadoEncontrado
                }, callback);
            } else {
                Logger.log("GetGuestDetails - ID NO encontrado en " + dataSheetName + ": " + guestId);
                return sendJsonResponsep({
                    "status": "not_found",
                    "message": "Invitado no encontrado."
                }, callback);
            }
            
        } catch (error) {
            Logger.log("Error en doGet (getGuestDetails): " + error + "\nStack: " + error.stack);
            return sendJsonResponsep({
                "status": "error",
                "message": "Error al obtener detalles: " + error
            }, callback);
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
        return false;
    }
    
    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();
    var idToCheckStr = String(idToCheck).trim();
    
    Logger.log(`checkIdExists: Buscando '${idToCheckStr}' en columna ${columnIndex}. Total filas (con encabezado): ${values.length}`);
    
    for (var i = 1; i < values.length; i++) { // Empezar en 1 para saltar encabezado
        if (values[i] && values[i].length >= columnIndex && values[i][columnIndex - 1]) {
            var idEnHojaStr = String(values[i][columnIndex - 1]).trim();
            if (idEnHojaStr === idToCheckStr) {
                Logger.log(`checkIdExists: Encontrado en fila ${i + 1}`);
                return true; // Existe
            }
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