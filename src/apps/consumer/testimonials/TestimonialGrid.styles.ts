import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

export const useTestimonialsGridStyles = makeStyles((theme: Theme) => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        flexGrow: 1,
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    float: {
        position: 'relative',
        marginLeft: '95%',
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
}));
