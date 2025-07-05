import { Box, Input } from "@mui/joy";
import { useState, useEffect } from "react";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

export default function HeaderBar({}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        p: 2,
      }}>
      <Input
        placeholder="Buscar reporte..."
        sx={{
          width: "100%",
          height: "2.5rem",
          fontSize: "1rem",
          mb: 1,
          borderRadius: "md",
        }}
      />
    </Box>
  );
}
