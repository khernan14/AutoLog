import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

// 🔹 Obtener todas las bodegas
export async function getBodegas() {
    const res = await fetchConToken(endpoints.getBodegas);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al obtener bodegas");
    return json;
}

// 🔹 Obtener una bodega por ID
export async function getBodegaById(id) {
    const res = await fetchConToken(`${endpoints.getBodegas}${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al obtener bodega");
    return json;
}

// 🔹 Crear bodega
export async function createBodega(data) {
    const res = await fetchConToken(endpoints.addBodega, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al crear bodega");
    return json;
}

// 🔹 Actualizar bodega
export async function updateBodega(id, data) {
    const res = await fetchConToken(`${endpoints.updateBodega}${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al actualizar bodega");
    return json;
}
