// src/pages/ComponentsReport/Registros/RegisterReport.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Sheet,
  Typography,
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
import ReportHeader from "@/components/ComponentsReport/GeneralComponents/ReportHeader.jsx";
import ReportCard from "@/components/ComponentsReport/RegisterReport/ReportCard.jsx";
import ReportDetailModal from "@/components/ComponentsReport/RegisterReport/ReportDetailModal.jsx";
import { getRegisterReport } from "@/services/ReportServices";
import { exportToCSV, exportToXLSX, exportToPDF } from "@/utils/exporters";

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
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString("es-HN") : "—");
const todayStr = () => fmtDateInput(new Date());
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export default function RegisterReport() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  // Texto búsqueda (URL param: q)
  const [query, setQuery] = useState(qs.get("q") || "");

  // Rango de fechas (URL param: range)  'all' | 'today' | '7d' | 'month' | 'custom'
  const [range, setRange] = useState(qs.get("range") || "all");
  // Fechas visibles solo en 'custom' (URL params: from, to)
  const [from, setFrom] = useState(qs.get("from") || "");
  const [to, setTo] = useState(qs.get("to") || "");

  // Filtro de estado (URL param: status) 'todos' | 'activos' | 'finalizados'
  const [status, setStatus] = useState(qs.get("status") || "todos");

  // Paginación (URL param: p)
  const [page, setPage] = useState(Number(qs.get("p") || 1));
  const [rowsPerPage] = useState(9);

  // Data
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Modal
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sync URL (no escribimos 'all' ni 'todos' para mantener limpia)
  useEffect(() => {
    const params = new URLSearchParams(search);
    query ? params.set("q", query) : params.delete("q");
    page > 1 ? params.set("p", String(page)) : params.delete("p");
    range !== "all" ? params.set("range", range) : params.delete("range");
    from ? params.set("from", from) : params.delete("from");
    to ? params.set("to", to) : params.delete("to");
    status !== "todos" ? params.set("status", status) : params.delete("status");
    const s = params.toString();
    window.history.replaceState(null, "", s ? `?${s}` : "");
  }, [query, page, range, from, to, status, search]);

  // Presets de rango (al cambiar range que no sea 'custom', calculamos from/to)
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

  // Carga
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await getRegisterReport({
          from: from || undefined,
          to: to || undefined,
          status: status !== "todos" ? status : undefined,
        });
        setRaw(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr("No se pudo cargar el reporte de registro de uso de vehículos.");
      } finally {
        setLoading(false);
      }
    })();
  }, [from, to, status]);

  // Búsqueda (debounce)
  const onChangeQuery = useRef(
    debounced((v) => {
      setPage(1);
      setQuery(v);
    }, 250)
  ).current;

  // Filtros front (texto + estado + fechas si el backend no filtrara)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const fromTs = from ? new Date(from + "T00:00:00").getTime() : null;
    const toTs = to ? new Date(to + "T23:59:59").getTime() : null;

    return (raw || []).filter((r) => {
      // texto
      const textOk =
        !q ||
        [
          r.empleado?.nombre,
          r.vehiculo?.marca,
          r.vehiculo?.modelo,
          r.vehiculo?.placa,
        ]
          .map((v) => String(v ?? "").toLowerCase())
          .some((s) => s.includes(q));
      if (!textOk) return false;

      // estado
      if (status === "activos" && r.fecha_regreso) return false;
      if (status === "finalizados" && !r.fecha_regreso) return false;

      // rango
      if (!fromTs && !toTs) return true;
      const salidaTs = r.fecha_salida ? new Date(r.fecha_salida).getTime() : 0;
      if (fromTs && salidaTs < fromTs) return false;
      if (toTs && salidaTs > toTs) return false;

      return true;
    });
  }, [raw, query, status, from, to]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageSafe = Math.min(Math.max(page, 1), totalPages);
  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, pageSafe, rowsPerPage]);

  // Handlers UI
  const handleCardClick = (registro) => {
    setSelectedRegistro(registro);
    setModalOpen(true);
  };

  const clearFilters = () => {
    setQuery("");
    setRange("all");
    setFrom("");
    setTo("");
    setStatus("todos");
    setPage(1);
  };

  // Columnas para exportadores
  const columnsExport = [
    { label: "Empleado", get: (r) => r.empleado?.nombre || "" },
    {
      label: "Vehículo",
      get: (r) => `${r.vehiculo?.marca || ""} ${r.vehiculo?.modelo || ""}`,
    },
    { label: "Placa", get: (r) => r.vehiculo?.placa || "" },
    { label: "F. Salida", get: (r) => fmtDateTime(r.fecha_salida) },
    { label: "F. Regreso", get: (r) => fmtDateTime(r.fecha_regreso) },
    { label: "Km Salida", key: "km_salida" },
    { label: "Km Regreso", key: "km_regreso" },
    {
      label: "Comb. Salida",
      get: (r) =>
        typeof r.combustible_salida === "number"
          ? `${r.combustible_salida}%`
          : "—",
    },
    {
      label: "Comb. Regreso",
      get: (r) =>
        typeof r.combustible_regreso === "number"
          ? `${r.combustible_regreso}%`
          : "—",
    },
    { label: "Coment. Salida", key: "comentario_salida" },
    { label: "Coment. Regreso", key: "comentario_regreso" },
  ];
  const filenameBase = `registros_uso_${from || "all"}_a_${to || "all"}_${
    status || "todos"
  }`;

  const handleExportCSV = () =>
    exportToCSV({
      rows: filtered,
      columns: columnsExport,
      filename: `${filenameBase}.csv`,
    });
  const handleExportXLSX = () =>
    exportToXLSX({
      rows: filtered,
      columns: columnsExport,
      sheetName: "Registros",
      filename: `${filenameBase}.xlsx`,
    });
  const handleExportPDF = () =>
    exportToPDF({
      title: "Registro de uso de vehículos",
      rows: filtered,
      columns: columnsExport,
      filename: `${filenameBase}.pdf`,
      landscape: true,
    });

  /* ============ UI ============ */
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
        {/* Header + acciones */}
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
            <ReportHeader title="Registro de uso de vehículos" />
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

            {/* Fechas solo en 'custom' */}
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

            {/* Filtro de estado */}
            <Stack direction="row" spacing={0.5}>
              <Chip
                variant={status === "todos" ? "solid" : "soft"}
                onClick={() => {
                  setStatus("todos");
                  setPage(1);
                }}
                sx={{ borderRadius: "999px" }}>
                Todos
              </Chip>
              <Chip
                variant={status === "activos" ? "solid" : "soft"}
                onClick={() => {
                  setStatus("activos");
                  setPage(1);
                }}
                sx={{ borderRadius: "999px" }}>
                Activos
              </Chip>
              <Chip
                variant={status === "finalizados" ? "solid" : "soft"}
                onClick={() => {
                  setStatus("finalizados");
                  setPage(1);
                }}
                sx={{ borderRadius: "999px" }}>
                Finalizados
              </Chip>
            </Stack>

            {/* Búsqueda */}
            <Input
              startDecorator={<SearchRoundedIcon />}
              placeholder="Buscar: empleado, vehículo o placa…"
              onChange={(e) => onChangeQuery(e.target.value)}
              defaultValue={query}
              sx={{ minWidth: { xs: 220, md: 260 } }}
            />

            {/* Exportar */}
            <Dropdown>
              <MenuButton
                variant="soft"
                endDecorator={<MoreHorizRoundedIcon />}
                sx={{ borderRadius: "999px" }}>
                Exportar
              </MenuButton>
              <Menu placement="bottom-end">
                <MenuItem onClick={handleExportCSV}>
                  <DownloadRoundedIcon />
                  CSV
                </MenuItem>
                <MenuItem onClick={handleExportXLSX}>
                  <DownloadRoundedIcon />
                  Excel (.xlsx)
                </MenuItem>
                <MenuItem onClick={handleExportPDF}>
                  <DownloadRoundedIcon />
                  PDF
                </MenuItem>
              </Menu>
            </Dropdown>

            <Button variant="plain" onClick={clearFilters}>
              Limpiar
            </Button>
          </Stack>
        </Stack>

        {/* Grid de tarjetas */}
        {filtered.length === 0 ? (
          <Alert variant="soft" color="neutral">
            <Typography>No hay registros para ese filtro.</Typography>
          </Alert>
        ) : (
          <Box
            sx={{
              mt: 2,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
              gap: 2,
            }}>
            {pageItems.map((registro) => (
              <ReportCard
                key={registro.id}
                registro={registro}
                onClick={() => {
                  setSelectedRegistro(registro);
                  setModalOpen(true);
                }}
              />
            ))}
          </Box>
        )}

        {/* Footer: contador + paginación */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: 1.75, gap: 1 }}>
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
      </Sheet>

      {/* Modal detalle */}
      <ReportDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        registro={selectedRegistro}
      />
    </Box>
  );
}
