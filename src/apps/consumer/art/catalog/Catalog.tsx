import { useState } from 'react';
import FloatingAddButton from 'components/floatingAddButton/floatingAddButton';
import ArtsGrid from '@apps/consumer/art/components/ArtsGrid/ArtsGrid';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import useStyles from './Catalog.styles';
import ArtUploader from 'components/artUploader/artUploader';
import Typography from '@mui/material/Typography';
import CreateService from 'components/createService/createService';
import { Grid2 } from '@mui/material';

export default function Catalog() {
  const [openArtFormDialog, setOpenArtFormDialog] = useState<boolean>(false);
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState<boolean>(false);

  const classes = useStyles();

  return (
    <>
      <Container component="main" maxWidth="xl" className={classes.paper}>
        <CssBaseline />

        <Grid2
          style={{
            marginTop: 20,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="h4" style={{ color: '#404e5c' }} fontWeight="bold">
            <strong>Galería</strong>
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            style={{ marginBottom: 20 }}
          >
            Encuentra tu arte preferido. Ejemplo: escribe "playa" y toca la lupa.
          </Typography>
        </Grid2>

        <Grid2>
          <ArtsGrid />
        </Grid2>


        {/* Art uploader */}
        {openArtFormDialog && (
          <ArtUploader
            openArtFormDialog={openArtFormDialog}
            setOpenArtFormDialog={setOpenArtFormDialog}
          />
        )}

        {/* Services uploader */}
        {openServiceFormDialog && (
          <CreateService
            openArtFormDialog={openServiceFormDialog}
            setOpenServiceFormDialog={setOpenServiceFormDialog}
          />
        )}

        {/* Floating buttons */}
        <Grid2 className={classes.float}>
          <FloatingAddButton
            setOpenArtFormDialog={setOpenArtFormDialog}
            setOpenServiceFormDialog={setOpenServiceFormDialog}
          />
        </Grid2>
      </Container>
    </>
  );
}
