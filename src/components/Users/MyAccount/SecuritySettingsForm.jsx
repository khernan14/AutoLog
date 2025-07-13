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

const validationSchema = Yup.object({
  password: Yup.string()
    .required("La contraseña es obligatoria")
    .min(8, "Mínimo 8 caracteres"),
});

export default function SecuritySettingsForm({ user }) {
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

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={2}>
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
              value={Math.min((formik.values.password.length * 100) / 12, 100)}
              color={
                formik.values.password.length < 3
                  ? "danger"
                  : formik.values.password.length < 6
                  ? "warning"
                  : formik.values.password.length < 10
                  ? "primary"
                  : "success"
              }
              sx={{
                bgcolor: "background.level3",
              }}
            />
            <Typography
              level="body-xs"
              sx={{
                color:
                  formik.values.password.length < 3
                    ? "danger.plainColor"
                    : formik.values.password.length < 6
                    ? "warning.plainColor"
                    : formik.values.password.length < 10
                    ? "primary.plainColor"
                    : "success.plainColor",
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
  );
}
