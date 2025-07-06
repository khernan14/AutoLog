import { endpoints } from "../config/variables";
import { fetchConToken } from "../utils/ApiHelper";

export async function sendMail(data) {
  try {
    const res = await fetchConToken(`${endpoints.sendMail}send-welcome`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("No se pudo enviar el mail");
    return await res.json();
  } catch (err) {
    console.error("Create user error:", err);
    return null;
  }
}

export async function sendRecoveryPassword(email) {
  console.log("sendRecoveryPassword:", email);

  try {
    const res = await fetch(endpoints.forgotPassword, {
      method: "POST",
      body: JSON.stringify({ email }), // 👈 ¡Este es el fix!
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("No se pudo enviar el mail");

    return await res.json();
  } catch (err) {
    console.error("sendRecoveryPassword error:", err);
    throw err;
  }
}
