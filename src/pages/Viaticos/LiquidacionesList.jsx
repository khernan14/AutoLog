import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import SummarizeRoundedIcon from "@mui/icons-material/SummarizeRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import { listLiquidaciones } from "../../services/viaticos.service"; // 👈 singular

const colorEstado = (estado) => {
  switch (estado) {
    case "Abierta":
      return "warning";
    case "Cerrada":
      return "success";
    default:
      return "neutral";
  }
};

const fmt = (n) => Number(n || 0).toFixed(2);

export default function LiquidacionesList() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();

  // Filtros con querystring (estado, solicitud_id)
  const [filters, setFilters] = useState({
    estado: sp.get("estado") || "",
    solicitud_id: sp.get("solicitud_id") || "",
  });

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const qs = useMemo(() => {
    const obj = {};
    if (filters.estado) obj.estado = filters.estado;
    if (filters.solicitud_id) obj.solicitud_id = filters.solicitud_id;
    return obj;
  }, [filters]);

  const applyQueryString = (obj) => {
    const next = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).trim() !== "") {
        next.set(k, String(v).trim());
      }
    });
    setSp(next, { replace: true });
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await listLiquidaciones(qs);
      setRows(Array.isArray(data) ? data : []);
      applyQueryString(qs);
    } catch (e) {
      console.error(e);
      alert(e.message || "Error al listar liquidaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // carga inicial

  const limpiar = () => {
    setFilters({ estado: "", solicitud_id: "" });
    setTimeout(() => load(), 0);
  };

  return (
    <Stack spacing={2}>
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "xl" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <SummarizeRoundedIcon />
            <Typography level="h4">Liquidaciones</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="neutral"
              startDecorator={<RefreshRoundedIcon />}
              onClick={load}>
              Refrescar
            </Button>
            <Button
              color="primary"
              startDecorator={<SearchRoundedIcon />}
              onClick={load}>
              Buscar
            </Button>
          </Stack>
        </Stack>

        {/* Filtros */}
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
            sx={{ minWidth: 180 }}>
            <Option value="">Todos</Option>
            <Option value="Abierta">Abierta</Option>
            <Option value="Cerrada">Cerrada</Option>
          </Select>

          <Input
            type="number"
            placeholder="Solicitud ID"
            value={filters.solicitud_id}
            onChange={(e) =>
              setFilters((f) => ({ ...f, solicitud_id: e.target.value }))
            }
            sx={{ minWidth: 180 }}
          />

          <Stack direction="row" spacing={1} sx={{ ml: { sm: "auto" } }}>
            <Button variant="outlined" color="neutral" onClick={limpiar}>
              Limpiar
            </Button>
            <Button loading={loading} onClick={load}>
              Aplicar
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
              <th>Solicitud</th>
              <th>Supervisor</th>
              <th>Viajero</th>
              <th>Periodo</th>
              <th>Asignado</th>
              <th>Gastado</th>
              <th>Diferencia</th>
              <th>Estado</th>
              <th style={{ width: 170 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const periodo =
                r.fecha_salida && r.fecha_regreso
                  ? `${new Date(
                      r.fecha_salida
                    ).toLocaleDateString()} - ${new Date(
                      r.fecha_regreso
                    ).toLocaleDateString()}`
                  : "-";
              const diff = Number(r.diferencia || 0);
              const diffColor =
                diff > 0 ? "success" : diff < 0 ? "danger" : "neutral";

              return (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="plain"
                      onClick={() => nav(`/admin/viaticos/${r.solicitud_id}`)}
                      endDecorator={<NorthEastRoundedIcon fontSize="sm" />}>
                      #{r.solicitud_id}
                    </Button>
                  </td>
                  <td>{r.supervisor || "-"}</td>
                  <td>{r.viajero || "-"}</td>
                  <td>{periodo}</td>
                  <td>
                    {fmt(r.total_asignado)} {r.moneda || "HNL"}
                  </td>
                  <td>
                    {fmt(r.total_gastado)} {r.moneda || "HNL"}
                  </td>
                  <td>
                    <Chip size="sm" color={diffColor} variant="soft">
                      {fmt(diff)} {r.moneda || "HNL"}
                    </Chip>
                  </td>
                  <td>
                    <Chip size="sm" color={colorEstado(r.estado)}>
                      {r.estado}
                    </Chip>
                  </td>
                  <td>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="sm"
                        onClick={() =>
                          nav(`/admin/viaticos/liquidaciones/${r.id}`)
                        }>
                        Ver
                      </Button>
                    </Box>
                  </td>
                </tr>
              );
            })}

            {!rows.length && (
              <tr>
                <td colSpan={10}>
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
