import { useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";

/**
 * Hook para centralizar permisos.
 * API:
 * - isAdmin: boolean
 * - has(name): boolean
 * - canAny(...perms): boolean  → true si tiene al menos uno
 * - canAll(...perms): boolean  → true si tiene todos
 */
export default function usePermissions() {
    const { userData, hasPermiso } = useAuth();
    const isAdmin = (userData?.rol || "").toLowerCase() === "admin";

    const has = useCallback(
        (name) => isAdmin || !!hasPermiso(name),
        [isAdmin, hasPermiso]
    );

    const canAny = useCallback((...names) => names.some((n) => has(n)), [has]);
    const canAll = useCallback((...names) => names.every((n) => has(n)), [has]);

    return useMemo(
        () => ({ isAdmin, has, canAny, canAll }),
        [isAdmin, has, canAny, canAll]
    );
}
