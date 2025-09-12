import { useEffect, useMemo, useState, useCallback } from "react";
import {
  useParams,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Tabs,
  TabList,
  Tab,
  Sheet,
  Stack,
  Button,
  CircularProgress,
} from "@mui/joy";

import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import LockPersonRoundedIcon from "@mui/icons-material/LockPersonRounded";
import WifiOffRoundedIcon from "@mui/icons-material/WifiOffRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import ClienteInfo from "./ClienteInfo.jsx";
import ClienteSites from "./ClienteSites.jsx";
import ClienteActivos from "./ClienteActivos.jsx";
import ClienteContratos from "./ClienteContratos.jsx";

import StatusCard from "../../components/common/StatusCard"; // ajusta ruta si es necesario
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

// si tienes un servicio para validar que el cliente existe o cargar info mínima, puedes traerlo aquí.
// por ahora, este contenedor solo valida permisos globales y renderiza tabs/children.

export default function ClienteDetail() {
  const { id } = useParams();
  const location = useLocation();

  const { showToast } = useToast();
  const { userData, checkingSession, hasPermiso } = useAuth();
  const isAdmin = userData?.rol?.toLowerCase() === "admin";
  const can = useCallback(
    (p) => isAdmin || hasPermiso(p),
    [isAdmin, hasPermiso]
  );

  // permiso contenedor (misma llave que lista de clientes)
  const canView = can("ver_companias");

  // contadores mostrados en las labels de tabs
  const [siteCount, setSiteCount] = useState(0);
  const [activosCount, setActivosCount] = useState(null); // opcional: lo usamos si tu hijo lo expone

  // si luego validas existencia de cliente y falla, llena error:
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // si más adelante haces una carga mínima del cliente

  const tabs = useMemo(
    () => [
      { label: "Información", path: "info" },
      { label: `Sites (${siteCount})`, path: "sites" },
      {
        label: activosCount == null ? "Activos" : `Activos (${activosCount})`,
        path: "activos",
      },
      { label: "Contratos", path: "contratos" },
    ],
    [siteCount, activosCount]
  );

  const activeIndex = useMemo(() => {
    const idx = tabs.findIndex(
      (t) =>
        location.pathname.endsWith(`/${t.path}`) ||
        location.pathname.includes(`/${t.path}/`)
    );
    return idx === -1 ? 0 : idx;
  }, [location.pathname, tabs]);

  // ---- view state del contenedor ----
  const viewState = checkingSession
    ? "checking"
    : !canView
    ? "no-permission"
    : error
    ? "error"
    : loading
    ? "loading"
    : "data";

  const renderStatus = () => {
    if (viewState === "checking") {
      return (
        <StatusCard
          icon={<HourglassEmptyRoundedIcon />}
          title="Verificando sesión…"
          description={
            <Stack alignItems="center" spacing={1}>
              <CircularProgress size="sm" />
              <Typography level="body-xs" sx={{ opacity: 0.8 }}>
                Por favor, espera un momento.
              </Typography>
            </Stack>
          }
        />
      );
    }
    if (viewState === "no-permission") {
      return (
        <StatusCard
          color="danger"
          icon={<LockPersonRoundedIcon />}
          title="Sin permisos para ver clientes"
          description="Consulta con un administrador para obtener acceso."
        />
      );
    }
    if (viewState === "error") {
      const isNetwork = /conexión|failed to fetch/i.test(error || "");
      return (
        <StatusCard
          color={isNetwork ? "warning" : "danger"}
          icon={
            isNetwork ? <WifiOffRoundedIcon /> : <ErrorOutlineRoundedIcon />
          }
          title={
            isNetwork ? "Problema de conexión" : "No se pudo cargar el cliente"
          }
          description={error}
          actions={
            <Button
              startDecorator={<RestartAltRoundedIcon />}
              onClick={() => window.location.reload()}
              variant="soft">
              Reintentar
            </Button>
          }
        />
      );
    }
    if (viewState === "loading") {
      return (
        <Sheet p={3} sx={{ textAlign: "center" }}>
          <Stack spacing={1} alignItems="center">
            <CircularProgress />
            <Typography level="body-sm">Cargando…</Typography>
          </Stack>
        </Sheet>
      );
    }
    return null;
  };

  return (
    <Box p={2}>
      <Typography level="h4" sx={{ mb: 1 }}>
        Cliente #{id}
      </Typography>

      <Card sx={{ mt: 2 }}>
        {viewState !== "data" ? (
          <Box p={2}>{renderStatus()}</Box>
        ) : (
          <>
            <Tabs
              value={activeIndex}
              sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
              <TabList variant="soft" size="sm">
                {tabs.map((t) => (
                  <Tab
                    key={t.path}
                    component={Link}
                    to={`/admin/clientes/${id}/${t.path}`}
                    sx={{ textWrap: "nowrap" }}>
                    {t.label}
                  </Tab>
                ))}
              </TabList>
            </Tabs>

            <Box mt={2}>
              <Routes>
                <Route index element={<Navigate to="info" replace />} />
                <Route path="info" element={<ClienteInfo />} />
                <Route
                  path="sites"
                  element={<ClienteSites onCountChange={setSiteCount} />}
                />
                {/* Si quieres que el tab muestre contador de activos,
                    puedes pasar onCountChange al hijo (opcional).
                    Si el hijo no lo usa, no pasa nada. */}
                <Route
                  path="activos"
                  element={<ClienteActivos onCountChange={setActivosCount} />}
                />
                <Route path="contratos" element={<ClienteContratos />} />
                {/* fallback por si escriben una subruta desconocida */}
                <Route path="*" element={<Navigate to="info" replace />} />
              </Routes>
            </Box>
          </>
        )}
      </Card>
    </Box>
  );
}
