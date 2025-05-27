// GlobalStyles.js
import { createGlobalStyle } from "styled-components";
import { theme } from "./theme";

export const GlobalStyles = createGlobalStyle`

  body {
    margin: 0;
    font-family: 'Poppins', sans-serif;
    // background-color: ${theme.colors.background};
    // color: ${theme.colors.text};
  }

  * {
    box-sizing: border-box;
  }

  .animated-register-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.animated-register-btn:hover {
  transform: scale(1.05);
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Para Firefox */
input[type="number"] {
    -moz-appearance: textfield;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes fade-up {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-up {
  animation: fade-up 0.2s ease-out forwards;
}


`;
