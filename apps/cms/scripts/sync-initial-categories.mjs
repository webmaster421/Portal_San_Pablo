/**
 * Script de sincronización inicial de categorías Payload → NestJS.
 *
 * Sincroniza categorías que ya existían en Payload CMS antes de implementar
 * el hook afterChange. Es idempotente: ejecutarlo varias veces no duplica
 * registros porque NestJS usa upsert por payloadId.
 *
 * Reutiliza la misma lógica que syncCategoryToNestJS():
 *  - Endpoint: POST /api/v1/sync/categories
 *  - Autenticación: HMAC-SHA256 con HMAC_SYNC_SECRET
 *  - Identificador de correspondencia: payloadId (upsert idempotente)
 *
 * Uso:
 *   node scripts/sync-initial-categories.mjs
 *
 * Requisitos de entorno (apps/cms/.env):
 *   API_URL=http://localhost:3003
 *   HMAC_SYNC_SECRET=...
 *   PORT=3001
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function getEnv(key, fallback) {
  return process.env[key] ?? fallback ?? "";
}

function makeHmacSignature(rawBody, timestamp, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, options, maxAttempts = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return await response.json().catch(() => ({}));
      }
      const errorText = await response.text().catch(() => "<sin cuerpo>");
      lastError = new Error(`HTTP ${response.status}: ${errorText}`);
      if (response.status >= 400 && response.status < 500) {
        if (response.status === 409 || response.status === 429) {
          // reintentables
        } else {
          throw lastError;
        }
      }
    } catch (error) {
      lastError = error;
    }
    if (attempt < maxAttempts) {
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }
  throw lastError || new Error("Error desconocido al comunicarse con NestJS");
}

async function syncCategoryToNestJS(payload, apiUrl, secret) {
  const body = JSON.stringify(payload);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = `sha256=${makeHmacSignature(body, timestamp, secret)}`;
  const url = `${apiUrl.replace(/\/$/, "")}/api/v1/sync/categories`;
  return fetchWithRetry(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-timestamp": timestamp,
      "x-hmac-signature": signature,
    },
    body,
  });
}

async function main() {
  const envPath = path.resolve(process.cwd(), ".env");
  loadEnv(envPath);

  const apiUrl = getEnv("API_URL");
  const hmacSecret = getEnv("HMAC_SYNC_SECRET");
  const cmsPort = getEnv("PORT", "3001");
  const cmsUrl = `http://localhost:${cmsPort}`;

  if (!apiUrl || !hmacSecret) {
    console.error(
      "Faltan variables de entorno: API_URL y HMAC_SYNC_SECRET son obligatorias.",
    );
    process.exit(1);
  }

  console.log("Iniciando sincronización inicial de categorías...");
  console.log(`CMS URL: ${cmsUrl}`);
  console.log(`API URL: ${apiUrl}`);

  // Obtener todas las categorías de Payload vía REST API
  const categoriesRes = await fetch(`${cmsUrl}/api/categories?limit=100&depth=0`);
  if (!categoriesRes.ok) {
    throw new Error(
      `Error obteniendo categorías de Payload: HTTP ${categoriesRes.status}`,
    );
  }
  const categoriesData = await categoriesRes.json();

  console.log(
    `Categorías encontradas en Payload: ${categoriesData.totalDocs ?? 0}`,
  );

  let success = 0;
  let failed = 0;

  for (const category of categoriesData.docs ?? []) {
    console.log(
      `Procesando categoría payloadId=${category.id} nombre="${category.name}" slug="${category.slug}"`,
    );

    try {
      // Resolver imageUrl si existe una imagen asociada
      let imageUrl = null;

      if (category.image) {
        if (
          typeof category.image === "object" &&
          category.image !== null &&
          !Array.isArray(category.image) &&
          "url" in category.image
        ) {
          imageUrl = category.image.url ?? null;
        } else {
          // Es un ID numérico de media: consultar la colección Media
          try {
            const mediaId = Number(category.image);
            const mediaRes = await fetch(`${cmsUrl}/api/media/${mediaId}`);
            if (mediaRes.ok) {
              const media = await mediaRes.json();
              const mediaUrl = media.url ?? null;
              if (mediaUrl) {
                imageUrl = mediaUrl.startsWith("http")
                  ? mediaUrl
                  : `${cmsUrl}${mediaUrl}`;
              }
            }
          } catch {
            // Si no se puede resolver el medio, se deja imageUrl como null.
          }
        }
      }

      // Sincronizar con NestJS (misma lógica que syncCategoryToNestJS)
      await syncCategoryToNestJS(
        {
          payloadId: category.id,
          name: category.name,
          slug: category.slug,
          imageUrl,
          description: category.description ?? null,
          active: category.active ?? true,
          order: category.order ?? 0,
          featured: category.featured ?? false,
        },
        apiUrl,
        hmacSecret,
      );

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
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Error fatal:", error);
  process.exit(1);
});
