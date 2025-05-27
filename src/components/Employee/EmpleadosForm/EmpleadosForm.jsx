import Swal from "sweetalert2";
import Button from "../../Button/Button";
import { FaPlusCircle } from "react-icons/fa";
import NavBar from "../../Nav/NavBar";
import {
  EmpleadoHeader,
  EmpleadoTable,
  StatusIndicator,
  EmpleadoContainer,
  TopBar,
} from "./EmpleadosForm.styles";

export default function EmpleadoForm({ vehiculos, onAction, onLogout }) {
  return (
    <EmpleadoContainer>
      {/* <NavBar onLogout={onLogout} /> */}

      <EmpleadoHeader>
        <h3>Listado de Vehículos</h3>
        <Button onClick={onAction.register} className="animated-register-btn">
          <FaPlusCircle className="mr-2" />
          Registrar Uso
        </Button>
      </EmpleadoHeader>

      <EmpleadoTable>
        <thead>
          <tr>
            <th>ID</th>
            <th>Vehículo</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Ubicación</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {vehiculos.map((v) => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{v.placa}</td>
              <td>{v.marca}</td>
              <td>{v.modelo}</td>
              <td>{v.nombre_ubicacion}</td>
              <td>
                <StatusIndicator available={v.estado === "Disponible"}>
                  {v.estado}
                </StatusIndicator>
              </td>
            </tr>
          ))}
        </tbody>
      </EmpleadoTable>
    </EmpleadoContainer>
  );
}
