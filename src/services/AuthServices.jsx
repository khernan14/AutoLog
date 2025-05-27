import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

export async function login(username, password) {
  try {
    const res = await fetch(endpoints.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    return res.ok ? data : null;
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
}

export async function createUserService(newUser) {
  try {
    const res = await fetchConToken(endpoints.registerUsers, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: newUser.nombre,
        email: newUser.email,
        username: newUser.username,
        password: newUser.password,
        rol: newUser.rol,
        estatus: newUser.estatus,
        puesto: newUser.puesto,
      }),
    });

    const data = await res.json();
    return res.ok ? data : null; // Devuelve el usuario creado si la respuesta es OK
  } catch (err) {
    console.error("Create user error:", err);
    return null;
  }
}

export async function getUsers() {
  try {
    const res = await fetchConToken(endpoints.getUsers);
    const data = await res.json();
    return res.ok ? data : [];
  } catch (err) {
    console.error("Get users error:", err);
    return [];
  }
}

export async function updateUser(user) {
  try {
    const res = await fetchConToken(endpoints.updateUser + user.id_usuario, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    const data = await res.json();
    return res.ok ? data : null;
  } catch (err) {
    console.error("Update user error:", err);
    return null;
  }
}

export async function getUsersById(id) {
  try {
    const res = await fetchConToken(endpoints.getUsersById + id);
    const data = await res.json();
    return res.ok ? data : null;
  } catch (err) {
    console.error("Get users by id error:", err);
    return null;
  }
}

export async function updateMyAccount(user) {
  try {
    const res = await fetchConToken(
      endpoints.updateMyAccount + user.id_usuario,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      }
    );

    const data = await res.json();
    return res.ok ? data : null;
  } catch (err) {
    console.error("Update user error:", err);
    return null;
  }
}

export async function getEmpleados() {
  try {
    const res = await fetchConToken(endpoints.getEmpleados);
    const data = await res.json();
    return res.ok ? data : [];
  } catch (err) {
    console.error("Get users error:", err);
    return [];
  }
}

export async function getEmpleadosById(id) {
  try {
    const res = await fetchConToken(endpoints.getEmpleados + id);
    const data = await res.json();
    return res.ok ? data : null;
  } catch (err) {
    console.error("Get users by id error:", err);
    return null;
  }
}
