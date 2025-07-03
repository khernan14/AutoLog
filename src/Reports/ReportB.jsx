import { useState } from "react";

export default function ReportB() {
  const [data, setData] = useState({
    registrosHoy: 0,
    registrosSemana: 0,
    registrosMes: 0,
    topEmpleados: [],
    registrosPorHora: [],
    rankingCombustible: [],
  });

  return (
    <div>
      <h1>Reporte B</h1>
      <p>Este es el reporte B</p>
    </div>
  );
}
