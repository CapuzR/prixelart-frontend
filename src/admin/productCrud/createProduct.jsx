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
// import IconButton from '@material-ui/core/IconButton';
// import OutlinedInput from '@material-ui/core/OutlinedInput';
// import InputLabel from '@material-ui/core/InputLabel';
// import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
// import Visibility from '@material-ui/icons/Visibility';
// import VisibilityOff from '@material-ui/icons/VisibilityOff';
import clsx from 'clsx';
// import validations from '../../utils/validations';
import Checkbox from '@material-ui/core/Checkbox';
import Backdrop from '@material-ui/core/Backdrop';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function CreateProduct() {
    const classes = useStyles();
    const [ active, setActive ] = useState(false);
    const [ productName, setProductName ] = useState('');
    const [ description, setDescription ] = useState('');
    const [ category, setCategory ] = useState('');
    const [ considerations, setConsiderations ] = useState('');
    // const [fixedPublicPrice, setFixedPublicPrice] = useState('');
    const [fromPublicPrice, setFromPublicPrice] = useState('');
    const [ toPublicPrice, setToPublicPrice ] = useState('');
    // const [ fixedPrixerPrice, setFixedPrixerPrice ] = useState('');
    const [ fromPrixerPrice, setFromPrixerPrice ] = useState('');
    const [ toPrixerPrice, setToPrixerPrice ] = useState('');
    const [loading, setLoading] = useState(false);
    const [buttonState, setButtonState] = useState(false);
    const [ hasSpecialVar, setHasSpecialVar ] = useState(false);
    const [ specialVars, setSpecialVars ] = useState(false);
    const history = useHistory();

    const [ thumbUrl, setThumbUrl ] = useState('');

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
            'thumbUrl': thumbUrl,
            'active' : active,
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
            hasSpecialVar: hasSpecialVar,
            specialVars: [
              {
                'name': '',
                'isSpecialVarVisible': ''
              }
            ]
        }
        
        const base_url= process.env.REACT_APP_BACKEND_URL + "/product/create";
        const response = await axios.post(base_url,data)
        if(response.data.success === false){
          setLoading(false);
          setButtonState(false);
          setErrorMessage(response.data.message);
          setSnackBarError(true);
        } else {
          setErrorMessage('Registro de producto exitoso.');
          setSnackBarError(true);
          setActive('');
          setThumbUrl('');
          setProductName('');
          setDescription('');
          setCategory('');
          setConsiderations('');
        //   setFixedPublicPrice('');
          setFromPublicPrice('');
          setToPublicPrice('');
        //   setFixedPrixerPrice('');
          setFromPrixerPrice('');
          setToPrixerPrice('');
          history.push('/admin/product/read');
        }
      }
    }

  return (
    <React.Fragment>
    {
        <Backdrop className={classes.backdrop} open={loading}>
            <CircularProgress />
        </Backdrop>
    }
      <Title>Productos</Title>
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
                    {
                    hasSpecialVar &&
                    <Grid container xs={12} spacing={2}>
                        <Grid container style={{marginTop: 20}}>
                            <h3>Variables especiales</h3>
                        </Grid>
                        <>
                        {   
                        specialVars &&
                            specialVars.map((specialVar, i)=>(
                            <Grid container spacing={2} xs={12} style={{marginBottom: 10}}>
                                <Grid item xs={12} md={5}>
                                    <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id={specialVar}
                                        label="Nombre"
                                        name="specialVar"
                                        autoComplete="specialVar"
                                        value={specialVar.name}
                                        onChange={(e) => {
                                            setSpecialVars(specialVar.slice(0,i).concat({'name': e.target.value, 'isSpecialVarVisible': specialVars.isSpecialVarVisible}).concat(specialVars.slice(i+1,)));
                                        }}
                                    />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={5}>
                                    <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                                    <Checkbox
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="isSpecialVarVisible"
                                        label="Visible"
                                        name="isSpecialVarVisible"
                                        autoComplete="isSpecialVarVisible"
                                        value={specialVar.isSpecialVarVisible}
                                        onChange={(e) => {
                                          setSpecialVars(specialVars.slice(0,i).concat({'name': specialVars.name, 'isSpecialVarVisible': e.target.value}).concat(specialVars.slice(i+1,)));
                                        }}
                                    />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={2}>
                                <Button variant="contained" color="primary" onClick={()=>{ setSpecialVars(specialVars.slice(0, i).concat(specialVars.slice(i+1,)))}} disabled={buttonState} style={{ marginTop: 20}}>
                                    -
                                </Button>
                                </Grid>
                            </Grid>
                            ))
                            }
                            <Button variant="contained" color="default" onClick={()=>{setSpecialVars(specialVars.concat({ name:'', isSpecialVarVisible:'' }))}} disabled={buttonState} style={{ marginTop: 20}}>
                                +
                            </Button>
                          </>
                    </Grid>
                    }
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
                Crear
              </Button>
            </Grid>
        </form>
        <Snackbar
          open={snackBarError}
          autoHideDuration={1000}
          message={errorMessage}
          className={classes.snackbar}
        />
    </React.Fragment>
  );
}