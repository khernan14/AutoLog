// services/viaticos.services.js
import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

/* -------------------------------------------
   Util: construir querystring desde un objeto
-------------------------------------------- */
function buildQS(params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).reduce((acc, [k, v]) => {
      if (v === undefined || v === null || v === "") return acc;
      acc[k] = v;
      return acc;
    }, {})
  ).toString();
  return qs ? `?${qs}` : "";
}

/* =========================
   Catálogos / utilidades
========================= */

// 🔹 Ciudades
export async function getCiudades() {
  const res = await fetchConToken(`${endpoints.viaticosCiudades}`);
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error || json.message || "Error al obtener ciudades");
  return json;
}

/* =========================
   Solicitudes de viáticos
========================= */

// 🔹 Listar solicitudes (filtros: estado, empleado_id, desde, hasta)
export async function listSolicitudes(params = {}) {
  const res = await fetchConToken(`${endpoints.viaticos}${buildQS(params)}`);
  const json = await res.json();
  if (!res.ok)
    throw new Error(
      json.error || json.message || "Error al listar solicitudes"
    );
  return json;
}

// 🔹 Obtener una solicitud por ID (incluye items)
export async function getSolicitudById(id) {
  const res = await fetchConToken(`${endpoints.viaticos}/${id}`);
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error || json.message || "Error al obtener solicitud");
  return json; // { solicitud, items }
}

// 🔹 Crear solicitud (Borrador) — el backend autogenera ítems
// data puede ser estilo "legacy" o "nuevo" (con { opciones })
export async function crearSolicitud(data) {
  const res = await fetchConToken(`${endpoints.viaticos}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error || json.message || "Error al crear solicitud");
  return json; // { id, total_estimado }
}

// 🔹 Actualizar encabezado (solo en Borrador)
export async function updateSolicitud(id, data) {
  const res = await fetchConToken(`${endpoints.viaticos}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(
      json.error || json.message || "Error al actualizar solicitud"
    );
  return json;
}

// 🔹 Enviar solicitud (Borrador -> Enviado)
export async function enviarSolicitud(id) {
  const res = await fetchConToken(`${endpoints.viaticos}/${id}/submit`, {
    method: "POST",
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error || json.message || "Error al enviar solicitud");
  return json;
}

// 🔹 Aprobar/Rechazar solicitud
// approvePayload: { aprobar: boolean, monto_autorizado?: number, motivo?: string }
export async function aprobarSolicitud(id, approvePayload) {
  const res = await fetchConToken(`${endpoints.viaticos}/${id}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(approvePayload),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(
      json.error || json.message || "Error al aprobar/rechazar solicitud"
    );
  return json;
}

/* =========================
   Ítems de solicitud (Borrador)
========================= */

// 🔹 Editar ítem (cantidad, monto_unitario, nota, subtipo, fecha, ciudad_id)
export async function updateItem(itemId, data) {
  const res = await fetchConToken(`${endpoints.viaticos}/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error || json.message || "Error al actualizar ítem");
  return json; // { message, total_estimado }
}

// 🔹 Eliminar ítem
export async function deleteItem(itemId) {
  const res = await fetchConToken(`${endpoints.viaticos}/items/${itemId}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error || json.message || "Error al eliminar ítem");
  return json; // { message, total_estimado }
}

/* =========================
   Liquidaciones
========================= */

// 🔹 Crear liquidación (si no se creó al aprobar)
export async function crearLiquidacion(solicitud_id) {
  const res = await fetchConToken(`${endpoints.viaticosLiquidaciones}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ solicitud_id }),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.error || json.message || "Error al crear liquidación");
  return json;
}

// 🔹 Listado de liquidaciones (filtros: estado?, solicitud_id?)
export async function listLiquidaciones(params = {}) {
  const res = await fetchConToken(
    `${endpoints.viaticosLiquidaciones}${buildQS(params)}`
  );
  const json = await res.json();
  if (!res.ok)
    throw new Error(
      json.error || json.message || "Error al listar liquidaciones"
    );
  return json; // Array
}

// 🔹 Detalle de liquidación
export async function getLiquidacionById(liquidacion_id) {
  const res = await fetchConToken(
    `${endpoints.viaticosLiquidaciones}/${liquidacion_id}`
  );
  const json = await res.json();
  if (!res.ok)
    throw new Error(
      json.error || json.message || "Error al obtener liquidación"
    );
  return json; // { liquidacion, comprobantes }
}

// 🔹 Cerrar liquidación
export async function cerrarLiquidacion(liquidacion_id) {
  const res = await fetchConToken(
    `${endpoints.viaticosLiquidaciones}/${liquidacion_id}/cerrar`,
    {
      method: "POST",
    }
  );
  const json = await res.json();
  if (!res.ok)
    throw new Error(
      json.error || json.message || "Error al cerrar liquidación"
    );
  return json;
}

/* =========================
   Comprobantes (SIN archivos)
========================= */

// 🔹 Agregar uno o varios comprobantes (JSON)
// payload puede ser:
//  { liquidacion_id, tipo, fecha, monto, moneda?, proveedor?, num_factura?, observaciones?, subtipo? }
//  ó { liquidacion_id, comprobantes: [ { ... }, { ... } ] }
export async function agregarComprobantes(payload) {
  const res = await fetchConToken(`${endpoints.viaticosComprobantes}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(
      json.error || json.message || "Error al agregar comprobante(s)"
    );
  return json;
}

/* =========================
   Helpers de payload (opcionales)
========================= */

// Sugerencias para construir el payload "nuevo" de crearSolicitud:
export function buildOpciones({
  desayunoDias = 0,
  almuerzoDias = 0,
  cenaDias = 0,
  hotel = { aplica: false, categoria: "Normal", noches: 0 },
  peajes = {
    yojoa: { ida: false, regreso: false },
    comayagua: { ida: false, regreso: false },
    siguatepeque: { ida: false, regreso: false },
  },
  combustible = 0,
  movilizacion = 0,
  imprevistos = 0,
} = {}) {
  return {
    comidas: {
      desayuno: { aplica: desayunoDias > 0, dias: Number(desayunoDias || 0) },
      almuerzo: { aplica: almuerzoDias > 0, dias: Number(almuerzoDias || 0) },
      cena: { aplica: cenaDias > 0, dias: Number(cenaDias || 0) },
    },
    hospedaje: {
      aplica: !!hotel.aplica,
      categoria: hotel.categoria || "Normal",
      noches: Number(hotel.noches || 0),
    },
    peajes,
    combustible: { monto: Number(combustible || 0) },
    movilizacion: { monto: Number(movilizacion || 0) },
    imprevistos: { monto: Number(imprevistos || 0) },
  };
}
