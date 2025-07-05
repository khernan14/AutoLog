import * as React from "react";
import RegisterReport from "../../../Reports/RegisterReport";
import EmpleadosMasSalidas from "../../../Reports/EmpleadosmasSalidas";
import KilometrajePorEmpleado from "../../../Reports/KilometrajePorEmpleado.jsx";
import VehiculosMasUtilizados from "../../../Reports/VehiculosMasUtilizados.jsx";
import RegistrosPorUbicacion from "../../../Reports/RegistrosPorUbicacion.jsx";
import ConsumoCombustibleVehiculo from "../../../Reports/ConsumoCombustibleVehiculo.jsx";

export default function ContainerReport({ report }) {
  // Renderiza contenido según el reporte seleccionado
  switch (report) {
    case "registerReport":
      return <RegisterReportPage />;
    case "empleadosMasSalidasReport":
      return <EmpleadosMasSalidasPage />;
    case "kilometrajePorEmpleadoReport":
      return <KilometrajePorEmpleadoPage />;
    case "vehiculosMasUtilizadosReport":
      return <VehiculosMasUtilizadosPage />;
    case "registrosPorUbicacionReport":
      return <RegistrosPorUbicacionPage />;
    case "consumoCombustibleVehiculoReport":
      return <ConsumoCombustibleVehiculoPage />;
    default:
      return <div>Seleccione un reporte válido</div>;
  }
}

// Aquí defines los componentes para cada reporte
function RegisterReportPage() {
  return <RegisterReport />;
}

function EmpleadosMasSalidasPage() {
  return <EmpleadosMasSalidas />;
}

function KilometrajePorEmpleadoPage() {
  return <KilometrajePorEmpleado />;
}

function VehiculosMasUtilizadosPage() {
  return <VehiculosMasUtilizados />;
}

function RegistrosPorUbicacionPage() {
  return <RegistrosPorUbicacion />;
}

function ConsumoCombustibleVehiculoPage() {
  return <ConsumoCombustibleVehiculo />;
}
