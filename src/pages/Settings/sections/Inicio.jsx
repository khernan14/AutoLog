import React from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Divider,
  LinearProgress,
  Chip,
} from "@mui/joy";
import {
  ShieldCheck,
  ShieldAlert,
  Palette,
  ExternalLink,
  Fingerprint,
  Lock,
} from "lucide-react";
import { SectionHeader } from "./_shared/SectionHeader.jsx";

function InfoCard({
  icon: Icon,
  title,
  desc,
  actionLabel,
  onAction,
  color = "primary",
  badge,
}) {
  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 200,
        boxShadow: "sm",
        position: "relative",
        overflow: "hidden",
      }}>
      {/* Barra lateral de color decorativa */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: `${color}.500`,
        }}
      />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={1}>
        <Stack direction="row" gap={2} alignItems="center">
          <Box
            sx={{
              p: 1,
              borderRadius: "md",
              bgcolor: `${color}.100`,
              color: `${color}.600`,
            }}>
            <Icon size={24} />
          </Box>
          <Typography level="title-md">{title}</Typography>
        </Stack>
        {badge && (
          <Chip size="sm" color={color} variant="soft">
            {badge}
          </Chip>
        )}
      </Stack>

      <Typography level="body-sm" mb={2} flex={1} sx={{ pl: 1 }}>
        {desc}
      </Typography>

      {actionLabel && (
        <Button
          variant="soft"
          color={color}
          size="sm"
          onClick={onAction}
          endDecorator={<ExternalLink size={14} />}
          sx={{ ml: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}

export default function Inicio({ allSettings, onNavigate }) {
  // Leemos la configuración de seguridad del objeto global
  const seg = allSettings?.seguridad || {};

  // Calculamos el nivel de seguridad
  const has2FA = !!seg.tfa_enabled;
  const hasAlerts = !!seg.login_alerts; // Asumimos true por defecto en DB, pero valida tu lógica

  // Lógica de estado de seguridad
  const isSecure = has2FA && hasAlerts;
  const securityScore = (has2FA ? 50 : 0) + (hasAlerts ? 50 : 0);

  const securityConfig = isSecure
    ? {
        icon: ShieldCheck,
        color: "success",
        title: "Cuenta Protegida",
        badge: "100% Seguro",
        desc: "¡Excelente! Tienes la verificación en dos pasos y las alertas activadas.",
        label: "Ver detalles",
      }
    : {
        icon: ShieldAlert,
        color: "warning",
        title: "Seguridad Pendiente",
        badge: "Acción requerida",
        desc: `Tu cuenta no está totalmente segura. ${
          !has2FA ? "Activa el 2FA" : "Activa las alertas"
        } para máxima protección.`,
        label: "Mejorar seguridad",
      };

  return (
    <Stack spacing={2}>
      {/* Banner de Bienvenida */}
      <Card
        variant="soft"
        color={isSecure ? "primary" : "warning"}
        sx={{ borderRadius: "lg" }}>
        <Stack direction="row" gap={2} alignItems="center">
          <Box
            sx={{ p: 1.5, bgcolor: "background.surface", borderRadius: "50%" }}>
            {isSecure ? (
              <ShieldCheck size={32} color="green" />
            ) : (
              <Lock size={32} color="orange" />
            )}
          </Box>
          <Box>
            <Typography level="h4" textColor="text.primary">
              {isSecure
                ? "Todo se ve bien por aquí"
                : "Completa tu configuración"}
            </Typography>
            <Typography level="body-sm" textColor="text.secondary">
              {isSecure
                ? "Tu cuenta cumple con todos los estándares de seguridad recomendados."
                : "Hemos detectado que puedes mejorar la seguridad de tu acceso."}
            </Typography>
          </Box>
        </Stack>
      </Card>

      <Typography level="title-sm" sx={{ mt: 1 }}>
        Accesos Directos
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} gap={2}>
        {/* 1. Tarjeta Dinámica de Seguridad */}
        <InfoCard
          icon={securityConfig.icon}
          title={securityConfig.title}
          desc={securityConfig.desc}
          actionLabel={securityConfig.label}
          color={securityConfig.color}
          badge={securityConfig.badge}
          onAction={() => onNavigate("seguridad")}
        />

        {/* 2. Tarjeta de Apariencia (Mantenida) */}
        <InfoCard
          icon={Palette}
          title="Apariencia"
          desc="Personaliza el tema (Claro/Oscuro) y la densidad de la interfaz."
          actionLabel="Personalizar"
          color="primary"
          onAction={() => onNavigate("apariencia")}
        />

        {/* 3. Tarjeta de Privacidad (Nueva - Reemplaza notificaciones) */}
        <InfoCard
          icon={Fingerprint}
          title="Privacidad"
          desc="Gestiona quién puede ver tu actividad y el uso de tus datos."
          actionLabel="Revisar privacidad"
          color="neutral"
          onAction={() => onNavigate("privacidad")}
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Sección opcional de 'Nivel de Perfil' gamificado */}
      <Card variant="outlined">
        <SectionHeader
          title="Salud de la Cuenta"
          subtitle="Estado general de tu configuración"
        />
        <Stack spacing={2} mt={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography level="body-sm">Seguridad configurada</Typography>
            <Typography
              level="body-sm"
              fontWeight="bold"
              color={isSecure ? "success" : "warning"}>
              {securityScore}%
            </Typography>
          </Stack>
          <LinearProgress
            determinate
            value={securityScore}
            color={isSecure ? "success" : "warning"}
            thickness={8}
            sx={{ borderRadius: 5 }}
          />
          {!isSecure && (
            <Typography
              level="body-xs"
              startDecorator={<ShieldAlert size={14} />}>
              Recomendación: Ve a la pestaña <b>Seguridad</b> y activa las
              opciones faltantes.
            </Typography>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
