const Database = require('better-sqlite3');
const db = new Database('C:\\dev\\SanPablo\\apps\\cms\\payload.db', { readonly: true });
const products = db.prepare('SELECT id, title, slug, status, visible, price FROM products ORDER BY id DESC LIMIT 5').all();
console.log('Últimos 5 productos en SQLite:');
products.forEach(p => console.log(' ', JSON.stringify(p)));
db.close();
