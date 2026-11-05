import http from 'http';

function get(url) {
  return new Promise((resolve, reject) => {
    const options = { hostname: 'localhost', port: 3001, path: url, method: 'GET' };
    const req = http.request(options, (res) => {
      let r = '';
      res.on('data', c => r += c);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: r }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  // Verificar admin panel
  const adminResp = await get('/admin');
  console.log('Admin panel status:', adminResp.status);
  console.log('Admin panel content-type:', adminResp.headers['content-type']);
  console.log('Admin panel body starts with:', adminResp.body.substring(0, 200));
  console.log('Set-Cookie:', adminResp.headers['set-cookie']);
  
  // Verificar login endpoint
  const loginResp = await get('/api/users/login');
  console.log('\nLogin GET status:', loginResp.status);
}

main().catch(e => console.error('Error:', e.message));
