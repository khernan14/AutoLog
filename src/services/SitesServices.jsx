// src/services/SitesServices.js
import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

// Helper para query params
function withParams(url, params = {}) {
  const u = new URL(url, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "")
      u.searchParams.set(k, String(v));
  });
  return u.toString().replace(window.location.origin, "");
}

// Obtener todos los sites (global, si lo usas)
export async function getSites() {
  const res = await fetchConToken(endpoints.getSites);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al obtener sites");
  return json;
}

// Obtener sites de un cliente
// 👇 ahora acepta soloActivos (para reusar en distintas pantallas)
export async function getSitesByCliente(id, { soloActivos = false } = {}) {
  const url = withParams(`${endpoints.getSites}company/${id}`, {
    soloActivos: soloActivos ? 1 : undefined,
  });

  const res = await fetchConToken(url);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al obtener site");
  return json;
}

// Azúcar: solo sites activos de un cliente (para el modal de mover)
export async function getActiveSitesByCliente(id) {
  return getSitesByCliente(id, { soloActivos: true });
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
