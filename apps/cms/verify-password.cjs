const Database = require('C:/dev/SanPablo/apps/cms/node_modules/better-sqlite3');
const crypto = require('crypto');
const db = new Database('C:/dev/SanPablo/apps/cms/payload.db', { readonly: true });

const email = 'webmaster@sanpablo.com.co';
const password = 'Admin123456*';

const user = db.prepare('SELECT id, email, salt, hash FROM users WHERE email = ?').get(email);
if (!user) {
  console.log(`Usuario ${email} no encontrado`);
  db.close();
  process.exit(1);
}

console.log('Usuario encontrado:');
console.log(`  ID:   ${user.id}`);
console.log(`  Salt: ${user.salt}`);
console.log(`  Hash: ${user.hash}`);

// Extraer iteraciones y algoritmo del hash si tiene formato pbkdf2-sha256-v1:hash
const hashMatch = user.hash.match(/^pbkdf2-sha256-v1:([0-9a-f]+)$/i);
if (!hashMatch) {
  console.log('\n⚠️  El hash no tiene el formato esperado pbkdf2-sha256-v1:<hex>');
  console.log('    Puede que Payload use un formato diferente o iteraciones distintas.');
  db.close();
  process.exit(1);
}

const storedHash = hashMatch[1];
console.log(`\nStored hash (hex): ${storedHash}`);
console.log(`Stored hash length: ${storedHash.length} chars (${storedHash.length / 4} bytes)`);

// Probar con diferentes iteraciones comunes
const testIterations = [250000, 100000, 600000, 210000];
const keylen = storedHash.length / 2; // bytes

console.log('\nProbando coincidencia con diferentes iteraciones:');
for (const iter of testIterations) {
  const derived = crypto.pbkdf2Sync(password, user.salt, iter, keylen, 'sha256');
  const derivedHex = derived.toString('hex');
  const match = derivedHex === storedHash;
  console.log(`  Iteraciones ${iter}: ${match ? '✓ COINCIDE' : '✗ no coincide'}`);
  if (match) {
    console.log(`\n✅ La contraseña es correcta con ${iter} iteraciones`);
  }
}

db.close();
