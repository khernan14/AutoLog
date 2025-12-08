// src/context/SettingsContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import SettingsService from "../services/SettingsServices.js";
import { useToast } from "../context/ToastContext.jsx"; // ajusta la ruta si es distinta

const SettingsContext = createContext(null);

// merge profundo simple (no muta los inputs)
function deepMerge(target = {}, patch = {}) {
  if (!patch) return target;
  const out = Array.isArray(target) ? [...target] : { ...target };
  for (const key of Object.keys(patch)) {
    const pv = patch[key];
    const tv = target ? target[key] : undefined;
    if (
      pv &&
      typeof pv === "object" &&
      !Array.isArray(pv) &&
      tv &&
      typeof tv === "object" &&
      !Array.isArray(tv)
    ) {
      out[key] = deepMerge(tv, pv);
    } else {
      out[key] = pv;
    }
  }
  return out;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null); // { perfil: {...}, seguridad: {...}, ... }
  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState({}); // { perfil: false, seguridad: true }
  const toast = useToast();

  // Carga inicial de settings
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await SettingsService.getAllSettings();
        if (!mounted) return;
        setSettings(data || {});
      } catch (err) {
        console.error(err);
        // Evita usar toast aquí si causa loops, o asegúrate de que toast sea estable.
        // Por seguridad en el arranque, podemos omitirlo o usar console.error
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // saveSection: optimistic update + rollback
  const saveSection = useCallback(
    async (sectionKey, partialPayload = {}) => {
      if (!sectionKey) throw new Error("sectionKey es requerido");
      if (!partialPayload || typeof partialPayload !== "object")
        throw new Error("partialPayload debe ser un objeto");

      // snapshot para rollback
      const prev = settings ? settings[sectionKey] || {} : {};
      const optimistic = deepMerge(prev, partialPayload);

      // set optimistic + mark saving
      setSettings((s) => ({ ...(s || {}), [sectionKey]: optimistic }));
      setSavingMap((m) => ({ ...(m || {}), [sectionKey]: true }));

      try {
        const res = await SettingsService.patchSection(
          sectionKey,
          partialPayload
        );
        const serverPayload = res && res.data ? res.data : optimistic;
        setSettings((s) => ({ ...(s || {}), [sectionKey]: serverPayload }));

        if (res && res.action) {
          toast.showToast("Acción iniciada", "info");
          return res;
        }

        toast.showToast("Guardado", "success");
        return serverPayload;
      } catch (err) {
        // rollback
        setSettings((s) => ({ ...(s || {}), [sectionKey]: prev }));
        toast.showToast(err?.message || "Error al guardar", "danger");
        throw err;
      } finally {
        setSavingMap((m) => ({ ...(m || {}), [sectionKey]: false }));
      }
    },
    [settings, toast]
  );

  // opción: función pública para forzar recarga desde server (por ejemplo después de reset global)
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await SettingsService.getAllSettings();
      setSettings(data || {});
    } catch (err) {
      toast.showToast("No se pudo recargar configuraciones", "danger");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return (
    <SettingsContext.Provider
      value={{ settings, loading, saveSection, savingMap, reload }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings debe usarse dentro de SettingsProvider");
  return ctx;
}
