// src/components/common/PaginationLite.jsx
import { Stack, Button, IconButton } from "@mui/joy";
import FirstPageRoundedIcon from "@mui/icons-material/FirstPageRounded";
import LastPageRoundedIcon from "@mui/icons-material/LastPageRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";

function range(start, end) {
  const out = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

/**
 * Props:
 *  - page:        número de página actual (1-indexed)
 *  - count:       total de páginas
 *  - onChange:    (newPage:number) => void
 *  - size:        "sm" | "md" | "lg" (default "sm")
 *  - variant:     "outlined" | "soft" | "plain" | "solid" (default "outlined")
 *  - color:       Joy color (default "neutral")
 *  - boundaryCount: nº de páginas fijas al inicio/fin (default 1)
 *  - siblingCount:  nº de páginas vecinas alrededor de la actual (default 1)
 *  - showFirstLast: mostrar botones Ir al inicio/fin (default true)
 *  - sx:          estilos sx para el contenedor
 */
export default function PaginationLite({
  page = 1,
  count = 1,
  onChange,
  size = "sm",
  variant = "outlined",
  color = "neutral",
  boundaryCount = 1,
  siblingCount = 1,
  showFirstLast = true,
  sx,
}) {
  const clampPage = (p) => Math.min(Math.max(1, p), Math.max(1, count));
  const go = (p) => onChange?.(clampPage(p));

  if (count <= 1) return null;

  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(
    Math.max(count - boundaryCount + 1, boundaryCount + 1),
    count
  );

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length ? endPages[0] - 2 : count - 1
  );

  const itemList = [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? ["ellipsis"]
      : boundaryCount + 1 < count - boundaryCount
      ? [boundaryCount + 1]
      : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? ["ellipsis"]
      : count - boundaryCount > boundaryCount
      ? [count - boundaryCount]
      : []),
    ...endPages,
  ].filter(Boolean);

  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={sx}>
      {showFirstLast && (
        <IconButton
          size={size}
          variant={variant}
          color={color}
          disabled={page <= 1}
          onClick={() => go(1)}>
          <FirstPageRoundedIcon />
        </IconButton>
      )}

      <IconButton
        size={size}
        variant={variant}
        color={color}
        disabled={page <= 1}
        onClick={() => go(page - 1)}>
        <ChevronLeftRoundedIcon />
      </IconButton>

      {itemList.map((it, idx) =>
        it === "ellipsis" ? (
          <IconButton key={`e-${idx}`} size={size} variant="plain" disabled>
            <MoreHorizRoundedIcon />
          </IconButton>
        ) : (
          <Button
            key={it}
            size={size}
            variant={it === page ? "solid" : variant}
            color={it === page ? "primary" : color}
            onClick={() => go(it)}>
            {it}
          </Button>
        )
      )}

      <IconButton
        size={size}
        variant={variant}
        color={color}
        disabled={page >= count}
        onClick={() => go(page + 1)}>
        <ChevronRightRoundedIcon />
      </IconButton>

      {showFirstLast && (
        <IconButton
          size={size}
          variant={variant}
          color={color}
          disabled={page >= count}
          onClick={() => go(count)}>
          <LastPageRoundedIcon />
        </IconButton>
      )}
    </Stack>
  );
}
