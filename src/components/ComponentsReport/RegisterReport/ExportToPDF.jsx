import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ExportToPDF = (data) => {
  const doc = new jsPDF();

  const tableData = data.map((r) => [
    r.empleado?.nombre || "",
    r.vehiculo?.marca || "",
    r.vehiculo?.modelo || "",
    r.vehiculo?.placa || "",
    new Date(r.fecha_salida).toLocaleString(),
  ]);

  autoTable(doc, {
    head: [["Empleado", "Marca", "Modelo", "Placa", "Fecha de salida"]],
    body: tableData,
  });

  doc.save("reporte-registros.pdf");
};
