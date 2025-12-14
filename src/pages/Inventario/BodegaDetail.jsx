// src/pages/Inventario/BodegaDetail.jsx
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  Link,
} from "react-router-dom";
import { useTranslation } from "react-i18next"; // 👈 i18n

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
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Checkbox,
} from "@mui/joy";

// Iconos
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import QrCodeRoundedIcon from "@mui/icons-material/QrCodeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import KeyboardRoundedIcon from "@mui/icons-material/KeyboardRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import DevicesOtherRoundedIcon from "@mui/icons-material/DevicesOtherRounded"; // Icono empty state
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";

// Services & Context
import { getBodegaById } from "../../services/BodegasServices";
import { getActivosByBodega } from "../../services/ActivosBodegaServices";
import { getPublicLinkForActivo } from "../../services/PublicLinksService";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import useIsMobile from "../../hooks/useIsMobile";
import useRowFocusHighlight from "../../hooks/useRowFocusHighlight";
import logoTecnasa from "../../assets/newLogoTecnasaBlack.png";
import { ESTATUS_COLOR } from "../../constants/inventario";

// Componentes
import NuevoActivoEnBodegaModal from "./NuevoActivoEnBodegaModal";
import ActivoFormModal from "./ActivoFormModal";
import MoverActivoModal from "./MoverActivoModal";
import HistorialActivoModal from "./HistorialActivoModal";
import StyledQR from "../../components/QRCode/StyledQR";
import ModalImportarActivos from "./ModalImportarActivos";
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

export default function BodegaDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile(768);
  const qrRef = useRef();
  const searchInputRef = useRef(null);
  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();

  // --- Permisos ---
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

  // --- Estado ---
  const [bodega, setBodega] = useState(null);
  const [activos, setActivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  // Modales
  const [openNuevo, setOpenNuevo] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openMover, setOpenMover] = useState(false);
  const [openHist, setOpenHist] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [openExport, setOpenExport] = useState(false);
  const [openShortcuts, setOpenShortcuts] = useState(false);

  // Selección individual
  const [activoQR, setActivoQR] = useState(null);
  const [publicLink, setPublicLink] = useState("");
  const [activoSeleccionado, setActivoSeleccionado] = useState(null);

  // Paginación y Orden
  const [sortKey, setSortKey] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // --- Carga ---
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
      const msg = err?.message || t("common.unknown_error");
      setError(
        /failed to fetch|network/i.test(msg)
          ? t("common.network_error")
          : t("inventory.warehouse.errors.load_failed")
      );
    } finally {
      setLoading(false);
    }
  }, [id, checkingSession, canViewDetail, t]);

  useEffect(() => {
    load();
  }, [load]);

  // --- Filtrado y Orden ---
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

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / perPage));
  const pageRows = useMemo(() => {
    const start = (page - 1) * perPage;
    return sortedRows.slice(start, start + perPage);
  }, [sortedRows, page, perPage]);

  // Reset página al filtrar
  useEffect(() => {
    setPage(1);
  }, [search, activos.length, perPage]);

  // --- Highlight ---
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

  useEffect(() => {
    const token = searchParams.get("focus");
    if (!token) return;
    const next = new URLSearchParams(searchParams);
    next.delete("focus");
    setSearchParams(next, { replace: true });
    setSearch("");
    focusByToken(token);
  }, [searchParams, setSearchParams, focusByToken]);

  // --- Acciones ---
  const onNew = () => {
    if (!canCreateAsset) return showToast(t("common.no_permission"), "warning");
    setActivoSeleccionado(null);
    setOpenNuevo(true);
  };

  const onEdit = (a) => {
    if (!canEditAsset) return showToast(t("common.no_permission"), "warning");
    setActivoSeleccionado(a);
    setOpenEdit(true);
  };

  const onMove = (a) => {
    if (!canMoveAsset) return showToast(t("common.no_permission"), "warning");
    setActivoSeleccionado(a);
    setOpenMover(true);
  };

  const onHist = (a) => {
    if (!canViewHistory) return showToast(t("common.no_permission"), "warning");
    setActivoSeleccionado(a);
    setOpenHist(true);
  };

  const abrirQR = async (a) => {
    if (!canGenerateQR) return showToast(t("common.no_permission"), "warning");
    setActivoQR(a);
    setPublicLink("");
    try {
      const { url } = await getPublicLinkForActivo(a.id);
      setPublicLink(url);
    } catch (e) {
      showToast(
        e?.message || t("inventory.warehouse.errors.qr_failed"),
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

  // --- Atajos de Teclado ---
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
        if (canCreateAsset) onNew();
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
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [canCreateAsset]);

  // --- Render Status ---
  const viewState = getViewState({
    checkingSession,
    canView: canViewDetail,
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
              onClick={load}
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
          title={t("inventory.warehouse.empty.title")}
          description={t("inventory.warehouse.empty.no_data")}
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

  // Export Columns
  const EXPORT_COLS = [
    { label: t("inventory.warehouse.columns.code"), key: "codigo" },
    { label: t("inventory.warehouse.columns.name"), key: "nombre" },
    { label: t("inventory.warehouse.columns.type"), key: "tipo" },
    {
      label: t("inventory.warehouse.columns.model"),
      key: "modelo",
      get: (r) => r.modelo || "",
    },
    {
      label: t("inventory.warehouse.columns.serial"),
      key: "serial_number",
      get: (r) => r.serial_number || "",
    },
    { label: t("inventory.warehouse.columns.status"), key: "estatus" },
  ];
  const filenameBase = `activos_bodega_${new Date()
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
            <Button
              component={Link}
              to="/admin/inventario/bodegas"
              variant="plain"
              size="sm"
              startDecorator={<ArrowBackRoundedIcon />}
              sx={{ mb: 1, ml: -1 }}>
              {t("common.actions.back_to_list")}
            </Button>
            <Typography level="h3" fontWeight="lg">
              {bodega?.nombre || "—"}
            </Typography>
            <Typography level="body-sm" color="neutral">
              {bodega?.descripcion}
            </Typography>
            <Typography level="body-xs" sx={{ mt: 0.5, opacity: 0.7 }}>
              {t("inventory.warehouse.stats", { total: sortedRows.length })}
            </Typography>
          </Box>

          {/* TOOLBAR */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap">
            <Input
              placeholder={t("inventory.warehouse.search_placeholder")}
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

            {canCreateAsset && (
              <Button
                startDecorator={<AddRoundedIcon />}
                onClick={onNew}
                variant="solid"
                color="primary">
                {t("inventory.warehouse.actions.new_asset")}
              </Button>
            )}
          </Stack>
        </Stack>

        {/* DATA TABLE */}
        <Sheet
          variant="outlined"
          sx={{
            borderRadius: "lg",
            overflow: "hidden",
            bgcolor: "background.surface",
            minHeight: "auto",
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
                      {t("inventory.warehouse.columns.code")}
                    </th>
                    <th style={{ width: 200 }}>
                      {t("inventory.warehouse.columns.name")}
                    </th>
                    <th style={{ width: 100 }}>
                      {t("inventory.warehouse.columns.type")}
                    </th>
                    <th style={{ width: 120 }}>
                      {t("inventory.warehouse.columns.model")}
                    </th>
                    <th style={{ width: 120 }}>
                      {t("inventory.warehouse.columns.serial")}
                    </th>
                    <th style={{ width: 120 }}>
                      {t("inventory.warehouse.columns.status")}
                    </th>
                    <th style={{ width: 160, textAlign: "right" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((a) => {
                    const isHighlighted = a.id === highlightId;
                    return (
                      <tr
                        key={a.id}
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
                            {a.codigo}
                          </Typography>
                        </td>
                        <td>
                          <Tooltip
                            title={a.nombre}
                            variant="soft"
                            placement="top-start">
                            <Typography
                              fontWeight="md"
                              noWrap
                              sx={{ maxWidth: 200 }}>
                              {a.nombre}
                            </Typography>
                          </Tooltip>
                        </td>
                        <td>
                          <Typography
                            level="body-xs"
                            noWrap
                            sx={{ maxWidth: 100 }}>
                            {a.tipo}
                          </Typography>
                        </td>
                        <td>
                          <Typography
                            level="body-sm"
                            noWrap
                            sx={{ maxWidth: 120 }}>
                            {a.modelo || "—"}
                          </Typography>
                        </td>
                        <td>
                          <Typography
                            level="body-sm"
                            noWrap
                            sx={{ maxWidth: 120 }}>
                            {a.serial_number || "—"}
                          </Typography>
                        </td>
                        <td>
                          <Chip
                            size="sm"
                            variant="soft"
                            color={ESTATUS_COLOR[a.estatus] || "neutral"}>
                            {a.estatus}
                          </Chip>
                        </td>
                        <td>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="flex-end">
                            {canEditAsset && (
                              <Tooltip
                                title={t("common.actions.edit")}
                                variant="soft">
                                <IconButton size="sm" onClick={() => onEdit(a)}>
                                  <EditRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canMoveAsset && (
                              <Tooltip
                                title={t("common.actions.move")}
                                variant="soft">
                                <IconButton size="sm" onClick={() => onMove(a)}>
                                  <SwapHorizRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canViewHistory && (
                              <Tooltip
                                title={t("common.actions.history")}
                                variant="soft">
                                <IconButton size="sm" onClick={() => onHist(a)}>
                                  <HistoryRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {canGenerateQR && (
                              <Tooltip
                                title={t("common.actions.qr")}
                                variant="soft">
                                <IconButton
                                  size="sm"
                                  onClick={() => abrirQR(a)}>
                                  <QrCodeRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Stack>
                        </td>
                      </tr>
                    );
                  })}
                  {pageRows.length === 0 && !loading && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{ textAlign: "center", padding: "40px" }}>
                        <Typography color="neutral">
                          {t("inventory.warehouse.empty.no_matches")}
                        </Typography>
                      </td>
                    </tr>
                  )}
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

        {/* MODALES (Se mantienen igual) */}
        {openNuevo && (
          <ActivoFormModal
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
              <Button onClick={descargarPNG}>
                {t("common.actions.download_png")}
              </Button>
            </Stack>
          </ModalDialog>
        </Modal>

        {/* Export / Import / Shortcuts */}
        <ExportDialog
          open={openExport}
          onClose={() => setOpenExport(false)}
          rows={sortedRows}
          columns={EXPORT_COLS}
          defaultTitle={`Activos - ${bodega?.nombre}`}
          defaultFilenameBase={filenameBase}
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
          <ModalDialog>
            <Typography level="title-lg">
              {t("common.actions.shortcuts")}
            </Typography>
            <Divider />
            <Typography level="body-sm" mt={1}>
              Ctrl+Shift+F: Buscar <br /> Ctrl+Shift+N: Nuevo <br />{" "}
              Ctrl+Shift+E: Exportar
            </Typography>
          </ModalDialog>
        </Modal>
      </Box>
    </Sheet>
  );
}
