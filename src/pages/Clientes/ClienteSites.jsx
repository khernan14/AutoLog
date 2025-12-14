// src/pages/Clientes/ClienteSites.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  Box,
  Typography,
  Stack,
  Button,
  Table,
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
  Checkbox,
  Drawer,
  Sheet,
  ModalClose,
} from "@mui/joy";

// Iconos
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearIcon from "@mui/icons-material/Clear";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import LocationCityRoundedIcon from "@mui/icons-material/LocationCityRounded";

// Services & Context
import {
  getSitesByCliente,
  createSite,
  updateSite,
} from "../../services/SitesServices";
import { getCities } from "../../services/LocationServices";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import StatusCard from "../../components/common/StatusCard";
import useRowFocusHighlight from "../../hooks/useRowFocusHighlight";
import PaginationLite from "../../components/common/PaginationLite"; // 👈 Importamos paginación

// Normalizador
const normalize = (val) =>
  (val || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export default function ClienteSites() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();

  const isAdmin = userData?.rol?.toLowerCase() === "admin";
  const can = useCallback(
    (p) => isAdmin || hasPermiso(p),
    [isAdmin, hasPermiso]
  );

  const canView = can("ver_sites");
  const canCreate = can("crear_sites");
  const canEdit = can("editar_sites");

  // Data
  const [rows, setRows] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("activos");

  // Paginación 🆕
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Drawer Filtros
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [draftCityFilter, setDraftCityFilter] = useState(cityFilter);
  const [draftStatusFilter, setDraftStatusFilter] = useState(statusFilter);

  // Selección
  const [selectedIds, setSelectedIds] = useState([]);
  const hasSelection = selectedIds.length > 0;

  // Modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    id_ciudad: "",
    activo: "1",
  });
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  function isActivoVal(value) {
    return value === 1 || value === true || value === "1" || value === "true";
  }

  // Carga
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
      const [sitesData, ciudadesData] = await Promise.all([
        getSitesByCliente(id),
        getCities(),
      ]);
      setRows(Array.isArray(sitesData) ? sitesData : []);
      setCiudades(Array.isArray(ciudadesData) ? ciudadesData : []);
      setSelectedIds([]);
    } catch (err) {
      const msg = err?.message || t("common.unknown_error");
      setError(
        /failed to fetch|network/i.test(msg)
          ? t("common.network_error")
          : t("clients.sites.errors.load_failed")
      );
    } finally {
      setLoading(false);
    }
  }, [id, checkingSession, canView, t]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset de página al filtrar
  useEffect(() => {
    setPage(1);
  }, [search, cityFilter, statusFilter]);

  // Filtrado
  const filtered = useMemo(() => {
    const s = normalize(search);
    return (rows || []).filter((r) => {
      const matchSearch =
        normalize(r.nombre).includes(s) ||
        normalize(r.descripcion).includes(s) ||
        normalize(r.ciudad).includes(s);
      const matchCity =
        !cityFilter || String(r.id_ciudad) === String(cityFilter);
      const isActivo = isActivoVal(r.activo);
      const matchStatus =
        statusFilter === "activos"
          ? isActivo
          : statusFilter === "inactivos"
          ? !isActivo
          : true;
      return matchSearch && matchCity && matchStatus;
    });
  }, [rows, search, cityFilter, statusFilter]);

  // Paginación 🆕
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  // Highlight Logic
  const { highlightId, focusedRef, focusByToken } = useRowFocusHighlight({
    rows: filtered, // Nota: Highlight busca en filtered, pero si la fila no está en la página actual, no se verá (esto es normal en tablas paginadas)
    matchRow: (r, token) =>
      String(r.id) === token || normalize(r.nombre) === normalize(token),
    getRowId: (r) => r.id,
    highlightMs: 4000,
  });

  useEffect(() => {
    const token = searchParams.get("focus");
    if (!token) return;
    const next = new URLSearchParams(searchParams);
    next.delete("focus");
    setSearchParams(next, { replace: true });

    // Reset filters to find the row
    setSearch("");
    setCityFilter("");
    setStatusFilter("todos");
    setDraftCityFilter("");
    setDraftStatusFilter("todos");

    // Nota: Si la fila está en la página 5, el highlight no saltará automáticamente de página.
    // Eso requeriría lógica compleja de encontrar el índice. Por ahora, reseteamos filtros y asumimos que aparece.
    focusByToken(token);
  }, [searchParams, setSearchParams, focusByToken]);

  // Selección Múltiple (Ahora sobre la PÁGINA ACTUAL) 🆕
  const pageIds = useMemo(
    () => paginatedRows.map((r) => r.id),
    [paginatedRows]
  );
  const allSelectedInPage =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const toggleSelectOne = (idSite) => {
    setSelectedIds((prev) =>
      prev.includes(idSite)
        ? prev.filter((x) => x !== idSite)
        : [...prev, idSite]
    );
  };

  const toggleSelectAllPage = () => {
    setSelectedIds((prev) => {
      if (allSelectedInPage) {
        // Quitar los de esta página
        return prev.filter((id) => !pageIds.includes(id));
      }
      // Agregar los de esta página (sin duplicados)
      const set = new Set(prev);
      pageIds.forEach((id) => set.add(id));
      return Array.from(set);
    });
  };

  // Acciones CRUD
  function newSite() {
    if (!canCreate) return showToast(t("common.no_permission"), "warning");
    setEditing(null);
    setForm({ nombre: "", descripcion: "", id_ciudad: "", activo: "1" });
    setOpen(true);
  }

  function editSite(row) {
    if (!canEdit) return showToast(t("common.no_permission"), "warning");
    setEditing(row);
    setForm({
      nombre: row.nombre,
      descripcion: row.descripcion || "",
      id_ciudad: row.id_ciudad ? String(row.id_ciudad) : "",
      activo: isActivoVal(row.activo) ? "1" : "0",
    });
    setOpen(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.nombre.trim())
      return showToast(t("clients.sites.errors.name_required"), "warning");

    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        id_ciudad: form.id_ciudad || null,
        id_cliente: id,
        activo: form.activo === "1" ? 1 : 0,
      };

      if (editing) {
        if (!canEdit) throw new Error(t("common.no_permission"));
        await updateSite(editing.id, payload);
        showToast(t("clients.sites.success.updated"), "success");
      } else {
        if (!canCreate) throw new Error(t("common.no_permission"));
        await createSite(payload);
        showToast(t("clients.sites.success.created"), "success");
      }
      setOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      showToast(
        err?.message || t("clients.sites.errors.save_failed"),
        "danger"
      );
    } finally {
      setSaving(false);
    }
  }

  // Bulk Actions
  async function bulkUpdateActivo(newActivo) {
    if (!canEdit) return showToast(t("common.no_permission"), "warning");
    if (!selectedIds.length) return;
    setBulkSaving(true);
    try {
      await Promise.all(
        selectedIds.map((idSite) => {
          const row = rows.find((r) => r.id === idSite);
          if (!row) return null;
          return updateSite(idSite, {
            id_cliente: id,
            nombre: row.nombre,
            descripcion: row.descripcion || null,
            id_ciudad: row.id_ciudad || null,
            activo: newActivo ? 1 : 0,
          });
        })
      );
      showToast(t("clients.sites.success.bulk_updated"), "success");
      setSelectedIds([]);
      load();
    } catch (err) {
      showToast(
        err?.message || t("clients.sites.errors.bulk_failed"),
        "danger"
      );
    } finally {
      setBulkSaving(false);
    }
  }

  // View State
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
          icon={<LocationCityRoundedIcon />}
          title={t("clients.sites.empty.title")}
          description={
            rows.length === 0
              ? t("clients.sites.empty.no_data")
              : t("clients.sites.empty.no_matches")
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

  const availableCities = useMemo(() => {
    const seen = new Map();
    (rows || []).forEach((r) => {
      if (r.id_ciudad && r.ciudad) seen.set(String(r.id_ciudad), r.ciudad);
    });
    return Array.from(seen, ([idCity, nombre]) => ({ id: idCity, nombre }));
  }, [rows]);

  const totalSites = rows.length;
  const totalActivos = useMemo(
    () => (rows || []).filter((r) => isActivoVal(r.activo)).length,
    [rows]
  );
  const bulkButtonIsActivate = statusFilter === "inactivos";

  return (
    <Box>
      {/* HEADER */}
      <Stack spacing={2} mb={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}>
          <Box>
            <Typography level="h3" fontWeight="lg">
              {t("clients.sites.title")}
            </Typography>
            <Typography level="body-sm" color="neutral" sx={{ mt: 0.5 }}>
              {t("clients.sites.stats", {
                total: totalSites,
                active: totalActivos,
                inactive: totalSites - totalActivos,
              })}
            </Typography>
          </Box>

          {canCreate && (
            <Button
              startDecorator={<AddRoundedIcon />}
              onClick={newSite}
              variant="solid"
              color="primary">
              {t("clients.sites.actions.new")}
            </Button>
          )}
        </Stack>

        {/* TOOLBAR */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems="center">
          {/* Input Compacto */}
          <Input
            placeholder={t("clients.sites.search_placeholder")}
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
            sx={{ width: { xs: "100%", md: 240 } }} // 👈 Ancho fijo compacto
          />

          <Button
            variant="outlined"
            color="neutral"
            startDecorator={<TuneRoundedIcon />}
            onClick={() => setFilterDrawerOpen(true)}>
            {t("common.actions.filters")}
            {(cityFilter || statusFilter !== "activos") && (
              <Chip size="sm" variant="solid" color="primary" sx={{ ml: 1 }}>
                2
              </Chip>
            )}
          </Button>

          {canEdit && hasSelection && (
            <Button
              variant="soft"
              color={bulkButtonIsActivate ? "success" : "neutral"}
              startDecorator={
                bulkButtonIsActivate ? (
                  <ToggleOnRoundedIcon />
                ) : (
                  <ToggleOffRoundedIcon />
                )
              }
              onClick={() => bulkUpdateActivo(bulkButtonIsActivate)}
              disabled={bulkSaving}>
              {bulkButtonIsActivate
                ? t("clients.sites.actions.activate_selected")
                : t("clients.sites.actions.deactivate_selected")}
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
        }}>
        {viewState !== "data" ? (
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
                  <th style={{ width: 48, textAlign: "center" }}>
                    <Checkbox
                      checked={allSelectedInPage}
                      indeterminate={!allSelectedInPage && hasSelection}
                      onChange={toggleSelectAllPage}
                    />
                  </th>
                  <th>{t("clients.sites.columns.name")}</th>
                  <th>{t("clients.sites.columns.description")}</th>
                  <th>{t("clients.sites.columns.city")}</th>
                  <th>{t("clients.sites.columns.status")}</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((r) => {
                  const isActivo = isActivoVal(r.activo);
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
                        <Checkbox
                          checked={selectedIds.includes(r.id)}
                          onChange={() => toggleSelectOne(r.id)}
                        />
                      </td>
                      <td>
                        <Tooltip
                          title={r.nombre}
                          variant="soft"
                          color="neutral">
                          <Typography
                            noWrap
                            fontSize="xs"
                            sx={{ display: "block" }}>
                            {r.nombre}
                          </Typography>
                        </Tooltip>
                      </td>
                      <td>
                        <Typography
                          level="body-sm"
                          color="neutral"
                          noWrap
                          sx={{ maxWidth: 250 }}>
                          {r.descripcion || "—"}
                        </Typography>
                      </td>
                      <td>
                        {r.ciudad ? (
                          // <Chip size="sm" variant="soft" color="primary">
                          //   {r.ciudad}
                          // </Chip>
                          <Chip
                            size="sm"
                            variant="soft"
                            color="primary"
                            startDecorator={<LocationCityRoundedIcon />}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center">
                              <span>{r.ciudad}</span>
                            </Stack>
                          </Chip>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <Chip
                          size="sm"
                          variant="soft"
                          color={isActivo ? "success" : "neutral"}
                          startDecorator={
                            isActivo && (
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  bgcolor: "success.500",
                                }}
                              />
                            )
                          }>
                          {isActivo
                            ? t("common.status.active")
                            : t("common.status.inactive")}
                        </Chip>
                      </td>
                      <td>
                        {canEdit && (
                          <Tooltip
                            title={t("common.actions.edit")}
                            variant="soft">
                            <IconButton
                              size="sm"
                              variant="plain"
                              color="neutral"
                              onClick={() => editSite(r)}>
                              <EditRoundedIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>

            {/* Footer Paginación */}
            {rows.length > 0 && (
              <Box
                sx={{
                  p: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.surface",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <Typography level="body-xs" color="neutral">
                  {t("common.showing_results", {
                    count: paginatedRows.length,
                    total: filtered.length,
                  })}
                </Typography>
                <PaginationLite
                  page={page}
                  count={totalPages}
                  onChange={setPage}
                />
              </Box>
            )}
          </>
        )}
      </Sheet>

      {/* DRAWER FILTROS */}
      <Drawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        anchor="right"
        size="sm">
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
              {t("clients.sites.filters_title")}
            </Typography>
            <ModalClose onClick={() => setFilterDrawerOpen(false)} />
          </Stack>
          <Divider />

          <Stack spacing={2} flex={1}>
            <FormControl>
              <FormLabel>{t("clients.sites.columns.city")}</FormLabel>
              <Select
                value={draftCityFilter}
                onChange={(_, v) => setDraftCityFilter(v || "")}
                placeholder={t("common.all_cities")}>
                <Option value="">{t("common.all_cities")}</Option>
                {availableCities.map((c) => (
                  <Option key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>{t("clients.sites.columns.status")}</FormLabel>
              <Select
                value={draftStatusFilter}
                onChange={(_, v) => setDraftStatusFilter(v || "activos")}>
                <Option value="activos">{t("common.status.active")}</Option>
                <Option value="inactivos">{t("common.status.inactive")}</Option>
                <Option value="todos">{t("common.status.all")}</Option>
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {
                setDraftCityFilter("");
                setDraftStatusFilter("activos");
                setCityFilter("");
                setStatusFilter("activos");
                setFilterDrawerOpen(false);
              }}>
              {t("common.actions.clear")}
            </Button>
            <Button
              onClick={() => {
                setCityFilter(draftCityFilter || "");
                setStatusFilter(draftStatusFilter || "activos");
                setFilterDrawerOpen(false);
              }}>
              {t("common.actions.apply")}
            </Button>
          </Stack>
        </Sheet>
      </Drawer>

      {/* DRAWER CREAR/EDITAR */}
      <Drawer
        open={open}
        onClose={() => !saving && setOpen(false)}
        anchor="right"
        size="ms">
        <Sheet
          component="form"
          onSubmit={onSubmit}
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
              {editing
                ? t("clients.sites.edit_title")
                : t("clients.sites.create_title")}
            </Typography>
            <ModalClose disabled={saving} onClick={() => setOpen(false)} />
          </Stack>
          <Divider />

          <Stack spacing={2} flex={1} overflow="auto">
            <FormControl required>
              <FormLabel>{t("clients.sites.form.name")}</FormLabel>
              <Input
                disabled={saving}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{t("clients.sites.form.description")}</FormLabel>
              <Input
                disabled={saving}
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
              />
            </FormControl>
            <FormControl>
              <FormLabel>{t("clients.sites.form.city")}</FormLabel>
              <Select
                disabled={saving}
                value={form.id_ciudad}
                onChange={(_, v) => setForm({ ...form, id_ciudad: v })}>
                {ciudades.map((c) => (
                  <Option key={c.id} value={String(c.id)}>
                    {c.ciudad}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>{t("clients.sites.form.status")}</FormLabel>
              <Select
                disabled={saving}
                value={form.activo}
                onChange={(_, v) => setForm({ ...form, activo: v })}>
                <Option value="1">{t("common.status.active")}</Option>
                <Option value="0">{t("common.status.inactive")}</Option>
              </Select>
            </FormControl>
          </Stack>

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              variant="plain"
              onClick={() => setOpen(false)}
              disabled={saving}>
              {t("common.actions.cancel")}
            </Button>
            <Button type="submit" loading={saving}>
              {t("common.actions.save")}
            </Button>
          </Stack>
        </Sheet>
      </Drawer>
    </Box>
  );
}
