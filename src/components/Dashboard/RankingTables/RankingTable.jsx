import React from "react";
import { StyledTable, TableTitle, TopBar } from "./RankingTable.styles";

export default function RankingTable({ data }) {
  return (
    <>
      <TopBar>
        <TableTitle>🏅 Ranking de Empleados</TableTitle>
      </TopBar>

      <StyledTable>
        <thead>
          <tr>
            <th>#</th>
            <th>Empleado</th>
            <th>Vehiculo</th>
            <th>Kilometro de Salida</th>
            <th>Kilometro de Regreso</th>
            <th>Combustible de Salida</th>
            <th>Combustible de Regreso</th>
            <th>Kilometros por Litro</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={`${item.empleado}-${index}`}>
              <td>{index + 1}</td>
              <td>{item.empleado}</td>
              <td>{item.placa}</td>
              <td>{item.km_salida}</td>
              <td>{item.km_regreso}</td>
              <td>{item.combustible_salida}</td>
              <td>{item.combustible_regreso}</td>
              <td>
                {Number.isFinite(Number(item.km_por_litro))
                  ? Number(item.km_por_litro).toFixed(2)
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </>
  );
}
