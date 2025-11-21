// src/services/VehiculosService.js
import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

const API_BASE = import.meta.env.VITE_API_URL;

export async function obtenerVehiculos() {
  try {
    const res = await fetchConToken(endpoints.getVehiculos, {
      method: "GET",
    });

    if (!res.ok) throw new Error("No se pudo obtener los vehículos");
    const json = await res.json();
    return json;
  } catch (err) {
    console.error("Error getVehiculos:", err);
    throw err;
  }
}

export async function ListarVehiculosEmpleado(id_empleado) {
  try {
    const res = await fetchConToken(
      endpoints.getVehiculos + `${id_empleado}/`,
      {
        method: "GET",
      }
    );

    if (!res.ok) throw new Error("No se pudo obtener los vehículos");
    return await res.json();
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
}

export async function getUbicaciones() {
  try {
    const res = await fetchConToken(endpoints.getUbicaciones);

    if (!res.ok) throw new Error("No se pudo obtener las ubicaciones");
    return await res.json();
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
}

export async function addVehiculos(vehiculo) {
  try {
    const res = await fetchConToken(endpoints.addVehiculo, {
      method: "POST",
      body: JSON.stringify(vehiculo),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("No se pudo agregar el vehículo");
    return await res.json();
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
}

export async function actualizarVehiculo(id, vehiculo) {
  try {
    const res = await fetchConToken(endpoints.addVehiculo + id, {
      method: "PUT",
      body: JSON.stringify(vehiculo),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("No se pudo actualizar el vehículo");
    return await res.json();
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
}

export async function deleteVehiculo(id) {
  try {
    const res = await fetchConToken(endpoints.deleteVehiculo + id, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("No se pudo eliminar el vehículo");
    return await res.json();
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
}

export async function restoreVehiculo(id) {
  try {
    const res = await fetchConToken(
      endpoints.restoreVehiculo + "restaurar/" + id,
      {
        method: "PUT",
      }
    );

    if (!res.ok) throw new Error("No se pudo restaurar el vehículo");
    return await res.json();
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
}

// 🔹 Obtener enlace firmado de registro para un vehículo
export async function getRegistroLinkForVehiculo(idVehiculo) {
  try {
    // 👉 usamos el MISMO base que obtenerVehiculos
    // si endpoints.getVehiculos = "http://localhost:3000/api/vehiculos/"
    // esto queda: "http://localhost:3000/api/vehiculos/1/registro/link"
    const res = await fetchConToken(
      `${endpoints.getVehiculos}${idVehiculo}/registro/link`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg =
        errJson?.message ||
        "No se pudo generar el enlace de registro del vehículo";
      throw new Error(msg);
    }

    // { url, token, expiresIn, vehiculo: { id, placa } }
    return await res.json();
  } catch (err) {
    console.error("Error getRegistroLinkForVehiculo:", err);
    throw err;
  }
}

// 🔹 Resolver token de QR -> datos del vehículo
export async function resolveVehiculoFromQrToken(token) {
  try {
    // Igual: nos colgamos del mismo base /api/vehiculos
    // endpoints.getVehiculos = "http://localhost:3000/api/vehiculos/"
    // => "http://localhost:3000/api/vehiculos/registro/resolve?token=..."
    const res = await fetchConToken(
      `${endpoints.getVehiculos}registro/resolve?token=${encodeURIComponent(
        token
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = errJson?.message || "Token de QR inválido o expirado";
      throw new Error(msg);
    }

    // { id_vehiculo, placa, marca, modelo }
    return await res.json();
  } catch (err) {
    console.error("Error resolveVehiculoFromQrToken:", err);
    throw err;
  }
}
