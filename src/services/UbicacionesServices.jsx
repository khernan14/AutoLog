// src/services/ubicaciones.service.js
import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

// Util: idempotencia para evitar dobles envíos (opcional)
function genIdempotencyKey() {
  // usa crypto si está disponible (modern browsers / Node 16+)
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Enviar payload seguro: solo el campo del destino que toca
function buildMoverPayload({
  id_activo,
  tipo_destino,
  id_cliente_site,
  id_bodega,
  id_empleado,
  motivo,
  usuario_responsable,
}) {
  const base = {
    id_activo,
    tipo_destino,
    motivo: motivo || null,
    usuario_responsable: usuario_responsable ?? null,
  };
  if (tipo_destino === "Cliente")
    return { ...base, id_cliente_site, id_bodega: null, id_empleado: null };
  if (tipo_destino === "Bodega")
    return { ...base, id_cliente_site: null, id_bodega, id_empleado: null };
  if (tipo_destino === "Empleado")
    return { ...base, id_cliente_site: null, id_bodega: null, id_empleado };
  throw new Error("tipo_destino inválido");
}

// Mover activo genérico (usa buildMoverPayload)
export async function moverActivo(data, { idempotencyKey } = {}) {
  const payload = buildMoverPayload(data);
  const res = await fetchConToken(endpoints.moverActivo, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Idempotencia opcional: el server puede ignorarla si no la implementas aún
      "Idempotency-Key": idempotencyKey || genIdempotencyKey(),
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Mensajes más claros por códigos comunes que devuelve tu controller
    if (res.status === 409)
      throw new Error("El activo ya tiene una ubicación abierta.");
    throw new Error(json.message || json.error || "Error al mover activo");
  }
  return json;
}

// Azúcar sintáctica: wrappers específicos por destino
export async function moverACliente({
  id_activo,
  id_cliente_site,
  motivo,
  usuario_responsable,
}) {
  return moverActivo({
    id_activo,
    tipo_destino: "Cliente",
    id_cliente_site,
    motivo,
    usuario_responsable,
  });
}
export async function moverABodega({
  id_activo,
  id_bodega,
  motivo,
  usuario_responsable,
}) {
  return moverActivo({
    id_activo,
    tipo_destino: "Bodega",
    id_bodega,
    motivo,
    usuario_responsable,
  });
}
export async function moverAEmpleado({
  id_activo,
  id_empleado,
  motivo,
  usuario_responsable,
}) {
  return moverActivo({
    id_activo,
    tipo_destino: "Empleado",
    id_empleado,
    motivo,
    usuario_responsable,
  });
}

// Helper para query params
function withParams(url, params = {}) {
  const u = new URL(url, window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "")
      u.searchParams.set(k, String(v));
  });
  return u.toString().replace(window.location.origin, "");
}

// Obtener movimientos/historial (con paginación y filtros opcionales)
export async function getMovimientosByActivo(
  id_activo,
  { limit = 50, offset = 0 } = {}
) {
  const url = withParams(`${endpoints.movimientosByActivo}${id_activo}`, {
    limit,
    offset,
  });
  const res = await fetchConToken(url);
  const json = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(
      json.message || json.error || "Error al obtener movimientos"
    );
  return json;
}
