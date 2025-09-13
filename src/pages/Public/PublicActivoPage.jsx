// src/pages/PublicActivoPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Divider,
  LinearProgress,
  Sheet,
  Avatar,
  Link as JoyLink,
  Button,
} from "@mui/joy";

const API_BASE = "https://autologapi-production.up.railway.app";
// const API_BASE = "http://localhost:3000";

const StatusChip = ({ estatus }) => {
  const color = useMemo(() => {
    switch (estatus) {
      case "Arrendado":
        return "primary";
      case "En Mantenimiento":
        return "warning";
      case "Inactivo":
        return "neutral";
      default:
        return "success"; // Activo
    }
  }, [estatus]);
  return (
    <Chip variant="soft" color={color}>
      {estatus || "—"}
    </Chip>
  );
};

const UbicacionChip = ({ tipo }) => {
  if (!tipo) return null;
  const color = tipo === "Cliente" ? "primary" : "neutral";
  return (
    <Chip size="sm" variant="solid" color={color}>
      {tipo}
    </Chip>
  );
};

export default function PublicActivoPage() {
  const { codigo } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [data, setData] = useState(null);
  const [state, setState] = useState({ loading: true, error: null });

  useEffect(() => {
    let mounted = true;
    setState({ loading: true, error: null });

    // ⚠️ Enforce token (seguridad): si no hay token, no mostramos datos
    if (!token) {
      setState({
        loading: false,
        error:
          "Este enlace público no es válido. Vuelve a escanear el QR o abre el activo desde la aplicación.",
      });
      return () => {};
    }

    const url = new URL(
      `${API_BASE}/public/activos/${encodeURIComponent(codigo)}`
    );
    url.searchParams.set("token", token);

    fetch(url.toString())
      .then(async (r) => {
        if (!r.ok) {
          if (r.status === 401 || r.status === 403) {
            throw new Error(
              "Enlace inválido o expirado. Vuelve a escanear el QR o abre el activo desde la aplicación."
            );
          }
          throw new Error(`(${r.status}) No se pudo cargar el activo`);
        }
        return r.json();
      })
      .then((json) => mounted && setData(json))
      .catch((e) => mounted && setState({ loading: false, error: e.message }))
      .finally(() => mounted && setState((s) => ({ ...s, loading: false })));
    return () => {
      mounted = false;
    };
  }, [codigo, token]);

  if (state.loading) {
    return (
      <OuterContainer>
        <Card
          variant="outlined"
          sx={{ width: { xs: "100%", sm: 520 }, p: 3, mx: "auto" }}>
          <Typography level="title-lg">Cargando activo…</Typography>
          <LinearProgress sx={{ mt: 2 }} />
          <Typography level="body-sm" sx={{ mt: 1 }} color="neutral">
            Código: {codigo}
          </Typography>
        </Card>
      </OuterContainer>
    );
  }

  if (state.error || !data) {
    return (
      <OuterContainer>
        <Card
          variant="soft"
          color="danger"
          sx={{ width: { xs: "100%", sm: 520 }, p: 3, mx: "auto" }}>
          <Typography level="title-lg">No se pudo mostrar el activo</Typography>
          <Typography level="body-sm" sx={{ mt: 0.5 }}>
            {state.error || "Activo no encontrado"}
          </Typography>
          <Typography level="body-xs" sx={{ mt: 1 }} color="neutral">
            Código: {codigo}
          </Typography>
          <Button
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
            variant="soft">
            Reintentar
          </Button>
        </Card>
      </OuterContainer>
    );
  }

  const {
    nombre,
    modelo,
    serial_number,
    tipo,
    estatus,
    fecha_registro,
    ubicacion_actual,
    asignacion_vigente,
  } = data;

  return (
    <OuterContainer>
      <Card
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 720,
          borderRadius: "2xl",
          boxShadow: "lg",
          p: { xs: 2, sm: 3 },
          mx: "auto",
        }}>
        {/* Header */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              sx={{ "--Avatar-size": "72px" }}
              src={data.tecnasa_logo_url || "/logo-tecnasa.png"}
              alt="Tecnasa Honduras"
              variant="soft"
            />
            <Box>
              <Typography level="title-lg">Tecnasa Honduras</Typography>
              <Typography level="body-sm" color="neutral">
                Activo: <b>{codigo}</b>
              </Typography>
            </Box>
          </Stack>

          {data.meta?.isEnCliente && data.cliente_logo_url ? (
            <Sheet
              variant="outlined"
              sx={{
                p: 1.25,
                borderRadius: "lg",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
              <img
                src={data.cliente_logo_url}
                alt="Logo cliente"
                style={{ width: 140, height: 88, objectFit: "contain" }}
              />
            </Sheet>
          ) : data.meta?.isEnBodega ? (
            <Sheet
              variant="soft"
              sx={{ px: 1.25, py: 0.75, borderRadius: "lg" }}>
              <Typography level="body-sm">
                <b>Bodega:</b> {data.ubicacion_actual?.bodega || "—"}
              </Typography>
            </Sheet>
          ) : (
            <Avatar
              variant="outlined"
              color="neutral"
              sx={{ "--Avatar-size": "56px" }}>
              {asignacion_vigente?.cliente?.slice(0, 2).toUpperCase() || "—"}
            </Avatar>
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Datos */}
        <CardContent sx={{ pt: 0 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Sheet variant="soft" sx={{ flex: 1, p: 2, borderRadius: "lg" }}>
              <Typography level="title-sm">Información del activo</Typography>
              <Stack spacing={0.5} mt={1}>
                <Row label="Nombre" value={nombre} />
                <Row label="Modelo" value={modelo || "—"} />
                <Row label="Serie" value={serial_number || "—"} />
                <Row label="Tipo" value={tipo || "—"} />
                <Row label="Estatus" value={<StatusChip estatus={estatus} />} />
                <Row label="Registrado" value={formatDate(fecha_registro)} />
              </Stack>
            </Sheet>

            <Sheet variant="soft" sx={{ flex: 1, p: 2, borderRadius: "lg" }}>
              <Typography level="title-sm" mb={1}>
                Ubicación actual
              </Typography>
              {ubicacion_actual ? (
                <Stack spacing={0.5}>
                  <Row
                    label="Destino"
                    value={
                      <UbicacionChip tipo={ubicacion_actual.tipo_destino} />
                    }
                  />
                  {ubicacion_actual.tipo_destino === "Cliente" ? (
                    <>
                      <Row
                        label="Cliente"
                        value={ubicacion_actual.cliente || "—"}
                      />
                      <Row label="Site" value={ubicacion_actual.site || "—"} />
                    </>
                  ) : (
                    <Row
                      label="Bodega"
                      value={ubicacion_actual.bodega || "—"}
                    />
                  )}
                  <Row
                    label="Desde"
                    value={formatDate(ubicacion_actual.desde)}
                  />
                  {ubicacion_actual.motivo && (
                    <Row label="Motivo" value={ubicacion_actual.motivo} />
                  )}
                </Stack>
              ) : (
                <Typography level="body-sm" color="neutral" mt={1}>
                  Sin ubicación activa registrada.
                </Typography>
              )}
            </Sheet>
          </Stack>

          <Sheet variant="outlined" sx={{ mt: 2, p: 2, borderRadius: "lg" }}>
            <Typography level="title-sm">
              Asignación vigente (para facturación)
            </Typography>
            {asignacion_vigente ? (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mt={1}>
                <Box flex={1}>
                  <Row label="Cliente" value={asignacion_vigente.cliente} />
                  <Row
                    label="Contrato"
                    value={asignacion_vigente.contrato_codigo}
                  />
                  <Row
                    label="Adenda"
                    value={asignacion_vigente.adenda_codigo}
                  />
                  <Row
                    label="Modalidad"
                    value={
                      asignacion_vigente.es_temporal ? "Temporal" : "Permanente"
                    }
                  />
                </Box>
                <Box flex={1}>
                  <Row
                    label="Modelo (contrato)"
                    value={asignacion_vigente.modelo_contrato}
                  />
                  <Row
                    label="Arrendamiento"
                    value={money(asignacion_vigente.precio_arrendamiento)}
                  />
                  <Row
                    label="Costo B/N"
                    value={perPage(asignacion_vigente.costo_impresion_bn)}
                  />
                  <Row
                    label="Costo Color"
                    value={perPage(asignacion_vigente.costo_impresion_color)}
                  />
                </Box>
              </Stack>
            ) : (
              <Typography level="body-sm" color="neutral" mt={1}>
                Sin asignación vigente.
              </Typography>
            )}
          </Sheet>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            mt={2}
            spacing={1}>
            <Typography level="body-xs" color="neutral">
              Si los datos no coinciden con el equipo físico, contacte al
              soporte.
            </Typography>
            <JoyLink
              href="https://www.herndevs.com"
              target="_blank"
              rel="noreferrer">
              herndevs.com
            </JoyLink>
          </Stack>
        </CardContent>
      </Card>
    </OuterContainer>
  );
}

function OuterContainer({ children }) {
  // ✅ Contenedor con scroll en móvil (100dvh + overflowY)
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        py: { xs: 2, sm: 3 },
        px: { xs: 1.5, sm: 3 },
        overflowY: "auto",
        bgcolor: "background.level1",
      }}>
      {children}
    </Box>
  );
}

function Row({ label, value }) {
  return (
    <Stack direction="row" spacing={1} alignItems="baseline">
      <Typography level="body-sm" sx={{ minWidth: 140 }} color="neutral">
        {label}
      </Typography>
      <Typography level="body-md">{value}</Typography>
    </Stack>
  );
}

function formatDate(dt) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return String(dt);
  }
}

function money(n) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(Number(n));
}

function perPage(n) {
  if (n === null || n === undefined) return "—";
  return `${Number(n).toFixed(4)} / pág`;
}
