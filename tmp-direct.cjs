const http = require('http');

function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
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
  try {
    const r = await post('/api/v1/products', {
      payloadId: 99995,
      title: 'Producto Directo ' + TS,
      slug: 'producto-directo-' + TS,
      isbn: '555' + TS,
      author: 'Directo',
      price: 3000,
      status: 'published',
      visible: true,
      inventory: 0
    });
    console.log('POST directo:', r.status, r.body);
  } catch (e) {
    console.log('Error POST directo:', e.message);
  }
})();
