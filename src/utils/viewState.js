/**
 * Normaliza el estado de vista para listas (igual que venías usando).
 */
export function getViewState({ checkingSession, canView, error, loading, hasData }) {
    if (checkingSession) return "checking";
    if (!canView) return "no-permission";
    if (error) return "error";
    if (!loading && !hasData) return "empty";
    if (loading) return "loading";
    return "data";
}
