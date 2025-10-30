// Catálogos de Inventario (única fuente de verdad)
export const ESTATUS_ACTIVO = [
  "Activo",
  "Inactivo",
  "Arrendado",
  "En Mantenimiento",
  "Reciclado",
  "Propiedad del Cliente",
];

export const TIPOS_ACTIVO = [
  "Impresora",
  "ATM",
  "Escáner",
  "UPS",
  "Silla",
  "Mueble",
  "Laptop",
  "Desktop",
  "Mesa",
  "Audifonos",
  "Monitor",
  "Mochila",
  "Escritorio",
  "Celular",
  "Otro",
];

// Mapeo útil para chips/colores
export const ESTATUS_COLOR = {
  Activo: "success",
  Arrendado: "primary",
  "En Mantenimiento": "warning",
  Inactivo: "danger",
  Reciclado: "neutral",
};

// Helper para Select/Autocomplete
export const toOptions = (arr) => arr.map((v) => ({ label: v, value: v }));
