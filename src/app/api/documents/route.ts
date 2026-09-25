import {
  deleteTripDocument,
  isDocumentKind,
  listTripDocuments,
  uploadTripDocument,
} from "@/lib/documents";

export const runtime = "nodejs";

function blobError(error: unknown) {
  if (error instanceof Error && (error.message === "BLOB_READ_WRITE_TOKEN is not set" || error.message === "Invalid trip id" || error.message === "Invalid document path" || error.message === "Unsupported document type" || error.message === "Document is empty or too large")) {
    return error.message;
  }
  return "Blob unavailable";
}

export async function GET(request: Request) {
  const tripId = new URL(request.url).searchParams.get("tripId") ?? "";
  try {
    const documents = await listTripDocuments(tripId);
    return Response.json({ ok: true, documents });
  } catch (error) {
    const message = blobError(error);
    const status = message === "Invalid trip id" ? 400 : 503;
    return Response.json({ ok: false, error: message }, { status });
  }
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const tripId = form?.get("tripId");
  const kind = form?.get("kind");
  if (!(file instanceof File) || typeof tripId !== "string" || typeof kind !== "string" || !isDocumentKind(kind)) {
    return Response.json({ ok: false, error: "Invalid document upload" }, { status: 400 });
  }
  try {
    const document = await uploadTripDocument({
      tripId,
      kind,
      filename: file.name || (kind === "signature" ? "signature.png" : "bon.pdf"),
      contentType: file.type || "application/octet-stream",
      body: await file.arrayBuffer(),
    });
    return Response.json({ ok: true, document });
  } catch (error) {
    const message = blobError(error);
    const status = message === "Blob unavailable" || message === "BLOB_READ_WRITE_TOKEN is not set" ? 503 : 400;
    return Response.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null) as { pathname?: unknown } | null;
  if (!body || typeof body.pathname !== "string") {
    return Response.json({ ok: false, error: "Invalid document path" }, { status: 400 });
  }
  try {
    await deleteTripDocument(body.pathname);
    return Response.json({ ok: true });
  } catch (error) {
    const message = blobError(error);
    const status = message === "Invalid document path" ? 400 : 503;
    return Response.json({ ok: false, error: message }, { status });
  }
}
