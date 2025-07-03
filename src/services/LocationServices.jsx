import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

export async function getCountries() {
  try {
    const res = await fetchConToken(endpoints.getCountries, {
      method: "GET",
    });

    if (!res.ok) throw new Error("No se pudo obtener los paises");
    return await res.json();
  } catch (err) {
    console.error("Login error:", err);
    return [];
  }
}

export async function addCountry(country) {
  try {
    const res = await fetchConToken(endpoints.addCountry, {
      method: "POST",
      body: JSON.stringify(country),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("No se pudo agregar el pais");
    return await res.json();
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
}

export async function updateCountry(id, country) {
  try {
    const res = await fetchConToken(endpoints.updateCountry + id, {
      method: "PUT",
      body: JSON.stringify(country),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("No se pudo actualizar el pais");
    return await res.json();
  } catch (err) {
    console.error("Update error:", JSON.stringify(err, null, 2));
    return null;
  }
}

export async function deleteCountry(id) {
  try {
    const res = await fetchConToken(endpoints.deleteCountry + id, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("No se pudo eliminar el pais");
    return await res.json();
  } catch (err) {
    console.error("Login error:", err);
    return null;
  }
}

// Endpoint para obtener las ciudades

export async function getCities() {
  try {
    const res = await fetchConToken(endpoints.getCities, {
      method: "GET",
    });

    if (!res.ok) throw new Error("No se pudo obtener las ciudades");
    return await res.json();
  } catch (err) {
    console.error("Get cities error:", err);
    return [];
  }
}

export async function addCity(city) {
  try {
    const res = await fetchConToken(endpoints.addCity, {
      method: "POST",
      body: JSON.stringify(city),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("No se pudo agregar la ciudad");
    return await res.json();
  } catch (err) {
    console.error("Add city error:", err);
    return null;
  }
}

export async function updateCity(id, city) {
  try {
    const res = await fetchConToken(endpoints.updateCity + id, {
      method: "PUT",
      body: JSON.stringify(city),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("No se pudo actualizar la ciudad");
    return await res.json();
  } catch (err) {
    console.error("Update city error:", err);
    return null;
  }
}

export async function deleteCity(id) {
  try {
    const res = await fetchConToken(endpoints.deleteCity + id, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("No se pudo eliminar la ciudad");
    return await res.json();
  } catch (err) {
    console.error("Delete city error:", err);
    return null;
  }
}
