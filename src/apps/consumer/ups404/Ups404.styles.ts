import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles';

export const useUPS404Styles = makeStyles((theme: Theme) => ({
    iconTabs: {
        flexGrow: 1,
        maxWidth: 666,
        margin: 'auto',
        marginBottom: 50,
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'left',
        maxWidth: 850,
        flexGrow: 1,
        overflow: 'visible',
    },
    heroContent: {
        padding: theme.spacing(25, 0, 6),
        minHeight: '100vh',
    },
    card: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    footer: {
        backgroundColor: theme.palette.background.paper,
        padding: theme.spacing(6),
        position: 'relative',
        bottom: 0,
    },
}));
