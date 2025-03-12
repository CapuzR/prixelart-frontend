import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid2 from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import useStyles from './prixerService.styles';

const PrixersService: React.FC = () => {

  const classes = useStyles();

  return (
    <>
      <Container component="main" maxWidth="sm" className={classes.paper}>
        <CssBaseline />

        <Grid2 style={{ marginTop: 90, justifyContent: 'center', display: 'flex' }}>
          <Typography variant="h4" style={{ color: '#404e5c', marginBottom: 10 }} fontWeight="bold">
            <strong>Servicios</strong>
          </Typography>
        </Grid2>
        <Grid2>
          {/* <ServiceGrid permissions={props.permissions} /> */}
        </Grid2>
      </Container>
    </>
  );
}

export default PrixersService;