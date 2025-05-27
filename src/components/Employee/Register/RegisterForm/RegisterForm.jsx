import FormularioSalida from "../FormularioSalida/FormularioSalida";
import FormularioRegreso from "../FormularioRegreso/FormularioRegreso";
import { RegisterMain } from "./RegisterForm.styles";

export default function RegisterForm({
  loading,
  usuario,
  registroActivo,
  vehiculos,
}) {
  return (
    <RegisterMain>
      <h2>Registrar Uso de Vehículo</h2>
      {registroActivo ? (
        <FormularioRegreso registro={registroActivo} usuario={usuario} />
      ) : (
        <FormularioSalida vehiculos={vehiculos} usuario={usuario} />
      )}
    </RegisterMain>
  );
}
