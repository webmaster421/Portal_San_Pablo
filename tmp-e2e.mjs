import Database from 'better-sqlite3';
import http from 'http';
import crypto from 'crypto';

const HMAC_SECRET = '3f4a8c2e1b7d5f9a0c3e6b2d8f4a1c7e9b5d3f1a0c8e6b4d2f0a7c9e3b1d5f7a';
const PAYLOAD_ID = 99996;
const TS = String(Date.now());

// Paso 1: Insertar producto de prueba en SQLite
const db = new Database('C:\\dev\\SanPablo\\apps\\cms\\payload.db');
const now = new Date().toISOString();
db.prepare(`
  INSERT INTO products (isbn, title, slug, author, image_id, weight, dimensions_width, dimensions_height, description, price, category_id, status, updated_at, created_at, applies_tax, tax_value, applies_shipping, pages, is_new, visible, inventory)
  VALUES (?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, ?, ?, ?, ?, ?, 0, NULL, 0, NULL, 0, 1, 0)
`).run(
  '666' + TS,
  'Producto de Prueba Sync ' + TS,
  'producto-de-prueba-sync-' + TS,
  'Automatizado',
  5000,
  1,
  'published',
  now,
  now
);
console.log('PASO 1: Producto insertado en SQLite con id=', PAYLOAD_ID);

const row = db.prepare('SELECT id, title, slug, status, visible FROM products WHERE id = ?').get(PAYLOAD_ID);
console.log('   Verificación SQLite:', JSON.stringify(row));
db.close();

function postToNest(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = 'sha256=' + crypto.createHmac('sha256', HMAC_SECRET).update(timestamp + '.' + data).digest('hex');
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'X-Timestamp': timestamp,
        'X-Hmac-Signature': signature
      }
    };
    const req = http.request(options, (res) => {
      let r = '';
      res.on('data', c => r += c);
      res.on('end', () => resolve({ status: res.statusCode, body: r }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

const syncPayload = {
  payloadId: PAYLOAD_ID,
  title: 'Producto de Prueba Sync',
  slug: 'producto-de-prueba-sync',
  isbn: '9999999999999',
  author: 'Automatizado',
  price: 5000,
  imageUrl: null,
  categoryName: null,
  weight: null,
  width: null,
  height: null,
  description: null,
  status: 'published',
  appliesTax: false,
  taxValue: null,
  appliesShipping: false,
  pages: null,
  keywords: [],
  tags: [],
  isNew: false,
  visible: true,
  inventory: 0
};

console.log('PASO 2: Enviando producto a NestJS vía /api/v1/sync/products...');
const syncResp = await postToNest('/api/v1/sync/products', syncPayload);
console.log('   Respuesta NestJS:', syncResp.status, syncResp.body);

function getFromNest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: 'GET'
    };
    const req = http.request(options, (res) => {
      let r = '';
      res.on('data', c => r += c);
      res.on('end', () => resolve({ status: res.statusCode, body: r }));
    });
    req.on('error', reject);
    req.end();
  });
}

console.log('PASO 3: Consultando producto en PostgreSQL vía GET /api/v1/products...');
const productsResp = await getFromNest('/api/v1/products');
const products = JSON.parse(productsResp.body);
const found = products.find(p => p.payloadId === PAYLOAD_ID);
console.log('   Producto encontrado en PostgreSQL:', found ? JSON.stringify(found) : 'NO ENCONTRADO');

console.log('PASO 4: Actualizando precio en SQLite y re-sincronizando...');
const db2 = new Database('C:\\dev\\SanPablo\\apps\\cms\\payload.db');
db2.prepare('UPDATE products SET price = ?, updated_at = ? WHERE id = ?').run(7500, new Date().toISOString(), PAYLOAD_ID);
db2.close();

const syncPayload2 = { ...syncPayload, price: 7500 };
const syncResp2 = await postToNest('/api/v1/sync/products', syncPayload2);
console.log('   Respuesta sincronización actualización:', syncResp2.status, syncResp2.body);

const productsResp2 = await getFromNest('/api/v1/products');
const products2 = JSON.parse(productsResp2.body);
const found2 = products2.find(p => p.payloadId === PAYLOAD_ID);
console.log('   Precio en PostgreSQL tras actualización:', found2 ? found2.price : 'NO ENCONTRADO');

console.log('PASO 5: Probando idempotencia (envío duplicado del mismo payloadId)...');
const syncResp3 = await postToNest('/api/v1/sync/products', syncPayload2);
console.log('   Respuesta envío duplicado:', syncResp3.status, syncResp3.body);

const productsResp3 = await getFromNest('/api/v1/products');
const products3 = JSON.parse(productsResp3.body);
const count = products3.filter(p => p.payloadId === PAYLOAD_ID).length;
console.log('   Cantidad de registros con payloadId=' + PAYLOAD_ID + ' en PostgreSQL:', count, '(debe ser 1)');

console.log('PASO 6: Probando rechazo de firma HMAC inválida...');
function postBadHmac(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'X-Timestamp': String(Math.floor(Date.now() / 1000)),
        'X-Hmac-Signature': 'sha256=firmainvalida'
      }
    };
    const req = http.request(options, (res) => {
      let r = '';
      res.on('data', c => r += c);
      res.on('end', () => resolve({ status: res.statusCode, body: r }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}
const badResp = await postBadHmac('/api/v1/sync/products', syncPayload);
console.log('   Respuesta con HMAC inválido:', badResp.status, badResp.body.substring(0, 200));

console.log('\n=== PRUEBAS COMPLETADAS ===');
