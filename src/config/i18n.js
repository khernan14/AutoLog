import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import es from "../locales/es/translation.json";
import en from "../locales/en/translation.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "es-HN": { translation: es },
      "en-US": { translation: en },
      es: { translation: es },
      en: { translation: en },
    },

    fallbackLng: "es-HN",

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
