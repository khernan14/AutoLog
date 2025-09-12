import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

// 🔹 Obtener activos en una bodega específica
export async function getActivosByBodega(idBodega) {
    const res = await fetchConToken(`${endpoints.getActivosByBodega}${idBodega}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al obtener activos de la bodega");
    return json;
}

// 🔹 Obtener activos en todas las bodegas
// export async function getActivosEnBodegas() {
//     const res = await fetchConToken(endpoints.getActivosEnBodegas);
//     const json = await res.json();
//     if (!res.ok) throw new Error(json.message || "Error al obtener activos en bodegas");
//     return json;
// }

// 🔹 Crear activo directamente en bodega
export async function createActivoEnBodega(data) {
    const res = await fetchConToken(endpoints.addActivo, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // data debe tener {codigo, nombre, ..., id_bodega, usuario_responsable}
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al crear activo en bodega");
    return json;
}
