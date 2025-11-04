import { useEffect, useState, useCallback, useMemo } from "react";
import {
  getClientes,
  createCliente,
} from "../../services/ClientesServices.jsx";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Table,
  Sheet,
  Input,
  Chip,
  Modal,
  ModalDialog,
  FormControl,
  FormLabel,
  Select,
  Option,
  Divider,
  Avatar,
  CircularProgress,
  useTheme,
  Tooltip,
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { useToast } from "../../context/ToastContext";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// ✅ NUEVOS IMPORTS (ajusta rutas si los pusiste en otra carpeta)
import ResourceState from "../../components/common/ResourceState";
import useIsMobile from "../../hooks/useIsMobile";
import usePermissions from "../../hooks/usePermissions";
import { getViewState } from "../../utils/viewState";

const ESTATUS = ["Activo", "Inactivo"];

export default function ClientesList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    estatus: "Activo",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const [sortKey, setSortKey] = useState("nombre");
  const [sortDir, setSortDir] = useState("asc");

  const theme = useTheme();
  const isMobile = useIsMobile(768);
  const { showToast } = useToast();

  // Usamos Auth solo para saber si la sesión se está verificando
  const { checkingSession } = useAuth();

  // ✅ Permisos centralizados
  const { canAny } = usePermissions();
  const canView = canAny("ver_companias");
  const canCreate = canAny("crear_companias");
  // Si luego usas edición, deja listo:
  // const canEdit   = canAny("editar_companias", "gestionar_companias");

  const loadClientes = useCallback(async () => {
    if (checkingSession) {
      setLoading(true);
      return;
    }
    if (!canView) {
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getClientes();
      if (data) setRows(data);
      else setError("No se pudo obtener la lista de las compañías.");
    } catch (err) {
      const msg = err?.message || "Error desconocido.";
      setError(
        msg.toLowerCase().includes("failed to fetch")
          ? "No hay conexión con el servidor."
          : msg
      );
    } finally {
      setLoading(false);
    }
  }, [checkingSession, canView]);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  useEffect(
    () => () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    },
    [logoPreview]
  );

  function newCliente() {
    if (!canCreate)
      return showToast("No tienes permiso para crear compañías", "warning");
    setForm({ codigo: "", nombre: "", descripcion: "", estatus: "Activo" });
    setLogoFile(null);
    setLogoPreview(null);
    setOpen(true);
  }

  function onLogoChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\//.test(f.type)) return showToast("Solo imágenes", "warning");
    if (f.size > 2 * 1024 * 1024) return showToast("Máx 2MB", "warning");
    setLogoFile(f);
    setLogoPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!canCreate)
      return showToast("No tienes permiso para crear compañías", "warning");
    if (!form.codigo.trim())
      return showToast("El código es requerido", "warning");
    if (!form.nombre.trim())
      return showToast("El nombre es requerido", "warning");

    setSaving(true);
    try {
      await createCliente(form, logoFile);
      showToast("Cliente creado correctamente", "success");
      setOpen(false);
      loadClientes();
    } catch (err) {
      showToast(err?.message || "Error al crear cliente", "danger");
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    const src = Array.isArray(rows) ? rows : [];
    return src.filter(
      (r) =>
        (r.codigo || "").toLowerCase().includes(search.toLowerCase()) ||
        (r.nombre || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [rows, search]);

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

  const handleSort = (key) => {
    if (key === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // ✅ Estado de vista usando tu helper
  const viewState = getViewState({
    checkingSession,
    canView,
    error,
    loading,
    hasData: Array.isArray(sortedRows) && sortedRows.length > 0,
  });

  // --- UI ---
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
      }}>
      <Box sx={{ width: "100%" }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1}
          mb={2}>
          <Typography level="h4">Clientes</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Input
              placeholder="Buscar por código o nombre…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Tooltip
              title={
                canCreate
                  ? "Crear cliente"
                  : "No tienes permiso para crear. Solicítalo al administrador."
              }
              variant="solid"
              placement="right-end">
              <span>
                <Button
                  startDecorator={<AddRoundedIcon />}
                  onClick={newCliente}
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

        <Card variant="outlined" sx={{ overflowX: "auto", width: "100%" }}>
          {/* ✅ Estado reutilizable */}
          {viewState !== "data" ? (
            <Box p={2}>
              <ResourceState
                state={viewState}
                error={error}
                onRetry={loadClientes}
                emptyTitle="Sin clientes"
                emptyDescription="Aún no hay compañías registradas."
              />
            </Box>
          ) : isMobile ? (
            // ---- MÓVIL: tarjetas (solo ver detalle) ----
            <Stack spacing={2} p={2}>
              {sortedRows.map((r) => (
                <Sheet
                  key={r.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: "md" }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        src={r.logo_url || undefined}
                        sx={{ "--Avatar-size": "40px" }}>
                        {r.nombre?.[0] || "C"}
                      </Avatar>
                      <Box>
                        <Typography level="title-md">{r.nombre}</Typography>
                        <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                          {r.codigo}
                        </Typography>
                      </Box>
                    </Stack>

                    {r.descripcion && (
                      <Typography level="body-sm" sx={{ mt: 0.5 }}>
                        {r.descripcion}
                      </Typography>
                    )}

                    <Chip
                      size="sm"
                      variant="soft"
                      color={r.estatus === "Activo" ? "success" : "neutral"}
                      sx={{ alignSelf: "flex-start", mt: 0.5 }}>
                      {r.estatus}
                    </Chip>

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="sm"
                        variant="plain"
                        component={Link}
                        to={`/admin/clientes/${r.id}/informacion`}>
                        Ver detalle
                      </Button>
                    </Stack>
                  </Stack>
                </Sheet>
              ))}
            </Stack>
          ) : (
            // ---- ESCRITORIO: tabla (sin columna de acciones) ----
            <Table size="sm" stickyHeader hoverRow sx={{ minWidth: 800 }}>
              <thead>
                <tr>
                  {[
                    { label: "Código", key: "codigo" },
                    { label: "Nombre", key: "nombre" },
                    { label: "Descripción", key: "descripcion" },
                    { label: "Estatus", key: "estatus" },
                    { label: "Logo", key: null },
                  ].map((col) => (
                    <th key={col.label}>
                      {col.key ? (
                        <Button
                          variant="plain"
                          size="sm"
                          onClick={() => handleSort(col.key)}
                          endDecorator={<ArrowDropDownIcon />}>
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
                {sortedRows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Typography
                        component={Link}
                        to={`/admin/clientes/${r.id}/informacion`}
                        sx={{
                          textDecoration: "none",
                          color: "primary.plainColor",
                          cursor: "pointer",
                        }}>
                        {r.codigo}
                      </Typography>
                    </td>
                    <td>
                      <Typography
                        component={Link}
                        to={`/admin/clientes/${r.id}/informacion`}
                        sx={{
                          textDecoration: "none",
                          color: "primary.plainColor",
                          cursor: "pointer",
                        }}>
                        {r.nombre}
                      </Typography>
                    </td>
                    <td>{r.descripcion || "—"}</td>
                    <td>
                      <Typography
                        level="body-sm"
                        color={r.estatus === "Activo" ? "success" : "danger"}>
                        {r.estatus}
                      </Typography>
                    </td>
                    <td>
                      {r.logo_url ? (
                        <Avatar
                          src={r.logo_url}
                          sx={{ "--Avatar-size": "32px" }}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        {/* Modal crear (solo si puede crear) */}
        {open && canCreate && (
          <Modal open={open} onClose={() => setOpen(false)}>
            <ModalDialog
              component="form"
              onSubmit={onSubmit}
              sx={{ width: { xs: "100%", sm: 520 } }}>
              <Typography level="title-lg">Nuevo Cliente</Typography>
              <Divider />
              <Stack spacing={1.5} mt={1}>
                <FormControl required>
                  <FormLabel>Código</FormLabel>
                  <Input
                    disabled={saving}
                    value={form.codigo}
                    onChange={(e) =>
                      setForm({ ...form, codigo: e.target.value })
                    }
                  />
                </FormControl>
                <FormControl required>
                  <FormLabel>Nombre</FormLabel>
                  <Input
                    disabled={saving}
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
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
                <FormControl required>
                  <FormLabel>Estatus</FormLabel>
                  <Select
                    disabled={saving}
                    value={form.estatus}
                    onChange={(_, v) => setForm({ ...form, estatus: v })}>
                    {ESTATUS.map((s) => (
                      <Option key={s} value={s}>
                        {s}
                      </Option>
                    ))}
                  </Select>
                </FormControl>

                <Divider />
                <Typography level="title-sm">Logo del cliente</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={logoPreview || undefined}
                    sx={{ "--Avatar-size": "72px" }}>
                    LOGO
                  </Avatar>
                  <Stack direction="row" spacing={1}>
                    <Button
                      component="label"
                      variant="outlined"
                      disabled={saving}>
                      Subir logo
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={onLogoChange}
                      />
                    </Button>
                    {logoPreview && (
                      <Button
                        variant="plain"
                        color="neutral"
                        startDecorator={<DeleteOutlineIcon />}
                        disabled={saving}
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(null);
                        }}>
                        Quitar
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Stack>

              <Stack
                direction="row"
                justifyContent="flex-end"
                spacing={1}
                mt={2}>
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
        )}
      </Box>
    </Sheet>
  );
}
