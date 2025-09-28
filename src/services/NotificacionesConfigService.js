import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

export async function getNotifConfig(clave) {
  const res = await fetchConToken(
    `${endpoints.notifConfig}${encodeURIComponent(clave)}`
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al cargar config");
  return json; // { enabled, grupo_ids, grupos:[{id,nombre}], severidad_def, ... }
}

export async function saveNotifConfig(clave, payload) {
  const res = await fetchConToken(
    `${endpoints.notifConfig}${encodeURIComponent(clave)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Error al guardar config");
  return json;
}
