// src/pages/Inventario/ActivosList.jsx
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
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
  FormHelperText,
  Input,
  Select,
  Option,
  Divider,
  IconButton,
  Chip,
  Tooltip,
  Drawer,
  DialogTitle,
  DialogContent,
  ModalClose,
  Autocomplete,
} from "@mui/joy";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import QrCodeRoundedIcon from "@mui/icons-material/QrCodeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearIcon from "@mui/icons-material/Clear";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

// shadcn
import { Button as ShButton } from "@/components/ui/button";
import { ButtonGroup as ShButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// lucide
import { ChevronDown, Download, Keyboard } from "lucide-react";

import {
  getActivosGlobal,
  createActivo,
  updateActivo,
} from "../../services/ActivosServices";
import { getNextActivoCode } from "../../services/ActivosBodegaServices";
import { getPublicLinkForActivo } from "../../services/PublicLinksService";

import HistorialActivoModal from "../Inventario/HistorialActivoModal";
import MoverActivoModal from "../Inventario/MoverActivoModal";
import StyledQR from "../../components/QRCode/StyledQR";
import useIsMobile from "../../hooks/useIsMobile";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import logoTecnasa from "../../assets/newLogoTecnasaBlack.png";
import ExportDialog from "@/components/Exports/ExportDialog";

import ResourceState from "../../components/common/ResourceState";
import { getViewState } from "../../utils/viewState";
import PaginationLite from "@/components/common/PaginationLite";

import CatalogSelect from "@/components/forms/CatalogSelect";
import { ESTATUS_COLOR } from "@/constants/inventario";

import useRowFocusHighlight from "../../hooks/useRowFocusHighlight";

// columnas para exportar
const EXPORT_COLS = [
  { label: "Código", key: "codigo" },
  { label: "Nombre", key: "nombre" },
  { label: "Tipo", key: "tipo" },
  { label: "Modelo", key: "modelo", get: (r) => r.modelo || "" },
  { label: "Serie", key: "serial_number", get: (r) => r.serial_number || "" },
  { label: "Estatus", key: "estatus" },
  {
    label: "Destino",
    key: "tipo_destino",
    get: (r) => {
      if (r.tipo_destino === "Cliente")
        return `${r.cliente_nombre || ""} / ${r.site_nombre || ""}`.trim();
      if (r.tipo_destino === "Bodega") return r.bodega_nombre || "";
      if (r.tipo_destino === "Empleado") return r.empleado_nombre || "";
      return "—";
    },
  },
  {
    label: "Cliente",
    key: "cliente_nombre",
    get: (r) => r.cliente_nombre || "",
  },
  { label: "Site", key: "site_nombre", get: (r) => r.site_nombre || "" },
  { label: "Bodega", key: "bodega_nombre", get: (r) => r.bodega_nombre || "" },
  {
    label: "Empleado",
    key: "empleado_nombre",
    get: (r) => r.empleado_nombre || "",
  },
];

const filenameBase = `todos_los_activos_${new Date()
  .toISOString()
  .slice(0, 10)}`;

// Normalizador para ignorar mayúsculas/tildes
const normalize = (val) =>
  (val || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export default function ActivosList() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile(768);
  const qrRef = useRef(null);
  const searchInputRef = useRef(null);

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

  // ui state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filtros
  const [search, setSearch] = useState("");

  // Filtros aplicados
  const [statusFilter, setStatusFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);
  const [ubicacionFilter, setUbicacionFilter] = useState("");

  // Filtros en el Drawer (draft: no afectan la tabla hasta "Aplicar")
  const [statusDraft, setStatusDraft] = useState([]);
  const [typeDraft, setTypeDraft] = useState([]);
  const [ubicacionDraft, setUbicacionDraft] = useState("");

  // modals / drawers
  const [openForm, setOpenForm] = useState(false);
  const [openMover, setOpenMover] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [openShortcuts, setOpenShortcuts] = useState(false);

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

  // mover (sólo selección y open/close; la lógica vive en el modal reutilizable)
  const [activoSeleccionado, setActivoSeleccionado] = useState(null);

  // QR
  const [activoQR, setActivoQR] = useState(null);
  const [publicLink, setPublicLink] = useState("");

  // --- ORDEN & PAGINACIÓN ---
  const [sortKey, setSortKey] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // 🔹 Siguiente código (hint y para modal nuevo)
  const [nextCodigo, setNextCodigo] = useState("");
  const [loadingNext, setLoadingNext] = useState(false);

  const refreshNextCodigo = useCallback(async () => {
    try {
      setLoadingNext(true);
      const n = await getNextActivoCode();
      setNextCodigo(String(n || ""));
    } catch {
      setNextCodigo("");
    } finally {
      setLoadingNext(false);
    }
  }, []);

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
      const activos = await getActivosGlobal();
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
    refreshNextCodigo();
  }, [loadActivos, refreshNextCodigo]);

  // resetear página si cambian filtros / búsqueda / dataset
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter, ubicacionFilter, rows.length]);

  // ---- Helpers de orden/filtrado/paginación ----
  const filtered = useMemo(() => {
    const s = normalize(search);
    return (rows || []).filter((r) => {
      const matchSearch =
        normalize(r.codigo).includes(s) ||
        normalize(r.nombre).includes(s) ||
        normalize(r.modelo).includes(s) ||
        normalize(r.serial_number).includes(s);

      const matchStatus =
        statusFilter.length === 0 || statusFilter.includes(r.estatus);

      const matchType = typeFilter.length === 0 || typeFilter.includes(r.tipo);

      const matchUbicacion =
        !ubicacionFilter ||
        (ubicacionFilter === "Cliente" && r.tipo_destino === "Cliente") ||
        (ubicacionFilter === "Bodega" && r.tipo_destino === "Bodega") ||
        (ubicacionFilter === "Empleado" && r.tipo_destino === "Empleado") ||
        (ubicacionFilter === "SinUbicacion" && !r.tipo_destino);

      return matchSearch && matchStatus && matchType && matchUbicacion;
    });
  }, [rows, search, statusFilter, typeFilter, ubicacionFilter]);

  // Opciones disponibles según los datos cargados
  const statusOptions = useMemo(
    () =>
      Array.from(new Set((rows || []).map((r) => r.estatus).filter(Boolean))),
    [rows]
  );

  const typeOptions = useMemo(
    () => Array.from(new Set((rows || []).map((r) => r.tipo).filter(Boolean))),
    [rows]
  );

  function getDestinoText(r) {
    if (r.tipo_destino === "Cliente") {
      return `${r.cliente_nombre || ""} / ${r.site_nombre || ""}`.trim();
    }
    if (r.tipo_destino === "Bodega") return r.bodega_nombre || "";
    if (r.tipo_destino === "Empleado") return r.empleado_nombre || "";
    return "";
  }

  const sortedRows = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va =
        (sortKey === "_destino" ? getDestinoText(a) : a?.[sortKey]) ?? "";
      const vb =
        (sortKey === "_destino" ? getDestinoText(b) : b?.[sortKey]) ?? "";
      const A = va.toString().toLowerCase();
      const B = vb.toString().toLowerCase();
      if (A < B) return sortDir === "asc" ? -1 : 1;
      if (A > B) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / perPage));
  const pageRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedRows.slice(start, start + perPage);
  }, [sortedRows, page, perPage]);

  const { highlightId, focusedRef, focusByToken } = useRowFocusHighlight({
    rows: sortedRows,
    perPage,
    setPage,
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
    setUbicacionFilter("");

    focusByToken(token);
  }, [searchParams, setSearchParams, focusByToken]);

  function handleSort(key) {
    if (!key) return;
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

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

  async function newActivo() {
    if (!canCreate) {
      showToast("No tienes permisos para crear activos.", "warning");
      return;
    }
    let codigoAuto = "";
    try {
      setLoadingNext(true);
      codigoAuto = String(await getNextActivoCode());
    } catch {
      codigoAuto = "";
    } finally {
      setLoadingNext(false);
    }

    setEditing(null);
    setForm({
      codigo: codigoAuto,
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

    const codigoToSend = editing ? form.codigo : form.codigo || nextCodigo;

    if (!codigoToSend) {
      showToast(
        "No se pudo obtener el siguiente código automáticamente.",
        "danger"
      );
      return;
    }
    if (!form.nombre.trim())
      return showToast("El nombre es requerido", "warning");

    setSaving(true);
    try {
      if (editing) {
        await updateActivo(editing.id, { ...form, codigo: editing.codigo });
        showToast("Activo actualizado correctamente", "success");
      } else {
        await createActivo({ ...form, codigo: codigoToSend });
        showToast("Activo creado correctamente", "success");
      }
      setOpenForm(false);
      await loadActivos();
      refreshNextCodigo();
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

  // ---- Estado de vista unificado
  const viewState = getViewState({
    checkingSession,
    canView,
    error,
    loading,
    hasData: Array.isArray(sortedRows) && sortedRows.length > 0,
  });

  // 🔢 cantidad de filtros activos
  const activeFiltersCount =
    (statusFilter.length ? 1 : 0) +
    (typeFilter.length ? 1 : 0) +
    (ubicacionFilter ? 1 : 0);

  //Atajos de teclado globales
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isTyping =
        tag === "input" || tag === "textarea" || e.target.isContentEditable;

      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // "/" → buscar
      if (!isTyping && e.key === "/") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
        return;
      }

      // Ctrl/⌘ + Shift + F → buscar
      if (ctrlOrMeta && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
        return;
      }

      if (isTyping) return;

      // Ctrl/⌘ + Shift + E → exportar
      if (ctrlOrMeta && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setOpenExport(true);
        return;
      }

      // Ctrl/⌘ + Shift + L → filtros (Drawer Joy)
      // Dentro de handleGlobalKeyDown:
      if (ctrlOrMeta && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setOpenFilters((prev) => {
          const next = !prev;
          if (!prev) {
            // se va a abrir → sincronizar draft
            setStatusDraft(statusFilter);
            setTypeDraft(typeFilter);
            setUbicacionDraft(ubicacionFilter);
          }
          return next;
        });
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

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
          <Stack spacing={0.25}>
            <Typography level="h4">
              Inventario: Activos Globales ({sortedRows.length})
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            sx={{ width: { xs: "100%", sm: "auto" } }}>
            {/* 🔍 Buscador */}
            <Tooltip
              title="Buscar (/, Ctrl+Shift+F)"
              variant="soft"
              placement="bottom-start">
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
                slotProps={{
                  input: {
                    ref: searchInputRef,
                    onFocus: (e) => e.target.select(),
                  },
                }}
              />
            </Tooltip>

            {/* 🎯 Botón Filtros → Drawer Joy */}
            <Tooltip
              title="Filtros (Ctrl+Shift+L)"
              variant="soft"
              placement="bottom">
              <Button
                variant={activeFiltersCount ? "soft" : "outlined"}
                color={activeFiltersCount ? "primary" : "neutral"}
                startDecorator={<FilterAltIcon />}
                onClick={() => {
                  setStatusDraft(statusFilter);
                  setTypeDraft(typeFilter);
                  setUbicacionDraft(ubicacionFilter);
                  setOpenFilters(true);
                }}
                sx={{ borderRadius: "999px" }}>
                Filtros
                {activeFiltersCount > 0 && (
                  <Chip
                    size="sm"
                    variant="soft"
                    color="primary"
                    sx={{ ml: 0.75 }}>
                    {activeFiltersCount}
                  </Chip>
                )}
              </Button>
            </Tooltip>

            {/* 📤 Exportar + menú (shadcn) */}
            <ShButtonGroup className="items-center">
              <ShButton
                onClick={() => setOpenExport(true)}
                variant="ghost"
                className={`
                  h-9 rounded-r-none
                  bg-[var(--joy-palette-primary-solidBg)]
                  text-[var(--joy-palette-primary-solidColor)]
                  hover:bg-[var(--joy-palette-primary-solidHoverBg)]
                  active:bg-[var(--joy-palette-primary-solidActiveBg)]
                  border border-[var(--joy-palette-primary-solidBg)]
                  hover:text-[var(--joy-palette-primary-solidColor)]
                `}>
                <Download className="mr-1 h-4 w-4" />
                <span>Exportar</span>
              </ShButton>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ShButton
                    variant="outline"
                    size="icon"
                    className={`
                      h-9 w-9 rounded-l-none border-l-0
                      bg-[var(--joy-palette-primary-solidBg)]
                      text-[var(--joy-palette-primary-solidColor)]
                      hover:bg-[var(--joy-palette-primary-solidHoverBg)]
                      active:bg-[var(--joy-palette-primary-solidActiveBg)]
                      border border-[var(--joy-palette-primary-solidBg)]
                      hover:text-[var(--joy-palette-primary-solidColor)]
                    `}
                    aria-label="Más acciones">
                    <ChevronDown className="h-4 w-4" />
                  </ShButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setOpenExport(true)}>
                    <Download className="mr-2 h-4 w-4" />
                    <span className="flex-1 text-sm">Exportar</span>
                    <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                      Ctrl+Shift+E
                    </kbd>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => setOpenShortcuts(true)}>
                    <Keyboard className="mr-2 h-4 w-4" />
                    <span className="flex-1 text-sm">Atajos de teclado</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ShButtonGroup>
          </Stack>
        </Stack>

        <Card
          variant="outlined"
          sx={{
            overflowX: "auto",
            width: "100%",
            background: "background.surface",
          }}>
          {/* Estado de recurso reutilizable */}
          {viewState !== "data" ? (
            <Box p={2}>
              <ResourceState
                state={viewState}
                error={error}
                onRetry={loadActivos}
                emptyTitle="Sin activos"
                emptyDescription="Ajusta los filtros o crea un activo nuevo."
              />
            </Box>
          ) : isMobile ? (
            // ====== Móvil: tarjetas ======
            <Stack spacing={2} p={2}>
              {pageRows.map((r) => (
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
                      { label: "Destino", key: "_destino" },
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
                  {pageRows.map((r) => (
                    <tr
                      key={r.id}
                      ref={r.id === highlightId ? focusedRef : null}
                      style={
                        r.id === highlightId
                          ? {
                              backgroundColor: "rgba(59, 130, 246, 0.12)",
                              boxShadow:
                                "0 0 0 2px rgba(37, 99, 235, 0.6) inset",
                              transition:
                                "background-color 0.25s ease, box-shadow 0.25s ease",
                            }
                          : undefined
                      }>
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
                        <Tooltip title={getDestinoText(r) || "—"}>
                          <Chip
                            size="sm"
                            variant="outlined"
                            color={
                              r.tipo_destino === "Cliente"
                                ? "primary"
                                : r.tipo_destino === "Bodega"
                                ? "neutral"
                                : r.tipo_destino === "Empleado"
                                ? "success"
                                : "neutral"
                            }>
                            {r.tipo_destino || "—"}
                          </Chip>
                        </Tooltip>
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

              {/* Footer de paginación */}
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
              {/* Código como Chip (no editable). En "Nuevo" se asigna automático */}
              <FormControl>
                <FormLabel>
                  Código{" "}
                  <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                    {editing ? "(no editable)" : "(asignado automáticamente)"}
                  </Typography>
                </FormLabel>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="sm" variant="soft" color="success">
                    {editing
                      ? form.codigo || "—"
                      : form.codigo ||
                        (loadingNext ? "cargando…" : nextCodigo) ||
                        "—"}
                  </Chip>
                  {!editing && (
                    <Button
                      size="sm"
                      variant="plain"
                      onClick={refreshNextCodigo}
                      disabled={loadingNext}>
                      Recalcular
                    </Button>
                  )}
                </Stack>
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

              {/* 🔹 Catálogo: Tipo */}
              <FormControl>
                <FormLabel>Tipo</FormLabel>
                <CatalogSelect
                  catalog="tiposActivo"
                  value={form.tipo}
                  onChange={(v) => setForm({ ...form, tipo: v })}
                />
              </FormControl>

              {/* 🔹 Catálogo: Estatus */}
              <FormControl>
                <FormLabel>Estatus</FormLabel>
                <CatalogSelect
                  catalog="estatusActivo"
                  value={form.estatus}
                  onChange={(v) => setForm({ ...form, estatus: v })}
                />
                <Stack direction="row" spacing={1} mt={0.5} alignItems="center">
                  <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                    Estado actual:
                  </Typography>
                  <Chip
                    size="sm"
                    variant="soft"
                    color={ESTATUS_COLOR[form.estatus] || "neutral"}>
                    {form.estatus}
                  </Chip>
                </Stack>
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

        {/* Modal Mover (reutilizable con Autocomplete) */}
        <MoverActivoModal
          open={openMover}
          onClose={() => setOpenMover(false)}
          activo={activoSeleccionado}
          onSaved={() => {
            setOpenMover(false);
            loadActivos();
          }}
          defaultTipo="Cliente"
          defaultClienteId={Number(id)}
        />

        {/* Drawer Joy para Filtros */}
        <Drawer
          anchor="right"
          size="md"
          variant="plain"
          open={openFilters}
          onClose={() => setOpenFilters(false)}
          slotProps={{
            content: {
              sx: {
                bgcolor: "transparent",
                p: { md: 3, sm: 0 },
                boxShadow: "none",
              },
            },
          }}>
          <Sheet
            sx={{
              borderRadius: "md",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: "100%",
              overflow: "auto",
            }}>
            <DialogTitle>Filtros</DialogTitle>
            <ModalClose />

            <DialogContent sx={{ gap: 2 }}>
              <Typography level="body-sm" sx={{ opacity: 0.8 }}>
                Refina la lista de activos por estatus, tipo y ubicación.
              </Typography>

              {/* Estatus (multi) */}
              <FormControl>
                <FormLabel>Estatus</FormLabel>
                <Autocomplete
                  multiple
                  placeholder="Todos"
                  options={statusOptions}
                  value={statusDraft}
                  onChange={(_, newValue) => setStatusDraft(newValue)}
                  sx={{ mt: 0.5 }}
                />
                <FormHelperText>
                  Puedes seleccionar uno o varios estatus.
                </FormHelperText>
              </FormControl>

              {/* Tipo (multi) */}
              <FormControl>
                <FormLabel>Tipo</FormLabel>
                <Autocomplete
                  multiple
                  placeholder="Todos"
                  options={typeOptions}
                  value={typeDraft}
                  onChange={(_, newValue) => setTypeDraft(newValue)}
                  sx={{ mt: 0.5 }}
                />
                <FormHelperText>
                  También puedes combinar varios tipos.
                </FormHelperText>
              </FormControl>

              {/* Ubicación (single) */}
              <FormControl>
                <FormLabel>Ubicación</FormLabel>
                <Select
                  placeholder="Todas"
                  value={ubicacionDraft}
                  onChange={(_, v) => setUbicacionDraft(v || "")}
                  sx={{ mt: 0.5 }}>
                  <Option value="">Todas</Option>
                  <Option value="Cliente">Clientes</Option>
                  <Option value="Bodega">Bodegas</Option>
                  <Option value="Empleado">Empleados</Option>
                  <Option value="SinUbicacion">Sin ubicación</Option>
                </Select>
                <FormHelperText>
                  Estos filtros se aplican al confirmar abajo.
                </FormHelperText>
              </FormControl>
            </DialogContent>

            <Divider sx={{ mt: "auto" }} />

            <Stack
              direction="row"
              spacing={1}
              sx={{ justifyContent: "space-between", mt: 1 }}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => {
                  // limpiar drafts
                  setStatusDraft([]);
                  setTypeDraft([]);
                  setUbicacionDraft("");
                  // limpiar aplicados
                  setStatusFilter([]);
                  setTypeFilter([]);
                  setUbicacionFilter("");
                }}>
                Limpiar filtros
              </Button>
              <Button
                onClick={() => {
                  // aplicar
                  setStatusFilter(statusDraft);
                  setTypeFilter(typeDraft);
                  setUbicacionFilter(ubicacionDraft);
                  setOpenFilters(false);
                }}>
                Aplicar
              </Button>
            </Stack>
          </Sheet>
        </Drawer>

        {/* Modal Atajos de teclado */}
        <Modal open={openShortcuts} onClose={() => setOpenShortcuts(false)}>
          <ModalDialog sx={{ width: { xs: "100%", sm: 420 } }}>
            <Typography level="title-lg">Atajos de teclado</Typography>
            <Divider sx={{ my: 1 }} />

            <Stack spacing={1.25} mt={1}>
              <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                Estos atajos funcionan principalmente en escritorio.
              </Typography>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center">
                <Typography level="body-sm">Focar buscador</Typography>
                <Typography level="body-sm" sx={{ fontFamily: "monospace" }}>
                  /
                </Typography>
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center">
                <Typography level="body-sm">Focar buscador</Typography>
                <Typography level="body-sm" sx={{ fontFamily: "monospace" }}>
                  Ctrl+Shift+F
                </Typography>
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center">
                <Typography level="body-sm">Abrir exportar</Typography>
                <Typography level="body-sm" sx={{ fontFamily: "monospace" }}>
                  Ctrl+Shift+E
                </Typography>
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center">
                <Typography level="body-sm">Abrir filtros</Typography>
                <Typography level="body-sm" sx={{ fontFamily: "monospace" }}>
                  Ctrl+Shift+L
                </Typography>
              </Stack>
            </Stack>

            <Stack direction="row" justifyContent="flex-end" mt={2}>
              <Button variant="plain" onClick={() => setOpenShortcuts(false)}>
                Cerrar
              </Button>
            </Stack>
          </ModalDialog>
        </Modal>

        {/* Export */}
        <ExportDialog
          open={openExport}
          onClose={() => setOpenExport(false)}
          rows={sortedRows}
          columns={EXPORT_COLS}
          defaultTitle={`Activos`}
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
