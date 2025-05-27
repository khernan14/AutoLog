import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import Button from "../../../Button/Button";
import UploadFotos from "../../../UploadFotos/UploadFotos";
import InputField from "../../../Input/InputField/InputField";
import SelectField from "../../../Input/SelectField/SelectField";
import TextAreaField from "../../../Input/TextAreaField/TextAreaField";

import {
  registrarEntrada,
  SubirImagenesRegistro,
  obtenerKmActual,
} from "../../../../services/RegistrosService";

import {
  SalidaWrapper,
  SalidaForm,
  FormGroup,
  ContainerButtons,
} from "../FormularioSalida/FormularioSalida.styles";

export default function FormularioRegreso({ registro, usuario }) {
  const [kmAnterior, setKmAnterior] = useState("");
  const [km_regreso, setkm_regreso] = useState("");
  const [id_ubicacion_regreso, setIdUbicacionRegreso] = useState("");
  const [combustible, setCombustible] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [fotos, setFotos] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario?.id_empleado || !registro?.id_vehiculo) return;

    const cargarKmActual = async () => {
      try {
        const data = await obtenerKmActual(registro.id_vehiculo);
        if (data?.km_regreso !== undefined) {
          setKmAnterior(data.km_regreso.toString());
        } else {
          setKmAnterior("0");
        }
      } catch (error) {
        console.error("Error al obtener km actual:", error);
      }
    };

    cargarKmActual();
  }, [usuario, registro]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!km_regreso || !combustible || !fotos.length || !id_ubicacion_regreso) {
      Swal.fire(
        "Campos requeridos",
        "Completa todos los campos obligatorios",
        "warning"
      );
      return;
    }

    if (parseInt(km_regreso) < parseInt(kmAnterior)) {
      Swal.fire(
        "Error",
        "El kilometraje de regreso no puede ser menor al de salida",
        "warning"
      );
      return;
    }

    const datosEntrada = {
      id_registro: registro.id_registro,
      id_empleado: usuario.id_empleado,
      id_ubicacion_regreso,
      km_regreso: parseInt(km_regreso),
      combustible_regreso: parseInt(combustible),
      comentario_regreso: observaciones,
    };

    try {
      const registroRegreso = await registrarEntrada(datosEntrada);
      const soloArchivos = fotos.map((f) => f.file);

      if (registroRegreso) {
        const imagenesData = await SubirImagenesRegistro(
          registro.id_registro,
          soloArchivos
        );
        if (imagenesData) {
          Swal.fire(
            "Proceso completo",
            "Regreso registrado y fotos subidas exitosamente",
            "success"
          ).then(() => {
            navigate("/uso-registros/panel-vehiculos", {
              state: { mensaje: "Regreso registrado con éxito 🚗✅" },
            });
          });
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Ocurrió un error durante el registro", "error");
    }
  };

  const handleCancelar = () => {
    navigate("/uso-registros/panel-vehiculos");
  };

  return (
    <SalidaWrapper>
      <SalidaForm onSubmit={handleSubmit}>
        <FormGroup>
          <label>Vehículo en uso</label>
          <InputField
            type="text"
            value={`${registro.placa} - Estado: ${registro.estado}`}
            readOnly></InputField>
        </FormGroup>

        <FormGroup>
          <label>Estacionamiento</label>
          <SelectField
            value={id_ubicacion_regreso}
            onChange={(e) => setIdUbicacionRegreso(e.target.value)}>
            <option value="">Selecciona el Estacionamiento</option>
            <option value="3">Estacionamiento E3</option>
            <option value="2">Estacionamiento E2</option>
            <option value="1">Estacionamiento E1</option>
            <option value="4">Estacionamiento S1</option>
            <option value="5">Estacionamiento S2</option>
            <option value="6">Estacionamiento S3</option>
            <option value="7">Estacionamiento S4</option>
          </SelectField>
        </FormGroup>

        <FormGroup>
          {kmAnterior && (
            <div className="text-sm text-gray-500 mb-2">
              Último kilometraje registrado: <strong>{kmAnterior} km</strong>
            </div>
          )}
          <InputField
            type="number"
            value={km_regreso}
            onChange={(e) => setkm_regreso(e.target.value)}
            placeholder="Kilometraje final"
            name="km_regreso"
            icon="bx-road"
          />
        </FormGroup>

        <FormGroup>
          <InputField
            type="number"
            max="100"
            value={combustible}
            onChange={(e) => setCombustible(e.target.value)}
            placeholder="Porcentaje de combustible"
            name="combustible"
            icon="bx-gas-pump"
          />
        </FormGroup>

        <FormGroup>
          <TextAreaField
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Observaciones del viaje"
            name="observaciones"
          />
        </FormGroup>

        <UploadFotos fotos={fotos} setFotos={setFotos} />

        <ContainerButtons>
          <Button type="submit" className="">
            Registrar Salida
          </Button>
          <Button type="submit" color="danger" onClick={handleCancelar}>
            Cancelar
          </Button>
        </ContainerButtons>
      </SalidaForm>
    </SalidaWrapper>
  );
}
