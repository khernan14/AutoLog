// services/group.services.jsx
import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

//
// GRUPOS DE NOTIFICACIÓN
//

export async function getGroups() {
  try {
    const res = await fetchConToken(endpoints.getGroups);
    if (!res.ok) throw new Error("No se pudo obtener los grupos");
    return await res.json();
  } catch (err) {
    console.error("getGroups error:", err);
    return null;
  }
}

export async function getGroup(id) {
  try {
    const res = await fetchConToken(endpoints.getGroup + id);
    if (!res.ok) throw new Error("No se pudo obtener el grupo");
    return await res.json();
  } catch (err) {
    console.error("getGroup error:", err);
    return null;
  }
}

export async function addGroup(group) {
  try {
    const res = await fetchConToken(endpoints.addGroup, {
      method: "POST",
      body: JSON.stringify(group),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("No se pudo agregar el grupo");
    return await res.json();
  } catch (err) {
    console.error("addGroup error:", err);
    return null;
  }
}

export async function updateGroup(id, group) {
  try {
    const res = await fetchConToken(endpoints.updateGroup + id, {
      method: "PUT",
      body: JSON.stringify(group),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("No se pudo actualizar el grupo");
    return await res.json();
  } catch (err) {
    console.error("updateGroup error:", err);
    return null;
  }
}

export async function deleteGroup(id) {
  try {
    const res = await fetchConToken(endpoints.deleteGroup + id, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("No se pudo eliminar el grupo");
    return await res.json();
  } catch (err) {
    console.error("deleteGroup error:", err);
    return null;
  }
}

//
// USUARIOS DE GRUPOS DE NOTIFICACIÓN
//

export async function getGroupUsers() {
  try {
    const res = await fetchConToken(endpoints.getGroupUsers);
    if (!res.ok)
      throw new Error("No se pudieron obtener los usuarios del grupo");
    return await res.json();
  } catch (err) {
    console.error("getGroupUsers error:", err);
    return null;
  }
}

export async function getGroupUser(id) {
  try {
    const res = await fetchConToken(endpoints.getGroupUser + id);
    if (!res.ok) throw new Error("No se pudo obtener el usuario del grupo");
    return await res.json();
  } catch (err) {
    console.error("getGroupUser error:", err);
    return null;
  }
}

export async function addGroupUser(data) {
  try {
    const res = await fetchConToken(endpoints.addGroupUser, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("No se pudo agregar usuarios al grupo");
    return await res.json();
  } catch (err) {
    console.error("addGroupUser error:", err);
    return null;
  }
}

export async function updateGroupUser(id, data) {
  try {
    const res = await fetchConToken(endpoints.updateGroupUser + id, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("No se pudo actualizar el usuario del grupo");
    return await res.json();
  } catch (err) {
    console.error("updateGroupUser error:", err);
    return null;
  }
}

export async function deleteGroupUser(id) {
  try {
    const res = await fetchConToken(endpoints.deleteGroupUser + id, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("No se pudo eliminar el usuario del grupo");
    return await res.json();
  } catch (err) {
    console.error("deleteGroupUser error:", err);
    return null;
  }
}
