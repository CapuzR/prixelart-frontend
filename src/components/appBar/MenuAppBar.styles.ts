import { makeStyles } from '@mui/styles';

const drawerWidth = 240;

const useStyles = makeStyles((theme: any) => ({
    root: {
        flexGrow: 1,
        zIndex: 10,
        minWidth: '100%',
        minHeight: '100%',
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    a: {
        textDecoration: 'none',
        color: '#fff',
        position: 'relative',
        borderRadius: '30%',
    },
    title: {
        flexGrow: 1,
    },
    menu: {
        display: 'flex',
        flexDirection: 'column',
    },
    button: {
        minWidth: '0px',
        color: 'white !important',
        '&.Mui-selected': {
            // color: 'red !important',
            fontWeight: 'bold'
        },
    },
    root2: {
        display: 'flex',
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    hide: {
        display: 'none',
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
        // height: "400px",
    },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0, 1),
        ...theme.mixins.toolbar,
        justifyContent: 'flex-end',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        marginLeft: -drawerWidth,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    },
    brillante: {
        width: 45,
        height: 45,
        borderRadius: '50%',
        // backgroundColor: "black",
        animation: '$animacion-brillo 2s infinite',
    },
    '@keyframes animacion-brillo': {
        '0%': {
            boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)',
        },
        '50%': {
            boxShadow: '0 0 0 20px rgba(255, 255, 255, 0)',
        },
        '100%': {
            boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)',
        },
    },
}));

export default useStyles;
