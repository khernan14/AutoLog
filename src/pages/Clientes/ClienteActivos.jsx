// src/pages/Inventario/ClienteActivos.jsx
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getActivosByCliente } from "../../services/ActivosServices";
import { getPublicLinkForActivo } from "../../services/PublicLinksService";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Table,
  Sheet,
  Input,
  Divider,
  IconButton,
  Chip,
  Tooltip,
  CircularProgress,
  Modal,
  ModalDialog,
} from "@mui/joy";

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

import HistorialActivoModal from "../Inventario/HistorialActivoModal";
import MoverActivoModal from "../Inventario/MoverActivoModal";
import StyledQR from "../../components/QRCode/StyledQR";
import StatusCard from "../../components/common/StatusCard";
import useIsMobile from "../../hooks/useIsMobile";

import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import logoTecnasa from "../../assets/newLogoTecnasaBlack.png";

// 👇 catálogos y colores globales
import { ESTATUS_ACTIVO, ESTATUS_COLOR } from "../../constants/inventario";

// 👇 tu select de catálogos (para filtros)
import CatalogSelect from "../../components/forms/CatalogSelect";

// 👇 tu modal reutilizable de edición
import ActivoFormModal from "@pages/Inventario/ActivoFormModal";

export default function ClienteActivos() {
  const { id } = useParams(); // id del cliente actual
  const isMobile = useIsMobile(768);
  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();
  const isAdmin = userData?.rol?.toLowerCase() === "admin";

  // permisos
  const can = useCallback(
    (p) => isAdmin || hasPermiso(p),
    [isAdmin, hasPermiso]
  );
  const canView = can("ver_activos");
  const canEdit = can("editar_activos");
  const canMove = can("mover_activos");
  const canViewHistory = can("ver_historial_activos");
  const canQR = can("crear_QR");

  const qrRef = useRef();

  // data
  const [rows, setRows] = useState([]);

  // ui state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filtros
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // modals
  const [openEdit, setOpenEdit] = useState(false);
  const [openMover, setOpenMover] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [openQR, setOpenQR] = useState(false);

  // selecciones
  const [editing, setEditing] = useState(null);
  const [activoSeleccionado, setActivoSeleccionado] = useState(null);
  const [activoQR, setActivoQR] = useState(null);
  const [publicLink, setPublicLink] = useState("");

  const load = useCallback(async () => {
    if (checkingSession) {
      setLoading(true);
      return;
    }
    if (!canView) {
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const activos = await getActivosByCliente(id);
      setRows(Array.isArray(activos) ? activos : []);
    } catch (err) {
      const msg = err?.message || "Error desconocido.";
      setError(
        /failed to fetch|network/i.test(msg)
          ? "No hay conexión con el servidor."
          : "No se pudieron cargar los activos."
      );
    } finally {
      setLoading(false);
    }
  }, [id, checkingSession, canView]);

  useEffect(() => {
    load();
  }, [load]);

  // acciones
  function editActivo(row) {
    if (!canEdit)
      return showToast("No tienes permisos para editar activos.", "warning");
    setEditing(row);
    setOpenEdit(true);
  }

  function abrirMover(row) {
    if (!canMove)
      return showToast("No tienes permisos para mover activos.", "warning");
    setActivoSeleccionado(row);
    setOpenMover(true);
  }

  function abrirHistorial(row) {
    if (!canViewHistory) {
      showToast("No tienes permisos para ver el historial.", "warning");
      return;
    }
    setActivoSeleccionado(row);
    setOpenHistorial(true);
  }

  async function abrirQR(row) {
    if (!canQR) {
      showToast("No tienes permisos para ver el QR.", "warning");
      return;
    }
    setActivoQR(row);
    setPublicLink("");
    try {
      const { url } = await getPublicLinkForActivo(row.id);
      setPublicLink(url);
    } catch (e) {
      showToast(
        e?.message || "No se pudo generar el enlace público firmado",
        "danger"
      );
      setPublicLink(
        `${window.location.origin}/public/activos/${encodeURIComponent(
          row.codigo
        )}`
      );
    } finally {
      setOpenQR(true);
    }
  }

  function descargarQR() {
    if (!qrRef.current || !activoQR) return;
    qrRef.current.download("png", `QR_${activoQR.codigo}`);
  }

  // filtrado
  const filtered = useMemo(() => {
    const s = (search || "").toLowerCase();
    return (rows || []).filter((r) => {
      const matchSearch =
        (r.codigo || "").toLowerCase().includes(s) ||
        (r.nombre || "").toLowerCase().includes(s) ||
        (r.modelo || "").toLowerCase().includes(s) ||
        (r.serial_number || "").toLowerCase().includes(s);
      const matchStatus = !statusFilter || r.estatus === statusFilter;
      const matchType = !typeFilter || r.tipo === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [rows, search, statusFilter, typeFilter]);

  // view state
  const viewState = checkingSession
    ? "checking"
    : !canView
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
          title="Sin permisos para ver activos"
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
            isNetwork ? "Problema de conexión" : "No se pudo cargar la lista"
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
          title="No se encontraron activos"
          description="Ajusta los filtros para encontrar resultados."
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

  return (
    <Box>
      {/* Header / filtros */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.5}
        mb={2}>
        <Typography level="h5">Activos del Cliente ({rows.length})</Typography>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          sx={{ width: { xs: "100%", sm: "auto" } }}>
          <Input
            placeholder="Buscar por código, nombre, modelo o serie…"
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
            sx={{ width: { xs: "100%", sm: 280 } }}
          />

          {/* Filtro de estatus desde catálogo */}
          <CatalogSelect
            catalog="estatusActivo"
            value={statusFilter}
            onChange={(_, v) => setStatusFilter(v || "")}
            placeholder="Estatus"
            allowEmpty
            sx={{ minWidth: 140 }}
          />

          {/* Filtro de tipo desde catálogo */}
          <CatalogSelect
            catalog="tiposActivo"
            value={typeFilter}
            onChange={(_, v) => setTypeFilter(v || "")}
            placeholder="Tipo"
            allowEmpty
            sx={{ minWidth: 140 }}
          />
        </Stack>
      </Stack>

      {/* Contenido principal */}
      <Card variant="outlined" sx={{ overflowX: "auto" }}>
        {viewState !== "data" ? (
          <Box p={2}>{renderStatus()}</Box>
        ) : isMobile ? (
          // ====== Móvil: tarjetas ======
          <Stack spacing={2} p={2}>
            {filtered.map((r) => (
              <Sheet
                key={r.id}
                variant="outlined"
                sx={{ p: 2, borderRadius: "md" }}>
                <Stack spacing={0.75}>
                  <Typography level="title-md">{r.nombre}</Typography>
                  <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                    {r.codigo}
                  </Typography>

                  <Stack direction="row" spacing={2}>
                    <Typography level="body-sm">
                      <strong>Tipo:</strong> {r.tipo}
                    </Typography>
                    <Typography level="body-sm">
                      <strong>Modelo:</strong> {r.modelo || "—"}
                    </Typography>
                  </Stack>
                  <Typography level="body-sm">
                    <strong>Serie:</strong> {r.serial_number || "—"}
                  </Typography>

                  <Chip
                    size="sm"
                    variant="soft"
                    color={ESTATUS_COLOR[r.estatus] || "neutral"}
                    sx={{ alignSelf: "flex-start" }}>
                    {r.estatus}
                  </Chip>

                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <Tooltip
                      title={canEdit ? "Editar" : "Sin permiso"}
                      variant="soft">
                      <span>
                        <IconButton
                          size="sm"
                          onClick={() => editActivo(r)}
                          disabled={!canEdit}
                          aria-disabled={!canEdit}
                          variant={canEdit ? "soft" : "plain"}
                          color={canEdit ? "primary" : "neutral"}>
                          <EditRoundedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip
                      title={canMove ? "Mover" : "Sin permiso"}
                      variant="soft">
                      <span>
                        <IconButton
                          size="sm"
                          onClick={() => abrirMover(r)}
                          disabled={!canMove}
                          aria-disabled={!canMove}
                          variant={canMove ? "soft" : "plain"}
                          color={canMove ? "primary" : "neutral"}>
                          <SwapHorizRoundedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip title="Historial" variant="soft">
                      <span>
                        <IconButton
                          size="sm"
                          onClick={() => abrirHistorial(r)}
                          disabled={!canViewHistory}
                          aria-disabled={!canViewHistory}
                          variant={canViewHistory ? "soft" : "plain"}
                          color={canViewHistory ? "primary" : "neutral"}>
                          <HistoryRoundedIcon />
                        </IconButton>
                      </span>
                    </Tooltip>

                    <Tooltip
                      title={canQR ? "Ver QR" : "Sin permiso"}
                      variant="soft">
                      <span>
                        <IconButton
                          size="sm"
                          onClick={() => abrirQR(r)}
                          disabled={!canQR}
                          aria-disabled={!canQR}
                          variant={canQR ? "soft" : "plain"}
                          color={canQR ? "primary" : "neutral"}>
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
          // ====== Escritorio: tabla ======
          <Table size="sm" stickyHeader hoverRow sx={{ minWidth: 980 }}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Modelo</th>
                <th>Serie</th>
                <th>Estatus</th>
                <th style={{ width: 180 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>{r.codigo}</td>
                  <td>{r.nombre}</td>
                  <td>{r.tipo}</td>
                  <td>{r.modelo || "—"}</td>
                  <td>{r.serial_number || "—"}</td>
                  <td>
                    <Chip
                      size="sm"
                      variant="soft"
                      color={ESTATUS_COLOR[r.estatus] || "neutral"}>
                      {r.estatus}
                    </Chip>
                  </td>
                  <td>
                    <Stack direction="row" spacing={1}>
                      <Tooltip
                        title={canEdit ? "Editar" : "Sin permiso"}
                        variant="soft">
                        <span>
                          <IconButton
                            onClick={() => editActivo(r)}
                            disabled={!canEdit}
                            aria-disabled={!canEdit}
                            variant={canEdit ? "soft" : "plain"}
                            color={canEdit ? "primary" : "neutral"}>
                            <EditRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip
                        title={canMove ? "Mover" : "Sin permiso"}
                        variant="soft">
                        <span>
                          <IconButton
                            onClick={() => abrirMover(r)}
                            disabled={!canMove}
                            aria-disabled={!canMove}
                            variant={canMove ? "soft" : "plain"}
                            color={canMove ? "primary" : "neutral"}>
                            <SwapHorizRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Historial" variant="soft">
                        <span>
                          <IconButton
                            onClick={() => abrirHistorial(r)}
                            disabled={!canViewHistory}
                            aria-disabled={!canViewHistory}
                            variant={canViewHistory ? "soft" : "plain"}
                            color={canViewHistory ? "primary" : "neutral"}>
                            <HistoryRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip
                        title={canQR ? "Ver QR" : "Sin permiso"}
                        variant="soft">
                        <span>
                          <IconButton
                            onClick={() => abrirQR(r)}
                            disabled={!canQR}
                            aria-disabled={!canQR}
                            variant={canQR ? "soft" : "plain"}
                            color={canQR ? "primary" : "neutral"}>
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

      {/* Modal Editar (reutilizable) */}
      <ActivoFormModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        editing={editing}
        onSaved={load}
      />

      {/* Modal QR */}
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
            <Stack alignItems="center" spacing={1}>
              <Typography level="body-md">
                {activoQR.nombre} ({activoQR.codigo})
              </Typography>
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
              />
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
            <Button variant="plain" onClick={() => setOpenQR(false)}>
              Cerrar
            </Button>
            <Button onClick={descargarQR}>Descargar PNG</Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* Modal Historial */}
      <HistorialActivoModal
        open={openHistorial}
        onClose={() => setOpenHistorial(false)}
        activo={activoSeleccionado}
      />

      {/* Modal Mover */}
      <MoverActivoModal
        open={openMover}
        onClose={() => setOpenMover(false)}
        activo={activoSeleccionado}
        onSaved={() => {
          setOpenMover(false);
          load();
        }}
        defaultTipo="Cliente"
        defaultClienteId={Number(id)}
      />
    </Box>
  );
}
