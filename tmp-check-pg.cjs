const http = require('http');

function get(url, port) {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'localhost', port: port, path: url, method: 'GET' };
    const req = http.request(options, (res) => {
      let r = '';
      res.on('data', c => r += c);
      res.on('end', () => resolve({ status: res.statusCode, body: r }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const resp = await get('/api/v1/products', 3002);
  const products = JSON.parse(resp.body);
  const p1 = products.find(x => x.payloadId === 1);
  console.log('Producto payloadId=1 en PostgreSQL:');
  console.log(JSON.stringify(p1, null, 2));
}

main().catch(e => console.error('Error:', e.message));
