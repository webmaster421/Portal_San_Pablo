const http = require('http');
const crypto = require('crypto');

const HMAC_SECRET = '3f4a8c2e1b7d5f9a0c3e6b2d8f4a1c7e9b5d3f1a0c8e6b4d2f0a7c9e3b1d5f7a';

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

(async () => {
  const TS = String(Date.now());
  const payloadId = 99994;
  
  const syncPayload = {
    payloadId: payloadId,
    title: 'Producto Sync Simple ' + TS,
    slug: 'sync-simple-' + TS,
    isbn: '444' + TS,
    author: 'Sync Simple',
    price: 1000,
    status: 'published',
    visible: true,
    inventory: 0
  };

  console.log('Enviando payload:', JSON.stringify(syncPayload));
  try {
    const r = await postToNest('/api/v1/sync/products', syncPayload);
    console.log('Respuesta sync:', r.status, r.body);
  } catch (e) {
    console.log('Error sync:', e.message);
  }
})();
