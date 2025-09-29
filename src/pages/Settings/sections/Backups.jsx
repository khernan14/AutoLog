import React from "react";
import {
  Card,
  Divider,
  Stack,
  Typography,
  Button,
  Select,
  Option,
} from "@mui/joy";
import { Download, Upload } from "lucide-react";
import { ActionBar } from "./_shared/ActionBar.jsx";
import { SectionHeader } from "./_shared/SectionHeader.jsx";

export default function Backups() {
  const [autoFreq, setAutoFreq] = React.useState("nunca");
  const [lastBackupAt, setLastBackupAt] = React.useState(null);
  const fileRef = React.useRef(null);

  const exportSettings = () => {
    const settingsSnapshot = {
      theme: localStorage.getItem("ui:theme") || "system",
      accent: localStorage.getItem("ui:accent") || "primary",
      density: Number(localStorage.getItem("ui:density") || 50),
      locale: localStorage.getItem("app:locale") || "es",
      dateFormat: localStorage.getItem("app:dateFormat") || "dd/mm/yyyy",
      accessibility: {
        reduceMotion: localStorage.getItem("a11y:reduceMotion") === "1",
        highContrast: localStorage.getItem("a11y:highContrast") === "1",
        underlineLinks: localStorage.getItem("a11y:underlineLinks") === "1",
      },
    };
    const payload = {
      type: "settings",
      exportedAt: new Date().toISOString(),
      settings: settingsSnapshot,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `settings-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImportClick = () => fileRef.current?.click();
  const importSettings = async (file) => {
    if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      if (json?.settings) {
        localStorage.setItem("ui:theme", json.settings.theme ?? "system");
        localStorage.setItem("ui:accent", json.settings.accent ?? "primary");
        localStorage.setItem("ui:density", String(json.settings.density ?? 50));
        localStorage.setItem("app:locale", json.settings.locale ?? "es");
        localStorage.setItem(
          "app:dateFormat",
          json.settings.dateFormat ?? "dd/mm/yyyy"
        );
        localStorage.setItem(
          "a11y:reduceMotion",
          json.settings.accessibility?.reduceMotion ? "1" : "0"
        );
        localStorage.setItem(
          "a11y:highContrast",
          json.settings.accessibility?.highContrast ? "1" : "0"
        );
        localStorage.setItem(
          "a11y:underlineLinks",
          json.settings.accessibility?.underlineLinks ? "1" : "0"
        );
        alert(
          "Configuración importada. Recarga la página para aplicar completamente."
        );
      }
    } catch {
      alert("Archivo inválido");
    }
  };

  const exportAppData = async () => {
    try {
      const resp = await fetch("/api/admin/export");
      const blob = await resp.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `app-data-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      setLastBackupAt(new Date().toISOString());
    } catch {
      alert("No se pudo generar el respaldo");
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
      <SectionHeader
        title="Respaldo & Backups"
        subtitle="Exporta/Importa configuración y datos de la aplicación.">
        <ActionBar onSave={() => {}} />
      </SectionHeader>
      <Divider />
      <Stack spacing={1.25} sx={{ mt: 1 }}>
        <Typography level="title-sm">Configuración de la app</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} gap={1}>
          <Button
            startDecorator={<Download size={14} />}
            onClick={exportSettings}>
            Exportar configuración
          </Button>
          <Button
            variant="outlined"
            startDecorator={<Upload size={14} />}
            onClick={handleImportClick}>
            Importar configuración
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => importSettings(e.target.files?.[0])}
          />
        </Stack>

        <Divider />

        <Typography level="title-sm">Datos de la aplicación</Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={1}
          alignItems="center">
          <Button
            startDecorator={<Download size={14} />}
            onClick={exportAppData}>
            Exportar datos
          </Button>
          <Typography level="body-xs" color="neutral">
            {lastBackupAt
              ? `Último respaldo: ${new Date(lastBackupAt).toLocaleString()}`
              : "Aún no has generado un respaldo."}
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={1}
          alignItems="center">
          <Typography level="body-sm">Respaldo automático</Typography>
          <Select
            value={autoFreq}
            onChange={(_, v) => setAutoFreq(v || "nunca")}
            sx={{ minWidth: 200 }}>
            <Option value="nunca">Nunca</Option>
            <Option value="diario">Diario</Option>
            <Option value="semanal">Semanal</Option>
            <Option value="mensual">Mensual</Option>
          </Select>
          <Typography level="body-xs" color="neutral">
            (Conéctalo a tu cron/worker del backend)
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
