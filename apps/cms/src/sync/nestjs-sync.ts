/**
 * Cliente de sincronización unidireccional Payload CMS → NestJS API.
 *
 * Envía productos a través de un endpoint interno protegido por HMAC-SHA256.
 * Implementa reintentos con backoff exponencial (3 intentos: 1s, 2s, 4s).
 * Nunca lanza excepción que falle la operación en Payload: los errores se
 * registran en consola para permitir operación continua del CMS.
 *
 * Formato HMAC (idéntico al validado por HmacAuthGuard en NestJS):
 *   X-Timestamp: segundos época (Unix timestamp)
 *   X-Hmac-Signature: sha256=<hex>
 *   Firma = HMAC-SHA256(HMAC_SYNC_SECRET, "${timestamp}.${cuerpoJSON}")
 */

import * as crypto from "crypto";

function getApiUrl(): string {
  const url = process.env.API_URL;
  if (!url || url.trim().length === 0) {
    throw new Error(
      "API_URL no está definida. Defina la variable de entorno API_URL " +
        "(por ejemplo http://localhost:3000) en apps/cms/.env antes de sincronizar con NestJS.",
    );
  }
  return url.replace(/\/$/, "");
}

function getHmacSecret(): string {
  const secret = process.env.HMAC_SYNC_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      "HMAC_SYNC_SECRET no está definida. Defina la variable de entorno " +
        "HMAC_SYNC_SECRET (valor compartido con NestJS) en apps/cms/.env.",
    );
  }
  return secret;
}

function makeHmacSignature(rawBody: string, timestamp: string): string {
  return crypto
    .createHmac("sha256", getHmacSecret())
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithRetry(
  url: string,
  method: "POST" | "PATCH",
  body: string,
  maxAttempts = 3,
): Promise<void> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = `sha256=${makeHmacSignature(body, timestamp)}`;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-timestamp": timestamp,
          "x-hmac-signature": signature,
        },
        body,
      });

      if (response.ok) {
        return;
      }

      const errorText = await response
        .text()
        .catch(() => "<sin cuerpo de respuesta>");
      lastError = new Error(
        `HTTP ${response.status}: ${errorText}`,
      );

      // Errores de cliente (4xx) no se reintentan salvo 409 (conflicto) y 429 (rate limit)
      if (response.status >= 400 && response.status < 500) {
        if (response.status === 409 || response.status === 429) {
          // Reintentables
        } else {
          throw lastError;
        }
      }
    } catch (error) {
      lastError = error;
    }

    if (attempt < maxAttempts) {
      await sleep(Math.pow(2, attempt) * 1000); // 2s, 4s
    }
  }

  throw lastError || new Error("Error desconocido al comunicarse con NestJS");
}

/**
 * Mapea los campos de un producto de Payload al contrato de sincronización de NestJS.
 * No inventa conversiones de precios, impuestos o inventario.
 */
export function mapPayloadProductToSync(data: any): Record<string, unknown> {
  const image = data.image;
  const category = data.category;
  const dimensions = data.dimensions;

  return {
    payloadId: data.id,
    title: data.title,
    slug: data.slug,
    isbn: data.isbn,
    author: data.author,
    price: data.price,
    imageUrl:
      typeof image === "object" && image !== null && "url" in image
        ? (image as { url?: string }).url
        : null,
    categoryName:
      typeof category === "object" && category !== null && "name" in category
        ? (category as { name?: string }).name
        : null,
    categoryPayloadId:
      typeof category === "object" && category !== null
        ? (category as { id?: number }).id ?? null
        : null,
    weight: data.weight ?? null,
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
    description: data.description ?? null,
    status: data.status ?? "draft",
    appliesTax: data.appliesTax ?? false,
    taxValue: data.taxValue ?? null,
    appliesShipping: data.appliesShipping ?? false,
    pages: data.pages ?? null,
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    tags: Array.isArray(data.tags) ? data.tags : [],
    isNew: data.isNew ?? false,
    visible: data.visible ?? true,
    inventory: data.inventory ?? 0,
  };
}

/**
 * Envía un producto creado o actualizado a NestJS (upsert idempotente por payloadId).
 * Reintenta internamente mediante requestWithRetry. Si falla tras agotar los
 * reintentos, lanza el error para que el hook de Payload lo registre con contexto.
 * No interrumpe la operación en el CMS: el hook atrapará y registrará el error.
 */
export async function syncProductToNestJS(
  payload: Record<string, unknown>,
): Promise<void> {
  const body = JSON.stringify(payload);
  const url = `${getApiUrl()}/api/v1/sync/products`;
  await requestWithRetry(url, "POST", body);
}

/**
 * Desactiva lógicamente un producto en NestJS cuando se elimina de Payload.
 * Nunca borra físicamente: pone visible=false y status='draft'.
 * Reintenta internamente mediante requestWithRetry. Si falla, lanza el error.
 */
export async function deactivateProductInNestJS(
  payloadId: number,
): Promise<void> {
  const body = JSON.stringify({});
  const url = `${getApiUrl()}/api/v1/sync/products/${payloadId}/deactivate`;
  await requestWithRetry(url, "PATCH", body);
}

/**
 * Envía una categoría creada o actualizada a NestJS (upsert idempotente por payloadId).
 * Reintenta internamente mediante requestWithRetry. Si falla tras agotar los
 * reintentos, lanza el error para que el hook de Payload lo registre con contexto.
 * No interrumpe la operación en el CMS: el hook atrapará y registrará el error.
 */
export async function syncCategoryToNestJS(
  payload: Record<string, unknown>,
): Promise<void> {
  const body = JSON.stringify(payload);
  const url = `${getApiUrl()}/api/v1/sync/categories`;
  await requestWithRetry(url, "POST", body);
}

/**
 * Envía un banner creado o actualizado a NestJS (upsert idempotente por payloadId).
 * Reintenta internamente mediante requestWithRetry. Si falla tras agotar los
 * reintentos, lanza el error para que el hook de Payload lo registre con contexto.
 * No interrumpe la operación en el CMS: el hook atrapará y registrará el error.
 */
export async function syncBannerToNestJS(
  payload: Record<string, unknown>,
): Promise<void> {
  const body = JSON.stringify(payload);
  const url = `${getApiUrl()}/api/v1/sync/banners`;
  await requestWithRetry(url, "POST", body);
}

/**
 * Desactiva lógicamente un banner en NestJS cuando se elimina de Payload.
 * Nunca borra físicamente: pone active=false.
 * Reintenta internamente mediante requestWithRetry. Si falla, lanza el error.
 */
export async function deactivateBannerInNestJS(
  payloadId: number,
): Promise<void> {
  const body = JSON.stringify({});
  const url = `${getApiUrl()}/api/v1/sync/banners/${payloadId}/deactivate`;
  await requestWithRetry(url, "PATCH", body);
}
