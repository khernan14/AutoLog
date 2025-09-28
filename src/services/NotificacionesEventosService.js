import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

// Lista con filtros
export async function listEventos({
  search = "",
  activo,
  page = 1,
  limit = 50,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (typeof activo !== "undefined") params.set("activo", String(!!activo));
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);

  const res = await fetchConToken(
    `${endpoints.notifEventos}?${params.toString()}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Crear
export async function createEvento(data) {
  const res = await fetchConToken(endpoints.notifEventos, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al crear evento");
  return json;
}

// Detalle
export async function getEvento(id) {
  const res = await fetchConToken(`${endpoints.notifEventos}${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Editar
export async function updateEvento(id, data) {
  const res = await fetchConToken(`${endpoints.notifEventos}${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al actualizar evento");
  return json;
}

// Eliminar (soft)
export async function deleteEvento(id) {
  const res = await fetchConToken(`${endpoints.notifEventos}${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al eliminar evento");
  return json;
}

// Toggle estado
export async function setEventoEstado(id, activo) {
  const res = await fetchConToken(
    `${endpoints.notifEventosEstado}${id}/estado`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al cambiar estado");
  return json;
}

// Grupos asignados
export async function getEventoGrupos(id) {
  const res = await fetchConToken(
    `${endpoints.notifEventosGrupos}${id}/grupos`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Reemplazar grupos asignados
export async function setEventoGrupos(id, grupos) {
  const res = await fetchConToken(
    `${endpoints.notifEventosGrupos}${id}/grupos`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grupos }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al asignar grupos");
  return json;
}
