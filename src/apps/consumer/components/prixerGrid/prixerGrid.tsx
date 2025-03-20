import { useState, useEffect } from 'react';
import axios from 'axios';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Grid2 from '@mui/material/Grid2';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import utils from '../../../../utils/utils';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';
import useStyles from './prixerGrid.styles';

interface Tile {
  _id: string;
  avatar: string;
  title?: string;
  firstName: string;
  lastName: string;
  username: string;
  specialty?: string;
  specialtyArt?: string[];
  status?: boolean;
}

export default function PrixerGrid(): JSX.Element {
  const classes = useStyles();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const navigate = useNavigate();
  const [backdrop, setBackdrop] = useState(true);

  useEffect(() => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/prixer/read-all-full-v2';

    axios.get(base_url).then((response) => {
      setTiles(utils.shuffle(response.data.prixers));
      setBackdrop(false);
    });
  }, []);

  return (
    <div className={classes.root}>
      <Backdrop className={classes.backdrop} open={backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid2 container spacing={2} style={{ padding: 10 }}>
        {tiles &&
          tiles
            .filter((tile) => tile.avatar)
            .map(
              (tile) =>
                tile.status && (
                  <Grid2 key={tile._id} size={{ md: 5, sm: 6, xs: 12 }}>
                    <Paper elevation={5} className={classes.card}>
                      <CardMedia
                        image={tile.avatar}
                        className={classes.cardMedia}
                        title={tile.title || `${tile.firstName} ${tile.lastName}`}
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
                          {tile.username} -{' '}
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
                          onClick={() =>
                            navigate('/prixer=' + tile.username)
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
    </div>
  );
}