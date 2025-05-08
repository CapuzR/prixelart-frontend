import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material';

export const useStyles = makeStyles((theme: any) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
        // marginBottom: "20px",
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
            // minHeight: 300,
            // maxHeight: 450,
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
    paper: {
        padding: "8px",
        // margin: "auto",
    },
    paper2: {
        position: 'absolute',
        width: '80%',
        maxHeight: '90%',
        overflowY: 'auto',
        backgroundColor: 'white',
        boxShadow: theme.shadows[2],
        padding: '16px 32px 24px',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'justify',
        minWidth: 320,
        borderRadius: 10,
        marginTop: '12px',
        display: 'flex',
        flexDirection: 'row',
    },
    padding: {
        padding: 0,
    },
    textField: {
        width: '25ch',
    },
    form: {
        width: '40%',
        marginTop: 10,
    },
    buttonImgLoader: {
        cursor: 'pointer',
        padding: '5px',
        color: '#d33f49',
    },
    buttonEdit: {
        cursor: 'pointer',
        padding: '5px',
    },
}));