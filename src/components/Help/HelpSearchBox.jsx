import { useRef, useState } from "react";
import {
  Box,
  Sheet,
  Input,
  Button,
  List,
  ListItem,
  ListItemButton,
  Stack,
  Typography,
  Skeleton,
} from "@mui/joy";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { listFaqs, listTutorials } from "@/services/help.api";

function useDebounce() {
  const r = useRef();
  return (fn, ms = 250) =>
    (...args) => {
      clearTimeout(r.current);
      r.current = setTimeout(() => fn(...args), ms);
    };
}

export default function HelpSearchBox({
  defaultValue = "",
  placeholder = "Busca artículos y mucho más",
  onSubmitNavigate = (q) =>
    (window.location.href = `/admin/help/search?q=${encodeURIComponent(q)}`),
  fullWidth = true,
}) {
  const [q, setQ] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sug, setSug] = useState({ faqs: [], tutorials: [] });
  const debounced = useDebounce();

  const fetchSuggest = async (term) => {
    if (!term || term.trim().length < 2) {
      setOpen(false);
      setSug({ faqs: [], tutorials: [] });
      return;
    }
    setLoading(true);
    try {
      const [fs, ts] = await Promise.all([
        listFaqs({ q: term, limit: 5, isActive: 1, visibility: "public" }),
        listTutorials({ q: term, limit: 5, visibility: "public" }),
      ]);
      setSug({ faqs: fs?.items || [], tutorials: ts?.items || [] });
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    const v = e.target.value;
    setQ(v);
    debounced(fetchSuggest, 250)(v);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const term = q.trim();
    if (term.length >= 2) onSubmitNavigate(term);
  };

  return (
    <Box
      sx={{
        width: fullWidth ? "100%" : 680,
        maxWidth: 680,
        position: "relative",
      }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <Input
          value={q}
          onChange={onChange}
          onFocus={() => setOpen((q?.length ?? 0) >= 2)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          size="lg"
          placeholder={placeholder}
          startDecorator={<SearchRoundedIcon />}
          sx={{
            "--Input-radius": "999px",
            "--Input-minHeight": "56px",
            flex: 1,
            bgcolor: "background.body",
          }}
        />
        <Button
          type="submit"
          size="lg"
          sx={{ borderRadius: "999px", px: 2.5, minWidth: 56 }}>
          <SearchRoundedIcon />
        </Button>
      </form>

      {open && (
        <Sheet
          variant="outlined"
          sx={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            borderRadius: "lg",
            p: 0,
            zIndex: 1200,
            bgcolor: "background.body",
            boxShadow: "lg",
          }}>
          <Box
            sx={{
              px: 1.25,
              py: 1,
              borderBottom: "1px solid",
              borderColor: "neutral.outlinedBorder",
            }}>
            <Typography level="body-sm" sx={{ fontWeight: 600 }}>
              Principales resultados
            </Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            {loading ? (
              <Stack spacing={1}>
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} level="body-sm" />
                ))}
              </Stack>
            ) : !sug.faqs.length && !sug.tutorials.length ? (
              <Typography level="body-sm" color="neutral">
                Sin coincidencias.
              </Typography>
            ) : (
              <List sx={{ py: 0 }}>
                {sug.faqs.map((f) => (
                  <ListItem key={`faq-${f.id}`} sx={{ py: 0 }}>
                    <ListItemButton
                      component="a"
                      href={`/admin/help/faqs/${encodeURIComponent(
                        f.slug || f.id
                      )}`}>
                      {f.question}
                    </ListItemButton>
                  </ListItem>
                ))}
                {sug.tutorials.map((t) => (
                  <ListItem key={`tut-${t.id}`} sx={{ py: 0 }}>
                    <ListItemButton
                      component="a"
                      href={`/admin/help/tutorials/${encodeURIComponent(
                        t.slug || t.id
                      )}`}>
                      {t.title}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Sheet>
      )}
    </Box>
  );
}
