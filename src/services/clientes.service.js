// services/clientes.service.js
import { api } from "./api";

export const ClientesService = {
    list: () => api.get("/clientes"),
    getById: (id) => api.get(`/clientes/${id}`),
    create: (payload) => api.post("/clientes", payload),
    update: (id, payload) => api.put(`/clientes/${id}`, payload),
    // sin delete; baja lógica con estatus
};
