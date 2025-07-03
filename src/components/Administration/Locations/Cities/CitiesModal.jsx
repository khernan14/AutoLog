import { useEffect, useState } from "react";
import {
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
} from "@mui/joy";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { getCountries } from "../../../../services/LocationServices";

export default function CitiesModal({
  open,
  onClose,
  initialValues,
  onSubmit,
}) {
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const data = await getCountries();
        if (data) {
          setCountries(data);
        } else {
          toast.error("No se pudieron cargar los países");
        }
      } catch (error) {
        toast.error("Error al cargar países");
        console.error("loadCountries error:", error);
      }
    };
    loadCountries();
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      ciudad: initialValues?.ciudad || initialValues?.nombre || "",
      id_pais: initialValues?.id_pais
        ? Number(initialValues.id_pais)
        : initialValues?.paisId
        ? Number(initialValues.paisId)
        : "",
    },
    validationSchema: Yup.object({
      ciudad: Yup.string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .required("El nombre de la ciudad es obligatorio"),
      id_pais: Yup.number()
        .required("El país es obligatorio")
        .typeError("Selecciona un país válido"),
    }),
    onSubmit: (values) => {
      onSubmit({
        ciudad: values.ciudad.trim(),
        id_pais: Number(values.id_pais),
        id: initialValues?.id || null,
      });
    },
  });

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-title">
      <ModalDialog sx={{ maxWidth: 400 }}>
        <ModalClose />
        <Typography id="modal-title" component="h2" level="h4" mb={2}>
          {initialValues ? "Editar Ciudad" : "Agregar Ciudad"}
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <FormControl required sx={{ mb: 2 }}>
            <FormLabel>Nombre de la Ciudad</FormLabel>
            <Input
              name="ciudad"
              value={formik.values.ciudad}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.ciudad && Boolean(formik.errors.ciudad)}
              placeholder="Ejemplo: Guadalajara"
            />
            {formik.touched.ciudad && formik.errors.ciudad && (
              <Typography level="body3" color="danger" mt={0.5}>
                {formik.errors.ciudad}
              </Typography>
            )}
          </FormControl>

          <FormControl required sx={{ mb: 3 }}>
            <FormLabel>País</FormLabel>
            <Select
              name="id_pais"
              value={formik.values.id_pais}
              onChange={(_, value) => formik.setFieldValue("id_pais", value)}
              onBlur={formik.handleBlur}
              error={formik.touched.id_pais && Boolean(formik.errors.id_pais)}
              placeholder="Selecciona un país">
              <Option value="">-- Selecciona un país --</Option>
              {countries.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.nombre}
                </Option>
              ))}
            </Select>
            {formik.touched.id_pais && formik.errors.id_pais && (
              <Typography level="body3" color="danger" mt={0.5}>
                {formik.errors.id_pais}
              </Typography>
            )}
          </FormControl>

          <Button type="submit" fullWidth>
            {initialValues ? "Actualizar" : "Agregar"}
          </Button>
        </form>
      </ModalDialog>
    </Modal>
  );
}
