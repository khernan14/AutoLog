// src/pages/ComponentsReport/Vehiculos/ConsumoCombustibleVehiculo.jsx
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
import LocalGasStationRoundedIcon from "@mui/icons-material/LocalGasStationRounded"; // Icono combustible
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";

// Componentes
import PaginationLite from "@/components/common/PaginationLite";
import ExportDialog from "@/components/Exports/ExportDialog";
import { getConsumoCombustibleVehiculoReport } from "@/services/ReportServices";

/* === Helpers === */
const debounced = (fn, ms = 250) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};
const fmtPct = (n) => {
  const v = Number(n);
  return Number.isFinite(v) ? `${v.toFixed(2)}%` : "N/A";
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

export default function ConsumoCombustibleVehiculo() {
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

  // Presets Rango (Mismo patrón que otros reportes, aunque el backend no use fechas, lo dejamos por consistencia si decides implementarlo luego)
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
        const data = await getConsumoCombustibleVehiculoReport({
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

  // Filtrado
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return raw;
    return (raw || []).filter((r) =>
      [r.marca, r.modelo, r.placa]
        .map((v) => String(v ?? "").toLowerCase())
        .some((s) => s.includes(q))
    );
  }, [raw, query]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageSafe = Math.min(Math.max(page, 1), totalPages);
  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, pageSafe, rowsPerPage]);

  // Export config
  const columnsExport = [
    {
      label: "#",
      key: "__rownum",
      get: (_row, i) => (pageSafe - 1) * rowsPerPage + i + 1,
    },
    { label: t("reports.columns.brand"), key: "marca" },
    { label: t("reports.columns.model"), key: "modelo" },
    { label: t("reports.columns.plate"), key: "placa" },
    {
      label: t("reports.columns.avg_consumption"),
      key: "promedio_consumo_porcentaje",
      get: (r) => {
        const v = Number(r.promedio_consumo_porcentaje);
        return Number.isFinite(v) ? v.toFixed(2) : "";
      },
    },
  ];

  const filenameBase = `consumo_combustible_${from || "all"}_${to || "all"}`;

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
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 4 }, py: 3 }}>
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
              {t("reports.report_items.consumo_combustible_vehiculo.title")}
            </Typography>
            <Typography level="body-sm" color="neutral">
              {t("reports.total_records", { count: filtered.length })}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Input
            startDecorator={<SearchRoundedIcon />}
            placeholder={t("reports.search_placeholder")}
            defaultValue={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            sx={{ minWidth: { xs: "100%", md: 260 } }}
          />
          <Button
            variant="solid"
            color="primary"
            startDecorator={<DownloadRoundedIcon />}
            onClick={() => setOpenExport(true)}
            disabled={filtered.length === 0}>
            {t("reports.actions.export")}
          </Button>
        </Stack>
      </Stack>

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
            aria-label={t(
              "reports.report_items.consumo_combustible_vehiculo.title"
            )}
            hoverRow
            stickyHeader
            sx={{
              "--TableCell-paddingX": "16px",
              "--TableCell-paddingY": "12px",
              "& thead th": {
                bgcolor: "background.level1",
                color: "text.tertiary",
                fontWeight: "md",
                textTransform: "uppercase",
                fontSize: "xs",
                letterSpacing: "0.05em",
                borderBottom: "1px solid",
                borderColor: "divider",
              },
              "& tbody tr:last-child td": { borderBottom: 0 },
            }}>
            <thead>
              <tr>
                <th style={{ width: 60, textAlign: "center" }}>#</th>
                <th>{t("reports.columns.brand")}</th>
                <th>{t("reports.columns.model")}</th>
                <th>{t("reports.columns.plate")}</th>
                <th style={{ textAlign: "right", width: 220 }}>
                  {t("reports.columns.avg_consumption")}
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length > 0 ? (
                pageItems.map((r, i) => {
                  const globalIndex = (pageSafe - 1) * rowsPerPage + i + 1;

                  return (
                    <tr key={`${r.placa}-${i}`}>
                      <td
                        style={{
                          textAlign: "center",
                          color: "var(--joy-palette-text-tertiary)",
                        }}>
                        {globalIndex}
                      </td>
                      <td>
                        <Typography fontWeight="md">
                          {r.marca || "—"}
                        </Typography>
                      </td>
                      <td>{r.modelo || "—"}</td>
                      <td>
                        <Chip
                          variant="outlined"
                          size="sm"
                          startDecorator={
                            <DirectionsCarRoundedIcon fontSize="small" />
                          }>
                          {r.placa || "—"}
                        </Chip>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={
                            Number(r.promedio_consumo_porcentaje) > 80
                              ? "danger"
                              : "success"
                          } // Color semántico
                          startDecorator={
                            <LocalGasStationRoundedIcon fontSize="small" />
                          }>
                          {fmtPct(r.promedio_consumo_porcentaje)}
                        </Chip>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
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
        rows={filtered} // todo el filtro
        pageRows={pageItems} // página actual
        columns={columnsExport}
        defaultTitle={t(
          "reports.report_items.consumo_combustible_vehiculo.title"
        )}
        defaultSheetName="Consumo"
        defaultFilenameBase={filenameBase}
        defaultOrientation="portrait"
        includeGeneratedStamp
        logoUrl="/newLogoTecnasa.png"
      />
    </Box>
  );
}
