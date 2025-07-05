import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

export async function getRegisterReport() {
  try {
    const res = await fetchConToken(endpoints.getRegisterReport);
    const data = await res.json();

    if (!res.ok) {
      console.error("Error al obtener registros:", data);
      return [];
    }

    return data.map((registro) => {
      // console.log("IMAGES:", registro.images); // ✅ Aquí sí debe mostrar el array
      // Puedes hacer cualquier transformación adicional aquí si es necesario
      return registro;
    });
  } catch (err) {
    console.error("Get register report error:", err);
    return [];
  }
}

export async function getEmpleadosMasSalidasReport() {
  try {
    const res = await fetchConToken(endpoints.getEmpleadosMasSalidas); // Asegúrate de definir esta endpoint
    const data = await res.json();

    if (!res.ok) {
      console.error(
        "Error al obtener reporte de empleados con más salidas:",
        data
      );
      return [];
    }
    return data;
  } catch (err) {
    console.error("Get empleados mas salidas report error:", err);
    return [];
  }
}

export async function getKilometrajePorEmpleadoReport() {
  try {
    const res = await fetchConToken(endpoints.getKilometrajePorEmpleado); // Asegúrate de definir esta endpoint
    const data = await res.json();

    if (!res.ok) {
      console.error(
        "Error al obtener reporte de kilometraje por empleado:",
        data
      );
      return [];
    }
    return data;
  } catch (err) {
    console.error("Get kilometraje por empleado report error:", err);
    return [];
  }
}

export async function getVehiculosMasUtilizadosReport() {
  try {
    const res = await fetchConToken(endpoints.getVehiculosMasUtilizados); // Asegúrate de definir esta endpoint
    const data = await res.json();

    if (!res.ok) {
      console.error(
        "Error al obtener reporte de vehículos más utilizados:",
        data
      );
      return [];
    }
    return data;
  } catch (err) {
    console.error("Get vehiculos mas utilizados report error:", err);
    return [];
  }
}

export async function getRegistrosPorUbicacionReport() {
  try {
    const res = await fetchConToken(endpoints.getRegistrosPorUbicacion); // Asegúrate de definir esta endpoint
    const data = await res.json();

    if (!res.ok) {
      console.error(
        "Error al obtener reporte de registros por ubicación:",
        data
      );
      return [];
    }
    return data;
  } catch (err) {
    console.error("Get registros por ubicacion report error:", err);
    return [];
  }
}

export async function getConsumoCombustibleVehiculoReport() {
  try {
    const res = await fetchConToken(endpoints.getConsumoCombustibleVehiculo); // Asegúrate de definir esta endpoint
    const data = await res.json();

    if (!res.ok) {
      console.error(
        "Error al obtener reporte de consumo de combustible por vehículo:",
        data
      );
      return [];
    }
    return data;
  } catch (err) {
    console.error("Get consumo combustible vehiculo report error:", err);
    return [];
  }
}

export async function getTotalEmpleados() {
  try {
    // Asume un endpoint como /api/reportes/total-empleados
    const res = await fetchConToken(endpoints.getTotalEmpleados);
    const data = await res.json();
    if (!res.ok) {
      console.error("Error al obtener total de empleados:", data);
      return { total: 0 };
    }
    return data; // Asume que el backend devuelve { total: X }
  } catch (err) {
    console.error("Get total empleados error:", err);
    return { total: 0 };
  }
}

export async function getTotalVehiculos() {
  try {
    // Asume un endpoint como /api/reportes/total-vehiculos
    const res = await fetchConToken(endpoints.getTotalVehiculos);
    const data = await res.json();
    if (!res.ok) {
      console.error("Error al obtener total de vehículos:", data);
      return { total: 0 };
    }
    return data; // Asume que el backend devuelve { total: X }
  } catch (err) {
    console.error("Get total vehiculos error:", err);
    return { total: 0 };
  }
}

export async function getVehiculosEnUso() {
  try {
    // Asume un endpoint como /api/reportes/vehiculos-en-uso
    const res = await fetchConToken(endpoints.getVehiculosEnUso);
    const data = await res.json();
    if (!res.ok) {
      console.error("Error al obtener vehículos en uso:", data);
      return { total: 0 };
    }
    return data; // Asume que el backend devuelve { total: X }
  } catch (err) {
    console.error("Get vehiculos en uso error:", err);
    return { total: 0 };
  }
}

export async function getVehiculosEnMantenimiento() {
  try {
    // Asume un endpoint como /api/reportes/vehiculos-en-mantenimiento
    const res = await fetchConToken(endpoints.getVehiculosEnMantenimiento);
    const data = await res.json();
    if (!res.ok) {
      console.error("Error al obtener vehículos en mantenimiento:", data);
      return { total: 0 };
    }
    return data; // Asume que el backend devuelve { total: X }
  } catch (err) {
    console.error("Get vehiculos en mantenimiento error:", err);
    return { total: 0 };
  }
}
