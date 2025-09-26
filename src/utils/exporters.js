// src/utils/exporters.js

// Normaliza filas a objetos { "Etiqueta": valor }
function buildLabeledRows(rows, columns) {
  return rows.map((r, i) => {
    const obj = {};
    columns.forEach((c, idx) => {
      const label = c.label ?? c.key ?? `Col ${idx + 1}`;
      const val = typeof c.get === "function" ? c.get(r, i) : r[c.key] ?? "";
      obj[label] = val;
    });
    return obj;
  });
}

function autoFitColumnsFromObjects(objs) {
  if (!objs?.length) return [];
  const headers = Object.keys(objs[0]);
  return headers.map((h) => {
    let maxLen = h.length;
    for (const row of objs) {
      const v = String(row[h] ?? "");
      if (v.length > maxLen) maxLen = v.length;
    }
    return { wch: Math.min(maxLen + 2, 60) }; // tope razonable
  });
}

/** CSV simple (siempre disponible) */
export function exportToCSV({ rows, columns, filename = "export.csv" }) {
  const labeled = buildLabeledRows(rows, columns);
  if (!labeled.length) return;

  const headers = Object.keys(labeled[0]);
  const esc = (v) =>
    `"${String(v ?? "")
      .replace(/"/g, '""')
      .replace(/\n/g, " ")
      .trim()}"`;

  const csv =
    headers.map(esc).join(",") +
    "\n" +
    labeled.map((r) => headers.map((h) => esc(r[h])).join(",")).join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** XLSX con auto ancho + autofiltro + freeze fila 1 */
export async function exportToXLSX({
  rows,
  columns,
  sheetName = "Hoja1",
  filename = "export.xlsx",
}) {
  const XLSX = await import("xlsx"); // carga perezosa
  const labeled = buildLabeledRows(rows, columns);
  const ws = XLSX.utils.json_to_sheet(labeled);

  // auto ancho columnas
  const cols = autoFitColumnsFromObjects(labeled);
  if (cols.length) ws["!cols"] = cols;

  // autofiltro y freeze de encabezado
  if (ws["!ref"]) {
    const range = XLSX.utils.decode_range(ws["!ref"]);
    ws["!autofilter"] = { ref: XLSX.utils.encode_range(range) };
  }
  ws["!freeze"] = {
    xSplit: 0,
    ySplit: 1,
    topLeftCell: "A2",
    activePane: "bottomLeft",
    state: "frozen",
  };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename); // descarga directa
}

/** PDF con jsPDF + autotable */
export async function exportToPDF({
  title = "Reporte",
  rows,
  columns, // [{label, key, get?}]
  filename = "export.pdf",
  landscape = true,
}) {
  const { default: jsPDF } = await import("jspdf"); // carga perezosa
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF(landscape ? "landscape" : "portrait");
  const marginX = 14;
  const startY = 22;

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, marginX, 14);
  doc.setDrawColor(200, 200, 200);
  doc.line(marginX, 16, doc.internal.pageSize.width - marginX, 16);

  const head = [columns.map((c) => c.label ?? c.key ?? "")];
  const body = rows.map((r, i) =>
    columns.map((c) =>
      typeof c.get === "function" ? c.get(r, i) : r[c.key] ?? ""
    )
  );

  autoTable(doc, {
    startY,
    head,
    body,
    margin: { horizontal: marginX },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
      halign: "center",
    },
    headStyles: {
      fillColor: [22, 160, 133],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawPage(data) {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        doc.internal.pageSize.width - marginX,
        doc.internal.pageSize.height - 8,
        { align: "right" }
      );
      doc.text(
        `Generado: ${new Date().toLocaleString("es-HN")}`,
        marginX,
        doc.internal.pageSize.height - 8
      );
    },
  });

  doc.save(filename);
}
