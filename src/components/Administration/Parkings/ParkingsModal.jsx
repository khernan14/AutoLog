import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Button,
  Box,
} from "@mui/joy";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { getCities } from "../../../services/LocationServices";
import { toast } from "react-toastify";

export default function ParkingsModal({
  open,
  onClose,
  initialValues,
  onSubmit,
}) {
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const data = await getCities();
        if (data) {
          setCities(data);
          setError(null);
        } else {
          setCities([]);
          setError("No se pudieron cargar las ciudades.");
        }
      } catch (err) {
        console.error("Error al cargar ciudades:", err);
        setCities([]);
        setError("No tienes permisos para ver las ciudades.");
        toast.error("No tienes permisos para ver las ciudades.");
      }
    };
    fetchCities();
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      nombre_ubicacion: initialValues?.nombre_ubicacion || "",
      id_ciudad: initialValues?.id_ciudad
        ? String(initialValues.id_ciudad)
        : "",
    },
    validationSchema: Yup.object({
      nombre_ubicacion: Yup.string().required(
        "El nombre de la ubicación es obligatorio"
      ),
      id_ciudad: Yup.string()
        .required("Selecciona una ciudad")
        .test(
          "is-number",
          "Selecciona una ciudad válida",
          (value) => !isNaN(Number(value))
        ),
    }),
    onSubmit: (values) => {
      onSubmit({
        nombre_ubicacion: values.nombre_ubicacion.trim(),
        id_ciudad: Number(values.id_ciudad),
        id: initialValues?.id || null,
      });
    },
  });

  const onCloseModal = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal open={open} onClose={onCloseModal}>
      <ModalDialog>
        <ModalClose onClick={onCloseModal} />
        <Typography level="h4" component="h2" mb={2}>
          {initialValues ? "Editar Estacionamiento" : "Agregar Estacionamiento"}
        </Typography>

        {error ? (
          <Box textAlign="center" mt={2}>
            <Typography color="danger" level="body-md" mb={2}>
              {error}
            </Typography>
            <Button onClick={onCloseModal} variant="outlined">
              Cerrar
            </Button>
          </Box>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <FormControl
              sx={{ mb: 2 }}
              required
              error={
                formik.touched.nombre_ubicacion &&
                !!formik.errors.nombre_ubicacion
              }>
              <FormLabel>Nombre de la ubicación</FormLabel>
              <Input
                name="nombre_ubicacion"
                value={formik.values.nombre_ubicacion}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.nombre_ubicacion &&
                formik.errors.nombre_ubicacion && (
                  <Typography level="body3" color="danger">
                    {formik.errors.nombre_ubicacion}
                  </Typography>
                )}
            </FormControl>

            <FormControl
              sx={{ mb: 3 }}
              required
              error={formik.touched.id_ciudad && !!formik.errors.id_ciudad}>
              <FormLabel>Ciudad</FormLabel>
              <Select
                name="id_ciudad"
                value={formik.values.id_ciudad}
                onChange={(e, value) =>
                  formik.setFieldValue("id_ciudad", value)
                }
                onBlur={formik.handleBlur}
                placeholder="Selecciona una ciudad">
                {cities.map((city) => (
                  <Option key={city.id} value={String(city.id)}>
                    {city.ciudad}
                  </Option>
                ))}
              </Select>
              {formik.touched.id_ciudad && formik.errors.id_ciudad && (
                <Typography level="body3" color="danger">
                  {formik.errors.id_ciudad}
                </Typography>
              )}
            </FormControl>

            <Button type="submit" fullWidth>
              {initialValues ? "Actualizar" : "Agregar"}
            </Button>
          </form>
        )}
      </ModalDialog>
    </Modal>
  );
}
