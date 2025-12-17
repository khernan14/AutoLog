// src/pages/Inventario/ActivosList.jsx
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next"; // 👈 i18n

import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Table,
  Sheet,
  Input,
  IconButton,
  Tooltip,
  CircularProgress,
  Modal,
  ModalDialog,
  Divider,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Drawer,
  DialogTitle,
  ModalClose,
  DialogContent,
  FormControl,
  FormLabel,
  FormHelperText,
  Autocomplete,
  Checkbox,
  Chip,
  Select,
  Option,
} from "@mui/joy";

// Iconos
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import QrCodeRoundedIcon from "@mui/icons-material/QrCodeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearIcon from "@mui/icons-material/Clear";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import KeyboardRoundedIcon from "@mui/icons-material/KeyboardRounded";
import DevicesOtherRoundedIcon from "@mui/icons-material/DevicesOtherRounded"; // Icono empty
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";

// Services & Context
import { getActivosGlobal } from "../../services/ActivosServices";
import { getPublicLinkForActivo } from "../../services/PublicLinksService";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import useIsMobile from "../../hooks/useIsMobile";
import useRowFocusHighlight from "../../hooks/useRowFocusHighlight";
import logoTecnasa from "../../assets/newLogoTecnasaBlack.png";
import { ESTATUS_COLOR } from "../../constants/inventario";

// Componentes
import ActivoFormModal from "./ActivoFormModal"; // Usamos el modal unificado
import MoverActivoModal from "./MoverActivoModal";
import HistorialActivoModal from "./HistorialActivoModal";
import ModalImportarActivos from "./ModalImportarActivos";
import StyledQR from "../../components/QRCode/StyledQR";
import ExportDialog from "@/components/Exports/ExportDialog";
import StatusCard from "../../components/common/StatusCard";
import PaginationLite from "@/components/common/PaginationLite";
import { getViewState } from "@/utils/viewState";

// Normalizador
const normalize = (val) =>
  (val || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export default function ActivosList() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile(768);
  const qrRef = useRef(null);
  const searchInputRef = useRef(null);
  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();

  const isAdmin = userData?.rol?.toLowerCase() === "admin";
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

  // Data State
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);
  const [ubicacionFilter, setUbicacionFilter] = useState("");

  // Drawer Filtros (Draft)
  const [statusDraft, setStatusDraft] = useState([]);
  const [typeDraft, setTypeDraft] = useState([]);
  const [ubicacionDraft, setUbicacionDraft] = useState("");

  // Modals
  const [openForm, setOpenForm] = useState(false); // Unificado
  const [openMover, setOpenMover] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [openShortcuts, setOpenShortcuts] = useState(false);

  // Selection
  const [editing, setEditing] = useState(null);
  const [activoSeleccionado, setActivoSeleccionado] = useState(null);
  const [activoQR, setActivoQR] = useState(null);
  const [publicLink, setPublicLink] = useState("");

  // Pagination & Sort
  const [sortKey, setSortKey] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // --- Carga ---
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
      const msg = err?.message || t("common.unknown_error");
      setError(
        /failed to fetch|network/i.test(msg)
          ? t("common.network_error")
          : t("inventory.list.errors.load_failed")
      );
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canView, t]);

  useEffect(() => {
    loadActivos();
  }, [loadActivos]);

  // Reset page
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter, ubicacionFilter, rows.length, perPage]);

  // --- Filtrado ---
  const filtered = useMemo(() => {
    const s = normalize(search);
    return rows.filter((r) => {
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

  // --- Opciones Filtros ---
  const statusOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.estatus).filter(Boolean))),
    [rows]
  );
  const typeOptions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.tipo).filter(Boolean))),
    [rows]
  );

  // --- Ordenamiento ---
  function getDestinoText(r) {
    if (r.tipo_destino === "Cliente")
      return `${r.cliente_nombre || ""} / ${r.site_nombre || ""}`.trim();
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
      if (va.toString().toLowerCase() < vb.toString().toLowerCase())
        return sortDir === "asc" ? -1 : 1;
      if (va.toString().toLowerCase() > vb.toString().toLowerCase())
        return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // --- Paginación ---
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / perPage));
  const pageRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedRows.slice(start, start + perPage);
  }, [sortedRows, page, perPage]);

  // --- Highlight ---
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

  useEffect(() => {
    const token = searchParams.get("focus");
    if (!token) return;
    const next = new URLSearchParams(searchParams);
    next.delete("focus");
    setSearchParams(next, { replace: true });
    setSearch("");
    setStatusFilter([]);
    setTypeFilter([]);
    setUbicacionFilter("");
    focusByToken(token);
  }, [searchParams, setSearchParams, focusByToken]);

  // --- Acciones ---
  const onNew = () => {
    if (!canCreate) return showToast(t("common.no_permission"), "warning");
    setEditing(null); // Modo crear (global, sin bodega predefinida, pedirá bodega si es necesario o se asumirá 'sin ubicación' inicial si tu lógica lo permite,
    // PERO: Tu ActivoFormModal actual espera idBodega para crear.
    // Si quieres crear activos globales "sueltos", ActivoFormModal necesitaría ajuste,
    // O bien, obligar a seleccionar bodega. Asumiré que este botón es para crear EN BODEGA y pedirá bodega,
    // o que ActivoFormModal soporta creación global.
    // Ajuste rápido: Si ActivoFormModal requiere idBodega para crear, este botón debería abrir un modal previo o ActivoFormModal debería permitir seleccionar bodega.
    // Dado el código anterior, parece que se creaban "sueltos". Si no, habría que ajustar.
    // Usaré ActivoFormModal unificado. Si necesita idBodega, fallará.
    // *Corrección*: El ActivoFormModal unificado que te di asume creación en bodega si viene idBodega.
    // Si no, asume creación global (si tu backend lo soporta).
    setOpenForm(true);
  };

  const onEdit = (r) => {
    if (!canEdit) return showToast(t("common.no_permission"), "warning");
    setEditing(r);
    setOpenForm(true);
  };

  const abrirMover = (r) => {
    if (!canMove) return showToast(t("common.no_permission"), "warning");
    setActivoSeleccionado(r);
    setOpenMover(true);
  };

  const abrirHistorial = (r) => {
    if (!canViewHistory) return showToast(t("common.no_permission"), "warning");
    setActivoSeleccionado(r);
    setOpenHistorial(true);
  };

  const abrirQR = async (r) => {
    if (!canQR) return showToast(t("common.no_permission"), "warning");
    setActivoQR(r);
    setPublicLink("");
    try {
      const { url } = await getPublicLinkForActivo(r.id);
      setPublicLink(url);
    } catch (e) {
      showToast(e?.message || t("inventory.list.errors.qr_failed"), "danger");
      setPublicLink(
        `${window.location.origin}/public/activos/${encodeURIComponent(
          r.codigo
        )}`
      );
    } finally {
      setOpenQR(true);
    }
  };

  // --- Atajos ---
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      const isTyping =
        tag === "input" || tag === "textarea" || e.target.isContentEditable;
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      if (!isTyping && e.key === "/") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (ctrlOrMeta && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      if (isTyping) return;
      if (ctrlOrMeta && e.shiftKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        if (canCreate) onNew();
        return;
      }
      if (ctrlOrMeta && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setOpenExport(true);
        return;
      }
      if (ctrlOrMeta && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        setOpenImport(true);
        return;
      }
      if (ctrlOrMeta && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setStatusDraft(statusFilter);
        setTypeDraft(typeFilter);
        setUbicacionDraft(ubicacionFilter);
        setOpenFilters(true);
        return;
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [canCreate]);

  // View State
  const viewState = getViewState({
    checkingSession,
    canView,
    error,
    loading,
    hasData: sortedRows.length > 0,
  });

  const renderStatus = () => {
    if (viewState === "checking")
      return (
        <StatusCard
          icon={<HourglassEmptyRoundedIcon />}
          title={t("common.verifying_session")}
          description={<CircularProgress size="sm" />}
        />
      );
    if (viewState === "no-permission")
      return (
        <StatusCard
          color="danger"
          icon={<LockPersonRoundedIcon />}
          title={t("common.no_permission")}
          description={t("common.contact_admin")}
        />
      );
    if (viewState === "error")
      return (
        <StatusCard
          color="danger"
          icon={<ErrorOutlineRoundedIcon />}
          title={t("common.error_title")}
          description={error}
          actions={
            <Button
              startDecorator={<RestartAltRoundedIcon />}
              onClick={loadActivos}
              variant="soft">
              {t("common.retry")}
            </Button>
          }
        />
      );
    if (viewState === "empty" && !search)
      return (
        <StatusCard
          color="neutral"
          icon={<DevicesOtherRoundedIcon />}
          title={t("inventory.list.empty.title")}
          description={t("inventory.list.empty.no_data")}
        />
      );
    if (viewState === "loading")
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      );
    return null;
  };

  const activeFiltersCount =
    (statusFilter.length ? 1 : 0) +
    (typeFilter.length ? 1 : 0) +
    (ubicacionFilter ? 1 : 0);

  // Export Columns
  const EXPORT_COLS = [
    { label: t("inventory.list.columns.code"), key: "codigo" },
    { label: t("inventory.list.columns.name"), key: "nombre" },
    { label: t("inventory.list.columns.type"), key: "tipo" },
    {
      label: t("inventory.list.columns.model"),
      key: "modelo",
      get: (r) => r.modelo || "",
    },
    {
      label: t("inventory.list.columns.serial"),
      key: "serial_number",
      get: (r) => r.serial_number || "",
    },
    { label: t("inventory.list.columns.status"), key: "estatus" },
    {
      label: t("inventory.list.columns.destination"),
      key: "tipo_destino",
      get: getDestinoText,
    },
  ];
  const filenameBase = `activos_globales_${new Date()
    .toISOString()
    .slice(0, 10)}`;

  return (
    <Sheet
      variant="plain"
      sx={{
        flex: 1,
        width: "100%",
        pt: { xs: "calc(12px + var(--Header-height))", md: 3 },
        pb: 4,
        px: { xs: 2, md: 4 },
        minHeight: "100dvh",
        bgcolor: "background.body",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
      <Box sx={{ width: "100%", maxWidth: 1400 }}>
        {/* HEADER */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          mb={3}>
          <Box>
            <Typography level="h3" fontWeight="lg">
              {t("inventory.list.title")}
            </Typography>
            <Typography level="body-sm" color="neutral">
              {t("inventory.list.subtitle")}
            </Typography>
            <Typography level="body-xs" sx={{ mt: 0.5, opacity: 0.7 }}>
              {t("inventory.list.stats", {
                total: rows.length,
                filtered: filtered.length,
                context:
                  rows.length !== filtered.length ? "filtered" : undefined,
              })}
            </Typography>
          </Box>

          {/* TOOLBAR */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap">
            <Input
              placeholder={t("inventory.list.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startDecorator={<SearchRoundedIcon />}
              endDecorator={
                search && (
                  <IconButton
                    size="sm"
                    variant="plain"
                    onClick={() => setSearch("")}>
                    <ClearIcon />
                  </IconButton>
                )
              }
              sx={{ width: { xs: "100%", sm: 300 } }}
              slotProps={{ input: { ref: searchInputRef } }}
            />

            <Button
              variant={activeFiltersCount ? "soft" : "outlined"}
              color={activeFiltersCount ? "primary" : "neutral"}
              startDecorator={<FilterAltIcon />}
              onClick={() => {
                setStatusDraft(statusFilter);
                setTypeDraft(typeFilter);
                setUbicacionDraft(ubicacionFilter);
                setOpenFilters(true);
              }}>
              {t("common.actions.filters")}
              {activeFiltersCount > 0 && (
                <Chip size="sm" variant="solid" color="primary" sx={{ ml: 1 }}>
                  {activeFiltersCount}
                </Chip>
              )}
            </Button>

            {/* Acciones Dropdown */}
            <Dropdown>
              <MenuButton
                variant="outlined"
                color="neutral"
                endDecorator={<MoreVertRoundedIcon />}>
                {t("common.actions.options")}
              </MenuButton>
              <Menu placement="bottom-end">
                <MenuItem onClick={() => setOpenExport(true)}>
                  <DownloadRoundedIcon /> {t("common.actions.export")}
                </MenuItem>
                <MenuItem onClick={() => setOpenImport(true)}>
                  <UploadFileRoundedIcon /> {t("common.actions.import")}
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => setOpenShortcuts(true)}>
                  <KeyboardRoundedIcon /> {t("common.actions.shortcuts")}
                </MenuItem>
              </Menu>
            </Dropdown>

            {/* {canCreate && (
              <Button
                startDecorator={<AddRoundedIcon />}
                onClick={onNew}
                variant="solid"
                color="primary">
                {t("inventory.list.actions.new_asset")}
              </Button>
            )} */}
          </Stack>
        </Stack>

        {/* DATA TABLE */}
        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "lg",
            overflow: "hidden",
            bgcolor: "background.surface",
            height: "auto",
          }}>
          {filtered.length === 0 && (
            <Box sx={{ width: "100%", textAlign: "center", py: 8 }}>
              <Typography level="h4" color="neutral">
                🔍 {t("common.no_data_title")}
              </Typography>
              <Typography level="body-md">
                {t("common.no_data_desc")}
              </Typography>
              <Button
                variant="soft"
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearch("");
                }}>
                {t("common.clear_filters")}
              </Button>
            </Box>
          )}
          {viewState !== "data" && viewState !== "loading" ? (
            <Box p={4} display="flex" justifyContent="center">
              {renderStatus()}
            </Box>
          ) : (
            <>
              <Table
                stickyHeader
                hoverRow
                sx={{
                  "--TableCell-paddingX": "12px",
                  "--TableCell-paddingY": "8px",
                  "& thead th": {
                    bgcolor: "background.level1",
                    color: "text.tertiary",
                    fontWeight: "md",
                    textTransform: "uppercase",
                    fontSize: "xs",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  },
                  "& tbody td": {
                    borderBottom: "1px solid",
                    borderColor: "neutral.outlinedBorder",
                    fontSize: "sm",
                  },
                }}>
                <thead>
                  <tr>
                    <th style={{ width: 100 }}>
                      {t("inventory.list.columns.code")}
                    </th>
                    <th style={{ width: 180 }}>
                      {t("inventory.list.columns.name")}
                    </th>
                    <th style={{ width: 100 }}>
                      {t("inventory.list.columns.type")}
                    </th>
                    <th style={{ width: 120 }}>
                      {t("inventory.list.columns.model")}
                    </th>
                    <th style={{ width: 120 }}>
                      {t("inventory.list.columns.serial")}
                    </th>
                    <th style={{ width: 100 }}>
                      {t("inventory.list.columns.status")}
                    </th>
                    <th style={{ width: 180 }}>
                      {t("inventory.list.columns.destination")}
                    </th>
                    <th style={{ width: 140, textAlign: "right" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => {
                    const isHighlighted = r.id === highlightId;
                    return (
                      <tr
                        key={r.id}
                        ref={isHighlighted ? focusedRef : null}
                        style={
                          isHighlighted
                            ? {
                                backgroundColor:
                                  "var(--joy-palette-primary-50)",
                              }
                            : undefined
                        }>
                        <td>
                          <Typography fontFamily="monospace" fontSize="xs">
                            {r.codigo}
                          </Typography>
                        </td>
                        <td>
                          <Tooltip
                            title={r.nombre}
                            variant="soft"
                            placement="top-start">
                            <Typography
                              fontWeight="md"
                              noWrap
                              sx={{ maxWidth: 180 }}>
                              {r.nombre}
                            </Typography>
                          </Tooltip>
                        </td>
                        <td>
                          <Typography
                            level="body-xs"
                            noWrap
                            sx={{ maxWidth: 100 }}>
                            {r.tipo}
                          </Typography>
                        </td>
                        <td>
                          <Typography
                            level="body-sm"
                            noWrap
                            sx={{ maxWidth: 120 }}>
                            {r.modelo || "—"}
                          </Typography>
                        </td>
                        <td>
                          <Typography
                            level="body-sm"
                            noWrap
                            sx={{ maxWidth: 120 }}>
                            {r.serial_number || "—"}
                          </Typography>
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
                          <Tooltip title={getDestinoText(r)} variant="soft">
                            <Chip
                              size="sm"
                              variant="outlined"
                              color="neutral"
                              sx={{
                                maxWidth: 180,
                                justifyContent: "flex-start",
                              }}>
                              <Typography noWrap fontSize="xs">
                                {getDestinoText(r) || "—"}
                              </Typography>
                            </Chip>
                          </Tooltip>
                        </td>
                        <td>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end">
                            {canEdit && (
                              <Tooltip
                                title={t("common.actions.edit")}
                                variant="soft">
                                <IconButton size="sm" onClick={() => onEdit(r)}>
                                  <EditRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canMove && (
                              <Tooltip
                                title={t("common.actions.move")}
                                variant="soft">
                                <IconButton
                                  size="sm"
                                  onClick={() => abrirMover(r)}>
                                  <SwapHorizRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canViewHistory && (
                              <Tooltip
                                title={t("common.actions.history")}
                                variant="soft">
                                <IconButton
                                  size="sm"
                                  onClick={() => abrirHistorial(r)}>
                                  <HistoryRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canQR && (
                              <Tooltip
                                title={t("common.actions.qr")}
                                variant="soft">
                                <IconButton
                                  size="sm"
                                  onClick={() => abrirQR(r)}>
                                  <QrCodeRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              {/* Footer */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems="center"
                sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography level="body-xs" color="neutral">
                    {t("common.showing_results_range", {
                      start: (page - 1) * perPage + 1,
                      end: Math.min(page * perPage, sortedRows.length),
                      total: sortedRows.length,
                    })}
                  </Typography>
                  <Select
                    size="sm"
                    value={perPage}
                    onChange={(_, v) => {
                      setPerPage(Number(v));
                      setPage(1);
                    }}
                    sx={{ width: 80 }}>
                    <Option value={10}>10</Option>
                    <Option value={25}>25</Option>
                    <Option value={50}>50</Option>
                    <Option value={100}>100</Option>
                  </Select>
                </Stack>
                <PaginationLite
                  page={page}
                  count={totalPages}
                  onChange={setPage}
                />
              </Stack>
            </>
          )}
        </Sheet>

        {/* MODALES */}
        {openForm && (
          <ActivoFormModal
            open={openForm}
            onClose={() => setOpenForm(false)}
            editing={editing}
            onSaved={loadActivos}
          />
        )}
        {openMover && (
          <MoverActivoModal
            open={openMover}
            onClose={() => setOpenMover(false)}
            activo={activoSeleccionado}
            onSaved={loadActivos}
          />
        )}
        {openHistorial && (
          <HistorialActivoModal
            open={openHistorial}
            onClose={() => setOpenHistorial(false)}
            activo={activoSeleccionado}
          />
        )}
        {openImport && (
          <ModalImportarActivos
            open={openImport}
            onClose={() => setOpenImport(false)}
            onSaved={loadActivos}
          />
        )}

        {/* Export / Shortcuts / QR (Igual que antes) */}
        <ExportDialog
          open={openExport}
          onClose={() => setOpenExport(false)}
          rows={sortedRows}
          columns={EXPORT_COLS}
          defaultTitle={t("inventory.list.title")}
          defaultFilenameBase={filenameBase}
        />

        {/* Drawer Filtros */}
        <Drawer
          anchor="right"
          size="md"
          open={openFilters}
          onClose={() => setOpenFilters(false)}>
          <Sheet
            sx={{
              p: 3,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between">
              <Typography level="h4">
                {t("inventory.list.filters_title")}
              </Typography>
              <ModalClose onClick={() => setOpenFilters(false)} />
            </Stack>
            <Divider />
            <Stack spacing={2} flex={1}>
              <FormControl>
                <FormLabel>{t("inventory.list.filters.status")}</FormLabel>
                <Autocomplete
                  multiple
                  placeholder={t("inventory.list.filters.status")}
                  options={statusOptions}
                  value={statusDraft}
                  onChange={(_, v) => setStatusDraft(v)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t("inventory.list.filters.type")}</FormLabel>
                <Autocomplete
                  multiple
                  placeholder={t("inventory.list.filters.type")}
                  options={typeOptions}
                  value={typeDraft}
                  onChange={(_, v) => setTypeDraft(v)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t("inventory.list.filters.ubicacion")}</FormLabel>
                <Select
                  value={ubicacionDraft}
                  onChange={(_, v) => setUbicacionDraft(v || "")}>
                  <Option value="">Todas</Option>
                  <Option value="Cliente">Clientes</Option>
                  <Option value="Bodega">Bodegas</Option>
                  <Option value="Empleado">Empleados</Option>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => {
                  setStatusDraft([]);
                  setTypeDraft([]);
                  setUbicacionDraft("");
                  setStatusFilter([]);
                  setTypeFilter([]);
                  setUbicacionFilter("");
                  setOpenFilters(false);
                }}>
                {t("common.actions.clear")}
              </Button>
              <Button
                onClick={() => {
                  setStatusFilter(statusDraft);
                  setTypeFilter(typeDraft);
                  setUbicacionFilter(ubicacionDraft);
                  setOpenFilters(false);
                }}>
                {t("common.actions.apply")}
              </Button>
            </Stack>
          </Sheet>
        </Drawer>

        {/* Modal QR (Reutilizado) */}
        <Modal
          open={openQR}
          onClose={() => {
            setOpenQR(false);
            setPublicLink("");
          }}>
          <ModalDialog sx={{ width: 400, textAlign: "center" }}>
            <Typography level="title-lg">
              {t("clients.assets.qr_title")}
            </Typography>
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
              </Stack>
            )}
            <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
              <Button variant="plain" onClick={() => setOpenQR(false)}>
                {t("common.actions.close")}
              </Button>
              <Button
                onClick={() =>
                  qrRef.current?.download("png", `QR_${activoQR?.codigo}`)
                }>
                {t("common.actions.download_png")}
              </Button>
            </Stack>
          </ModalDialog>
        </Modal>
      </Box>
    </Sheet>
  );
}
