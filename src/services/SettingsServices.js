// src/services/SettingsService.js
import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

function withParams(url, params = {}) {
  const u = new URL(url, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "")
      u.searchParams.set(k, String(v));
  });
  return u.toString().replace(window.location.origin, "");
}

/**
 * Nota sobre endpoints esperados (ajusta en config/variables):
 * endpoints.getSettings         -> '/api/settings'
 * endpoints.getSection         -> '/api/settings/' (se concatena el :section)
 * endpoints.patchSection       -> '/api/settings/' (se concatena el :section)
 * endpoints.getSectionHistory  -> '/api/settings/' (se concatena `${section}/history`)
 *
 * Ejemplo:
 *   getSection('seguridad') -> GET /api/settings/seguridad
 *   patchSection('perfil', { nombre: 'Perrin' }) -> PATCH /api/settings/perfil
 */

/* ---------------------------
   Lectura de settings
   --------------------------- */

/**
 * Obtener todas las secciones para el usuario actual.
 * Si eres Admin y pasas { userId }, el backend debe permitirlo.
 *
 * @param {{ userId?: number }} opts
 * @returns {Promise<object>} json.data
 */
export async function getAllSettings(opts = {}) {
  const url = withParams(endpoints.getSettings, { user_id: opts.userId });
  const res = await fetchConToken(url);
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al obtener configuraciones");
  return json.data ?? json;
}

/**
 * Obtener una sección concreta (ej: 'seguridad')
 * @param {string} section
 * @param {{ userId?: number }} opts
 */
export async function getSection(section, opts = {}) {
  if (!section) throw new Error("section es requerido");
  const base = `${endpoints.getSettings.replace(
    /\/$/,
    ""
  )}/${encodeURIComponent(section)}`;
  const url = withParams(base, { user_id: opts.userId });
  const res = await fetchConToken(url);
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || `Error al obtener sección ${section}`);
  return json.data ?? {};
}

/* ---------------------------
   Escritura (PATCH / merge parcial)
   --------------------------- */

/**
 * Patch / merge parcial de una sección.
 * @param {string} section
 * @param {object} partialPayload
 * @param {{ userId?: number }} opts
 * @returns {Promise<object>} data actualizado (payload)
 */
export async function patchSection(section, partialPayload = {}, opts = {}) {
  const base = `${endpoints.getSettings.replace(
    /\/$/,
    ""
  )}/${encodeURIComponent(section)}`;
  const url = withParams(base, { user_id: opts.userId });

  const res = await fetchConToken(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partialPayload),
  });

  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || `Error al guardar sección ${section}`);
  // RETURN full json so caller can inspect action / data
  return json;
}

/* ---------------------------
   Historial
   --------------------------- */

/**
 * Obtener historial de una sección
 * @param {string} section
 * @param {{ userId?: number, limit?: number, offset?: number }} opts
 */
export async function getSectionHistory(section, opts = {}) {
  if (!section) throw new Error("section es requerido");
  const base = `${endpoints.getSettings.replace(
    /\/$/,
    ""
  )}/${encodeURIComponent(section)}/history`;
  const url = withParams(base, {
    user_id: opts.userId,
    limit: opts.limit,
    offset: opts.offset,
  });
  const res = await fetchConToken(url);
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || `Error al obtener historial ${section}`);
  return json.data ?? [];
}

/* ---------------------------
   Exports por defecto
   --------------------------- */
const SettingsService = {
  getAllSettings,
  getSection,
  patchSection,
  getSectionHistory,
};

export default SettingsService;
