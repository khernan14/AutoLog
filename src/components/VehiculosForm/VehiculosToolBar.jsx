import * as React from "react";
import { Stack, Box, Input, Button, Tooltip, Chip } from "@mui/joy";
import AddIcon from "@mui/icons-material/Add";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ClearIcon from "@mui/icons-material/Clear";

/**
 * Props:
 * - t: function translation (i18next)
 * - searchText?: string
 * - onSearch?: (text) => void
 * - showInactive: boolean
 * - setShowInactive: (bool) => void
 * - canAdd: boolean
 * - onAdd: () => void
 * - addDisabledReason?: string
 */
export default function VehiculosToolBar({
  t,
  searchText,
  onSearch,
  showInactive = false,
  setShowInactive,
  canAdd = false,
  onAdd,
  addDisabledReason,
}) {
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
        <Tooltip
          title={t?.(
            "vehiculos.search_tooltip",
            "Buscar por placa, marca, modelo o ubicación…"
          )}>
          <Input
            placeholder={t?.("vehiculos.search_placeholder", "Buscar…")}
            value={value}
            onChange={handleSearchChange}
            startDecorator={<SearchRoundedIcon />}
            endDecorator={
              value && (
                <Button
                  size="sm"
                  variant="plain"
                  color="neutral"
                  onClick={clearSearch}
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
        <Chip
          onClick={() => setShowInactive?.(!showInactive)}
          variant={showInactive ? "solid" : "soft"}
          color={showInactive ? "warning" : "neutral"}
          startDecorator={<Inventory2RoundedIcon />}
          sx={{ cursor: "pointer" }}>
          {t?.("vehiculos.show_inactive", "Ver inactivos")}
        </Chip>

        <Tooltip
          title={
            canAdd
              ? t?.("vehiculos.add_vehicle", "Agregar vehículo")
              : addDisabledReason ||
                t?.(
                  "vehiculos.request_permission",
                  "No tienes permiso para crear. Solicítalo al administrador."
                )
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
              {t?.("vehiculos.add_button", "Agregar")}
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
