import { useState, useCallback } from "react";
import { Box, Input, Button, Stack, IconButton } from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ClearIcon from "@mui/icons-material/Clear";

export default function CountriesToolBar({ onSearch, onAdd }) {
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
        placeholder="Buscar países..."
        aria-label="Buscar países"
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
          startDecorator={<AddRoundedIcon />}
          onClick={onAdd}
          aria-label="Agregar nuevo país">
          Agregar país
        </Button>
      </Stack>
    </Box>
  );
}
