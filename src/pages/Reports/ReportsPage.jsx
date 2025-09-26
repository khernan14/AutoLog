// src/pages/Reports/ReportsPage.jsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Sheet,
  Typography,
  Input,
  Chip,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  Divider,
  Tooltip,
} from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";

// 👉 catálogo declarativo de reportes (agrega libremente)
const REPORTS = [
  {
    id: "registros-uso",
    title: "Registros de uso",
    description: "Entradas/Salidas, pendientes y finalizados.",
    icon: <BarChartRoundedIcon />,
    category: "Operación",
    tags: ["vehículos", "registros"],
  },
  {
    id: "vehiculos-uso",
    title: "Vehículos más utilizados",
    description: "Top de uso por periodo.",
    icon: <DirectionsCarRoundedIcon />,
    category: "Operación",
    tags: ["vehículos", "ranking"],
  },
  {
    id: "empleados-actividad",
    title: "Empleados más activos",
    description: "Top de salidas por empleado.",
    icon: <BusinessRoundedIcon />,
    category: "Recursos Humanos",
    tags: ["empleados", "actividad"],
  },
  {
    id: "kilometraje-empleado",
    title: "Kilómetros por empleado",
    description: "Top de kilómetros por empleado.",
    icon: <DirectionsCarRoundedIcon />,
    category: "Operación",
    tags: ["kilometraje", "empleados"],
  },
  {
    id: "ubicacion-vehiculo",
    title: "Registro por ubicación",
    description: "Top de ubicaciones por vehículo.",
    icon: <PlaceRoundedIcon />,
    category: "Operación",
    tags: ["ubicaciones", "vehiculos"],
  },
  {
    id: "consumo-combustible-vehiculo",
    title: "Consumo combustible por vehículo",
    description: "Top de combustible por vehículo.",
    icon: <DirectionsCarRoundedIcon />,
    category: "Operación",
    tags: ["combustible", "vehiculos"],
  },
  // {
  //   id: "activos-general",
  //   title: "Activos (inventario)",
  //   description: "Estado y distribución de activos.",
  //   icon: <Inventory2RoundedIcon />,
  //   category: "Inventario",
  //   tags: ["activos"],
  // },
  // {
  //   id: "bodegas-ocupacion",
  //   title: "Bodegas / ocupación",
  //   description: "Capacidad y ocupación por bodega.",
  //   icon: <WarehouseRoundedIcon />,
  //   category: "Inventario",
  //   tags: ["bodegas", "capacidad"],
  // },
  // {
  //   id: "clientes-sitios",
  //   title: "Clientes / Sites",
  //   description: "Resumen por cliente y sus sites.",
  //   icon: <PlaceRoundedIcon />,
  //   category: "Comercial",
  //   tags: ["clientes", "sites"],
  // },
];

const CATEGORIES = [
  "Todos",
  "Operación",
  "Inventario",
  "Comercial",
  "Recursos Humanos",
];

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function ReportsPage() {
  const qs = useQuery();
  const navigate = useNavigate();

  // estado desde URL (para persistir filtros al refrescar)
  const [query, setQuery] = useState(qs.get("q") || "");
  const [category, setCategory] = useState(qs.get("cat") || "Todos");
  const [tag, setTag] = useState(qs.get("tag") || "");

  // “recientes” (localStorage)
  const [recentIds, setRecentIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recent_reports") || "[]");
    } catch {
      return [];
    }
  });

  // sincroniza URL cuando cambian filtros
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category && category !== "Todos") params.set("cat", category);
    if (tag) params.set("tag", tag);
    const s = params.toString();
    window.history.replaceState(
      null,
      "",
      s ? `/admin/reports?${s}` : "/admin/reports"
    );
  }, [query, category, tag]);

  // filtra catálogo
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REPORTS.filter((r) => {
      const matchQ =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q));
      const matchC = category === "Todos" || r.category === category;
      const matchTag = !tag || r.tags.includes(tag);
      return matchQ && matchC && matchTag;
    });
  }, [query, category, tag]);

  const recentReports = recentIds
    .map((id) => REPORTS.find((r) => r.id === id))
    .filter(Boolean);

  const openReport = (id) => {
    // guarda en recientes (máx 6)
    const next = [id, ...recentIds.filter((x) => x !== id)].slice(0, 6);
    setRecentIds(next);
    localStorage.setItem("recent_reports", JSON.stringify(next));
    // navega sin recargar
    navigate(`/admin/reports?view=${id}`);
  };

  // nube de tags (dinámica)
  const allTags = useMemo(() => {
    const map = new Map();
    REPORTS.forEach((r) =>
      r.tags.forEach((t) => map.set(t, (map.get(t) || 0) + 1))
    );
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, []);

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 3 }, pb: 4 }}>
      {/* Hero / filtros básicos */}
      <Sheet
        variant="plain"
        sx={{
          p: 2,
          borderRadius: "xl",
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
          boxShadow: "sm",
          mb: 2,
        }}>
        <Stack spacing={1.25}>
          <Typography level="h2" sx={{ fontWeight: 800, fontSize: 26 }}>
            Reportes
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.25}>
            <Input
              startDecorator={<SearchRoundedIcon />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar reportes: vehículos, registros, activos…"
              sx={{ flex: 1 }}
            />
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              {CATEGORIES.map((c) => (
                <Chip
                  key={c}
                  variant={category === c ? "solid" : "soft"}
                  onClick={() => setCategory(c)}
                  sx={{ borderRadius: "999px" }}>
                  {c}
                </Chip>
              ))}
            </Stack>
          </Stack>

          {/* Tags populares */}
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap" }}>
            <Chip
              variant={!tag ? "solid" : "soft"}
              onClick={() => setTag("")}
              sx={{ borderRadius: "999px" }}>
              Todas las etiquetas
            </Chip>
            {allTags.map((t) => (
              <Chip
                key={t}
                variant={tag === t ? "solid" : "soft"}
                onClick={() => setTag(t)}
                sx={{ borderRadius: "999px" }}>
                #{t}
              </Chip>
            ))}
          </Stack>
        </Stack>
      </Sheet>

      {/* Recientes */}
      {recentReports.length > 0 && (
        <>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
            sx={{ mb: 1 }}>
            <Typography level="title-lg" sx={{ fontWeight: 700 }}>
              Vistos recientemente
            </Typography>
            <Button
              size="sm"
              variant="plain"
              onClick={() => {
                setRecentIds([]);
                localStorage.removeItem("recent_reports");
              }}>
              Limpiar
            </Button>
          </Stack>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            {recentReports.map((r) => (
              <Grid key={r.id} xs={12} sm={6} md={4} lg={3}>
                <ReportCard report={r} onOpen={() => openReport(r.id)} />
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ my: 2 }} />
        </>
      )}

      {/* Catálogo filtrado */}
      <Grid container spacing={1.5}>
        {filtered.map((r) => (
          <Grid key={r.id} xs={12} sm={6} md={4} lg={3}>
            <ReportCard report={r} onOpen={() => openReport(r.id)} />
          </Grid>
        ))}
        {filtered.length === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography color="neutral">
              No hay reportes para esos filtros.
            </Typography>
          </Box>
        )}
      </Grid>
    </Box>
  );
}

function ReportCard({ report, onOpen }) {
  return (
    <Card
      variant="plain"
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "neutral.outlinedBorder",
        borderRadius: "xl",
        boxShadow: "sm",
      }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={report.category}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "md",
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.softBg",
                color: "primary.softColor",
              }}>
              {report.icon || <BarChartRoundedIcon />}
            </Box>
          </Tooltip>
          <Box sx={{ minWidth: 0 }}>
            <Typography level="title-sm" noWrap>
              {report.title}
            </Typography>
            <Typography level="body-xs" color="neutral" noWrap>
              {report.description}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: "wrap" }}>
          {report.tags.map((t) => (
            <Chip
              key={t}
              variant="soft"
              size="sm"
              sx={{ borderRadius: "999px" }}>
              #{t}
            </Chip>
          ))}
        </Stack>

        <Button
          onClick={onOpen}
          variant="soft"
          sx={{ mt: 1.25, width: "100%" }}>
          Abrir
        </Button>
      </CardContent>
    </Card>
  );
}
