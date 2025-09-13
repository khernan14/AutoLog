import React, { useState, useCallback } from "react";
import { Box, Input, Button, Stack, IconButton, Tooltip } from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import ClearIcon from "@mui/icons-material/Clear";

export default function SearchBar({
  onSearch,
  onAdd,
  canAdd = true,
  inputMaxWidth = 360, // 👈 control externo del ancho
}) {
  const [search, setSearch] = useState("");

  const handleSearch = useCallback(
    (value) => {
      setSearch(value);
      onSearch?.(value);
    },
    [onSearch]
  );

  const clear = () => handleSearch("");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "wrap",
      }}>
      <Input
        placeholder="Buscar por placa, marca o modelo…"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        startDecorator={<SearchRoundedIcon />}
        endDecorator={
          search ? (
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={clear}
              aria-label="Limpiar búsqueda">
              <ClearIcon />
            </IconButton>
          ) : null
        }
        sx={{
          flex: "1 1 auto",
          minWidth: 160,
          maxWidth: { xs: "100%", sm: inputMaxWidth },
        }}
      />

      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Tooltip
          variant="soft"
          title={
            canAdd
              ? "Registrar uso de vehículo"
              : "No tienes permiso para registrar uso"
          }
          placement="bottom-end">
          <span>
            <Button
              variant={canAdd ? "solid" : "soft"}
              color={canAdd ? "primary" : "neutral"}
              startDecorator={<NoteAddIcon />}
              onClick={onAdd}
              disabled={!canAdd}
              aria-disabled={!canAdd}
              aria-label="Registrar uso de vehículo">
              Registrar Uso
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
}
