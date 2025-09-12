import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

// Mover activo a nueva ubicación
export async function moverActivo(data) {
    const res = await fetchConToken(endpoints.moverActivo, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al mover activo");
    return json;
}

// Obtener movimientos/historial de un activo
export async function getMovimientosByActivo(id_activo) {
    const res = await fetchConToken(`${endpoints.movimientosByActivo}${id_activo}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al obtener movimientos");
    return json;
}
