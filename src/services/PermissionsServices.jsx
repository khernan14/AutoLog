import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

export async function getAllUsers() {
  try {
    const res = await fetchConToken(endpoints.getUserPermissionsList, {
      method: "GET",
    });

    if (!res.ok) throw new Error("No se pudo obtener la lista de usuarios");
    return await res.json();
  } catch (err) {
    console.error("Get users error:", err);
    return [];
  }
}

export async function getUserPermissions(id) {
  try {
    const res = await fetchConToken(`${endpoints.getUserPermissions}${id}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("No se pudo obtener los permisos del usuario");
    const data = await res.json();

    return data; // aquí simplemente retornas lo que venga
  } catch (err) {
    console.error("Get user permissions error:", err);
    return [];
  }
}

export async function updateUserPermissions(id, permisos) {
  try {
    const res = await fetchConToken(endpoints.updateUserPermissions, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: id,
        permisos,
      }),
    });

    if (!res.ok)
      throw new Error("No se pudo actualizar los permisos del usuario");
    return await res.json();
  } catch (err) {
    console.error("Update user permissions error:", err);
    return null;
  }
}
