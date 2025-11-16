import React, { useState, useEffect, useCallback, FormEvent } from "react";

import ReactMarkdown from "react-markdown";
import RemarkGfm from "remark-gfm";
import ReactMde from "react-mde";
import "react-mde/lib/styles/css/react-mde-all.css";

import { useSnackBar } from "@prixpon/context/GlobalContext";
import { TermsAndConditions } from "@prixpon/types/preference.types";

import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import Title from "@apps/admin/components/Title";
import { getTerms, updateTerms } from "@prixpon/api/preferences.api";

const ReadAndUpdateTerms: React.FC = () => {
  // --- Hooks ---
  const { showSnackBar } = useSnackBar();

  // --- State ---
  const [terms, setTerms] = useState<string>("");
  const [originalTerms, setOriginalTerms] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<"write" | "preview">("write");

  // --- Fetch Data ---
  const loadTerms = useCallback(
    async (showLoading = true) => {
      if (showLoading) setIsLoading(true);
      setErrorFetch(null);
      try {
        const response = (await getTerms()) as TermsAndConditions;
        const fetchedTerms = response?.termsAndConditions || "";
        setTerms(fetchedTerms);
        setOriginalTerms(fetchedTerms);
      } catch (err: any) {
        const message =
          err.message || "Error al cargar los Términos y Condiciones.";
        setErrorFetch(message);
        showSnackBar(message);
        console.error("Error fetching terms:", err);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [showSnackBar],
  );

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  const spanishL18n = {
    write: "Escribir",
    preview: "Vista Previa",
    uploadingImage: "Subiendo imagen...",
    pasteDropSelect: "Pegar, soltar o seleccionar imagen",
  };

  // --- Handlers ---
  const handleEditClick = () => {
    setOriginalTerms(terms);
    setIsEditing(true);
    setErrorSubmit(null);
    setSelectedTab("write");
  };

  const handleCancelClick = () => {
    setTerms(originalTerms);
    setIsEditing(false);
    setErrorSubmit(null);
  };

  const handleEditorChange = (value: string) => {
    setTerms(value);
    if (errorSubmit) setErrorSubmit(null);
  };

  // --- Validation ---
  const validateForm = (): boolean => {
    // Basic check: Ensure terms are not just whitespace
    // Markdown editors might insert default structures like "# "
    if (!terms.trim() || terms.trim() === "#") {
      const msg = "Los Términos y Condiciones no pueden estar vacíos.";
      setErrorSubmit(msg);
      showSnackBar(msg);
      return false;
    }
    setErrorSubmit(null);
    return true;
  };

  // --- Submission ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorSubmit(null);

    try {
      const payload: TermsAndConditions = { termsAndConditions: terms };
      console.log("Updating Terms (Markdown):", payload);
      const response = await updateTerms(payload);

      if (response) {
        showSnackBar("Términos y Condiciones actualizados exitosamente.");
        setOriginalTerms(terms);
        setIsEditing(false);
      } else {
        throw new Error("La API no confirmó la actualización.");
      }
    } catch (err: any) {
      console.error("Failed to update terms:", err);
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error al actualizar los Términos y Condiciones.";
      setErrorSubmit(message);
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Title title="Términos y Condiciones" />

      {/* Loading Indicator */}
      {isLoading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 3,
          }}
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Cargando...</Typography>
        </Box>
      )}

      {/* Fetch Error Display */}
      {errorFetch && !isLoading && (
        <Alert severity="error" sx={{ m: 2 }}>
          {errorFetch}
          <Button onClick={() => loadTerms()} size="small" sx={{ ml: 1 }}>
            Reintentar
          </Button>
        </Alert>
      )}

      {/* Content Area */}
      {!isLoading && !errorFetch && (
        <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
          {isEditing ? (
            // --- Edit Mode (with Markdown Editor) ---
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom>
                Editar Términos y Condiciones (Markdown)
              </Typography>

              {/* --- React Mde Component --- */}
              <Box
                sx={{
                  mb: 2,
                  ".react-mde .mde-header": { backgroundColor: "#f5f5f5" },
                }}
              >
                <ReactMde
                  value={terms}
                  onChange={handleEditorChange}
                  selectedTab={selectedTab}
                  onTabChange={setSelectedTab}
                  generateMarkdownPreview={(markdown) =>
                    Promise.resolve(
                      <ReactMarkdown remarkPlugins={[RemarkGfm]}>
                        {markdown}
                      </ReactMarkdown>,
                    )
                  }
                  readOnly={isSubmitting}
                  childProps={{
                    writeButton: {
                      tabIndex: -1,
                      disabled: isSubmitting,
                    },
                    textArea: {
                      disabled: isSubmitting,
                    },
                  }}
                  minEditorHeight={300}
                  heightUnits="px"
                  l18n={spanishL18n}
                />
              </Box>
              {/* Helper Text (Manual) */}
              <Typography
                variant="caption"
                display="block"
                sx={{
                  mb: 2,
                  color: errorSubmit ? "error.main" : "text.secondary",
                }}
              >
                {errorSubmit ||
                  "Ingrese los términos y condiciones usando Markdown."}
              </Typography>

              {/* Submission Error Alert */}
              {errorSubmit && !validateForm() && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorSubmit}
                </Alert>
              )}

              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancelClick}
                  disabled={isSubmitting}
                  startIcon={<CancelIcon />}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || !terms.trim()}
                  startIcon={
                    isSubmitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                >
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </Stack>
            </form>
          ) : (
            // --- Read Mode (with Markdown Rendering) ---
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Términos Actuales</Typography>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                >
                  Editar
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />

              {/* --- Markdown Display --- */}
              <Box
                sx={{
                  maxHeight: "60vh",
                  overflowY: "auto",
                  wordBreak: "break-word",
                  "& h1": { mb: 2, mt: 3, fontSize: "1.8rem" },
                  "& h2": { mb: 1.5, mt: 2.5, fontSize: "1.5rem" },
                  "& h3": { mb: 1, mt: 2, fontSize: "1.25rem" },
                  "& p": { mb: 1.5, lineHeight: 1.6 },
                  "& ul, & ol": { pl: 3, mb: 1.5 },
                  "& li": { mb: 0.5 },
                  "& strong": { fontWeight: "bold" },
                  "& em": { fontStyle: "italic" },
                  "& blockquote": {
                    borderLeft: "4px solid #ccc",
                    pl: 2,
                    ml: 0,
                    color: "#666",
                    fontStyle: "italic",
                  },
                  "& code": {
                    backgroundColor: "#f5f5f5",
                    p: "2px 4px",
                    borderRadius: "3px",
                    fontFamily: "monospace",
                  },
                  "& pre > code": { display: "block", p: 1, overflowX: "auto" },
                  "& table": {
                    borderCollapse: "collapse",
                    width: "100%",
                    mb: 2,
                  },
                  "& th, & td": {
                    border: "1px solid #ddd",
                    p: 1,
                    textAlign: "left",
                  },
                  "& th": { backgroundColor: "#f2f2f2", fontWeight: "bold" },
                  "& a": { color: "primary.main", textDecoration: "underline" },
                }}
              >
                {terms && terms.trim() ? (
                  <ReactMarkdown remarkPlugins={[RemarkGfm]}>
                    {terms}
                  </ReactMarkdown>
                ) : (
                  <Typography
                    sx={{ fontStyle: "italic", color: "text.secondary" }}
                  >
                    No hay términos y condiciones definidos.
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Paper>
      )}
    </>
  );
};

export default ReadAndUpdateTerms;
