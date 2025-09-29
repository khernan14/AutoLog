import React from "react";
import {
  Card,
  Divider,
  Stack,
  Typography,
  Input,
  Switch,
  Select,
  Option,
  Button,
} from "@mui/joy";
import { KeyRound } from "lucide-react";
import { ActionBar } from "./_shared/ActionBar.jsx";
import { SectionHeader } from "./_shared/SectionHeader.jsx";

export default function Seguridad() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
      <SectionHeader
        title="Seguridad"
        subtitle="Contraseña y métodos de autenticación.">
        <ActionBar onSave={() => {}} />
      </SectionHeader>
      <Divider />
      <Stack spacing={1.25} sx={{ mt: 1 }}>
        <Typography level="title-sm">Cambiar contraseña</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
          <Input
            type="password"
            placeholder="Contraseña actual"
            sx={{ flex: 1 }}
          />
          <Input
            type="password"
            placeholder="Nueva contraseña"
            sx={{ flex: 1 }}
          />
          <Input
            type="password"
            placeholder="Confirmar nueva"
            sx={{ flex: 1 }}
          />
        </Stack>
        <Divider />
        <Typography level="title-sm">
          Verificación en dos pasos (2FA)
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={1.25}>
          <Switch defaultChecked />
          <Typography level="body-sm">Habilitar 2FA</Typography>
          <Select placeholder="Método" sx={{ minWidth: 220 }}>
            <Option value="app">App de autenticación (TOTP)</Option>
            <Option value="email">Código por email</Option>
            <Option value="sms">SMS (no recomendado)</Option>
          </Select>
          <Button variant="outlined" startDecorator={<KeyRound size={14} />}>
            Códigos de respaldo
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
