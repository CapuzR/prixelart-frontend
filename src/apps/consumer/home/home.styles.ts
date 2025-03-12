import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

const useStyles = makeStyles((theme: Theme) => ({
    iconTabs: {
        flexGrow: 1,
        maxWidth: 650,
        margin: 'auto',
        marginBottom: 30,
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        flexGrow: 1,
        padding: 0,
        maxWidth: '100%',
        width: '100%',
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
    icon: {
        marginRight: theme.spacing(2),
    },
    heroContent: {
        padding: theme.spacing(25, 0, 6),
        minHeight: '100vh',
    },
    heroButtons: {
        marginTop: theme.spacing(4),
    },
    cardGrid: {
        width: '100%',
        paddingTop: theme.spacing(4),
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    cardMedia: {
        paddingTop: '56.25%', // 16:9
    },
    cardContent: {
        flexGrow: 1,
    },
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
        position: 'relative',
        bottom: 0,
    },
    float: {
        position: 'relative',
        marginLeft: '95%',
    },
    CarouselContent: {
        width: '100%',
        heigh: '100%',
    },
    modal: {
        display: 'flex',
        padding: theme.spacing(1),
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        width: '80%',
        maxHeight: 450,
    },
}));

export default useStyles;
