import { useEffect, useState } from "react";
import {
  Sheet,
  CircularProgress,
  Typography,
  Box,
  Input,
  Button,
  IconButton,
  Dropdown,
  MenuButton,
  Menu,
  MenuItem,
} from "@mui/joy";
import ReportHeader from "../components/ComponentsReport/GeneralComponents/ReportHeader.jsx";
import ReportCard from "../components/ComponentsReport/RegisterReport/ReportCard.jsx";
import ReportDetailModal from "../components/ComponentsReport/RegisterReport/ReportDetailModal.jsx";
import SearchAndDateFilter from "../components/ComponentsReport/GeneralComponents/SearchAndDateFilter.jsx";
import { getRegisterReport } from "../services/ReportServices";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function RegisterReport() {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchRegistros = async () => {
      setLoading(true);
      const data = await getRegisterReport();
      setRegistros(data);
      setLoading(false);
    };

    fetchRegistros();
  }, []);

  const handleCardClick = (registro) => {
    setSelectedRegistro(registro);
    setModalOpen(true);
  };

  const ClearFilter = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0]; // te da "yyyy-mm-dd"
  };

  const filteredRegistros = registros
    .filter((r) => {
      const searchLower = search.toLowerCase();
      return (
        r.empleado?.nombre?.toLowerCase().includes(searchLower) ||
        r.vehiculo?.marca?.toLowerCase().includes(searchLower) ||
        r.vehiculo?.modelo?.toLowerCase().includes(searchLower) ||
        r.vehiculo?.placa?.toLowerCase().includes(searchLower)
      );
    })
    .filter((r) => {
      const salida = new Date(r.fecha_salida); // tu dato original con hora incluida
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      // Asegura que la fecha fin incluya TODO el día hasta las 23:59:59
      if (end) {
        end.setHours(23, 59, 59, 999);
      }

      return (!start || salida >= start) && (!end || salida <= end);
    })
    .filter((r) => {
      if (statusFilter === "activos") return !r.fecha_regreso;
      if (statusFilter === "finalizados") return !!r.fecha_regreso;
      return true; // "todos"
    });

  const totalPages = Math.ceil(filteredRegistros.length / itemsPerPage);
  const pageData = filteredRegistros.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const exportToExcel = () => {
    const data = filteredRegistros.map((r) => ({
      Empleado: r.empleado?.nombre || "",
      Vehiculo: `${r.vehiculo?.marca || ""} ${r.vehiculo?.modelo || ""}`,
      Fecha_Salida: new Date(r.fecha_salida).toLocaleString("es-HN"),
      Fecha_Regreso: r.fecha_regreso
        ? new Date(r.fecha_regreso).toLocaleString("es-HN")
        : "",
      Kilometraje_Salida: r.km_salida || "",
      Kilometraje_Regreso: r.km_regreso || "",
      Combustible_Salida: r.combustible_salida
        ? `${r.combustible_salida}%`
        : "",
      Combustible_Regreso: r.combustible_regreso
        ? `${r.combustible_regreso}%`
        : "",
      Comentario_Salida: r.comentario_salida || "No hay",
      Comentario_Regreso: r.comentario_regreso || "No hay",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Ancho de Columnas Automático (esto es seguro y útil)
    const wscols = [];
    // Asegúrate de que haya datos para evitar errores si filteredRegistros está vacío
    if (data.length > 0) {
      for (let i = 0; i < Object.keys(data[0]).length; i++) {
        let maxLength = 0;
        const colName = Object.keys(data[0])[i];
        maxLength = Math.max(maxLength, colName.length); // Considerar el largo del encabezado
        data.forEach((row) => {
          const cellValue = String(Object.values(row)[i]);
          if (cellValue.length > maxLength) {
            maxLength = cellValue.length;
          }
        });
        wscols.push({ wch: maxLength + 2 });
      }
      worksheet["!cols"] = wscols;
    }

    // Obtener el rango de la hoja de trabajo
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1:A1"); // Manejo para hojas vacías

    // AutoFiltro (esto también es seguro)
    worksheet["!autofilter"] = { ref: XLSX.utils.encode_range(range) };

    // Congelar Paneles (esto es seguro)
    worksheet["!freeze"] = {
      xSplit: 0,
      ySplit: 1, // Congela la primera fila
      topLeftCell: "A2",
      activePane: "bottomLeft",
      state: "frozen",
    };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registros de Vehículos");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
      // Quitamos 'cellStyles: true' si no vamos a aplicar estilos complejos manualmente,
      // o lo dejamos solo si estamos seguros de que los estilos son válidos
      // Para depurar, es mejor quitarlo y ver si se soluciona.
      // Si aún quieres negritas en el encabezado, considera una implementación más robusta.
      // Si lo dejas, asegúrate de que todos los estilos sean correctos.
      cellStyles: false, // <-- Cambiado a false para intentar resolver el error
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(fileData, "reporte_Registros_de_Uso_Vehiculos.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF("landscape"); // Orientación horizontal

    // Márgenes para el contenido
    const marginX = 14; // Margen izquierdo y derecho
    const startYContent = 25; // Posición inicial para el contenido debajo del título

    // 1. Título o encabezado con mejor posicionamiento
    doc.setFontSize(22); // Tamaño de fuente más grande
    doc.setTextColor(40, 40, 40); // Color de texto más oscuro
    doc.setFont("helvetica", "bold"); // Fuente en negrita
    doc.text("Reporte de Registro de Uso de Vehículos", marginX, 15); // Un poco más abajo

    // Línea separadora debajo del título
    doc.setDrawColor(200, 200, 200); // Color de línea gris
    doc.setLineWidth(0.5); // Grosor de la línea
    doc.line(marginX, 19, doc.internal.pageSize.width - marginX, 19); // Dibuja la línea

    const tableData = filteredRegistros.map((r) => [
      r.empleado?.nombre || "",
      `${r.vehiculo?.marca || ""} ${r.vehiculo?.modelo || ""}`,
      new Date(r.fecha_salida).toLocaleString(),
      r.fecha_regreso ? new Date(r.fecha_regreso).toLocaleString() : "",
      r.km_salida || "",
      r.km_regreso || "",
      r.combustible_salida ? `${r.combustible_salida}%` : "",
      r.combustible_regreso ? `${r.combustible_regreso}%` : "",
      r.comentario_salida || "No hay",
      r.comentario_regreso || "No hay",
    ]);

    autoTable(doc, {
      startY: startYContent, // Iniciar la tabla más abajo
      head: [
        [
          "Empleado",
          "Vehículo",
          "F. Salida",
          "F. Regreso",
          "Km Salida",
          "Km Regreso",
          "Comb. Salida",
          "Comb. Regreso",
          "Coment. Salida",
          "Coment. Regreso",
        ],
      ],
      body: tableData,
      margin: { horizontal: marginX }, // Aplicar margen a la tabla
      styles: {
        fontSize: 8, // Ajustado el tamaño de fuente para mejor legibilidad en landscape
        cellPadding: 2, // Espaciado interno de las celdas
        overflow: "linebreak", // Asegura que el texto se ajuste a la línea
        halign: "center", // Centrar el texto en las celdas por defecto
      },
      headStyles: {
        fillColor: [22, 160, 133], // Un verde más vibrante
        textColor: [255, 255, 255], // Texto blanco
        fontStyle: "bold", // Negrita
        fontSize: 9, // Un poco más grande que el cuerpo
        halign: "center", // Centrar el texto en el encabezado
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Color para filas alternas (efecto cebra)
      },
      columnStyles: {
        // Ajustes específicos para algunas columnas si es necesario
        // 0: { cellWidth: 30 }, // Empleado
        // 1: { cellWidth: 30 }, // Vehículo
        // Puedes ajustar el ancho de columnas específicas aquí si el 'wrap' no es suficiente
      },
      didDrawPage: function (data) {
        // 5. Pie de página con número de página y fecha
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150); // Color gris claro
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          doc.internal.pageSize.width - marginX,
          doc.internal.pageSize.height - 10,
          { align: "right" }
        );
        doc.text(
          `Generado el: ${new Date().toLocaleDateString("es-HN")}`, // Fecha actual de Honduras
          marginX,
          doc.internal.pageSize.height - 10,
          { align: "left" }
        );
      },
    });

    doc.save("reporte_Registros_de_Uso_Vehiculos.pdf");
  };

  function getPaginationPages(current, total) {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
      if (
        i === 1 ||
        i === total ||
        (i >= current - delta && i <= current + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }

  return (
    <Sheet
      variant="soft"
      sx={{
        mt: 3,
        borderRadius: "md",
        boxShadow: "none",
        bgcolor: "transparent",
        minHeight: "400px",
        overflow: "auto",
        p: 2,
        gap: 2,
      }}>
      <ReportHeader title="Reporte de Registro de Uso de Vehículos" />

      {/* <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <Button variant="outlined" color="success" onClick={exportToExcel}>
          Exportar a Excel
        </Button>
        <Button variant="outlined" color="danger" onClick={exportToPDF}>
          Exportar a PDF
        </Button>
      </Box> */}
      <Box>
        <Dropdown>
          <MenuButton sx={{ mt: 2.7 }} variant="outlined" color="primary">
            Exportar a...
          </MenuButton>
          <Menu>
            <MenuItem onClick={exportToExcel}>Excel</MenuItem>
            <MenuItem onClick={exportToPDF}>PDF</MenuItem>
          </Menu>
        </Dropdown>
      </Box>

      {/* Filtros */}
      <SearchAndDateFilter
        search={search}
        startDate={startDate}
        endDate={endDate}
        onSearchChange={setSearch}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClear={ClearFilter}
      />

      {/* Contenido */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress size="lg" />
        </Box>
      ) : pageData.length === 0 ? (
        <Typography
          level="body1"
          sx={{ textAlign: "center", mt: 6, color: "text.secondary" }}>
          No hay registros disponibles.
        </Typography>
      ) : (
        <Box
          sx={{
            mt: 3,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            },
            gap: 3,
          }}>
          {pageData.map((registro) => (
            <ReportCard
              key={registro.id}
              registro={registro}
              onClick={handleCardClick}
            />
          ))}
        </Box>
      )}

      {/* Paginación */}
      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "center",
            gap: 1,
            flexWrap: "wrap",
          }}>
          <IconButton
            variant="outlined"
            color="neutral"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}>
            <ChevronLeft />
          </IconButton>

          {getPaginationPages(currentPage, totalPages).map((page, index) =>
            page === "..." ? (
              <Button key={`ellipsis-${index}`} disabled size="sm">
                ...
              </Button>
            ) : (
              <Button
                key={page}
                size="sm"
                variant={page === currentPage ? "solid" : "outlined"}
                color="primary"
                onClick={() => handlePageChange(page)}>
                {page}
              </Button>
            )
          )}

          <IconButton
            variant="outlined"
            color="neutral"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}>
            <ChevronRight />
          </IconButton>
        </Box>
      )}

      <ReportDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        registro={selectedRegistro}
      />
    </Sheet>
  );
}
