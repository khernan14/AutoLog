import React, { useState } from "react";
import {
  Box,
  Sheet,
  Card,
  Stack,
  Typography,
  Button,
  IconButton,
  Input,
  Textarea,
  Select,
  Option,
  Switch,
  Radio,
  RadioGroup,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  Avatar,
  Tooltip,
  Slider,
} from "@mui/joy";
import {
  User,
  Lock,
  Paintbrush,
  Bell,
  Globe,
  Info,
  Plug,
  Accessibility as AccessibilityIcon,
  Shield,
  KeyRound,
  Download,
  Trash2,
  Sun,
  Moon,
  Monitor,
  Upload,
  Database,
} from "lucide-react";

const NAV = [
  { key: "perfil", label: "Perfil", icon: <User size={16} /> },
  { key: "seguridad", label: "Seguridad", icon: <Lock size={16} /> },
  { key: "apariencia", label: "Apariencia", icon: <Paintbrush size={16} /> },
  { key: "notificaciones", label: "Notificaciones", icon: <Bell size={16} /> },
  { key: "idioma", label: "Idioma & Región", icon: <Globe size={16} /> },
  {
    key: "accesibilidad",
    label: "Accesibilidad",
    icon: <AccessibilityIcon size={16} />,
  },
  { key: "integraciones", label: "Integraciones", icon: <Plug size={16} /> },
  {
    key: "privacidad",
    label: "Datos & Privacidad",
    icon: <Shield size={16} />,
  },
  { key: "backups", label: "Respaldo & Backups", icon: <Database size={16} /> },
  { key: "acerca", label: "Acerca de", icon: <Info size={16} /> },
];

function SectionHeader({ title, subtitle, children }) {
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

function ActionBar({ onSave, onReset, saving }) {
  return (
    <Stack direction="row" gap={1}>
      {onReset && (
        <Button variant="plain" onClick={onReset}>
          Restablecer
        </Button>
      )}
      <Button onClick={onSave} loading={saving}>
        Guardar cambios
      </Button>
    </Stack>
  );
}

function PerfilSection() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
      <SectionHeader title="Perfil" subtitle="Información básica de tu cuenta.">
        <ActionBar onSave={() => {}} />
      </SectionHeader>
      <Divider />
      <Stack spacing={1.25} sx={{ mt: 1 }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Avatar size="lg">AP</Avatar>
          <Stack direction="row" gap={1}>
            <Button variant="outlined">Cambiar foto</Button>
            <Button variant="plain">Quitar</Button>
          </Stack>
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
          <Input placeholder="Nombre completo" sx={{ flex: 1 }} />
          <Input placeholder="Correo" type="email" sx={{ flex: 1 }} />
        </Stack>
        <Textarea minRows={3} placeholder="Descripción / Bio" />
      </Stack>
    </Card>
  );
}

function SeguridadSection() {
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

function BackupsSection() {
  const [autoFreq, setAutoFreq] = React.useState("nunca");
  const [lastBackupAt, setLastBackupAt] = React.useState(null);
  const fileRef = React.useRef(null);

  const exportSettings = () => {
    // TODO: reemplazar por tu store real (localStorage/API)
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
        // TODO: aplica el mapeo real de tu app
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
      // TODO: cambia por tu endpoint real de exportación de datos
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

function AparienciaSection() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 16, boxShadow: "sm" }}>
      <SectionHeader
        title="Apariencia"
        subtitle="Tema, densidad y color de acento.">
        <ActionBar onSave={() => {}} onReset={() => {}} />
      </SectionHeader>
      <Divider />
      <Stack spacing={1.25} sx={{ mt: 1 }}>
        <Typography level="title-sm">Tema</Typography>
        <RadioGroup
          orientation="horizontal"
          defaultValue="system"
          sx={{ gap: 1.25 }}>
          <Radio
            value="light"
            label={
              <Stack direction="row" gap={0.5} alignItems="center">
                <Sun size={14} /> Claro
              </Stack>
            }
          />
          <Radio
            value="dark"
            label={
              <Stack direction="row" gap={0.5} alignItems="center">
                <Moon size={14} /> Oscuro
              </Stack>
            }
          />
          <Radio
            value="system"
            label={
              <Stack direction="row" gap={0.5} alignItems="center">
                <Monitor size={14} /> Sistema
              </Stack>
            }
          />
        </RadioGroup>

        <Typography level="title-sm" sx={{ mt: 0.5 }}>
          Color de acento
        </Typography>
        <Select
          placeholder="Selecciona un color"
          defaultValue="primary"
          sx={{ maxWidth: 260 }}>
          <Option value="primary">Primary</Option>
          <Option value="neutral">Neutral</Option>
          <Option value="info">Info</Option>
          <Option value="success">Success</Option>
          <Option value="warning">Warning</Option>
          <Option value="danger">Danger</Option>
        </Select>

        <Typography level="title-sm" sx={{ mt: 0.5 }}>
          Densidad de interfaz
        </Typography>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography level="body-xs" sx={{ minWidth: 56 }}>
            Compacta
          </Typography>
          <Slider defaultValue={50} sx={{ flex: 1 }} />
          <Typography level="body-xs" sx={{ minWidth: 56, textAlign: "right" }}>
            Cómoda
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}

function NotificacionesSection() {
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

function IdiomaRegionSection() {
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

function AccesibilidadSection() {
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

function IntegracionesSection() {
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

function PrivacidadSection() {
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

function AcercaSection() {
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
            <Stack direction="row" justifyContent="space-between">
              <Typography level="body-sm" color="neutral">
                Versión de la Aplicación
              </Typography>
              <Typography level="body-sm" fontWeight={600}>
                1.0.0
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography level="body-sm" color="neutral">
                Número de Compilación
              </Typography>
              <Typography level="body-sm" fontWeight={600}>
                20240706.1
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography level="body-sm" color="neutral">
                Desarrollado por
              </Typography>
              <Typography level="body-sm" fontWeight={600}>
                HernDevs
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography level="body-sm" color="neutral">
                Copyright
              </Typography>
              <Typography level="body-sm" fontWeight={600}>
                © 2025 HernDevs. Todos los derechos reservados.
              </Typography>
            </Stack>
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

export default function SettingsPage() {
  const [active, setActive] = useState("perfil");

  return (
    <Box
      sx={{
        bgcolor: "background.level1",
        minHeight: "100dvh",
        color: "text.primary",
      }}>
      {/* Header simple */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, pt: 2, pb: 1 }}>
        <Typography level="h3">Configuración</Typography>
        <Typography level="body-sm" color="neutral">
          Administra tu perfil y preferencias de la aplicación.
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2, pb: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} gap={1.5}>
          {/* NAV lateral */}
          <Card
            variant="outlined"
            sx={{
              width: { xs: "100%", md: 280 },
              flexShrink: 0,
              borderRadius: 16,
              boxShadow: "sm",
              position: "sticky",
              top: 12,
              alignSelf: "flex-start",
            }}>
            <List size="sm" sx={{ "--ListItem-radius": "10px" }}>
              {NAV.map((item) => (
                <ListItem key={item.key}>
                  <ListItemButton
                    selected={active === item.key}
                    onClick={() => setActive(item.key)}
                    variant={active === item.key ? "soft" : "plain"}
                    color={active === item.key ? "primary" : "neutral"}>
                    <ListItemDecorator>{item.icon}</ListItemDecorator>
                    {item.label}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>

          {/* CONTENIDO */}
          <Stack flex={1} gap={1.25}>
            {active === "perfil" && <PerfilSection />}
            {active === "seguridad" && <SeguridadSection />}
            {active === "apariencia" && <AparienciaSection />}
            {active === "notificaciones" && <NotificacionesSection />}
            {active === "idioma" && <IdiomaRegionSection />}
            {active === "accesibilidad" && <AccesibilidadSection />}
            {active === "integraciones" && <IntegracionesSection />}
            {active === "privacidad" && <PrivacidadSection />}
            {active === "backups" && <BackupsSection />}
            {active === "acerca" && <AcercaSection />}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
