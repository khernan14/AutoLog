import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

// Obtener todos los sites
export async function getSites() {
    const res = await fetchConToken(endpoints.getSites);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al obtener sites");
    return json;
}

// Obtener uno
export async function getSitesByCliente(id) {
    const res = await fetchConToken(`${endpoints.getSites}company/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al obtener site");
    return json;
}

// Crear
export async function createSite(data) {
    const res = await fetchConToken(endpoints.addSite, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al crear site");
    return json;
}

// Actualizar
export async function updateSite(id, data) {
    const res = await fetchConToken(`${endpoints.updateSite}${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Error al actualizar site");
    return json;
}
