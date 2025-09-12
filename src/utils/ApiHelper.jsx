// apiHelper.js - Funciones genéricas para llamadas autenticadas
import { STORAGE_KEYS } from "../config/variables";

export async function fetchConToken(url, options = {}) {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    // console.log("Token:", token);

    // Si el body es FormData, NO incluir Content-Type manualmente
    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(options.headers || {}),
        "Authorization": `Bearer ${token}`,
        ...(isFormData ? {} : { "Content-Type": "application/json" })
    };

    try {
        const res = await fetch(url, {
            ...options,
            headers
        });
        return res;
    } catch (err) {
        throw err;
    }
}