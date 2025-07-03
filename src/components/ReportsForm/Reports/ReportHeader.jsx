import { Typography } from "@mui/joy";

export default function ReportHeader({ title }) {
  return (
    <Typography level="h2" mb={2}>
      {title}
    </Typography>
  );
}
