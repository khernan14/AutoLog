import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Table,
  Sheet,
  Modal,
  ModalDialog,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Divider,
  IconButton,
  Chip,
  Tooltip,
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

import {
  getActivosGlobal,
  createActivo,
  updateActivo,
} from "../../services/ActivosServices";
import { moverActivo } from "../../services/UbicacionesServices";
import { getClientes } from "../../services/ClientesServices";
import { getSitesByCliente } from "../../services/SitesServices";
import { getBodegas } from "../../services/BodegasServices";
import { getEmpleados } from "../../services/AuthServices";
import { getPublicLinkForActivo } from "../../services/PublicLinksService";

import HistorialActivoModal from "../Inventario/HistorialActivoModal";
import StyledQR from "../../components/QRCode/StyledQR";
import StatusCard from "../../components/common/StatusCard";
import useIsMobile from "../../hooks/useIsMobile";

import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import logoTecnasa from "../../assets/newLogoTecnasaBlack.png";

const ESTATUS = [
  "Activo",
  "Inactivo",
  "Arrendado",
  "En Mantenimiento",
  "Reciclado",
];
const TIPOS = [
  "Impresora",
  "ATM",
  "UPS",
  "Silla",
  "Mueble",
  "Laptop",
  "Desktop",
  "Mesa",
  "Audifonos",
  "Monitor",
  "Mochila",
  "Escritorio",
  "Celular",
  "Otro",
];

export default function ActivosList() {
  const isMobile = useIsMobile(768);
  const qrRef = useRef(null);
  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();
  const isAdmin = (userData?.rol || "").toLowerCase() === "admin";

  const can = useCallback(
    (p) => isAdmin || hasPermiso(p),
    [isAdmin, hasPermiso]
  );
  const canView = can("ver_activos");
  const canCreate = can("crear_activos");
  const canEdit = can("editar_activos");
  const canMove = can("mover_activos");
  const canViewHistory = can("ver_historial_activos");
  const canQR = can("crear_QR");

  // data
  const [rows, setRows] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sitesDestino, setSitesDestino] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [empleados, setEmpleados] = useState([]); // 👈 NUEVO

  // ui state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filtros
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [ubicacionFilter, setUbicacionFilter] = useState("");

  // modals
  const [openForm, setOpenForm] = useState(false);
  const [openMover, setOpenMover] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [openQR, setOpenQR] = useState(false);

  // form data
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    modelo: "",
    serial_number: "",
    tipo: "Otro",
    estatus: "Activo",
  });
  const [saving, setSaving] = useState(false);

  // mover
  const [savingMover, setSavingMover] = useState(false);
  const [activoSeleccionado, setActivoSeleccionado] = useState(null);
  const [tipoDestino, setTipoDestino] = useState("Cliente"); // Cliente | Bodega | Empleado
  const [clienteDestino, setClienteDestino] = useState("");
  const [siteDestino, setSiteDestino] = useState("");
  const [bodegaDestino, setBodegaDestino] = useState("");
  const [empleadoDestino, setEmpleadoDestino] = useState(""); // 👈 NUEVO
  const [motivo, setMotivo] = useState("");

  // QR
  const [activoQR, setActivoQR] = useState(null);
  const [publicLink, setPublicLink] = useState("");

  const loadActivos = useCallback(async () => {
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
      const [activos, clientesData, bodegasData] = await Promise.all([
        getActivosGlobal(),
        getClientes(),
        getBodegas(),
      ]);
      setClientes(Array.isArray(clientesData) ? clientesData : []);
      setBodegas(Array.isArray(bodegasData) ? bodegasData : []);
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
  }, [checkingSession, canView]);

  useEffect(() => {
    loadActivos();
  }, [loadActivos]);

  // Carga dinámica de sites según cliente
  useEffect(() => {
    if (tipoDestino === "Cliente" && clienteDestino) {
      getSitesByCliente(clienteDestino)
        .then((data) => setSitesDestino(Array.isArray(data) ? data : []))
        .catch(() => setSitesDestino([]));
    } else {
      setSitesDestino([]);
    }
  }, [tipoDestino, clienteDestino]);

  // Cargar empleados (solo cuando se abre el modal y se elige Empleado)
  useEffect(() => {
    if (openMover && tipoDestino === "Empleado") {
      getEmpleados()
        .then((rows) => setEmpleados(Array.isArray(rows) ? rows : []))
        .catch(() => setEmpleados([]));
    }
  }, [openMover, tipoDestino]);

  // ---- Acciones
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

  function newActivo() {
    if (!canCreate) {
      showToast("No tienes permisos para crear activos.", "warning");
      return;
    }
    setEditing(null);
    setForm({
      codigo: "",
      nombre: "",
      modelo: "",
      serial_number: "",
      tipo: "Otro",
      estatus: "Activo",
    });
    setOpenForm(true);
  }

  function editActivo(row) {
    if (!canEdit) {
      showToast("No tienes permisos para editar activos.", "warning");
      return;
    }
    setEditing(row);
    setForm({
      codigo: row.codigo,
      nombre: row.nombre,
      modelo: row.modelo || "",
      serial_number: row.serial_number || "",
      tipo: row.tipo || "Otro",
      estatus: row.estatus || "Activo",
    });
    setOpenForm(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.codigo.trim())
      return showToast("El código es requerido", "warning");
    if (!form.nombre.trim())
      return showToast("El nombre es requerido", "warning");

    setSaving(true);
    try {
      if (editing) {
        await updateActivo(editing.id, form);
        showToast("Activo actualizado correctamente", "success");
      } else {
        await createActivo(form);
        showToast("Activo creado correctamente", "success");
      }
      setOpenForm(false);
      loadActivos();
    } catch (err) {
      showToast(err?.message || "Error al guardar activo", "danger");
    } finally {
      setSaving(false);
    }
  }

  function abrirMover(row) {
    if (!canMove) {
      showToast("No tienes permisos para mover activos.", "warning");
      return;
    }
    setActivoSeleccionado(row);
    setTipoDestino("Cliente");
    setClienteDestino("");
    setSiteDestino("");
    setBodegaDestino("");
    setEmpleadoDestino(""); // 👈
    setMotivo("");
    setOpenMover(true);
  }

  async function onMover(e) {
    e.preventDefault();

    // Validación rápida en UI
    if (
      (tipoDestino === "Cliente" && (!clienteDestino || !siteDestino)) ||
      (tipoDestino === "Bodega" && !bodegaDestino) ||
      (tipoDestino === "Empleado" && !empleadoDestino)
    ) {
      showToast("Completa los campos requeridos para el destino", "warning");
      return;
    }

    setSavingMover(true);
    try {
      await moverActivo({
        id_activo: activoSeleccionado.id,
        tipo_destino: tipoDestino,
        id_cliente_site: tipoDestino === "Cliente" ? siteDestino : null,
        id_bodega: tipoDestino === "Bodega" ? bodegaDestino : null,
        id_empleado: tipoDestino === "Empleado" ? empleadoDestino : null, // 👈
        motivo,
        // Usa el mismo campo que espera tu backend (id_usuario)
        usuario_responsable: userData?.id_usuario ?? userData?.id ?? null,
      });
      showToast("Activo movido correctamente", "success");
      setOpenMover(false);
      loadActivos();
    } catch (err) {
      showToast(err?.message || "Error al mover activo", "danger");
    } finally {
      setSavingMover(false);
    }
  }

  function abrirHistorial(row) {
    if (!canViewHistory) {
      showToast("No tienes permisos para ver el historial.", "warning");
      return;
    }
    setActivoSeleccionado(row);
    setOpenHistorial(true);
  }

  // ---- Filtro
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
      const matchUbicacion =
        !ubicacionFilter ||
        (ubicacionFilter === "Cliente" && r.tipo_destino === "Cliente") ||
        (ubicacionFilter === "Bodega" && r.tipo_destino === "Bodega") ||
        (ubicacionFilter === "Empleado" && r.tipo_destino === "Empleado") ||
        (ubicacionFilter === "SinUbicacion" && !r.tipo_destino);

      return matchSearch && matchStatus && matchType && matchUbicacion;
    });
  }, [rows, search, statusFilter, typeFilter, ubicacionFilter]);

  // ---- View state
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
              onClick={loadActivos}
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
          description="Ajusta los filtros o crea un activo nuevo."
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

  // ---- UI
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
        {/* Header + filtros */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.5}
          mb={2}>
          <Typography level="h4">
            Inventario: Activos Globales ({rows.length})
          </Typography>

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

            <Select
              placeholder="Estatus"
              value={statusFilter}
              onChange={(_, v) => setStatusFilter(v || "")}
              sx={{ minWidth: 140 }}>
              <Option value="">Todos</Option>
              {ESTATUS.map((s) => (
                <Option key={s} value={s}>
                  {s}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Tipo"
              value={typeFilter}
              onChange={(_, v) => setTypeFilter(v || "")}
              sx={{ minWidth: 140 }}>
              <Option value="">Todos</Option>
              {TIPOS.map((t) => (
                <Option key={t} value={t}>
                  {t}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Ubicación"
              value={ubicacionFilter}
              onChange={(_, v) => setUbicacionFilter(v || "")}
              sx={{ minWidth: 180 }}>
              <Option value="">Todas</Option>
              <Option value="Cliente">Clientes</Option>
              <Option value="Bodega">Bodegas</Option>
              <Option value="Empleado">Empleados</Option> {/* 👈 NUEVO */}
              <Option value="SinUbicacion">Sin ubicación</Option>
            </Select>

            <Tooltip
              title={
                canCreate
                  ? "Crear activo"
                  : "No tienes permiso para crear. Solicítalo al administrador."
              }
              variant="solid"
              placement="bottom-end">
              <span>
                <Button
                  startDecorator={<AddRoundedIcon />}
                  onClick={newActivo}
                  disabled={!canCreate}
                  aria-disabled={!canCreate}
                  variant={canCreate ? "solid" : "soft"}
                  color={canCreate ? "primary" : "neutral"}>
                  Nuevo
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Contenedor principal */}
        <Card
          variant="plain"
          sx={{
            overflowX: "auto",
            width: "100%",
            background: "background.surface",
          }}>
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
                      color={
                        r.estatus === "Activo"
                          ? "success"
                          : r.estatus === "Arrendado"
                          ? "primary"
                          : r.estatus === "En Mantenimiento"
                          ? "warning"
                          : "neutral"
                      }
                      sx={{ alignSelf: "flex-start" }}>
                      {r.estatus}
                    </Chip>

                    <Typography level="body-xs" sx={{ mt: 0.5 }}>
                      <strong>Destino:</strong>{" "}
                      {r.tipo_destino === "Cliente"
                        ? `${r.cliente_nombre} / ${r.site_nombre || r.id}`
                        : r.tipo_destino === "Bodega"
                        ? r.bodega_nombre
                        : r.tipo_destino === "Empleado"
                        ? r.empleado_nombre || `Empleado #${r.id}`
                        : "—"}
                    </Typography>

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
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Modelo</th>
                  <th>Serie</th>
                  <th>Estatus</th>
                  <th>Destino</th>
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
                        color={
                          r.estatus === "Activo"
                            ? "success"
                            : r.estatus === "Arrendado"
                            ? "primary"
                            : r.estatus === "En Mantenimiento"
                            ? "warning"
                            : "neutral"
                        }>
                        {r.estatus}
                      </Chip>
                    </td>
                    <td>
                      {r.tipo_destino === "Cliente" ? (
                        <Tooltip
                          title={`${r.cliente_nombre} / ${r.site_nombre}`}>
                          <Chip size="sm" variant="outlined" color="primary">
                            {r.cliente_nombre}/{r.site_nombre || r.id}
                          </Chip>
                        </Tooltip>
                      ) : r.tipo_destino === "Bodega" ? (
                        <Chip size="sm" variant="outlined" color="neutral">
                          {r.bodega_nombre}
                        </Chip>
                      ) : r.tipo_destino === "Empleado" ? (
                        <Chip size="sm" variant="outlined" color="success">
                          {r.empleado_nombre || `Empleado #${r.id_empleado}`}
                        </Chip>
                      ) : (
                        "—"
                      )}
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

        {/* Modal Crear/Editar */}
        <Modal open={openForm} onClose={() => setOpenForm(false)}>
          <ModalDialog
            component="form"
            onSubmit={onSubmit}
            sx={{ width: { xs: "100%", sm: 520 } }}>
            <Typography level="title-lg">
              {editing ? "Editar Activo" : "Nuevo Activo"}
            </Typography>
            <Divider />
            <Stack spacing={1.5} mt={1}>
              <FormControl required>
                <FormLabel>Código</FormLabel>
                <Input
                  value={form.codigo}
                  onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                />
              </FormControl>
              <FormControl required>
                <FormLabel>Nombre</FormLabel>
                <Input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Modelo</FormLabel>
                <Input
                  value={form.modelo}
                  onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Serie</FormLabel>
                <Input
                  value={form.serial_number}
                  onChange={(e) =>
                    setForm({ ...form, serial_number: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>Tipo</FormLabel>
                <Select
                  value={form.tipo}
                  onChange={(_, v) => setForm({ ...form, tipo: v })}>
                  {TIPOS.map((t) => (
                    <Option key={t} value={t}>
                      {t}
                    </Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Estatus</FormLabel>
                <Select
                  value={form.estatus}
                  onChange={(_, v) => setForm({ ...form, estatus: v })}>
                  {ESTATUS.map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
              <Button variant="plain" onClick={() => setOpenForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" loading={saving}>
                Guardar
              </Button>
            </Stack>
          </ModalDialog>
        </Modal>

        {/* Modal Mover */}
        <Modal open={openMover} onClose={() => setOpenMover(false)}>
          <ModalDialog
            component="form"
            onSubmit={onMover}
            sx={{ width: { xs: "100%", sm: 520 } }}>
            <Typography level="title-lg">Mover Activo</Typography>
            <Divider />
            <Stack spacing={1.5} mt={1}>
              <FormControl required>
                <FormLabel>Tipo destino</FormLabel>
                <Select
                  value={tipoDestino}
                  onChange={(_, v) => setTipoDestino(v)}
                  required
                  disabled={savingMover}>
                  <Option value="Cliente">Cliente</Option>
                  <Option value="Bodega">Bodega</Option>
                  <Option value="Empleado">Empleado</Option> {/* 👈 NUEVO */}
                </Select>
              </FormControl>

              {tipoDestino === "Cliente" && (
                <>
                  <FormControl required>
                    <FormLabel>Cliente destino</FormLabel>
                    <Select
                      value={clienteDestino}
                      onChange={(_, v) => setClienteDestino(v)}
                      disabled={savingMover}>
                      <Option value="">—</Option>
                      {clientes.map((c) => (
                        <Option key={c.id} value={c.id}>
                          {c.nombre}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>

                  {clienteDestino && (
                    <FormControl required>
                      <FormLabel>Site destino</FormLabel>
                      <Select
                        value={siteDestino}
                        onChange={(_, v) => setSiteDestino(v)}
                        disabled={savingMover}>
                        <Option value="">—</Option>
                        {sitesDestino.map((s) => (
                          <Option key={s.id} value={s.id}>
                            {s.nombre}
                          </Option>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </>
              )}

              {tipoDestino === "Bodega" && (
                <FormControl required>
                  <FormLabel>Bodega destino</FormLabel>
                  <Select
                    value={bodegaDestino}
                    onChange={(_, v) => setBodegaDestino(v)}
                    disabled={savingMover}>
                    <Option value="">—</Option>
                    {bodegas.map((b) => (
                      <Option key={b.id} value={b.id}>
                        {b.nombre}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              )}

              {tipoDestino === "Empleado" && (
                <FormControl required>
                  <FormLabel>Empleado destino</FormLabel>
                  <Select
                    value={empleadoDestino}
                    onChange={(_, v) => setEmpleadoDestino(v)}
                    disabled={savingMover}>
                    <Option value="">—</Option>
                    {empleados.map((e) => (
                      <Option key={e.id} value={e.id}>
                        {e.nombre || e.usuario_nombre || `Empleado #${e.id}`}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
              )}

              <FormControl>
                <FormLabel>Motivo</FormLabel>
                <Input
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  disabled={savingMover}
                />
              </FormControl>
            </Stack>
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
              <Button
                variant="plain"
                onClick={() => setOpenMover(false)}
                disabled={savingMover}>
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={savingMover}
                disabled={
                  savingMover ||
                  (tipoDestino === "Cliente" &&
                    (!clienteDestino || !siteDestino)) ||
                  (tipoDestino === "Bodega" && !bodegaDestino) ||
                  (tipoDestino === "Empleado" && !empleadoDestino)
                }>
                Mover
              </Button>
            </Stack>
          </ModalDialog>
        </Modal>

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
      </Box>
    </Sheet>
  );
}
