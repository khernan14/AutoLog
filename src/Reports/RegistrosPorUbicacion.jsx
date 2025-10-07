// src/pages/ComponentsReport/Registros/RegistrosPorUbicacion.jsx
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
import { getRegistrosPorUbicacionReport } from "@/services/ReportServices";
import { exportToCSV, exportToXLSX, exportToPDF } from "@/utils/exporters";
import ExportDialog from "@/components/Exports/ExportDialog";

/* === Helpers UI === */
const debounced = (fn, ms = 250) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString("es-HN") : "N/A");
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

/* === Componente === */
export default function RegistrosPorUbicacion() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  // Texto de búsqueda
  const [query, setQuery] = useState(qs.get("q") || "");

  // Rango de fechas (por defecto: "all")
  // valores: 'all' | 'today' | '7d' | 'month' | 'custom'
  const [range, setRange] = useState(qs.get("range") || "all");

  // from/to visibles SOLO en 'custom'
  const [from, setFrom] = useState(qs.get("from") || "");
  const [to, setTo] = useState(qs.get("to") || "");

  // Paginación
  const [page, setPage] = useState(Number(qs.get("p") || 1));
  const [rowsPerPage] = useState(10);

  // Data
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [openExport, setOpenExport] = useState(false);

  // Sincroniza parámetros en URL (si range === 'all', no setearlo para URL limpia)
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

  // Cuando cambia a preset (no 'custom'):
  useEffect(() => {
    if (range === "custom") return; // el usuario controla from/to
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

  // Carga (ideal: que el service acepte {from,to}, si no, igual filtramos en front)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await getRegistrosPorUbicacionReport({
          from: from || undefined,
          to: to || undefined,
        });
        setRaw(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr("No se pudo cargar el reporte de registros por ubicación.");
      } finally {
        setLoading(false);
      }
    })();
  }, [from, to]);

  // Búsqueda (debounce)
  const onChangeQuery = useRef(
    debounced((v) => {
      setPage(1);
      setQuery(v);
    }, 250)
  ).current;

  // Filtro por texto + rango (front fallback)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // si no hay from/to => no aplicar filtro de fechas (modo Todos)
    const fromTs = from ? new Date(from + "T00:00:00").getTime() : null;
    const toTs = to ? new Date(to + "T23:59:59").getTime() : null;

    return (raw || []).filter((r) => {
      const textOk =
        !q ||
        [r.nombre_empleado, r.vehiculo, r.ubicacion_salida, r.ubicacion_regreso]
          .map((v) => String(v ?? "").toLowerCase())
          .some((s) => s.includes(q));
      if (!textOk) return false;

      if (!fromTs && !toTs) return true; // sin filtro de fechas
      const salidaTs = r.fecha_salida
        ? new Date(r.fecha_salida).getTime()
        : null;
      if (!salidaTs) return false;
      if (fromTs && salidaTs < fromTs) return false;
      if (toTs && salidaTs > toTs) return false;
      return true;
    });
  }, [raw, query, from, to]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageSafe = Math.min(Math.max(page, 1), totalPages);
  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, pageSafe, rowsPerPage]);

  // Columnas para export (formato de exporters.js)
  const columnsExport = [
    {
      label: "#",
      key: "__rownum",
      get: (_row, i) => (pageSafe - 1) * rowsPerPage + i + 1,
    },
    { label: "Empleado", key: "nombre_empleado" },
    { label: "Vehículo", key: "vehiculo" },
    { label: "Ubicación salida", key: "ubicacion_salida" },
    { label: "Ubicación regreso", key: "ubicacion_regreso" },
    {
      label: "F. salida",
      key: "fecha_salida",
      get: (r) => fmtDateTime(r.fecha_salida),
    },
    {
      label: "F. regreso",
      key: "fecha_regreso",
      get: (r) => fmtDateTime(r.fecha_regreso),
    },
    { label: "Km salida", key: "km_salida" },
    { label: "Km regreso", key: "km_regreso" },
  ];

  const filenameBase = `kilometraje_por_empleado_${new Date()
    .toISOString()
    .slice(0, 10)}`;

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
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexWrap: "wrap" }}>
            <Button
              startDecorator={<ArrowBackRoundedIcon />}
              variant="soft"
              onClick={() => navigate("/admin/reports")}
              sx={{ borderRadius: "999px" }}>
              Regresar
            </Button>
            <Typography level="h3" sx={{ fontWeight: 800, ml: 0.5 }}>
              Registros por ubicación
            </Typography>
          </Stack>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems="center">
            {/* Presets de rango */}
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

            {/* Fechas: solo visibles en 'custom' */}
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
              placeholder="Buscar: empleado, vehículo, ubicación…"
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
            aria-label="Tabla de registros por ubicación"
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
                <th>Vehículo</th>
                <th>Ubicación salida</th>
                <th>Ubicación regreso</th>
                <th>F. salida</th>
                <th>F. regreso</th>
                <th style={{ textAlign: "right" }}>Km salida</th>
                <th style={{ textAlign: "right" }}>Km regreso</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((r, i) => (
                <tr key={`${r.nombre_empleado}-${r.vehiculo}-${i}`}>
                  <td>{(pageSafe - 1) * rowsPerPage + i + 1}</td>
                  <td>{r.nombre_empleado ?? "—"}</td>
                  <td>{r.vehiculo ?? "—"}</td>
                  <td>{r.ubicacion_salida ?? "N/A"}</td>
                  <td>{r.ubicacion_regreso ?? "N/A"}</td>
                  <td>{fmtDateTime(r.fecha_salida)}</td>
                  <td>{fmtDateTime(r.fecha_regreso)}</td>
                  <td style={{ textAlign: "right" }}>{r.km_salida ?? "—"}</td>
                  <td style={{ textAlign: "right" }}>{r.km_regreso ?? "—"}</td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={9}>
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

        {/* Footer: contador + paginación */}
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
            registros
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
          defaultTitle="Registros por ubicación"
          defaultSheetName="Registros_Por_Ubicacion"
          defaultFilenameBase={filenameBase}
          defaultOrientation="portrait"
          includeGeneratedStamp
          logoUrl="/newLogoTecnasa.png"
        />
      </Sheet>
    </Box>
  );
}
