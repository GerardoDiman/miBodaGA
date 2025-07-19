// Setup para tests de Jest

// Mock del DOM
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.location = dom.window.location;
global.history = dom.window.history;

// Mock de localStorage
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

// Mock de sessionStorage
global.sessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};

// Mock de fetch
global.fetch = jest.fn();

// Mock de URL y URLSearchParams
global.URL = dom.window.URL;
global.URLSearchParams = dom.window.URLSearchParams;

// Mock de console para tests
global.console = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock de setTimeout y setInterval
global.setTimeout = jest.fn((callback, delay) => {
  return setTimeout(callback, delay);
});

global.setInterval = jest.fn((callback, delay) => {
  return setInterval(callback, delay);
});

global.clearTimeout = jest.fn();
global.clearInterval = jest.fn();

// Mock de requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => {
  return setTimeout(callback, 16);
});

global.cancelAnimationFrame = jest.fn();

// Mock de IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock de ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock de MutationObserver
global.MutationObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn()
}));

// Mock de Performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => [])
};

// Mock de Service Worker
global.ServiceWorkerRegistration = jest.fn().mockImplementation(() => ({
  scope: 'http://localhost',
  updateViaCache: 'all',
  installing: null,
  waiting: null,
  active: null,
  navigationPreload: {
    getState: jest.fn(() => Promise.resolve({ enabled: false }))
  },
  pushManager: {
    subscribe: jest.fn(() => Promise.resolve({})),
    getSubscription: jest.fn(() => Promise.resolve(null))
  },
  showNotification: jest.fn(() => Promise.resolve()),
  getNotifications: jest.fn(() => Promise.resolve([])),
  update: jest.fn(() => Promise.resolve()),
  unregister: jest.fn(() => Promise.resolve(true))
}));

// Mock de Notification
global.Notification = jest.fn().mockImplementation((title, options) => ({
  title,
  options,
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}));

global.Notification.permission = 'granted';
global.Notification.requestPermission = jest.fn(() => Promise.resolve('granted'));

// Mock de navigator.serviceWorker
Object.defineProperty(global.navigator, 'serviceWorker', {
  value: {
    register: jest.fn(() => Promise.resolve(new ServiceWorkerRegistration())),
    getRegistration: jest.fn(() => Promise.resolve(new ServiceWorkerRegistration())),
    getRegistrations: jest.fn(() => Promise.resolve([])),
    ready: Promise.resolve(new ServiceWorkerRegistration()),
    controller: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  },
  writable: true
});

// Mock de navigator.onLine
Object.defineProperty(global.navigator, 'onLine', {
  value: true,
  writable: true
});

// Mock de matchMedia
global.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
}));

// Mock de window.crypto
global.crypto = {
  getRandomValues: jest.fn(arr => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
  subtle: {
    generateKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
    digest: jest.fn(),
    deriveKey: jest.fn(),
    deriveBits: jest.fn(),
    importKey: jest.fn(),
    exportKey: jest.fn(),
    wrapKey: jest.fn(),
    unwrapKey: jest.fn()
  }
};

// Mock de Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { setValueAtTime: jest.fn() }
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { setValueAtTime: jest.fn() }
  })),
  createMediaElementSource: jest.fn(() => ({
    connect: jest.fn()
  })),
  resume: jest.fn(() => Promise.resolve()),
  suspend: jest.fn(() => Promise.resolve()),
  close: jest.fn(() => Promise.resolve())
}));

// Mock de Web Audio API
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn(() => Promise.resolve()),
  pause: jest.fn(),
  load: jest.fn(),
  canPlayType: jest.fn(() => 'probably'),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
  paused: true,
  ended: false,
  readyState: 0
}));

// Mock de Image
global.Image = jest.fn().mockImplementation(() => ({
  src: '',
  alt: '',
  width: 0,
  height: 0,
  naturalWidth: 0,
  naturalHeight: 0,
  complete: false,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}));

// Mock de Canvas API
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn()
}));

// Mock de File API
global.File = jest.fn().mockImplementation((content, name, options) => ({
  name: name || 'test.txt',
  size: content ? content.length : 0,
  type: options?.type || 'text/plain',
  lastModified: Date.now(),
  slice: jest.fn(),
  stream: jest.fn(),
  text: jest.fn(() => Promise.resolve(content || '')),
  arrayBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(0)))
}));

global.FileReader = jest.fn().mockImplementation(() => ({
  readAsText: jest.fn(),
  readAsDataURL: jest.fn(),
  readAsArrayBuffer: jest.fn(),
  result: null,
  error: null,
  readyState: 0,
  onload: null,
  onerror: null,
  onloadend: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
}));

// Mock de Blob
global.Blob = jest.fn().mockImplementation((content, options) => ({
  size: content ? content.length : 0,
  type: options?.type || 'text/plain',
  slice: jest.fn(),
  stream: jest.fn(),
  text: jest.fn(() => Promise.resolve(content || '')),
  arrayBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(0)))
}));

// Mock de FormData
global.FormData = jest.fn().mockImplementation(() => ({
  append: jest.fn(),
  delete: jest.fn(),
  get: jest.fn(),
  getAll: jest.fn(),
  has: jest.fn(),
  set: jest.fn(),
  forEach: jest.fn(),
  entries: jest.fn(() => []),
  keys: jest.fn(() => []),
  values: jest.fn(() => [])
}));

// Mock de Headers
global.Headers = jest.fn().mockImplementation((init) => {
  const headers = new Map();
  
  if (init) {
    Object.entries(init).forEach(([key, value]) => {
      headers.set(key.toLowerCase(), value);
    });
  }
  
  return {
    append: jest.fn((name, value) => headers.set(name.toLowerCase(), value)),
    delete: jest.fn((name) => headers.delete(name.toLowerCase())),
    get: jest.fn((name) => headers.get(name.toLowerCase())),
    has: jest.fn((name) => headers.has(name.toLowerCase())),
    set: jest.fn((name, value) => headers.set(name.toLowerCase(), value)),
    forEach: jest.fn((callback) => headers.forEach(callback)),
    entries: jest.fn(() => headers.entries()),
    keys: jest.fn(() => headers.keys()),
    values: jest.fn(() => headers.values())
  };
});

// Mock de Response
global.Response = jest.fn().mockImplementation((body, init) => ({
  body,
  bodyUsed: false,
  headers: new Headers(init?.headers),
  ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
  redirected: false,
  status: init?.status || 200,
  statusText: init?.statusText || '',
  type: 'default',
  url: init?.url || '',
  clone: jest.fn(() => new Response(body, init)),
  json: jest.fn(() => Promise.resolve(JSON.parse(body))),
  text: jest.fn(() => Promise.resolve(body)),
  blob: jest.fn(() => Promise.resolve(new Blob([body]))),
  arrayBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(body.length))),
  formData: jest.fn(() => Promise.resolve(new FormData()))
}));

// Mock de Request
global.Request = jest.fn().mockImplementation((input, init) => ({
  method: init?.method || 'GET',
  url: typeof input === 'string' ? input : input.url,
  headers: new Headers(init?.headers),
  body: init?.body || null,
  bodyUsed: false,
  mode: init?.mode || 'cors',
  credentials: init?.credentials || 'same-origin',
  cache: init?.cache || 'default',
  redirect: init?.redirect || 'follow',
  referrer: init?.referrer || 'client',
  integrity: init?.integrity || '',
  clone: jest.fn(() => new Request(input, init))
}));

// Configurar fetch mock por defecto
global.fetch.mockResolvedValue(new Response('{}', { status: 200 }));

// Función helper para limpiar mocks entre tests
global.clearAllMocks = () => {
  jest.clearAllMocks();
  localStorage.getItem.mockClear();
  localStorage.setItem.mockClear();
  localStorage.removeItem.mockClear();
  sessionStorage.getItem.mockClear();
  sessionStorage.setItem.mockClear();
  sessionStorage.removeItem.mockClear();
  console.log.mockClear();
  console.warn.mockClear();
  console.error.mockClear();
};

// Función helper para simular eventos del DOM
global.simulateEvent = (element, eventType, options = {}) => {
  const event = new dom.window.Event(eventType, { bubbles: true, ...options });
  element.dispatchEvent(event);
  return event;
};

// Función helper para esperar que se resuelvan todas las promesas
global.flushPromises = () => new Promise(resolve => setImmediate(resolve));

// Configurar timeout para tests
jest.setTimeout(10000);

// Configurar entorno de test
process.env.NODE_ENV = 'test'; 