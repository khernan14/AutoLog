// src/pages/Inventario/BodegaDetail.jsx
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Stack,
  Table,
  Sheet,
  Button,
  IconButton,
  Divider,
  Input,
  Tooltip,
  Chip,
  Modal,
  ModalDialog,
  Select,
  Option,
} from "@mui/joy";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import QrCodeRoundedIcon from "@mui/icons-material/QrCodeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { getBodegaById } from "../../services/BodegasServices";
import { getActivosByBodega } from "../../services/ActivosBodegaServices";

import NuevoActivoEnBodegaModal from "./NuevoActivoEnBodegaModal";
import ActivoFormModal from "./ActivoFormModal";
import MoverActivoModal from "./MoverActivoModal";
import HistorialActivoModal from "./HistorialActivoModal";
import StyledQR from "../../components/QRCode/StyledQR";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import useIsMobile from "../../hooks/useIsMobile";
import logoTecnasa from "../../assets/newLogoTecnasaBlack.png";

// Link público firmado
import { getPublicLinkForActivo } from "../../services/PublicLinksService";

// Export
import ExportDialog from "@/components/Exports/ExportDialog";

// ✅ Estado de vista unificado + paginación
import ResourceState from "../../components/common/ResourceState";
import { getViewState } from "../../utils/viewState";
import PaginationLite from "@/components/common/PaginationLite";

export default function BodegaDetail() {
  const { id } = useParams();
  const isMobile = useIsMobile(768);
  const qrRef = useRef();

  // datos
  const [bodega, setBodega] = useState(null);
  const [activos, setActivos] = useState([]);

  // estado UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filtros / búsqueda
  const [search, setSearch] = useState("");

  // modales
  const [openNuevo, setOpenNuevo] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openMover, setOpenMover] = useState(false);
  const [openHist, setOpenHist] = useState(false);

  const [openQR, setOpenQR] = useState(false);
  const [activoQR, setActivoQR] = useState(null);
  const [publicLink, setPublicLink] = useState("");
  const [activoSeleccionado, setActivoSeleccionado] = useState(null);

  const [openExport, setOpenExport] = useState(false);

  // permisos
  const { userData, checkingSession, hasPermiso } = useAuth();
  const isAdmin = userData?.rol?.toLowerCase() === "admin";
  const can = useCallback(
    (p) => isAdmin || hasPermiso(p),
    [isAdmin, hasPermiso]
  );
  const canViewDetail = can("ver_bodegas");
  const canCreateAsset = can("crear_activos");
  const canEditAsset = can("editar_activos");
  const canMoveAsset = can("mover_activos");
  const canViewHistory = can("ver_historial_activos");
  const canGenerateQR = can("crear_QR");

  const { showToast } = useToast();

  // Export columns
  const EXPORT_COLS = [
    { label: "Código", key: "codigo" },
    { label: "Nombre", key: "nombre" },
    { label: "Tipo", key: "tipo" },
    { label: "Modelo", key: "modelo", get: (r) => r.modelo || "" },
    { label: "Serie", key: "serial_number", get: (r) => r.serial_number || "" },
    { label: "Estatus", key: "estatus" },
  ];
  const filenameBase = `activos_bodega_${new Date()
    .toISOString()
    .slice(0, 10)}`;

  // Carga
  const load = useCallback(async () => {
    if (checkingSession) {
      setLoading(true);
      return;
    }
    if (!canViewDetail) {
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [bod, acts] = await Promise.all([
        getBodegaById(id),
        getActivosByBodega(id),
      ]);
      setBodega(bod || null);
      setActivos(Array.isArray(acts) ? acts : []);
    } catch (err) {
      const msg = err?.message || "Error desconocido.";
      setError(
        /failed to fetch|network/i.test(msg)
          ? "No hay conexión con el servidor."
          : msg
      );
    } finally {
      setLoading(false);
    }
  }, [id, checkingSession, canViewDetail]);

  useEffect(() => {
    load();
  }, [load]);

  // Acciones CRUD/QR
  const onNew = () => {
    if (!canCreateAsset)
      return showToast("No tienes permiso para crear activos.", "warning");
    setActivoSeleccionado(null);
    setOpenNuevo(true);
  };

  const onEdit = (a) => {
    if (!canEditAsset)
      return showToast("No tienes permiso para editar activos.", "warning");
    setActivoSeleccionado(a);
    setOpenEdit(true);
  };

  const onMove = (a) => {
    if (!canMoveAsset)
      return showToast("No tienes permiso para mover activos.", "warning");
    setActivoSeleccionado(a);
    setOpenMover(true);
  };

  const onHist = (a) => {
    if (!canViewHistory)
      return showToast("No tienes permiso para ver el historial.", "warning");
    setActivoSeleccionado(a);
    setOpenHist(true);
  };

  const abrirQR = async (a) => {
    if (!canGenerateQR)
      return showToast("No tienes permiso para generar/ver QR.", "warning");
    setActivoQR(a);
    setPublicLink("");
    try {
      const { url } = await getPublicLinkForActivo(a.id);
      setPublicLink(url);
    } catch (e) {
      showToast(
        e?.message || "No se pudo generar el enlace público firmado",
        "danger"
      );
      setPublicLink(
        `${window.location.origin}/public/activos/${encodeURIComponent(
          a.codigo
        )}`
      );
    } finally {
      setOpenQR(true);
    }
  };

  const descargarPNG = () => {
    if (!qrRef.current || !activoQR) return;
    qrRef.current.download("png", `QR_${activoQR.codigo}`);
  };

  // ---- Orden & Paginación ----
  const [sortKey, setSortKey] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Filtro + orden + página
  const filtered = useMemo(() => {
    const s = (search || "").toLowerCase();
    return (activos || []).filter(
      (a) =>
        (a.codigo || "").toLowerCase().includes(s) ||
        (a.nombre || "").toLowerCase().includes(s) ||
        (a.tipo || "").toLowerCase().includes(s) ||
        (a.modelo || "").toLowerCase().includes(s) ||
        (a.serial_number || "").toLowerCase().includes(s)
    );
  }, [activos, search]);

  const sortedRows = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = (a?.[sortKey] ?? "").toString().toLowerCase();
      const vb = (b?.[sortKey] ?? "").toString().toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / perPage));
  const pageRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedRows.slice(start, start + perPage);
  }, [sortedRows, page, perPage]);

  function handleSort(key) {
    if (!key) return;
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  // reset page on dataset/filter/search change
  useEffect(() => {
    setPage(1);
  }, [search, activos.length, perPage]);

  // ---- Estado de vista unificado ----
  const viewState = getViewState({
    checkingSession,
    canView: canViewDetail,
    error,
    loading,
    hasData: sortedRows.length > 0,
  });

  // UI
  return (
    <Sheet
      variant="plain"
      sx={{
        flex: 1,
        width: "100%",
        pt: { xs: "calc(12px + var(--Header-height))", md: 4 },
        pb: { xs: 2, sm: 2, md: 4 },
        px: { xs: 2, md: 4 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "auto",
        minHeight: "100dvh",
        bgcolor: "background.body",
      }}>
      <Box sx={{ width: "100%" }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.5}
          mb={2}>
          <Box>
            <Typography level="h4">{bodega?.nombre || "—"}</Typography>
            <Typography level="body-sm" color="neutral">
              {bodega?.descripcion || " "}
            </Typography>
            <Typography level="body-xs" sx={{ opacity: 0.7, mt: 0.5 }}>
              Total activos: {sortedRows.length}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Input
              placeholder="Buscar por código, nombre, tipo, modelo o serie…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startDecorator={<SearchRoundedIcon />}
              endDecorator={
                search && (
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="neutral"
                    onClick={() => setSearch("")}
                    aria-label="Limpiar búsqueda">
                    <ClearIcon />
                  </IconButton>
                )
              }
              sx={{ width: { xs: "100%", sm: 360 } }}
            />

            <Tooltip
              title={
                canCreateAsset
                  ? "Crear activo"
                  : "No tienes permiso para crear. Solicítalo al administrador."
              }
              variant="solid"
              placement="bottom-end">
              <span>
                <Button
                  startDecorator={<AddRoundedIcon />}
                  onClick={onNew}
                  disabled={!canCreateAsset}
                  aria-disabled={!canCreateAsset}
                  variant={canCreateAsset ? "solid" : "soft"}
                  color={canCreateAsset ? "primary" : "neutral"}>
                  Nuevo Activo
                </Button>
              </span>
            </Tooltip>

            <Button
              variant="soft"
              startDecorator={<DownloadRoundedIcon />}
              onClick={() => setOpenExport(true)}
              sx={{ borderRadius: "999px" }}>
              Exportar
            </Button>
          </Stack>
        </Stack>

        <Card
          variant="outlined"
          sx={{
            overflowX: "auto",
            width: "100%",
            background: "background.surface",
          }}>
          {viewState !== "data" ? (
            <Box p={2}>
              <ResourceState
                state={viewState}
                error={error}
                onRetry={load}
                emptyTitle="Sin activos en esta bodega"
                emptyDescription="Puedes agregar el primero con el botón 'Nuevo Activo'."
              />
            </Box>
          ) : isMobile ? (
            // ====== MÓVIL: tarjetas ======
            <Stack spacing={2} p={2}>
              {pageRows.map((a) => (
                <Sheet
                  key={a.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: "md" }}>
                  <Stack spacing={1}>
                    <Typography level="title-md">{a.nombre}</Typography>
                    <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                      {a.codigo}
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                      <Typography level="body-sm">
                        <strong>Tipo:</strong> {a.tipo}
                      </Typography>
                      <Typography level="body-sm">
                        <strong>Modelo:</strong> {a.modelo || "—"}
                      </Typography>
                    </Stack>
                    <Typography level="body-sm">
                      <strong>Serie:</strong> {a.serial_number || "—"}
                    </Typography>

                    <Chip
                      size="sm"
                      variant="soft"
                      color={a.estatus === "Disponible" ? "success" : "neutral"}
                      sx={{ alignSelf: "flex-start" }}>
                      {a.estatus}
                    </Chip>

                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Tooltip
                        title={canEditAsset ? "Editar" : "Sin permiso"}
                        variant="soft">
                        <span>
                          <IconButton
                            size="sm"
                            onClick={() => onEdit(a)}
                            disabled={!canEditAsset}
                            aria-disabled={!canEditAsset}
                            variant={canEditAsset ? "soft" : "plain"}
                            color={canEditAsset ? "primary" : "neutral"}>
                            <EditRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip
                        title={canMoveAsset ? "Mover" : "Sin permiso"}
                        variant="soft">
                        <span>
                          <IconButton
                            size="sm"
                            onClick={() => onMove(a)}
                            disabled={!canMoveAsset}
                            aria-disabled={!canMoveAsset}
                            variant={canMoveAsset ? "soft" : "plain"}
                            color={canMoveAsset ? "primary" : "neutral"}>
                            <SwapHorizRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip
                        title={canViewHistory ? "Historial" : "Sin permiso"}
                        variant="soft">
                        <span>
                          <IconButton
                            size="sm"
                            onClick={() => onHist(a)}
                            disabled={!canViewHistory}
                            aria-disabled={!canViewHistory}
                            variant={canViewHistory ? "soft" : "plain"}
                            color={canViewHistory ? "primary" : "neutral"}>
                            <HistoryRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip
                        title={canGenerateQR ? "Ver QR" : "Sin permiso"}
                        variant="soft">
                        <span>
                          <IconButton
                            size="sm"
                            onClick={() => abrirQR(a)}
                            disabled={!canGenerateQR}
                            aria-disabled={!canGenerateQR}
                            variant={canGenerateQR ? "soft" : "plain"}
                            color={canGenerateQR ? "primary" : "neutral"}>
                            <QrCodeRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Sheet>
              ))}
            </Stack>
          ) : (
            // ====== ESCRITORIO: tabla ======
            <>
              <Table
                hoverRow
                size="sm"
                stickyHeader
                sx={{
                  minWidth: 980,
                  "--TableCell-headBackground":
                    "var(--joy-palette-background-level5)",
                  "--TableCell-headColor": "var(--joy-palette-text-secondary)",
                  "--TableCell-headFontWeight": 600,
                  "--TableCell-headBorderBottom":
                    "1px solid var(--joy-palette-divider)",
                  "--TableRow-hoverBackground":
                    "var(--joy-palette-background-level1)",
                }}>
                <thead>
                  <tr>
                    {[
                      { label: "Código", key: "codigo" },
                      { label: "Nombre", key: "nombre" },
                      { label: "Tipo", key: "tipo" },
                      { label: "Modelo", key: "modelo" },
                      { label: "Serie", key: "serial_number" },
                      { label: "Estatus", key: "estatus" },
                      { label: "", key: null }, // acciones
                    ].map((col) => (
                      <th key={col.label}>
                        {col.key ? (
                          <Button
                            variant="plain"
                            size="sm"
                            onClick={() => handleSort(col.key)}
                            endDecorator={
                              <ArrowDropDownIcon
                                sx={{
                                  transform:
                                    sortKey === col.key && sortDir === "desc"
                                      ? "rotate(180deg)"
                                      : "none",
                                  transition: "0.15s",
                                  opacity: sortKey === col.key ? 1 : 0.35,
                                }}
                              />
                            }>
                            {col.label}
                          </Button>
                        ) : (
                          col.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((a) => (
                    <tr key={a.id}>
                      <td>{a.codigo}</td>
                      <td>{a.nombre}</td>
                      <td>{a.tipo}</td>
                      <td>{a.modelo || "—"}</td>
                      <td>{a.serial_number || "—"}</td>
                      <td>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={
                            a.estatus === "Activo"
                              ? "success"
                              : a.estatus === "Arrendado"
                              ? "primary"
                              : a.estatus === "En Mantenimiento"
                              ? "warning"
                              : a.estatus === "Inactivo"
                              ? "danger"
                              : "neutral"
                          }>
                          {a.estatus}
                        </Chip>
                      </td>
                      <td>
                        <Stack direction="row" spacing={1}>
                          <Tooltip
                            title={canEditAsset ? "Editar" : "Sin permiso"}
                            variant="soft">
                            <span>
                              <IconButton
                                onClick={() => onEdit(a)}
                                disabled={!canEditAsset}
                                aria-disabled={!canEditAsset}
                                variant={canEditAsset ? "soft" : "plain"}
                                color={canEditAsset ? "primary" : "neutral"}>
                                <EditRoundedIcon />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip
                            title={canMoveAsset ? "Mover" : "Sin permiso"}
                            variant="soft">
                            <span>
                              <IconButton
                                onClick={() => onMove(a)}
                                disabled={!canMoveAsset}
                                aria-disabled={!canMoveAsset}
                                variant={canMoveAsset ? "soft" : "plain"}
                                color={canMoveAsset ? "primary" : "neutral"}>
                                <SwapHorizRoundedIcon />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip
                            title={canViewHistory ? "Historial" : "Sin permiso"}
                            variant="soft">
                            <span>
                              <IconButton
                                onClick={() => onHist(a)}
                                disabled={!canViewHistory}
                                aria-disabled={!canViewHistory}
                                variant={canViewHistory ? "soft" : "plain"}
                                color={canViewHistory ? "primary" : "neutral"}>
                                <HistoryRoundedIcon />
                              </IconButton>
                            </span>
                          </Tooltip>

                          <Tooltip
                            title={canGenerateQR ? "Ver QR" : "Sin permiso"}
                            variant="soft">
                            <span>
                              <IconButton
                                onClick={() => abrirQR(a)}
                                disabled={!canGenerateQR}
                                aria-disabled={!canGenerateQR}
                                variant={canGenerateQR ? "soft" : "plain"}
                                color={canGenerateQR ? "primary" : "neutral"}>
                                <QrCodeRoundedIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Footer paginación */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
                sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}
                spacing={1.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography level="body-sm">
                    Mostrando {(page - 1) * perPage + 1}–
                    {Math.min(page * perPage, sortedRows.length)} de{" "}
                    {sortedRows.length}
                  </Typography>
                  <Select
                    size="sm"
                    value={perPage}
                    onChange={(_, v) => {
                      setPerPage(Number(v) || 25);
                      setPage(1);
                    }}
                    sx={{ width: 140 }}>
                    {[10, 25, 50, 100].map((n) => (
                      <Option key={n} value={n}>
                        {n} / página
                      </Option>
                    ))}
                  </Select>
                </Stack>

                <PaginationLite
                  page={page}
                  count={totalPages}
                  onChange={setPage}
                  size="sm"
                  siblingCount={1}
                  boundaryCount={1}
                  showFirstLast
                />
              </Stack>
            </>
          )}
        </Card>

        {/* Modales */}
        {openNuevo && (
          <NuevoActivoEnBodegaModal
            open={openNuevo}
            onClose={() => setOpenNuevo(false)}
            idBodega={id}
            onSaved={load}
          />
        )}

        {openEdit && (
          <ActivoFormModal
            open={openEdit}
            onClose={() => setOpenEdit(false)}
            editing={activoSeleccionado}
            onSaved={load}
          />
        )}

        {openMover && (
          <MoverActivoModal
            open={openMover}
            onClose={() => setOpenMover(false)}
            activo={activoSeleccionado}
            onSaved={load}
          />
        )}

        {openHist && (
          <HistorialActivoModal
            open={openHist}
            onClose={() => setOpenHist(false)}
            activo={activoSeleccionado}
          />
        )}

        {/* Modal QR */}
        {openQR && (
          <Modal
            open={openQR}
            onClose={() => {
              setOpenQR(false);
              setPublicLink("");
            }}>
            <ModalDialog
              sx={{ width: { xs: "100%", sm: 420 }, textAlign: "center" }}>
              <Typography level="title-lg">QR del Activo</Typography>
              <Divider sx={{ my: 1 }} />

              {activoQR && (
                <Stack alignItems="center" spacing={1.5}>
                  <Typography level="body-md">
                    {activoQR.nombre} ({activoQR.codigo})
                  </Typography>

                  <div style={{ width: 220, height: 220 }}>
                    <StyledQR
                      ref={qrRef}
                      text={
                        publicLink ||
                        `${
                          window.location.origin
                        }/public/activos/${encodeURIComponent(activoQR.codigo)}`
                      }
                      logoUrl={logoTecnasa}
                      size={220}
                      exportScale={6}
                      format="svg"
                    />
                  </div>

                  {publicLink && (
                    <Typography level="body-sm" sx={{ mt: 1 }}>
                      <a href={publicLink} target="_blank" rel="noreferrer">
                        Ver página del activo
                      </a>
                    </Typography>
                  )}
                </Stack>
              )}

              <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
                <Button
                  variant="plain"
                  onClick={() => {
                    setOpenQR(false);
                    setPublicLink("");
                  }}>
                  Cerrar
                </Button>
                <Button onClick={descargarPNG}>Descargar PNG</Button>
              </Stack>
            </ModalDialog>
          </Modal>
        )}

        {/* Export */}
        <ExportDialog
          open={openExport}
          onClose={() => setOpenExport(false)}
          rows={sortedRows} // usa pageRows si quieres exportar solo lo visible
          columns={EXPORT_COLS}
          defaultTitle={`Activos de ${bodega?.nombre ?? ""}`}
          defaultSheetName="Activos"
          defaultFilenameBase={filenameBase}
          defaultOrientation="portrait"
          includeGeneratedStamp
          logoUrl="/newLogoTecnasa.png"
        />
      </Box>
    </Sheet>
  );
}
