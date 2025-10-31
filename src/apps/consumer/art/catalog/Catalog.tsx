import { useState } from "react";
import FloatingAddButton from "@components/floatingAddButton";
import ArtsGrid from "@apps/consumer/art/components/ArtsGrid/ArtsGrid";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import ArtUploader from "@apps/artist/artUploader";
import Typography from "@mui/material/Typography";
import CreateService from "components/createService";
import Grid2 from "@mui/material/Grid";
import ScrollToTopButton from "@components/ScrollToTop";

export default function Catalog() {
  const [openArtFormDialog, setOpenArtFormDialog] = useState<boolean>(false);
  const [openServiceFormDialog, setOpenServiceFormDialog] =
    useState<boolean>(false);

  return (
    <>
      <Container
        component="main"
        maxWidth="xl"
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          flexGrow: 1,
          py: 3,
        }}
      >
        <CssBaseline />

        <Grid2
          container
          direction="column"
          alignItems="center"
          sx={{
            marginTop: "20px",
            width: "100%",
          }}
        >
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#404e5c" }}>
            <strong>Galería</strong>
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            sx={{ marginBottom: "20px" }}
          >
            Encuentra tu arte preferido. Ejemplo: escribe "playa" y toca la
            lupa.
          </Typography>
        </Grid2>

        <Grid2 container sx={{ width: "100%", mt: 2 }}>
          <ArtsGrid />
        </Grid2>

        {/* Art uploader */}
        {openArtFormDialog && (
          <ArtUploader
            openArtFormDialog={openArtFormDialog}
            setOpenArtFormDialog={setOpenArtFormDialog}
          />
        )}

        {/* Create Service Dialog */}
        {openServiceFormDialog && <CreateService />}
      </Container>
      <ScrollToTopButton />
    </>
  );
}
