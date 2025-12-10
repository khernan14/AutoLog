// src/services/PermissionsServices.js
import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

export async function getAllUsers() {
  try {
    // Opcional: Si notas que al crear usuarios nuevos no aparecen,
    // agrégale también el timestamp a esta URL.
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
    // 🟢 FIX DE CACHÉ: Generamos un número único (hora actual)
    const timestamp = new Date().getTime();

    // Lo agregamos a la URL como parámetro 't'.
    // El servidor lo ignorará, pero el navegador creerá que es una URL nueva y no usará caché.
    const url = `${endpoints.getUserPermissions}${id}?t=${timestamp}`;

    const res = await fetchConToken(url, {
      method: "GET",
    });

    if (!res.ok) throw new Error("No se pudo obtener los permisos del usuario");
    const data = await res.json();

    return data;
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
    throw err; // Es mejor lanzar el error para que el componente muestre el mensaje
  }
}
