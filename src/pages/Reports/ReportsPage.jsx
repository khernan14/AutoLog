import * as React from "react";
import { Box, Tabs, TabList, Tab, tabClasses, Divider } from "@mui/joy";
import HeaderBar from "../../components/ComponentsReport/GeneralComponents/HeaderBar.jsx";
import ContainerReport from "../../components/ComponentsReport/GeneralComponents/ContainerReport.jsx";

const REPORTS = [
  { label: "Register", value: "registerReport" },
  { label: "Empleados con más salidas", value: "empleadosMasSalidasReport" },
  { label: "Kilometraje por empleado", value: "kilometrajePorEmpleadoReport" },
  { label: "Vehículos más utilizados", value: "vehiculosMasUtilizadosReport" },
  { label: "Registros por ubicación", value: "registrosPorUbicacionReport" },
  {
    label: "Consumo de combustible por vehículo",
    value: "consumoCombustibleVehiculoReport",
  },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = React.useState(REPORTS[0].value);
  const selectedIndex = REPORTS.findIndex((r) => r.value === selectedReport);

  return (
    <Box>
      {/* <HeaderBar /> */}
      <Box sx={{ flex: 1, ml: 2, width: "100%", maxWidth: 1200 }}>
        <Tabs
          aria-label="Report Tabs"
          value={selectedIndex}
          onChange={(e, newIndex) => setSelectedReport(REPORTS[newIndex].value)}
          sx={{ width: "100%" }}>
          <TabList
            disableUnderline
            sx={{
              p: 0.5,
              gap: 0.5,
              borderRadius: "xl",
              bgcolor: "background.level1",
              justifyContent: "flex-start", // Alineado a la izquierda
              overflowX: "auto",
              [`& .${tabClasses.root}[aria-selected="true"]`]: {
                boxShadow: "sm",
                bgcolor: "background.surface",
              },
            }}>
            {REPORTS.map(({ label }) => (
              <Tab key={label} disableIndicator>
                {label}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </Box>
      <Divider sx={{ my: 2, ml: 2, mr: 2 }} />
      <Box sx={{ px: { xs: 2, sm: 4 }, maxWidth: "100%" }}>
        <ContainerReport report={selectedReport} />
      </Box>
    </Box>
  );
}
