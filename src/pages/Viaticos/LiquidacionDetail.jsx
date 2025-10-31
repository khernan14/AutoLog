import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Sheet,
  Typography,
  Stack,
  Button,
  Table,
  Grid,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Card,
  CardContent,
  Divider,
} from "@mui/joy";
import {
  cerrarLiquidacion,
  agregarComprobantes,
  getLiquidacionById,
} from "../../services/viaticos.service";

export default function LiquidacionDetail() {
  const { id: idParam } = useParams();
  const liqId = useMemo(() => Number(idParam), [idParam]); // 👈 num seguro
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const [form, setForm] = useState({
    tipo: "Desayuno",
    subtipo: "",
    fecha: "",
    proveedor: "",
    num_factura: "",
    monto: "",
    moneda: "HNL",
    observaciones: "",
  });

  const load = async () => {
    if (!Number.isInteger(liqId) || liqId <= 0) return; // evita error
    setLoading(true);
    try {
      const d = await getLiquidacionById(liqId);
      setData(d);
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [liqId]);

  const onAdd = async () => {
    if (!form.tipo || !form.fecha || !form.monto)
      return alert("tipo/fecha/monto requeridos");
    if (!Number.isInteger(liqId) || liqId <= 0)
      return alert("ID de liquidación inválido");
    try {
      await agregarComprobantes({
        liquidacion_id: liqId,
        ...form,
        monto: Number(form.monto),
        subtipo: form.subtipo || undefined,
        proveedor: form.proveedor || undefined,
        num_factura: form.num_factura || undefined,
        observaciones: form.observaciones || undefined,
      });
      setForm((f) => ({
        ...f,
        monto: "",
        proveedor: "",
        num_factura: "",
        observaciones: "",
      }));
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const onCerrar = async () => {
    if (!Number.isInteger(liqId) || liqId <= 0)
      return alert("ID de liquidación inválido");
    if (!window.confirm("¿Cerrar liquidación? Ya no podrás editar.")) return;
    try {
      const resp = await cerrarLiquidacion(liqId);
      alert(resp?.message || "Liquidación cerrada");
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const liq = data?.liquidacion;
  const comps = data?.comprobantes || [];

  return (
    <Stack spacing={2}>
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl" }}>
        <Typography level="h4">Liquidación #{id}</Typography>
        {liq && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Typography level="body-sm">
              <b>Asignado:</b> {Number(liq.total_asignado || 0).toFixed(2)} —{" "}
              <b>Gastado:</b> {Number(liq.total_gastado || 0).toFixed(2)} —{" "}
              <b>Diferencia:</b> {Number(liq.diferencia || 0).toFixed(2)}
            </Typography>
            <Typography level="body-sm" sx={{ mt: 0.5 }}>
              <b>Estado:</b> {liq.estado}
            </Typography>
          </>
        )}
      </Sheet>

      <Grid container spacing={2}>
        <Grid xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography level="title-lg">Agregar comprobante</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Grid container spacing={1}>
                <Grid xs={12} md={6}>
                  <FormControl>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      value={form.tipo}
                      onChange={(_e, v) => setForm((f) => ({ ...f, tipo: v }))}>
                      {[
                        "Desayuno",
                        "Almuerzo",
                        "Cena",
                        "Hospedaje",
                        "Gasolina",
                        "Peaje",
                        "Movilizacion",
                        "Imprevisto",
                        "Otro",
                      ].map((t) => (
                        <Option key={t} value={t}>
                          {t}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl>
                    <FormLabel>Subtipo (opcional)</FormLabel>
                    <Input
                      value={form.subtipo}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, subtipo: e.target.value }))
                      }
                      placeholder="Ej. Yojoa ida, Parqueo..."
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl>
                    <FormLabel>Fecha</FormLabel>
                    <Input
                      type="date"
                      value={form.fecha}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, fecha: e.target.value }))
                      }
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl>
                    <FormLabel>Monto</FormLabel>
                    <Input
                      type="number"
                      value={form.monto}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, monto: e.target.value }))
                      }
                      slotProps={{ input: { min: 0, step: "0.01" } }}
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl>
                    <FormLabel>Moneda</FormLabel>
                    <Select
                      value={form.moneda}
                      onChange={(_e, v) =>
                        setForm((f) => ({ ...f, moneda: v }))
                      }>
                      <Option value="HNL">HNL</Option>
                      <Option value="USD">USD</Option>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl>
                    <FormLabel>Proveedor</FormLabel>
                    <Input
                      value={form.proveedor}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, proveedor: e.target.value }))
                      }
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl>
                    <FormLabel># Factura</FormLabel>
                    <Input
                      value={form.num_factura}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, num_factura: e.target.value }))
                      }
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12}>
                  <FormControl>
                    <FormLabel>Observaciones</FormLabel>
                    <Input
                      value={form.observaciones}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          observaciones: e.target.value,
                        }))
                      }
                    />
                  </FormControl>
                </Grid>
              </Grid>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button onClick={onAdd}>Agregar</Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography level="title-lg">Comprobantes</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Sheet
                variant="soft"
                sx={{ p: 0, borderRadius: "md", overflow: "hidden" }}>
                <Table stickyHeader hoverRow size="sm">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th>Subtipo</th>
                      <th>Monto</th>
                      <th>Mon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comps.map((c) => (
                      <tr key={c.id}>
                        <td>{new Date(c.fecha).toLocaleDateString()}</td>
                        <td>{c.tipo}</td>
                        <td>{c.subtipo || "-"}</td>
                        <td>{Number(c.monto).toFixed(2)}</td>
                        <td>{c.moneda}</td>
                      </tr>
                    ))}
                    {!comps.length && (
                      <tr>
                        <td colSpan={5}>
                          <Typography level="body-sm" sx={{ p: 2 }}>
                            Sin comprobantes
                          </Typography>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Sheet>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button color="primary" onClick={onCerrar}>
                  Cerrar liquidación
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}
