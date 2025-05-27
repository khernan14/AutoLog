import { useState, useEffect } from "react";
import AspectRatio from "@mui/joy/AspectRatio";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Divider from "@mui/joy/Divider";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import Card from "@mui/joy/Card";
import CardActions from "@mui/joy/CardActions";
import CardOverflow from "@mui/joy/CardOverflow";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import { LinearProgress } from "@mui/joy";
import { Key } from "@mui/icons-material";
import { updateUser } from "../../../services/AuthServices";
import Swal from "sweetalert2";

export default function MyProfile({ user }) {
  const [tabValue, setTabValue] = useState(0);
  const [value, setValue] = useState("");
  const minLength = 12;

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditPassword = async ({ id_usuario, password }) => {
    if (!password || password.trim().length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Contraseña inválida",
        text: "La contraseña debe tener al menos 8 caracteres.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const result = await Swal.fire({
      title: "¿Deseas cambiar la contraseña?",
      text: "Se cambiará la contraseña actual",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#03624C",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cambiar contraseña",
    });

    if (result.isConfirmed) {
      const data = await updateUser({ id_usuario, password });
      if (data && data.error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.error,
          confirmButtonColor: "#d33",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Éxito",
          text: "La contraseña fue actualizada.",
          confirmButtonColor: "#03624C",
        });
        setValue("");
      }
    }
  };

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}>
        <Typography variant="h6">Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Box
        sx={{
          position: "sticky",
          top: { sm: -100, md: -110 },
          bgcolor: "background.body",
          zIndex: 9995,
        }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ bgcolor: "transparent" }}>
          <TabList
            tabFlex={1}
            size="sm"
            sx={{
              pl: { xs: 0, md: 4 },
              justifyContent: "left",
              fontWeight: "600",
              color: "text.tertiary",
            }}>
            <Tab value={0} sx={{ borderRadius: "6px 6px 0 0" }}>
              Settings
            </Tab>
            <Tab value={1} sx={{ borderRadius: "6px 6px 0 0" }}>
              Messages
            </Tab>
            <Tab value={2} sx={{ borderRadius: "6px 6px 0 0" }}>
              Calendar
            </Tab>
          </TabList>
        </Tabs>
      </Box>

      <Stack
        spacing={4}
        sx={{
          display: "flex",
          maxWidth: "800px",
          mx: "auto",
          px: { xs: 2, md: 6 },
          py: { xs: 2, md: 3 },
        }}>
        <Card>
          {/* Render content based on the active tab */}
          {tabValue === 0 && (
            <>
              <Box sx={{ mb: 1 }}>
                <Typography level="title-md">Información Personal</Typography>
                <Typography level="body-sm">
                  Personaliza la información de tu perfil para que sea visible
                  en la red.
                </Typography>
              </Box>
              <Divider />
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={3}
                sx={{ my: 1 }}>
                <Stack direction="column" spacing={1}>
                  <AspectRatio
                    ratio="1"
                    sx={{
                      width: { xs: 110, md: 120 },
                      borderRadius: "100%",
                    }}>
                    <img
                      src={
                        user.profilePicture ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=286"
                      }
                      loading="lazy"
                      alt="Profile"
                    />
                  </AspectRatio>

                  <IconButton
                    aria-label="upload new picture"
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    sx={{
                      bgcolor: "background.body",
                      position: "absolute",
                      zIndex: 2,
                      borderRadius: "50%",
                      left: { xs: 80, md: 100 },
                      top: { xs: 120, md: 170 },
                      boxShadow: "sm",
                      p: 0.5,
                    }}>
                    <EditRoundedIcon sx={{ fontSize: { xs: 16, md: 20 } }} />
                  </IconButton>
                </Stack>
                <Stack spacing={2} sx={{ flexGrow: 1 }}>
                  <Stack width={"60%"} spacing={1}>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl
                      sx={{
                        display: { sm: "flex-column", md: "flex-row" },
                        gap: 2,
                      }}>
                      <Input
                        sx={{
                          width: { xs: "100%", md: 280 },
                        }}
                        size="sm"
                        placeholder="Nombre Completo"
                        defaultValue={user.nombre} // Aquí pones el nombre que viene del user
                        disabled
                      />
                    </FormControl>
                  </Stack>
                  <Stack spacing={2} sx={{ flexGrow: 1 }}>
                    <FormControl>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <Input
                        sx={{
                          width: { xs: "60%", md: 280 },
                        }}
                        size="sm"
                        type="email"
                        startDecorator={<EmailRoundedIcon />}
                        placeholder="email"
                        defaultValue={user.email} // Aquí pones el correo del user
                        disabled
                      />
                    </FormControl>
                  </Stack>

                  <Stack width={"60%"} spacing={2}>
                    <FormControl>
                      <FormLabel>Usuario</FormLabel>
                      <Input
                        sx={{
                          width: { xs: "100%", md: 280 },
                        }}
                        size="sm"
                        placeholder="Nombre de usuario"
                        defaultValue={user.username} // Aquí pones el username del user
                        disabled
                      />
                    </FormControl>
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    <FormControl>
                      <FormLabel>Pais</FormLabel>
                      <Input
                        size="sm"
                        type="text"
                        placeholder="Pais"
                        defaultValue={user.pais}
                        disabled
                      />
                    </FormControl>
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    <FormControl>
                      <FormLabel>Ciudad</FormLabel>
                      <Input
                        size="sm"
                        type="text"
                        placeholder="Ciudad"
                        defaultValue={user.ciudad}
                        disabled
                      />
                    </FormControl>
                  </Stack>

                  <Stack
                    width={"60%"}
                    spacing={2}
                    sx={{ "--hue": Math.min(value.length * 10, 120) }}>
                    <FormControl>
                      <FormLabel>Contraseña</FormLabel>
                      <Input
                        sx={{
                          width: { xs: "100%", md: 280 },
                        }}
                        size="sm"
                        type="password"
                        placeholder="Nueva contraseña"
                        startDecorator={<Key />}
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                      />
                    </FormControl>

                    {value && (
                      <>
                        <LinearProgress
                          determinate
                          size="sm"
                          value={Math.min(
                            (value.length * 100) / minLength,
                            100
                          )}
                          sx={{
                            bgcolor: "background.level3",
                            color: "hsl(var(--hue) 80% 40%)",
                          }}
                        />
                        <Typography
                          level="body-xs"
                          sx={{
                            alignSelf: "flex-end",
                            color: "hsl(var(--hue) 80% 30%)",
                          }}>
                          {value.length < 3 && "Muy débil"}
                          {value.length >= 3 && value.length < 6 && "Débil"}
                          {value.length >= 6 && value.length < 10 && "Fuerte"}
                          {value.length >= 10 && "Muy fuerte"}
                        </Typography>
                      </>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </>
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography level="title-md">Mensajes</Typography>
              <Typography level="body-sm">
                Aquí podrás ver las notificaciones y mensajes relacionados con
                los registros.
              </Typography>
              {/* Aquí puedes colocar el contenido o componentes para mostrar mensajes */}
            </Box>
          )}

          {tabValue === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography level="title-md">Calendario</Typography>
              <Typography level="body-sm">
                Aquí podrás ver el calendario y gestionar tus eventos.
              </Typography>
              {/* Aquí podrás implementar el calendario en el futuro */}
            </Box>
          )}

          <CardOverflow sx={{ borderTop: "1px solid", borderColor: "divider" }}>
            <CardActions sx={{ alignSelf: "flex-end", pt: 2 }}>
              {/* <Button size="sm" variant="outlined" color="neutral">
                Cancelar
              </Button> */}
              <Button
                size="sm"
                variant="solid"
                onClick={() =>
                  handleEditPassword({
                    id_usuario: user.id_usuario,
                    password: value,
                  })
                }>
                Guardar
              </Button>
            </CardActions>
          </CardOverflow>
        </Card>
      </Stack>
    </Box>
  );
}
