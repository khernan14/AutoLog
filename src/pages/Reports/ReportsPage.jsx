// src/pages/Reports/ReportsPage.jsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Input,
  Chip,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  Divider,
  IconButton,
  aspectRatioClasses,
} from "@mui/joy";

// Iconos
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";

import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const qs = useQuery();
  const navigate = useNavigate();

  // Estados
  const [query, setQuery] = useState(qs.get("q") || "");
  const [category, setCategory] = useState(qs.get("cat") || "Todos");
  const [tag, setTag] = useState(qs.get("tag") || "");

  // Definición de reportes
  const REPORTS = [
    {
      id: "registros-uso",
      title: t("reports.report_items.registros_uso.title"),
      description: t("reports.report_items.registros_uso.description"),
      icon: <BarChartRoundedIcon fontSize="inherit" />,
      category: "Operación",
      tags: ["vehículos", "registros"],
    },
    {
      id: "vehiculos-uso",
      title: t("reports.report_items.vehiculos_uso.title"),
      description: t("reports.report_items.vehiculos_uso.description"),
      icon: <DirectionsCarRoundedIcon fontSize="inherit" />,
      category: "Operación",
      tags: ["vehículos", "ranking"],
    },
    {
      id: "empleados-actividad",
      title: t("reports.report_items.empleados_actividad.title"),
      description: t("reports.report_items.empleados_actividad.description"),
      icon: <BusinessRoundedIcon fontSize="inherit" />,
      category: "Recursos Humanos",
      tags: ["empleados", "actividad"],
    },
    {
      id: "kilometraje-empleado",
      title: t("reports.report_items.kilometraje_empleado.title"),
      description: t("reports.report_items.kilometraje_empleado.description"),
      icon: <DirectionsCarRoundedIcon fontSize="inherit" />,
      category: "Operación",
      tags: ["kilometraje", "empleados"],
    },
    {
      id: "ubicacion-vehiculo",
      title: t("reports.report_items.ubicacion_vehiculo.title"),
      description: t("reports.report_items.ubicacion_vehiculo.description"),
      icon: <PlaceRoundedIcon fontSize="inherit" />,
      category: "Operación",
      tags: ["ubicaciones", "vehiculos"],
    },
    {
      id: "consumo-combustible-vehiculo",
      title: t("reports.report_items.consumo_combustible_vehiculo.title"),
      description: t(
        "reports.report_items.consumo_combustible_vehiculo.description"
      ),
      icon: <DirectionsCarRoundedIcon fontSize="inherit" />,
      category: "Operación",
      tags: ["combustible", "vehiculos"],
    },
  ];

  // Recientes (LocalStorage)
  const [recentIds, setRecentIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recent_reports") || "[]");
    } catch {
      return [];
    }
  });

  // Sincronizar URL
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

  // Filtrado
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
  }, [query, category, tag, REPORTS]);

  const recentReports = recentIds
    .map((id) => REPORTS.find((r) => r.id === id))
    .filter(Boolean);

  const openReport = (id) => {
    const next = [id, ...recentIds.filter((x) => x !== id)].slice(0, 4); // Guardo solo 4 recientes para no saturar
    setRecentIds(next);
    localStorage.setItem("recent_reports", JSON.stringify(next));
    navigate(`/admin/reports?view=${id}`);
  };

  // Nube de tags
  const allTags = useMemo(() => {
    const map = new Map();
    REPORTS.forEach((r) =>
      r.tags.forEach((t) => map.set(t, (map.get(t) || 0) + 1))
    );
    return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
  }, [REPORTS]);

  return (
    <Box
      component="main"
      sx={{
        px: { xs: 2, md: 4 },
        pt: 3,
        pb: 8,
        maxWidth: 1200,
        mx: "auto",
      }}>
      {/* --- HEADER SECTION --- */}
      <Box sx={{ mb: 4 }}>
        <Typography level="h2" sx={{ mb: 1, fontWeight: "xl" }}>
          {t("reports.reports_list.title")}
        </Typography>
        <Typography level="body-md" color="neutral" sx={{ maxWidth: 600 }}>
          {t("reports.reports_list.description")}
        </Typography>
      </Box>

      {/* --- SEARCH & FILTERS BAR --- */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 4, alignItems: "center" }}>
        {/* Buscador grande */}
        <Input
          size="lg"
          placeholder={t("reports.reports_list.search_placeholder")}
          startDecorator={<SearchRoundedIcon />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{
            flex: 1,
            borderRadius: "xl",
            boxShadow: "sm",
            "&::before": { display: "none" },
            "&:focus-within": { boxShadow: "md", borderColor: "primary.500" },
          }}
          endDecorator={
            query && (
              <IconButton
                size="sm"
                variant="plain"
                color="neutral"
                onClick={() => setQuery("")}>
                <ClearRoundedIcon />
              </IconButton>
            )
          }
        />

        {/* Scroll horizontal de categorías */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            overflowX: "auto",
            maxWidth: { xs: "100%", md: "60%" },
            pb: 0.5,
            "::-webkit-scrollbar": { display: "none" }, // Ocultar scrollbar visualmente
          }}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              variant={category === c ? "solid" : "outlined"}
              color={category === c ? "primary" : "neutral"}
              onClick={() => setCategory(c)}
              sx={{
                borderRadius: "lg",
                fontWeight: category === c ? "lg" : "md",
                px: 2,
                py: 1,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": { bgcolor: category !== c && "background.level1" },
              }}>
              {t(`reports.reports_list.categories.${c}`)}
            </Chip>
          ))}
        </Stack>
      </Stack>

      {/* --- SECCIÓN RECIENTES (Destacada) --- */}
      {recentReports.length > 0 && !query && category === "Todos" && !tag && (
        <Box sx={{ mb: 5 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}>
            <Typography
              level="title-md"
              startDecorator={<HistoryRoundedIcon color="primary" />}
              sx={{ color: "text.primary" }}>
              {t("reports.reports_list.recent")}
            </Typography>
            <Button
              variant="plain"
              size="sm"
              color="neutral"
              onClick={() => {
                setRecentIds([]);
                localStorage.removeItem("recent_reports");
              }}>
              {t("reports.reports_list.clear_history")}
            </Button>
          </Stack>

          <Grid container spacing={2}>
            {recentReports.map((r) => (
              <Grid key={r.id} xs={12} sm={6} md={3}>
                <RecentCard report={r} onClick={() => openReport(r.id)} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* --- LISTADO PRINCIPAL --- */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <FilterListRoundedIcon sx={{ color: "text.tertiary", fontSize: 20 }} />
        <Typography level="title-sm" color="neutral">
          {filtered.length} {t("reports.reports_list.found")}
        </Typography>

        {tag && (
          <Chip
            variant="soft"
            color="primary"
            endDecorator={<ClearRoundedIcon fontSize="small" />}
            onClick={() => setTag("")}>
            Filtro: {tag}
          </Chip>
        )}
      </Stack>

      <Grid container spacing={2}>
        {filtered.map((r) => (
          <Grid key={r.id} xs={12} sm={6} lg={4}>
            <ReportCard report={r} onClick={() => openReport(r.id)} />
          </Grid>
        ))}

        {filtered.length === 0 && (
          <Box sx={{ width: "100%", textAlign: "center", py: 8 }}>
            <Typography level="h4" color="neutral">
              🔍 {t("reports.reports_list.no_data_title")}
            </Typography>
            <Typography level="body-md">
              {t("reports.reports_list.no_data_desc")}
            </Typography>
            <Button
              variant="soft"
              sx={{ mt: 2 }}
              onClick={() => {
                setQuery("");
                setCategory("Todos");
                setTag("");
              }}>
              {t("reports.reports_list.clear_filters")}
            </Button>
          </Box>
        )}
      </Grid>

      {/* --- TAGS CLOUD --- */}
      {allTags.length > 0 && (
        <Box
          sx={{ mt: 6, pt: 4, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography level="title-sm" sx={{ mb: 2, color: "text.tertiary" }}>
            {t("reports.reports_list.tags_cloud")}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {allTags.map((t) => (
              <Chip
                key={t}
                variant={tag === t ? "solid" : "soft"}
                color="neutral"
                onClick={() => setTag(tag === t ? "" : t)}
                sx={{
                  borderRadius: "sm",
                  cursor: "pointer",
                  bgcolor: tag === t ? "neutral.800" : undefined,
                }}>
                #{t}
              </Chip>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

// 🎨 COMPONENTE: Tarjeta Principal
function ReportCard({ report, onClick }) {
  const { t } = useTranslation();

  return (
    <Card
      variant="outlined"
      onClick={onClick}
      sx={{
        height: "100%",
        borderRadius: "lg",
        transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
        cursor: "pointer",
        "&:hover": {
          borderColor: "primary.300",
          boxShadow: "md",
          transform: "translateY(-2px)",
          // Hacemos que el botón interior reaccione al hover de la tarjeta
          "& .action-btn": {
            bgcolor: "primary.solidBg",
            color: "#fff",
          },
        },
      }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Encabezado: Icono y Botón */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="start">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "lg",
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.softBg",
              color: "primary.main",
              fontSize: "1.5rem",
            }}>
            {report.icon}
          </Box>

          <IconButton
            className="action-btn"
            variant="soft"
            color="neutral"
            sx={{ borderRadius: "50%", transition: "0.2s" }}>
            <ArrowForwardRoundedIcon />
          </IconButton>
        </Stack>

        {/* Contenido */}
        <Box>
          <Typography level="title-md" sx={{ fontWeight: "bold", mb: 0.5 }}>
            {report.title}
          </Typography>
          <Typography level="body-sm" color="neutral" sx={{ lineHeight: 1.4 }}>
            {report.description}
          </Typography>
        </Box>

        {/* Footer: Categoría */}
        <Box sx={{ mt: "auto", pt: 1 }}>
          <Typography
            level="body-xs"
            fontWeight="lg"
            textColor="primary.500"
            textTransform="uppercase">
            {t(`reports.reports_list.categories.${report.category}`)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

// 🎨 COMPONENTE: Tarjeta de Recientes (Más compacta)
function RecentCard({ report, onClick }) {
  return (
    <Card
      orientation="horizontal"
      variant="soft"
      color="neutral"
      onClick={onClick}
      sx={{
        gap: 2,
        alignItems: "center",
        cursor: "pointer",
        borderRadius: "lg",
        transition: "0.2s",
        "&:hover": {
          bgcolor: "background.level2",
          boxShadow: "sm",
        },
      }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          bgcolor: "white",
          color: "neutral.700",
          boxShadow: "sm",
          flexShrink: 0,
        }}>
        {report.icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography level="title-sm" noWrap>
          {report.title}
        </Typography>
        <Typography level="body-xs" noWrap>
          {report.category}
        </Typography>
      </Box>
    </Card>
  );
}
