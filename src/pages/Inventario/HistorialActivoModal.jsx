import { useState, useEffect, useMemo } from "react";
import {
  Modal,
  ModalDialog,
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
} from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import { getHistorialUbicaciones } from "../../services/ActivosServices";
import { useToast } from "../../context/ToastContext";
import useIsMobile from "../../hooks/useIsMobile";
import ExportDialog from "@/components/Exports/ExportDialog";

// Columnas para exportar historial
const EXPORT_COLS = [
  { label: "Destino", key: "tipo_destino" },
  { label: "Cliente", key: "cliente_nombre" },
  { label: "Site", key: "site_nombre" },
  { label: "Bodega", key: "bodega_nombre" },
  { label: "Inicio", key: "fecha_inicio" },
  { label: "Fin", key: "fecha_fin" },
  { label: "Motivo", key: "motivo" },
];

export default function HistorialActivoModal({ open, onClose, activo }) {
  const { showToast } = useToast();
  const isMobile = useIsMobile(768);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [tipoFilter, setTipoFilter] = useState("");
  const [textFilter, setTextFilter] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [fromDate, setFromDate] = useState(""); // YYYY-MM-DD
  const [toDate, setToDate] = useState(""); // YYYY-MM-DD

  // export
  const [openExport, setOpenExport] = useState(false);

  useEffect(() => {
    if (open && activo) {
      // reset filtros cada vez que se abre para este activo
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
      showToast(err.message || "Error al obtener historial", "danger");
    } finally {
      setLoading(false);
    }
  }

  // opciones dinámicas de tipo destino
  const tipoOptions = useMemo(() => {
    const set = new Set(
      (rows || []).map((r) => r.tipo_destino).filter(Boolean)
    );
    return Array.from(set);
  }, [rows]);

  // objetos Date para filtros de fecha
  const fromDateObj = useMemo(
    () => (fromDate ? new Date(`${fromDate}T00:00:00`) : null),
    [fromDate]
  );
  const toDateObj = useMemo(
    () => (toDate ? new Date(`${toDate}T23:59:59`) : null),
    [toDate]
  );

  // aplicar filtros sobre el historial completo
  const filtered = useMemo(() => {
    return (rows || []).filter((m) => {
      // tipo destino
      if (tipoFilter && m.tipo_destino !== tipoFilter) return false;

      // solo ubicación actual (fecha_fin null)
      if (onlyOpen && m.fecha_fin) return false;

      // filtro por fecha_inicio
      if (fromDateObj || toDateObj) {
        const inicio = new Date(m.fecha_inicio);
        if (fromDateObj && inicio < fromDateObj) return false;
        if (toDateObj && inicio > toDateObj) return false;
      }

      // filtro de texto
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

  const title =
    activo && (activo.nombre || activo.codigo)
      ? `Historial de Movimientos`
      : "Historial de Movimientos";

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog
          sx={{
            width: isMobile ? "100%" : 720,
            maxWidth: "100%",
            maxHeight: isMobile ? "100dvh" : "80vh",
            height: isMobile ? "100dvh" : "auto",
            borderRadius: isMobile ? 0 : "lg",
            display: "flex",
            flexDirection: "column",
            p: 1.5,
          }}>
          {/* Header */}
          <Stack spacing={0.25}>
            <Typography level="title-lg">{title}</Typography>
            {activo && (
              <Typography level="body-sm" sx={{ opacity: 0.7 }}>
                {activo.nombre} ({activo.codigo})
              </Typography>
            )}
          </Stack>
          <Divider sx={{ my: 1 }} />

          {/* Filtros (cuando hay datos y no está cargando) */}
          {!loading && rows.length > 0 && (
            <Stack spacing={1} mb={1}>
              {/* fila 1: búsqueda + tipo */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", sm: "center" }}>
                <Input
                  size="sm"
                  placeholder="Buscar por cliente, site, bodega, motivo…"
                  value={textFilter}
                  onChange={(e) => setTextFilter(e.target.value)}
                  startDecorator={<SearchRoundedIcon />}
                  endDecorator={
                    textFilter && (
                      <IconButton
                        size="sm"
                        variant="plain"
                        color="neutral"
                        onClick={() => setTextFilter("")}
                        aria-label="Limpiar búsqueda">
                        <ClearIcon />
                      </IconButton>
                    )
                  }
                  sx={{ flex: 1 }}
                />

                <Select
                  size="sm"
                  placeholder="Tipo destino"
                  value={tipoFilter}
                  onChange={(_, v) => setTipoFilter(v || "")}
                  sx={{ minWidth: 160 }}>
                  <Option value="">Todos</Option>
                  {tipoOptions.map((t) => (
                    <Option key={t} value={t}>
                      {t}
                    </Option>
                  ))}
                </Select>
              </Stack>

              {/* fila 2: fechas + solo abiertos + export */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", sm: "center" }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flex: 1, width: "100%" }}>
                  <FormControl size="sm" sx={{ flex: 1 }}>
                    <FormLabel>Desde</FormLabel>
                    <Input
                      size="sm"
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </FormControl>
                  <FormControl size="sm" sx={{ flex: 1 }}>
                    <FormLabel>Hasta</FormLabel>
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
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: { xs: 0.5, sm: 0 } }}>
                  <Checkbox
                    size="sm"
                    checked={onlyOpen}
                    onChange={(e) => setOnlyOpen(e.target.checked)}
                    label="Solo ubicación actual"
                  />

                  <Button
                    size="sm"
                    variant="soft"
                    startDecorator={<DownloadRoundedIcon />}
                    onClick={() => setOpenExport(true)}
                    disabled={filtered.length === 0}>
                    Exportar
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          )}

          {/* Contenido */}
          {loading ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <Stack spacing={1} alignItems="center">
                <CircularProgress size="sm" />
                <Typography level="body-sm">Cargando…</Typography>
              </Stack>
            </Box>
          ) : rows.length === 0 ? (
            <Sheet
              variant="soft"
              sx={{
                p: 2,
                borderRadius: "md",
                textAlign: "center",
                mt: 1,
              }}>
              <Typography level="body-sm">
                Sin movimientos registrados.
              </Typography>
            </Sheet>
          ) : filtered.length === 0 ? (
            <Sheet
              variant="soft"
              sx={{
                p: 2,
                borderRadius: "md",
                textAlign: "center",
                mt: 1,
              }}>
              <Typography level="body-sm">
                No hay movimientos que coincidan con los filtros.
              </Typography>
            </Sheet>
          ) : (
            <Box
              sx={{
                mt: 1,
                flex: 1,
                overflow: "auto",
                pr: 1,
              }}>
              <Stack spacing={2}>
                {filtered.map((m, idx) => {
                  const isCurrent = !m.fecha_fin;
                  const siteActivo =
                    m.site_activo === 1 ||
                    m.site_activo === true ||
                    m.site_activo === "1" ||
                    m.site_activo === "true";

                  const fechaInicio = new Date(m.fecha_inicio).toLocaleString();
                  const fechaFin = m.fecha_fin
                    ? new Date(m.fecha_fin).toLocaleString()
                    : null;

                  return (
                    <Stack
                      key={idx}
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start">
                      {/* Columna del timeline */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          mt: 0.5,
                        }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "999px",
                            bgcolor: isCurrent
                              ? "success.solidBg"
                              : "primary.solidBg",
                            boxShadow:
                              "0 0 0 2px var(--joy-palette-background-body)",
                          }}
                        />
                        {idx < filtered.length - 1 && (
                          <Box
                            sx={{
                              mt: 0.5,
                              flex: 1,
                              width: 2,
                              bgcolor: "divider",
                            }}
                          />
                        )}
                      </Box>

                      {/* Tarjeta del movimiento */}
                      <Sheet
                        variant="outlined"
                        sx={{
                          flex: 1,
                          p: 1.5,
                          borderRadius: "md",
                          bgcolor: "background.level1",
                        }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={1}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center">
                            <Chip
                              size="sm"
                              variant="soft"
                              color={
                                m.tipo_destino === "Cliente"
                                  ? "primary"
                                  : m.tipo_destino === "Bodega"
                                  ? "neutral"
                                  : m.tipo_destino === "Empleado"
                                  ? "success"
                                  : "neutral"
                              }>
                              {m.tipo_destino || "—"}
                            </Chip>

                            {isCurrent && (
                              <Chip size="sm" variant="solid" color="success">
                                Ubicación actual
                              </Chip>
                            )}
                          </Stack>

                          <Typography
                            level="body-xs"
                            sx={{
                              opacity: 0.8,
                              whiteSpace: "nowrap",
                              ml: 1,
                            }}>
                            {fechaInicio}
                          </Typography>
                        </Stack>

                        {/* Fechas inicio/fin */}
                        <Typography
                          level="body-xs"
                          sx={{ mt: 0.5, opacity: 0.8 }}>
                          {fechaFin
                            ? `Desde ${fechaInicio} hasta ${fechaFin}`
                            : `Desde ${fechaInicio} (aún vigente)`}
                        </Typography>

                        <Divider sx={{ my: 1 }} />

                        {/* Detalle de destino */}
                        <Stack spacing={0.5}>
                          <Typography level="body-sm">
                            <strong>Cliente / Site:</strong>{" "}
                            {m.cliente_nombre
                              ? `${m.cliente_nombre} / ${m.site_nombre || "—"}`
                              : "—"}
                            {m.site_nombre && !siteActivo && (
                              <Chip
                                size="sm"
                                variant="soft"
                                color="danger"
                                sx={{ ml: 0.5 }}>
                                Site inactivo
                              </Chip>
                            )}
                          </Typography>

                          <Typography level="body-sm">
                            <strong>Bodega:</strong> {m.bodega_nombre || "—"}
                          </Typography>

                          {m.empleado_nombre && (
                            <Typography level="body-sm">
                              <strong>Empleado:</strong> {m.empleado_nombre}
                            </Typography>
                          )}

                          <Typography level="body-sm">
                            <strong>Motivo:</strong> {m.motivo || "—"}
                          </Typography>
                        </Stack>
                      </Sheet>
                    </Stack>
                  );
                })}
              </Stack>
            </Box>
          )}
        </ModalDialog>
      </Modal>

      {/* Modal de exportación */}
      <ExportDialog
        open={openExport}
        onClose={() => setOpenExport(false)}
        rows={filtered}
        pageRows={filtered}
        columns={EXPORT_COLS}
        defaultTitle={
          activo
            ? `Historial de movimientos - ${activo.codigo}`
            : "Historial de movimientos"
        }
        defaultSheetName="Historial"
        defaultFilenameBase={
          activo ? `historial_${activo.codigo}` : "historial_activo"
        }
        defaultOrientation="portrait"
        logoUrl="/newLogoTecnasa.png"
      />
    </>
  );
}
