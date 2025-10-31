import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Sheet,
  Typography,
  Stack,
  Button,
  Table,
  Chip,
  Divider,
  Modal,
  ModalDialog,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Option,
  Grid,
} from "@mui/joy";
import {
  getSolicitudById,
  enviarSolicitud,
  aprobarSolicitud,
  crearLiquidacion,
  updateItem,
  deleteItem,
  updateSolicitud,
  getCiudades,
} from "../../services/viaticos.service";
import { getEmpleados } from "../../services/AuthServices";

const EstadoChip = ({ estado }) => (
  <Chip
    size="sm"
    color={
      estado === "Borrador"
        ? "neutral"
        : estado === "Enviado"
        ? "warning"
        : estado === "Aprobado"
        ? "success"
        : estado === "Rechazado"
        ? "danger"
        : "neutral"
    }>
    {estado}
  </Chip>
);

export default function ViaticoDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // modales aprobar/rechazar
  const [openAprobar, setOpenAprobar] = useState(false);
  const [openRechazar, setOpenRechazar] = useState(false);
  const [montoAutorizado, setMontoAutorizado] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");

  // modal editar item
  const [openEditItem, setOpenEditItem] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editItemForm, setEditItemForm] = useState({
    cantidad: "",
    monto_unitario: "",
    subtipo: "",
    nota: "",
    fecha: "",
  });

  // modal editar encabezado
  const [openEditHeader, setOpenEditHeader] = useState(false);
  const [headerForm, setHeaderForm] = useState({
    empleado_id: "",
    fecha_salida: "",
    fecha_regreso: "",
    moneda: "HNL",
    motivo: "",
    origen_ciudad_id: "",
    destino_ciudad_id: "",
  });
  const [empleados, setEmpleados] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const d = await getSolicitudById(id);
      setData(d);
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al cargar solicitud");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [id]);

  useEffect(() => {
    // precargar catálogos para el modal de encabezado
    (async () => {
      try {
        const [eData, cData] = await Promise.all([
          getEmpleados(),
          getCiudades(),
        ]);
        const emp = (Array.isArray(eData) ? eData : [])
          .map((e) => ({
            id: Number(e.id || e.id_empleado || e.empleado_id),
            nombre:
              e.nombre ||
              `${e.nombres ?? ""} ${e.apellidos ?? ""}`.trim() ||
              "Empleado",
          }))
          .filter((x) => Number.isFinite(x.id));
        setEmpleados(emp);
        setCiudades(
          (Array.isArray(cData) ? cData : []).map((c) => ({
            id: c.id,
            nombre: c.nombre,
          }))
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const onEnviar = async () => {
    if (!window.confirm("¿Enviar esta solicitud para aprobación?")) return;
    try {
      await enviarSolicitud(id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const onAprobar = async () => {
    try {
      await aprobarSolicitud(id, {
        aprobar: true,
        monto_autorizado: Number(montoAutorizado || 0),
      });
      setOpenAprobar(false);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const onRechazar = async () => {
    try {
      await aprobarSolicitud(id, { aprobar: false, motivo: motivoRechazo });
      setOpenRechazar(false);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const onCrearLiquidacion = async () => {
    try {
      await crearLiquidacion(Number(id));
      alert("Liquidación creada");
    } catch (e) {
      alert(e.message);
    }
  };

  const openEdit = (it) => {
    setEditItem(it);
    setEditItemForm({
      cantidad: it.cantidad,
      monto_unitario: it.monto_unitario,
      subtipo: it.subtipo || "",
      nota: it.nota || "",
      fecha: it.fecha ? it.fecha.slice(0, 10) : "",
    });
    setOpenEditItem(true);
  };

  const saveEditItem = async () => {
    if (!editItem) return;
    try {
      await updateItem(editItem.id, {
        cantidad: Number(editItemForm.cantidad),
        monto_unitario: Number(editItemForm.monto_unitario),
        subtipo: editItemForm.subtipo || null,
        nota: editItemForm.nota || null,
        fecha: editItemForm.fecha || null,
      });
      setOpenEditItem(false);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const removeItem = async (it) => {
    if (!window.confirm("¿Eliminar ítem?")) return;
    try {
      await deleteItem(it.id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const openHeader = () => {
    const s = data?.solicitud;
    if (!s) return;
    setHeaderForm({
      empleado_id: s.empleado_id || "",
      fecha_salida: s.fecha_salida ? s.fecha_salida.slice(0, 16) : "",
      fecha_regreso: s.fecha_regreso ? s.fecha_regreso.slice(0, 16) : "",
      moneda: s.moneda || "HNL",
      motivo: s.comentarios || "",
      origen_ciudad_id: s.origen_ciudad_id || "",
      destino_ciudad_id: s.destino_ciudad_id || "",
    });
    setOpenEditHeader(true);
  };

  const saveHeader = async () => {
    try {
      const payload = {
        motivo: headerForm.motivo,
        fecha_salida: headerForm.fecha_salida,
        fecha_regreso: headerForm.fecha_regreso,
        moneda: headerForm.moneda,
        empleado_id: headerForm.empleado_id
          ? Number(headerForm.empleado_id)
          : undefined,
        origen_ciudad_id: headerForm.origen_ciudad_id
          ? Number(headerForm.origen_ciudad_id)
          : undefined,
        destino_ciudad_id: headerForm.destino_ciudad_id
          ? Number(headerForm.destino_ciudad_id)
          : undefined,
      };
      await updateSolicitud(id, payload);
      setOpenEditHeader(false);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const sol = data?.solicitud;
  const items = data?.items || [];

  return (
    <Stack spacing={2}>
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between">
          <Typography level="h4">Solicitud #{id}</Typography>
          <EstadoChip estado={sol?.estado || ""} />
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        {sol && (
          <>
            <Typography level="body-sm">
              <b>Supervisor:</b> {sol.supervisor} — <b>Viajero:</b>{" "}
              {sol.viajero}
            </Typography>
            <Typography level="body-sm" sx={{ mt: 0.5 }}>
              <b>Periodo:</b> {new Date(sol.fecha_salida).toLocaleString()} —{" "}
              {new Date(sol.fecha_regreso).toLocaleString()}
            </Typography>
            {sol.comentarios && (
              <Typography level="body-sm" sx={{ mt: 0.5 }}>
                <b>Motivo:</b> {sol.comentarios}
              </Typography>
            )}
            <Typography level="body-sm" sx={{ mt: 0.5 }}>
              <b>Total estimado:</b>{" "}
              {Number(sol.total_estimado || 0).toFixed(2)} {sol.moneda}
            </Typography>
          </>
        )}
      </Sheet>

      <Sheet
        variant="outlined"
        sx={{ p: 0, borderRadius: "xl", overflow: "hidden" }}>
        <Table stickyHeader hoverRow>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Subtipo</th>
              <th>Fecha</th>
              <th>Cantidad</th>
              <th>Unitario</th>
              <th>Importe</th>
              <th>Nota</th>
              <th style={{ width: 160 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.tipo}</td>
                <td>{it.subtipo || "-"}</td>
                <td>
                  {it.fecha ? new Date(it.fecha).toLocaleDateString() : "-"}
                </td>
                <td>{it.cantidad}</td>
                <td>{Number(it.monto_unitario).toFixed(2)}</td>
                <td>
                  <b>{Number(it.importe).toFixed(2)}</b>
                </td>
                <td>{it.nota || "-"}</td>
                <td>
                  {sol?.estado === "Borrador" && it.es_editable === 1 ? (
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        size="sm"
                        variant="outlined"
                        onClick={() => openEdit(it)}>
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="outlined"
                        onClick={() => removeItem(it)}>
                        Eliminar
                      </Button>
                    </Stack>
                  ) : null}
                </td>
              </tr>
            ))}
            {!items.length && (
              <tr>
                <td colSpan={8}>
                  <Typography level="body-sm" sx={{ p: 2 }}>
                    Sin ítems
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Sheet>

      <Stack direction="row" spacing={1}>
        <Button variant="outlined" color="neutral" onClick={() => nav(-1)}>
          Volver
        </Button>
        {sol?.estado === "Borrador" && (
          <>
            <Button variant="outlined" onClick={openHeader}>
              Editar encabezado
            </Button>
            <Button onClick={onEnviar}>Enviar</Button>
          </>
        )}
        {sol?.estado === "Enviado" && (
          <>
            <Button color="success" onClick={() => setOpenAprobar(true)}>
              Aprobar
            </Button>
            <Button
              color="danger"
              variant="outlined"
              onClick={() => setOpenRechazar(true)}>
              Rechazar
            </Button>
          </>
        )}
        {sol?.estado === "Aprobado" && (
          <Button onClick={onCrearLiquidacion}>
            Crear liquidación (manual)
          </Button>
        )}
      </Stack>

      {/* Modal Aprobar */}
      <Modal open={openAprobar} onClose={() => setOpenAprobar(false)}>
        <ModalDialog>
          <Typography level="title-lg">Aprobar solicitud</Typography>
          <Divider sx={{ my: 1 }} />
          <FormControl>
            <FormLabel>Monto autorizado</FormLabel>
            <Input
              type="number"
              value={montoAutorizado}
              onChange={(e) => setMontoAutorizado(e.target.value)}
              slotProps={{ input: { min: 0, step: "0.01" } }}
            />
          </FormControl>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => setOpenAprobar(false)}>
              Cancelar
            </Button>
            <Button color="success" onClick={onAprobar}>
              Aprobar
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* Modal Rechazar */}
      <Modal open={openRechazar} onClose={() => setOpenRechazar(false)}>
        <ModalDialog>
          <Typography level="title-lg">Rechazar solicitud</Typography>
          <Divider sx={{ my: 1 }} />
          <FormControl>
            <FormLabel>Motivo</FormLabel>
            <Textarea
              minRows={3}
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
            />
          </FormControl>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => setOpenRechazar(false)}>
              Cancelar
            </Button>
            <Button color="danger" onClick={onRechazar}>
              Rechazar
            </Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* Modal Editar Ítem */}
      <Modal open={openEditItem} onClose={() => setOpenEditItem(false)}>
        <ModalDialog>
          <Typography level="title-lg">Editar ítem</Typography>
          <Divider sx={{ my: 1 }} />
          <Grid container spacing={1}>
            <Grid xs={6}>
              <FormControl>
                <FormLabel>Cantidad</FormLabel>
                <Input
                  type="number"
                  value={editItemForm.cantidad}
                  onChange={(e) =>
                    setEditItemForm((f) => ({ ...f, cantidad: e.target.value }))
                  }
                />
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <FormControl>
                <FormLabel>Monto unitario</FormLabel>
                <Input
                  type="number"
                  value={editItemForm.monto_unitario}
                  onChange={(e) =>
                    setEditItemForm((f) => ({
                      ...f,
                      monto_unitario: e.target.value,
                    }))
                  }
                />
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <FormControl>
                <FormLabel>Fecha</FormLabel>
                <Input
                  type="date"
                  value={editItemForm.fecha}
                  onChange={(e) =>
                    setEditItemForm((f) => ({ ...f, fecha: e.target.value }))
                  }
                />
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <FormControl>
                <FormLabel>Subtipo</FormLabel>
                <Input
                  value={editItemForm.subtipo}
                  onChange={(e) =>
                    setEditItemForm((f) => ({ ...f, subtipo: e.target.value }))
                  }
                />
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <FormControl>
                <FormLabel>Nota</FormLabel>
                <Input
                  value={editItemForm.nota}
                  onChange={(e) =>
                    setEditItemForm((f) => ({ ...f, nota: e.target.value }))
                  }
                />
              </FormControl>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => setOpenEditItem(false)}>
              Cancelar
            </Button>
            <Button onClick={saveEditItem}>Guardar</Button>
          </Stack>
        </ModalDialog>
      </Modal>

      {/* Modal Editar Encabezado */}
      <Modal open={openEditHeader} onClose={() => setOpenEditHeader(false)}>
        <ModalDialog>
          <Typography level="title-lg">Editar encabezado</Typography>
          <Divider sx={{ my: 1 }} />
          <Grid container spacing={1}>
            <Grid xs={12}>
              <FormControl>
                <FormLabel>Empleado</FormLabel>
                <Select
                  value={headerForm.empleado_id || null}
                  onChange={(_e, v) =>
                    setHeaderForm((f) => ({ ...f, empleado_id: v || "" }))
                  }>
                  {empleados.map((e) => (
                    <Option key={e.id} value={e.id}>
                      {e.nombre}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <FormControl>
                <FormLabel>Origen</FormLabel>
                <Select
                  value={headerForm.origen_ciudad_id || null}
                  onChange={(_e, v) =>
                    setHeaderForm((f) => ({ ...f, origen_ciudad_id: v || "" }))
                  }>
                  {ciudades.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.nombre}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <FormControl>
                <FormLabel>Destino</FormLabel>
                <Select
                  value={headerForm.destino_ciudad_id || null}
                  onChange={(_e, v) =>
                    setHeaderForm((f) => ({ ...f, destino_ciudad_id: v || "" }))
                  }>
                  {ciudades.map((c) => (
                    <Option key={c.id} value={c.id}>
                      {c.nombre}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <FormControl>
                <FormLabel>Fecha salida</FormLabel>
                <Input
                  type="datetime-local"
                  value={headerForm.fecha_salida}
                  onChange={(e) =>
                    setHeaderForm((f) => ({
                      ...f,
                      fecha_salida: e.target.value,
                    }))
                  }
                />
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <FormControl>
                <FormLabel>Fecha regreso</FormLabel>
                <Input
                  type="datetime-local"
                  value={headerForm.fecha_regreso}
                  onChange={(e) =>
                    setHeaderForm((f) => ({
                      ...f,
                      fecha_regreso: e.target.value,
                    }))
                  }
                />
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <FormControl>
                <FormLabel>Moneda</FormLabel>
                <Select
                  value={headerForm.moneda}
                  onChange={(_e, v) =>
                    setHeaderForm((f) => ({ ...f, moneda: v }))
                  }>
                  <Option value="HNL">HNL</Option>
                  <Option value="USD">USD</Option>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <FormControl>
                <FormLabel>Motivo / Ticket</FormLabel>
                <Input
                  value={headerForm.motivo}
                  onChange={(e) =>
                    setHeaderForm((f) => ({ ...f, motivo: e.target.value }))
                  }
                />
              </FormControl>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={() => setOpenEditHeader(false)}>
              Cancelar
            </Button>
            <Button onClick={saveHeader}>Guardar</Button>
          </Stack>
        </ModalDialog>
      </Modal>
    </Stack>
  );
}
