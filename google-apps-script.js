/**
 * Google Apps Script para manejo de RSVP de la boda
 * 
 * Instrucciones de configuración:
 * 1. Ve a https://script.google.com/
 * 2. Crea un nuevo proyecto
 * 3. Copia y pega este código
 * 4. Configura la URL de tu sitio web
 * 5. Despliega como aplicación web
 */

// Configuración
const SITE_URL = 'https://mibodaag.netlify.app'; // Cambia por tu URL
const SHEET_ID = 'TU_SHEET_ID_AQUI'; // ID de tu Google Sheet
const SHEET_NAME = 'RSVP_Confirmaciones';

// Rate limiting - máximo 10 requests por minuto por IP
const RATE_LIMIT = {
  maxRequests: 10,
  timeWindow: 60000, // 1 minuto
  requests: {}
};

// Función para verificar rate limit
function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT.timeWindow;
  
  if (!RATE_LIMIT.requests[ip]) {
    RATE_LIMIT.requests[ip] = [];
  }
  
  // Limpiar requests antiguos
  RATE_LIMIT.requests[ip] = RATE_LIMIT.requests[ip].filter(time => time > windowStart);
  
  // Verificar límite
  if (RATE_LIMIT.requests[ip].length >= RATE_LIMIT.maxRequests) {
    return false;
  }
  
  // Agregar request actual
  RATE_LIMIT.requests[ip].push(now);
  return true;
}

// Función principal que maneja las peticiones
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    // Configurar CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };
    
    // Manejar preflight OPTIONS
    if (e.parameter.method === 'OPTIONS') {
      return ContentService.createTextOutput('')
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeaders(headers);
    }
    
    // Verificar rate limit
    const clientIP = e.parameter.ip || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return createErrorResponse('Demasiadas solicitudes. Intenta de nuevo en 1 minuto.', 429, headers);
    }
    
    const action = e.parameter.action || 'confirm';
    
    switch (action) {
      case 'confirm':
        return handleRSVP(e, headers);
      case 'checkStatus':
        return checkRSVPStatus(e, headers);
      case 'getStats':
        return getRSVPStats(headers);
      default:
        return createErrorResponse('Acción no válida', 400, headers);
    }
    
  } catch (error) {
    console.error('Error en handleRequest:', error);
    return createErrorResponse('Error interno del servidor', 500, headers);
  }
}

// Manejar confirmación de RSVP
function handleRSVP(e, headers) {
  try {
    const data = e.parameter;
    
    // Validar datos requeridos
    if (!data.id || !data.nombre) {
      return createErrorResponse('Datos incompletos', 400, headers);
    }
    
    // Preparar datos para guardar
    const rsvpData = {
      id: data.id,
      nombre: data.nombre,
      pases: parseInt(data.pases) || 0,
      ninos: parseInt(data.ninos) || 0,
      fecha_confirmacion: new Date().toISOString(),
      ip: e.parameter.ip || 'unknown',
      user_agent: e.parameter.userAgent || 'unknown'
    };
    
    // Guardar en Google Sheets
    const success = saveToSheet(rsvpData);
    
    if (success) {
      // Enviar notificación por email (opcional)
      sendNotificationEmail(rsvpData);
      
      return createSuccessResponse({
        status: 'success',
        message: 'Confirmación registrada exitosamente',
        data: rsvpData
      }, headers);
    } else {
      return createErrorResponse('Error al guardar confirmación', 500, headers);
    }
    
  } catch (error) {
    console.error('Error en handleRSVP:', error);
    return createErrorResponse('Error procesando RSVP', 500, headers);
  }
}

// Verificar estado de RSVP
function checkRSVPStatus(e, headers) {
  try {
    const invitadoId = e.parameter.id;
    
    if (!invitadoId) {
      return createErrorResponse('ID de invitado requerido', 400, headers);
    }
    
    const status = getRSVPStatus(invitadoId);
    
    return createSuccessResponse({
      status: status.confirmed ? 'confirmed' : 'pending',
      data: status
    }, headers);
    
  } catch (error) {
    console.error('Error en checkRSVPStatus:', error);
    return createErrorResponse('Error verificando estado', 500, headers);
  }
}

// Obtener estadísticas de RSVP
function getRSVPStats(headers) {
  try {
    const stats = calculateRSVPStats();
    
    return createSuccessResponse({
      status: 'success',
      stats: stats
    }, headers);
    
  } catch (error) {
    console.error('Error en getRSVPStats:', error);
    return createErrorResponse('Error obteniendo estadísticas', 500, headers);
  }
}

// Guardar datos en Google Sheets
function saveToSheet(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      console.error('Hoja no encontrada:', SHEET_NAME);
      return false;
    }
    
    // Verificar si ya existe una confirmación para este ID
    const existingRow = findExistingRSVP(sheet, data.id);
    
    if (existingRow) {
      // Actualizar confirmación existente
      sheet.getRange(existingRow, 1, 1, 6).setValues([[
        data.id,
        data.nombre,
        data.pases,
        data.ninos,
        data.fecha_confirmacion,
        data.ip
      ]]);
    } else {
      // Agregar nueva confirmación
      sheet.appendRow([
        data.id,
        data.nombre,
        data.pases,
        data.ninos,
        data.fecha_confirmacion,
        data.ip
      ]);
    }
    
    return true;
    
  } catch (error) {
    console.error('Error guardando en Sheet:', error);
    return false;
  }
}

// Buscar RSVP existente
function findExistingRSVP(sheet, invitadoId) {
  try {
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) { // Empezar desde la segunda fila (después del header)
      if (data[i][0] === invitadoId) {
        return i + 1; // +1 porque getRange usa índices basados en 1
      }
    }
    
    return null;
    
  } catch (error) {
    console.error('Error buscando RSVP existente:', error);
    return null;
  }
}

// Obtener estado de RSVP
function getRSVPStatus(invitadoId) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return { confirmed: false, data: null };
    }
    
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === invitadoId) {
        return {
          confirmed: true,
          data: {
            id: data[i][0],
            nombre: data[i][1],
            pases: data[i][2],
            ninos: data[i][3],
            fecha_confirmacion: data[i][4]
          }
        };
      }
    }
    
    return { confirmed: false, data: null };
    
  } catch (error) {
    console.error('Error obteniendo estado RSVP:', error);
    return { confirmed: false, data: null };
  }
}

// Calcular estadísticas
function calculateRSVPStats() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return { total: 0, confirmados: 0, pendientes: 0 };
    }
    
    const data = sheet.getDataRange().getValues();
    const totalRows = data.length - 1; // Excluir header
    
    let totalPases = 0;
    let totalNinos = 0;
    
    for (let i = 1; i < data.length; i++) {
      totalPases += parseInt(data[i][2]) || 0;
      totalNinos += parseInt(data[i][3]) || 0;
    }
    
    return {
      total_invitados: totalRows,
      total_pases: totalPases,
      total_ninos: totalNinos,
      fecha_actualizacion: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error calculando estadísticas:', error);
    return { error: 'Error calculando estadísticas' };
  }
}

// Enviar notificación por email (opcional)
function sendNotificationEmail(rsvpData) {
  try {
    // Configurar destinatarios
    const recipients = ['tu-email@gmail.com']; // Cambia por tu email
    
    const subject = `Nueva confirmación de RSVP - ${rsvpData.nombre}`;
    const body = `
      <h2>Nueva Confirmación de RSVP</h2>
      <p><strong>Invitado:</strong> ${rsvpData.nombre}</p>
      <p><strong>ID:</strong> ${rsvpData.id}</p>
      <p><strong>Pases:</strong> ${rsvpData.pases}</p>
      <p><strong>Niños:</strong> ${rsvpData.ninos}</p>
      <p><strong>Fecha:</strong> ${new Date(rsvpData.fecha_confirmacion).toLocaleString('es-ES')}</p>
      <p><strong>IP:</strong> ${rsvpData.ip}</p>
    `;
    
    MailApp.sendEmail({
      to: recipients.join(','),
      subject: subject,
      htmlBody: body
    });
    
  } catch (error) {
    console.error('Error enviando email:', error);
  }
}

// Crear respuesta de éxito
function createSuccessResponse(data, headers) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}

// Crear respuesta de error
function createErrorResponse(message, statusCode, headers) {
  const errorData = {
    status: 'error',
    message: message,
    statusCode: statusCode
  };
  
  return ContentService.createTextOutput(JSON.stringify(errorData))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}

// Función para crear la hoja de cálculo inicial
function createInitialSheet() {
  try {
    const spreadsheet = SpreadsheetApp.create('RSVP Boda Alejandra y Gerardo');
    const sheet = spreadsheet.getActiveSheet();
    
    // Configurar headers
    sheet.getRange(1, 1, 1, 6).setValues([
      ['ID', 'Nombre', 'Pases', 'Niños', 'Fecha Confirmación', 'IP']
    ]);
    
    // Formatear headers
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    sheet.getRange(1, 1, 1, 6).setBackground('#d1b7a0');
    
    // Ajustar ancho de columnas
    sheet.setColumnWidth(1, 100); // ID
    sheet.setColumnWidth(2, 200); // Nombre
    sheet.setColumnWidth(3, 80);  // Pases
    sheet.setColumnWidth(4, 80);  // Niños
    sheet.setColumnWidth(5, 180); // Fecha
    sheet.setColumnWidth(6, 120); // IP
    
    // Renombrar hoja
    sheet.setName(SHEET_NAME);
    
    console.log('Hoja creada con ID:', spreadsheet.getId());
    return spreadsheet.getId();
    
  } catch (error) {
    console.error('Error creando hoja:', error);
    return null;
  }
}

// Función para limpiar datos de prueba
function clearTestData() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 6).clear();
      }
    }
    
    console.log('Datos de prueba eliminados');
    
  } catch (error) {
    console.error('Error limpiando datos:', error);
  }
} 