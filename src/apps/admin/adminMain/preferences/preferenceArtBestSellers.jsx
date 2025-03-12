import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Backdrop from '@mui/material/Backdrop';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import { makeStyles } from '@mui/styles';
import Snackbar from '@mui/material/Snackbar';
import { Typography, Checkbox } from '@mui/material';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryLabel, VictoryTheme } from 'victory';
import ArtGrid from '../../../consumer/art/components/ArtsGrid/ArtsGrid';
const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '100%',
      height: '100%',
    },
  },
  paper: {
    padding: theme.spacing(2),
    margin: 'auto',
    width: '100%',
  },
  snackbar: {
    [theme.breakpoints.down('xs')]: {
      bottom: 90,
    },
    margin: {
      margin: theme.spacing(1),
    },
    withoutLabel: {
      marginTop: theme.spacing(3),
    },
    textField: {
      width: '25ch',
    },
  },
}));

export default function ArtBestSellers(props) {
  const classes = useStyles();
  const [arts, setArts] = useState();
  const [loading, setLoading] = useState(false);
  const [bestSellers, setBestSellers] = useState();
  const [mostSellers, setMostSellers] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const addMostSellerToBestSeller = (selectedMostSeller) => {
    const artv1 = arts.find((art) => art.title === selectedMostSeller);
    if (bestSellers?.length === 0 || bestSellers === undefined) {
      setBestSellers([artv1]);
    } else if (bestSellers?.some((art) => art.title === selectedMostSeller)) {
      const withoutArt = bestSellers.filter((art) => art.title !== selectedMostSeller);
      setBestSellers(withoutArt);
      setSnackBarError(true);
      setErrorMessage('Arte eliminado del banner.');
    } else if (bestSellers.length === 9) {
      setSnackBarError(true);
      setErrorMessage('Has alcanzado el máximo de Artes a mostrar (9 artes).');
    } else {
      setBestSellers([...bestSellers, artv1]);
    }
  };
  const getAllArts = async () => {
    try {
      const base_url = import.meta.env.VITE_BACKEND_URL + '/art/read-all-v2';
      axios.get(base_url).then((response) => {
        setArts(response.data.arts);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getMostSellers = async () => {
    const url = import.meta.env.VITE_BACKEND_URL + '/art/bestSellers';
    try {
      const getArts = await axios.get(url);
      setMostSellers(getArts.data.ref);
    } catch (error) {
      console.log(error);
    }
  };

  const getBestSellers = async () => {
    const url = import.meta.env.VITE_BACKEND_URL + '/getArtBestSellers';
    try {
      const getArts = await axios.get(url);
      setBestSellers(getArts.data.arts);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    getAllArts();
    getMostSellers();
    getBestSellers();
    setLoading(false);
  }, []);

  const closeAd = () => {
    setSnackBarError(false);
  };

  const updateBestSellers = async () => {
    if (props.permissions.modifyArtBestSellers) {
      let data = [];
      bestSellers.map((prod) => {
        data.push(prod._id);
      });
      const base_url = import.meta.env.VITE_BACKEND_URL + '/updateArtBestSellers';
      await axios
        .put(base_url, {
          data: data,
          adminToken: localStorage.getItem('adminTokenV'),
        })
        .then((response) => {
          setSnackBarError(true);
          setErrorMessage(response.data.message);
        });
    } else {
      setSnackBarError(true);
      setErrorMessage('No tienes permiso para realizar acciones en esta área.');
    }
  };

  return (
    <div
      className={classes.root}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {mostSellers && (
        <div
          style={{
            width: '90%',
            height: 350,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid gainsboro',
            borderRadius: '10px',
            marginBottom: 10,
            paddingBottom: -10,
            alignSelf: 'center',
          }}
        >
          <Typography variant="h6" style={{ color: '#404e5c', marginTop: 30 }}>
            Artes más vendidos en el último año
          </Typography>
          <VictoryChart
            theme={VictoryTheme.material}
            padding={{ top: 20, bottom: 60, right: -100, left: -60 }}
            horizontal
          >
            <VictoryAxis />

            <VictoryAxis dependentAxis />
            <VictoryBar
              data={mostSellers}
              x="name"
              y="quantity"
              style={{
                data: { fill: '#d33f49', width: 25 },
              }}
              alignment="start"
              animate={{
                duration: 2000,
                onLoad: { duration: 1000 },
              }}
              labels={({ datum }) => datum.quantity}
              labelComponent={
                <VictoryLabel dx={-24} dy={-10} style={[{ fill: 'white', fontSize: 14 }]} />
              }
              events={[
                {
                  target: 'data',
                  eventHandlers: {
                    onClick: () => {
                      return [
                        {
                          target: 'data',
                          mutation: ({ datum }) => {
                            addMostSellerToBestSeller(datum.name);
                          },
                        },
                      ];
                    },
                  },
                },
              ]}
            />
          </VictoryChart>
        </div>
      )}
      <Paper
        className={classes.paper}
        style={{
          height: 160,
          width: '90%',
          backgroundColor: 'gainsboro',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
        elevation={3}
      >
        <Typography variant="h6" style={{ color: '#404e5c' }}>
          Banner de la pantalla principal
        </Typography>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {bestSellers !== undefined && bestSellers.length > 0 ? (
            bestSellers.map((art, i) => (
              <div>
                <div
                  key={i}
                  style={{
                    backgroundImage:
                      `url(${art.largeThumbUrl.replace(' ', '_')})` ||
                      `url(${art.thumbUrl.replace(' ', '_')})`,
                    width: 100,
                    height: 100,
                    backgroundSize: 'cover',
                    borderRadius: 10,
                    marginTop: 5,
                    marginRight: 10,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    addMostSellerToBestSeller(art.title);
                  }}
                />
                <div
                  style={{
                    color: '#404e5c',
                    display: 'flex',
                    justifyContent: 'center',
                    fontSize: 10,
                  }}
                >
                  {art.title.substring(0, 17)}
                </div>
              </div>
            ))
          ) : (
            <Typography
              variant="h4"
              style={{
                color: '#404e5c',
                textAlign: 'center',
              }}
              fontWeight="bold"
            >
              No tienes artes seleccionados aún
            </Typography>
          )}
        </div>
      </Paper>
      <Grid style={{ marginTop: 20 }}>
        <ArtGrid
          setSearchResult={props.setSearchResult}
          searchResult={props.searchResult}
          addMostSellerToBestSeller={addMostSellerToBestSeller}
        />
      </Grid>

      {props.permissions.modifyBestSellers && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              size="small"
              style={{ marginTop: 20 }}
              onClick={updateBestSellers}
            >
              Actualizar
            </Button>
          </div>
        </>
      )}
      <Snackbar
        open={snackBarError}
        autoHideDuration={3000}
        message={errorMessage}
        className={classes.snackbar}
        onClose={closeAd}
      />
    </div>
  );
}
