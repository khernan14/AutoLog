// src/pages/Inventario/ClienteActivos.jsx
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getActivosByCliente } from "../../services/ActivosServices";
import { getPublicLinkForActivo } from "../../services/PublicLinksService";
import { getBodegas } from "../../services/BodegasServices";
import { moverABodega } from "../../services/UbicacionesServices";

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
  Checkbox,
  Autocomplete,
  FormControl,
  FormLabel,
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

import { ESTATUS_COLOR } from "../../constants/inventario";
import CatalogSelect from "../../components/forms/CatalogSelect";
import ActivoFormModal from "@pages/Inventario/ActivoFormModal";

// ⭐ hook de highlight/scroll
import useRowFocusHighlight from "../../hooks/useRowFocusHighlight";

// Normalizador para ignorar mayúsculas/tildes
const normalize = (val) =>
  (val || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export default function ClienteActivos() {
  const { id } = useParams(); // id del cliente actual
  const [searchParams, setSearchParams] = useSearchParams();

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

  // selección múltiple
  const [selectedIds, setSelectedIds] = useState([]);
  const hasSelection = selectedIds.length > 0;

  // modals
  const [openEdit, setOpenEdit] = useState(false);
  const [openMover, setOpenMover] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [openQR, setOpenQR] = useState(false);

  // modal de movimiento masivo a bodega
  const [openBulkMover, setOpenBulkMover] = useState(false);
  const [bodegas, setBodegas] = useState([]);
  const [loadingBodegas, setLoadingBodegas] = useState(false);
  const [bulkBodega, setBulkBodega] = useState("");
  const [bulkMotivo, setBulkMotivo] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

  // selecciones individuales
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
      setSelectedIds([]); // limpiar selección al recargar
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

  // nombre del cliente (si viene en la consulta)
  const clienteNombre = useMemo(() => rows[0]?.cliente_nombre || "", [rows]);

  // filtrado (con normalize para ignorar tildes/mayúsculas)
  const filtered = useMemo(() => {
    const s = normalize(search);
    return (rows || []).filter((r) => {
      const matchSearch =
        normalize(r.codigo).includes(s) ||
        normalize(r.nombre).includes(s) ||
        normalize(r.modelo).includes(s) ||
        normalize(r.serial_number).includes(s) ||
        normalize(r.site_nombre).includes(s);

      const matchStatus = !statusFilter || r.estatus === statusFilter;
      const matchType = !typeFilter || r.tipo === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [rows, search, statusFilter, typeFilter]);

  // ⭐ Hook de focus/highlight, basado en token (id/código/serie)
  const { highlightId, focusedRef, focusByToken } = useRowFocusHighlight({
    rows: filtered,
    matchRow: (r, token) => {
      const t = normalize(token);
      return (
        String(r.id) === token ||
        normalize(r.codigo) === t ||
        normalize(r.serial_number) === t
      );
    },
    getRowId: (r) => r.id,
    highlightMs: 4000,
  });

  // Leer ?focus= de la URL, limpiar filtros y pedir foco
  useEffect(() => {
    const token = searchParams.get("focus");
    if (!token) return;

    const next = new URLSearchParams(searchParams);
    next.delete("focus");
    setSearchParams(next, { replace: true });

    // Limpiar filtros/búsqueda para asegurar que el activo se vea
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");

    focusByToken(token);
  }, [searchParams, setSearchParams, focusByToken]);

  // selección múltiple (ids visibles)
  const allVisibleIds = useMemo(
    () => (filtered || []).map((r) => r.id),
    [filtered]
  );

  const allSelectedInPage =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((idSite) => selectedIds.includes(idSite));

  const toggleSelectOne = (idActivo) => {
    setSelectedIds((prev) =>
      prev.includes(idActivo)
        ? prev.filter((x) => x !== idActivo)
        : [...prev, idActivo]
    );
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      if (allSelectedInPage) {
        // quitar todos los visibles
        return prev.filter((idActivo) => !allVisibleIds.includes(idActivo));
      }
      // agregar todos los visibles
      const set = new Set(prev);
      allVisibleIds.forEach((idActivo) => set.add(idActivo));
      return Array.from(set);
    });
  };

  // acciones individuales
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

  // cargar bodegas cuando abrimos el modal masivo
  useEffect(() => {
    if (!openBulkMover) return;
    setLoadingBodegas(true);
    getBodegas()
      .then((rows) => setBodegas(Array.isArray(rows) ? rows : []))
      .catch(() => {
        setBodegas([]);
        showToast("Error al cargar bodegas", "danger");
      })
      .finally(() => setLoadingBodegas(false));
  }, [openBulkMover, showToast]);

  async function bulkMoveToBodega() {
    if (!bulkBodega) {
      showToast("Selecciona una bodega destino.", "warning");
      return;
    }
    if (!selectedIds.length) {
      showToast("No hay activos seleccionados.", "warning");
      return;
    }
    if (!canMove) {
      showToast("No tienes permisos para mover activos.", "warning");
      return;
    }

    setBulkSaving(true);
    try {
      const usuario = userData?.id_usuario ?? userData?.id ?? null;

      await Promise.all(
        selectedIds.map((id_activo) =>
          moverABodega({
            id_activo,
            id_bodega: bulkBodega,
            motivo:
              bulkMotivo ||
              "Movimiento masivo desde cliente hacia bodega (salida)",
            usuario_responsable: usuario,
          })
        )
      );

      showToast("Activos movidos a bodega correctamente.", "success");
      setOpenBulkMover(false);
      setBulkBodega("");
      setBulkMotivo("");
      setSelectedIds([]);
      load();
    } catch (err) {
      showToast(
        err?.message || "Error al mover los activos seleccionados",
        "danger"
      );
    } finally {
      setBulkSaving(false);
    }
  }

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
      {/* HEADER NUEVO: título + totales arriba, filtros abajo */}
      <Stack spacing={1.5} mb={2}>
        <Box>
          <Typography level="h4">
            {clienteNombre || "Activos del Cliente"}
          </Typography>
          {clienteNombre && (
            <Typography level="body-sm" color="neutral">
              Inventario de activos asignados al cliente
            </Typography>
          )}
          <Typography level="body-xs" sx={{ opacity: 0.7, mt: 0.5 }}>
            Total activos: {rows.length}
            {rows.length !== filtered.length &&
              ` · Con filtros: ${filtered.length}`}
          </Typography>
        </Box>

        {/* Filtros / acciones */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.25}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Input
              placeholder="Buscar por código, nombre, modelo, serie o site…"
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
              onChange={(v) => setStatusFilter(v || "")}
              placeholder="Estatus"
              allowEmpty
              sx={{ width: 200 }}
            />

            {/* Filtro de tipo desde catálogo */}
            <CatalogSelect
              catalog="tiposActivo"
              value={typeFilter}
              onChange={(v) => setTypeFilter(v || "")}
              placeholder="Tipo"
              allowEmpty
              sx={{ width: 200 }}
            />
          </Stack>

          {/* Mover a bodega (masivo) */}
          {canMove && (
            <Tooltip
              title={
                hasSelection
                  ? "Mover activos seleccionados a bodega"
                  : "Selecciona uno o más activos"
              }
              variant="soft">
              <span>
                <Button
                  size="sm"
                  variant="soft"
                  startDecorator={<SwapHorizRoundedIcon />}
                  disabled={!hasSelection}
                  onClick={() => setOpenBulkMover(true)}
                  sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}>
                  Mover a Bodega
                </Button>
              </span>
            </Tooltip>
          )}
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
                ref={r.id === highlightId ? focusedRef : null}
                variant={r.id === highlightId ? "soft" : "outlined"}
                color={r.id === highlightId ? "primary" : "neutral"}
                sx={{
                  p: 2,
                  borderRadius: "md",
                  boxShadow: r.id === highlightId ? "lg" : "sm",
                  borderWidth: r.id === highlightId ? 2 : 1,
                  borderColor:
                    r.id === highlightId ? "primary.solidBg" : "divider",
                  transition:
                    "background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center">
                  <Typography level="title-md">{r.nombre}</Typography>
                  {canMove && (
                    <Checkbox
                      size="sm"
                      checked={selectedIds.includes(r.id)}
                      onChange={() => toggleSelectOne(r.id)}
                    />
                  )}
                </Stack>

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

                {/* Site del activo */}
                <Typography level="body-xs" sx={{ mt: 0.5 }}>
                  <strong>Site:</strong> {r.site_nombre || "—"}
                </Typography>

                <Chip
                  size="sm"
                  variant="soft"
                  color={ESTATUS_COLOR[r.estatus] || "neutral"}
                  sx={{ alignSelf: "flex-start", mt: 0.5 }}>
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
              </Sheet>
            ))}
          </Stack>
        ) : (
          // ====== Escritorio: tabla ======
          <Table size="sm" stickyHeader hoverRow sx={{ minWidth: 980 }}>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  {canMove && (
                    <Checkbox
                      checked={allSelectedInPage && filtered.length > 0}
                      indeterminate={
                        !allSelectedInPage &&
                        hasSelection &&
                        filtered.length > 0
                      }
                      onChange={toggleSelectAllVisible}
                    />
                  )}
                </th>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Modelo</th>
                <th>Serie</th>
                <th>Site</th>
                <th>Estatus</th>
                <th style={{ width: 200 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  ref={r.id === highlightId ? focusedRef : null}
                  style={
                    r.id === highlightId
                      ? {
                          backgroundColor: "rgba(59, 130, 246, 0.12)",
                          boxShadow: "0 0 0 2px rgba(37, 99, 235, 0.6) inset",
                          transition:
                            "background-color 0.25s ease, box-shadow 0.25s ease",
                        }
                      : undefined
                  }>
                  <td>
                    {canMove && (
                      <Checkbox
                        checked={selectedIds.includes(r.id)}
                        onChange={() => toggleSelectOne(r.id)}
                      />
                    )}
                  </td>
                  <td>{r.codigo}</td>
                  <td>{r.nombre}</td>
                  <td>{r.tipo}</td>
                  <td>{r.modelo || "—"}</td>
                  <td>{r.serial_number || "—"}</td>
                  <td>
                    {r.site_nombre ? (
                      <Chip size="sm" variant="soft" color="primary">
                        {r.site_nombre}
                      </Chip>
                    ) : (
                      "—"
                    )}
                  </td>
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

      {/* Modal Mover (individual) */}
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

      {/* Modal mover MASIVO a Bodega */}
      <Modal
        open={openBulkMover}
        onClose={() => {
          if (!bulkSaving) setOpenBulkMover(false);
        }}>
        <ModalDialog
          sx={{ width: { xs: "100%", sm: 520 } }}
          aria-labelledby="bulk-mover-title">
          <Typography id="bulk-mover-title" level="title-lg">
            Mover activos seleccionados a Bodega
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Stack spacing={1.5} mt={1}>
            <Typography level="body-sm">
              Activos seleccionados: {selectedIds.length}
            </Typography>

            <FormControl required>
              <FormLabel>Bodega destino</FormLabel>
              <Autocomplete
                placeholder="Escribe para buscar bodega…"
                options={bodegas}
                loading={loadingBodegas}
                value={bodegas.find((b) => b.id === bulkBodega) || null}
                onChange={(_, v) => setBulkBodega(v?.id || "")}
                getOptionLabel={(o) => o?.nombre || ""}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                disablePortal
                clearOnBlur={false}
                autoHighlight
                renderInput={(params) => <Input {...params} />}
                slotProps={{ listbox: { sx: { maxHeight: 280 } } }}
                disabled={bulkSaving}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Motivo</FormLabel>
              <Input
                value={bulkMotivo}
                onChange={(e) => setBulkMotivo(e.target.value)}
                disabled={bulkSaving}
                placeholder="(Opcional, ej: Cambio de equipo / salida del cliente)"
              />
            </FormControl>
          </Stack>

          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
            <Button
              variant="plain"
              onClick={() => setOpenBulkMover(false)}
              disabled={bulkSaving}>
              Cancelar
            </Button>
            <Button
              onClick={bulkMoveToBodega}
              loading={bulkSaving}
              disabled={bulkSaving || !selectedIds.length || !bulkBodega}>
              Mover a Bodega
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
