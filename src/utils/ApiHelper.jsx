// src/utils/ApiHelper.js
export async function fetchConToken(url, options = {}) {
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      headers,
    });
    return res;
  } catch (err) {
    console.error("fetchConToken error", err);
    throw err;
  }
}

export function withQuery(url, params = {}) {
  const u = new URL(url);
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    u.searchParams.set(k, String(v));
  });
  return u.toString();
}

export async function fetchPublic(url, init = {}) {
  const res = await fetch(url, {
    credentials: "omit",
    headers: { Accept: "application/json", ...(init.headers || {}) },
    ...init,
  });
  return res;
}
