import { Box } from "@mui/joy";
import RegisterReport from "../../../Reports/RegisterReport";
import ReportB from "../../../Reports/ReportB";
import ReportC from "../../../Reports/ReportC";

const reportMap = {
  registerReport: RegisterReport,
  reportB: ReportB,
  reportC: ReportC,
};

export default function ReportContainer({ report }) {
  const SelectedReport = reportMap[report] || null;

  return (
    <Box sx={{ flex: 1, p: 3 }}>
      {SelectedReport ? <SelectedReport /> : <p>No se encontró el reporte</p>}
    </Box>
  );
}
