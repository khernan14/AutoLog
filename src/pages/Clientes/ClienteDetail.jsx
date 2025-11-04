// src/pages/Clientes/ClienteDetail.jsx
import { useMemo, useCallback, useState } from "react";
import {
  useParams,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";

// Joy (sigues usando Joy para layout y tipografía)
import { Box, Card, Typography } from "@mui/joy";

// Hijos existentes (no cambian)
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

  // contadores para los badges
  const [siteCount, setSiteCount] = useState(0);
  const [activosCount, setActivosCount] = useState(null);

  // define tu modelo de tabs (ruta + etiqueta)
  const tabs = useMemo(() => [
    { key: "informacion", label: "Información" },
    { key: "sites", label: "Sites" },
    { key: "activos", label: "Activos" },
    { key: "contratos", label: "Contratos" },
  ]);

  // valor de tab activo basado en la URL
  const active = useMemo(() => {
    const found = tabs.find(
      (t) =>
        location.pathname.endsWith(`/${t.key}`) ||
        location.pathname.includes(`/${t.key}/`)
    );
    return found?.key ?? "informacion";
  }, [location.pathname, tabs]);

  return (
    <Box p={2}>
      <Typography level="h4" sx={{ mb: 1 }}>
        Información del Cliente
      </Typography>

      <Card
        variant="plain"
        sx={{
          mt: 2,
          p: 0,
          bgcolor: "transparent",
          boxShadow: "none",
          "--Card-padding": 0,
        }}>
        {/* Header: shadcn Tabs como navegación (React Router hace el contenido) */}
        <Tabs value={active} className="w-full">
          <TabsList>
            {tabs.map((t) => {
              const to = `/admin/clientes/${id}/${t.key}`;
              return (
                <TabsTrigger key={t.key} value={t.key} asChild>
                  <Link to={to} className="inline-flex items-center gap-2">
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

        {/* Contenido: subrutas existentes */}
        <Box mt={2}>
          <Routes>
            <Route index element={<Navigate to="informacion" replace />} />
            <Route path="informacion" element={<ClienteInfo />} />
            <Route path="sites" element={<ClienteSites />} />
            <Route path="activos" element={<ClienteActivos />} />
            <Route path="contratos" element={<ClienteContratos />} />
            <Route path="*" element={<Navigate to="informacion" replace />} />
          </Routes>
        </Box>
      </Card>
    </Box>
  );
}
