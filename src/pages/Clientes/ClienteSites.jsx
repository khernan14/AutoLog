// src/pages/Clientes/ClienteSites.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
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

import StatusCard from "../../components/common/StatusCard";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function ClienteSites() {
  const { id } = useParams(); // id del cliente
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

  // filtros
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("activos"); // "activos" | "inactivos" | "todos"

  // selección múltiple
  const [selectedIds, setSelectedIds] = useState([]);
  const hasSelection = selectedIds.length > 0;

  // modal
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

  // 🔎 Filtrar rows con buscador + ciudad + estado
  const filtered = useMemo(() => {
    const s = (search || "").toLowerCase();

    return (rows || []).filter((r) => {
      const matchSearch =
        (r.nombre || "").toLowerCase().includes(s) ||
        (r.descripcion || "").toLowerCase().includes(s) ||
        (r.ciudad || "").toLowerCase().includes(s);

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
    return Array.from(seen, ([id, nombre]) => ({ id, nombre }));
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

  return (
    <Box>
      {/* HEADER NUEVO: título + totales arriba, filtros y acciones abajo */}
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
          {/* Filtros */}
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

            <Select
              placeholder="Filtrar por ciudad"
              value={cityFilter}
              onChange={(_, v) => setCityFilter(v || "")}
              sx={{ minWidth: 200 }}>
              <Option value="">Todas las ciudades</Option>
              {availableCities.map((c) => (
                <Option key={c.id} value={String(c.id)}>
                  {c.nombre}
                </Option>
              ))}
            </Select>

            {/* Filtro por estado */}
            <Select
              placeholder="Estado"
              value={statusFilter}
              onChange={(_, v) => setStatusFilter(v || "activos")}
              sx={{ minWidth: 160 }}>
              <Option value="activos">Activos</Option>
              <Option value="inactivos">Inactivos</Option>
              <Option value="todos">Todos</Option>
            </Select>
          </Stack>

          {/* Acciones masivas + Nuevo */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="flex-end"
            flexWrap="wrap">
            {canEdit && (
              <>
                <Tooltip
                  title={
                    hasSelection
                      ? "Activar seleccionados"
                      : "Selecciona uno o más sites"
                  }
                  variant="soft">
                  <span>
                    <Button
                      size="sm"
                      variant="soft"
                      startDecorator={<ToggleOnRoundedIcon />}
                      disabled={!hasSelection || bulkSaving}
                      onClick={() => bulkUpdateActivo(true)}>
                      Activar
                    </Button>
                  </span>
                </Tooltip>

                <Tooltip
                  title={
                    hasSelection
                      ? "Inactivar seleccionados"
                      : "Selecciona uno o más sites"
                  }
                  variant="soft">
                  <span>
                    <Button
                      size="sm"
                      variant="soft"
                      color="neutral"
                      startDecorator={<ToggleOffRoundedIcon />}
                      disabled={!hasSelection || bulkSaving}
                      onClick={() => bulkUpdateActivo(false)}>
                      Inactivar
                    </Button>
                  </span>
                </Tooltip>
              </>
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
                  <tr key={r.id}>
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

      {/* Modal para nuevo/editar */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog
          component="form"
          onSubmit={onSubmit}
          sx={{ width: { xs: "100%", sm: 520 } }}>
          <Typography level="title-lg">
            {editing ? "Editar Site" : "Nuevo Site"}
          </Typography>
          <Divider />
          <Stack spacing={1.5} mt={1}>
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

          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
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
        </ModalDialog>
      </Modal>
    </Box>
  );
}
