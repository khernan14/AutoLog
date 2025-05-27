import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import {
  DropdownContainer,
  DropdownButton,
  DropdownMenu,
  DropdownTitle,
  DropdownItem,
  DangerItem,
  UserName,
} from "./DropdownMenuSimple.styles";

export default function DropdownMenuSimple() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.nombre) setUserName(user.nombre);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      localStorage.clear();
      navigate("/auth/login");
    }
  };
  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownButton onClick={() => setIsOpen(!isOpen)}>
        <FaUserAlt />
        <UserName>{userName || "Usuario"}</UserName>
      </DropdownButton>

      {isOpen && (
        <DropdownMenu>
          <DropdownTitle>Mi cuenta</DropdownTitle>
          <DropdownItem>Mi cuenta</DropdownItem>
          <hr />
          <DropdownItem>Soporte</DropdownItem>
          <DropdownItem>Configuraciones</DropdownItem>
          <DangerItem onClick={handleLogout}>Cerrar sesión</DangerItem>
        </DropdownMenu>
      )}
    </DropdownContainer>
  );
}
