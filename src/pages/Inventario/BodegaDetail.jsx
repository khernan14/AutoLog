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
  CircularProgress,
} from "@mui/joy";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import QrCodeRoundedIcon from "@mui/icons-material/QrCodeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearIcon from "@mui/icons-material/Clear";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import { Modal, ModalDialog } from "@mui/joy";

import { getBodegaById } from "../../services/BodegasServices";
import { getActivosByBodega } from "../../services/ActivosBodegaServices";

import NuevoActivoEnBodegaModal from "./NuevoActivoEnBodegaModal";
import ActivoFormModal from "./ActivoFormModal";
import MoverActivoModal from "./MoverActivoModal";
import HistorialActivoModal from "./HistorialActivoModal";
import StyledQR from "../../components/QRCode/StyledQR";

import StatusCard from "../../components/common/StatusCard";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import useIsMobile from "../../hooks/useIsMobile";
import logoTecnasa from "../assets/newLogoTecnasaBlack.png";

export default function BodegaDetail() {
  const { id } = useParams();
  const isMobile = useIsMobile(768);
  const qrRef = useRef();

  // datos
  const [bodega, setBodega] = useState(null);
  const [activos, setActivos] = useState([]);
  const [search, setSearch] = useState("");

  // estado UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // modales
  const [openNuevo, setOpenNuevo] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openMover, setOpenMover] = useState(false);
  const [openHist, setOpenHist] = useState(false);

  const [openQR, setOpenQR] = useState(false);
  const [activoQR, setActivoQR] = useState(null);
  const [activoSeleccionado, setActivoSeleccionado] = useState(null);

  // auth/perm
  const { userData, checkingSession, hasPermiso } = useAuth();
  const isAdmin = userData?.rol?.toLowerCase() === "admin";
  const can = useCallback(
    (p) => isAdmin || hasPermiso(p),
    [isAdmin, hasPermiso]
  );

  // permisos (ajusta si usas otros nombres)
  const canViewDetail = can("ver_bodegas");
  const canCreateAsset = can("crear_activos");
  const canEditAsset = can("editar_activos");
  const canMoveAsset = can("mover_activos");
  const canViewHistory = can("ver_historial_activos");
  const canGenerateQR = can("crear_QR");

  const { showToast } = useToast();

  const load = useCallback(async () => {
    if (checkingSession) {
      setLoading(true);
      return;
    }
    if (!canViewDetail) {
      setError(null); // dejar que el viewState muestre “sin permisos”
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

  // acciones
  const onNew = () => {
    if (!canCreateAsset) {
      showToast(
        "No tienes permiso para crear activos. Solicítalo al administrador.",
        "warning"
      );
      return;
    }
    setActivoSeleccionado(null);
    setOpenNuevo(true);
  };

  const onEdit = (a) => {
    if (!canEditAsset) {
      showToast("No tienes permiso para editar activos.", "warning");
      return;
    }
    setActivoSeleccionado(a);
    setOpenEdit(true);
  };

  const onMove = (a) => {
    if (!canMoveAsset) {
      showToast("No tienes permiso para mover activos.", "warning");
      return;
    }
    setActivoSeleccionado(a);
    setOpenMover(true);
  };

  const onHist = (a) => {
    if (!canViewHistory) {
      showToast("No tienes permiso para ver el historial.", "warning");
      return;
    }
    setActivoSeleccionado(a);
    setOpenHist(true);
  };

  const abrirQR = (a) => {
    if (!canGenerateQR) {
      showToast("No tienes permiso para generar/ver QR.", "warning");
      return;
    }
    setActivoQR(a);
    setOpenQR(true);
  };

  const descargarQR = () => {
    if (!qrRef.current || !activoQR) return;
    qrRef.current.download("png", `QR_${activoQR.codigo}`);
  };

  // filtro
  const clearSearch = () => setSearch("");
  const filtered = useMemo(() => {
    const s = (search || "").toLowerCase();
    const src = Array.isArray(activos) ? activos : [];
    return src.filter(
      (a) =>
        (a.codigo || "").toLowerCase().includes(s) ||
        (a.nombre || "").toLowerCase().includes(s) ||
        (a.tipo || "").toLowerCase().includes(s) ||
        (a.modelo || "").toLowerCase().includes(s) ||
        (a.serial_number || "").toLowerCase().includes(s)
    );
  }, [activos, search]);

  // view state
  const viewState = checkingSession
    ? "checking"
    : !canViewDetail
    ? "no-permission"
    : error
    ? "error"
    : !loading && filtered.length === 0
    ? "empty"
    : loading
    ? "loading"
    : "data";

  const renderStatus = () => {
    if (viewState === "checking") {
      return (
        <StatusCard
          icon={<HourglassEmptyRoundedIcon />}
          title="Verificando sesión…"
          description={
            <Stack alignItems="center" spacing={1}>
              <CircularProgress size="sm" />
              <Typography level="body-xs" sx={{ opacity: 0.8 }}>
                Por favor, espera un momento.
              </Typography>
            </Stack>
          }
        />
      );
    }
    if (viewState === "no-permission") {
      return (
        <StatusCard
          color="danger"
          icon={<LockPersonRoundedIcon />}
          title="Sin permisos para ver esta bodega"
          description="Consulta con un administrador para obtener acceso."
        />
      );
    }
    if (viewState === "error") {
      const isNetwork = /conexión|failed to fetch/i.test(error || "");
      return (
        <StatusCard
          color={isNetwork ? "warning" : "danger"}
          icon={
            isNetwork ? <WifiOffRoundedIcon /> : <ErrorOutlineRoundedIcon />
          }
          title={
            isNetwork ? "Problema de conexión" : "No se pudo cargar la bodega"
          }
          description={error}
          actions={
            <Button
              startDecorator={<RestartAltRoundedIcon />}
              onClick={load}
              variant="soft">
              Reintentar
            </Button>
          }
        />
      );
    }
    if (viewState === "empty") {
      return (
        <StatusCard
          color="neutral"
          icon={<InfoOutlinedIcon />}
          title="Sin activos en esta bodega"
          description="Puedes agregar el primero con el botón 'Nuevo Activo'."
        />
      );
    }
    if (viewState === "loading") {
      return (
        <Sheet p={3} sx={{ textAlign: "center" }}>
          <Stack spacing={1} alignItems="center">
            <CircularProgress />
            <Typography level="body-sm">Cargando…</Typography>
          </Stack>
        </Sheet>
      );
    }
    return null;
  };

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
                    onClick={clearSearch}
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
          </Stack>
        </Stack>

        {/* Contenido */}
        <Card
          variant="plain"
          sx={{ overflowX: "auto", width: "100%", background: "white" }}>
          {viewState !== "data" ? (
            <Box p={2}>{renderStatus()}</Box>
          ) : isMobile ? (
            // ====== MÓVIL: tarjetas ======
            <Stack spacing={2} p={2}>
              {filtered.map((a) => (
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
            <Table size="sm" stickyHeader hoverRow sx={{ minWidth: 900 }}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Modelo</th>
                  <th>Serie</th>
                  <th>Estatus</th>
                  <th style={{ width: 160 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>{a.codigo}</td>
                    <td>{a.nombre}</td>
                    <td>{a.tipo}</td>
                    <td>{a.modelo || "—"}</td>
                    <td>{a.serial_number || "—"}</td>
                    <td>
                      <Typography
                        level="body-sm"
                        color={
                          a.estatus === "Disponible" ? "success" : "neutral"
                        }>
                        {a.estatus}
                      </Typography>
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
          <Modal open={openQR} onClose={() => setOpenQR(false)}>
            <ModalDialog
              sx={{ width: { xs: "100%", sm: 420 }, textAlign: "center" }}>
              <Typography level="title-lg">QR del Activo</Typography>
              <Divider sx={{ my: 1 }} />
              {activoQR && (
                <Stack alignItems="center" spacing={1}>
                  <Typography level="body-md">
                    {activoQR.nombre} ({activoQR.codigo})
                  </Typography>
                  <StyledQR
                    ref={qrRef}
                    text={`${
                      window.location.origin
                    }/public/activos/${encodeURIComponent(activoQR.codigo)}`}
                    logoUrl={logoTecnasa}
                    size={220}
                  />
                </Stack>
              )}
              <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
                <Button variant="plain" onClick={() => setOpenQR(false)}>
                  Cerrar
                </Button>
                <Button onClick={descargarQR}>Descargar PNG</Button>
              </Stack>
            </ModalDialog>
          </Modal>
        )}
      </Box>
    </Sheet>
  );
}
