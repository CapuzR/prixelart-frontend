import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import axios from 'axios';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid2 from '@mui/material/Grid2';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import utils from 'utils/utils';
import Paper from '@mui/material/Paper';
import { Container, CssBaseline, Theme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useStyles from './orgGrid.styles';

interface Organization {
  _id: string;
  avatar?: string;
  title?: string;
  firstName: string;
  lastName: string;
  username: string;
  specialty?: string;
  specialtyArt?: string[];
  status: boolean;
}

const OrgGrid: React.FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [tiles, setTiles] = useState<Organization[]>([]);
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
      <Container component="main" maxWidth="sm" className={classes.paper}>
        <CssBaseline />
        <div className={classes.root}>
          <Backdrop className={classes.backdrop} open={backdrop}>
            <CircularProgress color="inherit" />
          </Backdrop>
          {tiles.length > 0 && (
            <>
              <Grid2 style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h4" style={{ color: '#404e5c' }} fontWeight="bold">
                  <strong>Organizaciones</strong>
                </Typography>

                <Grid2 container spacing={2} style={{ padding: 10 }}>
                  {tiles
                    .filter((tile) => tile.avatar)
                    .map(
                      (tile) =>
                        tile.status && (
                          <Grid2 key={tile._id} size={{ md: 12, sm: 6, xs: 4 }}>
                            <Paper elevation={5} className={classes.card}>
                              <CardMedia
                                image={tile.avatar}
                                className={classes.cardMedia}
                                title={tile.title}
                              />
                              <CardContent className={classes.cardContent}>
                                <Typography gutterBottom variant="h5" component="h2">
                                  {tile.firstName} {tile.lastName}
                                </Typography>
                                <Typography gutterBottom variant="h6" component="h6" style={{ fontSize: 16 }}>
                                  {tile.username} -{' '}
                                  {tile.specialty ||
                                    tile.specialtyArt?.map((specialty, index) =>
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
                                  onClick={() =>
                                    navigate('/org/' + tile.username)
                                  }
                                >
                                  Explorar
                                </Button>
                              </CardActions>
                            </Paper>
                          </Grid2>
                        )
                    )}
                </Grid2>
              </Grid2>
            </>
          )}
        </div>
      </Container>
    </>
  );
};

export default OrgGrid;