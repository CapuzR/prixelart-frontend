import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';



import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import ViewListIcon from '@material-ui/icons/ViewList';
import CreatePaymentMethod from '../../paymentMethodCrud/createPaymentMethod';
import UpdatePaymentMethod from '../../paymentMethodCrud/updatePaymentMethod';
// import DisablePaymentMethod from '../../paymentMethodCrud/disablePaymentMethod';
import ReadPaymentMethods from '../../paymentMethodCrud/readPaymentMethods';


const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    toolbar: {
      paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '0 8px',
      ...theme.mixins.toolbar,
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    menuButton: {
      marginRight: 36,
    },
    menuButtonHidden: {
      display: 'none',
    },
    title: {
      flexGrow: 1,
    },
    drawerPaper: {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    drawerPaperClose: {
      overflowX: 'hidden',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up('sm')]: {
        width: theme.spacing(9),
      },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
      flexGrow: 1,
      height: '100vh',
      overflow: 'auto',
    },
    container: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    paper: {
      padding: theme.spacing(2),
      display: 'flex',
      overflow: 'none',
      flexDirection: 'column',
    },
    fixedHeight: {
      height: 'auto',
      overflow: 'none'
    },
    fab: {
      right: 0,
      position: 'absolute'
    },
  }));

export default function PaymentMethods(props) {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [ activeCrud, setActiveCrud ] = useState('read');
  const [ paymentMethod, setPaymentMethod ] = useState();
  const [ paymentMethodEdit, setPaymentMethodEdit ] = useState(true);

  const handlePaymentMethodAction = (action)=> {
    history.push({pathname:"/admin/payment-method/"+action});
  }

  useEffect(()=>{
    location.pathname.split('/').length === 5 ?
      setActiveCrud(location.pathname.split('/')[location.pathname.split('/').length-2])
    : location.pathname.split('/').length === 4 &&
      setActiveCrud(location.pathname.split('/')[location.pathname.split('/').length-1])
  },[location.pathname]);

  return (
    <div style={{position:'relative'}}>
      {
        paymentMethodEdit &&
        <div style={{position:'absolute', right:0}}>
          <Fab color="default" aria-label="edit" onClick={()=>{handlePaymentMethodAction('read')}}>
            <ViewListIcon />
          </Fab>
          {/* <Fab color="secondary" aria-label="edit" onClick={()=>{handleUserAction('update')}}>
            <EditIcon />
          </Fab> */}
          <Fab color="primary" aria-label="add" onClick={()=>{handlePaymentMethodAction('create')}}>
            <AddIcon />
          </Fab>
        </div>
      }
      <Grid container spacing={3}>
          {/* Chart */}
          <Grid item xs={12} md={12} lg={12}>
              <Paper className={fixedHeightPaper}>
                {
                  activeCrud === 'create' ?
                    <CreatePaymentMethod />
                  : activeCrud === 'read' ?
                    <ReadPaymentMethods setPaymentMethod={setPaymentMethod}/>
                    :
                  // : activeCrud == 'update' ?
                    <div>
                      <UpdatePaymentMethod paymentMethod={paymentMethod} setPaymentMethodEdit={setPaymentMethodEdit}/>
                    </div>
                }
              </Paper>
          </Grid>
      </Grid>
    </div>
  );
}
    