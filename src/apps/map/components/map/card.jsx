import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';

export function IconCard({ icon, openSelected, setOpenSelected, setSelectedIcon }) {
  const handleClose = () => {
    setOpenSelected(false);
    setSelectedIcon(undefined);
  };

  const isMobile = useMediaQuery('(max-width:1090px)');

  return (
    <>
      <Modal
        open={openSelected}
        onClose={handleClose}
        style={{
          position: 'absolute',
          width: isMobile ? '94%' : '30%',
          maxHeight: '80%',
          overflowY: 'auto',
          backgroundColor: 'white',
          top: '8%',
          left: isMobile ? '0%' : '68%',
          textAlign: 'justify',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'row',
          height: 'fit-content',
          margin: isMobile && 10,
        }}
      >
        <Card style={{ overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'end' }}>
            <IconButton size="small" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </div>
          <CardMedia
            component="img"
            sx={{ maxHeight: 200, margin: 'auto', objectFit: 'contain' }}
            image={icon?.src}
            title={icon?.name}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {icon?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {icon?.description}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Comparte</Button>
            <Button size="small" href={icon?.mapUrl} target="_blank">
              Ir a Maps
            </Button>
          </CardActions>
        </Card>
      </Modal>
      {openSelected === false && (
        <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
          <Card sx={{ maxWidth: 60 }}>
            {/* <CardMedia
            component="img"
            sx={{ maxHeight: 200, margin: "auto", objectFit: "contain" }}
            image={icon?.src}
            title={icon?.name}
          /> */}
            <CardContent>Selecciona un ícono</CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
