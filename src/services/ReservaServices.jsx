import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

// Crear una nueva reserva
export async function SaveReserva(reserva) {
  try {
    const res = await fetchConToken(endpoints.Reservas, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reserva),
    });

    const data = await res.json();
    return res.ok ? data : null;
  } catch (err) {
    console.error("Save reserva error:", err);
    return null;
  }
}

// Obtener todas las reservas
export async function getReservas() {
  try {
    const res = await fetchConToken(endpoints.Reservas);
    const data = await res.json();
    return res.ok ? data : [];
  } catch (err) {
    console.error("Get reservas error:", err);
    return [];
  }
}

// Obtener una reserva por ID
export async function getReservaById(id) {
  try {
    const res = await fetchConToken(`${endpoints.Reservas}/${id}`);
    const data = await res.json();
    return res.ok ? data : null;
  } catch (err) {
    console.error("Get reserva by ID error:", err);
    return null;
  }
}

// Actualizar una reserva existente
export async function updateReserva(id, reservaActualizada) {
  try {
    const res = await fetchConToken(`${endpoints.Reservas}/actualizar/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservaActualizada),
    });

    const data = await res.json();
    return res.ok ? data : null;
  } catch (err) {
    console.error("Update reserva error:", err);
    return null;
  }
}

// Cancelar una reserva
export async function cancelarReserva(id) {
  try {
    const res = await fetchConToken(`${endpoints.Reservas}/cancelar/${id}`, {
      method: "PUT",
    });

    const data = await res.json();
    return res.ok ? data : null;
  } catch (err) {
    console.error("Cancelar reserva error:", err);
    return null;
  }
}

// Finalizar una reserva
export async function finalizarReserva(id, body) {
  try {
    const res = await fetchConToken(`${endpoints.Reservas}/finalizar/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return res.ok ? data : null;
  } catch (err) {
    console.error("Finalizar reserva error:", err);
    return null;
  }
}

export async function getReservasPorUsuario(id) {
  try {
    const res = await fetchConToken(`${endpoints.Reservas}/empleado/${id}`);
    const data = await res.json();
    return res.ok ? data : [];
  } catch (err) {
    console.error("Get reservas por usuario error:", err);
    return [];
  }
}
