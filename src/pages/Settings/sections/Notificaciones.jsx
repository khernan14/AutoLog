import React from "react";
import {
  Card,
  Divider,
  Stack,
  Typography,
  Switch,
  Select,
  Option,
} from "@mui/joy";
import { ActionBar } from "./_shared/ActionBar.jsx";
import { SectionHeader } from "./_shared/SectionHeader.jsx";

export default function Notificaciones() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
      <SectionHeader
        title="Notificaciones"
        subtitle="Controla los tipos y la frecuencia.">
        <ActionBar onSave={() => {}} />
      </SectionHeader>
      <Divider />
      <Stack spacing={1.25} sx={{ mt: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Switch defaultChecked />
          <Typography level="body-sm">Email de eventos críticos</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <Switch />
          <Typography level="body-sm">Resumen diario</Typography>
          <Select
            placeholder="Frecuencia"
            defaultValue="diario"
            sx={{ minWidth: 160 }}>
            <Option value="diario">Diario</Option>
            <Option value="semanal">Semanal</Option>
            <Option value="mensual">Mensual</Option>
          </Select>
        </Stack>
        <Stack direction="row" alignItems="center" gap={1}>
          <Switch />
          <Typography level="body-sm">Alertas de fallas (email)</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
