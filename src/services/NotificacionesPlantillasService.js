import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

// Listar
export async function listPlantillas({
  evento,
  canal = "email",
  locale = "es",
  activo = "",
  page = 1,
  limit = 50,
} = {}) {
  const params = new URLSearchParams();
  if (evento) params.set("evento", evento);
  if (canal) params.set("canal", canal);
  if (locale) params.set("locale", locale);
  if (activo !== "") params.set("activo", String(!!activo)); // "" = default (solo activas)
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);

  const res = await fetchConToken(
    `${endpoints.notifPlantillas}?${params.toString()}`
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Crear
export async function createPlantilla({
  evento_clave,
  evento_id,
  canal = "email",
  locale = "es",
  asunto,
  cuerpo,
  metadata,
}) {
  const res = await fetchConToken(endpoints.notifPlantillas, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      evento_clave,
      evento_id,
      canal,
      locale,
      asunto,
      cuerpo,
      metadata,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al crear plantilla");
  return json;
}

// Editar
export async function updatePlantilla(id, { asunto, cuerpo, metadata }) {
  const res = await fetchConToken(`${endpoints.notifPlantillas}${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ asunto, cuerpo, metadata }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al actualizar plantilla");
  return json;
}

// Eliminar (soft)
export async function deletePlantilla(id) {
  const res = await fetchConToken(`${endpoints.notifPlantillas}${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al eliminar plantilla");
  return json;
}

// Publicar como default
export async function publishPlantilla(id) {
  const res = await fetchConToken(
    `${endpoints.notifPlantillasPublish}${id}/publicar`,
    { method: "POST" }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al publicar plantilla");
  return json;
}

// Preview (render sin enviar)
export async function previewPlantilla({
  evento_clave,
  canal = "email",
  locale = "es",
  payload = {},
}) {
  const res = await fetchConToken(endpoints.notifPlantillasPreview, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ evento_clave, canal, locale, payload }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al previsualizar");
  return json; // { subject, html }
}

// Enviar prueba
export async function testPlantilla(id, { to_email, payload = {} }) {
  const res = await fetchConToken(
    `${endpoints.notifPlantillasTest}${id}/test`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to_email, payload }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al enviar prueba");
  return json;
}

// Restablecer
export async function setPlantillaEstado(id, activo) {
  const res = await fetchConToken(`${endpoints.notifPlantillas}${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activo }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al cambiar estado");
  return json;
}
