import { useEffect, useState } from "react";
import {
  getSites,
  createSite,
  updateSite,
  getSitesByCliente,
} from "../../services/SitesServices";
import { getClientes } from "../../services/ClientesServices";
import { getCities } from "../../services/LocationServices";
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
  IconButton,
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { useToast } from "../../context/ToastContext";

export default function SitesList() {
  const [rows, setRows] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    id_cliente: "",
    nombre: "",
    descripcion: "",
    id_ciudad: "",
  });

  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    load();
  }, []);
  async function load() {
    setLoading(true);
    try {
      const [sitesData, clientesData, ciudadesData] = await Promise.all([
        getSites(),
        getClientes(),
        getCities(),
      ]);
      setRows(sitesData);
      setClientes(clientesData);
      setCiudades(ciudadesData);
      setError(null);
    } catch (err) {
      setError(
        err.message.includes("Failed to fetch")
          ? "No hay conexión con el servidor."
          : "No se pudieron cargar los datos."
      );
    } finally {
      setLoading(false);
    }
  }

  function newSite() {
    setEditing(null);
    setForm({ id_cliente: "", nombre: "", descripcion: "", id_ciudad: "" });
    setOpen(true);
  }

  async function editSite(row) {
    try {
      const full = await getSitesByCliente(row.id);
      setEditing(full);
      setForm({
        id_cliente: full.id_cliente || "",
        nombre: full.nombre,
        descripcion: full.descripcion || "",
        id_ciudad: full.id_ciudad || "",
      });
      setOpen(true);
    } catch (err) {
      showToast("Error al cargar site", "danger");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();

    if (!form.id_cliente) return showToast("Seleccione un cliente", "warning");
    if (!form.nombre.trim())
      return showToast("El nombre es requerido", "warning");

    setSaving(true);
    try {
      if (editing) {
        await updateSite(editing.id, form);
      } else {
        await createSite(form);
      }
      showToast("Site guardado correctamente", "success");
      setOpen(false);
      load();
    } catch (err) {
      showToast(err.message || "Error al guardar site", "danger");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Box p={2}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        spacing={1}>
        <Typography level="h4">Sites</Typography>
        <Button startDecorator={<AddIcon />} onClick={newSite}>
          Nuevo
        </Button>
      </Stack>

      <Card variant="outlined" sx={{ overflowX: "auto" }}>
        {loading ? (
          <Sheet p={2}>Cargando…</Sheet>
        ) : error ? (
          <Card
            variant="soft"
            color="danger"
            sx={{ p: 3, textAlign: "center" }}>
            <Typography level="title-md">{error}</Typography>
            <Button sx={{ mt: 2 }} onClick={load}>
              Reintentar
            </Button>
          </Card>
        ) : rows.length === 0 ? (
          <Sheet p={2} variant="soft">
            Sin sites
          </Sheet>
        ) : (
          <Table size="sm" stickyHeader>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Ciudad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.cliente || "—"}</td>
                  <td>{r.nombre}</td>
                  <td>{r.descripcion || "—"}</td>
                  <td>{r.ciudad || "—"}</td>
                  <td>
                    <IconButton onClick={() => editSite(r)}>
                      <EditIcon />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog
          component="form"
          onSubmit={onSubmit}
          sx={{ width: { xs: "100%", sm: 520 } }}>
          <Typography level="title-lg">
            {editing ? "Editar" : "Nuevo"} Site
          </Typography>
          <Divider />
          <Stack spacing={1.5} mt={1}>
            <FormControl required>
              <FormLabel>Cliente</FormLabel>
              <Select
                disabled={saving}
                value={form.id_cliente}
                onChange={(_, v) => setForm({ ...form, id_cliente: v })}>
                {clientes.map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.nombre}
                  </Option>
                ))}
              </Select>
            </FormControl>
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
                value={form.id_ciudad ? String(form.id_ciudad) : ""}
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
