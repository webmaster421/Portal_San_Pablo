import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";

import { translations } from "@payloadcms/translations/all";

import { Categories } from "./collections/Categories";
import { Media } from "./collections/Media";
import { Products } from "./collections/Products";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// H-02: Payload firma cookies y tokens de sesion con este secreto. Si falta o
// es una cadena vacia, la instancia arrancaria con un secreto predecible.
// Se valida al cargar el modulo, antes de inicializar Payload. En este punto
// el entorno ya esta poblado: Next.js carga .env antes de evaluar la config y
// el CLI de Payload ejecuta loadEnv() antes de importarla.
const payloadSecret = process.env.PAYLOAD_SECRET;

if (typeof payloadSecret !== "string" || payloadSecret.trim().length === 0) {
  // No se incluye ningun valor en el mensaje.
  throw new Error(
    "PAYLOAD_SECRET no esta definido. Defina la variable de entorno " +
      "PAYLOAD_SECRET (por ejemplo en apps/cms/.env) antes de iniciar el CMS. " +
      "Sin ella, las sesiones y los tokens no pueden firmarse de forma segura.",
  );
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: "es",
    supportedLanguages: { es: translations.es },
  },
  collections: [Users, Categories, Media, Products],
  editor: lexicalEditor(),
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || "file:./payload.db",
    },
  }),
  plugins: [],
});
