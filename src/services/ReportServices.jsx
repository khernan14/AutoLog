import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

export async function getRegisterReport() {
  try {
    const res = await fetchConToken(endpoints.getRegisterReport);
    const data = await res.json();

    if (!res.ok) return [];

    return data.map((registro) => {
      console.log("IMAGES:", registro.images); // ✅ Aquí sí debe mostrar el array
      return registro;
    });
  } catch (err) {
    console.error("Get register report error:", err);
    return [];
  }
}
