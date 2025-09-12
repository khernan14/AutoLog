// services/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

function getToken() {
    // ajusta donde guardas tu JWT (localStorage, sessionStorage, context, etc.)
    return localStorage.getItem("accessToken");
}

async function request(path, { method = "GET", headers = {}, body, params } = {}) {
    const url = new URL(`${BASE_URL}${path}`);
    if (params && typeof params === "object") {
        Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
    }

    const token = getToken();
    const init = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        // ❌ nada de credentials aquí
        // credentials: "include",
    };
    if (body !== undefined) init.body = JSON.stringify(body);

    const res = await fetch(url.toString(), init);
    const isJson = (res.headers.get("content-type") || "").includes("application/json");

    if (!res.ok) {
        const err = isJson ? await res.json().catch(() => ({})) : { error: await res.text() };
        throw new Error(err.message || err.error || `HTTP ${res.status}`);
    }
    return isJson ? res.json() : res.text();
}

export const api = {
    get: (p, opts) => request(p, { ...opts, method: "GET" }),
    post: (p, body, opts) => request(p, { ...opts, method: "POST", body }),
    put: (p, body, opts) => request(p, { ...opts, method: "PUT", body }),
    patch: (p, body, opts) => request(p, { ...opts, method: "PATCH", body }),
    del: (p, opts) => request(p, { ...opts, method: "DELETE" }),
};
