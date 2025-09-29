import React from "react";
import { Stack, Typography } from "@mui/joy";

export function SectionHeader({ title, subtitle, children }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent="space-between"
      sx={{ mb: 1 }}>
      <Stack spacing={0.25}>
        <Typography level="title-md">{title}</Typography>
        {subtitle && (
          <Typography level="body-sm" color="neutral">
            {subtitle}
          </Typography>
        )}
      </Stack>
      {children}
    </Stack>
  );
}
