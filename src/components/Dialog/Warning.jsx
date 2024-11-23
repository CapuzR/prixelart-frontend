import {
  CardActionArea,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';

export default function DialogWarning({}) {
  return (
    <Dialog
      open={selectedLocalArt === tile.artId}
      onClose={handleCloseVisible}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{'¿Estás seguro de ocultar este arte?'}</DialogTitle>
      <DialogContent>
        <DialogContentText
          id="alert-dialog-description"
          style={{
            textAlign: 'center',
          }}
        >
          Este arte ya no será visible en tu perfil y la página de inicio.
        </DialogContentText>
      </DialogContent>
      <Grid
        item
        xs={12}
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <TextField
          style={{ width: '95%', marginBottom: '5px' }}
          fullWidth
          multiline
          required
          id="disabledReason"
          label="¿Por qué quieres ocultar este arte?"
          variant="outlined"
          onChange={(e) => {
            setDisabledReason(e.target.value);
          }}
        />
      </Grid>
      <DialogActions>
        <Button onClick={handleCloseVisible} color="primary">
          Cancelar
        </Button>
        <Button
          onClick={(e) => {
            hideArt(tile, e);
          }}
          background="primary"
          style={{
            color: 'white',
            backgroundColor: '#d33f49',
          }}
        >
          Aceptar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
