/**
 * Script de sincronización inicial de categorías Payload → NestJS.
 *
 * Sincroniza categorías que ya existían en Payload CMS antes de implementar
 * el hook afterChange. Es idempotente: ejecutarlo varias veces no duplica
 * registros porque NestJS usa upsert por payloadId.
 *
 * Uso:
 *   pnpm --filter @portal/cms exec tsx scripts/sync-initial-categories.ts
 *
 * Requisitos de entorno (apps/cms/.env):
 *   API_URL=http://localhost:3003
 *   HMAC_SYNC_SECRET=...
 *   PORT=3001
 *   DATABASE_URL=file:./payload.db
 */

import { getPayload } from "payload";
import { syncCategoryToNestJS } from "../src/sync/nestjs-sync";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

async function main() {
  console.log("Iniciando sincronización inicial de categorías...");

  const payload = await getPayload({
    config: path.resolve(dirname, "../src/payload.config.ts"),
  });

  // Obtener todas las categorías de Payload
  const categories = await payload.find({
    collection: "categories",
    depth: 0,
    limit: 100,
  });

  console.log(`Categorías encontradas en Payload: ${categories.totalDocs}`);

  let success = 0;
  let failed = 0;

  for (const category of categories.docs) {
    console.log(
      `Procesando categoría payloadId=${category.id} nombre="${category.name}" slug="${category.slug}"`,
    );

    try {
      // Resolver imageUrl si existe una imagen asociada
      let imageUrl: string | null = null;

      if (category.image) {
        if (
          typeof category.image === "object" &&
          category.image !== null &&
          !Array.isArray(category.image) &&
          "url" in category.image
        ) {
          // Ya es un objeto poblado con url
          imageUrl = (category.image as { url?: string }).url ?? null;
        } else {
          // Es un ID numérico de media: consultar la colección Media
          try {
            const media = await payload.findByID({
              collection: "media",
              id: category.image as number,
            });
            const mediaUrl = (media as { url?: string }).url ?? null;
            if (mediaUrl) {
              imageUrl = mediaUrl.startsWith("http")
                ? mediaUrl
                : `http://localhost:${process.env.PORT ?? 3001}${mediaUrl}`;
            }
          } catch {
            // Si no se puede resolver el medio, se deja imageUrl como null.
          }
        }
      }

      // Sincronizar con NestJS reutilizando syncCategoryToNestJS()
      await syncCategoryToNestJS({
        payloadId: category.id,
        name: category.name,
        slug: category.slug,
        imageUrl,
        description: category.description ?? null,
        active: category.active ?? true,
        order: category.order ?? 0,
        featured: category.featured ?? false,
      });

      console.log(
        `  ✅ Sincronizada: payloadId=${category.id} imageUrl=${imageUrl ?? "null"}`,
      );
      success++;
    } catch (error) {
      console.error(
        `  ❌ Error sincronizando payloadId=${category.id}:`,
        error instanceof Error ? error.message : String(error),
      );
      failed++;
    }
  }

  console.log(
    `\nResumen: ${success} sincronizadas correctamente, ${failed} fallidas.`,
  );

  await payload.db?.destroy?.?.();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});
