import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

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
