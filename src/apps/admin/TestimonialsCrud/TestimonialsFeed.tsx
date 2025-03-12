import { useState, useEffect } from 'react';
import axios from 'axios';
import { makeStyles, useTheme } from '@mui/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

interface Testimonial {
  _id: string;
  avatar: string;
  name: string;
  type: string;
  value: string;
  footer: string;
  status: boolean;
  position: number;
}

const useStyles = makeStyles((theme: any) => ({
  cardMedia: {
    paddingTop: '81.25%',
    borderRadius: '50%',
    margin: '28px',
  },
  loading: {
    display: 'flex',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
    marginLeft: '50vw',
    marginTop: '50vh',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  paper: {
    padding: theme.spacing(2),
    margin: '15px',
  },
  input: {
    padding: '2',
  },
  title: {
    flexGrow: 1,
  },
  avatar: {
    width: 80,
    height: 80,
  },
}));

export default function TestimonialsFeed(): JSX.Element {
  const classes = useStyles();
  const [tiles, setTiles] = useState<Testimonial[]>([]);
  const theme = useTheme();

  const readTestimonial = async (): Promise<void> => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/testimonial/read-all';
    try {
      const response = await axios.get<{ testimonials: Testimonial[] }>(base_url);
      const sortedTestimonials = response.data.testimonials.sort(
        (a, b) => a.position - b.position
      );
      setTiles(sortedTestimonials);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    readTestimonial();
  }, []);

  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const ResponsiveMasonryAny: any = ResponsiveMasonry;
  const MasonryAny: any = Masonry;

  return (
    <Grid
      container
      spacing={2}
      xs={12}
      style={{
        width: '100%',
        padding: '18px',
      }}
    >
      <ResponsiveMasonryAny columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
        <MasonryAny style={{ columnGap: '7px' }}>
          {tiles.map(
            (tile) =>
              tile.status && (
                <Grid item key={tile._id}>
                  <Paper className={classes.paper}>
                    <Grid style={{ width: '100%' }}>
                      <Grid container spacing={1}>
                        <Grid marginBottom={2} style={{ width: '100%' }}>
                          <Box style={{ display: 'flex', paddingLeft: '20px' }}>
                            <Avatar className={classes.avatar} src={tile.avatar} />
                            <Box style={{ paddingLeft: '30px' }}>
                              <Typography>{tile.name}</Typography>
                              <Typography variant="body2" color="secondary">
                                {tile.type}
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              style={{
                                display: 'flex',
                                textAlign: 'center',
                                justifyContent: 'center',
                                paddingTop: '10px',
                              }}
                            >
                              {tile.value}
                            </Typography>
                          </Box>
                          <Box style={{ paddingTop: '8px' }}>
                            <Typography
                              variant="body2"
                              color="secondary"
                              style={{
                                display: 'flex',
                                textAlign: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {tile.footer}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )
          )}
        </MasonryAny>
      </ResponsiveMasonryAny>
    </Grid>
  );
}