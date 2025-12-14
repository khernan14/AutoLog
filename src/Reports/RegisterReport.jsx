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
  Chip,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/joy";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

// Iconos
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";

// Componentes
import PaginationLite from "@/components/common/PaginationLite";
import ReportCard from "@/components/ComponentsReport/RegisterReport/ReportCard.jsx";
import ReportDetailModal from "@/components/ComponentsReport/RegisterReport/ReportDetailModal.jsx";
import ExportDialog from "@/components/Exports/ExportDialog";
import { getRegisterReport } from "@/services/ReportServices";

// ===== Helpers =====
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

export default function RegisterReport() {
  const { t } = useTranslation(); // 👈 Hook de traducción
  const navigate = useNavigate();
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  // Estado de filtros
  const [query, setQuery] = useState(qs.get("q") || "");
  const [range, setRange] = useState(qs.get("range") || "all");
  const [from, setFrom] = useState(qs.get("from") || "");
  const [to, setTo] = useState(qs.get("to") || "");
  const [status, setStatus] = useState(qs.get("status") || "todos");

  // Paginación
  const [page, setPage] = useState(Number(qs.get("p") || 1));
  const [rowsPerPage] = useState(9);

  // Data
  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Modales
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Sync URL
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

  // Presets de rango
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

  // Carga de datos
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
        setErr(t("reports.errors.load_failed"));
      } finally {
        setLoading(false);
      }
    })();
  }, [from, to, status, t]);

  // Búsqueda (debounce)
  const onChangeQuery = useRef(
    debounced((v) => {
      setPage(1);
      setQuery(v);
    }, 250)
  ).current;

  // Filtrado Frontend
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTs = from ? new Date(from + "T00:00:00").getTime() : null;
    const toTs = to ? new Date(to + "T23:59:59").getTime() : null;

    return (raw || []).filter((r) => {
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
      if (status === "activos" && r.fecha_regreso) return false;
      if (status === "finalizados" && !r.fecha_regreso) return false;

      if (!fromTs && !toTs) return true;
      const salidaTs = r.fecha_salida ? new Date(r.fecha_salida).getTime() : 0;
      if (fromTs && salidaTs < fromTs) return false;
      if (toTs && salidaTs > toTs) return false;

      return true;
    });
  }, [raw, query, status, from, to]);

  // Paginación UI
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageSafe = Math.min(Math.max(page, 1), totalPages);
  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, pageSafe, rowsPerPage]);

  // Limpiar filtros
  const clearFilters = () => {
    setQuery("");
    setRange("all");
    setFrom("");
    setTo("");
    setStatus("todos");
    setPage(1);
  };

  // Configuración de columnas para exportación
  const columnsExport = [
    {
      label: t("reports.columns.employee"),
      key: "empleado.nombre",
      get: (r) => r.empleado?.nombre || "",
    },
    {
      label: t("reports.columns.vehicle"),
      get: (r) => `${r.vehiculo?.marca || ""} ${r.vehiculo?.modelo || ""}`,
    },
    {
      label: t("reports.columns.plate"),
      key: "vehiculo.placa",
      get: (r) => r.vehiculo?.placa || "",
    },
    {
      label: t("reports.columns.departure_date"),
      key: "fecha_salida",
      get: (r) => new Date(r.fecha_salida).toLocaleString(),
    },
    {
      label: t("reports.columns.return_date"),
      key: "fecha_regreso",
      get: (r) =>
        r.fecha_regreso ? new Date(r.fecha_regreso).toLocaleString() : "—",
    },
    { label: t("reports.columns.km_out"), key: "km_salida" },
    { label: t("reports.columns.km_in"), key: "km_regreso" },
  ];

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
      {/* --- HEADER --- */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ md: "center" }}
        justifyContent="space-between"
        mb={3}
        spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            onClick={() => navigate("/admin/reports")}
            variant="plain"
            color="neutral">
            <ArrowBackRoundedIcon />
          </IconButton>
          <Box>
            <Typography level="h2" fontSize="lg" fontWeight="lg">
              {t("reports.report_items.registros_uso.title")}
            </Typography>
            <Typography level="body-sm" color="neutral">
              {t("reports.total_records", { count: filtered.length })}
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="solid"
          color="primary"
          startDecorator={<DownloadRoundedIcon />}
          onClick={() => setExportOpen(true)}
          disabled={filtered.length === 0}>
          {t("reports.actions.export")}
        </Button>
      </Stack>

      {/* --- FILTERS BAR --- */}
      <Sheet
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: "lg",
          mb: 3,
          boxShadow: "sm",
          bgcolor: "background.surface",
        }}>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          alignItems={{ lg: "center" }}>
          {/* Buscador */}
          <Input
            placeholder={t("reports.search_placeholder")}
            startDecorator={<SearchRoundedIcon />}
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            sx={{ minWidth: 240, flex: 1 }}
            endDecorator={
              query && (
                <IconButton
                  size="sm"
                  variant="plain"
                  color="neutral"
                  onClick={() => setQuery("")}>
                  <ClearRoundedIcon />
                </IconButton>
              )
            }
          />

          <Divider
            orientation="vertical"
            sx={{ display: { xs: "none", lg: "block" }, height: 24 }}
          />

          {/* Rango de Fechas */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ overflowX: "auto", pb: { xs: 1, lg: 0 } }}>
            <CalendarTodayRoundedIcon
              sx={{ color: "text.tertiary", fontSize: 20 }}
            />
            {["all", "today", "7d", "month", "custom"].map((r) => (
              <Chip
                key={r}
                variant={range === r ? "solid" : "soft"}
                color={range === r ? "primary" : "neutral"}
                onClick={() => setRange(r)}
                sx={{
                  cursor: "pointer",
                  fontWeight: range === r ? "lg" : "md",
                }}>
                {t(`reports.ranges.${r}`)}
              </Chip>
            ))}
          </Stack>

          {range === "custom" && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                sx={{ width: 140 }}
              />
              <Typography level="body-sm">-</Typography>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                sx={{ width: 140 }}
              />
            </Stack>
          )}

          <Divider
            orientation="vertical"
            sx={{ display: { xs: "none", lg: "block" }, height: 24 }}
          />

          {/* Estado */}
          <Stack direction="row" spacing={1}>
            {["todos", "activos", "finalizados"].map((s) => (
              <Chip
                key={s}
                variant={status === s ? "solid" : "soft"}
                color={status === s ? "neutral" : "neutral"}
                onClick={() => setStatus(s)}
                sx={{
                  cursor: "pointer",
                  bgcolor: status === s ? "text.primary" : undefined,
                  color: status === s ? "background.surface" : undefined,
                }}>
                {t(`reports.status.${s}`)}
              </Chip>
            ))}
          </Stack>

          {(query || range !== "all" || status !== "todos") && (
            <Button
              variant="plain"
              color="danger"
              size="sm"
              onClick={clearFilters}>
              {t("reports.actions.clear_filters")}
            </Button>
          )}
        </Stack>
      </Sheet>

      {/* --- CONTENT --- */}
      {loading ? (
        <Box
          sx={{
            py: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}>
          <CircularProgress size="lg" thickness={3} />
          <Typography level="body-md" color="neutral">
            {t("common.loading")}
          </Typography>
        </Box>
      ) : err ? (
        <Alert color="danger" variant="soft" sx={{ my: 2 }}>
          {err}
        </Alert>
      ) : filtered.length === 0 ? (
        <Box
          sx={{
            py: 8,
            textAlign: "center",
            bgcolor: "background.level1",
            borderRadius: "lg",
          }}>
          <FilterListRoundedIcon
            sx={{ fontSize: 48, color: "neutral.300", mb: 2 }}
          />
          <Typography level="h4" color="neutral">
            {t("reports.no_data_title")}
          </Typography>
          <Typography level="body-md" color="neutral">
            {t("reports.no_data_desc")}
          </Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={clearFilters}>
            {t("reports.actions.clear_filters")}
          </Button>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                lg: "1fr 1fr 1fr",
              },
              gap: 2,
              mb: 3,
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

          {/* Paginación */}
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}>
            <Typography level="body-sm">
              {t("reports.showing_page", { page: pageSafe, total: totalPages })}
            </Typography>
            <PaginationLite
              page={pageSafe}
              count={totalPages}
              onChange={setPage}
            />
          </Stack>
        </>
      )}

      {/* --- MODALES --- */}
      <ReportDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        registro={selectedRegistro}
      />

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        rows={filtered}
        columns={columnsExport}
        defaultTitle={t("reports.report_items.registros_uso.title")}
        defaultFilename={`registros_${todayStr()}`}
      />
    </Box>
  );
}
