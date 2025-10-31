import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  Typography,
  Stack,
  Button,
  Select,
  Option,
  Input,
  Table,
  Chip,
  Box,
} from "@mui/joy";
import { listSolicitudes } from "../../services/viaticos.service";

const estadoColor = (estado) => {
  switch (estado) {
    case "Borrador":
      return "neutral";
    case "Enviado":
      return "warning";
    case "Aprobado":
      return "success";
    case "Rechazado":
      return "danger";
    case "Cerrada":
      return "primary";
    default:
      return "neutral";
  }
};

export default function ViaticosList() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({
    estado: "",
    empleado_id: "",
    desde: "",
    hasta: "",
  });

  const qs = useMemo(() => {
    const f = {};
    if (filters.estado) f.estado = filters.estado;
    if (filters.empleado_id) f.empleado_id = filters.empleado_id;
    if (filters.desde) f.desde = filters.desde;
    if (filters.hasta) f.hasta = filters.hasta;
    return f;
  }, [filters]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listSolicitudes(qs);
      setRows(data);
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al listar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);

  return (
    <Stack spacing={2}>
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl" }}>
        <Typography level="h4">Solicitudes de Viáticos</Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 2, alignItems: { sm: "center" } }}>
          <Select
            placeholder="Estado"
            value={filters.estado || null}
            onChange={(_e, val) =>
              setFilters((f) => ({ ...f, estado: val || "" }))
            }
            sx={{ minWidth: 170 }}>
            <Option value="">Todos</Option>
            <Option value="Borrador">Borrador</Option>
            <Option value="Enviado">Enviado</Option>
            <Option value="Aprobado">Aprobado</Option>
            <Option value="Rechazado">Rechazado</Option>
          </Select>
          <Input
            placeholder="Empleado ID"
            value={filters.empleado_id}
            onChange={(e) =>
              setFilters((f) => ({ ...f, empleado_id: e.target.value }))
            }
            sx={{ minWidth: 170 }}
          />
          <Input
            type="date"
            value={filters.desde}
            onChange={(e) =>
              setFilters((f) => ({ ...f, desde: e.target.value }))
            }
          />
          <Input
            type="date"
            value={filters.hasta}
            onChange={(e) =>
              setFilters((f) => ({ ...f, hasta: e.target.value }))
            }
          />
          <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
            <Button
              variant="outlined"
              color="neutral"
              onClick={() => {
                setFilters({
                  estado: "",
                  empleado_id: "",
                  desde: "",
                  hasta: "",
                });
              }}>
              Limpiar
            </Button>
            <Button loading={loading} onClick={load}>
              Buscar
            </Button>
            <Button
              color="primary"
              onClick={() => nav("/admin/viaticos/nuevo")}>
              Nueva solicitud
            </Button>
          </Stack>
        </Stack>
      </Sheet>

      <Sheet
        variant="outlined"
        sx={{ p: 0, borderRadius: "xl", overflow: "hidden" }}>
        <Table hoverRow stickyHeader>
          <thead>
            <tr>
              <th>ID</th>
              <th>Supervisor</th>
              <th>Viajero</th>
              <th>Salida</th>
              <th>Regreso</th>
              <th>Total estimado</th>
              <th>Estado</th>
              <th style={{ width: 160 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>#{r.id}</td>
                <td>{r.supervisor}</td>
                <td>{r.viajero}</td>
                <td>{new Date(r.fecha_salida).toLocaleString()}</td>
                <td>{new Date(r.fecha_regreso).toLocaleString()}</td>
                <td>
                  {Number(r.total_estimado || 0).toFixed(2)} {r.moneda}
                </td>
                <td>
                  <Chip size="sm" color={estadoColor(r.estado)}>
                    {r.estado}
                  </Chip>
                </td>
                <td>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="sm"
                      onClick={() => nav(`/admin/viaticos/${r.id}`)}>
                      Ver
                    </Button>
                  </Box>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={8}>
                  <Typography
                    level="body-sm"
                    sx={{ p: 2, color: "neutral.500" }}>
                    {loading ? "Cargando..." : "Sin resultados"}
                  </Typography>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Sheet>
    </Stack>
  );
}
