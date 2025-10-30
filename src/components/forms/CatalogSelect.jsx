// src/components/forms/CatalogSelect.jsx
import { Autocomplete } from "@mui/joy";
import {
  ESTATUS_ACTIVO,
  TIPOS_ACTIVO,
  toOptions,
} from "@/constants/inventario";

// mapeamos el nombre a tu array real
const MAP = {
  estatusActivo: ESTATUS_ACTIVO,
  tiposActivo: TIPOS_ACTIVO,
};

export default function CatalogSelect({
  catalog, // "estatusActivo" | "tiposActivo"
  value,
  onChange,
  label,
  placeholder,
  disabled,
  allowEmpty = false,
  ...props
}) {
  const arr = MAP[catalog] || [];
  const options = toOptions(arr);

  return (
    <Autocomplete
      size="md"
      placeholder={placeholder || label || "Selecciona…"}
      options={options}
      value={value ? { label: value, value } : null}
      onChange={(_, opt) => {
        // si se permite vacío
        if (allowEmpty && !opt) return onChange?.(null, "");
        onChange?.(null, opt?.value || "");
      }}
      clearOnBlur={false}
      isOptionEqualToValue={(o, v) => o.value === v.value}
      {...props}
    />
  );
}
