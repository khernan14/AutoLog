import styled from "styled-components";
import { theme } from "../../../constants/theme";

export const EmpleadoContainer = styled.div`
  background-color: ${theme.colors.background};
  min-height: 100vh;
  padding: 2rem;
  font-family: "Poppins", sans-serif;
  color: ${theme.colors.text};
`;

export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  h2 {
    font-size: 1.8rem;
    font-weight: bold;
    color: ${theme.colors.text};
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const EmpleadoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;

  h3 {
    font-size: 1.4rem;
    font-weight: 600;
    color: ${theme.colors.text};
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

// export const EmpleadoTable = styled.table`
//   width: 100%;
//   border-collapse: separate;
//   border-spacing: 0;
//   background: #ffffff;
//   border-radius: 0.75rem;
//   overflow: hidden;
//   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
//   transition: background 0.3s ease;

//   th,
//   td {
//     padding: 0.75rem;
//     text-align: left;
//     border-bottom: 1px solid #e5e7eb;
//     color: #333;
//     transition: background-color 0.2s ease;
//   }

//   th {
//     background: #f0f4f8;
//     font-weight: 600;
//   }

//   tr:last-child td {
//     border-bottom: none;
//   }

//   tr:hover {
//     background-color: ${theme.colors.warning}; /* Animación de hover */
//     cursor: pointer;
//   }
// `;

export const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;

  &::before {
    content: "";
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    background: ${({ available }) =>
      available ? theme.colors.success : "#f59e0b"};
  }
`;

export const FloatingButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 0.75rem 1.25rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

// EmpleadosForm.styles.jsx
export const NavBar = styled.div`
  width: 100%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  h1 {
    font-size: 1.25rem;
    font-weight: 600;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
`;

export const EmpleadoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);

  thead {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
  }

  th,
  td {
    padding: 1rem;
    text-align: left;
    // border-bottom: 1px solid ${({ theme }) =>
      theme.colors.border || "#e5e7eb"};
  }

  tr:hover {
    background-color: ${({ theme }) => theme.colors.primary || "#f9fafb"};
  }

  th {
    font-weight: 600;
    font-size: 0.95rem;
  }

  td {
    font-size: 0.9rem;
  }
`;
