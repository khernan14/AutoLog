import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ExportToExcel = (data) => {
  const formattedData = data.map((r) => ({
    Empleado: r.empleado?.nombre || "",
    Marca: r.vehiculo?.marca || "",
    Modelo: r.vehiculo?.modelo || "",
    Placa: r.vehiculo?.placa || "",
    Fecha_Salida: new Date(r.fecha_salida).toLocaleString(),
    // Agrega lo que quieras exportar aquí
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Registros");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const fileData = new Blob([excelBuffer], {
    type: "application/octet-stream",
  });

  saveAs(fileData, "reporte-registros.xlsx");
};
