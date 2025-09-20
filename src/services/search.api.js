// src/services/search.api.js
export async function globalSearch(q, { limit = 10, signal } = {}) {
  const url = `/api/search?q=${encodeURIComponent(q)}&limit=${limit}`;
  const res = await fetch(url, { signal, credentials: "include" });
  if (!res.ok) {
    const msg =
      (await res.json().catch(() => null))?.message ||
      res.statusText ||
      "Error al buscar";
    throw new Error(msg);
  }
  return res.json();
}

export async function getPreview(kind, id, { signal } = {}) {
  const url = `/api/preview?kind=${encodeURIComponent(
    kind
  )}&id=${encodeURIComponent(id)}`;
  const res = await fetch(url, { signal });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Error cargando vista previa");
  return res.json(); // {kind,id,title,subtitle,fields[],moduleUrl,canEdit}
}
