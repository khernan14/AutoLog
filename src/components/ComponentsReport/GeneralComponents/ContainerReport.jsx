// src/pages/Reports/ContainerReport.jsx
import { lazy, Suspense, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Box, Card, CardContent, Skeleton } from "@mui/joy";
import ReportHeader from "./ReportHeader";
import SearchAndDateFilter from "./SearchAndDateFilter";

// 🔌 mapa de vistas -> import perezoso (agrega aquí tus nuevos reportes)
const registry = {
  "registros-uso": lazy(() => import("../../../Reports/RegisterReport")),
  "vehiculos-uso": lazy(() =>
    import("../../../Reports/VehiculosMasUtilizados")
  ),
  "empleados-actividad": lazy(() =>
    import("../../../Reports/EmpleadosMasSalidas")
  ),
  "kilometraje-empleado": lazy(() =>
    import("../../../Reports/KilometrajePorEmpleado")
  ),
  "ubicacion-vehiculo": lazy(() =>
    import("../../../Reports/RegistrosPorUbicacion")
  ),
  "consumo-combustible-vehiculo": lazy(() =>
    import("../../../Reports/ConsumoCombustibleVehiculo")
  ),
  "activos-general": lazy(() => import("../../../Reports/ActivosGeneral.jsx")),
  "bodegas-ocupacion": lazy(() =>
    import("../../../Reports/BodegasOcupacion.jsx")
  ),
  "clientes-sitios": lazy(() => import("../../../Reports/ClientesSitos.jsx")),
};

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

export default function ContainerReport() {
  const qs = useQuery();
  const view = qs.get("view") || "registros-uso";

  const Report = useMemo(
    () => registry[view] || registry["registros-uso"],
    [view]
  );

  // filtros base que puedes compartir con tus reportes
  // (si un reporte no los necesita, ignóralos en el componente hijo)
  // aquí podrías levantar estado y pasarlo como props
  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", px: { xs: 2, md: 3 }, pb: 4 }}>
      <Card
        variant="plain"
        sx={{
          borderRadius: "xl",
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
          boxShadow: "sm",
        }}>
        <CardContent sx={{ p: 2 }}>
          <ReportHeader title="Reporte" />
          {/* Puedes renderizar SearchAndDateFilter aquí si quieres una barra global
              o moverla dentro de cada reporte según tu UX */}
          {/* <SearchAndDateFilter ... /> */}

          <Suspense fallback={<ReportSkeleton />}>
            <Report /* props globales si necesitas */ />
          </Suspense>
        </CardContent>
      </Card>
    </Box>
  );
}

function ReportSkeleton() {
  return (
    <Box>
      <Skeleton level="title-md" width="40%" />
      <Skeleton level="body-sm" width="60%" />
      <Skeleton
        variant="rectangular"
        height={280}
        sx={{ mt: 2, borderRadius: "md" }}
      />
    </Box>
  );
}
