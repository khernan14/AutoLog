import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

export async function getParkings() {
  try {
    const res = await fetchConToken(endpoints.getParkings, {
      method: "GET",
    });

    if (!res.ok) throw new Error("No se pudo obtener los estacionamientos");
    return await res.json();
  } catch (err) {
    console.error("Get parkings error:", err);
    return [];
  }
}

export async function addParking(parking) {
  try {
    const res = await fetchConToken(endpoints.addParking, {
      method: "POST",
      body: JSON.stringify(parking),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("No se pudo agregar el estacionamiento");
    return await res.json();
  } catch (err) {
    console.error("Add parking error:", err);
    return null;
  }
}

export async function updateParking(id, parking) {
  try {
    const res = await fetchConToken(endpoints.updateParking + id, {
      method: "PUT",
      body: JSON.stringify(parking),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("No se pudo actualizar el estacionamiento");
    return await res.json();
  } catch (err) {
    console.error("Update parking error:", err);
    return null;
  }
}

export async function deleteParking(id) {
  try {
    const res = await fetchConToken(endpoints.deleteParking + id, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("No se pudo eliminar el estacionamiento");
    return await res.json();
  } catch (err) {
    console.error("Delete parking error:", err);
    return null;
  }
}
