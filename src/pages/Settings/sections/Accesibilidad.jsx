import React from "react";
import { Card, Divider, Stack, Typography, Switch } from "@mui/joy";
import { ActionBar } from "./_shared/ActionBar.jsx";
import { SectionHeader } from "./_shared/SectionHeader.jsx";

export default function Accesibilidad() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
      <SectionHeader
        title="Accesibilidad"
        subtitle="Preferencias para mejorar la legibilidad y uso.">
        <ActionBar onSave={() => {}} />
      </SectionHeader>
      <Divider />
      <Stack spacing={1.25} sx={{ mt: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Switch />
          <Typography level="body-sm">
            Reducir animaciones (reduce motion)
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <Switch />
          <Typography level="body-sm">Alto contraste</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <Switch />
          <Typography level="body-sm">Subrayar enlaces</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
