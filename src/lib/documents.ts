import { del, get, list, put } from "@vercel/blob";

export const DOCUMENT_KINDS = ["bon-chargement", "signature"] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;

const ALLOWED_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

export type FuelDocument = {
  pathname: string;
  tripId: string;
  kind: DocumentKind;
  name: string;
  size: number;
  contentType: string;
  uploadedAt: string;
};

export function assertTripId(tripId: string) {
  if (!/^[A-Za-z0-9-]{1,40}$/.test(tripId)) {
    throw new Error("Invalid trip id");
  }
}

export function isDocumentKind(value: string): value is DocumentKind {
  return (DOCUMENT_KINDS as readonly string[]).includes(value);
}

export function safeFileName(filename: string) {
  const base = filename.split(/[/\\]/).pop() ?? "document";
  const cleaned = base
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return cleaned || "document";
}

export function buildDocumentPath(tripId: string, kind: DocumentKind, filename: string, now = Date.now()) {
  assertTripId(tripId);
  return `trips/${tripId}/${kind}/${now}-${safeFileName(filename)}`;
}

export function parseDocumentPath(pathname: string) {
  if (pathname.includes("..") || pathname.includes("\\") || pathname.startsWith("/")) return null;
  const match = /^trips\/([A-Za-z0-9-]{1,40})\/(bon-chargement|signature)\/([^/]+)$/.exec(pathname);
  if (!match) return null;
  const [, tripId, kind, stored] = match;
  const name = stored.replace(/^\d+-/, "") || stored;
  return { tripId, kind: kind as DocumentKind, name };
}

export function assertUpload(input: { contentType: string; size: number }) {
  if (!ALLOWED_TYPES.has(input.contentType)) {
    throw new Error("Unsupported document type");
  }
  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > MAX_DOCUMENT_BYTES) {
    throw new Error("Document is empty or too large");
  }
}

function requireBlobToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  }
}

function toDocument(blob: { pathname: string; size: number; uploadedAt: Date }, contentType = ""): FuelDocument | null {
  const parsed = parseDocumentPath(blob.pathname);
  if (!parsed) return null;
  return {
    pathname: blob.pathname,
    tripId: parsed.tripId,
    kind: parsed.kind,
    name: parsed.name,
    size: blob.size,
    contentType,
    uploadedAt: blob.uploadedAt.toISOString(),
  };
}

export async function listTripDocuments(tripId: string) {
  requireBlobToken();
  assertTripId(tripId);
  const documents: FuelDocument[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: `trips/${tripId}/`, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      const document = toDocument(blob);
      if (document) documents.push(document);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return documents.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export async function uploadTripDocument(input: {
  tripId: string;
  kind: DocumentKind;
  filename: string;
  contentType: string;
  body: ArrayBuffer;
}) {
  requireBlobToken();
  assertUpload({ contentType: input.contentType, size: input.body.byteLength });
  const pathname = buildDocumentPath(input.tripId, input.kind, input.filename);
  const blob = await put(pathname, Buffer.from(input.body), {
    access: "private",
    contentType: input.contentType,
    addRandomSuffix: false,
  });
  const parsed = parseDocumentPath(blob.pathname);
  if (!parsed) return null;
  return {
    pathname: blob.pathname,
    tripId: parsed.tripId,
    kind: parsed.kind,
    name: parsed.name,
    size: input.body.byteLength,
    contentType: blob.contentType || input.contentType,
    uploadedAt: new Date().toISOString(),
  };
}

export async function deleteTripDocument(pathname: string) {
  requireBlobToken();
  if (!parseDocumentPath(pathname)) {
    throw new Error("Invalid document path");
  }
  await del(pathname);
}

export async function readTripDocument(pathname: string) {
  requireBlobToken();
  const parsed = parseDocumentPath(pathname);
  if (!parsed) {
    throw new Error("Invalid document path");
  }
  const result = await get(pathname, { access: "private" });
  if (!result || result.statusCode !== 200 || !result.stream) return null;
  return { ...parsed, stream: result.stream, contentType: result.blob.contentType };
}
