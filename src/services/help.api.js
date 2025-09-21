// src/services/help.api.js
const ORIGIN = (import.meta.env.VITE_API_URL || window.location.origin).replace(
  /\/+$/,
  ""
);
const API_ROOT = ORIGIN.endsWith("/api") ? ORIGIN : `${ORIGIN}/api`;

function buildUrl(path, params = {}) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_ROOT}${cleanPath}`);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    url.searchParams.set(k, String(v));
  });
  return url.toString();
}

// ✅ Acepta { cache, signal } y lo pasa a fetch
async function apiGet(path, params, { cache = "no-store", signal } = {}) {
  const url = buildUrl(path, params);
  const r = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache,
    signal,
  });
  if (!r.ok) {
    let msg = `Error ${r.status}`;
    try {
      const j = await r.json();
      if (j?.message) msg = j.message;
    } catch (e) {
      // respuesta vacía o no-JSON; dejamos msg por defecto
    }
    throw new Error(msg);
  }
  return r.json();
}

/* =========================
   FAQs
========================= */
export function listFaqs({
  q,
  category,
  page = 1,
  limit = 20,
  visibility = "public",
  isActive = 1,
} = {}) {
  return apiGet(
    "/help/faqs",
    { q, category, page, limit, visibility, isActive },
    { cache: "no-cache" }
  );
}
export function getFaqBySlug(slug) {
  return apiGet(`/help/faqs/${encodeURIComponent(slug)}`);
}
export async function voteFaqHelpful(id, { up = true } = {}) {
  const url = buildUrl(`/help/faqs/${id}/helpful`);
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ up }),
  });
  if (!r.ok) {
    let msg = `Error ${r.status}`;
    try {
      const j = await r.json();
      if (j?.message) msg = j.message;
    } catch (e) {
      // noop
    }
    throw new Error(msg);
  }
  return r.json();
}

/* =========================
   Tutorials
========================= */
export function listTutorials({
  q,
  category,
  tag,
  page = 1,
  limit = 12,
  visibility = "public",
} = {}) {
  return apiGet(
    "/help/tutorials",
    { q, category, tag, page, limit, visibility },
    { cache: "no-cache" }
  );
}
export function getTutorialBySlug(slug) {
  return apiGet(`/help/tutorials/${encodeURIComponent(slug)}`);
}

/* =========================
   System Status
========================= */
export function getOverallStatus() {
  return apiGet("/help/status/overall", {}, { cache: "no-cache" });
}
export function listServices() {
  return apiGet("/help/status/services", {}, { cache: "no-cache" });
}

/* =========================
   Changelogs
========================= */
export function listChangelogs({
  q,
  type,
  audience,
  pinned,
  page = 1,
  limit = 10,
} = {}) {
  return apiGet(
    "/help/changelogs",
    { q, type, audience, pinned, page, limit },
    { cache: "no-cache" }
  );
}
export function getChangelogBySlug(slug) {
  return apiGet(`/help/changelogs/${encodeURIComponent(slug)}`);
}
export function getPinnedChangelogs(limit = 6, signal) {
  return apiGet(
    "/help/changelog/pinned",
    { limit },
    { cache: "no-store", signal }
  );
}

/* =========================
   UI helpers
========================= */
export function statusToJoyColor(status) {
  const s = String(status || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  if (["ok", "operacional", "operational", "online", "up"].includes(s))
    return "success";
  if (
    [
      "degradado",
      "degradada",
      "degradado parcial",
      "degraded",
      "mantenimiento",
      "maintenance",
      "partial",
      "warning",
    ].includes(s)
  )
    return "warning";
  if (
    [
      "incidente",
      "incident",
      "outage",
      "down",
      "critical",
      "error",
      "falla",
      "fallo",
      "caido",
      "cortado",
    ].includes(s)
  )
    return "danger";
  return "neutral";
}
