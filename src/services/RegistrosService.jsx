import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

export async function obtenerRegistroActivo(id_empleado) {
  try {
    const res = await fetchConToken(
      endpoints.getRegistroactivo + `${id_empleado}/registro-pendiente`,
      {
        method: "GET",
      }
    );

    if (!res.ok) throw new Error("No se pudo obtener el registro activo");
    return await res.json();
  } catch (err) {
    console.error("Error al obtener el registro activo:", err);
    return null;
  }
}

export async function obtenerRegistroPendientePorVehiculo(id_vehiculo) {
  try {
    const res = await fetchConToken(
      // Ajusta esta ruta si registraste otra en el backend router:
      endpoints.getRegistros + `vehiculos/${id_vehiculo}/registro-pendiente`,
      { method: "GET" }
    );

    if (!res.ok) {
      // devuelvo null cuando 404 (no hay registro), y lanzo para otros códigos
      if (res.status === 404) return null;
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.error || "Error obteniendo registro pendiente");
    }

    return await res.json();
  } catch (err) {
    console.error("Error al obtener registro pendiente por vehículo:", err);
    // importante: devolvemos null para que el frontend lo trate como "no hay registro"
    return null;
  }
}

export async function obtenerKmActual(id_vehiculo) {
  try {
    const res = await fetchConToken(
      endpoints.getRegistros + `obtener-km-actual/${id_vehiculo}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) throw new Error("No se pudo obtener el km actual");
    return await res.json();
  } catch (err) {
    console.error("Error al obtener el km actual:", err);
    return null;
  }
}

export async function obtenerCombustibleActual(id_vehiculo) {
  try {
    const res = await fetchConToken(
      endpoints.getRegistros + `obtener-combustible-actual/${id_vehiculo}`
    );

    if (!res.ok) throw new Error("No se pudo obtener el combustible actual");
    return await res.json();
  } catch (err) {
    console.error("Error al obtener el combustible actual:", err);
    return null;
  }
}

// export async function registrarSalida(datosSalida) {
//   try {
//     const res = await fetchConToken(endpoints.registrarSalida, {
//       method: "POST",
//       body: JSON.stringify(datosSalida),
//     });

//     if (!res.ok) throw new Error("No se pudo registrar la salida");
//     return await res.json();
//   } catch (err) {
//     console.error("Error al registrar la salida:", err);
//     return null;
//   }
// }

export async function registrarSalida(formData) {
  try {
    const res = await fetchConToken(endpoints.registrarSalida, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const message = errorBody?.error || "No se pudo registrar la salida";
      throw new Error(message);
    }

    return await res.json();
  } catch (err) {
    console.error("Error al registrar la salida:", err);
    throw err; // 👈 importante: relanzar el error para que el componente lo capture
  }
}

// export async function registrarEntrada(datosEntrada) {
//   try {
//     const res = await fetchConToken(endpoints.registrarRegreso, {
//       method: "POST",
//       body: JSON.stringify(datosEntrada),
//     });

//     if (!res.ok) throw new Error("No se pudo registrar la entrada");
//     return await res.json();
//   } catch (err) {
//     console.error("Error al registrar la entrada:", err);
//     return null;
//   }
// }

// Subir y asociar imagenes al registro

export async function registrarRegreso(formData) {
  try {
    const res = await fetchConToken(endpoints.registrarRegreso, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const message = errorBody?.error || "No se pudo registrar la entrada";
      throw new Error(message);
    }

    return await res.json();
  } catch (err) {
    console.error("Error al registrar la entrada:", err);
    throw err; // 👈 importante: relanzar el error para que el componente lo capture
  }
}

export async function SubirImagenesRegistro(id_registro, imagenes) {
  const formData = new FormData();
  for (let i = 0; i < imagenes.length; i++) {
    formData.append("imagenes", imagenes[i]);
  }

  const res = await fetchConToken(
    endpoints.resgistrarImagenes + `${id_registro}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    // Intentamos leer el error específico que envía el backend
    const errorData = await res.json();
    const mensaje = errorData.error || "No se pudieron subir las imágenes";
    throw new Error(mensaje);
  }

  return await res.json();
}

export async function getCiudades() {
  try {
    const res = await fetchConToken(endpoints.getCiudades, {
      method: "GET",
    });

    if (!res.ok) throw new Error("No se pudo obtener las ciudades");
    return await res.json();
  } catch (err) {
    console.error("Error al obtener las ciudades:", err);
    return [];
  }
}
