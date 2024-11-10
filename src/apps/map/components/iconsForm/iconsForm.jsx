import * as React from 'react';
import { Grid, Paper, Button, Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';

export function IconsForm({ icons, setIcons }) {
  const [data, setData] = React.useState({
    name: '',
    description: '',
    src: '',
    originalCoordinates: {
      x: 0,
      y: 0,
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(data);
    setIcons([...icons, data]);

    e.target.reset();
    setData({
      name: '',
      description: '',
      src: '',
      originalCoordinates: {
        x: 0,
        y: 0,
      },
    });
  };

  const handleInputChange = (e) => {
    if (e.target.id === 'x' || e.target.id === 'y') {
      setData({
        ...data,
        originalCoordinates: {
          ...data.originalCoordinates,
          [e.target.id]: e.target.value,
        },
      });
    } else {
      setData({
        ...data,
        [e.target.id]: e.target.value,
      });
    }
  };

  return (
    <>
      <Paper style={{ padding: '8%', width: '80%' }} elevation={1}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={5}>
            <Grid item xs={12}>
              <Typography variant="h5" sx={{ color: 'black', paddingBottom: 3 }}>
                Incluye íconos en LPG
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                id="name"
                label="Nombre"
                variant="filled"
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="description"
                label="Descripción"
                variant="filled"
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="src"
                label="URL"
                variant="filled"
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField id="x" label="Posición X" variant="filled" onChange={handleInputChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField id="y" label="Posición Y" variant="filled" onChange={handleInputChange} />
            </Grid>
            <Grid item xs={12}>
              <Button
                id="button"
                variant="contained"
                type="submit"
                sx={{ backgroundColor: '#f3a89e' }}
              >
                Agregar
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </>
  );
}
