import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, Grid, Sheet } from "@mui/joy";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import EventIcon from "@mui/icons-material/Event";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import { motion } from "framer-motion";

const MotionCard = motion(Card);

const getUserName = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.nombre || "Usuario";
  } catch {
    return "Usuario";
  }
};

const getFormattedDate = () => {
  const now = new Date();
  return now.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function Home() {
  const userName = getUserName();
  const today = getFormattedDate();
  const [weather, setWeather] = useState(null);
  const apiKey = "7ccda530f97765376983de979173d465"; // Reemplaza con tu API Key

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=es&appid=${apiKey}&appid=${apiKey}`;

          fetch(url)
            .then((response) => response.json())
            .then((data) => {
              console.log("Respuesta del clima:", data); // 👈 LOG
              if (data && data.main && data.weather) {
                const temperatura = data.main.temp;
                const descripcion = data.weather[0].description;
                const icono = data.weather[0].icon;
                setWeather({ temperatura, descripcion, icono });
              } else {
                console.warn("Datos de clima incompletos o inválidos:", data);
              }
            })
            .catch((error) => {
              console.error("Error al obtener el clima:", error);
            });
        },
        (error) => {
          console.error("Error al obtener la ubicación:", error);
        }
      );
    } else {
      console.error("Geolocalización no es soportada por este navegador.");
    }
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <Typography level="h2" sx={{ mb: 1 }}>
          ¡Hola, {userName}! 👋
        </Typography>
        <Typography level="body-sm" sx={{ mb: 3 }}>
          Hoy es {today}
        </Typography>
      </motion.div>

      <Grid container spacing={2}>
        <Grid xs={12} sm={6} md={4}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{ boxShadow: "sm", borderRadius: "lg" }}>
            <CardContent>
              <Typography level="title-md" sx={{ mb: 1 }}>
                <EventIcon sx={{ mr: 1 }} />
                Próximos eventos
              </Typography>
              <Typography level="body-sm">
                - Junta mensual: 15 mayo <br />- Capacitación interna: 20 mayo
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{ boxShadow: "sm", borderRadius: "lg" }}>
            <CardContent>
              <Typography level="title-md" sx={{ mb: 1 }}>
                <LightbulbIcon sx={{ mr: 1 }} />
                Tip rápido
              </Typography>
              <Typography level="body-sm">
                Puedes usar Ctrl + F para buscar registros rápidamente en
                cualquier tabla.
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <MotionCard
            whileHover={{ scale: 1.02 }}
            sx={{ boxShadow: "sm", borderRadius: "lg" }}>
            <CardContent>
              <Typography level="title-md" sx={{ mb: 1 }}>
                <WbSunnyIcon sx={{ mr: 1 }} />
                Clima actual
              </Typography>
              {weather ? (
                <Typography level="body-sm">
                  {weather.descripcion}, {weather.temperatura}°C
                </Typography>
              ) : (
                <Typography level="body-sm">Cargando clima...</Typography>
              )}
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
