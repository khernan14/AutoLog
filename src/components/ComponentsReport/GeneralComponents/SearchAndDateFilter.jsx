import {
  Input,
  Button,
  Box,
  Typography,
  Stack,
  Dropdown,
  MenuButton,
  Menu,
  MenuItem,
} from "@mui/joy";
import ToggleButtonGroup from "@mui/joy/ToggleButtonGroup";

export default function SearchAndDateFilter({
  search,
  onSearchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  statusFilter,
  onStatusFilterChange,
  onClear,
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      alignItems={{ sm: "center" }}
      sx={{ mt: 2, mb: 2 }}>
      {/* Buscar */}
      <Box>
        <Typography level="body-xs" mb={0.5}>
          Buscar por nombre, vehículo, etc...
        </Typography>
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ flex: 1 }}
        />
      </Box>

      {/* Fecha inicio */}
      <Box>
        <Typography level="body-xs" mb={0.5}>
          Fecha inicio
        </Typography>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          sx={{ minWidth: 140 }}
        />
      </Box>

      {/* Fecha fin */}
      <Box>
        <Typography level="body-xs" mb={0.5}>
          Fecha fin
        </Typography>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          sx={{ minWidth: 140 }}
        />
      </Box>

      {/* Estado */}
      <Box>
        <Typography level="body-xs" mb={0.5}>
          Estado
        </Typography>
        <ToggleButtonGroup
          value={statusFilter}
          onChange={(e, newValue) => {
            if (newValue !== null) onStatusFilterChange(newValue);
          }}
          exclusive
          sx={{ minWidth: 160 }}>
          <Button
            value="todos"
            variant={statusFilter === "todos" ? "solid" : "outlined"}>
            Todos
          </Button>
          <Button value="activos">Activos</Button>
          <Button value="finalizados">Finalizados</Button>
        </ToggleButtonGroup>
      </Box>

      {/* Botón limpiar */}
      <Box>
        <Button sx={{ mt: 2.7 }} variant="outlined" onClick={onClear}>
          Limpiar filtros
        </Button>
      </Box>
    </Stack>
  );
}
