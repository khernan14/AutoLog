import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(); // 👈 Hook

  // Leemos la configuración de seguridad del objeto global
  const seg = allSettings?.seguridad || {};

  // Calculamos el nivel de seguridad
  const has2FA = !!seg.tfa_enabled;
  const hasAlerts = !!seg.login_alerts;

  // Lógica de estado de seguridad
  const isSecure = has2FA && hasAlerts;
  const securityScore = (has2FA ? 50 : 0) + (hasAlerts ? 50 : 0);

  // Determinamos el texto de la acción faltante para la traducción
  const missingActionText = !has2FA
    ? t("settings.home.security.action_2fa")
    : t("settings.home.security.action_alerts");

  const securityConfig = isSecure
    ? {
        icon: ShieldCheck,
        color: "success",
        title: t("settings.home.security.secure_title"),
        badge: t("settings.home.security.secure_badge"),
        desc: t("settings.home.security.secure_desc"),
        label: t("settings.home.security.btn_details"),
      }
    : {
        icon: ShieldAlert,
        color: "warning",
        title: t("settings.home.security.warning_title"),
        badge: t("settings.home.security.warning_badge"),
        desc: t("settings.home.security.warning_desc", {
          action: missingActionText,
        }),
        label: t("settings.home.security.btn_improve"),
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
                ? t("settings.home.welcome_secure")
                : t("settings.home.welcome_warning")}
            </Typography>
            <Typography level="body-sm" textColor="text.secondary">
              {isSecure
                ? t("settings.home.welcome_desc_secure")
                : t("settings.home.welcome_desc_warning")}
            </Typography>
          </Box>
        </Stack>
      </Card>

      <Typography level="title-sm" sx={{ mt: 1 }}>
        {t("settings.home.shortcuts")}
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

        {/* 2. Tarjeta de Apariencia */}
        <InfoCard
          icon={Palette}
          title={t("settings.home.appearance.title")}
          desc={t("settings.home.appearance.desc")}
          actionLabel={t("settings.home.appearance.btn")}
          color="primary"
          onAction={() => onNavigate("apariencia")}
        />

        {/* 3. Tarjeta de Privacidad */}
        <InfoCard
          icon={Fingerprint}
          title={t("settings.home.privacy.title")}
          desc={t("settings.home.privacy.desc")}
          actionLabel={t("settings.home.privacy.btn")}
          color="neutral"
          onAction={() => onNavigate("privacidad")}
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Sección opcional de 'Nivel de Perfil' gamificado */}
      <Card variant="outlined">
        <SectionHeader
          title={t("settings.home.health.title")}
          subtitle={t("settings.home.health.subtitle")}
        />
        <Stack spacing={2} mt={1}>
          <Stack direction="row" justifyContent="space-between">
            <Typography level="body-sm">
              {t("settings.home.health.label")}
            </Typography>
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
              {t("settings.home.health.recommendation_prefix")}{" "}
              <b>{t("settings.menu.security")}</b>{" "}
              {t("settings.home.health.recommendation_suffix")}
            </Typography>
          )}
        </Stack>
      </Card>
    </Stack>
  );
}
