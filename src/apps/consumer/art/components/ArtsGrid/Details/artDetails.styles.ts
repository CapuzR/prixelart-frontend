import { makeStyles, withStyles } from '@mui/styles';
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
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        maxWidth: 850,
        flexGrow: 1,
    },
    root: {
        width: '100vw',
    },
    float: {
        position: 'relative',
        marginLeft: '87%',
    },
    paper2: {
        position: 'absolute',
        width: '80%',
        maxHeight: 450,
        overflowY: 'auto',
        backgroundColor: 'white',
        boxShadow: theme.shadows[5],
        padding: '16px 32px 24px',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'justify',
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    snackbar: {
        bottom: 90,
        margin: theme.spacing(1),
        marginTop: theme.spacing(3),
        width: '25ch',
    },
    form: {
        height: 'auto',
    },
}));
