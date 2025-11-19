import { Autocomplete } from "@mui/joy";
import {
  ESTATUS_ACTIVO,
  TIPOS_ACTIVO,
  PRODUCTO_UNIDADES,
  PRODUCTO_TIPOS,
  ROLES_USUARIO,
  PUESTOS_USUARIO,
  toOptions,
} from "@/constants/inventario";

// mapeamos el nombre al array real
const MAP = {
  estatusActivo: ESTATUS_ACTIVO,
  tiposActivo: TIPOS_ACTIVO,
  unidadesProducto: PRODUCTO_UNIDADES,
  tiposProducto: PRODUCTO_TIPOS,
  rolesUsuario: ROLES_USUARIO,
  puestosUsuario: PUESTOS_USUARIO,
};

export default function CatalogSelect({
  catalog, // "estatusActivo" | "tiposActivo" | "unidadesProducto" | "tiposProducto" | "rolesUsuario" | "puestosUsuario"
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
        if (allowEmpty && !opt) return onChange?.("");
        onChange?.(opt?.value || "");
      }}
      clearOnBlur={false}
      isOptionEqualToValue={(o, v) => o.value === v.value}
      disabled={disabled}
      {...props}
    />
  );
}
