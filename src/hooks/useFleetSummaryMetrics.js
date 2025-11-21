// src/hooks/useFleetSummaryMetrics.js
import { useEffect, useState } from "react";
import {
  getRegisterReport,
  getTotalEmpleados,
  getTotalVehiculos,
  getVehiculosEnUso,
  getVehiculosEnMantenimiento,
} from "@/services/ReportServices";

export function useFleetSummaryMetrics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    totalEmpleados: 0,
    totalVehiculos: 0,
    vehiculosEnUso: 0,
    vehiculosEnMantenimiento: 0,
    registrosPendientes: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const loadMetrics = async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          totalEmpleados,
          totalVehiculos,
          vehiculosEnUso,
          vehiculosEnMantenimiento,
          allRegistros,
        ] = await Promise.all([
          getTotalEmpleados(),
          getTotalVehiculos(),
          getVehiculosEnUso(),
          getVehiculosEnMantenimiento(),
          getRegisterReport(),
        ]);

        if (cancelled) return;

        const pendientes = (allRegistros || []).filter((r) => !r.fecha_regreso);

        setMetrics({
          totalEmpleados: totalEmpleados?.total || 0,
          totalVehiculos: totalVehiculos?.total || 0,
          vehiculosEnUso: vehiculosEnUso?.total || 0,
          vehiculosEnMantenimiento: vehiculosEnMantenimiento?.total || 0,
          registrosPendientes: pendientes.length,
        });
      } catch (err) {
        console.error("Error cargando métricas:", err);
        if (!cancelled) {
          setError(
            "No se pudieron cargar los datos principales. Por favor, intente de nuevo."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMetrics();
    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, error, metrics };
}
