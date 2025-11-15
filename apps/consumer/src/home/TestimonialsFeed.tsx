import React, { useState, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import CircularProgress from "@mui/material/CircularProgress";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { useTheme, Theme } from "@mui/material/styles"; // Added Theme type for better type safety

import { readAllTestimonial } from "@prixpon/api/testimonial.api"; // Ensure this path is correct
import { Testimonial } from "@prixpon/types/testimonial.types"; // Ensure this path is correct

// Define styles as objects to be used in sx prop
const styles = (theme: Theme) => ({
  // Using MUI Theme type
  testimonialSectionContainer: {
    padding: "40px 16px",
  },
  card: {
    padding: "24px",
    borderRadius: theme.shape.borderRadius * 2, // theme.shape.borderRadius can be kept or replaced if needed, e.g., '8px' if * 2 then '16px'
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    boxSizing: "border-box",
    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
    backgroundColor: theme.palette.background.paper,
    cursor: "default",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    },
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "20px",
  },
  avatar: {
    width: "56px",
    height: "56px",
    marginRight: "16px",
    border: `3px solid ${theme.palette.primary.light}`,
  },
  name: {
    fontWeight: 600,
    color: theme.palette.text.primary,
    lineHeight: 1.3,
  },
  type: {
    fontSize: "0.8rem",
    color: theme.palette.primary.main,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  quoteIconContainer: {
    textAlign: "left",
    marginBottom: "8px",
  },
  quoteIcon: {
    color: theme.palette.primary.main,
    fontSize: "2.8rem",
    opacity: 0.7,
  },
  testimonialValue: {
    fontStyle: "italic",
    color: theme.palette.text.secondary,
    flexGrow: 1,
    marginBottom: "20px",
    lineHeight: 1.7,
    fontSize: "1rem",
    userSelect: "none",
    "&::before": {
      content: '"“"',
      marginRight: "4px",
      fontWeight: "bold",
      color: theme.palette.text.disabled,
    },
    "&::after": {
      content: '"”"',
      marginLeft: "4px",
      fontWeight: "bold",
      color: theme.palette.text.disabled,
    },
  },
  footer: {
    fontSize: "0.75rem",
    color: theme.palette.text.disabled,
    textAlign: "right",
    marginTop: "auto",
    paddingTop: "8px",
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    padding: "24px",
  },
  emptyStateContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "50vh",
    padding: "24px",
    textAlign: "center",
  },
  masonryOuterContainer: {
    width: "100%",
  },
});

const TestimonialsFeed: React.FC = () => {
  const theme = useTheme();
  const componentStyles = styles(theme);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await readAllTestimonial();
        const activeTestimonials = data
          .filter((testimonial) => testimonial.status)
          .sort((a, b) => (a.position || 0) - (b.position || 0));
        setTestimonials(activeTestimonials);
      } catch (err) {
        console.error("Error al cargar testimonios:", err);
        setError(
          "¡Ups! No pudimos cargar los testimonios en este momento. Por favor, inténtalo de nuevo más tarde.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <Box sx={componentStyles.loadingContainer}>
        <CircularProgress />
        <Typography variant="h6" style={{ marginTop: "16px" }}>
          Cargando Testimonios...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={componentStyles.emptyStateContainer}>
        <Typography variant="h5" color="error" gutterBottom>
          Error
        </Typography>
        <Typography variant="body1">{error}</Typography>
      </Box>
    );
  }

  if (testimonials.length === 0) {
    return (
      <Box sx={componentStyles.emptyStateContainer}>
        <Typography variant="h6" gutterBottom>
          Aún no hay testimonios
        </Typography>
        <Typography variant="body1" color="textSecondary">
          ¡Vuelve pronto para ver lo que otros opinan!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={componentStyles.testimonialSectionContainer}>
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 750: 2, 1024: 3 }}
        style={componentStyles.masonryOuterContainer} // 'style' prop on ResponsiveMasonry
      >
        <Masonry gutter="24px">
          {" "}
          {/* gutter can remain a string if the library accepts it */}
          {testimonials.map((tile) => (
            <Paper
              key={tile._id?.toString()}
              sx={componentStyles.card}
              elevation={0}
            >
              <Box sx={componentStyles.header}>
                <Avatar
                  sx={componentStyles.avatar}
                  src={tile.avatar}
                  alt={`Avatar de ${tile.name}`}
                />
                <Box>
                  <Typography
                    variant="h6"
                    component="p"
                    sx={componentStyles.name}
                  >
                    {tile.name}
                  </Typography>
                  <Typography sx={componentStyles.type}>{tile.type}</Typography>
                </Box>
              </Box>

              <Box sx={componentStyles.quoteIconContainer}>
                <FormatQuoteIcon sx={componentStyles.quoteIcon} />
              </Box>

              <Typography variant="body1" sx={componentStyles.testimonialValue}>
                {tile.value}
              </Typography>

              {tile.footer && (
                <Typography component="p" sx={componentStyles.footer}>
                  {tile.footer}
                </Typography>
              )}
            </Paper>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </Box>
  );
};

export default TestimonialsFeed;
