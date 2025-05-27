// src/components/NavBar/NavBar.jsx
import { NavBarContainer } from "./NavBar.styles";
import { TbLogout2 } from "react-icons/tb";
import Button from "../Button/Button";
import Swal from "sweetalert2";

export default function NavBar({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Deseas cerrar sesión?",
      text: "Se cerrará tu sesión actual",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#03624C",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
    });

    if (result.isConfirmed) {
      // Swal.fire("Sesión cerrada", "Tu sesión ha sido cerrada.", "success");
      onLogout();
    }
  };

  return (
    <NavBarContainer>
      <h1>AutoLog | Empleados</h1>
      <div className="user-info">
        <span>{user?.nombre || "Empleado"}</span>
        <Button
          onClick={handleLogout}
          color="danger"
          className="animated-register-btn">
          <TbLogout2 className="mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </NavBarContainer>
  );
}
