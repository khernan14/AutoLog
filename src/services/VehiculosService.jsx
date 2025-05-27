import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

export async function obtenerVehiculos() {
  try {
    const res = await fetchConToken(endpoints.getVehiculos, {
      method: "GET",
    });

    if (!res.ok) throw new Error("No se pudo obtener los vehículos");
    return await res.json();
  } catch (err) {
    console.error("Login error:", err);
    return null;
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
