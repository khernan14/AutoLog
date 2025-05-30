// src/js/config/api.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const endpoints = {
  login: `${API_BASE_URL}/auth/login`,
  getVehiculos: `${API_BASE_URL}/vehiculos/`,
  getRegistros: `${API_BASE_URL}/registros/`,
  getRegistroactivo: `${API_BASE_URL}/registros/empleados/`,
  registrarSalida: `${API_BASE_URL}/registros/salida`,
  registrarRegreso: `${API_BASE_URL}/registros/regreso`,
  resgistrarImagenes: `${API_BASE_URL}/registros/`,
  getCiudades: `${API_BASE_URL}/registros/ciudades`,
  dashboard: `${API_BASE_URL}/dashboard`,
  registerUsers: `${API_BASE_URL}/auth/register`,
  getUsers: `${API_BASE_URL}/auth/usuarios`,
  updateUser: `${API_BASE_URL}/auth/usuarios/`,
  getUsersById: `${API_BASE_URL}/auth/usuarios/`,
  updateMyAccount: `${API_BASE_URL}/auth/perfil`,
  getUbicaciones: `${API_BASE_URL}/vehiculos/ubicaciones`,
  getEmpleados: `${API_BASE_URL}/empleados/`,
  Reservas: `${API_BASE_URL}/reservas`,
};

// src/js/config/variables.js
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
};
