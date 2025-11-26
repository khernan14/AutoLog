// src/pages/Clientes/ClienteSites.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  getSitesByCliente,
  createSite,
  updateSite,
} from "../../services/SitesServices";
import { getCities } from "../../services/LocationServices";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Table,
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
  Checkbox,
  Drawer,
  Sheet,
  ModalClose,
} from "@mui/joy";

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

import StatusCard from "../../components/common/StatusCard";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

import useRowFocusHighlight from "../../hooks/useRowFocusHighlight";

// Normalizador para ignorar mayúsculas/tildes
const normalize = (val) =>
  (val || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export default function ClienteSites() {
  const { id } = useParams(); // id del cliente
  const [searchParams, setSearchParams] = useSearchParams();

  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();
  const isAdmin = userData?.rol?.toLowerCase() === "admin";

  // permisos
  const can = useCallback(
    (p) => isAdmin || hasPermiso(p),
    [isAdmin, hasPermiso]
  );
  const canView = can("ver_sites");
  const canCreate = can("crear_sites");
  const canEdit = can("editar_sites");

  // data
  const [rows, setRows] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  // ui state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // filtros aplicados
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("activos"); // "activos" | "inactivos" | "todos"

  // Drawer de filtros
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [draftCityFilter, setDraftCityFilter] = useState(cityFilter);
  const [draftStatusFilter, setDraftStatusFilter] = useState(statusFilter);

  // selección múltiple
  const [selectedIds, setSelectedIds] = useState([]);
  const hasSelection = selectedIds.length > 0;

  // modal crear/editar
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    id_ciudad: "",
    activo: "1", // "1" = activo, "0" = inactivo
  });
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  // helper para normalizar activo
  function isActivoVal(value) {
    return value === 1 || value === true || value === "1" || value === "true";
  }

  const load = useCallback(async () => {
    if (checkingSession) {
      setLoading(true);
      return;
    }

    if (!canView) {
      setError(null); // dejar que la tarjeta de "sin permisos" maneje el mensaje
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
      setSelectedIds([]); // limpiar selección al recargar
    } catch (err) {
      const msg = err?.message || "Error desconocido.";
      setError(
        /failed to fetch|network/i.test(msg)
          ? "No hay conexión con el servidor."
          : "No se pudieron cargar los sites."
      );
    } finally {
      setLoading(false);
    }
  }, [id, checkingSession, canView]);

  useEffect(() => {
    load();
  }, [load]);

  // acciones
  function newSite() {
    if (!canCreate) {
      showToast(
        "No tienes permiso para crear sites. Solicítalo al administrador.",
        "warning"
      );
      return;
    }
    setEditing(null);
    setForm({ nombre: "", descripcion: "", id_ciudad: "", activo: "1" });
    setOpen(true);
  }

  function editSite(row) {
    if (!canEdit) {
      showToast("No tienes permiso para editar sites.", "warning");
      return;
    }
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

    if (!form.nombre.trim()) {
      showToast("El nombre es requerido", "warning");
      return;
    }

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
        if (!canEdit) {
          showToast("No tienes permiso para editar sites.", "warning");
          setSaving(false);
          return;
        }
        await updateSite(editing.id, payload);
        showToast("Site actualizado correctamente", "success");
      } else {
        if (!canCreate) {
          showToast("No tienes permiso para crear sites.", "warning");
          setSaving(false);
          return;
        }
        await createSite(payload);
        showToast("Site creado correctamente", "success");
      }
      setOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      showToast(err?.message || "Error al guardar site", "danger");
    } finally {
      setSaving(false);
    }
  }

  // 🔎 Filtrar rows con buscador + ciudad + estado (con normalize)
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
          : true; // "todos"

      return matchSearch && matchCity && matchStatus;
    });
  }, [rows, search, cityFilter, statusFilter]);

  // ⭐ Hook de focus/highlight
  const { highlightId, focusedRef, focusByToken } = useRowFocusHighlight({
    rows: filtered,
    matchRow: (r, token) => {
      const t = normalize(token);
      return (
        String(r.id) === token || normalize(r.nombre) === t // por si se usa el nombre como token
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

    // Limpiar filtros para asegurar que el site se vea
    setSearch("");
    setCityFilter("");
    setStatusFilter("todos");
    setDraftCityFilter("");
    setDraftStatusFilter("todos");

    focusByToken(token);
  }, [searchParams, setSearchParams, focusByToken]);

  // IDs visibles según filtros
  const allVisibleIds = useMemo(
    () => (filtered || []).map((r) => r.id),
    [filtered]
  );

  const allSelectedInPage =
    allVisibleIds.length > 0 &&
    allVisibleIds.every((idSite) => selectedIds.includes(idSite));

  // 🔀 selección múltiple
  const toggleSelectOne = (idSite) => {
    setSelectedIds((prev) =>
      prev.includes(idSite)
        ? prev.filter((x) => x !== idSite)
        : [...prev, idSite]
    );
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      if (allSelectedInPage) {
        // quitar todos los de esta vista
        return prev.filter((idSite) => !allVisibleIds.includes(idSite));
      }
      // agregar todos los visibles (sin duplicados)
      const set = new Set(prev);
      allVisibleIds.forEach((idSite) => set.add(idSite));
      return Array.from(set);
    });
  };

  // Ciudades únicas de los sites de este cliente
  const availableCities = useMemo(() => {
    const seen = new Map();
    (rows || []).forEach((r) => {
      if (r.id_ciudad && r.ciudad) {
        seen.set(String(r.id_ciudad), r.ciudad);
      }
    });
    return Array.from(seen, ([idCity, nombre]) => ({
      id: idCity,
      nombre,
    }));
  }, [rows]);

  // Métricas
  const totalSites = rows.length;
  const totalActivos = useMemo(
    () => (rows || []).filter((r) => isActivoVal(r.activo)).length,
    [rows]
  );
  const totalInactivos = totalSites - totalActivos;

  // 🔁 BULK: activar / inactivar seleccionados
  async function bulkUpdateActivo(newActivo) {
    if (!canEdit) {
      showToast("No tienes permiso para editar sites.", "warning");
      return;
    }
    if (!selectedIds.length) return;

    setBulkSaving(true);
    try {
      const ids = [...selectedIds];
      await Promise.all(
        ids.map((idSite) => {
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
      showToast(
        `Sites ${newActivo ? "activados" : "inactivados"} correctamente`,
        "success"
      );
      setSelectedIds([]);
      load();
    } catch (err) {
      showToast(
        err?.message ||
          `Error al ${newActivo ? "activar" : "inactivar"} los sites`,
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
    : loading
    ? "loading"
    : filtered.length === 0
    ? "empty"
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
          title="Sin permisos para ver sites"
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
      const noData = (rows || []).length === 0;
      return (
        <StatusCard
          color="neutral"
          icon={<InfoOutlinedIcon />}
          title={noData ? "Sin sites" : "No hay coincidencias"}
          description={
            noData
              ? "Aún no hay sites registrados para este cliente."
              : "Ajusta la búsqueda o filtros para ver resultados."
          }
        />
      );
    }
    return null;
  };

  const bulkButtonIsActivate = statusFilter === "inactivos";

  // Handlers Drawer filtros
  const openFiltersDrawer = () => {
    setDraftCityFilter(cityFilter);
    setDraftStatusFilter(statusFilter);
    setFilterDrawerOpen(true);
  };

  const handleCloseFiltersDrawer = () => {
    // cerrar sin aplicar → restaurar drafts a lo que está aplicado
    setFilterDrawerOpen(false);
    setDraftCityFilter(cityFilter);
    setDraftStatusFilter(statusFilter);
  };

  const handleApplyFilters = () => {
    setCityFilter(draftCityFilter || "");
    setStatusFilter(draftStatusFilter || "activos");
    setFilterDrawerOpen(false);
  };

  const handleClearFilters = () => {
    setDraftCityFilter("");
    setDraftStatusFilter("activos");
    setCityFilter("");
    setStatusFilter("activos");
    setFilterDrawerOpen(false);
  };

  return (
    <Box>
      {/* HEADER: título + totales + filtros compactos */}
      <Stack spacing={1.5} mb={2}>
        <Box>
          <Typography level="h4">Sites del Cliente</Typography>
          <Typography level="body-sm" color="neutral">
            Puntos de servicio / instalación asociados al cliente.
          </Typography>
          <Typography level="body-xs" sx={{ opacity: 0.7, mt: 0.5 }}>
            Total sites: {totalSites} · Activos: {totalActivos} · Inactivos:{" "}
            {totalInactivos}
            {totalSites !== filtered.length &&
              ` · Con filtros: ${filtered.length}`}
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.25}>
          {/* Búsqueda + botón filtros */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Input
              placeholder="Buscar por nombre, descripción o ciudad…"
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
              sx={{ width: { xs: "100%", sm: 300 } }}
            />

            <Button
              size="sm"
              variant="outlined"
              startDecorator={<TuneRoundedIcon />}
              onClick={openFiltersDrawer}>
              Filtros
            </Button>
          </Stack>

          {/* Acciones masivas + Nuevo */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="flex-end"
            flexWrap="wrap">
            {canEdit && hasSelection && (
              <Tooltip
                title={
                  bulkButtonIsActivate
                    ? "Activar sites seleccionados"
                    : "Inactivar sites seleccionados"
                }
                variant="soft">
                <span>
                  <Button
                    size="sm"
                    variant="soft"
                    color={bulkButtonIsActivate ? "success" : "neutral"}
                    startDecorator={
                      bulkButtonIsActivate ? (
                        <ToggleOnRoundedIcon />
                      ) : (
                        <ToggleOffRoundedIcon />
                      )
                    }
                    disabled={bulkSaving}
                    onClick={() => bulkUpdateActivo(bulkButtonIsActivate)}>
                    {bulkButtonIsActivate
                      ? "Activar seleccionados"
                      : "Inactivar seleccionados"}
                  </Button>
                </span>
              </Tooltip>
            )}

            <Tooltip
              title={
                canCreate
                  ? "Crear site"
                  : "No tienes permiso para crear. Solicítalo al administrador."
              }
              variant="soft"
              placement="top-end">
              <span>
                <Button
                  startDecorator={<AddRoundedIcon />}
                  onClick={newSite}
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
      </Stack>

      {/* Contenido principal */}
      <Card variant="outlined" sx={{ overflowX: "auto" }}>
        {viewState !== "data" ? (
          <Box p={2}>{renderStatus()}</Box>
        ) : (
          <Table size="sm" stickyHeader>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <Checkbox
                    checked={allSelectedInPage}
                    indeterminate={
                      !allSelectedInPage && hasSelection && filtered.length > 0
                    }
                    onChange={toggleSelectAllVisible}
                  />
                </th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Ciudad</th>
                <th>Estado</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isActivo = isActivoVal(r.activo);
                return (
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
                      <Checkbox
                        checked={selectedIds.includes(r.id)}
                        onChange={() => toggleSelectOne(r.id)}
                      />
                    </td>
                    <td>{r.nombre}</td>
                    <td>{r.descripcion || "—"}</td>
                    <td>
                      {r.ciudad ? (
                        <Chip size="sm" variant="soft" color="primary">
                          {r.ciudad}
                        </Chip>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <Chip
                        size="sm"
                        variant="soft"
                        color={isActivo ? "success" : "neutral"}>
                        {isActivo ? "Activo" : "Inactivo"}
                      </Chip>
                    </td>

                    <td>
                      <Tooltip
                        title={canEdit ? "Editar" : "Sin permiso"}
                        variant="soft">
                        <span>
                          <IconButton
                            onClick={() => editSite(r)}
                            disabled={!canEdit}
                            aria-disabled={!canEdit}
                            variant={canEdit ? "soft" : "plain"}
                            color={canEdit ? "primary" : "neutral"}>
                            <EditRoundedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Drawer de filtros */}
      <Drawer
        open={filterDrawerOpen}
        onClose={handleCloseFiltersDrawer}
        anchor="right"
        size="md"
        variant="plain"
        slotProps={{
          content: {
            sx: {
              bgcolor: "transparent",
              p: { xs: 0, sm: 2 },
              boxShadow: "none",
            },
          },
        }}>
        <Sheet
          sx={{
            borderRadius: { xs: 0, sm: "md" },
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            height: "100%",
            minWidth: { xs: "100dvw", sm: 360 },
            bgcolor: "background.surface",
            boxShadow: "lg",
          }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between">
            <Typography level="title-lg">Filtros de sites</Typography>
            <ModalClose onClick={handleCloseFiltersDrawer} />
          </Stack>
          <Divider />

          <Stack spacing={1.5} sx={{ flex: 1, overflow: "auto", mt: 1 }}>
            <FormControl>
              <FormLabel>Ciudad</FormLabel>
              <Select
                placeholder="Todas las ciudades"
                value={draftCityFilter}
                onChange={(_, v) => setDraftCityFilter(v || "")}>
                <Option value="">Todas las ciudades</Option>
                {availableCities.map((c) => (
                  <Option key={c.id} value={String(c.id)}>
                    {c.nombre}
                  </Option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Estado</FormLabel>
              <Select
                value={draftStatusFilter}
                onChange={(_, v) => setDraftStatusFilter(v || "activos")}>
                <Option value="activos">Activos</Option>
                <Option value="inactivos">Inactivos</Option>
                <Option value="todos">Todos</Option>
              </Select>
            </FormControl>

            <Typography level="body-xs" sx={{ opacity: 0.75, mt: 1 }}>
              Los filtros se aplican solo al presionar{" "}
              <strong>“Aplicar filtros”</strong>.
            </Typography>
          </Stack>

          <Divider sx={{ mt: "auto", mb: 1 }} />
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={handleClearFilters}>
              Limpiar
            </Button>
            <Button onClick={handleApplyFilters}>Aplicar filtros</Button>
          </Stack>
        </Sheet>
      </Drawer>
      {/* Drawer para nuevo/editar */}
      <Drawer
        open={open}
        onClose={() => !saving && setOpen(false)}
        anchor="right"
        size="md"
        variant="plain"
        slotProps={{
          content: {
            sx: {
              bgcolor: "transparent",
              p: { xs: 0, sm: 2 },
              boxShadow: "none",
            },
          },
        }}>
        <Sheet
          component="form"
          onSubmit={onSubmit}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            borderRadius: { xs: 0, sm: "md" },
            p: 2,
            boxShadow: "lg",
            bgcolor: "background.surface",
            minWidth: { xs: "100dvw", sm: 420 },
          }}>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 0.5 }}>
            <Typography level="title-lg">
              {editing ? "Editar Site" : "Nuevo Site"}
            </Typography>
            <ModalClose disabled={saving} />
          </Stack>
          <Divider />

          {/* Contenido */}
          <Stack spacing={1.5} mt={1} sx={{ flex: 1, overflow: "auto" }}>
            <FormControl required>
              <FormLabel>Nombre</FormLabel>
              <Input
                disabled={saving}
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Descripción</FormLabel>
              <Input
                disabled={saving}
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel>Ciudad</FormLabel>
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
              <FormLabel>Estado</FormLabel>
              <Select
                disabled={saving}
                value={form.activo}
                onChange={(_, v) => setForm({ ...form, activo: v })}>
                <Option value="1">Activo</Option>
                <Option value="0">Inactivo</Option>
              </Select>
            </FormControl>
          </Stack>

          {/* Footer */}
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={1}>
            <Button
              variant="plain"
              onClick={() => setOpen(false)}
              disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving} disabled={saving}>
              Guardar
            </Button>
          </Stack>
        </Sheet>
      </Drawer>
    </Box>
  );
}
