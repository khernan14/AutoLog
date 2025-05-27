import { useState, useEffect } from "react";
import { Form, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Button from "../../../Button/Button";
import UploadFotos from "../../../UploadFotos/UploadFotos";
import InputField from "../../../Input/InputField/InputField";
import {
  registrarSalida,
  SubirImagenesRegistro,
} from "../../../../services/RegistrosService";
import { ListarVehiculosEmpleado } from "../../../../services/VehiculosService";
import { obtenerKmActual } from "../../../../services/RegistrosService";
import {
  SalidaWrapper,
  SalidaForm,
  FormGroup,
  Label,
  ContainerButtons,
} from "../FormularioSalida/FormularioSalida.styles";
import SelectField from "../../../Input/SelectField/SelectField";
import TextAreaField from "../../../Input/TextAreaField/TextAreaField";

export default function FormularioSalida({ vehiculos, usuario }) {
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState("");
  const [listaVehiculo, setListaVehiculo] = useState([]);
  const [km_salida, setkm_salida] = useState("");
  const [kmActual, setKmActual] = useState("");
  const [kmManual, setKmManual] = useState(false);
  const [combustible, setCombustible] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [fotos, setFotos] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario || !usuario.id_empleado) return;

    const cargarListaVehiculos = async () => {
      const data = await ListarVehiculosEmpleado(usuario.id_empleado);
      if (data) setListaVehiculo(data);
    };

    cargarListaVehiculos();
  }, [usuario]);

  const handleVehiculoChange = async (e) => {
    const idSeleccionado = e.target.value;
    setVehiculoSeleccionado(idSeleccionado);

    try {
      const kilometraje = await obtenerKmActual(idSeleccionado);
      const km = kilometraje?.km_regreso || 0;

      if (km > 0) {
        setKmActual(km.toString());
        setKmManual(false);
      } else {
        setKmActual("");
        setKmManual(true);
      }
    } catch (error) {
      console.error("Error obteniendo km actual:", error);
      setKmActual("");
      setKmManual(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehiculoSeleccionado || !kmActual || !combustible || !fotos.length) {
      Swal.fire({
        title: "Error",
        text: "Todos los campos son requeridos",
        icon: "warning",
        confirmButtonColor: "#FFE4D0",
      });
      return;
    }

    const vehiculoEncontrado = vehiculos.find(
      (v) => v.id === parseInt(vehiculoSeleccionado)
    );

    const datosSalida = {
      id_empleado: usuario.id_empleado,
      id_vehiculo: vehiculoSeleccionado,
      id_ubicacion_salida: vehiculoEncontrado
        ? vehiculoEncontrado.LocationID
        : null,
      km_salida: kmActual,
      combustible_salida: combustible,
      comentario_salida: observaciones,
    };

    try {
      const registro = await registrarSalida(datosSalida);
      const soloArchivos = fotos.map((f) => f.file);

      if (registro) {
        const imagenesData = await SubirImagenesRegistro(
          registro.id_registro,
          soloArchivos
        );
        if (imagenesData) {
          Swal.fire({
            title: "¡Salida registrada con éxito!",
            text: "Salida registrada con éxito 🚗",
            icon: "success",
            confirmButtonColor: "#03624C",
          }).then(() => {
            navigate("/uso-registros/panel-vehiculos", {
              state: { mensaje: "Salida registrada con éxito 🚗✅" },
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
          <Label>Vehículo</Label>
          <SelectField
            value={vehiculoSeleccionado}
            onChange={handleVehiculoChange}>
            <option value="">Selecciona un vehículo</option>
            {listaVehiculo.map((v) => (
              <option key={v.id} value={v.id}>
                {v.placa} - {v.marca} {v.modelo}
              </option>
            ))}
          </SelectField>
        </FormGroup>

        <FormGroup>
          <Label>Kilometraje actual</Label>
          <InputField
            type="text"
            name="kmActual"
            placeholder="Ingrese el kilometraje"
            value={kmActual}
            onChange={(e) => setKmActual(e.target.value)}
            icon="bx-tachometer"
            readOnly={!kmManual}
          />
        </FormGroup>

        <FormGroup>
          <Label>Porcentaje de combustible</Label>
          <InputField
            type="number"
            name="combustible"
            placeholder="Porcentaje (%)"
            value={combustible}
            onChange={(e) => setCombustible(e.target.value)}
            icon="bx-gas-pump"
          />
        </FormGroup>

        <FormGroup>
          <Label>Observaciones (opcional)</Label>
          <TextAreaField
            rows="3"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
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
