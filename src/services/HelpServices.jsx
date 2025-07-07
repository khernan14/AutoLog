// src/services/helpServices.jsx

import { endpoints } from "../config/variables"; // Asegúrate de que esta ruta sea correcta
import { fetchConToken } from "../utils/ApiHelper"; // Asegúrate de que esta ruta sea correcta

// --- Servicios para Preguntas Frecuentes (FAQs) ---

/**
 * Obtiene todas las FAQs activas o una específica por ID.
 * @param {number} [id] - ID opcional de la FAQ a obtener.
 * @returns {Promise<Array|Object>} Un array de FAQs o un objeto FAQ si se especifica un ID.
 */
export async function getFAQs(id = null) {
  try {
    const url = id ? `${endpoints.getFAQs}/${id}` : endpoints.getFAQs;
    const res = await fetchConToken(url, {
      method: "GET",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "No se pudieron obtener las FAQs.");
    }
    return await res.json();
  } catch (err) {
    console.error("Get FAQs error:", err);
    return id ? null : []; // Retorna null si se buscaba por ID, array vacío si se buscaban todas
  }
}

/**
 * Agrega una nueva FAQ.
 * @param {object} faqData - Datos de la nueva FAQ (question, answer, category, order, isActive).
 * @returns {Promise<object>} Objeto con mensaje de éxito y el ID de la nueva FAQ.
 */
export async function addFAQ(faqData) {
  try {
    const res = await fetchConToken(endpoints.addFAQ, {
      method: "POST",
      body: JSON.stringify(faqData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "No se pudo agregar la FAQ.");
    }
    return await res.json();
  } catch (err) {
    console.error("Add FAQ error:", err);
    throw err; // Relanza el error para que el componente lo maneje (ej. con toast.error)
  }
}

/**
 * Actualiza una FAQ existente.
 * @param {number} id - ID de la FAQ a actualizar.
 * @param {object} faqData - Datos actualizados de la FAQ.
 * @returns {Promise<object>} Objeto con mensaje de éxito.
 */
export async function updateFAQ(id, faqData) {
  try {
    const res = await fetchConToken(`${endpoints.updateFAQ}/${id}`, {
      method: "PUT",
      body: JSON.stringify(faqData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "No se pudo actualizar la FAQ.");
    }
    return await res.json();
  } catch (err) {
    console.error("Update FAQ error:", err);
    throw err;
  }
}

/**
 * Elimina (inactiva) una FAQ.
 * @param {number} id - ID de la FAQ a eliminar.
 * @returns {Promise<object>} Objeto con mensaje de éxito.
 */
export async function deleteFAQ(id) {
  try {
    const res = await fetchConToken(`${endpoints.deleteFAQ}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "No se pudo eliminar la FAQ.");
    }
    return await res.json();
  } catch (err) {
    console.error("Delete FAQ error:", err);
    throw err;
  }
}

// --- Servicios para Tutoriales ---

/**
 * Obtiene todos los tutoriales.
 * @returns {Promise<Array>} Un array de tutoriales.
 */
export async function getTutorials() {
  try {
    const res = await fetchConToken(endpoints.getTutorials, {
      method: "GET",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || "No se pudieron obtener los tutoriales."
      );
    }
    return await res.json();
  } catch (err) {
    console.error("Get Tutorials error:", err);
    return [];
  }
}

/**
 * Agrega un nuevo tutorial.
 * @param {object} tutorialData - Datos del nuevo tutorial.
 * @returns {Promise<object>} Objeto con mensaje de éxito y el ID del nuevo tutorial.
 */
export async function addTutorial(tutorialData) {
  try {
    const res = await fetchConToken(endpoints.addTutorial, {
      method: "POST",
      body: JSON.stringify(tutorialData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "No se pudo agregar el tutorial.");
    }
    return await res.json();
  } catch (err) {
    console.error("Add Tutorial error:", err);
    throw err;
  }
}

/**
 * Actualiza un tutorial existente.
 * @param {number} id - ID del tutorial a actualizar.
 * @param {object} tutorialData - Datos actualizados del tutorial.
 * @returns {Promise<object>} Objeto con mensaje de éxito.
 */
export async function updateTutorial(id, tutorialData) {
  try {
    const res = await fetchConToken(`${endpoints.updateTutorial}/${id}`, {
      method: "PUT",
      body: JSON.stringify(tutorialData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "No se pudo actualizar el tutorial.");
    }
    return await res.json();
  } catch (err) {
    console.error("Update Tutorial error:", err);
    throw err;
  }
}

/**
 * Elimina un tutorial.
 * @param {number} id - ID del tutorial a eliminar.
 * @returns {Promise<object>} Objeto con mensaje de éxito.
 */
export async function deleteTutorial(id) {
  try {
    const res = await fetchConToken(`${endpoints.deleteTutorial}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "No se pudo eliminar el tutorial.");
    }
    return await res.json();
  } catch (err) {
    console.error("Delete Tutorial error:", err);
    throw err;
  }
}

// --- Servicios para Changelogs (Novedades y Anuncios) ---

/**
 * Obtiene todos los changelogs.
 * @returns {Promise<Array>} Un array de changelogs.
 */
export async function getChangelogs() {
  try {
    const res = await fetchConToken(endpoints.getChangelogs, {
      method: "GET",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || "No se pudieron obtener las novedades."
      );
    }
    return await res.json();
  } catch (err) {
    console.error("Get Changelogs error:", err);
    return [];
  }
}

/**
 * Agrega un nuevo changelog.
 * @param {object} changelogData - Datos del nuevo changelog.
 * @returns {Promise<object>} Objeto con mensaje de éxito y el ID del nuevo changelog.
 */
export async function addChangelog(changelogData) {
  try {
    const res = await fetchConToken(endpoints.addChangelog, {
      method: "POST",
      body: JSON.stringify(changelogData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "No se pudo agregar la novedad.");
    }
    return await res.json();
  } catch (err) {
    console.error("Add Changelog error:", err);
    throw err;
  }
}

/**
 * Actualiza un changelog existente.
 * @param {number} id - ID del changelog a actualizar.
 * @param {object} changelogData - Datos actualizados del changelog.
 * @returns {Promise<object>} Objeto con mensaje de éxito.
 */
export async function updateChangelog(id, changelogData) {
  try {
    const res = await fetchConToken(`${endpoints.updateChangelog}/${id}`, {
      method: "PUT",
      body: JSON.stringify(changelogData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "No se pudo actualizar la novedad.");
    }
    return await res.json();
  } catch (err) {
    console.error("Update Changelog error:", err);
    throw err;
  }
}

/**
 * Elimina un changelog.
 * @param {number} id - ID del changelog a eliminar.
 * @returns {Promise<object>} Objeto con mensaje de éxito.
 */
export async function deleteChangelog(id) {
  try {
    const res = await fetchConToken(`${endpoints.deleteChangelog}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "No se pudo eliminar la novedad.");
    }
    return await res.json();
  } catch (err) {
    console.error("Delete Changelog error:", err);
    throw err;
  }
}

// --- Servicios para System Services (Estado de Servicios) ---

/**
 * Obtiene todos los servicios del sistema.
 * @returns {Promise<Array>} Un array de servicios del sistema.
 */
export async function getSystemServices() {
  try {
    const res = await fetchConToken(endpoints.getSystemServices, {
      method: "GET",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || "No se pudieron obtener los servicios del sistema."
      );
    }
    return await res.json();
  } catch (err) {
    console.error("Get System Services error:", err);
    return [];
  }
}

/**
 * Agrega un nuevo servicio del sistema.
 * @param {object} serviceData - Datos del nuevo servicio.
 * @returns {Promise<object>} Objeto con mensaje de éxito y el ID del nuevo servicio.
 */
export async function addSystemService(serviceData) {
  try {
    const res = await fetchConToken(endpoints.addSystemService, {
      method: "POST",
      body: JSON.stringify(serviceData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || "No se pudo agregar el servicio del sistema."
      );
    }
    return await res.json();
  } catch (err) {
    console.error("Add System Service error:", err);
    throw err;
  }
}

/**
 * Actualiza el estado de un servicio del sistema.
 * @param {number} id - ID del servicio a actualizar.
 * @param {object} serviceData - Datos actualizados del servicio (status, message).
 * @returns {Promise<object>} Objeto con mensaje de éxito.
 */
export async function updateSystemServiceStatus(id, serviceData) {
  try {
    const res = await fetchConToken(
      `${endpoints.updateSystemServiceStatus}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(serviceData),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || "No se pudo actualizar el estado del servicio."
      );
    }
    return await res.json();
  } catch (err) {
    console.error("Update System Service Status error:", err);
    throw err;
  }
}

/**
 * Elimina un servicio del sistema.
 * @param {number} id - ID del servicio a eliminar.
 * @returns {Promise<object>} Objeto con mensaje de éxito.
 */
export async function deleteSystemService(id) {
  try {
    const res = await fetchConToken(`${endpoints.deleteSystemService}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || "No se pudo eliminar el servicio del sistema."
      );
    }
    return await res.json();
  } catch (err) {
    console.error("Delete System Service error:", err);
    throw err;
  }
}

// --- Servicios para System Overall Status Log (Historial de Estado General) ---

/**
 * Obtiene el historial del estado general del sistema.
 * @returns {Promise<Array>} Un array de registros de estado general.
 */
export async function getOverallStatusHistory() {
  try {
    const res = await fetchConToken(endpoints.getOverallStatusHistory, {
      method: "GET",
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || "No se pudo obtener el historial de estado general."
      );
    }
    return await res.json();
  } catch (err) {
    console.error("Get Overall Status History error:", err);
    return [];
  }
}

/**
 * Agrega un nuevo registro de estado general del sistema.
 * @param {object} logData - Datos del nuevo registro (overall_status, description).
 * @returns {Promise<object>} Objeto con mensaje de éxito y el ID del nuevo registro.
 */
export async function addOverallStatusLog(logData) {
  try {
    const res = await fetchConToken(endpoints.addOverallStatusLog, {
      method: "POST",
      body: JSON.stringify(logData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || "No se pudo agregar el registro de estado general."
      );
    }
    return await res.json();
  } catch (err) {
    console.error("Add Overall Status Log error:", err);
    throw err;
  }
}
