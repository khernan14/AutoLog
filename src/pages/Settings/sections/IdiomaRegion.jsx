import React from "react";
import {
  Card,
  Divider,
  Stack,
  Typography,
  Select,
  Option,
  Switch,
} from "@mui/joy";
import { ActionBar } from "./_shared/ActionBar.jsx";
import { SectionHeader } from "./_shared/SectionHeader.jsx";

export default function IdiomaRegion() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
      <SectionHeader
        title="Idioma & Región"
        subtitle="Formato, zona horaria y preferencias regionales.">
        <ActionBar onSave={() => {}} />
      </SectionHeader>
      <Divider />
      <Stack spacing={1.25} sx={{ mt: 1 }}>
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
          <Select defaultValue="es" sx={{ flex: 1 }}>
            <Option value="es">Español</Option>
            <Option value="en">English</Option>
          </Select>
          <Select defaultValue="America/Tegucigalpa" sx={{ flex: 1 }}>
            <Option value="America/Tegucigalpa">UTC-6 (Tegucigalpa)</Option>
            <Option value="America/Mexico_City">UTC-6 (CDMX)</Option>
            <Option value="America/Bogota">UTC-5 (Bogotá)</Option>
            <Option value="UTC">UTC</Option>
          </Select>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
          <Select defaultValue="dd/mm/yyyy" sx={{ flex: 1 }}>
            <Option value="dd/mm/yyyy">dd/mm/yyyy</Option>
            <Option value="mm/dd/yyyy">mm/dd/yyyy</Option>
            <Option value="yyyy-mm-dd">yyyy-mm-dd</Option>
          </Select>
          <Stack direction="row" alignItems="center" gap={1} sx={{ flex: 1 }}>
            <Switch defaultChecked />
            <Typography level="body-sm">Usar formato 24h</Typography>
          </Stack>
          <Select defaultValue="lunes" sx={{ flex: 1 }}>
            <Option value="domingo">Comienza en domingo</Option>
            <Option value="lunes">Comienza en lunes</Option>
          </Select>
        </Stack>
      </Stack>
    </Card>
  );
}
