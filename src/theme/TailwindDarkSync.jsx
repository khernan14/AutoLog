// src/theme/TailwindDarkSync.jsx
import { useEffect } from "react";
import { useColorScheme } from "@mui/joy/styles";

export default function TailwindDarkSync() {
  const { mode } = useColorScheme(); // "light" | "dark" | "system"
  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [mode]);
  return null;
}
