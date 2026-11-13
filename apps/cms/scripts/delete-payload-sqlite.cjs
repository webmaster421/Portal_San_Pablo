/**
 * Elimina todas las categorías de la base de datos SQLite de Payload.
 * Usa better-sqlite3 directamente.
 *
 * Uso:
 *   node scripts/delete-payload-sqlite.cjs
 */

const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.resolve(__dirname, "../payload.db");
const db = new Database(dbPath);

// Respaldo previo: mostrar lo que se va a eliminar
const before = db.prepare("SELECT * FROM categories").all();
console.log(`Categorías antes de eliminar: ${before.length}`);
before.forEach((c) => {
  console.log(
    ` - id=${c.id} name="${c.name}" slug="${c.slug}" image_id=${c.image_id} active=${c.active} featured=${c.featured}`,
  );
});

// Eliminar todas las categorías
const result = db.prepare("DELETE FROM categories").run();
console.log(`\nEliminadas: ${result.changes} filas`);

// Verificar
const after = db.prepare("SELECT COUNT(*) as cnt FROM categories").get();
console.log(`Categorías restantes: ${after.cnt}`);

db.close();
