// src/components/Users/MyAccount/MyAccountForm.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Grid,
  FormControl,
  FormLabel,
  Input,
  Typography,
  Stack,
} from "@mui/joy";

// Iconos
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded"; // Para usuario
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import LocationCityRoundedIcon from "@mui/icons-material/LocationCityRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded"; // Para apellido

export default function MyAccountForm({ user }) {
  const { t } = useTranslation();

  // Si no hay usuario, el padre maneja el Skeleton, así que retornamos null o un fallback simple
  if (!user) return null;

  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={2}>
        {/* Nombre */}
        <Grid xs={12} md={6}>
          <FormControl>
            <FormLabel>{t("account.fields.name")}</FormLabel>
            <Input
              startDecorator={<PersonRoundedIcon />}
              value={user.nombre || ""}
              readOnly
              variant="outlined"
              color="neutral"
            />
          </FormControl>
        </Grid>

        {/* Apellido (si existe en tu modelo, o repetimos nombre si es campo único) */}
        <Grid xs={12} md={6}>
          <FormControl>
            <FormLabel>{t("account.fields.lastname")}</FormLabel>
            <Input
              startDecorator={<BadgeRoundedIcon />}
              value={user.apellido || ""}
              readOnly
              variant="outlined"
              color="neutral"
            />
          </FormControl>
        </Grid>

        {/* Email - Ocupa todo el ancho en móviles, mitad en escritorio */}
        <Grid xs={12} md={6}>
          <FormControl>
            <FormLabel>{t("account.fields.email")}</FormLabel>
            <Input
              startDecorator={<EmailRoundedIcon />}
              value={user.email || ""}
              readOnly
              variant="outlined"
              color="neutral"
            />
          </FormControl>
        </Grid>

        {/* Username */}
        <Grid xs={12} md={6}>
          <FormControl>
            <FormLabel>{t("account.fields.username")}</FormLabel>
            <Input
              startDecorator={<AlternateEmailRoundedIcon />}
              value={user.username || ""}
              readOnly
              variant="outlined"
              color="neutral"
            />
          </FormControl>
        </Grid>

        {/* Ubicación: País y Ciudad */}
        <Grid xs={12} md={6}>
          <FormControl>
            <FormLabel>{t("account.fields.country")}</FormLabel>
            <Input
              startDecorator={<PublicRoundedIcon />}
              value={user.pais || "—"}
              readOnly
              variant="outlined"
              color="neutral"
            />
          </FormControl>
        </Grid>

        <Grid xs={12} md={6}>
          <FormControl>
            <FormLabel>{t("account.fields.city")}</FormLabel>
            <Input
              startDecorator={<LocationCityRoundedIcon />}
              value={user.ciudad || "—"}
              readOnly
              variant="outlined"
              color="neutral"
            />
          </FormControl>
        </Grid>
      </Grid>

      {/* Nota sutil al pie */}
      <Stack sx={{ mt: 3 }}>
        <Typography level="body-xs" textColor="neutral.500">
          * {t("account.info_readonly")}
        </Typography>
      </Stack>
    </Box>
  );
}
