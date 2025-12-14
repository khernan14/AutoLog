// src/pages/Inventario/HistorialActivoModal.jsx
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Drawer,
  Typography,
  Divider,
  Sheet,
  Chip,
  Stack,
  Box,
  CircularProgress,
  Input,
  Select,
  Option,
  Checkbox,
  IconButton,
  Button,
  FormControl,
  FormLabel,
  ModalClose,
} from "@mui/joy";

// Iconos
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import FilterListOffRoundedIcon from "@mui/icons-material/FilterListOffRounded"; // Icono empty
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";

// Services & Context
import { getHistorialUbicaciones } from "../../services/ActivosServices";
import { useToast } from "../../context/ToastContext";
import useIsMobile from "../../hooks/useIsMobile";
import ExportDialog from "@/components/Exports/ExportDialog";

export default function HistorialActivoModal({ open, onClose, activo }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const isMobile = useIsMobile(768);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [tipoFilter, setTipoFilter] = useState("");
  const [textFilter, setTextFilter] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Export
  const [openExport, setOpenExport] = useState(false);

  // Carga
  useEffect(() => {
    if (open && activo) {
      setTipoFilter("");
      setTextFilter("");
      setOnlyOpen(false);
      setFromDate("");
      setToDate("");
      load();
    }
  }, [open, activo]);

  async function load() {
    setLoading(true);
    try {
      const data = await getHistorialUbicaciones(activo.id);
      setRows(data || []);
    } catch (err) {
      showToast(
        err.message || t("inventory.history.errors.load_failed"),
        "danger"
      );
    } finally {
      setLoading(false);
    }
  }

  // Opciones dinámicas
  const tipoOptions = useMemo(() => {
    const set = new Set(
      (rows || []).map((r) => r.tipo_destino).filter(Boolean)
    );
    return Array.from(set);
  }, [rows]);

  // Filtros de fecha
  const fromDateObj = useMemo(
    () => (fromDate ? new Date(`${fromDate}T00:00:00`) : null),
    [fromDate]
  );
  const toDateObj = useMemo(
    () => (toDate ? new Date(`${toDate}T23:59:59`) : null),
    [toDate]
  );

  // Filtrado
  const filtered = useMemo(() => {
    return (rows || []).filter((m) => {
      if (tipoFilter && m.tipo_destino !== tipoFilter) return false;
      if (onlyOpen && m.fecha_fin) return false;

      if (fromDateObj || toDateObj) {
        const inicio = new Date(m.fecha_inicio);
        if (fromDateObj && inicio < fromDateObj) return false;
        if (toDateObj && inicio > toDateObj) return false;
      }

      const q = textFilter.trim().toLowerCase();
      if (q) {
        const haystack = [
          m.cliente_nombre,
          m.site_nombre,
          m.bodega_nombre,
          m.empleado_nombre,
          m.motivo,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [rows, tipoFilter, onlyOpen, textFilter, fromDateObj, toDateObj]);

  // Columnas Exportación (Traducidas)
  const EXPORT_COLS = [
    { label: t("inventory.history.columns.destination"), key: "tipo_destino" },
    { label: t("inventory.history.columns.client"), key: "cliente_nombre" },
    { label: t("inventory.history.columns.site"), key: "site_nombre" },
    { label: t("inventory.history.columns.warehouse"), key: "bodega_nombre" },
    { label: t("inventory.history.columns.start_date"), key: "fecha_inicio" },
    { label: t("inventory.history.columns.end_date"), key: "fecha_fin" },
    { label: t("inventory.history.columns.reason"), key: "motivo" },
  ];

  return (
    <Drawer
      anchor="right"
      size="lg" // Un poco más ancho para el historial
      open={open}
      onClose={onClose}
      slotProps={{
        content: {
          sx: {
            bgcolor: "background.surface",
            p: 0,
            display: "flex",
            flexDirection: "column",
            boxShadow: "xl",
          },
        },
      }}>
      {/* HEADER FIJO */}
      <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography level="h4">{t("inventory.history.title")}</Typography>
            {activo && (
              <Typography level="body-sm" color="neutral">
                {activo.nombre}{" "}
                <Typography color="primary" fontFamily="monospace">
                  ({activo.codigo})
                </Typography>
              </Typography>
            )}
          </Stack>
          <ModalClose onClick={onClose} />
        </Stack>

        {/* FILTROS (Solo si hay datos) */}
        {!loading && rows.length > 0 && (
          <Stack spacing={2} mt={3}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Input
                size="sm"
                placeholder={t("inventory.history.search_placeholder")}
                value={textFilter}
                onChange={(e) => setTextFilter(e.target.value)}
                startDecorator={<SearchRoundedIcon />}
                endDecorator={
                  textFilter && (
                    <IconButton
                      size="sm"
                      variant="plain"
                      onClick={() => setTextFilter("")}>
                      <ClearIcon />
                    </IconButton>
                  )
                }
                sx={{ flex: 1 }}
              />
              <Select
                size="sm"
                placeholder={t("inventory.history.filter_type")}
                value={tipoFilter}
                onChange={(_, v) => setTipoFilter(v || "")}
                sx={{ minWidth: 140 }}>
                <Option value="">{t("common.status.all")}</Option>
                {tipoOptions.map((t) => (
                  <Option key={t} value={t}>
                    {t}
                  </Option>
                ))}
              </Select>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems="center">
              <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
                <FormControl size="sm" sx={{ flex: 1 }}>
                  <FormLabel>{t("inventory.history.date_from")}</FormLabel>
                  <Input
                    size="sm"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </FormControl>
                <FormControl size="sm" sx={{ flex: 1 }}>
                  <FormLabel>{t("inventory.history.date_to")}</FormLabel>
                  <Input
                    size="sm"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </FormControl>
              </Stack>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ mt: { xs: 1, sm: 3 } }}>
                <Checkbox
                  size="sm"
                  checked={onlyOpen}
                  onChange={(e) => setOnlyOpen(e.target.checked)}
                  label={t("inventory.history.only_current")}
                />
                <Button
                  size="sm"
                  variant="outlined"
                  startDecorator={<DownloadRoundedIcon />}
                  onClick={() => setOpenExport(true)}
                  disabled={filtered.length === 0}>
                  {t("common.actions.export")}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        )}
      </Box>

      {/* CONTENIDO SCROLLABLE */}
      <Box
        sx={{ flex: 1, overflowY: "auto", p: 3, bgcolor: "background.level1" }}>
        {loading ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%">
            <CircularProgress size="lg" thickness={3} />
            <Typography level="body-sm" mt={2}>
              {t("common.loading")}
            </Typography>
          </Box>
        ) : rows.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            color="neutral.400">
            <HistoryRoundedIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography level="body-md">
              {t("inventory.history.empty.no_history")}
            </Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            color="neutral.400">
            <FilterListOffRoundedIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography level="body-md">
              {t("inventory.history.empty.no_matches")}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0}>
            {" "}
            {/* Spacing 0 para que la línea conecte bien */}
            {filtered.map((m, idx) => {
              const isCurrent = !m.fecha_fin;
              const fechaInicio = new Date(m.fecha_inicio).toLocaleString();
              const fechaFin = m.fecha_fin
                ? new Date(m.fecha_fin).toLocaleString()
                : null;
              const siteActivo =
                m.site_activo === 1 ||
                m.site_activo === true ||
                m.site_activo === "1";

              return (
                <Stack key={idx} direction="row" spacing={2}>
                  {/* TIMELINE COLUMN */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      minWidth: 24,
                    }}>
                    {/* Línea superior (conectar con el anterior) */}
                    {idx > 0 && (
                      <Box sx={{ width: 2, height: 20, bgcolor: "divider" }} />
                    )}

                    {/* Punto / Nodo */}
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        bgcolor: isCurrent ? "success.500" : "neutral.300",
                        boxShadow: isCurrent
                          ? "0 0 0 3px var(--joy-palette-success-100)"
                          : "none",
                        zIndex: 1,
                        my: 0.5, // Pequeño ajuste visual
                      }}
                    />

                    {/* Línea inferior (conectar con el siguiente) */}
                    {idx < filtered.length - 1 && (
                      <Box
                        sx={{
                          width: 2,
                          flex: 1,
                          bgcolor: "divider",
                          minHeight: 20,
                        }}
                      />
                    )}
                  </Box>

                  {/* TARJETA DE MOVIMIENTO */}
                  <Sheet
                    variant="outlined"
                    sx={{
                      flex: 1,
                      p: 2,
                      mb: 2, // Margen inferior entre tarjetas
                      borderRadius: "md",
                      bgcolor: isCurrent
                        ? "background.surface"
                        : "background.body",
                      borderColor: isCurrent ? "success.200" : "divider",
                      boxShadow: isCurrent ? "sm" : "none",
                    }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      mb={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="sm"
                          variant={isCurrent ? "solid" : "soft"}
                          color={
                            m.tipo_destino === "Cliente"
                              ? "primary"
                              : m.tipo_destino === "Bodega"
                              ? "neutral"
                              : "success"
                          }>
                          {m.tipo_destino || "—"}
                        </Chip>
                        {isCurrent && (
                          <Chip size="sm" variant="outlined" color="success">
                            {t("inventory.history.current_location")}
                          </Chip>
                        )}
                      </Stack>
                      <Typography
                        level="body-xs"
                        textAlign="right"
                        sx={{ whiteSpace: "nowrap", ml: 1 }}>
                        {fechaInicio}
                      </Typography>
                    </Stack>

                    <Stack spacing={0.5}>
                      <Typography level="body-sm">
                        <strong>
                          {t("inventory.history.labels.destination")}:
                        </strong>{" "}
                        {m.cliente_nombre ? (
                          <>
                            {m.cliente_nombre} / {m.site_nombre || "—"}
                            {m.site_nombre && !siteActivo && (
                              <Chip
                                size="sm"
                                variant="soft"
                                color="danger"
                                sx={{ ml: 1, fontSize: "xs" }}>
                                {t("inventory.history.labels.inactive_site")}
                              </Chip>
                            )}
                          </>
                        ) : m.bodega_nombre ? (
                          m.bodega_nombre
                        ) : m.empleado_nombre ? (
                          m.empleado_nombre
                        ) : (
                          "—"
                        )}
                      </Typography>

                      <Typography level="body-sm" color="neutral">
                        <strong>{t("inventory.history.labels.reason")}:</strong>{" "}
                        {m.motivo || "—"}
                      </Typography>

                      {fechaFin && (
                        <Typography
                          level="body-xs"
                          color="neutral"
                          sx={{ mt: 0.5, fontStyle: "italic" }}>
                          {t("inventory.history.ended_at")}: {fechaFin}
                        </Typography>
                      )}
                    </Stack>
                  </Sheet>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Box>

      {/* Export Dialog */}
      <ExportDialog
        open={openExport}
        onClose={() => setOpenExport(false)}
        rows={filtered}
        columns={EXPORT_COLS}
        defaultTitle={`${t("inventory.history.export_title")} - ${
          activo?.codigo
        }`}
        defaultFilenameBase={`historial_${activo?.codigo}`}
      />
    </Drawer>
  );
}
