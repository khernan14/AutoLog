import {
  Box,
  Stack,
  Typography,
  Input,
  FormLabel,
  FormControl,
  LinearProgress,
  Button,
} from "@mui/joy";
import { Key } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { updateUser } from "../../../services/AuthServices";

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const validationSchema = Yup.object({
  password: Yup.string()
    .required("La contraseña es obligatoria")
    .min(8, "Mínimo 8 caracteres"),
});

export default function MyAccountForm({ user }) {
  const formik = useFormik({
    initialValues: {
      password: "",
    },
    validationSchema,
    onSubmit: async ({ password }) => {
      const confirm = await Swal.fire({
        title: "¿Deseas cambiar la contraseña?",
        text: "Se cambiará la contraseña actual",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#03624C",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, cambiar contraseña",
      });

      if (confirm.isConfirmed) {
        const data = await updateUser({
          id_usuario: user.id_usuario,
          password,
        });
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
          formik.resetForm();
        }
      }
    },
  });

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}>
        <Typography level="h4">Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        width: "100%",
        px: { xs: 2, md: 6 },
        py: { xs: 2, md: 4 },
      }}>
      <Stack
        spacing={4}
        sx={{
          maxWidth: 700,
          mx: "auto",
          bgcolor: "background.surface",
          p: { xs: 2, md: 4 },
          borderRadius: "lg",
          boxShadow: "sm",
        }}>
        <Box textAlign="center">
          <Box
            sx={{
              width: 100,
              height: 100,
              mx: "auto",
              borderRadius: "50%",
              bgcolor: "primary.softBg",
              color: "primary.softColor",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              boxShadow: "sm",
            }}>
            {getInitials(user.nombre)}
          </Box>
        </Box>

        <Stack spacing={2}>
          <FormControl>
            <FormLabel>Nombre Completo</FormLabel>
            <Input value={user.nombre} disabled fullWidth size="sm" />
          </FormControl>

          <FormControl>
            <FormLabel>Correo Electrónico</FormLabel>
            <Input value={user.email} disabled fullWidth size="sm" />
          </FormControl>

          <FormControl>
            <FormLabel>Usuario</FormLabel>
            <Input value={user.username} disabled fullWidth size="sm" />
          </FormControl>

          <FormControl>
            <FormLabel>País</FormLabel>
            <Input value={user.pais} disabled fullWidth size="sm" />
          </FormControl>

          <FormControl>
            <FormLabel>Ciudad</FormLabel>
            <Input value={user.ciudad} disabled fullWidth size="sm" />
          </FormControl>

          <form onSubmit={formik.handleSubmit}>
            <Stack
              spacing={1}
              sx={{
                "--hue": Math.min(formik.values.password.length * 10, 120),
              }}>
              <FormControl
                error={formik.touched.password && !!formik.errors.password}>
                <FormLabel>Nueva Contraseña</FormLabel>
                <Input
                  type="password"
                  name="password"
                  placeholder="Nueva contraseña"
                  size="sm"
                  startDecorator={<Key />}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  fullWidth
                />
              </FormControl>

              {formik.values.password && (
                <>
                  <LinearProgress
                    determinate
                    size="sm"
                    value={Math.min(
                      (formik.values.password.length * 100) / 12,
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
                      color: "hsl(var(--hue) 80% 30%)",
                      textAlign: "right",
                    }}>
                    {formik.values.password.length < 3 && "Muy débil"}
                    {formik.values.password.length >= 3 &&
                      formik.values.password.length < 6 &&
                      "Débil"}
                    {formik.values.password.length >= 6 &&
                      formik.values.password.length < 10 &&
                      "Fuerte"}
                    {formik.values.password.length >= 10 && "Muy fuerte"}
                  </Typography>
                </>
              )}

              {formik.touched.password && formik.errors.password && (
                <Typography color="danger" level="body-xs">
                  {formik.errors.password}
                </Typography>
              )}

              <Button
                type="submit"
                size="sm"
                variant="solid"
                disabled={
                  !formik.values.password || formik.values.password.length < 8
                }>
                Guardar Contraseña
              </Button>
            </Stack>
          </form>
        </Stack>
      </Stack>
    </Box>
  );
}
