import { Box, Sheet } from "@mui/joy";
import { useState } from "react";
import Sidebar from "../../components/ReportsForm/Layouts/Sidebar.jsx";
import ReportContainer from "../../components/ReportsForm/Reports/ReportContainer.jsx";

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("registerReport");

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Sidebar selected={selectedReport} onSelect={setSelectedReport} />
      <Sheet variant="soft" sx={{ flex: 1 }}>
        <ReportContainer report={selectedReport} />
      </Sheet>
    </Box>
  );
}
