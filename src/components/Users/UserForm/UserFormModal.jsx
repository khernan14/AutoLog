import { useEffect, useState } from "react";
import {
  Modal,
  ModalDialog,
  Typography,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Switch,
  Box,
  Stack,
} from "@mui/joy";
import Swal from "sweetalert2";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

export default function UserFormModal({
  open,
  onClose,
  onSave,
  user,
  ciudades,
  supervisores = [], // <-- nueva prop para supervisores
  roles = ["Empleado", "Supervisor"],
  puestos = [
    "Gerente de Ingeniería",
    "Gerente de Finanzas",
    "Oficial de servicios",
    "Supervisor Tecnico - ATM",
    "Supervisor Tecnico - Microsistemas",
    "Técnico de ATM",
    "Técnico de Microsistemas",
    "Técnico de Alta Disponibilidad",
    "Técnico de Soporte",
    "Técnico de Inventario",
    "Asistente de Contabilidad",
    "Asistente de Cuentas por Cobrar",
    "Especialista de Soluciones",
  ],
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isEditMode = Boolean(user);

  const validationSchema = Yup.object({
    nombre: Yup.string().required("El nombre es obligatorio"),
    email: Yup.string()
      .email("Email inválido")
      .required("El email es obligatorio"),
    username: Yup.string().required("El username es obligatorio"),
    rol: Yup.string().oneOf(roles).required("El rol es obligatorio"),
    puesto: Yup.string().oneOf(puestos).required("El puesto es obligatorio"),
    ciudad: Yup.string()
      .oneOf(ciudades.map((c) => String(c.id)))
      .required("La ciudad es obligatoria"),
    supervisor_id: Yup.string().nullable(), // puede ser cadena vacía o nulo
    password: isEditMode
      ? Yup.string().when("changePassword", {
          is: true,
          then: Yup.string()
            .min(6, "Mínimo 6 caracteres")
            .required("La contraseña es obligatoria"),
        })
      : Yup.string()
          .min(6, "Mínimo 6 caracteres")
          .required("La contraseña es obligatoria"),
    estatus: Yup.boolean(),
    changePassword: Yup.boolean(),
  });

  const initialValues = {
    id_usuario: user?.id_usuario || null,
    nombre: user?.nombre || "",
    email: user?.email || "",
    username: user?.username || "",
    rol: user?.rol || "",
    puesto: user?.puesto || "",
    ciudad: user?.id_ciudad ? String(user.id_ciudad) : "",
    supervisor_id: user?.supervisor_id ? String(user.supervisor_id) : "", // <-- nuevo campo
    password: "",
    estatus: user ? user.estatus === "Activo" : true,
    changePassword: false,
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const { changePassword, ciudad, supervisor_id, ...formRest } = values;

      const dataToSend = {
        ...formRest,
        estatus: values.estatus ? "Activo" : "Inactivo",
      };

      if (values.id_usuario) {
        dataToSend.id_usuario = values.id_usuario;
      }

      if (ciudad && !isNaN(parseInt(ciudad, 10))) {
        dataToSend.id_ciudad = parseInt(ciudad, 10);
      }

      if (supervisor_id && supervisor_id !== "") {
        dataToSend.supervisor_id = parseInt(supervisor_id, 10);
      } else {
        dataToSend.supervisor_id = null; // o eliminar la propiedad si prefieres
      }

      if (isEditMode && !changePassword) {
        delete dataToSend.password;
      }

      const result = await onSave(dataToSend);

      if (!result || result.error) {
        throw new Error(result?.error || "No se pudo guardar el usuario.");
      }

      Swal.fire({
        icon: "success",
        title: "¡Gracias!",
        text: "Se guardó el usuario con éxito",
        confirmButtonColor: "#03624C",
        customClass: { popup: "swal2-override" },
      }).then(() => {
        resetForm();
        setShowPassword(false);
        onClose();
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Ocurrió un error inesperado.",
        confirmButtonColor: "#d33",
        customClass: { popup: "swal2-override" },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>
        {`
        .swal2-container.swal2-backdrop-show,
        .swal2-container.swal2-modal-show {
          z-index: 1600;
        }
        `}
      </style>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({
          values,
          errors,
          touched,
          isSubmitting,
          setFieldValue,
          resetForm,
        }) => (
          <Modal
            open={open}
            onClose={() => {
              resetForm();
              setShowPassword(false);
              onClose();
            }}>
            <ModalDialog
              sx={{
                maxWidth: 800,
                width: "100%",
                overflow: "auto",
                zIndex: 1500,
              }}>
              <Typography level="h4" component="h2" mb={2}>
                {isEditMode ? "Editar usuario" : "Agregar usuario"}
              </Typography>

              <Form>
                <Box
                  sx={{
                    display: "grid",
                    gap: 2,
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  }}>
                  {/* Nombre */}
                  <FormControl
                    error={touched.nombre && Boolean(errors.nombre)}
                    required>
                    <FormLabel>Nombre</FormLabel>
                    <Field name="nombre">
                      {({ field }) => <Input {...field} fullWidth />}
                    </Field>
                    {touched.nombre && errors.nombre && (
                      <Typography level="body3" color="danger">
                        {errors.nombre}
                      </Typography>
                    )}
                  </FormControl>

                  {/* Email */}
                  <FormControl
                    error={touched.email && Boolean(errors.email)}
                    required>
                    <FormLabel>Email</FormLabel>
                    <Field name="email">
                      {({ field }) => (
                        <Input type="email" {...field} fullWidth />
                      )}
                    </Field>
                    {touched.email && errors.email && (
                      <Typography level="body3" color="danger">
                        {errors.email}
                      </Typography>
                    )}
                  </FormControl>

                  {/* Username */}
                  <FormControl
                    error={touched.username && Boolean(errors.username)}
                    required>
                    <FormLabel>Username</FormLabel>
                    <Field name="username">
                      {({ field }) => <Input {...field} fullWidth />}
                    </Field>
                    {touched.username && errors.username && (
                      <Typography level="body3" color="danger">
                        {errors.username}
                      </Typography>
                    )}
                  </FormControl>

                  {/* Rol */}
                  <FormControl
                    error={touched.rol && Boolean(errors.rol)}
                    required>
                    <FormLabel>Rol</FormLabel>
                    <Select
                      disabled={
                        !Array.isArray(ciudades) || ciudades.length === 0
                      }
                      value={values.rol}
                      onChange={(_, v) => setFieldValue("rol", v)}
                      fullWidth>
                      {roles.map((r) => (
                        <Option key={r} value={r}>
                          {r}
                        </Option>
                      ))}
                    </Select>
                    {touched.rol && errors.rol && (
                      <Typography level="body3" color="danger">
                        {errors.rol}
                      </Typography>
                    )}
                  </FormControl>

                  {/* Puesto */}
                  <FormControl
                    error={touched.puesto && Boolean(errors.puesto)}
                    required>
                    <FormLabel>Puesto</FormLabel>
                    <Select
                      value={values.puesto}
                      onChange={(_, v) => setFieldValue("puesto", v)}
                      fullWidth>
                      {puestos.map((p) => (
                        <Option key={p} value={p}>
                          {p}
                        </Option>
                      ))}
                    </Select>
                    {touched.puesto && errors.puesto && (
                      <Typography level="body3" color="danger">
                        {errors.puesto}
                      </Typography>
                    )}
                  </FormControl>

                  {/* Ciudad */}
                  <FormControl
                    error={touched.ciudad && Boolean(errors.ciudad)}
                    required>
                    <FormLabel>Ciudad</FormLabel>
                    <Select
                      value={values.ciudad}
                      onChange={(_, v) => setFieldValue("ciudad", v)}
                      fullWidth>
                      {ciudades && ciudades.length > 0 ? (
                        ciudades.map((c) => (
                          <Option key={c.id} value={String(c.id)}>
                            {c.nombre}
                          </Option>
                        ))
                      ) : (
                        <Typography level="body-sm" color="danger">
                          No hay ciudades disponibles o no tienes permisos.
                        </Typography>
                      )}
                    </Select>
                    {touched.ciudad && errors.ciudad && (
                      <Typography level="body3" color="danger">
                        {errors.ciudad}
                      </Typography>
                    )}
                  </FormControl>

                  {/* Supervisor */}
                  <FormControl
                    error={
                      touched.supervisor_id && Boolean(errors.supervisor_id)
                    }>
                    <FormLabel>Supervisor</FormLabel>
                    <Select
                      value={values.supervisor_id}
                      onChange={(_, v) => setFieldValue("supervisor_id", v)}
                      displayEmpty
                      fullWidth>
                      <Option value="">-- Ninguno --</Option>
                      {supervisores.map((sup) => (
                        <Option
                          key={sup.id_usuario}
                          value={String(sup.id_usuario)}>
                          {sup.nombre}
                        </Option>
                      ))}
                    </Select>
                    {touched.supervisor_id && errors.supervisor_id && (
                      <Typography level="body3" color="danger">
                        {errors.supervisor_id}
                      </Typography>
                    )}
                  </FormControl>

                  {/* Password - solo si no es edición */}
                  {!isEditMode ? (
                    <FormControl
                      error={touched.password && Boolean(errors.password)}
                      required>
                      <FormLabel>Contraseña</FormLabel>
                      <Field name="password">
                        {({ field }) => (
                          <Input type="password" {...field} fullWidth />
                        )}
                      </Field>
                      {touched.password && errors.password && (
                        <Typography level="body3" color="danger">
                          {errors.password}
                        </Typography>
                      )}
                    </FormControl>
                  ) : (
                    <>
                      <FormControl
                        sx={{
                          gridColumn: "1 / -1",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 2,
                        }}>
                        <FormLabel sx={{ whiteSpace: "nowrap" }}>
                          Contraseña
                        </FormLabel>
                        <Button
                          variant="soft"
                          size="sm"
                          onClick={() =>
                            setFieldValue(
                              "changePassword",
                              !values.changePassword
                            )
                          }>
                          {values.changePassword
                            ? "Cancelar cambio"
                            : "Cambiar contraseña"}
                        </Button>
                      </FormControl>

                      {values.changePassword && (
                        <FormControl
                          error={touched.password && Boolean(errors.password)}
                          required
                          sx={{ gridColumn: "1 / -1" }}>
                          <FormLabel>Nueva contraseña</FormLabel>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Field name="password">
                              {({ field }) => (
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  {...field}
                                  fullWidth
                                />
                              )}
                            </Field>
                            <Button
                              size="sm"
                              variant="outlined"
                              onClick={() => setShowPassword((prev) => !prev)}>
                              {showPassword ? "Ocultar" : "Ver"}
                            </Button>
                          </Box>
                          {touched.password && errors.password && (
                            <Typography level="body3" color="danger">
                              {errors.password}
                            </Typography>
                          )}
                        </FormControl>
                      )}
                    </>
                  )}

                  {/* Estatus */}
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <FormControl orientation="horizontal">
                      <FormLabel>Estatus</FormLabel>
                      <Switch
                        checked={values.estatus}
                        onChange={(e) =>
                          setFieldValue("estatus", e.target.checked)
                        }
                        endDecorator={values.estatus ? "Activo" : "Inactivo"}
                      />
                    </FormControl>
                  </Box>
                </Box>

                {/* Botones */}
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  spacing={1}
                  mt={3}>
                  <Button
                    variant="plain"
                    color="neutral"
                    onClick={() => {
                      resetForm();
                      setShowPassword(false);
                      onClose();
                    }}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isEditMode ? "Guardar cambios" : "Agregar"}
                  </Button>
                </Stack>
              </Form>
            </ModalDialog>
          </Modal>
        )}
      </Formik>
    </>
  );
}
