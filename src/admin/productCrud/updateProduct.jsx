import React from 'react';
import {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Title from '../adminMain/Title';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import clsx from 'clsx';
import Checkbox from '@material-ui/core/Checkbox';
import { useHistory } from 'react-router-dom';
import Variants from '../adminMain/products/variants';
import Backdrop from '@material-ui/core/Backdrop';

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  form: {
      height: 550
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function UpdateAdmin(props) {
    const classes = useStyles();
    const history = useHistory();
    const [ active, setActive ] = useState(props.product.active);
    const [ productName, setProductName ] = useState(props.product.name);
    const [ description, setDescription ] = useState(props.product.description);
    const [ category, setCategory ] = useState(props.product.category);
    const [ considerations, setConsiderations ] = useState(props.product.considerations);
    // const [fixedPublicPrice, setFixedPublicPrice] = useState('');
    const [fromPublicPrice, setFromPublicPrice] = useState(props.product.publicPrice.from);
    const [ toPublicPrice, setToPublicPrice ] = useState(props.product.publicPrice.to);
    // const [ fixedPrixerPrice, setFixedPrixerPrice ] = useState('');
    const [ fromPrixerPrice, setFromPrixerPrice ] = useState(props.product.prixerPrice.from);
    const [ toPrixerPrice, setToPrixerPrice ] = useState(props.product.prixerPrice.to);
    const [loading, setLoading] = useState(false);
    const [buttonState, setButtonState] = useState(false);
    const [showVariants, setShowVariants] = useState(false);
    const [ activeVCrud, setActiveVCrud ] = useState('read');
    const [ hasSpecialVar, setHasSpecialVar ] = useState(props.product.hasSpecialVar || false);
    
    const [ thumbUrl, setThumbUrl ] = useState(props.product.thumbUrl);

    //Error states.
    const [errorMessage, setErrorMessage] = useState();
    const [snackBarError, setSnackBarError] = useState(false);


    const handleSubmit = async (e)=> {
      e.preventDefault();
      if(!active && 
        !productName && 
        !description && 
        !category && 
        !considerations && 
        // !fixedPublicPrice &&
        !fromPublicPrice &&
        !toPublicPrice && 
        // !fixedPrixerPrice &&
        !fromPrixerPrice &&
        !toPrixerPrice &&
        !thumbUrl){
        setErrorMessage('Por favor completa todos los campos requeridos.');
        setSnackBarError(true);
        e.preventDefault();
      } else {
        setLoading(true);
        setButtonState(true);
        
        const data = {
            '_id': props.product._id,
            'thumbUrl': thumbUrl,
            'active' : active || false,
            'name' : productName,
            'description' : description,
            'category' : category,
            'considerations' : considerations,
            publicPrice: {
                'from': fromPublicPrice,
                'to': toPublicPrice,
            },
            prixerPrice: {
                'from': fromPrixerPrice,
                'to': toPrixerPrice,
            },
            hasSpecialVar: hasSpecialVar
        }
        
        const base_url= process.env.REACT_APP_BACKEND_URL + "/product/update";
        const response = await axios.post(base_url,data);
        if(response.data.success === false){
          setLoading(false);
          setButtonState(false);
          setErrorMessage(response.data.message);
          setSnackBarError(true);
        } else {
          setErrorMessage('Actualización de producto exitosa.');
          setSnackBarError(true);
          history.push('/admin/product/read');
        }
      }

    }

    const handleVariantsClick = ()=> {
        history.push({pathname:"/admin/product/"+props.product._id+"/variant/read"});
        setShowVariants(true); 
        props.setProductEdit(false);
    }

  return (
    <React.Fragment>
    {
        <Backdrop className={classes.backdrop} open={loading}>
            <CircularProgress />
        </Backdrop>
    }
        {
        showVariants ?
        <>
        <Grid container justify="left">
            <Grid item xs={2}>
                <button href="#" onClick={()=>{setShowVariants(false); props.setProductEdit(true);}}><h2 style={{color:"rgba(191, 191, 191, 0.5)", marginTop:0}}>Productos </h2></button>
            </Grid>
            <Grid item xs={1}>
                <button href="#" onClick={()=>{setShowVariants(true); setActiveVCrud('read');}}><h2 style={{color:'#d33f49', marginTop:0}}>Variantes</h2></button>
            </Grid>
        </Grid>
        <Variants product={props.product} activeVCrud={activeVCrud} setActiveVCrud={setActiveVCrud}/>
        </>
        :
        <div>
        <Grid container justify="left">
            <Grid item xs={2} style={{color:"rgba(191, 191, 191, 0.5)"}}>
                <Title>Productos </Title>
            </Grid>
            <Grid item xs={1}>
                <a onClick={handleVariantsClick}><h2 style={{color:"rgba(191, 191, 191, 0.5)", marginTop:0}}>Variantes</h2></a>
            </Grid>
        </Grid>
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <Grid container spacing={2}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                    <Grid item xs={12} md={6}>
                        <FormControl variant="outlined" xs={12} fullWidth={true}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            display="inline"
                            id="thumbUrl"
                            label="ThumbUrl"
                            name="thumbUrl"
                            autoComplete="thumbUrl"
                            value={thumbUrl}
                            onChange={(e) => {setThumbUrl(e.target.value);}}
                        />
                        </FormControl>
                    </Grid>
                    <Grid container xs={6}>
                      <Grid item xs={6}>
                          <Checkbox 
                              checked={active}
                              color="primary" 
                              inputProps={{ 'aria-label': 'secondary checkbox' }}
                              onChange={()=>{active?setActive(false):setActive(true)}}
                          /> Habilitado / Visible
                      </Grid>
                      <Grid item xs={6}>
                          <Checkbox
                              checked={hasSpecialVar}
                              color="primary" 
                              inputProps={{ 'aria-label': 'secondary checkbox' }}
                              onChange={()=>{hasSpecialVar?setHasSpecialVar(false):setHasSpecialVar(true)}}
                          /> ¿Tiene variables especiales?
                      </Grid>
                    </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl variant="outlined" xs={12} fullWidth={true}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            display="inline"
                            id="productName"
                            label="Nombre"
                            name="productName"
                            autoComplete="productName"
                            value={productName}
                            onChange={(e) => {setProductName(e.target.value);}}
                        />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                        <TextField
                            variant="outlined"
                            required
                            display="inline"
                            fullWidth
                            id="category"
                            label="Categoría"
                            name="category"
                            autoComplete="category"
                            value={category}
                            onChange={(e) => {setCategory(e.target.value);}}
                        />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                        <TextField
                            variant="outlined"
                            required
                            multiline
                            fullWidth
                            rows={2}
                            id="description"
                            label="Descripción"
                            name="description"
                            autoComplete="description"
                            value={description}
                            onChange={(e) => {setDescription(e.target.value);}}
                        />
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            multiline
                            rows={2}
                            id="considerations"
                            label="Consideraciones"
                            name="considerations"
                            autoComplete="considerations"
                            value={considerations}
                            onChange={(e) => {setConsiderations(e.target.value);}}
                        />
                        </FormControl>
                    </Grid>
                </Grid>
                <Grid container style={{marginTop: 20}}>
                    <Title>PVP</Title>
                </Grid>
                <Grid container spacing={2}>
                {/* <Grid item xs={4} md={4}>
                    <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="fixedPublicPrice"
                        label="Fijo"
                        name="fixedPublicPrice"
                        autoComplete="fixedPublicPrice"
                        value={fixedPublicPrice}
                        onChange={(e) => {setFixedPublicPrice(e.target.value);}}
                    />
                    </FormControl>
                </Grid> */}
                <Grid item xs={4} md={5}>
                    <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="fromPublicPrice"
                        label="Desde"
                        name="fromPublicPrice"
                        autoComplete="fromPublicPrice"
                        value={fromPublicPrice}
                        onChange={(e) => {setFromPublicPrice(e.target.value);}}
                    />
                    </FormControl>
                </Grid>
                <Grid item xs={4} md={5}>
                    <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="toPublicPrice"
                        label="Hasta"
                        name="toPublicPrice"
                        autoComplete="toPublicPrice"
                        value={toPublicPrice}
                        onChange={(e) => {setToPublicPrice(e.target.value);}}
                    />
                    </FormControl>
                </Grid>
                </Grid>
                <Grid container style={{marginTop: 20}}>
                    <Title>PVM</Title>
                </Grid>
                <Grid container spacing={2}>
                {/* <Grid item xs={4} md={4}>
                    <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="fixedPrixerPrice"
                        label="Fijo"
                        name="fixedPrixerPrice"
                        autoComplete="fixedPrixerPrice"
                        value={fixedPrixerPrice}
                        onChange={(e) => {setFixedPrixerPrice(e.target.value);}}
                    />
                    </FormControl>
                </Grid> */}
                <Grid item xs={4} md={5}>
                    <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="fromPrixerPrice"
                        label="Desde"
                        name="fromPrixerPrice"
                        autoComplete="fromPrixerPrice"
                        value={fromPrixerPrice}
                        onChange={(e) => {setFromPrixerPrice(e.target.value);}}
                    />
                    </FormControl>
                </Grid>
                <Grid item xs={4} md={5}>
                    <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                    <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="toPrixerPrice"
                        label="Hasta"
                        name="toPrixerPrice"
                        autoComplete="toPrixerPrice"
                        value={toPrixerPrice}
                        onChange={(e) => {setToPrixerPrice(e.target.value);}}
                    />
                    </FormControl>
                </Grid>
                </Grid>
              <Button variant="contained" color="primary" type="submit" disabled={buttonState} style={{ marginTop: 20}}>
                Actualizar
              </Button>
            </Grid>
        </form>
        </div>
        }
        <Snackbar
          open={snackBarError}
          autoHideDuration={1000}
          message={errorMessage}
          className={classes.snackbar}
        />
    </React.Fragment>
  );
}