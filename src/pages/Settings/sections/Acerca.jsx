import React from "react";
import { Card, Divider, Stack, Typography, Sheet, Button } from "@mui/joy";
import { ActionBar } from "./_shared/ActionBar.jsx";
import { SectionHeader } from "./_shared/SectionHeader.jsx";

export default function Acerca() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
      <SectionHeader
        title="Acerca de"
        subtitle="Información general sobre la aplicación y sus componentes.">
        <ActionBar onSave={() => {}} />
      </SectionHeader>
      <Divider />
      <Stack spacing={1.25} sx={{ mt: 1 }}>
        <Typography level="title-sm">Información</Typography>
        <Sheet variant="soft" sx={{ p: 1.25, borderRadius: 12 }}>
          <Stack spacing={0.75}>
            <Row label="Versión de la Aplicación" value="1.0.0" />
            <Row label="Número de Compilación" value="20240706.1" />
            <Row label="Desarrollado por" value="HernDevs" />
            <Row
              label="Copyright"
              value="© 2025 HernDevs. Todos los derechos reservados."
            />
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
            <Button variant="outlined">Ver licencias</Button>
            <Button variant="plain">Leer términos</Button>
            <Button variant="plain">Leer política</Button>
          </Stack>
        </Sheet>
      </Stack>
    </Card>
  );
}

function Row({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography level="body-sm" color="neutral">
        {label}
      </Typography>
      <Typography level="body-sm" fontWeight={600}>
        {value}
      </Typography>
    </Stack>
  );
}
