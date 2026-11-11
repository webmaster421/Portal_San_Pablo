import { NextResponse } from "next/server";
import config from "@payload-config";
import { getPayload } from "payload";

let payloadReady = false;
let payloadError: string | null = null;

/**
 * Intenta inicializar el cliente de Payload una sola vez.
 * Se llama en la primera petición al health check y se reutiliza
 * en las subsiguientes para no repetir el costo de inicialización.
 */
async function ensurePayloadInitialized(): Promise<void> {
  if (payloadReady || payloadError) return;
  try {
    await getPayload({ config });
    payloadReady = true;
  } catch (error) {
    payloadError = error instanceof Error ? error.message : String(error);
  }
}

export async function GET() {
  await ensurePayloadInitialized();

  if (payloadError) {
    return NextResponse.json(
      {
        status: "unhealthy",
        ready: false,
        error: payloadError,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "ok",
    ready: payloadReady,
  });
}
