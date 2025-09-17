// src/pages/HelpPage/HelpStatusPage.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  Sheet,
  Skeleton,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/joy";

import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ReportGmailerrorredRoundedIcon from "@mui/icons-material/ReportGmailerrorred";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";

import {
  getOverallStatus,
  listServices,
  statusToJoyColor,
} from "../../services/help.api.js";

/* ---------------- helpers ---------------- */
const groupBy = (arr, key) =>
  (arr || []).reduce((acc, it) => {
    const g = it[key] || "General";
    acc[g] = acc[g] || [];
    acc[g].push(it);
    return acc;
  }, {});

// Severidad para elegir el “peor” color del grupo
const SEVERITY = { neutral: 0, success: 1, warning: 2, danger: 3 };
const worstColor = (colors) =>
  (colors || []).reduce(
    (w, c) => (SEVERITY[c] > SEVERITY[w] ? c : w),
    "neutral"
  );

const normalizeDate = (d) => (d ? new Date(d) : null);
const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

function timeAgo(input) {
  const d = normalizeDate(input);
  if (!d) return null;
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "hace unos segundos";
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const days = Math.floor(h / 24);
  return `hace ${days} d`;
}

function StatusDot({ color = "neutral" }) {
  return (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: 99,
        bgcolor: `${color}.solidBg`,
        flexShrink: 0,
      }}
    />
  );
}

function StatusIcon({ status }) {
  const s = String(status || "").toLowerCase();
  if (s.includes("mantenimiento")) return <BuildRoundedIcon />;
  if (s.includes("degrad")) return <WarningAmberRoundedIcon />;
  if (/(incident|incidente|outage|down|falla|fallo)/i.test(s))
    return <ReportGmailerrorredRoundedIcon />;
  if (/(ok|operacional|operational|online|up)/i.test(s))
    return <CheckCircleRoundedIcon />;
  return <InfoOutlinedIcon />;
}

/* ---------------- page ---------------- */
export default function HelpStatusPage() {
  const [loading, setLoading] = useState(true);
  const [overall, setOverall] = useState(null);
  const [services, setServices] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      const [ov, svcs] = await Promise.all([
        getOverallStatus(),
        listServices(),
      ]);
      setOverall(ov || null);
      setServices(Array.isArray(svcs) ? svcs : []);
    } catch (e) {
      setError(e?.message || "No se pudo cargar el estado del sistema.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-refresh cada 60s
  useEffect(() => {
    const id = setInterval(fetchAll, 60_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const groups = useMemo(() => groupBy(services, "group_name"), [services]);

  // Resumen superior por estado
  const summary = useMemo(() => {
    const counters = { success: 0, warning: 0, danger: 0, neutral: 0 };
    services.forEach((s) => {
      const c = statusToJoyColor(s.status);
      counters[c] = (counters[c] || 0) + 1;
    });
    return counters;
  }, [services]);

  const overallColor = statusToJoyColor(overall?.overall_status);
  const overallTime = overall?.status_timestamp
    ? formatDateTime(overall.status_timestamp)
    : null;

  return (
    <Box sx={{ py: { xs: 2, md: 3 } }}>
      {/* Hero / encabezado */}
      <Sheet
        variant="plain"
        sx={{
          borderBottom: "1px solid",
          borderColor: "neutral.outlinedBorder",
          background:
            "linear-gradient(180deg, rgba(2,0,36,0) 0%, rgba(0,0,0,0.02) 100%)",
        }}>
        <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, md: 3 }, py: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}>
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "md",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "primary.softBg",
                    color: "primary.solidColor",
                  }}>
                  <BoltRoundedIcon />
                </Box>
                <Typography level="h3">Estado del sistema</Typography>
              </Stack>

              {loading ? (
                <Skeleton level="body-sm" width={220} />
              ) : error ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <ErrorOutlineRoundedIcon />
                  <Typography level="body-sm">{error}</Typography>
                </Stack>
              ) : (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography level="title-sm">Estado general:</Typography>
                  <Chip variant="solid" color={overallColor} size="sm">
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <StatusIcon status={overall?.overall_status} />
                      <span>{overall?.overall_status || "—"}</span>
                    </Stack>
                  </Chip>
                  {overall?.description && (
                    <Typography level="body-sm" color="neutral">
                      — {overall.description}
                    </Typography>
                  )}
                </Stack>
              )}

              {!loading && overallTime && (
                <Stack
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                  sx={{ color: "text.tertiary" }}>
                  <ScheduleRoundedIcon fontSize="sm" />
                  <Typography level="body-xs">
                    Actualizado {timeAgo(overall.status_timestamp)} ·{" "}
                    {overallTime}
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Tooltip title="Actualizar">
              <span>
                <IconButton
                  size="sm"
                  variant="soft"
                  onClick={fetchAll}
                  disabled={refreshing}>
                  <RefreshRoundedIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          {/* Resumen por estado */}
          <Stack direction="row" spacing={1} sx={{ mt: 1.25 }} flexWrap="wrap">
            <Chip variant="soft" color="success" size="sm">
              OK: {summary.success}
            </Chip>
            <Chip variant="soft" color="warning" size="sm">
              Degradado/Mantenimiento: {summary.warning}
            </Chip>
            <Chip variant="soft" color="danger" size="sm">
              Incidente: {summary.danger}
            </Chip>
          </Stack>
        </Box>
      </Sheet>

      <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, md: 3 }, pt: 2 }}>
        {loading ? (
          <Grid container spacing={1.5}>
            {[...Array(4)].map((_, i) => (
              <Grid key={i} xs={12} md={6}>
                <Card variant="plain" sx={{ borderRadius: "xl" }}>
                  <CardContent sx={{ p: 2 }}>
                    <Skeleton level="title-sm" width="60%" />
                    <Divider sx={{ my: 1 }} />
                    <Stack spacing={1}>
                      <Skeleton level="body-sm" />
                      <Skeleton level="body-sm" />
                      <Skeleton level="body-sm" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Sheet
            variant="soft"
            color="danger"
            sx={{ p: 2, borderRadius: "md" }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ErrorOutlineRoundedIcon />
              <Typography>{error}</Typography>
            </Stack>
          </Sheet>
        ) : (
          <>
            {/* Leyenda */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1 }}
              flexWrap="wrap">
              <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                Leyenda:
              </Typography>
              <Chip size="sm" variant="soft" color="success">
                OK
              </Chip>
              <Chip size="sm" variant="soft" color="warning">
                Degradado / Mantenimiento
              </Chip>
              <Chip size="sm" variant="soft" color="danger">
                Incidente
              </Chip>
            </Stack>

            {/* Grupos */}
            <Grid container spacing={1.5}>
              {Object.entries(groups).map(([group, items]) => {
                // Ordena por display_order y luego nombre
                const sorted = [...items].sort(
                  (a, b) =>
                    (a.display_order ?? 9999) - (b.display_order ?? 9999) ||
                    String(a.name).localeCompare(String(b.name))
                );
                // Color del grupo = peor color de sus servicios
                const groupColor = worstColor(
                  sorted.map((s) => statusToJoyColor(s.status))
                );

                return (
                  <Grid key={group} xs={12} md={6}>
                    <Card
                      variant="plain"
                      sx={{
                        borderRadius: "xl",
                        border: "1px solid",
                        borderColor: "neutral.outlinedBorder",
                        boxShadow: "md",
                        overflow: "hidden",
                      }}>
                      <Box
                        sx={{
                          height: 4,
                          bgcolor: `${groupColor}.solidBg`,
                        }}
                      />
                      <CardContent sx={{ p: 2 }}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{ mb: 1 }}>
                          <Typography level="title-sm">
                            {group || "General"}
                          </Typography>
                          <Chip
                            variant="soft"
                            size="sm"
                            color={groupColor}
                            startDecorator={<StatusDot color={groupColor} />}>
                            {groupColor === "success"
                              ? "OK"
                              : groupColor === "warning"
                              ? "Atención"
                              : groupColor === "danger"
                              ? "Incidente"
                              : "—"}
                          </Chip>
                        </Stack>

                        <Divider sx={{ mb: 1 }} />

                        <Stack spacing={0.75}>
                          {sorted.map((s) => {
                            const c = statusToJoyColor(s.status);
                            return (
                              <Stack
                                key={s.id}
                                direction="row"
                                spacing={1}
                                alignItems="flex-start">
                                <StatusDot color={c} />
                                <Stack sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography
                                    level="body-sm"
                                    sx={{ fontWeight: 600 }}>
                                    {s.name}
                                  </Typography>
                                  <Stack
                                    direction="row"
                                    spacing={0.75}
                                    alignItems="center"
                                    sx={{ color: "text.tertiary" }}>
                                    <Chip
                                      size="sm"
                                      variant="soft"
                                      color={c}
                                      startDecorator={
                                        <StatusIcon status={s.status} />
                                      }>
                                      {s.status}
                                    </Chip>
                                    {s.lastUpdated && (
                                      <Stack
                                        direction="row"
                                        spacing={0.5}
                                        alignItems="center">
                                        <ScheduleRoundedIcon fontSize="sm" />
                                        <Typography level="body-xs">
                                          {timeAgo(s.lastUpdated)}
                                        </Typography>
                                      </Stack>
                                    )}
                                  </Stack>
                                  {s.message && (
                                    <Typography
                                      level="body-sm"
                                      color="neutral"
                                      sx={{ mt: 0.25 }}>
                                      {s.message}
                                    </Typography>
                                  )}
                                </Stack>
                              </Stack>
                            );
                          })}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Box>
    </Box>
  );
}
