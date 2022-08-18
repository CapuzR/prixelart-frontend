import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import clsx from 'clsx';



import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import ViewListIcon from '@material-ui/icons/ViewList';
import CreateVariant from '../../productCrud/variants/createVariant';
// import UpdateVariant from '../../productCrud/variants/updateVariant';
// import DisableVariant from '../../productCrud/variants/disableVariant';
import ReadVariant from '../../productCrud/variants/readVariants';


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
      boxShadow: 'none',
      marginBottom: 10
    },
    fixedHeight: {
      height: 'auto',
    },
    fab: {
      right: 0,
      position: 'absolute'
    },
  }));

export default function Variants(props) {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [ variant, setVariant ] = useState('');

  const handleProductAction = (action)=> {
    if(action === 'read') {
      setVariant('');
      history.push({pathname:"/admin/product/"+props.product._id+"/variant/read"});
    } else {
      history.push({pathname:"/admin/product/"+props.product._id+"/variant/create"});
    }
  }

  useEffect(()=>{
    location.pathname.split('/').length === 9 ?
      props.setActiveVCrud(location.pathname.split('/')[location.pathname.split('/').length-4])
    : location.pathname.split('/').length === 8 ?
      props.setActiveVCrud(location.pathname.split('/')[location.pathname.split('/').length-2])
    : (location.pathname.split('/').length === 7 || location.pathname.split('/').length === 6) &&
      props.setActiveVCrud(location.pathname.split('/')[location.pathname.split('/').length-1])
  },[location.pathname, props]);
  
  return (
    <div style={{position:'relative'}}>
      <div style={{position:'absolute', right:0, top: -50}}>
        <Fab color="default" aria-label="edit" onClick={()=>{handleProductAction('read')}}>
          <ViewListIcon />
        </Fab>
        {
          !variant &&
          <Fab color="primary" aria-label="add" onClick={()=>{handleProductAction('create')}}>
            <AddIcon />
          </Fab>
        }
      </div>
      <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
              <Paper className={fixedHeightPaper}>
                {
                  props.activeVCrud === 'create' ?
                    <CreateVariant product={props.product} setVariant={setVariant}/>
                  : props.activeVCrud === 'read' ?
                    <ReadVariant product={props.product} setVariant={setVariant}/>
                  : props.activeVCrud === 'update' ?
                    <CreateVariant product={props.product} variant={variant} setVariant={setVariant}/>
                  :
                    <></>
                }
              </Paper>
          </Grid>
      </Grid>
    </div>
  );
}
    