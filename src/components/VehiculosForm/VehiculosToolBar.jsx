import * as React from "react";
import {
  Stack,
  Box,
  Input,
  Button,
  Tooltip,
  Chip,
  IconButton,
  Typography,
} from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ClearIcon from "@mui/icons-material/Clear";

/**
 * Presentacional (sin lógica de permisos interna).
 * Props:
 * - searchText?: string              // (opcional) para modo controlado
 * - onSearch?: (text: string) => void
 * - showInactive: boolean
 * - setShowInactive: (bool) => void
 * - canAdd: boolean
 * - onAdd: () => void
 * - addDisabledReason?: string
 */
export default function VehiculosToolBar({
  searchText,
  onSearch,
  showInactive = false,
  setShowInactive,
  canAdd = false,
  onAdd,
  addDisabledReason,
}) {
  // Mantener editable aunque el padre no pase searchText (fallback no controlado)
  const [localSearch, setLocalSearch] = React.useState(searchText ?? "");
  React.useEffect(() => {
    if (typeof searchText === "string") setLocalSearch(searchText);
  }, [searchText]);

  const value = typeof searchText === "string" ? searchText : localSearch;

  const handleSearchChange = (e) => {
    const v = e.target.value;
    setLocalSearch(v);
    onSearch?.(v);
  };

  const clearSearch = () => {
    setLocalSearch("");
    onSearch?.("");
  };

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "stretch", sm: "center" }}
      spacing={1.5}
      sx={{ mb: 2 }}>
      {/* Búsqueda */}
      <Box sx={{ flex: 1 }}>
        {/* <Input
          placeholder="Buscar por placa, marca, modelo o ubicación…"
          startDecorator={<SearchRoundedIcon />}
          endDecorator={
            value ? (
              <IconButton
                size="sm"
                variant="plain"
                onClick={clearSearch}
                aria-label="Limpiar búsqueda"
              >
                <CloseRoundedIcon />
              </IconButton>
            ) : null
          }
          value={value}
          onChange={handleSearchChange}
          aria-label="Buscar vehículos"
          // Ancho moderno y responsivo
          sx={{
            width: { xs: "100%", sm: 320, md: 380 },
          }}
          size="md"
          variant="soft"
        /> */}
        <Tooltip title="Buscar por placa, marca, modelo o ubicación…">
          <Input
            placeholder="Buscar…"
            value={value}
            onChange={handleSearchChange}
            startDecorator={<SearchRoundedIcon />}
            endDecorator={
              value && (
                <Button
                  size="sm"
                  variant="plain"
                  color="neutral"
                  onClick={() => setSearch("")}
                  sx={{ minWidth: "auto", px: 0.5 }}>
                  <ClearIcon fontSize="small" />
                </Button>
              )
            }
            sx={{ width: { xs: "100%", md: 260 } }}
            size="md"
          />
        </Tooltip>
      </Box>

      {/* Controles derechos */}
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        {/* Toggle de inactivos como pill */}
        <Chip
          onClick={() => setShowInactive?.(!showInactive)}
          variant={showInactive ? "solid" : "soft"}
          color={showInactive ? "warning" : "neutral"}
          startDecorator={<Inventory2RoundedIcon />}
          sx={{ cursor: "pointer" }}>
          Ver inactivos
        </Chip>

        {/* Agregar */}
        <Tooltip
          title={
            canAdd
              ? "Agregar vehículo"
              : addDisabledReason ||
                "No tienes permiso para crear. Solicítalo al administrador."
          }
          variant="soft"
          placement="top">
          <span>
            <Button
              startDecorator={<AddIcon />}
              onClick={onAdd}
              disabled={!canAdd}
              aria-disabled={!canAdd}
              variant={canAdd ? "solid" : "soft"}
              color={canAdd ? "primary" : "neutral"}>
              Agregar
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
