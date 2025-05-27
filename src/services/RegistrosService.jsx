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

export async function registrarSalida(datosSalida) {
  try {
    const res = await fetchConToken(endpoints.registrarSalida, {
      method: "POST",
      body: JSON.stringify(datosSalida),
    });

    if (!res.ok) throw new Error("No se pudo registrar la salida");
    return await res.json();
  } catch (err) {
    console.error("Error al registrar la salida:", err);
    return null;
  }
}

export async function registrarEntrada(datosEntrada) {
  try {
    const res = await fetchConToken(endpoints.registrarRegreso, {
      method: "POST",
      body: JSON.stringify(datosEntrada),
    });

    if (!res.ok) throw new Error("No se pudo registrar la entrada");
    return await res.json();
  } catch (err) {
    console.error("Error al registrar la entrada:", err);
    return null;
  }
}

// Subir y asociar imagenes al registro
export async function SubirImagenesRegistro(id_registro, imagenes) {
  try {
    const formData = new FormData();
    for (let i = 0; i < imagenes.length; i++) {
      formData.append("imagenes", imagenes[i]);
      console.log("FormData:", formData);
    }

    const res = await fetchConToken(
      endpoints.resgistrarImagenes + `${id_registro}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) throw new Error("No se pudieron subir las imagenes");
    return await res.json();
  } catch (error) {
    console.error("Error al subir las imagenes:", error);
    return null;
  }
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
    return null;
  }
}
