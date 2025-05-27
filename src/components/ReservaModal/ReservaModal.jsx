import { useState, useEffect } from "react";
import {
  Modal,
  ModalDialog,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Button,
  Stack,
  Typography,
} from "@mui/joy";
import Swal from "sweetalert2";
import { STORAGE_KEYS } from "../../config/variables";
import {
  SaveReserva,
  updateReserva,
  cancelarReserva,
} from "../../services/ReservaServices";

export default function ReservaModal({
  open,
  onClose,
  fechaInicio,
  fechaFin,
  setFechaInicio,
  setFechaFin,
  vehiculos = [],
  empleados = [],
  reservaSeleccionada = null,
  reloadEventos, // para recargar el calendario
}) {
  const [vehiculo, setVehiculo] = useState("");
  const [empleado, setEmpleado] = useState("");
  const [motivo, setMotivo] = useState("");

  const bloqueado =
    reservaSeleccionada?.estado === "Cancelada" ||
    reservaSeleccionada?.estado === "Finalizada";

  // ✅ Carga los datos si estás editando una reserva
  useEffect(() => {
    if (reservaSeleccionada) {
      console.log("Reserva seleccionada:", reservaSeleccionada);
      setVehiculo(Number(reservaSeleccionada.vehiculo)); // 👈 asegúrate que sea número
      setEmpleado(Number(reservaSeleccionada.empleado)); // 👈 igual aquí
      setMotivo(reservaSeleccionada.motivo);
      setFechaInicio(reservaSeleccionada.fechaInicio.slice(0, 16));
      setFechaFin(reservaSeleccionada.fechaFin.slice(0, 16));
    } else {
      setVehiculo("");
      setEmpleado("");
      setMotivo("");
      setFechaInicio("");
      setFechaFin("");
    }
  }, [reservaSeleccionada]);

  const handleSubmit = async () => {
    if (!vehiculo || !empleado || !motivo || !fechaInicio || !fechaFin) {
      return Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa todos los campos antes de guardar.",
      });
    }

    const userData = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
    const id_empleado_reserva = userData?.id_empleado;

    const payload = {
      id_vehiculo: Number(vehiculo),
      id_empleado: Number(empleado),
      id_empleado_reserva,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      motivo,
    };

    try {
      if (reservaSeleccionada?.id) {
        await updateReserva(reservaSeleccionada.id, payload);
      } else {
        await SaveReserva(payload);
      }

      Swal.fire({
        icon: "success",
        title: "Reserva guardada",
        text: "La reserva se ha procesado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      onClose();
      reloadEventos?.();
    } catch (error) {
      console.error("Error al guardar la reserva:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar la reserva. Intenta nuevamente.",
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ maxWidth: 600, width: "100%" }}>
        <Stack spacing={2}>
          {bloqueado && (
            <Typography level="body-sm" color="danger">
              Esta reserva está {reservaSeleccionada.estado}. No puedes
              modificarla.
            </Typography>
          )}

          <Typography level="h4">
            {reservaSeleccionada?.id && (
              <Button
                color="danger"
                variant="soft"
                disabled={bloqueado} // 👈 aquí
                onClick={async () => {
                  const confirm = await Swal.fire({
                    icon: "warning",
                    title: "¿Cancelar reserva?",
                    text: "Esta acción no se puede deshacer.",
                    showCancelButton: true,
                    confirmButtonText: "Sí, cancelar",
                    cancelButtonText: "No",
                  });

                  if (confirm.isConfirmed) {
                    try {
                      await cancelarReserva(reservaSeleccionada.id);
                      Swal.fire({
                        icon: "success",
                        title: "Reserva cancelada",
                        timer: 2000,
                        showConfirmButton: false,
                      });
                      onClose();
                      reloadEventos?.();
                    } catch (error) {
                      console.error("Error al cancelar:", error);
                      Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "No se pudo cancelar la reserva.",
                      });
                    }
                  }
                }}>
                Cancelar Reserva
              </Button>
            )}
          </Typography>

          <FormControl required>
            <FormLabel>Vehículo</FormLabel>
            <Select
              value={vehiculo}
              onChange={(_, val) => setVehiculo(Number(val))}
              placeholder="Selecciona un vehículo"
              disabled={bloqueado || vehiculos.length === 0}>
              {vehiculos.map((v) => (
                <Option key={v.id} value={Number(v.id)}>
                  {v.placa} - {v.modelo}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl required>
            <FormLabel>Empleado asignado</FormLabel>
            <Select
              value={empleado}
              onChange={(_, val) => setEmpleado(val)}
              placeholder="Selecciona un empleado"
              disabled={bloqueado || empleados.length === 0}>
              {empleados?.map((e) => (
                <Option key={e.id} value={e.id}>
                  {e.nombre}
                </Option>
              ))}
            </Select>
          </FormControl>

          <FormControl required>
            <FormLabel>Motivo de la reserva</FormLabel>
            <Select
              disabled={bloqueado}
              value={motivo}
              onChange={(_, val) => setMotivo(val)}
              placeholder="Selecciona un motivo">
              <Option value="mantenimiento">Mantenimiento del Vehículo</Option>
              <Option value="visita tecnica">Visita técnica</Option>
              <Option value="otros">Otros</Option>
            </Select>
          </FormControl>

          <FormControl required>
            <FormLabel>Fecha de inicio</FormLabel>
            <Input
              type="datetime-local"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </FormControl>

          <FormControl required>
            <FormLabel>Fecha de fin</FormLabel>
            <Input
              type="datetime-local"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </FormControl>

          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button variant="plain" color="neutral" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={bloqueado}>
              Guardar Reserva
            </Button>
          </Stack>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}
