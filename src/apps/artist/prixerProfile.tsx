import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingAddButton from '@components/floatingAddButton';
import CreateService from '@components/createService';
import UserData from './userData/userData';
// import PrixerOptions
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid2 from '@mui/material/Grid';
// import ArtUploader from 'components/artUploader/artUploader';
import { useTheme } from '@mui/styles';
import Biography from './prixerService/biography';
import useStyles from './prixerProfile.styles';
import { getUrlParams } from '@utils/util';
import ArtsGrid from '@apps/consumer/art/components/ArtsGrid/ArtsGrid';

const PrixerProfile: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const theme = useTheme();

  const globalParams = getUrlParams();
  const username: string | null = window.location.pathname.includes('org')
    ? globalParams.get('/org')
    : globalParams.get('/prixer');

  const [openArtFormDialog, setOpenArtFormDialog] = useState<boolean>(false);
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState<boolean>(false);
  const [openShoppingCart, setOpenShoppingCart] = useState<boolean>(false);
  const [selectedArt, setSelectedArt] = useState<any>(undefined);
  const [feed, setFeed] = useState<string>('Artes');
  const [createdService, setCreatedService] = useState<boolean>(false);

  const showPrixerGrid = () => {
    switch (feed) {
      case 'Settings':
        return <div></div>;
      case 'Artes':
        return (
          <ArtsGrid
          />
        );
        {/* YAVA
      case 'Servicios':
        return (
          <ServiceGrid
            prixerUsername={username || ''}
            createdService={createdService}
            setCreatedService={setCreatedService}
          />
        );
        */}
      case 'Bio':
        return <Biography prixerUsername={username || ''} />;
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="xl" className={classes.paper}>
      <CssBaseline />
      <UserData prixerUsername={username || ''} setFeed={setFeed} />
      {/* {feed !== 'Settings' && (
        <PrixerOptions prixerUsername={username || ''} feed={feed} setFeed={setFeed} />
      )} */}
      {showPrixerGrid()}
      {/* {openArtFormDialog && (
        <ArtUploader
          openArtFormDialog={openArtFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
        />
      )}

      {openServiceFormDialog && (
        <CreateService
          openArtFormDialog={openServiceFormDialog}
          setOpenServiceFormDialog={setOpenServiceFormDialog}
          setCreatedService={setCreatedService}
        />
      )}

      <Grid2 className={classes.float}>
        <FloatingAddButton
          setOpenServiceFormDialog={setOpenServiceFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
        />
      </Grid2> */}
    </Container>
  );
};

export default PrixerProfile;
