import { endpoints } from "../config/variables";

export async function fetchDashboardData(action) {
  try {
    const res = await fetch(`${endpoints.dashboard}/${action}`);
    const data = await res.json();
    return res.ok ? data : [];
  } catch (err) {
    console.error(`Error al obtener ${action}:`, err);
    return [];
  }
}
