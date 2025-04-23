import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

export const useStyles = makeStyles((theme: Theme) => ({
    loading: {
        display: 'flex',
        '& > * + *': {
            marginLeft: theme.spacing(2),
        },
        marginLeft: '50vw',
        marginTop: '50vh',
    },
    root: {
        flexGrow: 1,
        paddingTop: 73,
        width: '100%',
        display: 'grid',
    },
    paper: {
        padding: theme.spacing(2),
        margin: 'auto',
        maxWidth: 616,
    },
    image: {
        width: 128,
        height: 128,
    },
    snackbar: {
        [theme.breakpoints.down('xs')]: {
          bottom: 90,
        },
        '& .margin': {
          margin: theme.spacing(1),
        },
        '& .withoutLabel': {
          marginTop: theme.spacing(3),
        },
        '& .textField': {
          width: '25ch',
        },
      },      
    img: {
        margin: 'auto',
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
    },
    avatar: {
        display: 'flex',
        '& > *': {},
        objectFit: 'cover',
        backgroundColor: '#fff',
        width: '160px',
        height: '160px',
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: theme.palette.primary.main,
    },
}));
