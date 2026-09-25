import { parseFuelSnapshot } from "@/lib/fuel-data";
import { ensureFuelSchema, readFuelSnapshot, replaceFuelSnapshot } from "@/lib/fuel-repository";

export const runtime = "nodejs";

function databaseError(error: unknown) {
  if (error instanceof Error && error.message === "DATABASE_URL is not set") {
    return error.message;
  }
  return "Database unavailable";
}

export async function GET() {
  try {
    const snapshot = await readFuelSnapshot();
    return Response.json({ ok: true, ...snapshot });
  } catch (error) {
    return Response.json({ ok: false, error: databaseError(error) }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const snapshot = parseFuelSnapshot(await request.json().catch(() => null));
  if (!snapshot) {
    return Response.json({ ok: false, error: "Invalid fuel snapshot" }, { status: 400 });
  }
  try {
    await ensureFuelSchema();
    await replaceFuelSnapshot(snapshot);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: databaseError(error) }, { status: 503 });
  }
}
