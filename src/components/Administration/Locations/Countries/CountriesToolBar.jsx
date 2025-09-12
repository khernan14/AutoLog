import { useState, useCallback } from "react";
import { Box, Input, Button, Stack, IconButton, Tooltip } from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ClearIcon from "@mui/icons-material/Clear";

export default function CountriesToolBar({
  onSearch,
  onAdd,
  canAdd = true,
  placeholder = "Buscar países…",
  addLabel = "Nuevo",
}) {
  const [search, setSearch] = useState("");

  const handleSearch = useCallback(
    (value) => {
      setSearch(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  const clearSearch = useCallback(() => {
    setSearch("");
    onSearch?.("");
  }, [onSearch]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        gap: 1.5,
        mb: 2,
      }}
    >
      {/* Search */}
      <Input
        variant="soft"
        size="md"
        placeholder={placeholder}
        aria-label="Buscar países"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") clearSearch();
        }}
        startDecorator={<SearchRoundedIcon />}
        endDecorator={
          search ? (
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={clearSearch}
              aria-label="Limpiar búsqueda"
            >
              <ClearIcon />
            </IconButton>
          ) : null
        }
        sx={{
          flex: 1,
          minWidth: { xs: "100%", sm: 280 },
          maxWidth: { sm: 520, md: 640 },
        }}
      />

      {/* Actions */}
      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
        <Tooltip
          title={
            canAdd
              ? "Crear país"
              : "No tienes permiso para crear. Solicítalo al administrador."
          }
          variant="solid"
          placement="bottom-end"
        >
          {/* wrapper para tooltip con disabled */}
          <span>
            <Button
              startDecorator={<AddRoundedIcon />}
              onClick={onAdd}
              disabled={!canAdd}
              aria-disabled={!canAdd}
              variant={canAdd ? "solid" : "soft"}
              color={canAdd ? "primary" : "neutral"}
            >
              {addLabel}
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
}
