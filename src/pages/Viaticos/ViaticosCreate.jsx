import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  Typography,
  Stack,
  Grid,
  Input,
  Select,
  Option,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormLabel,
  Checkbox,
  Switch,
} from "@mui/joy";
import {
  crearSolicitud,
  buildOpciones,
  getCiudades,
} from "../../services/viaticos.service";
import { getEmpleados } from "../../services/AuthServices";

export default function ViaticoCreate() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ciudades, setCiudades] = useState([]);
  const [empleados, setEmpleados] = useState([]);

  const [form, setForm] = useState({
    empleado_id: "",
    origen_ciudad_id: "",
    destino_ciudad_id: "",
    fecha_salida: "",
    fecha_regreso: "",
    moneda: "HNL",
    motivo: "",
  });

  const [comidas, setComidas] = useState({
    desayuno: { aplica: false, dias: 0 },
    almuerzo: { aplica: false, dias: 0 },
    cena: { aplica: false, dias: 0 },
  });
  const [hotel, setHotel] = useState({
    aplica: false,
    categoria: "Normal",
    noches: 0,
  });
  const [peajes, setPeajes] = useState({
    yojoa: { ida: false, regreso: false },
    comayagua: { ida: false, regreso: false },
    siguatepeque: { ida: false, regreso: false },
  });
  const [libres, setLibres] = useState({
    combustible: 0,
    movilizacion: 0,
    imprevistos: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const [cData, eData] = await Promise.all([
          getCiudades(),
          getEmpleados(),
        ]);
        setCiudades(
          (Array.isArray(cData) ? cData : []).map((c) => ({
            id: c.id,
            nombre: c.nombre,
          }))
        );
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
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const opciones = buildOpciones({
        desayunoDias: comidas.desayuno.aplica
          ? Number(comidas.desayuno.dias || 0)
          : 0,
        almuerzoDias: comidas.almuerzo.aplica
          ? Number(comidas.almuerzo.dias || 0)
          : 0,
        cenaDias: comidas.cena.aplica ? Number(comidas.cena.dias || 0) : 0,
        hotel,
        peajes,
        combustible: Number(libres.combustible || 0),
        movilizacion: Number(libres.movilizacion || 0),
        imprevistos: Number(libres.imprevistos || 0),
      });

      const payload = {
        ...form,
        empleado_id: Number(form.empleado_id),
        origen_ciudad_id: Number(form.origen_ciudad_id),
        destino_ciudad_id: Number(form.destino_ciudad_id),
        opciones,
      };

      const resp = await crearSolicitud(payload);
      nav(`/viaticos/${resp.id}`);
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al crear solicitud");
    } finally {
      setLoading(false);
    }
  };

  const numberInput = (val, onVal) => (
    <Input
      type="number"
      value={val}
      onChange={(e) => onVal(e.target.value)}
      slotProps={{ input: { min: 0, step: "0.01" } }}
    />
  );

  return (
    <form onSubmit={onSubmit}>
      <Stack spacing={2}>
        <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl" }}>
          <Typography level="h4">Nueva solicitud</Typography>
        </Sheet>

        <Grid container spacing={2}>
          <Grid xs={12} lg={7}>
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-lg">Datos del viaje</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Grid container spacing={2}>
                  <Grid xs={12} md={6}>
                    <FormControl>
                      <FormLabel>Empleado</FormLabel>
                      <Select
                        placeholder="Selecciona el empleado"
                        value={form.empleado_id || null}
                        onChange={(_e, v) =>
                          setForm((f) => ({ ...f, empleado_id: v || "" }))
                        }
                        required>
                        {empleados.map((emp) => (
                          <Option key={emp.id} value={emp.id}>
                            {emp.nombre}
                          </Option>
                        ))}
                      </Select>
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
                      <FormLabel>Origen</FormLabel>
                      <Select
                        placeholder="Ciudad"
                        value={form.origen_ciudad_id || null}
                        onChange={(_e, v) =>
                          setForm((f) => ({ ...f, origen_ciudad_id: v || "" }))
                        }>
                        {ciudades.map((c) => (
                          <Option key={c.id} value={c.id}>
                            {c.nombre}
                          </Option>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={6}>
                    <FormControl>
                      <FormLabel>Destino</FormLabel>
                      <Select
                        placeholder="Ciudad"
                        value={form.destino_ciudad_id || null}
                        onChange={(_e, v) =>
                          setForm((f) => ({ ...f, destino_ciudad_id: v || "" }))
                        }>
                        {ciudades.map((c) => (
                          <Option key={c.id} value={c.id}>
                            {c.nombre}
                          </Option>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid xs={12} md={6}>
                    <FormControl>
                      <FormLabel>Fecha salida</FormLabel>
                      <Input
                        type="datetime-local"
                        value={form.fecha_salida}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            fecha_salida: e.target.value,
                          }))
                        }
                        required
                      />
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={6}>
                    <FormControl>
                      <FormLabel>Fecha regreso</FormLabel>
                      <Input
                        type="datetime-local"
                        value={form.fecha_regreso}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            fecha_regreso: e.target.value,
                          }))
                        }
                        required
                      />
                    </FormControl>
                  </Grid>

                  <Grid xs={12}>
                    <FormControl>
                      <FormLabel>Motivo / Ticket</FormLabel>
                      <Input
                        placeholder="Ticket #12345 - Mantenimiento..."
                        value={form.motivo}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, motivo: e.target.value }))
                        }
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid xs={12} lg={5}>
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-lg">Opciones</Typography>
                <Divider sx={{ my: 1.5 }} />

                <Typography level="title-md" sx={{ mb: 1 }}>
                  Comidas
                </Typography>
                {["desayuno", "almuerzo", "cena"].map((k) => (
                  <Stack
                    key={k}
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center", mb: 1 }}>
                    <Checkbox
                      label={k[0].toUpperCase() + k.slice(1)}
                      checked={!!comidas[k].aplica}
                      onChange={(e) =>
                        setComidas((c) => ({
                          ...c,
                          [k]: { ...c[k], aplica: e.target.checked },
                        }))
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Días"
                      value={comidas[k].dias}
                      onChange={(e) =>
                        setComidas((c) => ({
                          ...c,
                          [k]: { ...c[k], dias: e.target.value },
                        }))
                      }
                      sx={{ width: 110 }}
                      slotProps={{ input: { min: 0, step: "1" } }}
                    />
                  </Stack>
                ))}

                <Divider sx={{ my: 1.5 }} />

                <Typography level="title-md" sx={{ mb: 1 }}>
                  Hospedaje
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center", mb: 1 }}>
                  <Switch
                    checked={hotel.aplica}
                    onChange={(e) =>
                      setHotel((h) => ({ ...h, aplica: e.target.checked }))
                    }
                  />
                  <Select
                    value={hotel.categoria}
                    onChange={(_e, v) =>
                      setHotel((h) => ({ ...h, categoria: v }))
                    }
                    sx={{ width: 160 }}>
                    <Option value="Normal">Normal</Option>
                    <Option value="Medio">Medio</Option>
                    <Option value="Alto">Alto</Option>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Noches"
                    value={hotel.noches}
                    onChange={(e) =>
                      setHotel((h) => ({ ...h, noches: e.target.value }))
                    }
                    sx={{ width: 120 }}
                    slotProps={{ input: { min: 0, step: "1" } }}
                  />
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Typography level="title-md" sx={{ mb: 1 }}>
                  Peajes (ida/regreso)
                </Typography>
                {[
                  ["yojoa", "Yojoa"],
                  ["comayagua", "Comayagua"],
                  ["siguatepeque", "Siguatepeque"],
                ].map(([key, label]) => (
                  <Stack
                    key={key}
                    direction="row"
                    spacing={2}
                    sx={{ mb: 1, alignItems: "center" }}>
                    <Typography level="body-sm" sx={{ width: 120 }}>
                      {label}
                    </Typography>
                    <Checkbox
                      label="Ida"
                      checked={!!peajes[key].ida}
                      onChange={(e) =>
                        setPeajes((p) => ({
                          ...p,
                          [key]: { ...p[key], ida: e.target.checked },
                        }))
                      }
                    />
                    <Checkbox
                      label="Regreso"
                      checked={!!peajes[key].regreso}
                      onChange={(e) =>
                        setPeajes((p) => ({
                          ...p,
                          [key]: { ...p[key], regreso: e.target.checked },
                        }))
                      }
                    />
                  </Stack>
                ))}

                <Divider sx={{ my: 1.5 }} />

                <Typography level="title-md" sx={{ mb: 1 }}>
                  Montos libres
                </Typography>
                <Grid container spacing={1}>
                  <Grid xs={12} md={4}>
                    <FormControl size="sm">
                      <FormLabel>Combustible</FormLabel>
                      {numberInput(libres.combustible, (v) =>
                        setLibres((s) => ({ ...s, combustible: v }))
                      )}
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4}>
                    <FormControl size="sm">
                      <FormLabel>Movilización</FormLabel>
                      {numberInput(libres.movilizacion, (v) =>
                        setLibres((s) => ({ ...s, movilizacion: v }))
                      )}
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4}>
                    <FormControl size="sm">
                      <FormLabel>Imprevistos</FormLabel>
                      {numberInput(libres.imprevistos, (v) =>
                        setLibres((s) => ({ ...s, imprevistos: v }))
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="neutral"
                onClick={() => nav(-1)}>
                Cancelar
              </Button>
              <Button type="submit" loading={loading}>
                Crear solicitud
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </form>
  );
}
