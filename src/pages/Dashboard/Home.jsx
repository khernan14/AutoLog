import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Box,
  Typography,
  Card,
  Grid,
  Stack,
  Button,
  Divider,
  Chip,
  Sheet,
  Skeleton,
} from "@mui/joy";

// Iconos
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightlightIcon from "@mui/icons-material/Nightlight";
import PushPinRoundedIcon from "@mui/icons-material/PushPinRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";

// Contextos y Servicios
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { getPinnedChangelogs } from "@/services/help.api";
import { useNavigate } from "react-router-dom";

// --- RELOJ MANUAL (A PRUEBA DE FALLOS) ---
// Usamos lógica manual porque Intl a veces ignora 'hour12' dependiendo del locale del navegador
const LiveClock = ({ timeFormat, dateFormat, locale, timezone }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = useMemo(() => {
    try {
      // 1. Ajustar fecha a la zona horaria (si existe)
      let dateInZone = time;
      if (timezone) {
        // Truco para cambiar zona horaria manteniendo el objeto Date válido
        const strTime = time.toLocaleString("en-US", { timeZone: timezone });
        dateInZone = new Date(strTime);
      }

      let hours = dateInZone.getHours();
      const minutes = dateInZone.getMinutes().toString().padStart(2, "0");
      const seconds = dateInZone.getSeconds().toString().padStart(2, "0");

      // 2. Formateo Manual Estricto
      if (timeFormat === "24h") {
        // Formato militar directo: 13:00:00
        const hh = hours.toString().padStart(2, "0");
        return `${hh}:${minutes}:${seconds}`;
      } else {
        // Formato 12h manual: 01:00:00 PM
        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12; // el 0 se vuelve 12
        const hh = hours.toString().padStart(2, "0");
        return `${hh}:${minutes}:${seconds} ${ampm}`;
      }
    } catch (e) {
      console.error("Error reloj:", e);
      return "--:--:--";
    }
  }, [time, timeFormat, timezone]);

  const formattedDate = useMemo(() => {
    try {
      const options = {
        timeZone: timezone,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Intl.DateTimeFormat(locale, options).format(time);
    } catch {
      return "";
    }
  }, [time, dateFormat, locale, timezone]);

  return (
    <Stack spacing={0.5}>
      <Typography
        level="h1"
        sx={{
          fontSize: { xs: "3rem", md: "4.5rem" },
          fontWeight: 800,
          lineHeight: 1,
          background:
            "linear-gradient(45deg, var(--joy-palette-primary-400), var(--joy-palette-primary-600))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontVariantNumeric: "tabular-nums", // Evita saltos al cambiar números
          letterSpacing: "-1px",
        }}>
        {formattedTime}
      </Typography>
      <Typography
        level="h4"
        textColor="text.secondary"
        sx={{ textTransform: "capitalize", fontWeight: 400 }}>
        {formattedDate}
      </Typography>
    </Stack>
  );
};

export default function Home() {
  const { t, i18n } = useTranslation();
  const { userData } = useAuth();
  const { settings, loading } = useSettings();
  const navigate = useNavigate();

  const [weather, setWeather] = useState(null);
  const [pinned, setPinned] = useState([]);

  const userName = userData?.nombre?.split(" ")[0] || "Usuario";
  const weatherKey = import.meta.env.VITE_OWM_KEY;

  // --- LECTURA SEGURA DE SETTINGS ---
  // Si está cargando, usamos defaults. Si ya cargó, leemos directo.
  // Nota: "12h" es el default si falla la lectura.
  const configTimeFormat = settings?.timeFormat || "12h";
  const configDateFormat = settings?.dateFormat || "DD/MM/YYYY";
  const configLanguage = settings?.language || i18n.language || "es-HN";
  const configTimezone = settings?.timezone;

  // Saludo dinámico
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12)
      return {
        text: t("home.greeting.morning"),
        icon: <WbSunnyIcon sx={{ color: "#FDB813", fontSize: 40 }} />,
      };
    if (hour < 18)
      return {
        text: t("home.greeting.afternoon"),
        icon: <WbSunnyIcon sx={{ color: "#F57C00", fontSize: 40 }} />,
      };
    return {
      text: t("home.greeting.evening"),
      icon: <NightlightIcon sx={{ color: "#5C6BC0", fontSize: 40 }} />,
    };
  };

  const greeting = getGreeting();

  useEffect(() => {
    // 1. Cargar Clima
    if (weatherKey && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const langCode = configLanguage.split("-")[0];

          fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=${langCode}&appid=${weatherKey}`
          )
            .then((r) => r.json())
            .then((data) => {
              if (data.main) {
                setWeather({
                  temp: Math.round(data.main.temp),
                  desc: data.weather[0].description,
                  icon: data.weather[0].icon,
                  city: data.name,
                });
              }
            })
            .catch(() => {});
        },
        () => {}
      );
    }

    // 2. Cargar Novedades
    getPinnedChangelogs(3)
      .then((data) => setPinned(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [weatherKey, configLanguage]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, mx: "auto" }}>
      {/* SECCIÓN HERO */}
      <Grid container spacing={4} sx={{ mb: 4 }} alignItems="center">
        <Grid xs={12} md={7}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              {greeting.icon}
              <Typography level="h2">
                {greeting.text}, {userName}.
              </Typography>
            </Stack>

            {/* Si está cargando, mostramos Skeleton */}
            {loading ? (
              <Stack spacing={1}>
                <Skeleton variant="text" level="h1" width={300} height={80} />
                <Skeleton variant="text" level="h4" width={200} />
              </Stack>
            ) : (
              /* KEY IMPORTANTE: Fuerza el re-renderizado si cambia el formato */
              <LiveClock
                key={configTimeFormat}
                timeFormat={configTimeFormat}
                dateFormat={configDateFormat}
                locale={configLanguage}
                timezone={configTimezone}
              />
            )}
          </motion.div>
        </Grid>

        <Grid xs={12} md={5}>
          {/* Widget Clima */}
          {weather ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}>
              <Sheet
                variant="soft"
                color="primary"
                sx={{
                  borderRadius: "xl",
                  p: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "md",
                }}>
                <Box>
                  <Typography level="h2" textColor="primary.700">
                    {weather.temp}°C
                  </Typography>
                  <Typography
                    level="body-md"
                    fontWeight="lg"
                    textColor="primary.600"
                    sx={{ textTransform: "capitalize" }}>
                    {weather.desc}
                  </Typography>
                  <Typography level="body-xs" textColor="primary.500">
                    {weather.city}
                  </Typography>
                </Box>
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                  alt="weather"
                  style={{
                    width: 100,
                    height: 100,
                    filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.2))",
                  }}
                />
              </Sheet>
            </motion.div>
          ) : (
            <Sheet
              variant="outlined"
              sx={{
                borderRadius: "xl",
                p: 3,
                height: 140,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderStyle: "dashed",
              }}>
              <Typography level="body-sm" color="neutral">
                {t("home.weather_not_available")}
              </Typography>
            </Sheet>
          )}
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* SECCIÓN NOVEDADES Y ACCESOS */}
      <Grid container spacing={3}>
        <Grid xs={12} lg={8}>
          <Typography
            level="title-lg"
            startDecorator={<PushPinRoundedIcon color="warning" />}
            mb={2}>
            {t("home.news_title")}
          </Typography>

          <Stack spacing={2}>
            {pinned.length > 0 ? (
              pinned.map((news) => (
                <Card
                  key={news.id}
                  variant="outlined"
                  sx={{
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    transition: "0.2s",
                    "&:hover": { borderColor: "primary.400", boxShadow: "sm" },
                  }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "md",
                      bgcolor: "background.level1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                    <NotificationsActiveRoundedIcon
                      sx={{ color: "text.tertiary" }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start">
                      <Typography level="title-md" mb={0.5}>
                        {news.title}
                      </Typography>
                      <Chip
                        size="sm"
                        color={news.type === "Important" ? "danger" : "neutral"}
                        variant="soft">
                        {news.type || "Update"}
                      </Chip>
                    </Stack>
                    <Typography
                      level="body-sm"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                      {news.description}
                    </Typography>
                  </Box>
                  <Button
                    variant="plain"
                    size="sm"
                    onClick={() =>
                      navigate(`/admin/help/changelog/${news.slug}`)
                    }>
                    {t("home.read_more")}
                  </Button>
                </Card>
              ))
            ) : (
              <Sheet
                variant="soft"
                sx={{ p: 4, borderRadius: "md", textAlign: "center" }}>
                <Typography level="body-md" color="neutral">
                  {t("home.no_news")}
                </Typography>
              </Sheet>
            )}
          </Stack>
        </Grid>

        <Grid xs={12} lg={4}>
          <Typography level="title-lg" mb={2}>
            {t("home.quick_access")}
          </Typography>
          <Stack spacing={1.5}>
            <Button
              variant="soft"
              color="neutral"
              fullWidth
              size="lg"
              justifyContent="space-between"
              endDecorator={<ChevronRightRoundedIcon />}
              onClick={() => navigate("/admin/dashboard")}>
              📊 {t("menu.dashboard")}
            </Button>
            <Button
              variant="soft"
              color="neutral"
              fullWidth
              size="lg"
              justifyContent="space-between"
              endDecorator={<ChevronRightRoundedIcon />}
              onClick={() => navigate("/admin/inventario/activos")}>
              📦 {t("menu.inventory")}
            </Button>
            <Button
              variant="soft"
              color="neutral"
              fullWidth
              size="lg"
              justifyContent="space-between"
              endDecorator={<ChevronRightRoundedIcon />}
              onClick={() => navigate("/admin/vehiculos")}>
              🚗 {t("menu.fleet")}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
