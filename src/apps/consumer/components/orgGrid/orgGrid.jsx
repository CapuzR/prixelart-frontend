import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/styles';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
// import useMediaQuery from "@mui/material/useMediaQuery";
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import utils from 'utils/utils';
import Paper from '@mui/material/Paper';
import { Container, CssBaseline } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
    // maxWidth: "70%",
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    width: '100%',
    height: 'auto',
  },
  img: {
    width: '100%',
    height: '100%',
  },
  icon: {
    color: 'rgba(255, 255, 255, 0.54)',
  },
  cardGrid: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '81.25%',
    borderRadius: '50%',
    margin: '28px',
  },
  cardContent: {
    flexGrow: 1,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    flexGrow: 1,
    marginTop: 90,
  },
}));

export default function OrgGrid(props) {
  const theme = useTheme();
  const classes = useStyles();
  // const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  // const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));
  const [tiles, setTiles] = useState([]);
  const history = useHistory();
  const [backdrop, setBackdrop] = useState(true);

  useEffect(() => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/organization/read-all-full-v2';

    axios.get(base_url).then((response) => {
      setTiles(utils.shuffle(response.data.organizations));
      setBackdrop(false);
    });
  }, []);

  return (
    <>
      <Container component="main" maxWidth="s" className={classes.paper}>
        <CssBaseline />
        <div className={classes.root}>
          <Backdrop className={classes.backdrop} open={backdrop}>
            <CircularProgress color="inherit" />
          </Backdrop>
          {tiles.length > 0 && (
            <>
              <Grid style={{ justifyContent: 'center', display: 'flex' }}>
                <Typography variant="h4" style={{ color: '#404e5c' }} fontWeight="bold">
                  <strong>Organizaciones</strong>
                </Typography>
              </Grid>
              <Grid container spacing={2} style={{ padding: 10 }}>
                {tiles &&
                  tiles
                    .filter((tile) => tile.avatar) //quitar?
                    .map(
                      (tile) =>
                        tile.status && (
                          <Grid item key={tile._id} xs={12} sm={6} md={3}>
                            <Paper elevation={5} className={classes.card}>
                              <CardMedia
                                alt={tile.title}
                                height="100"
                                image={tile.avatar}
                                className={classes.cardMedia}
                                title={tile.title}
                              />
                              <CardContent className={classes.cardContent}>
                                <Typography gutterBottom variant="h5" component="h2">
                                  {tile.firstName} {tile.lastName}
                                </Typography>
                                <Typography
                                  gutterBottom
                                  variant="h6"
                                  component="h6"
                                  style={{ fontSize: 16 }}
                                >
                                  {tile.username} -
                                  {tile.specialty ||
                                    tile.specialtyArt?.map(
                                      (specialty, index) =>
                                        specialty !== '' &&
                                        (tile.specialtyArt?.length === index + 1
                                          ? specialty
                                          : `${specialty}, `)
                                    )}
                                </Typography>
                              </CardContent>
                              <CardActions>
                                <Button
                                  size="small"
                                  color="primary"
                                  onClick={(e) =>
                                    history.push({
                                      pathname: '/org=' + tile.username,
                                    })
                                  }
                                >
                                  Explorar
                                </Button>
                              </CardActions>
                            </Paper>
                          </Grid>
                        )
                    )}
              </Grid>
            </>
          )}
        </div>
      </Container>
    </>
  );
}
