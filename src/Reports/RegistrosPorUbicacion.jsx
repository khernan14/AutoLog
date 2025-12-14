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
  IconButton,
  Chip,
  Divider,
} from "@mui/joy";
import { useTranslation } from "react-i18next"; // 👈 i18n
import { useNavigate, useLocation } from "react-router-dom";

// Iconos
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import FilterListOffRoundedIcon from "@mui/icons-material/FilterListOffRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";

// Componentes
import PaginationLite from "@/components/common/PaginationLite";
import ExportDialog from "@/components/Exports/ExportDialog";
import { getRegistrosPorUbicacionReport } from "@/services/ReportServices";

/* === Helpers === */
const debounced = (fn, ms = 250) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString() : "—");
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

export default function RegistrosPorUbicacion() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  // Filtros
  const [query, setQuery] = useState(qs.get("q") || "");
  const [range, setRange] = useState(qs.get("range") || "all");
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

  // Sync URL
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

  // Presets Rango
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
        const data = await getRegistrosPorUbicacionReport({
          from: from || undefined,
          to: to || undefined,
        });
        setRaw(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr(t("reports.errors.load_failed"));
      } finally {
        setLoading(false);
      }
    })();
  }, [from, to, t]);

  // Búsqueda
  const onChangeQuery = useRef(
    debounced((v) => {
      setPage(1);
      setQuery(v);
    }, 250)
  ).current;

  // Filtrado Front
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromTs = from ? new Date(from + "T00:00:00").getTime() : null;
    const toTs = to ? new Date(to + "T23:59:59").getTime() : null;

    return (raw || []).filter((r) => {
      const textOk =
        !q ||
        [r.nombre_empleado, r.vehiculo, r.ubicacion_salida, r.ubicacion_regreso]
          .map((v) => String(v ?? "").toLowerCase())
          .some((s) => s.includes(q));

      if (!textOk) return false;

      if (!fromTs && !toTs) return true;
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

  // Limpiar filtros
  const clearFilters = () => {
    setQuery("");
    setRange("all");
    setFrom("");
    setTo("");
    setPage(1);
  };

  // Export config
  const columnsExport = [
    {
      label: "#",
      key: "__rownum",
      get: (_row, i) => (pageSafe - 1) * rowsPerPage + i + 1,
    },
    { label: t("reports.columns.employee"), key: "nombre_empleado" },
    { label: t("reports.columns.vehicle"), key: "vehiculo" },
    { label: t("reports.columns.location_out"), key: "ubicacion_salida" },
    { label: t("reports.columns.location_in"), key: "ubicacion_regreso" },
    {
      label: t("reports.columns.departure_date"),
      key: "fecha_salida",
      get: (r) => fmtDateTime(r.fecha_salida),
    },
    {
      label: t("reports.columns.return_date"),
      key: "fecha_regreso",
      get: (r) => fmtDateTime(r.fecha_regreso),
    },
    { label: t("reports.columns.km_out"), key: "km_salida" },
    { label: t("reports.columns.km_in"), key: "km_regreso" },
  ];

  const filenameBase = `ubicacion_registros_${from || "all"}_${to || "all"}`;

  // --- Render ---
  if (loading) {
    return (
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
    );
  }

  if (err) {
    return (
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
        <Alert color="danger" variant="soft">
          {err}
        </Alert>
      </Box>
    );
  }

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
              {t("reports.report_items.ubicacion_vehiculo.title")}
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
          onClick={() => setOpenExport(true)}
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
                size="sm"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                sx={{ width: 130 }}
              />
              <Typography level="body-sm">-</Typography>
              <Input
                type="date"
                size="sm"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                sx={{ width: 130 }}
              />
            </Stack>
          )}

          {(query || range !== "all") && (
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

      {/* --- DATA TABLE --- */}
      <Sheet
        variant="outlined"
        sx={{
          borderRadius: "lg",
          boxShadow: "sm",
          overflow: "hidden",
          bgcolor: "background.surface",
        }}>
        <Box sx={{ overflowX: "auto" }}>
          <Table
            aria-label={t("reports.report_items.ubicacion_vehiculo.title")}
            hoverRow
            stickyHeader
            sx={{
              "--TableCell-paddingX": "12px",
              "--TableCell-paddingY": "10px",
              "& thead th": {
                bgcolor: "background.level1",
                color: "text.tertiary",
                fontWeight: "md",
                textTransform: "uppercase",
                fontSize: "xs",
                letterSpacing: "0.05em",
                borderBottom: "1px solid",
                borderColor: "divider",
                whiteSpace: "nowrap", // Evitar saltos de línea en encabezados largos
              },
              "& tbody tr:last-child td": { borderBottom: 0 },
            }}>
            <thead>
              <tr>
                <th style={{ width: 60, textAlign: "center" }}>#</th>
                <th>{t("reports.columns.employee")}</th>
                <th>{t("reports.columns.vehicle")}</th>
                <th>{t("reports.columns.location_out")}</th>
                <th>{t("reports.columns.location_in")}</th>
                <th>{t("reports.columns.departure_date")}</th>
                <th>{t("reports.columns.return_date")}</th>
                <th style={{ textAlign: "right" }}>
                  {t("reports.columns.km_out")}
                </th>
                <th style={{ textAlign: "right" }}>
                  {t("reports.columns.km_in")}
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length > 0 ? (
                pageItems.map((r, i) => {
                  const globalIndex = (pageSafe - 1) * rowsPerPage + i + 1;

                  return (
                    <tr key={`${r.id || i}`}>
                      <td
                        style={{
                          textAlign: "center",
                          color: "var(--joy-palette-text-tertiary)",
                        }}>
                        {globalIndex}
                      </td>
                      <td>
                        <Typography fontWeight="md">
                          {r.nombre_empleado || "—"}
                        </Typography>
                      </td>
                      <td>{r.vehiculo || "—"}</td>

                      {/* Ubicaciones destacadas con icono */}
                      <td>
                        {r.ubicacion_salida ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center">
                            <PlaceRoundedIcon
                              fontSize="small"
                              sx={{ color: "primary.400", opacity: 0.7 }}
                            />
                            <span>{r.ubicacion_salida}</span>
                          </Stack>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        {r.ubicacion_regreso ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center">
                            <PlaceRoundedIcon
                              fontSize="small"
                              sx={{ color: "success.400", opacity: 0.7 }}
                            />
                            <span>{r.ubicacion_regreso}</span>
                          </Stack>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td>{fmtDateTime(r.fecha_salida)}</td>
                      <td>{fmtDateTime(r.fecha_regreso)}</td>
                      <td
                        style={{ textAlign: "right", fontFamily: "monospace" }}>
                        {r.km_salida ?? "—"}
                      </td>
                      <td
                        style={{ textAlign: "right", fontFamily: "monospace" }}>
                        {r.km_regreso ?? "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    style={{ textAlign: "center", padding: "40px" }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 1,
                        color: "neutral.400",
                      }}>
                      <FilterListOffRoundedIcon sx={{ fontSize: 40 }} />
                      <Typography level="body-sm">
                        {t("reports.no_data_desc")}
                      </Typography>
                    </Box>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Box>

        {/* --- FOOTER PAGINATION --- */}
        {pageItems.length > 0 && (
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.surface",
            }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems="center"
              spacing={2}>
              <Typography level="body-sm" color="neutral">
                {t("reports.showing_page", {
                  page: pageSafe,
                  total: totalPages,
                })}
              </Typography>
              <PaginationLite
                page={pageSafe}
                count={totalPages}
                onChange={setPage}
                size="sm"
              />
            </Stack>
          </Box>
        )}
      </Sheet>

      {/* --- EXPORT MODAL --- */}
      <ExportDialog
        open={openExport}
        onClose={() => setOpenExport(false)}
        rows={filtered}
        pageRows={pageItems}
        columns={columnsExport}
        defaultTitle={t("reports.report_items.ubicacion_vehiculo.title")}
        defaultSheetName="Ubicaciones"
        defaultFilenameBase={filenameBase}
        defaultOrientation="landscape" // Landscape porque son muchas columnas
        includeGeneratedStamp
      />
    </Box>
  );
}
