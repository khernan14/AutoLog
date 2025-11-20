// src/hooks/useRowFocusHighlight.js
import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Hook genérico para:
 * - Recibir un "token" (id, código, etc.) y buscarlo en un array de rows.
 * - Calcular en qué página está.
 * - Mover la paginación a esa página.
 * - Resaltar la fila y hacer scroll hacia ella.
 *
 * Props:
 * - rows: array ORDENADO donde quieres buscar (por ejemplo, sortedRows).
 * - perPage: cuántos items por página.
 * - setPage: setter de tu estado de página.
 * - matchRow(row, token): función que decide si una fila coincide con el token.
 * - getRowId(row): cómo obtener el id único de la fila (por default row.id).
 */
export default function useRowFocusHighlight({
  rows,
  perPage = 25,
  setPage,
  matchRow,
  getRowId = (row) => row.id,
  highlightMs = 4000,
}) {
  const [requestedToken, setRequestedToken] = useState(null);
  const [highlightId, setHighlightId] = useState(null);
  const focusedRef = useRef(null);

  // ✅ protegernos si rows viene undefined
  const rowsLength = Array.isArray(rows) ? rows.length : 0;

  // Para que puedas llamar focusByToken("123") desde tu componente
  const focusByToken = useCallback((token) => {
    if (!token) return;
    setRequestedToken(token);
  }, []);

  // Cuando cambian rows o tenemos un token pendiente, intentamos resolver
  useEffect(() => {
    if (!requestedToken || !Array.isArray(rows) || !rows.length) return;

    const idx = rows.findIndex((row) => matchRow(row, requestedToken));

    if (idx === -1) {
      // No lo encontramos (de momento); dejamos el token por si rows cambian luego.
      return;
    }

    const row = rows[idx];
    const id = getRowId(row);

    setHighlightId(id);

    if (typeof setPage === "function" && perPage > 0) {
      const targetPage = Math.floor(idx / perPage) + 1;
      setPage((prev) => (prev === targetPage ? prev : targetPage));
    }

    // ya resolvimos este token
    setRequestedToken(null);
  }, [requestedToken, rows, perPage, setPage, matchRow, getRowId]);

  // Apagar highlight después de X ms
  useEffect(() => {
    if (!highlightId || !highlightMs) return;
    const t = setTimeout(() => setHighlightId(null), highlightMs);
    return () => clearTimeout(t);
  }, [highlightId, highlightMs]);

  // Scroll hacia la fila enfocada cuando esté en el DOM
  useEffect(() => {
    if (!highlightId || !focusedRef.current) return;
    focusedRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [highlightId, rowsLength]); // 👈 ya no usamos rows.length directo

  return { highlightId, focusedRef, focusByToken };
}
