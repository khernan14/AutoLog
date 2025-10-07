// src/components/export/ExportModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Sheet,
  Stack,
  Divider,
  Input,
  FormControl,
  FormLabel,
  Select,
  Option,
  Switch,
  Button,
  Chip,
  Table,
  IconButton,
  Tooltip,
} from "@mui/joy";
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  ChevronUp,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { exportToCSV, exportToXLSX, exportToPDF } from "@/utils/exporters";
import useIsMobile from "@/hooks/useIsMobile";

function formatValue(val, type = "text") {
  if (val == null) return "";
  switch (type) {
    case "number":
      return new Intl.NumberFormat("es-HN").format(Number(val) || 0);
    case "currency":
      return new Intl.NumberFormat("es-HN", {
        style: "currency",
        currency: "HNL",
        maximumFractionDigits: 2,
      }).format(Number(val) || 0);
    case "date": {
      const d = new Date(val);
      if (isNaN(d)) return String(val);
      return new Intl.DateTimeFormat("es-HN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);
    }
    default:
      return String(val);
  }
}

const DEFAULT_LOGO = "/newLogoTecnasa.png";
const DEFAULT_FOOTER = "#6fe6b1";

export default function ExportDialog({
  open,
  onClose,
  rows = [],
  pageRows = [],
  columns = [],
  defaultTitle = "Reporte",
  defaultSheetName = "Hoja1",
  defaultFilenameBase = "export",
  defaultOrientation = "landscape",
  logoUrl = DEFAULT_LOGO,
}) {
  const isMobile = useIsMobile(768);

  // ===== básicos
  const [fileNameBase, setFileNameBase] = useState(defaultFilenameBase);
  const [title, setTitle] = useState(defaultTitle);
  const [orientation, setOrientation] = useState(defaultOrientation);
  const [sheetName, setSheetName] = useState(defaultSheetName);
  const [scope, setScope] = useState("all"); // "all" | "page"
  const [includeGeneratedStamp, setIncludeGeneratedStamp] = useState(true);
  const [logo, setLogo] = useState(logoUrl);
  const [footerColor, setFooterColor] = useState(DEFAULT_FOOTER);

  // 🚦 estado de carga para evitar doble click
  const [busy, setBusy] = useState(null); // null | "csv" | "xlsx" | "pdf"

  const initialCols = useMemo(
    () =>
      columns.map((c, idx) => ({
        id: idx,
        label: c.label ?? c.key ?? `Col ${idx + 1}`,
        key: c.key ?? `col_${idx}`,
        enabled: true,
        type: "text",
        align: "center",
      })),
    [columns]
  );
  const [cols, setCols] = useState(initialCols);

  useEffect(() => {
    if (open) {
      setFileNameBase(defaultFilenameBase);
      setTitle(defaultTitle);
      setOrientation(defaultOrientation);
      setSheetName(defaultSheetName);
      setScope("all");
      setIncludeGeneratedStamp(true);
      setLogo(logoUrl || DEFAULT_LOGO);
      setFooterColor(DEFAULT_FOOTER);
      setCols(initialCols);
      setBusy(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const dataRows = scope === "page" ? (pageRows?.length ? pageRows : []) : rows;
  const previewRows = useMemo(() => dataRows.slice(0, 5), [dataRows]);

  const selectedCols = cols.filter((c) => c.enabled);
  const colsMapByKey = useMemo(() => {
    const map = new Map();
    for (const c of columns) {
      const k = (c.key ?? "").toString();
      map.set(k, c);
    }
    return map;
  }, [columns]);

  const exporterColumns = useMemo(
    () =>
      selectedCols.map((c) => ({
        label: c.label,
        key: c.key,
        get: (r, i) => {
          const base = colsMapByKey.get(c.key) || {};
          const raw =
            typeof base.get === "function" ? base.get(r, i) : r[c.key];
          return formatValue(raw, c.type);
        },
      })),
    [selectedCols, colsMapByKey]
  );

  function move(idx, dir) {
    const i = idx;
    const j = idx + dir;
    if (j < 0 || j >= cols.length) return;
    const next = cols.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setCols(next);
  }

  function fullFileName(ext) {
    const now = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
    return `${fileNameBase || "export"}_${now}.${ext}`;
  }

  // 🔁 helper para manejar loading/errores
  const runBusy = async (type, fn) => {
    if (busy) return;
    try {
      setBusy(type);
      await fn();
    } catch (e) {
      console.error(`Export ${type} failed`, e);
    } finally {
      setBusy(null);
    }
  };

  // ====== export handlers (nota: enviamos includeGeneratedStamp como booleano)
  const doCSV = () =>
    exportToCSV({
      rows: dataRows,
      columns: exporterColumns,
      filename: fullFileName("csv"),
    });

  const doXLSX = () =>
    exportToXLSX({
      rows: dataRows,
      columns: exporterColumns,
      sheetName,
      filename: fullFileName("xlsx"),
      title,
      orientation,
      logoUrl: logo,
      footerBgHex: footerColor,
      includeGeneratedStamp, // <- booleano
    });

  const doPDF = () =>
    exportToPDF({
      title,
      rows: dataRows,
      columns: exporterColumns,
      filename: fullFileName("pdf"),
      orientation,
      logoUrl: logo,
      footerBgHex: footerColor,
      includeGeneratedStamp, // <- booleano
    });

  return (
    <Modal open={open} onClose={busy ? undefined : onClose}>
      <ModalDialog
        sx={{
          width: isMobile ? "100%" : 1180,
          maxWidth: "100%",
          p: 0,
          overflow: "hidden",
          ...(isMobile
            ? { borderRadius: 0, height: "100dvh" }
            : { borderRadius: "lg", maxHeight: "90dvh" }),
        }}>
        <Sheet
          variant="plain"
          sx={{
            p: 1.25,
            borderBottom: "1px solid",
            borderColor: "divider",
            position: "sticky",
            top: 0,
            zIndex: 2,
            bgcolor: "background.surface",
          }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center">
            <Typography level="title-lg">Exportar</Typography>
            <ModalClose disabled={!!busy} />
          </Stack>
        </Sheet>

        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={0}
          sx={{
            height: isMobile ? "calc(100dvh - 52px)" : "auto",
            overflow: "hidden",
          }}>
          {/* Opciones */}
          <Sheet
            variant="soft"
            sx={{
              width: isMobile ? "100%" : 480,
              p: 1.25,
              borderRight: isMobile ? "none" : "1px solid",
              borderColor: "divider",
              overflow: "auto",
            }}>
            <Typography level="title-sm">General</Typography>
            <Stack spacing={1} sx={{ mb: 1.25 }}>
              <FormControl>
                <FormLabel>Nombre de archivo (base)</FormLabel>
                <Input
                  value={fileNameBase}
                  onChange={(e) => setFileNameBase(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Título</FormLabel>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FormControl>
              <Stack direction="row" spacing={1}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Orientación</FormLabel>
                  <Select
                    value={orientation}
                    onChange={(_, v) => setOrientation(v)}>
                    <Option value="portrait">Vertical</Option>
                    <Option value="landscape">Horizontal</Option>
                  </Select>
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Alcance</FormLabel>
                  <Select value={scope} onChange={(_, v) => setScope(v)}>
                    <Option value="all">Todo el filtro</Option>
                    <Option value="page">Página actual</Option>
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={1}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Hoja (Excel)</FormLabel>
                  <Input
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                  />
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Color pie (hex)</FormLabel>
                  <Input
                    value={footerColor}
                    onChange={(e) => setFooterColor(e.target.value)}
                    placeholder="#6fe6b1"
                  />
                </FormControl>
                <FormControl
                  orientation="horizontal"
                  sx={{ alignItems: "center" }}>
                  <FormLabel>Incluir fecha</FormLabel>
                  <Switch
                    checked={includeGeneratedStamp}
                    onChange={(e) => setIncludeGeneratedStamp(e.target.checked)}
                  />
                </FormControl>
              </Stack>
            </Stack>

            <Divider />

            {/* Columnas */}
            <Typography level="title-sm" sx={{ mt: 1.25 }}>
              Columnas
            </Typography>
            <Sheet
              variant="outlined"
              sx={{
                borderRadius: "md",
                p: 1,
                maxHeight: isMobile ? 260 : 380,
                overflow: "auto",
                mb: 1,
              }}>
              <Table
                size="sm"
                stickyHeader
                sx={{
                  "& thead th": {
                    bgcolor: "background.level1",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  },
                  minWidth: 560,
                }}>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}></th>
                    <th>Etiqueta</th>
                    <th style={{ width: 120 }}>Tipo</th>
                    <th style={{ width: 110 }}>Alineación</th>
                    <th style={{ width: 86 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cols.map((c, idx) => (
                    <tr key={c.id}>
                      <td>
                        <Switch
                          checked={c.enabled}
                          onChange={(e) =>
                            setCols((prev) =>
                              prev.map((p, i) =>
                                i === idx
                                  ? { ...p, enabled: e.target.checked }
                                  : p
                              )
                            )
                          }
                          slotProps={{ track: { "aria-label": "Habilitar" } }}
                        />
                      </td>
                      <td>
                        <Input
                          size="sm"
                          value={c.label}
                          onChange={(e) =>
                            setCols((prev) =>
                              prev.map((p, i) =>
                                i === idx ? { ...p, label: e.target.value } : p
                              )
                            )
                          }
                        />
                      </td>
                      <td>
                        <Select
                          size="sm"
                          value={c.type}
                          onChange={(_, v) =>
                            setCols((prev) =>
                              prev.map((p, i) =>
                                i === idx ? { ...p, type: v } : p
                              )
                            )
                          }>
                          <Option value="text">Texto</Option>
                          <Option value="number">Número</Option>
                          <Option value="currency">Moneda</Option>
                          <Option value="date">Fecha</Option>
                        </Select>
                      </td>
                      <td>
                        <Select
                          size="sm"
                          value={c.align}
                          onChange={(_, v) =>
                            setCols((prev) =>
                              prev.map((p, i) =>
                                i === idx ? { ...p, align: v } : p
                              )
                            )
                          }>
                          <Option value="left">Izquierda</Option>
                          <Option value="center">Centro</Option>
                          <Option value="right">Derecha</Option>
                        </Select>
                      </td>
                      <td>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end">
                          <Tooltip title="Subir">
                            <span>
                              <IconButton
                                size="sm"
                                variant="soft"
                                onClick={() => move(idx, -1)}
                                disabled={idx === 0}>
                                <ChevronUp size={16} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Bajar">
                            <span>
                              <IconButton
                                size="sm"
                                variant="soft"
                                onClick={() => move(idx, +1)}
                                disabled={idx === cols.length - 1}>
                                <ChevronDown size={16} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Sheet>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center">
              <Chip size="sm" variant="soft">
                {selectedCols.length}/{cols.length} columnas
              </Chip>
              <Tooltip title="Refrescar previsualización">
                <IconButton variant="soft" size="sm" onClick={() => {}}>
                  <RefreshCw size={16} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Sheet>

          {/* Preview + acciones */}
          <Sheet sx={{ flex: 1, p: 1.25, overflow: "auto" }}>
            <Typography level="title-sm" sx={{ mb: 1 }}>
              Previsualización (aprox.)
            </Typography>

            <Sheet
              variant="outlined"
              sx={{ p: 1, borderRadius: "md", mb: 1, overflow: "hidden" }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {logo ? (
                  <img
                    src={logo}
                    alt="logo"
                    style={{ width: 140, height: "auto", objectFit: "contain" }}
                  />
                ) : null}
                <Typography
                  level="title-lg"
                  sx={{ textAlign: "center", flex: 1 }}>
                  {title || "—"}
                </Typography>
                <div style={{ width: 140, height: 1 }} />
              </Stack>
              {includeGeneratedStamp ? (
                <Typography
                  level="body-xs"
                  color="neutral"
                  sx={{ textAlign: "center", mt: 0.5 }}>
                  Generado: {new Date().toLocaleString("es-HN")}
                </Typography>
              ) : null}
            </Sheet>

            <Sheet
              variant="soft"
              sx={{
                borderRadius: "md",
                border: "1px solid",
                borderColor: "divider",
                overflow: "auto",
              }}>
              <Table
                size="sm"
                stickyHeader
                sx={{
                  minWidth: 680,
                  "& thead th": {
                    textAlign: "center",
                    bgcolor: "background.level1",
                  },
                }}>
                <thead>
                  <tr>
                    {selectedCols.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((r, i) => (
                    <tr key={i}>
                      {selectedCols.map((c) => {
                        const base = colsMapByKey.get(c.key) || {};
                        const raw =
                          typeof base.get === "function"
                            ? base.get(r, i)
                            : r[c.key];
                        return (
                          <td
                            key={c.key}
                            style={{
                              textAlign:
                                c.align === "left"
                                  ? "left"
                                  : c.align === "right"
                                  ? "right"
                                  : "center",
                            }}>
                            {formatValue(raw, c.type)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {!previewRows.length && (
                    <tr>
                      <td
                        colSpan={selectedCols.length}
                        style={{ textAlign: "center", padding: 16 }}>
                        (Sin datos para previsualizar)
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Sheet>

            <div
              style={{
                height: 6,
                marginTop: 12,
                marginInline: 12,
                borderRadius: 3,
                background: footerColor,
              }}
            />

            <Stack
              direction={isMobile ? "column" : "row"}
              justifyContent="flex-end"
              spacing={1.25}
              sx={{ mt: 1.25 }}>
              <Button
                variant="outlined"
                startDecorator={<FileText size={16} />}
                onClick={() => runBusy("pdf", doPDF)}
                loading={busy === "pdf"}
                disabled={!!busy}>
                Exportar PDF
              </Button>
              <Button
                variant="outlined"
                startDecorator={<FileSpreadsheet size={16} />}
                onClick={() => runBusy("xlsx", doXLSX)}
                loading={busy === "xlsx"}
                disabled={!!busy}>
                Exportar Excel
              </Button>
              <Button
                variant="solid"
                startDecorator={<FileDown size={16} />}
                onClick={() => runBusy("csv", doCSV)}
                loading={busy === "csv"}
                disabled={!!busy}>
                Exportar CSV
              </Button>
            </Stack>
          </Sheet>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
