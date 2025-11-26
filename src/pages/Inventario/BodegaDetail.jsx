// src/pages/Inventario/BodegaDetail.jsx
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Stack,
  Table,
  Sheet,
  Button as JButton,
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
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

// shadcn
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// lucide
import {
  ChevronDown,
  Download,
  Upload,
  Keyboard,
  Plus,
  CircleFadingPlus,
} from "lucide-react";

import { getBodegaById } from "../../services/BodegasServices";
import { getActivosByBodega } from "../../services/ActivosBodegaServices";

import NuevoActivoEnBodegaModal from "./NuevoActivoEnBodegaModal";
import ActivoFormModal from "./ActivoFormModal";
import MoverActivoModal from "./MoverActivoModal";
import HistorialActivoModal from "./HistorialActivoModal";
import StyledQR from "../../components/QRCode/StyledQR";
import ModalImportarActivos from "./ModalImportarActivos";

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

// ⭐ Hook de highlight / scroll a fila
import useRowFocusHighlight from "../../hooks/useRowFocusHighlight";

// Normalizador para ignorar mayúsculas/tildes
const normalize = (val) =>
  (val || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export default function BodegaDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);
  const qrRef = useRef();
  const searchInputRef = useRef(null);

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

  const [openImport, setOpenImport] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [openShortcuts, setOpenShortcuts] = useState(false);

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
    const s = normalize(search);
    return (activos || []).filter((a) => {
      return (
        normalize(a.codigo).includes(s) ||
        normalize(a.nombre).includes(s) ||
        normalize(a.tipo).includes(s) ||
        normalize(a.modelo).includes(s) ||
        normalize(a.serial_number).includes(s)
      );
    });
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

  // ⭐ Hook de foco / highlight (usa el hook genérico de filas)
  const { highlightId, focusedRef, focusByToken } = useRowFocusHighlight({
    rows: sortedRows,
    perPage,
    setPage,
    matchRow: (a, token) => {
      const t = normalize(token);
      return (
        String(a.id) === token ||
        normalize(a.codigo) === t ||
        normalize(a.serial_number) === t
      );
    },
    getRowId: (a) => a.id,
    highlightMs: 4000,
  });

  // Leer ?focus= de la URL, limpiar búsqueda y pedir foco
  useEffect(() => {
    const token = searchParams.get("focus");
    if (!token) return;

    const next = new URLSearchParams(searchParams);
    next.delete("focus");
    setSearchParams(next, { replace: true });

    // Limpiamos búsqueda para asegurar que el activo sea visible
    setSearch("");

    focusByToken(token);
  }, [searchParams, setSearchParams, focusByToken]);

  // ---- Estado de vista unificado ----
  const viewState = getViewState({
    checkingSession,
    canView: canViewDetail,
    error,
    loading,
    hasData: sortedRows.length > 0,
  });

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isTyping =
        tag === "input" || tag === "textarea" || e.target.isContentEditable;

      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // "/" → búsqueda (si no está escribiendo ya)
      if (!isTyping && e.key === "/") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
        return;
      }

      // Ctrl/⌘ + Shift + F → foco en búsqueda
      if (ctrlOrMeta && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
        return;
      }

      // Si está escribiendo, no seguimos con más atajos
      if (isTyping) return;

      // Ctrl/⌘ + Shift + N → Nuevo activo
      if (ctrlOrMeta && e.shiftKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        if (canCreateAsset) onNew();
        return;
      }

      // Ctrl/⌘ + Shift + E → Exportar
      if (ctrlOrMeta && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setOpenExport(true);
        return;
      }

      // Ctrl/⌘ + Shift + I → Importar
      if (ctrlOrMeta && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setOpenImport(true);
        return;
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [canCreateAsset, onNew]);

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
            {/* Botón de regresar + título */}
            <JButton
              component={Link}
              to="/admin/inventario/bodegas"
              variant="plain"
              size="sm"
              startDecorator={<ArrowBackRoundedIcon />}
              sx={{
                alignSelf: { xs: "stretch", sm: "auto" },
                justifyContent: { xs: "flex-start", sm: "center" },
              }}>
              Volver
            </JButton>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 0.5 }}>
              <Typography level="h4">{bodega?.nombre || "—"}</Typography>
            </Stack>

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
            <Tooltip
              title="Buscar por código, nombre, tipo, modelo o serie…"
              variant="soft"
              placement="bottom-start">
              <Input
                placeholder="/, Ctrl+Shift+F"
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
                slotProps={{
                  input: {
                    ref: searchInputRef,
                    onFocus: (e) => e.target.select(),
                  },
                }}
              />
            </Tooltip>

            <ButtonGroup className="items-center">
              <Tooltip
                title={
                  canCreateAsset
                    ? "Nuevo Activo (Ctrl+Shift+N)"
                    : "No tienes permiso para crear. Solicítalo al administrador."
                }
                variant="solid"
                placement="bottom-end">
                <span>
                  <Button
                    onClick={onNew}
                    disabled={!canCreateAsset}
                    className={`
                      h-9 rounded-r-none
                      bg-[var(--joy-palette-primary-solidBg)]
                      text-[var(--joy-palette-primary-solidColor)]
                      hover:bg-[var(--joy-palette-primary-solidHoverBg)]
                      active:bg-[var(--joy-palette-primary-solidActiveBg)]
                      border border-[var(--joy-palette-primary-solidBg)]
                      hover:text-[var(--joy-palette-primary-solidColor)]
                    `}
                    variant="outline">
                    <CircleFadingPlus className="mr-1 h-4 w-4" />
                    <span>Nuevo</span>
                  </Button>
                </span>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`
                      h-9 rounded-l-none border-l-0
                      bg-[var(--joy-palette-primary-solidBg)]
                      text-[var(--joy-palette-primary-solidColor)]
                      hover:bg-[var(--joy-palette-primary-solidHoverBg)]
                      active:bg-[var(--joy-palette-primary-solidActiveBg)]
                      border border-[var(--joy-palette-primary-solidBg)]
                      hover:text-[var(--joy-palette-primary-solidColor)]
                    `}
                    aria-label="Más acciones">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setOpenExport(true)}>
                    <Download className="mr-2 h-4 w-4" />
                    <span className="flex-1 text-sm">Exportar</span>
                    <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                      Ctrl+Shift+E
                    </kbd>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => setOpenImport(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    <span className="flex-1 text-sm">Importar</span>
                    <kbd className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                      Ctrl+Shift+I
                    </kbd>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => setOpenShortcuts(true)}>
                    <Keyboard className="mr-2 h-4 w-4" />
                    <span className="flex-1 text-sm">Atajos de teclado</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ButtonGroup>
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
                  ref={a.id === highlightId ? focusedRef : null}
                  variant={a.id === highlightId ? "soft" : "outlined"}
                  color={a.id === highlightId ? "primary" : "neutral"}
                  sx={{
                    p: 2,
                    borderRadius: "md",
                    boxShadow: a.id === highlightId ? "lg" : "sm",
                    borderWidth: a.id === highlightId ? 2 : 1,
                    borderColor:
                      a.id === highlightId ? "primary.solidBg" : "divider",
                    transition:
                      "background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                  }}>
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
                      }
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
                    <tr
                      key={a.id}
                      ref={a.id === highlightId ? focusedRef : null}
                      style={
                        a.id === highlightId
                          ? {
                              backgroundColor: "rgba(59, 130, 246, 0.12)",
                              boxShadow:
                                "0 0 0 2px rgba(37, 99, 235, 0.6) inset",
                              transition:
                                "background-color 0.25s ease, box-shadow 0.25s ease",
                            }
                          : undefined
                      }>
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
                <Button
                  className={`
                  bg-[var(--joy-palette-primary-solidBg)]
                  text-[var(--joy-palette-primary-solidColor)]
                  hover:bg-[var(--joy-palette-primary-solidHoverBg)]
                  active:bg-[var(--joy-palette-primary-solidActiveBg)]
                  border border-[var(--joy-palette-primary-solidBg)]
                  hover:text-[var(--joy-palette-primary-solidColor)]
                `}
                  onClick={descargarPNG}>
                  Descargar PNG
                </Button>
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

        {openImport && (
          <ModalImportarActivos
            open={openImport}
            onClose={() => setOpenImport(false)}
            idBodega={id}
            onSaved={load}
          />
        )}

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
                <Typography level="body-sm">Nuevo activo</Typography>
                <Typography level="body-sm" sx={{ fontFamily: "monospace" }}>
                  Ctrl+Shift+N
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
                <Typography level="body-sm">Abrir importar</Typography>
                <Typography level="body-sm" sx={{ fontFamily: "monospace" }}>
                  Ctrl+Shift+I
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
      </Box>
    </Sheet>
  );
}
