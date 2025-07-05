// components/ComponentsReport/RegisterReport/ReportFilters.jsx
import { Box, Input } from "@mui/joy";

export default function ReportFilters({
  search,
  setSearch,
  dateRange,
  setDateRange,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        mt: 1,
        mb: 2,
      }}>
      <Input
        placeholder="Buscar por nombre, vehículo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ flex: 2, minWidth: 240 }}
      />
      <Input
        type="date"
        value={dateRange.start}
        onChange={(e) =>
          setDateRange((prev) => ({ ...prev, start: e.target.value }))
        }
        sx={{ flex: 1, minWidth: 150 }}
      />
      <Input
        type="date"
        value={dateRange.end}
        onChange={(e) =>
          setDateRange((prev) => ({ ...prev, end: e.target.value }))
        }
        sx={{ flex: 1, minWidth: 150 }}
      />
    </Box>
  );
}
