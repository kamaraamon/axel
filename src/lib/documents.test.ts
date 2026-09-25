import { describe, expect, it } from "vitest";
import { assertUpload, buildDocumentPath, parseDocumentPath } from "./documents";

describe("document paths", () => {
  it("builds a private trip path for a loading slip", () => {
    const pathname = buildDocumentPath("PF-2026-0925", "bon-chargement", "Bon GESTOCI.pdf", 10);
    expect(pathname).toBe("trips/PF-2026-0925/bon-chargement/10-Bon-GESTOCI.pdf");
    expect(parseDocumentPath(pathname)?.kind).toBe("bon-chargement");
  });

  it("rejects a path outside the trip folder", () => {
    expect(parseDocumentPath("../secret")).toBeNull();
    expect(parseDocumentPath("trips/PF-2026-0925/autre/file.pdf")).toBeNull();
  });

  it("rejects an empty or oversized upload", () => {
    expect(() => assertUpload({ contentType: "application/pdf", size: 0 })).toThrow(/too large|empty/);
    expect(() => assertUpload({ contentType: "text/plain", size: 12 })).toThrow(/Unsupported/);
  });
});
