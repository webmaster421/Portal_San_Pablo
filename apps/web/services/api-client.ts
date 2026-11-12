/**
 * Cliente HTTP base para llamadas a la API central de NestJS.
 *
 * Centraliza la URL de la API y el manejo de errores HTTP para evitar
 * duplicar la lógica de fetch en cada servicio o componente.
 *
 * Las peticiones se realizan únicamente a través de NEXT_PUBLIC_API_URL.
 * Nunca se expone ADMIN_API_KEY ni HMAC_SYNC_SECRET al frontend.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_URL no está definida. Defina la variable de entorno " +
      "en apps/web/.env antes de usar el cliente de API.",
  );
}

/**
 * Realiza una petición HTTP a la API central.
 *
 * @param path - Ruta relativa bajo el prefijo api/v1 (ej. "/banners").
 * @param init - Opciones de fetch (method, headers, body, etc.).
 * @returns Respuesta parseada como JSON.
 * @throws Error con el status y mensaje si la respuesta no es exitosa.
 */
export async function apiFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let errorMessage = `Error ${response.status} al llamar a ${path}`;
    try {
      const body = await response.json();
      errorMessage =
        (body as { message?: string }).message ?? errorMessage;
    } catch {
      // Ignorar si el cuerpo no es JSON, se usa el mensaje por defecto.
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
