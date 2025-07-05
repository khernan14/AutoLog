import { Box, Typography, Sheet } from "@mui/joy";
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
    <Sheet
      variant="outlined"
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: "md",
        p: { xs: 2, sm: 3 },
        boxShadow: "sm",
        bgcolor: "background.level1",
        overflow: "auto",
      }}>
      {SelectedReport ? (
        <SelectedReport />
      ) : (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            p: 2,
          }}>
          <Typography level="title-md" color="neutral">
            No se encontró el reporte seleccionado.
          </Typography>
        </Box>
      )}
    </Sheet>
  );
}
