import { useState, useEffect } from "react";
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

export default function UserFormModal({
  open,
  onClose,
  onSave,
  user,
  ciudades,
}) {
  const isEditMode = Boolean(user);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    username: "",
    password: "",
    rol: "", // Asegúrate de que esto esté vacío para cuando no se edite
    estatus: true,
    puesto: "", // Y lo mismo con "puesto"
    ciudad: "",
  });
  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        ...user,
        ciudad: user.id_ciudad || "",
        password: "",
      });
      setChangePassword(false);
    } else {
      setForm({
        nombre: "",
        email: "",
        username: "",
        password: "",
        rol: "",
        estatus: true,
        puesto: "",
        ciudad: "",
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !form.nombre ||
      !form.email ||
      !form.username ||
      !form.rol ||
      !form.puesto ||
      !form.ciudad
    ) {
      alert("Por favor, completa los campos obligatorios.");
      return;
    }

    const dataToSend = {
      ...form,
      estatus: form.estatus ? "Activo" : "Inactivo",
      id_ciudad: form.ciudad,
    };

    if (isEditMode && !changePassword) {
      delete dataToSend.password;
    }

    const result = await onSave(dataToSend); // <-- ya regresa la respuesta

    if (!result || result.error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: result?.error || "No se pudo guardar el usuario.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    Swal.fire({
      title: "¡Gracias!",
      text: "Se guardó el usuario con éxito",
      icon: "success",
      confirmButtonColor: "#03624C",
    }).then(() => {
      onClose();
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        sx={{
          maxWidth: 800,
          width: "100%",
          overflow: "auto",
        }}>
        <Typography level="h4" component="h2" mb={2}>
          {isEditMode ? "Editar usuario" : "Agregar usuario"}
        </Typography>

        <Box
          component="form"
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}>
          <FormControl required>
            <FormLabel>Nombre</FormLabel>
            <Input
              value={form.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              fullWidth
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              fullWidth
            />
          </FormControl>
          <FormControl required>
            <FormLabel>Username</FormLabel>
            <Input
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              fullWidth
            />
          </FormControl>

          <FormControl required>
            <FormLabel>Rol</FormLabel>
            <Select
              value={form.rol}
              onChange={(_, newValue) => handleChange("rol", newValue)}
              fullWidth>
              <Option value="Empleado">Empleado</Option>
              <Option value="Supervisor">Supervisor</Option>
            </Select>
          </FormControl>

          <FormControl required>
            <FormLabel>Puesto</FormLabel>
            <Select
              value={form.puesto}
              onChange={(_, newValue) => handleChange("puesto", newValue)}
              fullWidth>
              <Option value="Desarrollador">Desarrollador</Option>
              <Option value="Tecnico Microsistemas">
                Tecnico Microsistemas
              </Option>
              <Option value="Tecnico ATM">Tecnico ATM</Option>
              <Option value="Oficial de Servicios">Oficial de Servicios</Option>
            </Select>
          </FormControl>

          <FormControl required>
            <FormLabel>Ciudad</FormLabel>
            <Select
              value={form.ciudad}
              onChange={(_, newValue) => handleChange("ciudad", newValue)}
              fullWidth>
              {ciudades?.map((ciudad) => (
                <Option key={ciudad.id} value={ciudad.id}>
                  {ciudad.nombre}
                </Option>
              ))}
            </Select>
          </FormControl>

          {!isEditMode ? (
            <FormControl required>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                fullWidth
              />
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
                  Cambiar contraseña
                </FormLabel>
                <Switch
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                />
              </FormControl>
              {changePassword && (
                <FormControl required sx={{ gridColumn: "1 / -1" }}>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    fullWidth
                    sx={{ width: "49%" }}
                  />
                </FormControl>
              )}
            </>
          )}

          <Box sx={{ gridColumn: "1 / -1" }}>
            <FormControl orientation="horizontal">
              <FormLabel>Estatus</FormLabel>
              <Switch
                checked={form.estatus}
                onChange={(e) => handleChange("estatus", e.target.checked)}
                endDecorator={form.estatus ? "Activo" : "Inactivo"}
              />
            </FormControl>
          </Box>
        </Box>

        <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
          <Button variant="plain" color="neutral" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {isEditMode ? "Guardar cambios" : "Agregar"}
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
