// src/pages/Clientes/ClienteActivos.jsx
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
  Drawer,
  ModalClose,
  DialogTitle,
} from "@mui/joy";

// Iconos
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
import DevicesOtherRoundedIcon from "@mui/icons-material/DevicesOtherRounded";

// Componentes y Hooks
import HistorialActivoModal from "../Inventario/HistorialActivoModal";
import MoverActivoModal from "../Inventario/MoverActivoModal";
import ActivoFormModal from "@pages/Inventario/ActivoFormModal";
import StyledQR from "../../components/QRCode/StyledQR";
import StatusCard from "../../components/common/StatusCard";
import CatalogSelect from "../../components/forms/CatalogSelect";
import useRowFocusHighlight from "../../hooks/useRowFocusHighlight";
import useIsMobile from "../../hooks/useIsMobile";

// Context & Services
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { getActivosByCliente } from "../../services/ActivosServices";
import { getPublicLinkForActivo } from "../../services/PublicLinksService";
import { getBodegas } from "../../services/BodegasServices";
import { moverABodega } from "../../services/UbicacionesServices";
import { ESTATUS_COLOR } from "../../constants/inventario";
import logoTecnasa from "../../assets/newLogoTecnasaBlack.png";

const normalize = (val) =>
  (val || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export default function ClienteActivos() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile(768);
  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();

  const isAdmin = userData?.rol?.toLowerCase() === "admin";
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

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [selectedIds, setSelectedIds] = useState([]);
  const hasSelection = selectedIds.length > 0;

  const [openEdit, setOpenEdit] = useState(false);
  const [openMover, setOpenMover] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [openQR, setOpenQR] = useState(false);
  const [openBulkMover, setOpenBulkMover] = useState(false);

  const [bodegas, setBodegas] = useState([]);
  const [loadingBodegas, setLoadingBodegas] = useState(false);
  const [bulkBodega, setBulkBodega] = useState("");
  const [bulkMotivo, setBulkMotivo] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

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
      setSelectedIds([]);
    } catch (err) {
      const msg = err?.message || t("common.unknown_error");
      setError(
        /failed to fetch|network/i.test(msg)
          ? t("common.network_error")
          : t("clients.assets.errors.load_failed")
      );
    } finally {
      setLoading(false);
    }
  }, [id, checkingSession, canView, t]);

  useEffect(() => {
    load();
  }, [load]);

  const clienteNombre = useMemo(() => rows[0]?.cliente_nombre || "", [rows]);

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

  useEffect(() => {
    const token = searchParams.get("focus");
    if (!token) return;
    const next = new URLSearchParams(searchParams);
    next.delete("focus");
    setSearchParams(next, { replace: true });
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    focusByToken(token);
  }, [searchParams, setSearchParams, focusByToken]);

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
      if (allSelectedInPage)
        return prev.filter((idActivo) => !allVisibleIds.includes(idActivo));
      const set = new Set(prev);
      allVisibleIds.forEach((idActivo) => set.add(idActivo));
      return Array.from(set);
    });
  };

  function editActivo(row) {
    if (!canEdit) return showToast(t("common.no_permission"), "warning");
    setEditing(row);
    setOpenEdit(true);
  }

  function abrirMover(row) {
    if (!canMove) return showToast(t("common.no_permission"), "warning");
    setActivoSeleccionado(row);
    setOpenMover(true);
  }

  function abrirHistorial(row) {
    if (!canViewHistory) return showToast(t("common.no_permission"), "warning");
    setActivoSeleccionado(row);
    setOpenHistorial(true);
  }

  async function abrirQR(row) {
    if (!canQR) return showToast(t("common.no_permission"), "warning");
    setActivoQR(row);
    setPublicLink("");
    try {
      const { url } = await getPublicLinkForActivo(row.id);
      setPublicLink(url);
    } catch (e) {
      showToast(e?.message || t("clients.assets.errors.qr_failed"), "danger");
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

  useEffect(() => {
    if (!openBulkMover) return;
    setLoadingBodegas(true);
    getBodegas()
      .then((rows) => setBodegas(Array.isArray(rows) ? rows : []))
      .catch(() => {
        setBodegas([]);
        showToast(t("clients.assets.errors.load_warehouses"), "danger");
      })
      .finally(() => setLoadingBodegas(false));
  }, [openBulkMover, showToast, t]);

  async function bulkMoveToBodega() {
    if (!bulkBodega)
      return showToast(t("clients.assets.errors.select_warehouse"), "warning");
    if (!selectedIds.length)
      return showToast(t("clients.assets.errors.no_selection"), "warning");
    if (!canMove) return showToast(t("common.no_permission"), "warning");

    setBulkSaving(true);
    try {
      const usuario = userData?.id_usuario ?? userData?.id ?? null;
      const idsOrdenados = [...selectedIds].sort((a, b) => a - b);
      const failed = [];

      for (const id_activo of idsOrdenados) {
        try {
          await moverABodega({
            id_activo,
            id_bodega: bulkBodega,
            motivo: bulkMotivo || t("clients.assets.bulk_move_reason"),
            usuario_responsable: usuario,
          });
        } catch (e) {
          failed.push({ id_activo, error: e?.message });
        }
      }

      if (failed.length === 0)
        showToast(t("clients.assets.success.bulk_moved"), "success");
      else
        showToast(
          t("clients.assets.errors.bulk_partial", { count: failed.length }),
          "warning"
        );

      setOpenBulkMover(false);
      setBulkBodega("");
      setBulkMotivo("");
      setSelectedIds([]);
      load();
    } catch (err) {
      showToast(
        err?.message || t("clients.assets.errors.bulk_failed"),
        "danger"
      );
    } finally {
      setBulkSaving(false);
    }
  }

  const viewState = checkingSession
    ? "checking"
    : !canView
    ? "no-permission"
    : error
    ? "error"
    : loading
    ? "loading"
    : filtered.length === 0
    ? "empty"
    : "data";

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
    if (viewState === "empty")
      return (
        <StatusCard
          color="neutral"
          icon={<DevicesOtherRoundedIcon />}
          title={t("clients.assets.empty.title")}
          description={
            rows.length === 0
              ? t("clients.assets.empty.no_data")
              : t("clients.assets.empty.no_matches")
          }
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

  return (
    <Box>
      <Stack spacing={2} mb={3}>
        <Box>
          <Typography level="h3" fontWeight="lg">
            {clienteNombre || t("clients.assets.title")}
          </Typography>
          {clienteNombre && (
            <Typography level="body-sm" color="neutral">
              {t("clients.assets.subtitle")}
            </Typography>
          )}
          <Typography level="body-xs" sx={{ opacity: 0.7, mt: 0.5 }}>
            {t("clients.assets.stats", {
              total: rows.length,
              filtered: filtered.length,
              context: filtered.length !== rows.length ? "filtered" : undefined,
            })}
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.5}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Input
              placeholder={t("clients.assets.search_placeholder")}
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
              sx={{ width: { xs: "100%", sm: 280 } }}
            />
            <CatalogSelect
              catalog="estatusActivo"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v || "")}
              placeholder={t("clients.assets.columns.status")}
              allowEmpty
              sx={{ width: 160 }}
            />
            <CatalogSelect
              catalog="tiposActivo"
              value={typeFilter}
              onChange={(v) => setTypeFilter(v || "")}
              placeholder={t("clients.assets.columns.type")}
              allowEmpty
              sx={{ width: 160 }}
            />
          </Stack>

          {canMove && (
            <Tooltip
              title={
                hasSelection
                  ? t("clients.assets.actions.move_selected")
                  : t("clients.assets.actions.select_to_move")
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
                  {t("clients.assets.actions.move_to_warehouse")}
                </Button>
              </span>
            </Tooltip>
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
        }}>
        {viewState !== "data" ? (
          <Box p={4} display="flex" justifyContent="center">
            {renderStatus()}
          </Box>
        ) : (
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
                borderBottom: "1px solid",
                borderColor: "divider",
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
                <th style={{ width: 40, textAlign: "center" }}>
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
                <th style={{ width: 100 }}>
                  {t("clients.assets.columns.code")}
                </th>
                <th style={{ width: 180 }}>
                  {t("clients.assets.columns.name")}
                </th>
                <th style={{ width: 100 }}>
                  {t("clients.assets.columns.type")}
                </th>
                <th style={{ width: 120 }}>
                  {t("clients.assets.columns.model")}
                </th>
                <th style={{ width: 120 }}>
                  {t("clients.assets.columns.serial")}
                </th>
                <th style={{ width: 160 }}>
                  {t("clients.assets.columns.site")}
                </th>
                <th style={{ width: 100 }}>
                  {t("clients.assets.columns.status")}
                </th>
                <th style={{ width: 140, textAlign: "right" }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isHighlighted = r.id === highlightId;
                return (
                  <tr
                    key={r.id}
                    ref={isHighlighted ? focusedRef : null}
                    style={
                      isHighlighted
                        ? { backgroundColor: "var(--joy-palette-primary-50)" }
                        : undefined
                    }>
                    <td style={{ textAlign: "center" }}>
                      {canMove && (
                        <Checkbox
                          checked={selectedIds.includes(r.id)}
                          onChange={() => toggleSelectOne(r.id)}
                        />
                      )}
                    </td>

                    {/* Código: Monospace para lectura técnica */}
                    <td>
                      <Typography fontFamily="monospace" fontSize="xs">
                        {r.codigo}
                      </Typography>
                    </td>

                    {/* Nombre: Truncado con Tooltip */}
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
                      <Typography level="body-xs" noWrap sx={{ maxWidth: 100 }}>
                        {r.tipo}
                      </Typography>
                    </td>

                    <td>
                      <Tooltip title={r.modelo || ""} variant="soft">
                        <Typography
                          level="body-sm"
                          noWrap
                          sx={{ maxWidth: 120 }}>
                          {r.modelo || "—"}
                        </Typography>
                      </Tooltip>
                    </td>

                    <td>
                      <Tooltip title={r.serial_number || ""} variant="soft">
                        <Typography
                          level="body-sm"
                          noWrap
                          sx={{ maxWidth: 120 }}>
                          {r.serial_number || "—"}
                        </Typography>
                      </Tooltip>
                    </td>

                    {/* Site: Chip Truncado */}
                    <td>
                      {r.site_nombre ? (
                        <Tooltip
                          title={r.site_nombre}
                          variant="soft"
                          color="neutral">
                          <Chip
                            size="sm"
                            variant="soft"
                            color="primary"
                            sx={{
                              maxWidth: 150, // Forzar ancho máximo
                              justifyContent: "flex-start",
                            }}>
                            <Typography
                              noWrap // Puntos suspensivos automático
                              fontSize="xs"
                              color="primary"
                              sx={{ display: "block" }}>
                              {r.site_nombre}
                            </Typography>
                          </Chip>
                        </Tooltip>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Estatus */}
                    <td>
                      {r.estatus ? (
                        <Tooltip
                          title={r.estatus}
                          variant="soft"
                          color="neutral">
                          <Chip
                            size="sm"
                            variant="soft"
                            color={ESTATUS_COLOR[r.estatus] || "neutral"}
                            sx={{
                              maxWidth: 100, // Forzar ancho máximo
                              justifyContent: "flex-start",
                            }}>
                            <Typography
                              noWrap // Puntos suspensivos automático
                              fontSize="xs"
                              color={ESTATUS_COLOR[r.estatus] || "neutral"}
                              sx={{ display: "block" }}>
                              {r.estatus}
                            </Typography>
                          </Chip>
                        </Tooltip>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Acciones */}
                    <td>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="flex-end">
                        {canEdit && (
                          <Tooltip
                            title={t("common.actions.edit")}
                            variant="soft">
                            <IconButton size="sm" onClick={() => editActivo(r)}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {canMove && (
                          <Tooltip
                            title={t("common.actions.move")}
                            variant="soft">
                            <IconButton size="sm" onClick={() => abrirMover(r)}>
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
                            <IconButton size="sm" onClick={() => abrirQR(r)}>
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
        )}
      </Sheet>

      {/* MODALES */}
      <ActivoFormModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        editing={editing}
        onSaved={load}
      />

      <Modal
        open={openQR}
        onClose={() => {
          setOpenQR(false);
          setPublicLink("");
        }}>
        <ModalDialog
          sx={{ width: { xs: "100%", sm: 420 }, textAlign: "center" }}>
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
              {publicLink && (
                <Typography level="body-sm" sx={{ mt: 1 }}>
                  <a href={publicLink} target="_blank" rel="noreferrer">
                    {t("clients.assets.view_public_page")}
                  </a>
                </Typography>
              )}
            </Stack>
          )}
          <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
            <Button variant="plain" onClick={() => setOpenQR(false)}>
              {t("common.actions.close")}
            </Button>
            <Button onClick={descargarQR}>
              {t("common.actions.download_png")}
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>

      <HistorialActivoModal
        open={openHistorial}
        onClose={() => setOpenHistorial(false)}
        activo={activoSeleccionado}
      />

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

      <Drawer
        anchor="right"
        size="md"
        open={openBulkMover}
        onClose={() => !bulkSaving && setOpenBulkMover(false)}>
        <Sheet
          sx={{
            borderRadius: "md",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            height: "100%",
          }}>
          <DialogTitle level="title-lg">
            {t("clients.assets.bulk_move_title")}
          </DialogTitle>
          <ModalClose onClick={() => setOpenBulkMover(false)} />
          <Divider />
          <Stack spacing={2} mt={1}>
            <Typography level="body-sm">
              {t("clients.assets.selected_count", {
                count: selectedIds.length,
              })}
            </Typography>
            <FormControl required>
              <FormLabel>
                {t("clients.assets.form.destination_warehouse")}
              </FormLabel>
              <Autocomplete
                placeholder={t("clients.assets.form.search_warehouse")}
                options={bodegas}
                loading={loadingBodegas}
                value={bodegas.find((b) => b.id === bulkBodega) || null}
                onChange={(_, v) => setBulkBodega(v?.id || "")}
                getOptionLabel={(o) => o?.nombre || ""}
                isOptionEqualToValue={(o, v) => o.id === v.id}
                disabled={bulkSaving}
              />
            </FormControl>
            <FormControl required>
              <FormLabel>{t("clients.assets.form.reason")}</FormLabel>
              <Input
                value={bulkMotivo}
                onChange={(e) => setBulkMotivo(e.target.value)}
                disabled={bulkSaving}
                placeholder={t("clients.assets.form.reason_placeholder")}
              />
            </FormControl>
          </Stack>
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
            <Button
              variant="plain"
              onClick={() => setOpenBulkMover(false)}
              disabled={bulkSaving}>
              {t("common.actions.cancel")}
            </Button>
            <Button
              onClick={bulkMoveToBodega}
              loading={bulkSaving}
              disabled={bulkSaving || !selectedIds.length || !bulkBodega}>
              {t("clients.assets.actions.move_to_warehouse")}
            </Button>
          </Stack>
        </Sheet>
      </Drawer>
    </Box>
  );
}
