// src/pages/ComponentsReport/Empleados/EmpleadosMasSalidas.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Sheet,
  Typography,
  Table,
  Stack,
  Button,
  Input,
  CircularProgress,
  Alert,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Chip,
} from "@mui/joy";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import { useNavigate, useLocation } from "react-router-dom";

import PaginationLite from "@/components/common/PaginationLite";
import { getEmpleadosMasSalidasReport } from "@/services/ReportServices";
import { exportToCSV, exportToXLSX, exportToPDF } from "@/utils/exporters";
import ExportDialog from "@/components/Exports/ExportDialog";

/* === Helpers === */
const debounced = (fn, ms = 250) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};
const fmtDateInput = (d) => {
  if (!d) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const dt = d instanceof Date ? d : new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};
const todayStr = () => fmtDateInput(new Date());
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export default function EmpleadosMasSalidas() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  // texto búsqueda
  const [query, setQuery] = useState(qs.get("q") || "");

  // rango de fechas (por defecto: "all")
  // 'all' | 'today' | '7d' | 'month' | 'custom'
  const [range, setRange] = useState(qs.get("range") || "all");

  // from/to (solo visibles en 'custom')
  const [from, setFrom] = useState(qs.get("from") || "");
  const [to, setTo] = useState(qs.get("to") || "");

  // paginación
  const [page, setPage] = useState(Number(qs.get("p") || 1));
  const [rowsPerPage] = useState(10);

  // data
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [openExport, setOpenExport] = useState(false);

  // sync URL (no escribimos 'all' para mantener limpia)
  useEffect(() => {
    const params = new URLSearchParams(search);
    query ? params.set("q", query) : params.delete("q");
    page > 1 ? params.set("p", String(page)) : params.delete("p");
    range !== "all" ? params.set("range", range) : params.delete("range");
    from ? params.set("from", from) : params.delete("from");
    to ? params.set("to", to) : params.delete("to");
    const s = params.toString();
    window.history.replaceState(null, "", s ? `?${s}` : "");
  }, [query, page, range, from, to, search]);

  // presets rango
  useEffect(() => {
    if (range === "custom") return;
    if (range === "all") {
      setFrom("");
      setTo("");
    } else if (range === "today") {
      const d = todayStr();
      setFrom(d);
      setTo(d);
    } else if (range === "7d") {
      const now = new Date();
      setFrom(fmtDateInput(addDays(now, -6)));
      setTo(todayStr());
    } else if (range === "month") {
      const now = new Date();
      const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      setFrom(fmtDateInput(startMonth));
      setTo(todayStr());
    }
    setPage(1);
  }, [range]);

  // load (si tu service acepta {from,to}, los mandamos; si no, ignora y filtramos en front)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await getEmpleadosMasSalidasReport({
          from: from || undefined,
          to: to || undefined,
        });
        // esperado: [{ nombre_empleado, puesto, total_salidas }]
        setRaw(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr("No se pudo cargar el reporte de empleados con más salidas.");
      } finally {
        setLoading(false);
      }
    })();
  }, [from, to]);

  // búsqueda (debounce)
  const onChangeQuery = useRef(
    debounced((v) => {
      setPage(1);
      setQuery(v);
    }, 250)
  ).current;

  // filtro por texto
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return raw;
    return (raw || []).filter((r) =>
      [r.nombre_empleado, r.puesto]
        .map((v) => String(v ?? "").toLowerCase())
        .some((s) => s.includes(q))
    );
  }, [raw, query]);

  // paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageSafe = Math.min(Math.max(page, 1), totalPages);
  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, pageSafe, rowsPerPage]);

  // columnas export (para utils/exporters)
  const columnsExport = [
    {
      label: "#",
      key: "__rownum",
      get: (_row, i) => (pageSafe - 1) * rowsPerPage + i + 1, // o solo i+1 si quieres reiniciar
    },
    { label: "Empleado", key: "nombre_empleado" },
    { label: "Puesto", key: "puesto" },
    {
      label: "Total de salidas",
      key: "total_salidas" /* type sugerido: number */,
    },
  ];
  const filenameBase = `empleados_mas_salidas_${from || "all"}_a_${
    to || "all"
  }`;

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          gap: 1,
          background:
            "linear-gradient(180deg, var(--joy-palette-background-level1), transparent 40%)",
          borderRadius: "xl",
        }}>
        <CircularProgress size="lg" />
        <Typography>Cargando reporte…</Typography>
      </Box>
    );
  }

  if (err) {
    return (
      <Alert color="danger" variant="soft">
        <Typography>{err}</Typography>
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        background:
          "radial-gradient(1200px 200px at 50% -20%, var(--joy-palette-primary-softBg), transparent), radial-gradient(1200px 200px at 50% 120%, var(--joy-palette-neutral-softBg), transparent)",
        borderRadius: "xl",
        p: { xs: 1.5, md: 2 },
      }}>
      <Sheet
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: "xl",
          borderColor: "neutral.outlinedBorder",
          boxShadow: "sm",
          backgroundColor: "background.body",
        }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", lg: "center" }}
          sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              startDecorator={<ArrowBackRoundedIcon />}
              variant="soft"
              onClick={() => navigate("/admin/reports")}
              sx={{ borderRadius: "999px" }}>
              Regresar
            </Button>
            <Typography level="h3" sx={{ fontWeight: 800, ml: 0.5 }}>
              Empleados con más salidas
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems="center">
            {/* Presets rango */}
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
              <Chip
                variant={range === "all" ? "solid" : "soft"}
                onClick={() => setRange("all")}
                sx={{ borderRadius: "999px" }}>
                Todos
              </Chip>
              <Chip
                variant={range === "today" ? "solid" : "soft"}
                onClick={() => setRange("today")}
                sx={{ borderRadius: "999px" }}>
                Hoy
              </Chip>
              <Chip
                variant={range === "7d" ? "solid" : "soft"}
                onClick={() => setRange("7d")}
                sx={{ borderRadius: "999px" }}>
                Últimos 7 días
              </Chip>
              <Chip
                variant={range === "month" ? "solid" : "soft"}
                onClick={() => setRange("month")}
                sx={{ borderRadius: "999px" }}>
                Este mes
              </Chip>
              <Chip
                variant={range === "custom" ? "solid" : "soft"}
                onClick={() => setRange("custom")}
                sx={{ borderRadius: "999px" }}>
                Personalizado
              </Chip>
            </Stack>

            {/* Fechas: solo en 'custom' */}
            {range === "custom" && (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Input
                  type="date"
                  value={from || ""}
                  onChange={(e) => {
                    setFrom(e.target.value);
                    setPage(1);
                  }}
                  slotProps={{ input: { max: to || undefined } }}
                  sx={{ minWidth: 160 }}
                />
                <Typography level="body-sm">a</Typography>
                <Input
                  type="date"
                  value={to || ""}
                  onChange={(e) => {
                    setTo(e.target.value);
                    setPage(1);
                  }}
                  slotProps={{ input: { min: from || undefined } }}
                  sx={{ minWidth: 160 }}
                />
              </Stack>
            )}

            {/* Búsqueda */}
            <Input
              startDecorator={<SearchRoundedIcon />}
              placeholder="Buscar: empleado o puesto…"
              onChange={(e) => onChangeQuery(e.target.value)}
              defaultValue={query}
              sx={{ minWidth: { xs: 220, md: 260 } }}
            />

            {/* Exportar */}
            <Button
              variant="soft"
              startDecorator={<DownloadRoundedIcon />}
              onClick={() => setOpenExport(true)}
              sx={{ borderRadius: "999px" }}>
              Exportar
            </Button>
          </Stack>
        </Stack>

        {/* Tabla */}
        <Box
          sx={{
            border: "1px solid",
            borderColor: "neutral.outlinedBorder",
            borderRadius: "lg",
            overflow: "hidden",
          }}>
          <Table
            aria-label="Tabla de empleados con más salidas"
            stickyHeader
            hoverRow
            sx={{
              "--TableCell-paddingX": "12px",
              "--TableCell-paddingY": "10px",
              "& thead th": {
                bgcolor: "background.level1",
                fontWeight: 700,
                color: "text.primary",
                borderBottom: "1px solid",
                borderColor: "divider",
                whiteSpace: "nowrap",
              },
              "& tbody tr:nth-of-type(odd)": {
                bgcolor: "background.level2",
              },
              "& tbody td": {
                borderBottom: "1px solid",
                borderColor: "divider",
              },
            }}>
            <thead>
              <tr>
                <th style={{ width: 56 }}>#</th>
                <th>Empleado</th>
                <th>Puesto</th>
                <th style={{ textAlign: "right" }}>Total de salidas</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((r, i) => (
                <tr key={`${r.nombre_empleado}-${i}`}>
                  <td>{(pageSafe - 1) * rowsPerPage + i + 1}</td>
                  <td>{r.nombre_empleado ?? "—"}</td>
                  <td>{r.puesto ?? "—"}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    {Number(r.total_salidas ?? 0)}
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={4}>
                    <Alert variant="soft" color="neutral">
                      <Typography level="body-sm">
                        No hay registros para ese rango/búsqueda.
                      </Typography>
                    </Alert>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Box>

        {/* Footer */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 1.25, gap: 1 }}>
          <Typography level="body-sm" color="neutral">
            Mostrando{" "}
            <b>
              {pageItems.length} de {filtered.length}
            </b>{" "}
            empleados
          </Typography>

          <PaginationLite
            page={pageSafe}
            count={totalPages}
            onChange={setPage}
            size="sm"
            showFirstLast
          />
        </Stack>
        <ExportDialog
          open={openExport}
          onClose={() => setOpenExport(false)}
          rows={filtered} // todo el filtro
          pageRows={pageItems} // página actual
          columns={columnsExport}
          defaultTitle="Empleados con Más Salidas"
          defaultSheetName="empleados_mas_salidas"
          defaultFilenameBase={filenameBase}
          defaultOrientation="portrait"
          logoUrl="/newLogoTecnasa.png"
        />
      </Sheet>
    </Box>
  );
}
