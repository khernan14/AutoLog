// services/PublicLinksService.js
const API_BASE = import.meta.env.VITE_API_URL;

export async function getPublicLinkForActivo(idActivo) {
  const authToken = localStorage.getItem("token"); // o desde tu AuthContext
  const r = await fetch(`${API_BASE}/public/activos/${idActivo}/public-link`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: authToken ? `Bearer ${authToken}` : "",
    },
  });
  if (!r.ok) throw new Error("No se pudo generar el enlace público");
  return r.json(); // { url }
}
