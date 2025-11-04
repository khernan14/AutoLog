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
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearIcon from "@mui/icons-material/Clear";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import StatusCard from "../../components/common/StatusCard";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function ClienteSites() {
  const { id } = useParams(); // id del cliente
  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();
  const isAdmin = userData?.rol?.toLowerCase() === "admin";

  // permisos (ajusta los nombres si en tu backend difieren)
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

  // modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    id_ciudad: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (checkingSession) {
      setLoading(true);
      return;
    }

    if (!canView) {
      setError(null); // deja a la tarjeta de "sin permisos" manejar el mensaje
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
    setForm({ nombre: "", descripcion: "", id_ciudad: "" });
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
      if (editing) {
        if (!canEdit) {
          showToast("No tienes permiso para editar sites.", "warning");
          setSaving(false);
          return;
        }
        await updateSite(editing.id, { ...form, id_cliente: id });
        showToast("Site actualizado correctamente", "success");
      } else {
        if (!canCreate) {
          showToast("No tienes permiso para crear sites.", "warning");
          setSaving(false);
          return;
        }
        await createSite({ ...form, id_cliente: id });
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

  // 🔎 Filtrar rows con buscador + filtro por ciudad
  const filtered = useMemo(() => {
    const s = (search || "").toLowerCase();
    return (rows || []).filter((r) => {
      const matchSearch =
        (r.nombre || "").toLowerCase().includes(s) ||
        (r.descripcion || "").toLowerCase().includes(s) ||
        (r.ciudad || "").toLowerCase().includes(s);

      const matchCity =
        !cityFilter || String(r.id_ciudad) === String(cityFilter);
      return matchSearch && matchCity;
    });
  }, [rows, search, cityFilter]);

  // Ciudades únicas de los sites de este cliente (para mostrar solo las que existen)
  const availableCities = useMemo(() => {
    const seen = new Map();
    (rows || []).forEach((r) => {
      if (r.id_ciudad && r.ciudad) {
        seen.set(String(r.id_ciudad), r.ciudad);
      }
    });
    return Array.from(seen, ([id, nombre]) => ({ id, nombre }));
  }, [rows]);

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
      // Diferenciar entre “no hay datos” y “no hay coincidencias”
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
    // loading ya está manejado arriba con el check, aquí no se llega.
    return null;
  };

  return (
    <Box>
      {/* Header con buscador + filtro + botón */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={1.5}
        mb={2}>
        <Typography level="h5">Sites del Cliente ({rows.length})</Typography>

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

      {/* Contenido principal */}
      <Card variant="outlined" sx={{ overflowX: "auto" }}>
        {viewState !== "data" ? (
          <Box p={2}>{renderStatus()}</Box>
        ) : (
          <Table size="sm" stickyHeader>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Ciudad</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
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
              ))}
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
