import React, { useState, useCallback } from "react";
import { Box, Input, Button, Stack, IconButton } from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import ClearIcon from "@mui/icons-material/Clear";

export default function SearchBar({ onSearch, onAdd }) {
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
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        mb: 2,
      }}>
      <Input
        placeholder="Buscar vehículo..."
        aria-label="Buscar vehículo"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        startDecorator={<SearchRoundedIcon />}
        endDecorator={
          search && (
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={clearSearch}
              aria-label="Limpiar búsqueda">
              <ClearIcon />
            </IconButton>
          )
        }
        sx={{ width: { xs: "100%", sm: "300px" } }}
      />

      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button
          variant="solid"
          color="primary"
          startDecorator={<NoteAddIcon />}
          onClick={onAdd}
          aria-label="Registrar uso de vehículo">
          Registrar Uso
        </Button>
      </Stack>
    </Box>
  );
}
