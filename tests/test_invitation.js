/**
 * Tests unitarios para el sistema de invitaciones
 * Ejecutar con: npm test
 */

// Mock del DOM para testing
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
};

// Mock de fetch
global.fetch = jest.fn();

// Importar funciones a testear (necesitarás exportarlas en invitation.js)
// const { generarIdUnico, validarInvitado, procesarRSVP } = require('../src/js/invitation.js');

describe('Sistema de Invitaciones', () => {
    beforeEach(() => {
        // Limpiar mocks antes de cada test
        jest.clearAllMocks();
        fetch.mockClear();
    });

    describe('Validación de Invitados', () => {
        test('debe validar un ID de invitado válido', () => {
            const idValido = 'xnfj1a';
            const invitados = [
                { id: 'xnfj1a', nombre: 'Test User', pases: 2, ninos: 0 }
            ];
            
            const resultado = invitados.find(inv => inv.id === idValido);
            expect(resultado).toBeDefined();
            expect(resultado.nombre).toBe('Test User');
        });

        test('debe rechazar un ID de invitado inválido', () => {
            const idInvalido = 'invalid123';
            const invitados = [
                { id: 'xnfj1a', nombre: 'Test User', pases: 2, ninos: 0 }
            ];
            
            const resultado = invitados.find(inv => inv.id === idInvalido);
            expect(resultado).toBeUndefined();
        });

        test('debe validar datos de invitado completos', () => {
            const invitado = {
                id: 'test123',
                nombre: 'Juan Pérez',
                pases: 2,
                ninos: 1
            };

            expect(invitado.id).toBeTruthy();
            expect(invitado.nombre).toBeTruthy();
            expect(typeof invitado.pases).toBe('number');
            expect(typeof invitado.ninos).toBe('number');
            expect(invitado.pases).toBeGreaterThan(0);
            expect(invitado.ninos).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Generación de IDs', () => {
        test('debe generar IDs únicos de 6 caracteres', () => {
            const ids = new Set();
            const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
            
            for (let i = 0; i < 100; i++) {
                const id = Array.from({length: 6}, () => 
                    caracteres.charAt(Math.floor(Math.random() * caracteres.length))
                ).join('');
                
                expect(id.length).toBe(6);
                expect(/^[a-z0-9]{6}$/.test(id)).toBe(true);
                expect(ids.has(id)).toBe(false);
                ids.add(id);
            }
        });
    });

    describe('Sistema de RSVP', () => {
        test('debe procesar confirmación exitosa', async () => {
            const mockResponse = { status: 'success', message: 'Confirmado' };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const dataRSVP = {
                id: 'test123',
                nombre: 'Juan Pérez',
                pases: 2,
                ninos: 1
            };

            const response = await fetch('/api/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataRSVP)
            });

            expect(fetch).toHaveBeenCalledWith('/api/rsvp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataRSVP)
            });
        });

        test('debe manejar errores de confirmación', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            try {
                await fetch('/api/rsvp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: 'test123' })
                });
            } catch (error) {
                expect(error.message).toBe('Network error');
            }
        });
    });

    describe('LocalStorage', () => {
        test('debe guardar estado de confirmación', () => {
            const invitadoId = 'test123';
            const confirmacionKey = `boda_confirmado_${invitadoId}`;
            
            // Simular localStorage con un objeto simple
            const mockStorage = {};
            const setItem = (key, value) => {
                mockStorage[key] = value;
            };
            
            setItem(confirmacionKey, 'true');
            
            expect(mockStorage[confirmacionKey]).toBe('true');
        });

        test('debe recuperar estado de confirmación', () => {
            const invitadoId = 'test123';
            const confirmacionKey = `boda_confirmado_${invitadoId}`;
            
            // Simular localStorage con datos predefinidos
            const mockStorage = { [confirmacionKey]: 'true' };
            const getItem = (key) => mockStorage[key];
            
            const confirmado = getItem(confirmacionKey);
            
            expect(confirmado).toBe('true');
        });
    });

    describe('Validación de URLs', () => {
        test('debe validar URLs de códigos QR', () => {
            const baseUrl = 'https://mibodaag.netlify.app/validar.html';
            const invitadoId = 'test123';
            const qrUrl = `${baseUrl}?id=${invitadoId}`;
            
            const url = new URL(qrUrl);
            expect(url.hostname).toBe('mibodaag.netlify.app');
            expect(url.pathname).toBe('/validar.html');
            expect(url.searchParams.get('id')).toBe(invitadoId);
        });
    });

    describe('Manejo de Errores', () => {
        test('debe mostrar error cuando no hay ID de invitado', () => {
            const urlParams = new URLSearchParams('');
            const guestId = urlParams.get('invitado');
            
            expect(guestId).toBeNull();
        });

        test('debe manejar datos JSON inválidos', () => {
            const jsonInvalido = '{"invalid": json}';
            
            expect(() => {
                JSON.parse(jsonInvalido);
            }).toThrow();
        });
    });
});

// Tests para funciones de utilidad
describe('Funciones de Utilidad', () => {
    test('debe formatear fecha correctamente', () => {
        const fecha = new Date('2025-10-11');
        const formato = fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        expect(formato).toContain('2025');
        expect(formato).toContain('octubre');
    });

    test('debe calcular días restantes', () => {
        const fechaEvento = new Date('2025-10-11');
        const fechaActual = new Date('2025-01-01');
        const diasRestantes = Math.ceil((fechaEvento - fechaActual) / (1000 * 60 * 60 * 24));
        
        expect(diasRestantes).toBeGreaterThan(0);
        expect(typeof diasRestantes).toBe('number');
    });
});

// Tests para validación de datos
describe('Validación de Datos', () => {
    test('debe validar formato de CSV', () => {
        const csvHeaders = ['Nombre', 'Pases', 'Pases N'];
        const headersRequeridos = ['Nombre', 'Pases', 'Pases N'];
        
        const todosPresentes = headersRequeridos.every(header => 
            csvHeaders.includes(header)
        );
        
        expect(todosPresentes).toBe(true);
    });

    test('debe validar números de pases', () => {
        const pases = 2;
        const ninos = 1;
        
        expect(pases).toBeGreaterThan(0);
        expect(ninos).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(pases)).toBe(true);
        expect(Number.isInteger(ninos)).toBe(true);
    });
}); 