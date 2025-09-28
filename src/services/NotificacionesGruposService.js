// src/services/NotificacionesGruposService.js
import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

/**
 * LISTA DE GRUPOS
 * - Filtros:
 *   - search (alias q)
 *   - activo: ""(default)=solo activos, true=todos, false=inactivos
 */
export async function listGrupos({
  search = "",
  q,
  activo = "",
  page = 1,
  limit = 50,
} = {}) {
  const params = new URLSearchParams();
  const query = typeof q === "string" ? q : search;
  if (query) {
    // mandamos ambos por compatibilidad (tu backend puede leer 'q' o 'search')
    params.set("q", query);
    params.set("search", query);
  }
  if (activo !== "") params.set("activo", String(!!activo));
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);

  const res = await fetchConToken(
    `${endpoints.notifGrupos}?${params.toString()}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * CREAR GRUPO
 */
export async function createGrupo({ nombre, descripcion }) {
  const res = await fetchConToken(endpoints.notifGrupos, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, descripcion }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al crear grupo");
  return json;
}

/**
 * OBTENER DETALLE GRUPO
 */
export async function getGrupo(id) {
  const res = await fetchConToken(`${endpoints.notifGrupos}${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/**
 * ACTUALIZAR GRUPO
 */
export async function updateGrupo(id, data) {
  const res = await fetchConToken(`${endpoints.notifGrupos}${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al actualizar grupo");
  return json;
}

/**
 * ELIMINAR (soft) GRUPO -> activo=0
 */
export async function deleteGrupo(id) {
  const res = await fetchConToken(`${endpoints.notifGrupos}${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al eliminar grupo");
  return json;
}

/**
 * CAMBIAR ESTADO (activar/restaurar o inactivar)
 */
export async function setGrupoEstado(id, activo) {
  const res = await fetchConToken(`${endpoints.notifGrupos}${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({ activo }),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "Error al cambiar estado del grupo");
  return json;
}

/**
 * LISTAR MIEMBROS DEL GRUPO
 * GET /grupos/:id/miembros
 */
export async function listMiembros(grupoId, { page, limit } = {}) {
  // la API que definimos no pagina; mando page/limit solo si tu backend los soporta
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);

  const url =
    params.toString().length > 0
      ? `${endpoints.notifGrupos}${grupoId}/miembros?${params.toString()}`
      : `${endpoints.notifGrupos}${grupoId}/miembros`;

  const res = await fetchConToken(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // [{id_usuario, nombre, email, username}]
}

/**
 * AGREGAR MIEMBROS (bulk)
 * POST /grupos/:id/miembros  { usuarios: [id_usuario, ...] }
 */
export async function addMiembros(grupoId, ids = []) {
  const payload = { ids_usuario: ids };
  const urlBase = `${endpoints.notifGrupos}${grupoId}`;
  // intenta /miembros
  let res = await fetchConToken(`${urlBase}/miembros`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  // si tu backend viejo solo tiene /usuarios
  if (res.status === 404) {
    res = await fetchConToken(`${urlBase}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al agregar miembros");
  return json;
}

/**
 * QUITAR 1 MIEMBRO
 * DELETE /grupos/:id/miembros/:id_usuario
 */
export async function removeMiembro(grupoId, idUsuario) {
  const urlBase = `${endpoints.notifGrupos}${grupoId}`;
  let res = await fetchConToken(`${urlBase}/miembros/${idUsuario}`, {
    method: "DELETE",
  });
  if (res.status === 404) {
    res = await fetchConToken(`${urlBase}/usuarios/${idUsuario}`, {
      method: "DELETE",
    });
  }
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al quitar miembro");
  return json;
}

/**
 * LISTAR CANALES DEL GRUPO
 * GET /grupos/:id/canales
 */
export async function getCanales(grupoId) {
  const res = await fetchConToken(`${endpoints.notifGrupos}${grupoId}/canales`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // [{ canal, enabled, min_severity }]
}

export async function saveCanales(grupoId, canales = []) {
  const res = await fetchConToken(
    `${endpoints.notifGrupos}${grupoId}/canales`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canales }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al guardar canales");
  return json;
}

/* ======================
 * EXTRA: buscador usuarios (para el modal de miembros)
 * ====================== */
export async function listUsuarios({ q = "", limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (limit) params.set("limit", limit);

  const res = await fetchConToken(`${endpoints.getUsers}?${params.toString()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // [{ id_usuario, nombre, email, username }]
}
