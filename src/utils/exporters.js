// ======================= Helpers comunes =======================
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
    return { wch: Math.min(maxLen + 2, 60) };
  });
}

function hexToRgb(hex = "#6fe6b1") {
  const m = hex.replace("#", "");
  const full =
    m.length === 3
      ? m
          .split("")
          .map((x) => x + x)
          .join("")
      : m;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function todayStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(
    d.getHours()
  )}:${p(d.getMinutes())}`;
}

/** Cargar imagen => { dataUrl, width, height } */
async function getImageDataUrlWithSize(url) {
  const res = await fetch(url, { cache: "no-cache" });
  const blob = await res.blob();
  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
  const dim = await new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = dataUrl;
  });
  return { dataUrl, ...dim };
}

function stripDataUrlPrefix(dataUrl = "") {
  const i = dataUrl.indexOf(",");
  return i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
}

// ---- helpers para ExcelJS ----
function sanitizeCell(v) {
  const s = String(v ?? "");
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, " ");
}

function numToColLetter(n) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s || "A";
}

// ======================= CSV =======================
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

// ======================= XLSX (ExcelJS) =======================
export async function exportToXLSX({
  rows,
  columns,
  sheetName = "Hoja1",
  filename = "export.xlsx",
  title = "Reporte",
  orientation = "landscape", // "portrait" | "landscape"
  logoUrl = "/newLogoTecnasa.png",
  footerBgHex = "#6fe6b1",
  footerHeight = 16, // ↑ lo subimos para que quepa el texto
  footerSideMarginCols = 1, // orillas blancas laterales
  includeGeneratedStamp = true, // ← NUEVO: muestra la fecha en el pie
}) {
  const ExcelJSPkg =
    (await import("exceljs/dist/exceljs.min.js")).default ||
    (await import("exceljs/dist/exceljs.min.js"));
  const ExcelJS = ExcelJSPkg;

  // 1) Datos normalizados
  const labeledRaw = (rows || []).map((r, i) => {
    const obj = {};
    (columns || []).forEach((c, idx) => {
      const label = c.label ?? c.key ?? `Col ${idx + 1}`;
      const val = typeof c.get === "function" ? c.get(r, i) : r?.[c.key] ?? "";
      obj[label] = sanitizeCell(val);
    });
    return obj;
  });

  const headers = labeledRaw.length
    ? Object.keys(labeledRaw[0])
    : (columns || []).map((c, idx) => c.label ?? c.key ?? `Col ${idx + 1}`);
  const colCount = Math.max(headers.length, 1);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);

  // 2) Página
  ws.pageSetup = {
    orientation: orientation === "portrait" ? "portrait" : "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: { left: 0.3, right: 0.3, top: 0.5, bottom: 0.5 },
  };
  ws.columns = headers.map(() => ({ width: 16 }));

  // 3) Encabezado (banner blanco con logo izquierda)
  const row1 = ws.addRow(new Array(colCount).fill(""));
  row1.height = 20;
  try {
    if (logoUrl) {
      const { dataUrl } = await getImageDataUrlWithSize(logoUrl);
      const base64 = stripDataUrlPrefix(dataUrl);
      const ext = dataUrl.startsWith("data:image/jpeg") ? "jpeg" : "png";
      const imgId = wb.addImage({ base64, extension: ext });
      ws.addImage(imgId, {
        tl: { col: 0, row: 0 },
        ext: { width: 120, height: 18 },
        editAs: "oneCell",
      });
    }
  } catch {}

  // Título centrado
  const row2 = ws.addRow([title]);
  row2.height = 22;
  ws.mergeCells(2, 1, 2, colCount);
  const tCell = ws.getCell(2, 1);
  tCell.font = { bold: true, size: 14 };
  tCell.alignment = { vertical: "middle", horizontal: "center" };

  // (Quitamos la fecha aquí para no duplicar)

  // 4) Encabezados de tabla
  const headerRowIdx = 4;
  const headRow = ws.addRow(headers);
  headRow.height = 20;
  headRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF6FE6B1" },
    };
    cell.font = { bold: true, color: { argb: "FF000000" }, size: 11 };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFDDDDDD" } },
      bottom: { style: "thin", color: { argb: "FFDDDDDD" } },
      left: { style: "thin", color: { argb: "FFEFEFEF" } },
      right: { style: "thin", color: { argb: "FFEFEFEF" } },
    };
  });

  // 5) Datos
  labeledRaw.forEach((obj) => {
    const vals = headers.map((h) => sanitizeCell(obj[h]));
    const r = ws.addRow(vals);
    r.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });

  // 6) Auto ancho
  const widths = headers.map((h) => {
    let maxLen = sanitizeCell(h).length;
    for (const r of labeledRaw) {
      const v = sanitizeCell(r[h]);
      maxLen = Math.max(maxLen, v.length);
    }
    return Math.min(maxLen + 2, 60);
  });
  ws.columns.forEach((col, i) => (col.width = widths[i] || 16));

  // 7) Congelar + autofiltro
  ws.views = [{ state: "frozen", ySplit: headerRowIdx }];
  ws.autoFilter = `A${headerRowIdx}:${numToColLetter(colCount)}${headerRowIdx}`;

  // 8) Pie verde con orillas + fecha (izquierda dentro del pie)
  const footerRow = ws.addRow(new Array(colCount).fill(""));
  footerRow.height = Math.max(footerHeight, 12);
  const leftWhite = Math.min(footerSideMarginCols, Math.floor(colCount / 3));
  const rightWhite = leftWhite;

  for (let c = 1; c <= colCount; c++) {
    const isGreen = c > leftWhite && c <= colCount - rightWhite;
    if (isGreen) {
      footerRow.getCell(c).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF6FE6B1" },
      };
    }
  }

  if (includeGeneratedStamp) {
    const firstGreenCol = Math.min(leftWhite + 1, colCount);
    const cell = footerRow.getCell(firstGreenCol);
    cell.value = `Generado: ${todayStamp()}`;
    cell.font = { size: 10, color: { argb: "FF666666" } }; // gris
    cell.alignment = { vertical: "middle", horizontal: "left" };
  }

  // 9) Descargar
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ======================= PDF (jsPDF + autotable) =======================
export async function exportToPDF({
  title = "Reporte",
  rows,
  columns, // [{label, key, get?}]
  filename = "export.pdf",
  orientation = "landscape",
  logoUrl = "/newLogoTecnasa.png",
  logoMaxHeight = 18,
  footerBgHex = "#6fe6b1",
  footerHeight = 6,
  footerMarginX = 12, // orillas blancas laterales
  footerMarginBottom = 8, // orilla blanca inferior
  includeGeneratedStamp = true, // ← NUEVO
}) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF(orientation === "landscape" ? "landscape" : "portrait");
  const { r: fr, g: fg, b: fb } = hexToRgb(footerBgHex);

  const w = doc.internal.pageSize.width;
  const h = doc.internal.pageSize.height;
  const marginX = 14;

  // Encabezado blanco con logo a la izquierda
  let headerBottomY = 16;
  try {
    const { dataUrl, width, height } = await getImageDataUrlWithSize(logoUrl);
    const ratio = width && height ? width / height : 5939 / 3063;
    const logoH = logoMaxHeight;
    const logoW = logoH * ratio;
    doc.addImage(dataUrl, "PNG", marginX, 8, logoW, logoH);
    headerBottomY = Math.max(8 + logoH, headerBottomY);
  } catch {}

  // Título centrado (sin fecha aquí para no duplicar)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0);
  doc.text(title, w / 2, headerBottomY + 8, { align: "center" });

  // Tabla
  const head = [columns.map((c) => c.label ?? c.key ?? "")];
  const body = rows.map((r, i) =>
    columns.map((c) =>
      typeof c.get === "function" ? c.get(r, i) : r[c.key] ?? ""
    )
  );

  autoTable(doc, {
    startY: headerBottomY + 16,
    head,
    body,
    margin: { left: marginX, right: marginX },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    didDrawPage(data) {
      // Pie verde con orillas
      const barX = footerMarginX;
      const barW = w - footerMarginX * 2;
      const barY = h - footerMarginBottom - footerHeight;

      doc.setFillColor(fr, fg, fb);
      doc.rect(barX, barY, barW, footerHeight, "F");

      // Fecha a la izquierda (dentro de la franja)
      if (includeGeneratedStamp) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80); // gris
        doc.text(
          `Generado: ${todayStamp()}`,
          barX + 2,
          barY + footerHeight - 2
        );
      }

      // Número de página a la derecha (dentro de la franja)
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(9);
      doc.setTextColor(0);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        barX + barW - 2,
        barY + footerHeight - 2,
        {
          align: "right",
        }
      );
    },
  });

  doc.save(filename);
}
