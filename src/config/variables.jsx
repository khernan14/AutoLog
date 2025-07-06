// src/js/config/api.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const endpoints = {
  login: `${API_BASE_URL}/auth/login`,
  addVehiculo: `${API_BASE_URL}/vehiculos/`,
  getVehiculos: `${API_BASE_URL}/vehiculos/`,
  deleteVehiculo: `${API_BASE_URL}/vehiculos/`,
  restoreVehiculo: `${API_BASE_URL}/vehiculos/`,
  getRegistros: `${API_BASE_URL}/registros/`,
  getRegistroactivo: `${API_BASE_URL}/registros/empleados/`,
  registrarSalida: `${API_BASE_URL}/registros/salida`,
  registrarRegreso: `${API_BASE_URL}/registros/regreso`,
  resgistrarImagenes: `${API_BASE_URL}/registros/`,
  getCiudades: `${API_BASE_URL}/registros/ciudades`,
  dashboard: `${API_BASE_URL}/dashboard`,
  registerUsers: `${API_BASE_URL}/auth/register`,
  getUsers: `${API_BASE_URL}/auth/usuarios`,
  getEmailSupervisor: `${API_BASE_URL}/auth/email-supervisor`,
  updateUser: `${API_BASE_URL}/auth/usuarios/`,
  getUsersById: `${API_BASE_URL}/auth/usuarios/`,
  deleteUser: `${API_BASE_URL}/auth/usuarios/`,
  restoreUser: `${API_BASE_URL}/auth/usuarios/`,
  updateMyAccount: `${API_BASE_URL}/auth/perfil`,
  resetPassword: `${API_BASE_URL}/auth/reset-password`,
  forgotPassword: `${API_BASE_URL}/mail/forgot-password`,
  getUbicaciones: `${API_BASE_URL}/vehiculos/ubicaciones`,
  getEmpleados: `${API_BASE_URL}/empleados/`,
  Reservas: `${API_BASE_URL}/reservas`,
  getCountries: `${API_BASE_URL}/countries/`,
  addCountry: `${API_BASE_URL}/countries/`,
  updateCountry: `${API_BASE_URL}/countries/`,
  deleteCountry: `${API_BASE_URL}/countries/`,
  getCities: `${API_BASE_URL}/cities/`,
  addCity: `${API_BASE_URL}/cities/`,
  updateCity: `${API_BASE_URL}/cities/`,
  deleteCity: `${API_BASE_URL}/cities/`,
  getParkings: `${API_BASE_URL}/parkings/`,
  addParking: `${API_BASE_URL}/parkings/`,
  updateParking: `${API_BASE_URL}/parkings/`,
  deleteParking: `${API_BASE_URL}/parkings/`,
  getUserPermissions: `${API_BASE_URL}/permisos/`,
  updateUserPermissions: `${API_BASE_URL}/permisos/asignar`,
  getUserPermissionsList: `${API_BASE_URL}/permisos/usuarios`,

  // NOTIFICACIONES
  sendMail: `${API_BASE_URL}/mail/`,
  sendNotificacionSalida: `${API_BASE_URL}/mail/notification-salida`,
  sendNotificacionEntrada: `${API_BASE_URL}/mail/notification-regreso`,

  // GRUPOS DE NOTIFICACIÓN
  getGroups: `${API_BASE_URL}/grupos/`,
  getGroup: `${API_BASE_URL}/grupos/`,
  addGroup: `${API_BASE_URL}/grupos/`,
  updateGroup: `${API_BASE_URL}/grupos/`,
  deleteGroup: `${API_BASE_URL}/grupos/`,

  // USUARIOS DE GRUPOS DE NOTIFICACIÓN
  getGroupUsers: `${API_BASE_URL}/grupo-usuarios/`,
  getGroupUser: `${API_BASE_URL}/grupo-usuarios/`,
  addGroupUser: `${API_BASE_URL}/grupo-usuarios/`,
  updateGroupUser: `${API_BASE_URL}/grupo-usuarios/`,
  deleteGroupUser: `${API_BASE_URL}/grupo-usuarios/`,

  // REPORTES
  getRegisterReport: `${API_BASE_URL}/reports/registros/`,
  getEmpleadosMasSalidas: `${API_BASE_URL}/reports/reportes/empleados-mas-salidas`,
  getKilometrajePorEmpleado: `${API_BASE_URL}/reports/reportes/kilometraje-por-empleado`,
  getVehiculosMasUtilizados: `${API_BASE_URL}/reports/reportes/vehiculos-mas-utilizados`,
  getRegistrosPorUbicacion: `${API_BASE_URL}/reports/reportes/registros-por-ubicacion`,
  getConsumoCombustibleVehiculo: `${API_BASE_URL}/reports/reportes/consumo-combustible-vehiculo`,

  // Home
  getTotalEmpleados: `${API_BASE_URL}/reports/reportes/total-empleados`,
  getTotalVehiculos: `${API_BASE_URL}/reports/reportes/total-vehiculos`,
  getVehiculosEnUso: `${API_BASE_URL}/reports/reportes/vehiculos-en-uso`,
  getVehiculosEnMantenimiento: `${API_BASE_URL}/reports/reportes/vehiculos-en-mantenimiento`,
};

// src/js/config/variables.js
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
};
