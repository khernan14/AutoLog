import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  "es-HN": {
    translation: {
      sidebar: {
        inicio: "Inicio",
        dashboard: "Dashboard",
        vehiculos: "Vehículos",
        registros: "Registros",
        reportes: "Reportes",
        gestion: "Gestión",
        companias: "Compañías",
        paises: "Países",
        inventario: "Inventario",
        ciudades: "Ciudades",
        estacionamientos: "Estacionamientos",
        sistema: "Sistema",
        gestion_usuarios: "Gestionar Usuarios",
        ayuda: "Soporte y Ayuda",
        bodegas: "Bodegas",
        activos: "Activos",
        notificaciones: "Notificaciones",
        gestionar_faqs: "Gestionar FAQs",
        gestionar_tutoriales: "Gestionar Tutoriales",
        gestionar_novedades: "Gestionar Novedades",
        estado_de_servicios: "Estado de Servicios",
      },
      settings: {
        title: "Configuración",
        description: "Administra tu perfil y preferencias de la aplicación.",
        save: "Guardar",
        inicio: "Inicio",
        seguridad: "Seguridad",
        apariencia: "Apariencia",
        idioma: "Idioma & Región",
        accesibilidad: "Accesibilidad",
        integraciones: "Integraciones",
        privacidad: "Datos & Privacidad",
        backups: "Respaldo & Backups",
        acerca: "Acerca de",
      },
    },
  },
  "en-US": {
    translation: {
      sidebar: {
        inicio: "Home",
        dashboard: "Dashboard",
        vehiculos: "Vehicles",
        registros: "Records",
        reportes: "Reports",
        gestion: "Management",
        companias: "Companies",
        paises: "Countries",
        inventario: "Inventory",
        ciudades: "Cities",
        estacionamientos: "Parking Lots",
        sistema: "System",
        gestion_usuarios: "Manage Users",
        ayuda: "Support and Help",
        bodegas: "Warehouses",
        activos: "Assets",
        notificaciones: "Notifications",
        gestionar_faqs: "Manage FAQs",
        gestionar_tutoriales: "Manage Tutorials",
        gestionar_novedades: "Manage News",
        estado_de_servicios: "Service Status",
      },
      settings: {
        title: "Settings",
        description: "Manage your profile and preferences for the application.",
        save: "Save",
        inicio: "Home",
        seguridad: "Security",
        apariencia: "Appearance",
        idioma: "Language & Region",
        accesibilidad: "Accessibility",
        integraciones: "Integrations",
        privacidad: "Data & Privacy",
        backups: "Backup & Restore",
        acerca: "About",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "es-HN", // Idioma por defecto si falla la carga
  fallbackLng: "es-HN",
  interpolation: {
    escapeValue: false, // React ya protege contra XSS
  },
});

export default i18n;
