const API_BASE = import.meta.env.VITE_API_URL;

export async function getPublicLinkForActivo(idActivo) {
  const r = await fetch(`${API_BASE}/public/activos/${idActivo}/public-link`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!r.ok) throw new Error("No se pudo generar el enlace público");

  return r.json();
}
