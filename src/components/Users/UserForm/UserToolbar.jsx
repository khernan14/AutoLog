import { useMemo } from "react";
import {
  Box,
  Input,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Switch,
  Chip,
} from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";

export default function UserToolbar({
  search,
  onSearch,
  showInactive,
  onToggleInactive,
  onNew,
  canCreate,
  selectedCount = 0,
  onBulkDelete,
  canBulkDelete,
}) {
  const hasSelection = selectedCount > 0;

  return (
    <Box
      sx={{
        mb: 2,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        gap: 1.5,
      }}>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ width: { xs: "100%", sm: "auto" } }}>
        <Input
          placeholder="Buscar por nombre, email, usuario, rol, puesto o ciudad…"
          value={search}
          onChange={(e) => onSearch?.(e.target.value)}
          startDecorator={<SearchRoundedIcon />}
          endDecorator={
            search && (
              <IconButton
                size="sm"
                variant="plain"
                color="neutral"
                onClick={() => onSearch?.("")}
                aria-label="Limpiar búsqueda">
                <ClearIcon />
              </IconButton>
            )
          }
          sx={{ width: { xs: "100%", sm: 360 } }}
        />

        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          sx={{ ml: 0.5 }}>
          <Switch
            checked={!!showInactive}
            onChange={(e) => onToggleInactive?.(e.target.checked)}
            slotProps={{ input: { "aria-label": "Ver inactivos" } }}
          />
          <span style={{ fontSize: 13, opacity: 0.9 }}>Ver inactivos</span>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        justifyContent={{ xs: "space-between", sm: "flex-end" }}>
        {hasSelection && (
          <Tooltip
            title={
              canBulkDelete
                ? "Inactivar seleccionados"
                : "Sin permiso para inactivar"
            }
            variant="soft">
            <span>
              <Button
                startDecorator={<DeleteForeverRoundedIcon />}
                color="danger"
                variant={canBulkDelete ? "soft" : "plain"}
                disabled={!canBulkDelete}
                onClick={onBulkDelete}>
                Inactivar ({selectedCount})
              </Button>
            </span>
          </Tooltip>
        )}

        <Tooltip
          title={canCreate ? "Crear usuario" : "No tienes permiso para crear."}
          variant="soft"
          placement="top-end">
          <span>
            <Button
              startDecorator={<AddRoundedIcon />}
              onClick={onNew}
              disabled={!canCreate}
              aria-disabled={!canCreate}
              variant={canCreate ? "solid" : "soft"}
              color={canCreate ? "primary" : "neutral"}>
              Nuevo
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
}
