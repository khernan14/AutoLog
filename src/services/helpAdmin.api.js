// src/services/helpAdmin.api.js
import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

// ---------- FAQs ----------
export async function createFaq(payload) {
  // payload: { question, answer, category, visibility, tags (array/string), order, isActive }
  const res = await fetchConToken(endpoints.adminFaqs, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("No se pudo crear la FAQ");
  return res.json();
}

export async function updateFaq(id, payload) {
  const res = await fetchConToken(endpoints.adminFaqById + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("No se pudo actualizar la FAQ");
  return res.json();
}

export async function deleteFaq(id) {
  const res = await fetchConToken(endpoints.adminFaqById + id, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("No se pudo eliminar la FAQ");
  return res.json();
}

// ---------- Tutorials ----------
export async function createTutorial(payload) {
  // payload: { title, description?, videoUrl, imageUrl?, category?, visibility, tags (array/string), duration_seconds?, publishedDate?, slug? }
  const res = await fetchConToken(endpoints.adminTutorials, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("No se pudo crear el tutorial");
  return res.json();
}

export async function updateTutorial(id, payload) {
  const res = await fetchConToken(endpoints.adminTutorialById + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("No se pudo actualizar el tutorial");
  return res.json();
}

export async function deleteTutorial(id) {
  const res = await fetchConToken(endpoints.adminTutorialById + id, {
    method: "DELETE",
  });
  // Tu backend responde 204 No Content; evita intentar parsear JSON en ese caso
  if (res.status === 204) return true;
  if (!res.ok) throw new Error("No se pudo eliminar el tutorial");
  try {
    return await res.json();
  } catch {
    return true;
  }
}

export async function replaceTutorialSteps(id, steps) {
  // Acepta array directo y lo envía como { steps: [...] }
  const body = Array.isArray(steps) ? { steps } : steps;
  const res = await fetchConToken(`${endpoints.adminTutorialById}${id}/steps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("No se pudieron actualizar los pasos");
  return res.json();
}

export async function replaceTutorialAttachments(id, attachments) {
  // Acepta array directo y lo envía como { attachments: [...] }
  const body = Array.isArray(attachments) ? { attachments } : attachments;
  const res = await fetchConToken(
    `${endpoints.adminTutorialById}${id}/attachments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error("No se pudieron actualizar los adjuntos");
  return res.json();
}

/* =========================
   Admin: Changelogs
========================= */

/** Crear changelog */
if (!endpoints?.adminChangelogs || !endpoints?.adminChangelogById) {
  throw new Error(
    "[helpAdmin.api] Endpoints de changelogs no definidos. Revisa src/js/config/api.js y el import."
  );
}

export async function createChangelog(payload) {
  const res = await fetchConToken(endpoints.adminChangelogs, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("No se pudo crear la novedad");
  return res.json();
}

export async function updateChangelog(id, payload) {
  const res = await fetchConToken(endpoints.adminChangelogById + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("No se pudo actualizar la novedad");
  return res.json();
}

export async function deleteChangelog(id) {
  const res = await fetchConToken(endpoints.adminChangelogById + id, {
    method: "DELETE",
  });
  if (res.status === 204) return true;
  if (!res.ok) throw new Error("No se pudo eliminar la novedad");
  try {
    return await res.json();
  } catch {
    return true;
  }
}

/* ========== Overall Status (Admin) ========== */
export async function createOverallStatus({
  overall_status,
  description = null,
}) {
  const res = await fetchConToken(endpoints.adminStatusOverall, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ overall_status, description }),
  });
  if (!res.ok) {
    let msg = "No se pudo actualizar el estado global";
    try {
      const j = await res.json();
      if (j?.message) msg = j.message;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/* ========== Services (Admin) ========== */
export async function upsertService(payload) {
  // payload: { name, status, message?, group_name?, display_order? }
  const res = await fetchConToken(endpoints.adminStatusServices, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let msg = "No se pudo guardar el servicio";
    try {
      const j = await res.json();
      if (j?.message) msg = j.message;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
