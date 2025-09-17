// apiHelper.js - Funciones genéricas para llamadas autenticadas
import { STORAGE_KEYS } from "../config/variables";

export async function fetchConToken(url, options = {}) {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  // console.log("Token:", token);

  // Si el body es FormData, NO incluir Content-Type manualmente
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    return res;
  } catch (err) {
    throw err;
  }
}

export function withQuery(url, params = {}) {
  const u = new URL(url);
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    u.searchParams.set(k, String(v));
  });
  return u.toString();
}

/**
 * fetchPublic: llamadas SIN credenciales/cookies para endpoints públicos.
 * - No envía Authorization
 * - Fuerza credentials:'omit' para que CORS no se queje si el server responde ACAO: *
 */
export async function fetchPublic(url, init = {}) {
  const res = await fetch(url, {
    credentials: "omit",
    headers: { Accept: "application/json", ...(init.headers || {}) },
    ...init,
  });
  return res;
}
