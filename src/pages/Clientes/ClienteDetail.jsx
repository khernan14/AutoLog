// src/pages/Clientes/ClienteDetail.jsx
import { useMemo, useState } from "react";
import {
  useParams,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";

import { Box, Card, Typography, Stack, Button, IconButton } from "@mui/joy";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

// Hijos existentes
import ClienteInfo from "./ClienteInfo.jsx";
import ClienteSites from "./ClienteSites.jsx";
import ClienteActivos from "./ClienteActivos.jsx";
import ClienteContratos from "./ClienteContratos.jsx";

// shadcn/ui
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ClienteDetail() {
  const { id } = useParams();
  const location = useLocation();

  // contadores para tabs (si luego los usas desde los children)
  const [siteCount, setSiteCount] = useState(0);
  const [activosCount, setActivosCount] = useState(null);

  const tabs = useMemo(
    () => [
      { key: "informacion", label: "Información" },
      { key: "sites", label: "Sites" /*, count: siteCount || undefined*/ },
      {
        key: "activos",
        label: "Activos" /*, count: activosCount || undefined*/,
      },
      // { key: "contratos", label: "Contratos" },
    ],
    [siteCount, activosCount]
  );

  const active = useMemo(() => {
    const found = tabs.find(
      (t) =>
        location.pathname.endsWith(`/${t.key}`) ||
        location.pathname.includes(`/${t.key}/`)
    );
    return found?.key ?? "informacion";
  }, [location.pathname, tabs]);

  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        pt: { xs: "calc(12px + var(--Header-height))", md: 4 },
        pb: { xs: 2, md: 4 },
        px: { xs: 2, md: 4 },
        bgcolor: "background.body",
        display: "flex",
        justifyContent: "center",
        overflow: "auto",
        minHeight: "100dvh",
      }}>
      <Box sx={{ width: "100%", maxWidth: 1100 }}>
        {/* Header con título + botón volver */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.5}
          mb={2}>
          {/* <Box>
            <Typography
              level="body-xs"
              sx={{ textTransform: "uppercase", opacity: 0.7 }}>
              Clientes
            </Typography>
            <Typography level="h4">Detalle del cliente</Typography>
            <Typography level="body-xs" sx={{ opacity: 0.7, mt: 0.25 }}>
              ID: {id}
            </Typography>
          </Box> */}

          <Button
            component={Link}
            to="/admin/clientes"
            variant="plain"
            size="sm"
            startDecorator={<ArrowBackRoundedIcon />}
            sx={{
              alignSelf: { xs: "stretch", sm: "auto" },
              justifyContent: { xs: "flex-start", sm: "center" },
            }}>
            Volver
          </Button>
        </Stack>

        <Card
          variant="plain"
          sx={{
            mt: 1,
            p: 0,
            bgcolor: "transparent",
            boxShadow: "none",
            "--Card-padding": 0,
          }}>
          {/* Tabs (navegación) */}
          <Tabs value={active} className="w-full">
            <TabsList className="w-full flex flex-nowrap overflow-x-auto rounded-lg bg-muted/40 p-1">
              {tabs.map((t) => {
                const to = `/admin/clientes/${id}/${t.key}`;
                return (
                  <TabsTrigger
                    key={t.key}
                    value={t.key}
                    asChild
                    className="text-xs sm:text-sm whitespace-nowrap">
                    <Link className="inline-flex items-center gap-2" to={to}>
                      <span>{t.label}</span>
                      {typeof t.count === "number" && (
                        <Badge variant="secondary">{t.count}</Badge>
                      )}
                    </Link>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>

          {/* Contenido de cada tab */}
          <Box mt={2}>
            <Routes>
              <Route index element={<Navigate to="informacion" replace />} />
              <Route path="informacion" element={<ClienteInfo />} />
              <Route
                path="sites"
                element={
                  // si algún día quieres pasar el contador:
                  // <ClienteSites onCountChange={setSiteCount} />
                  <ClienteSites />
                }
              />
              <Route
                path="activos"
                element={
                  // igual aquí:
                  // <ClienteActivos onCountChange={setActivosCount} />
                  <ClienteActivos />
                }
              />
              {/* <Route path="contratos" element={<ClienteContratos />} /> */}
              <Route path="*" element={<Navigate to="informacion" replace />} />
            </Routes>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
