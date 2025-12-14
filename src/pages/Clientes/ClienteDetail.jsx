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
import { useTranslation } from "react-i18next"; // 👈 i18n

import { Box, Stack, Button } from "@mui/joy";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

// Hijos existentes
import ClienteInfo from "./ClienteInfo.jsx";
import ClienteSites from "./ClienteSites.jsx";
import ClienteActivos from "./ClienteActivos.jsx";
// import ClienteContratos from "./ClienteContratos.jsx";

// shadcn/ui components (Asumiendo que ya los tienes configurados)
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ClienteDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const location = useLocation();

  // Contadores para tabs (preparado para futuro uso)
  const [siteCount, setSiteCount] = useState(0);
  const [activosCount, setActivosCount] = useState(null);

  // Definición de Tabs con traducción
  const tabs = useMemo(
    () => [
      { key: "informacion", label: t("clients.tabs.info") },
      { key: "sites", label: t("clients.tabs.sites"), count: siteCount },
      { key: "activos", label: t("clients.tabs.assets"), count: activosCount },
      // { key: "contratos", label: t("clients.tabs.contracts") },
    ],
    [t, siteCount, activosCount]
  );

  // Calcular tab activo basado en la URL
  const activeTab = useMemo(() => {
    const found = tabs.find(
      (tab) =>
        location.pathname.endsWith(`/${tab.key}`) ||
        location.pathname.includes(`/${tab.key}/`)
    );
    return found?.key ?? "informacion";
  }, [location.pathname, tabs]);

  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        width: "100%",
        minHeight: "100dvh",
        bgcolor: "background.body",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: { xs: "calc(12px + var(--Header-height))", md: 3 },
        pb: 4,
        px: { xs: 2, md: 4 },
      }}>
      <Box sx={{ width: "100%", maxWidth: 1200 }}>
        {/* Header de Navegación Superior */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}>
          {/* Botón Volver */}
          <Button
            component={Link}
            to="/admin/clientes"
            variant="plain"
            color="neutral"
            size="sm"
            startDecorator={<ArrowBackRoundedIcon />}
            sx={{ fontWeight: "lg" }}>
            {t("common.actions.back_to_list")}
          </Button>
        </Stack>

        {/* Sistema de Tabs (Navegación) */}
        <Tabs value={activeTab} className="w-full">
          <TabsList className="w-full sm:w-auto flex flex-nowrap overflow-x-auto justify-start bg-transparent p-0 gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-px mb-4">
            {tabs.map((tab) => {
              const to = `/admin/clientes/${id}/${tab.key}`;
              return (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  asChild
                  className="
                    relative h-9 rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-medium text-muted-foreground shadow-none transition-none 
                    data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none
                    hover:text-primary/80
                  ">
                  <Link
                    to={to}
                    className="flex items-center gap-2 no-underline">
                    <span>{tab.label}</span>
                    {typeof tab.count === "number" && tab.count > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 h-5 px-1.5 rounded-full text-[10px]">
                        {tab.count}
                      </Badge>
                    )}
                  </Link>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Área de Contenido (Rutas Hijas) */}
        <Box sx={{ mt: 2 }}>
          <Routes>
            <Route index element={<Navigate to="informacion" replace />} />

            <Route path="informacion" element={<ClienteInfo />} />

            <Route
              path="sites"
              element={<ClienteSites onCountChange={setSiteCount} />}
            />

            <Route
              path="activos"
              element={<ClienteActivos onCountChange={setActivosCount} />}
            />

            {/* <Route path="contratos" element={<ClienteContratos />} /> */}

            <Route path="*" element={<Navigate to="informacion" replace />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}
