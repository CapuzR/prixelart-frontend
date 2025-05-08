import { Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
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
        paddingTop: "32px",
        paddingBottom: "64px",
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
        height: '100'
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

export default useStyles;
