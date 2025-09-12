import * as React from "react";
import ResourceState from "./ResourceState";
import usePermissions from "../../hooks/usePermissions";

/**
 * Permite envolver una sección/página y exigir permisos.
 * Props:
 * - anyOf: string[] (si tiene alguno, pasa)
 * - allOf: string[] (si tiene todos, pasa)
 * - children: contenido a mostrar si pasa
 */
export default function PermissionGate({ anyOf = [], allOf = [], children }) {
    const { canAny, canAll } = usePermissions();

    const passAny = anyOf.length === 0 || canAny(...anyOf);
    const passAll = allOf.length === 0 || canAll(...allOf);
    const allowed = passAny && passAll;

    if (!allowed) {
        return <ResourceState state="no-permission" />;
    }
    return <>{children}</>;
}
