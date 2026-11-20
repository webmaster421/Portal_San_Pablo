import { NextResponse } from "next/server";

/**
 * Health check básico del servidor CMS.
 * Responde sin inicializar Payload ni comprobar la base de datos.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      message: "CMS server responding",
    },
    { status: 200 }
  );
}
