// src/pages/ComponentsReport/Vehiculos/VehiculosMasUtilizados.jsx
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
import { useTranslation } from "react-i18next"; // 👈 Hook i18n
import { useNavigate, useLocation } from "react-router-dom";

// Iconos
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import FilterListOffRoundedIcon from "@mui/icons-material/FilterListOffRounded"; // Icono para empty state
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";

// Componentes
import PaginationLite from "@/components/common/PaginationLite";
import ExportDialog from "@/components/Exports/ExportDialog";
import { getVehiculosMasUtilizadosReport } from "@/services/ReportServices";

/** Utils */
const debounced = (fn, ms = 250) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

export default function VehiculosMasUtilizados() {
  const { t } = useTranslation(); // 👈 Inicializamos traducciones
  const navigate = useNavigate();
  const { search } = useLocation();

  const qs = useMemo(() => new URLSearchParams(search), [search]);
  const [query, setQuery] = useState(qs.get("q") || "");
  const [page, setPage] = useState(Number(qs.get("p") || 1));
  const [rowsPerPage] = useState(10);

  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [openExport, setOpenExport] = useState(false);

  // Sincroniza URL
  useEffect(() => {
    const params = new URLSearchParams(search);
    query ? params.set("q", query) : params.delete("q");
    page > 1 ? params.set("p", String(page)) : params.delete("p");
    const s = params.toString();
    window.history.replaceState(null, "", s ? `?${s}` : "");
  }, [query, page, search]);

  // Carga de datos
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await getVehiculosMasUtilizadosReport();
        setRaw(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr(t("reports.errors.load_failed"));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  // Filtro
  const onChangeQuery = useRef(
    debounced((v) => {
      setPage(1);
      setQuery(v);
    }, 250)
  ).current;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return raw;
    return raw.filter((r) => {
      return (
        String(r.marca || "")
          .toLowerCase()
          .includes(q) ||
        String(r.modelo || "")
          .toLowerCase()
          .includes(q) ||
        String(r.placa || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [raw, query]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageSafe = Math.min(Math.max(page, 1), totalPages);
  const pageItems = useMemo(() => {
    const start = (pageSafe - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, pageSafe, rowsPerPage]);

  // Definición de columnas para exportación (Dentro del componente para usar 't')
  const columnsExport = [
    {
      label: "#",
      key: "__rownum",
      get: (_row, i) => (pageSafe - 1) * rowsPerPage + i + 1,
    },
    { label: t("reports.columns.brand"), key: "marca" },
    { label: t("reports.columns.model"), key: "modelo" },
    { label: t("reports.columns.plate"), key: "placa" },
    { label: t("reports.columns.total_uses"), key: "total_usos" },
  ];

  const filenameBase = `vehiculos_top_${new Date().toISOString().slice(0, 10)}`;

  // --- Renderizado de Estados de Carga/Error ---
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
              {t("reports.report_items.vehiculos_uso.title")}
            </Typography>
            <Typography level="body-sm" color="neutral">
              {t("reports.total_records", { count: filtered.length })}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          {/* Buscador */}
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
          overflow: "hidden", // Para recortar las esquinas de la tabla
          bgcolor: "background.surface",
        }}>
        <Box sx={{ overflowX: "auto" }}>
          <Table
            aria-label={t("reports.report_items.vehiculos_uso.title")}
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
              "& tbody tr:last-child td": {
                borderBottom: 0,
              },
            }}>
            <thead>
              <tr>
                <th style={{ width: 60, textAlign: "center" }}>#</th>
                <th>{t("reports.columns.brand")}</th>
                <th>{t("reports.columns.model")}</th>
                <th>{t("reports.columns.plate")}</th>
                <th style={{ textAlign: "right", width: 180 }}>
                  {t("reports.columns.total_uses")}
                </th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length > 0 ? (
                pageItems.map((r, i) => {
                  const globalIndex = (pageSafe - 1) * rowsPerPage + i + 1;
                  // Destacamos el top 3 con colores sutiles en el índice
                  const isTop3 = globalIndex <= 3;

                  return (
                    <tr key={`${r.placa}-${i}`}>
                      <td
                        style={{
                          textAlign: "center",
                          color: "var(--joy-palette-text-tertiary)",
                        }}>
                        {isTop3 ? (
                          <Chip
                            size="sm"
                            variant="soft"
                            color={globalIndex === 1 ? "warning" : "neutral"}>
                            {globalIndex}
                          </Chip>
                        ) : (
                          globalIndex
                        )}
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
                        <Typography fontWeight="lg" color="primary">
                          {r.total_usos ?? 0}
                        </Typography>
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
        rows={filtered}
        columns={columnsExport}
        defaultTitle={t("reports.report_items.vehiculos_uso.title")}
        defaultSheetName="Vehículos"
        defaultFilenameBase={filenameBase}
        defaultOrientation="portrait" // Retrato queda mejor para pocas columnas
      />
    </Box>
  );
}
