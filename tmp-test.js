const Database = require('better-sqlite3');
const db = new Database('C:\\dev\\SanPablo\\apps\\cms\\payload.db', { readonly: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tablas:', tables.map(t => t.name));
try {
  const users = db.prepare('SELECT id, email FROM users').all();
  console.log('Usuarios:', JSON.stringify(users));
} catch (e) {
  console.log('Error consultando users:', e.message);
}
db.close();
