import { useState, useEffect } from "react";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Button from "@mui/joy/Button";
import Stack from "@mui/joy/Stack";
import { useFormik } from "formik";
import * as yup from "yup";
import { getUbicaciones } from "../../services/VehiculosService"; // Asegúrate que esta ruta esté correcta

const validationSchema = yup.object({
  placa: yup.string().required("El nombre del vehículo es requerido"),
  marca: yup.string().required("La marca es requerida"),
  modelo: yup.string().required("El modelo es requerido"),
  estado: yup.string().required("El estado es requerido"),
  id_ubicacion_actual: yup.number().required("La ubicación es requerida"),
});

export default function VehiculoModal({
  open,
  onClose,
  onSubmit,
  ubicaciones: ubicacionesProp,
  initialValues = {
    id: null,
    placa: "",
    marca: "",
    modelo: "",
    estado: "",
    id_ubicacion_actual: null,
  },
}) {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(true);

  useEffect(() => {
    async function fetchUbicaciones() {
      setLoadingUbicaciones(true);
      const data = (await ubicacionesProp) || (await getUbicaciones());
      if (data) setUbicaciones(data);
      setLoadingUbicaciones(false);
    }

    fetchUbicaciones();
  }, [ubicacionesProp]);

  useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
  }, [open]);

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title">
      <Sheet
        variant="outlined"
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: 400,
          width: "90%",
          p: 3,
          borderRadius: "md",
          boxShadow: "lg",
          bgcolor: "background.body",
        }}>
        <ModalClose />
        <Typography id="modal-title" level="h5" mb={2}>
          {initialValues.id ? "Editar Vehículo" : "Agregar Vehículo"}
        </Typography>

        <form onSubmit={formik.handleSubmit} noValidate>
          <Stack spacing={2}>
            <FormControl>
              <FormLabel>Vehículo</FormLabel>
              <Input
                name="placa"
                value={formik.values.placa}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.placa && Boolean(formik.errors.placa)}
                placeholder="Ej. ABC123"
              />
              {formik.touched.placa && formik.errors.placa && (
                <Typography level="body-xs" color="danger" mt={0.5}>
                  {formik.errors.placa}
                </Typography>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Marca</FormLabel>
              <Input
                name="marca"
                value={formik.values.marca}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.marca && Boolean(formik.errors.marca)}
                placeholder="Ej. Toyota"
              />
              {formik.touched.marca && formik.errors.marca && (
                <Typography level="body-xs" color="danger" mt={0.5}>
                  {formik.errors.marca}
                </Typography>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Modelo</FormLabel>
              <Input
                name="modelo"
                value={formik.values.modelo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.modelo && Boolean(formik.errors.modelo)}
                placeholder="Ej. Corolla"
              />
              {formik.touched.modelo && formik.errors.modelo && (
                <Typography level="body-xs" color="danger" mt={0.5}>
                  {formik.errors.modelo}
                </Typography>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Estado</FormLabel>
              <Select
                name="estado"
                value={formik.values.estado}
                onChange={(e, value) => formik.setFieldValue("estado", value)}
                onBlur={formik.handleBlur}
                error={formik.touched.estado && Boolean(formik.errors.estado)}
                placeholder="Selecciona estado">
                <Option value="Disponible">Disponible</Option>
                <Option value="En Uso">En Uso</Option>
                {/* <Option value="En mantenimiento">En mantenimiento</Option> */}
              </Select>
              {formik.touched.estado && formik.errors.estado && (
                <Typography level="body-xs" color="danger" mt={0.5}>
                  {formik.errors.estado}
                </Typography>
              )}
            </FormControl>

            <FormControl>
              <FormLabel>Ubicación Actual</FormLabel>
              <Select
                name="id_ubicacion_actual"
                value={formik.values.id_ubicacion_actual ?? ""}
                onChange={(e, value) =>
                  formik.setFieldValue("id_ubicacion_actual", value)
                }
                onBlur={formik.handleBlur}
                error={
                  formik.touched.id_ubicacion_actual &&
                  Boolean(formik.errors.id_ubicacion_actual)
                }
                disabled={loadingUbicaciones}
                placeholder={
                  loadingUbicaciones
                    ? "Cargando ubicaciones..."
                    : "Selecciona ubicación"
                }>
                {ubicaciones.map((u) => (
                  <Option key={u.id} value={u.id}>
                    {u.nombre_ubicacion}
                  </Option>
                ))}
              </Select>
              {formik.touched.id_ubicacion_actual &&
                formik.errors.id_ubicacion_actual && (
                  <Typography level="body-xs" color="danger" mt={0.5}>
                    {formik.errors.id_ubicacion_actual}
                  </Typography>
                )}
            </FormControl>

            <Button type="submit" variant="solid" color="primary">
              {initialValues.id ? "Actualizar" : "Agregar"}
            </Button>
          </Stack>
        </form>
      </Sheet>
    </Modal>
  );
}
