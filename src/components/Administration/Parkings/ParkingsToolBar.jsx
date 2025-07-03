import { Box, Input, Button, Stack } from "@mui/joy";
import SearchIcon from "@mui/icons-material/SearchRounded";
import AddIcon from "@mui/icons-material/AddRounded";

export default function ParkingsToolbar({ onSearch, onAdd }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        mb: 2,
      }}>
      <Input
        placeholder="Buscar estacionamientos..."
        startDecorator={<SearchIcon />}
        onChange={(e) => onSearch?.(e.target.value)}
        sx={{ width: { xs: "100%", sm: 300 } }}
      />

      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button
          startDecorator={<AddIcon />}
          variant="solid"
          color="primary"
          onClick={onAdd}>
          Agregar Estacionamiento
        </Button>
      </Stack>
    </Box>
  );
}
