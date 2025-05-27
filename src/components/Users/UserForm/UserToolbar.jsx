// components/UserToolbar.jsx
import React from "react";
import { Box, Input, Button, Stack } from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

export default function UserToolbar({ onSearch, onAdd }) {
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
          variant="outlined"
          color="neutral"
          startDecorator={<PrintRoundedIcon />}>
          Imprimir
        </Button>
        <Button
          variant="outlined"
          color="neutral"
          startDecorator={<PictureAsPdfRoundedIcon />}>
          PDF
        </Button>
        <Button
          variant="outlined"
          color="neutral"
          startDecorator={<FileDownloadRoundedIcon />}>
          Excel
        </Button>
        <Button
          variant="solid"
          color="primary"
          startDecorator={<AddRoundedIcon />}
          onClick={onAdd}>
          Agregar Usuario
        </Button>
      </Stack>
    </Box>
  );
}
