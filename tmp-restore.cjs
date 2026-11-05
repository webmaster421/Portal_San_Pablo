const Database = require('better-sqlite3');
const db = new Database('C:\\dev\\SanPablo\\apps\\cms\\payload.db');

// Restaurar producto id=1 a valores originales
const result = db.prepare(`
  UPDATE products 
  SET title = ?, slug = ?, isbn = ?, author = ?, price = ?, updated_at = ?
  WHERE id = 1
`).run(
  'Producto 1',
  'producto-1',
  '9789587686012',
  'san pablo',
  11000,
  new Date().toISOString()
);
console.log('Filas restauradas en producto id=1:', result.changes);

// Verificar
const row = db.prepare('SELECT id, title, slug, isbn, author, price, status, visible FROM products WHERE id = 1').get();
console.log('Producto id=1 restaurado:', JSON.stringify(row));

db.close();
