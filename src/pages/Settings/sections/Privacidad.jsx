import React from "react";
import { Card, Divider, Stack, Typography, Switch, Button } from "@mui/joy";
import { Download, Trash2 } from "lucide-react";
import { ActionBar } from "./_shared/ActionBar.jsx";
import { SectionHeader } from "./_shared/SectionHeader.jsx";

export default function Privacidad() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
      <SectionHeader
        title="Datos & Privacidad"
        subtitle="Control sobre tus datos y analítica.">
        <ActionBar onSave={() => {}} />
      </SectionHeader>
      <Divider />
      <Stack spacing={1.25} sx={{ mt: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Switch defaultChecked />
          <Typography level="body-sm">
            Permitir uso de datos anónimos para mejorar el producto
          </Typography>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
          <Button variant="outlined" startDecorator={<Download size={14} />}>
            Descargar mis datos
          </Button>
          <Button
            variant="plain"
            color="danger"
            startDecorator={<Trash2 size={14} />}>
            Eliminar cuenta
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
