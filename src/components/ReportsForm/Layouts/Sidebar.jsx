import * as React from "react";
import { Box, Sheet, Tabs, TabList, Tab, tabClasses } from "@mui/joy";
import ReportContainer from "../../ReportsForm/Reports/ReportContainer.jsx";

const REPORTS = [
  { label: "Register", value: "registerReport" },
  { label: "Sales", value: "salesReport" },
  { label: "Inventory", value: "inventoryReport" },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = React.useState(REPORTS[0].value);
  const selectedIndex = REPORTS.findIndex((r) => r.value === selectedReport);

  const handleChange = (event, newValue) => {
    setSelectedReport(REPORTS[newValue].value);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "background.body",
        px: 2,
      }}>
      {/* Tabs */}
      <Box sx={{ width: "100%", maxWidth: 1200, mt: 2 }}>
        <Tabs
          aria-label="Report Tabs"
          value={selectedIndex}
          onChange={handleChange}
          sx={{
            width: "100%",
          }}>
          <TabList
            disableUnderline
            sx={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              p: 0.5,
              gap: 0.5,
              borderRadius: "xl",
              bgcolor: "background.level1",
              overflowX: "auto",
              [`& .${tabClasses.root}[aria-selected="true"]`]: {
                boxShadow: "sm",
                bgcolor: "background.surface",
              },
            }}>
            {REPORTS.map(({ label }) => (
              <Tab key={label} disableIndicator sx={{ flexShrink: 0 }}>
                {label}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </Box>

      {/* Contenedor del reporte */}
      <Sheet
        variant="soft"
        sx={{
          flex: 1,
          mt: 2,
          width: "100%",
          maxWidth: 1200,
          p: { xs: 2, sm: 3 },
          borderRadius: "md",
          boxShadow: "sm",
          bgcolor: "background.surface",
          overflow: "auto",
        }}>
        <ReportContainer report={selectedReport} />
      </Sheet>
    </Box>
  );
}
