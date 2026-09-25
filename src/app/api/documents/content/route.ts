import { readTripDocument } from "@/lib/documents";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const pathname = new URL(request.url).searchParams.get("pathname") ?? "";
  try {
    const document = await readTripDocument(pathname);
    if (!document) {
      return Response.json({ ok: false, error: "Document not found" }, { status: 404 });
    }
    const filename = document.name.replace(/["\r\n]/g, "");
    return new Response(document.stream, {
      headers: {
        "content-type": document.contentType || "application/octet-stream",
        "content-disposition": `inline; filename="${filename}"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error && error.message === "BLOB_READ_WRITE_TOKEN is not set"
      ? error.message
      : error instanceof Error && error.message === "Invalid document path"
        ? error.message
        : "Blob unavailable";
    const status = message === "Invalid document path" ? 400 : 503;
    return Response.json({ ok: false, error: message }, { status });
  }
}
