import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { CssBaseline, CssVarsProvider, extendTheme } from "@mui/joy/";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { GlobalStyles } from "./constants/GlobalStyle";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// 🎨 Crea un theme extendido con la fuente Poppins
const theme = extendTheme({
  fontFamily: {
    body: "Poppins, sans-serif",
    display: "Poppins, sans-serif",
  },
  defaultColorScheme: "light",
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CssVarsProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <GlobalStyles />
        <App />
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover={false}
          theme="light"
        />
      </LocalizationProvider>
    </CssVarsProvider>
  </React.StrictMode>
);
