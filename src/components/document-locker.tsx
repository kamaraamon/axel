"use client";

import { FileText, PenLine, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DocumentKind, FuelDocument } from "@/lib/documents";

const KIND_LABEL: Record<DocumentKind, string> = {
  "bon-chargement": "Bon de chargement",
  signature: "Signature",
};

function formatSize(size: number) {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
}

export function DocumentLocker({ tripId, compact = false }: { tripId: string; compact?: boolean }) {
  const [documents, setDocuments] = useState<FuelDocument[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const refresh = useCallback(async () => {
    const response = await fetch(`/api/documents?tripId=${encodeURIComponent(tripId)}`);
    const data = await response.json() as { ok?: boolean; documents?: FuelDocument[]; error?: string };
    if (!data.ok) {
      setStatus(data.error ?? "Blob indisponible");
      return;
    }
    setDocuments(data.documents ?? []);
    setStatus(null);
  }, [tripId]);

  useEffect(() => {
    void refresh().catch(() => setStatus("Blob indisponible"));
  }, [refresh]);

  async function upload(kind: DocumentKind, file: File) {
    setBusy(true);
    setStatus(null);
    const form = new FormData();
    form.set("tripId", tripId);
    form.set("kind", kind);
    form.set("file", file);
    const response = await fetch("/api/documents", { method: "POST", body: form });
    const data = await response.json() as { ok?: boolean; error?: string };
    setBusy(false);
    if (!data.ok) {
      setStatus(data.error ?? "Envoi impossible");
      return;
    }
    await refresh();
  }

  async function remove(pathname: string) {
    setBusy(true);
    const response = await fetch("/api/documents", {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pathname }),
    });
    const data = await response.json() as { ok?: boolean; error?: string };
    setBusy(false);
    if (!data.ok) {
      setStatus(data.error ?? "Suppression impossible");
      return;
    }
    await refresh();
  }

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function saveSignature() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      void upload("signature", new File([blob], "signature.png", { type: "image/png" }));
    }, "image/png");
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  return (
    <article className={`card document-locker ${compact ? "document-locker-compact" : ""}`}>
      <header className="card-header">
        <div>
          <span className="eyebrow">Pièces du voyage</span>
          <h3>Bons et signatures</h3>
        </div>
        <b>{tripId}</b>
      </header>
      <div className="document-actions">
        <label className="ghost-button">
          <Upload size={14} /> Bon de chargement
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) void upload("bon-chargement", file);
            }}
          />
        </label>
        <div className="signature-pad">
          <span><PenLine size={14} /> Signature</span>
          <canvas
            ref={canvasRef}
            width={640}
            height={180}
            aria-label="Zone de signature"
            onPointerDown={(event) => {
              drawing.current = true;
              const context = canvasRef.current?.getContext("2d");
              if (!context) return;
              const cursor = point(event);
              context.strokeStyle = "#001529";
              context.lineWidth = 2.5;
              context.lineCap = "round";
              context.beginPath();
              context.moveTo(cursor.x, cursor.y);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!drawing.current) return;
              const context = canvasRef.current?.getContext("2d");
              if (!context) return;
              const cursor = point(event);
              context.lineTo(cursor.x, cursor.y);
              context.stroke();
            }}
            onPointerUp={() => { drawing.current = false; }}
            onPointerLeave={() => { drawing.current = false; }}
          />
          <div>
            <button type="button" className="ghost-button" onClick={clearSignature} disabled={busy}>Effacer</button>
            <button type="button" className="primary-button" onClick={saveSignature} disabled={busy}>Enregistrer la signature</button>
          </div>
        </div>
      </div>
      {status && <p className="document-status">{status}</p>}
      <ul className="document-list">
        {documents.length === 0 && <li className="document-empty">Aucun bon ni signature pour ce voyage.</li>}
        {documents.map((document) => (
          <li key={document.pathname}>
            <FileText size={16} />
            <span>
              <strong>{KIND_LABEL[document.kind]}</strong>
              <small>{document.name} · {formatSize(document.size)}</small>
            </span>
            <a href={`/api/documents/content?pathname=${encodeURIComponent(document.pathname)}`} target="_blank" rel="noreferrer">Ouvrir</a>
            <button type="button" aria-label={`Supprimer ${document.name}`} onClick={() => void remove(document.pathname)} disabled={busy}><Trash2 size={14} /></button>
          </li>
        ))}
      </ul>
    </article>
  );
}
