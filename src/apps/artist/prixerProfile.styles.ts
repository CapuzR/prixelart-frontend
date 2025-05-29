import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        flexGrow: 1,
    },
    avatar: {
        margin: "8px",
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: "24px",
    },
    submit: {
        marginTop: '24px', 
        marginRight: '0px', 
        marginBottom: '16px',
        marginLeft: '0px',
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

export default useStyles;
