import React from "react";
import { Box, Input, Button, Stack } from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import NoteAddIcon from "@mui/icons-material/NoteAdd";

export default function SearchBar({ onSearch, onAdd }) {
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
        placeholder="Buscar usuario..."
        startDecorator={<SearchRoundedIcon />}
        onChange={(e) => onSearch(e.target.value)}
        sx={{ width: { xs: "100%", sm: "300px" } }}
      />

      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button
          variant="solid"
          color="primary"
          startDecorator={<NoteAddIcon />}
          onClick={onAdd}>
          Registrar Uso
        </Button>
      </Stack>
    </Box>
  );
}
