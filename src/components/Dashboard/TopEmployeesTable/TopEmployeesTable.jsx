import React from "react";
import {
  TableContainer,
  TopBar,
  TableTitle,
  StyledTable,
} from "./TopEmployeesTable.styles";

export default function TopEmployeesTable({ data }) {
  return (
    <>
      <TopBar>
        <TableTitle>🏅 Top Empleados con Más Registros</TableTitle>
      </TopBar>
      <StyledTable>
        <thead>
          <tr>
            <th>#</th>
            <th>Empleado</th>
            <th>Total Registros</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={`${item.nombre}-${index}`}>
              <td>{index + 1}</td>
              <td>{item.nombre}</td>
              <td>{item.total_registros}</td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </>
  );
}
