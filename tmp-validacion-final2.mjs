import Database from 'better-sqlite3';
import http from 'http';
import crypto from 'crypto';

const HMAC_SECRET = '3f4a8c2e1b7d5f9a0c3e6b2d8f4a1c7e9b5d3f1a0c8e6b4d2f0a7c9e3b1d5f7a';
const TS = String(Date.now());

let sessionCookie = null;

function request(method, url, port, body = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: port,
      path: url,
      method: method,
      headers: {
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(sessionCookie ? { Cookie: sessionCookie } : {}),
        ...extraHeaders
      }
    };
    const req = http.request(options, (res) => {
      let r = '';
      res.on('data', c => r += c);
      res.on('end', () => {
        const sc = res.headers['set-cookie'];
        if (sc) sessionCookie = sc.join('; ');
        resolve({ status: res.statusCode, headers: res.headers, body: r });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('=== VALIDACIÓN FINAL: Sincronización Payload CMS → NestJS → PostgreSQL ===\n');

  // Paso 1: Login al CMS
  console.log('PASO 1: Haciendo login en Payload CMS...');
  const loginResp = await request('POST', '/api/users/login', 3001, {
    email: 'webmaster@sanpablo.com.co',
    password: 'Colombia2026*'
  });
  console.log('   Status login:', loginResp.status);
  if (loginResp.status !== 200) {
    console.log('   Error login:', loginResp.body);
    process.exit(1);
  }
  console.log('   Cookie de sesión obtenida: SÍ');

  // Paso 2: Crear producto de prueba desde Payload CMS API
  console.log('\nPASO 2: Creando producto de prueba en Payload CMS...');
  const producto = {
    title: 'Producto de Validación Final',
    slug: 'producto-validacion-final-' + TS,
    isbn: 'VAL' + TS,
    author: 'Validación',
    price: 5000,
    category: 1,
    status: 'published',
    visible: true,
    inventory: 0,
    appliesTax: false,
    appliesShipping: false,
    isNew: false,
    weight: null,
    pages: null,
    keywords: ['validacion', 'test'],
    tags: ['prueba'],
    description: null
  };

  const createResp = await request('POST', '/api/products', 3001, producto);
  console.log('   Status creación:', createResp.status);
  console.log('   Respuesta creación:', createResp.body.substring(0, 800));
  if (createResp.status !== 201 && createResp.status !== 200) {
    console.log('   ERROR: No se pudo crear el producto en Payload');
    process.exit(1);
  }

  const created = JSON.parse(createResp.body);
  const doc = created.doc || created;
  const payloadId = doc.id;
  console.log('   Producto creado en SQLite con id (payloadId):', payloadId);

  // Paso 3: Verificar que está en SQLite
  console.log('\nPASO 3: Verificando producto en SQLite...');
  const db = new Database('C:\\dev\\SanPablo\\apps\\cms\\payload.db', { readonly: true });
  const sqliteRow = db.prepare('SELECT id, title, slug, status, visible FROM products WHERE id = ?').get(payloadId);
  console.log('   En SQLite:', sqliteRow ? JSON.stringify(sqliteRow) : 'NO ENCONTRADO');
  db.close();

  // Paso 4: Verificar que llegó a PostgreSQL vía NestJS
  console.log('\nPASO 4: Verificando producto en PostgreSQL vía GET /api/v1/products...');
  const productsResp = await request('GET', '/api/v1/products', 3002);
  const products = JSON.parse(productsResp.body);
  const found = products.find(p => p.payloadId === payloadId);
  console.log('   En PostgreSQL:', found ? JSON.stringify(found) : 'NO ENCONTRADO');

  if (!found) {
    console.log('\n❌ FALLO CRÍTICO: El producto NO se sincronizó a PostgreSQL');
    process.exit(1);
  }
  console.log('   ✅ Producto sincronizado correctamente a PostgreSQL');

  // Paso 5: Actualizar precio desde Payload y verificar en PostgreSQL
  console.log('\nPASO 5: Actualizando precio en Payload CMS...');
  const updateResp = await request('PATCH', `/api/products/${payloadId}`, 3001, {
    price: 9500
  });
  console.log('   Status actualización:', updateResp.status);

  console.log('   Verificando cambio en PostgreSQL...');
  const productsResp2 = await request('GET', '/api/v1/products', 3002);
  const products2 = JSON.parse(productsResp2.body);
  const found2 = products2.find(p => p.payloadId === payloadId);
  console.log('   Precio en PostgreSQL:', found2 ? found2.price : 'NO ENCONTRADO', '(esperado: 9500)');

  if (found2 && found2.price === 9500) {
    console.log('   ✅ Precio actualizado correctamente en PostgreSQL');
  } else {
    console.log('   ❌ FALLO: El precio no se actualizó en PostgreSQL');
  }

  // Paso 6: Verificar que HMAC inválido es rechazado
  console.log('\nPASO 6: Verificando que HMAC inválido es rechazado...');
  const badResp = await request('POST', '/api/v1/sync/products', 3002, {
    payloadId: 99990,
    title: 'Test HMAC',
    slug: 'test-hmac-invalid',
    isbn: 'test-hmac',
    author: 'test',
    price: 1
  }, {
    'X-Timestamp': String(Math.floor(Date.now() / 1000)),
    'X-Hmac-Signature': 'sha256=firmainvalida'
  });
  console.log('   Respuesta HMAC inválido:', badResp.status, badResp.body.substring(0, 100));
  if (badResp.status === 401) {
    console.log('   ✅ HMAC inválido correctamente rechazado');
  }

  // Paso 7: Idempotencia - re-sincronizar mismo producto
  console.log('\nPASO 7: Probando idempotencia (re-sincronización del mismo producto)...');
  const syncPayload = {
    payloadId: payloadId,
    title: doc.title,
    slug: doc.slug,
    isbn: doc.isbn,
    author: doc.author,
    price: doc.price,
    imageUrl: null,
    categoryName: doc.category?.name || null,
    weight: doc.weight,
    width: doc.dimensions?.width || null,
    height: doc.dimensions?.height || null,
    description: doc.description,
    status: doc.status,
    appliesTax: doc.appliesTax,
    taxValue: doc.taxValue,
    appliesShipping: doc.appliesShipping,
    pages: doc.pages,
    keywords: doc.keywords || [],
    tags: doc.tags || [],
    isNew: doc.isNew,
    visible: doc.visible,
    inventory: doc.inventory
  };

  const syncResp = await request('POST', '/api/v1/sync/products', 3002, syncPayload, {
    'X-Timestamp': String(Math.floor(Date.now() / 1000)),
    'X-Hmac-Signature': 'sha256=' + crypto.createHmac('sha256', HMAC_SECRET).update(String(Math.floor(Date.now() / 1000)) + '.' + JSON.stringify(syncPayload)).digest('hex')
  });
  console.log('   Respuesta re-sync:', syncResp.status, syncResp.body.substring(0, 200));

  const productsResp3 = await request('GET', '/api/v1/products', 3002);
  const products3 = JSON.parse(productsResp3.body);
  const count = products3.filter(p => p.payloadId === payloadId).length;
  console.log('   Registros con payloadId=' + payloadId + ':', count, '(debe ser 1)');
  if (count === 1) {
    console.log('   ✅ Idempotencia verificada: no hay duplicados');
  }

  console.log('\n=== VALIDACIÓN COMPLETADA ===');
  console.log('Producto de prueba creado con payloadId:', payloadId);
  console.log('Puedes consultarlo en: GET http://localhost:3002/api/v1/products');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
