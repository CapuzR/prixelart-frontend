import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';
import orderServices from './orderServices';


import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import ViewListIcon from '@material-ui/icons/ViewList';
import CreateOrder from '../../orderCrud/createOrder/createOrder';
import UpdateOrder from '../../orderCrud/updateOrder';
// import DisableOrder from '../../orderCrud/disableOrder';
// import ReadOrders from '../../orderCrud/readOrders';


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

function Orders(props) {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [ activeCrud, setActiveCrud ] = useState('read');
  const [ orderEdit, setOrderEdit ] = useState(true);


  const [ orderState, setOrderState ] = useState();

  useEffect(()=> {
    init();
  }, []);

  useEffect(()=> {

    location.pathname.split('/').length === 5 ?
      setActiveCrud(location.pathname.split('/')[location.pathname.split('/').length-2])
    : location.pathname.split('/').length === 4 &&
      setActiveCrud(location.pathname.split('/')[location.pathname.split('/').length-1])

  },[location.pathname]);


  return (
    <div style={{position:'relative'}}>
      {
        orderState &&
        <>
      {
        orderEdit &&
        <div style={{position:'absolute', right:0}}>
          <Fab color="default" aria-label="edit" onClick={()=>{handleOrderAction('read')}}>
            <ViewListIcon />
          </Fab>
          {/* <Fab color="secondary" aria-label="edit" onClick={()=>{handleUserAction('update')}}>
            <EditIcon />
          </Fab> */}
          <Fab color="primary" aria-label="add" onClick={()=>{handleOrderAction('create')}}>
            <AddIcon />
          </Fab>
        </div>
      }
      <Grid container spacing={3}>
          {/* Chart */}
          <Grid item xs={12} md={12} lg={12}>
              <Paper elevation={4} className={fixedHeightPaper}>
                {
                  activeCrud === 'create' ?
                  <CreateOrder orderState={orderState} setOrderState={setOrderState} setOrderEdit={setOrderEdit}/>
                  : activeCrud === 'read' ?
                  <CreateOrder orderState={orderState} setOrderState={setOrderState} setOrderEdit={setOrderEdit}/>
                  // : activeCrud == 'update' ?
                  :
                  <div>
                    <UpdateOrder order={orderState} setOrderEdit={setOrderEdit}/>
                  </div>
                }
              </Paper>
          </Grid>
      </Grid>
      </>
    }
    </div>
  );

  async function init() {
    const state = await orderServices.init();
    setOrderState(state);
  };

  function handleOrderAction(action) {
    history.push({pathname:"/admin/payment-method/"+action});
  };
};


export default Orders;
    