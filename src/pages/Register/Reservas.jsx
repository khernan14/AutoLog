import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ReservaModal from "../../components/ReservaModal/ReservaModal";
import { obtenerVehiculos } from "../../services/VehiculosService";
import { getEmpleados } from "../../services/AuthServices";
import { getReservas } from "../../services/ReservaServices";

export default function Reservas() {
  const [modalOpen, setModalOpen] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [vehiculos, setVehiculos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState(null);

  const fetchData = async () => {
    try {
      const vehiculosData = await obtenerVehiculos();
      const empleadosData = await getEmpleados();
      const reservasData = await getReservas();

      console.log("Esta es la reserva seleccionada:", reservaSeleccionada);

      const eventosFormateados = reservasData.map((r) => {
        let color = "#4caf50"; // verde por defecto
        if (r.estatus === "Cancelada") {
          color = "#e53935"; // rojo
        } else if (r.estatus === "Finalizada") {
          color = "#757575"; // gris
        }

        return {
          id: r.id,
          title: `${r.placa} - ${r.motivo}`,
          start: r.fecha_inicio,
          end: r.fecha_fin,
          backgroundColor: color,
          borderColor: "#000",
          textColor: "#fff",
          extendedProps: {
            vehiculo: r.id_vehiculo,
            empleado: r.id_empleado,
            motivo: r.motivo,
            fechaInicio: r.fecha_inicio,
            fechaFin: r.fecha_fin,
            estado: r.estatus,
          },
        };
      });

      setVehiculos(vehiculosData);
      setEmpleados(empleadosData);
      setEventos(eventosFormateados);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelect = (info) => {
    const now = new Date();
    const start = new Date(info.start);
    const end = new Date(info.end.getTime() - 1);

    // Solo permitir seleccionar días a partir de hoy
    if (start < now.setHours(0, 0, 0, 0)) {
      return; // Ignora selección en días pasados
    }

    start.setHours(8, 0, 0, 0);
    end.setHours(17, 0, 0, 0);

    setFechaInicio(start.toISOString().slice(0, 16));
    setFechaFin(end.toISOString().slice(0, 16));
    setReservaSeleccionada(null);
    setModalOpen(true);
  };

  const handleEventClick = (info) => {
    // Evita acción con un solo clic
    info.jsEvent.preventDefault();
  };

  const handleEventDoubleClick = (info) => {
    const r = info.event;
    const { vehiculo, empleado, motivo, fechaInicio, fechaFin } =
      r.extendedProps;

    setReservaSeleccionada({
      id: r.id,
      vehiculo,
      empleado,
      motivo,
      fechaInicio,
      fechaFin,
      estado: r.extendedProps.estado,
    });

    setModalOpen(true);
  };

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={true}
        events={eventos}
        select={handleSelect}
        eventClick={handleEventClick}
        eventDidMount={(info) => {
          // Doble clic
          info.el.addEventListener("dblclick", () =>
            handleEventDoubleClick(info)
          );
        }}
        eventContent={(arg) => (
          <div
            style={{
              backgroundColor: arg.event.backgroundColor,
              color: "#fff",
              borderRadius: "5px",
              padding: "2px 4px",
              fontSize: "0.8em",
              fontWeight: "bold",
              boxShadow: "0px 1px 4px rgba(0,0,0,0.2)",
            }}>
            <div>{arg.event.title}</div>
          </div>
        )}
        // validRange={{ start: new Date().toISOString().split("T")[0] }}
      />

      <ReservaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        setFechaInicio={setFechaInicio}
        setFechaFin={setFechaFin}
        vehiculos={vehiculos}
        empleados={empleados}
        reservaSeleccionada={reservaSeleccionada}
        reloadEventos={fetchData}
      />
    </>
  );
}
