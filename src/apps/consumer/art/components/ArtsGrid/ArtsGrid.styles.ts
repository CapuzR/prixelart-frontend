import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        backgroundColor: theme.palette.background.paper,
        marginBottom: '15px',
    },
    img: {
        [theme.breakpoints.down('sm')]: {
            maxHeight: 180,
        },
        [theme.breakpoints.up('sm')]: {
            minHeight: 300,
            maxHeight: 300,
        },
        [theme.breakpoints.up('lg')]: {
            minWidth: 300,
        },
        [theme.breakpoints.up('xl')]: {
            minHeight: 450,
            maxHeight: 450,
        },
    },
    imagen: {
        objectFit: 'fill',
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: theme.palette.primary.main,
    },
}));

export default useStyles;
