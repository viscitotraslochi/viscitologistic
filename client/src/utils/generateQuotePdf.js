import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// helper: pulizia numeri tipo "1.500,00"
function parseEuro(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  if (!s) return null;
  // rimuove simboli e spazi, gestisce formato IT
  const normalized = s
    .replace(/[€\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

function euro(n) {
  if (n === null || n === undefined) return "";
  return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
}

export function generateQuotePdf({
  formData,
  inventoryList,
  azienda = {
    nome: "Viscito Traslochi & Trasporti",
    indirizzo: "Salerno, Via Martin Luther King, 5 Salerno (84132)",
    telefoni: ["3663370679", "3397882956"],
    sito: "www.viscitotraslochi.com",
    piva: "PI 03616700658",
    ragSoc: "rag. soc. Viscito Servizi di Viscito Bruno",
  },
  // opzionale: base64 del logo (PNG/JPG). Se non lo passi, niente logo.
  logoDataUrl = null,
}) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;

  // --- Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(azienda.nome, margin, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(azienda.indirizzo, margin, 24);
  doc.text(`Tel: ${azienda.telefoni.join(" - ")}`, margin, 29);

  // Logo top-right (se disponibile)
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", pageW - 55, 10, 40, 22);
    } catch (_) {}
  }

  // linea
  doc.setDrawColor(220);
  doc.line(margin, 33, pageW - margin, 33);

  // --- Watermark semplice (opzionale: riusa logo se c’è)
  if (logoDataUrl) {
    try {
      // jsPDF recente supporta setGState; se non c’è, salta senza errori
      const GState = doc.GState;
      if (GState) {
        doc.setGState(new GState({ opacity: 0.08 }));
        doc.addImage(logoDataUrl, "PNG", 35, 60, 140, 80);
        doc.setGState(new GState({ opacity: 1 }));
      }
    } catch (_) {}
  }

  // --- Dati cliente / lavoro (dinamici)
  const y0 = 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PREVENTIVO", margin, y0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const lines = [
    `Cliente: ${formData.cliente_nome || "-"}`,
    `Telefono: ${formData.phone || "-"}   Email: ${formData.email || "-"}`,
    `Partenza: ${formData.da_indirizzo || "-"} (Piano: ${formData.piano_partenza ?? "-"}, Asc.: ${formData.ascensore_partenza_
