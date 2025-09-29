import React from "react";
import {
  Card,
  Divider,
  Stack,
  Typography,
  Sheet,
  Chip,
  Button,
} from "@mui/joy";
import { ActionBar } from "./_shared/ActionBar.jsx";
import { SectionHeader } from "./_shared/SectionHeader.jsx";

export default function Integraciones() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
      <SectionHeader
        title="Integraciones"
        subtitle="Conecta servicios de terceros.">
        <ActionBar onSave={() => {}} />
      </SectionHeader>
      <Divider />
      <Stack spacing={1.25} sx={{ mt: 1 }}>
        <Sheet variant="soft" sx={{ p: 1.25, borderRadius: 12 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            gap={1}>
            <Stack direction="row" gap={1} alignItems="center">
              <Chip size="sm" color="success" variant="soft">
                Conectado
              </Chip>
              <Typography level="body-sm">SMTP (Email saliente)</Typography>
            </Stack>
            <Stack direction="row" gap={1}>
              <Button variant="outlined">Configurar</Button>
              <Button variant="plain" color="danger">
                Desconectar
              </Button>
            </Stack>
          </Stack>
        </Sheet>
        <Sheet variant="soft" sx={{ p: 1.25, borderRadius: 12 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            gap={1}>
            <Stack direction="row" gap={1} alignItems="center">
              <Chip size="sm" color="neutral" variant="soft">
                No conectado
              </Chip>
              <Typography level="body-sm">Slack</Typography>
            </Stack>
            <Button>Conectar</Button>
          </Stack>
        </Sheet>
      </Stack>
    </Card>
  );
}
