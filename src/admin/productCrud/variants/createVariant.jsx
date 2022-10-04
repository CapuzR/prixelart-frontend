import React from 'react';
import {useState} from 'react';
import { useHistory } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import Title from '../../adminMain/Title';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import HighlightOffOutlinedIcon from "@material-ui/icons/HighlightOffOutlined";
import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import clsx from 'clsx';
import Checkbox from '@material-ui/core/Checkbox';
import { nanoid } from 'nanoid';

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function CreateVariant(props) {
    const classes = useStyles();
    const [ active, setActive ] = useState(props.variant && props.variant.active || false);
    const [ attributes, setAttributes ] = useState(props.variant && props.variant.attributes || [{ name:'', value:''}]);
    const [ buttonAttState, setButtonAttState] = useState();
    const [ variantName, setVariantName ] = useState(props.variant && props.variant.name || '');
    const [ description, setDescription ] = useState(props.variant && props.variant.description || '');
    const [ category, setCategory ] = useState(props.variant && props.variant.category || '');
    const [ considerations, setConsiderations ] = useState(props.variant && props.variant.considerations || '');
    const [publicPriceEq, setPublicPriceEq] = useState(props.variant && props.variant.publicPrice.equation || '');
    const [fromPublicPrice, setFromPublicPrice] = useState(props.variant && props.variant.publicPrice.from || '');
    const [ toPublicPrice, setToPublicPrice ] = useState(props.variant && props.variant.publicPrice.to || '');
    const [ prixerPriceEq, setPrixerPriceEq ] = useState(props.variant && props.variant.prixerPrice.equation || '');
    const [ fromPrixerPrice, setFromPrixerPrice ] = useState(props.variant && props.variant.prixerPrice.from || '');
    const [ toPrixerPrice, setToPrixerPrice ] = useState(props.variant && props.variant.prixerPrice.to || '');
    const [loading, setLoading] = useState(false);
    const [buttonState, setButtonState] = useState(false);
    const history = useHistory();

    const [ image , setImage ] = useState(props.variant && props.variant.images || '');
    const [ loadeImage, setLoadImage ] = useState()
    //Error states.
    const [errorMessage, setErrorMessage] = useState();
    const [snackBarError, setSnackBarError] = useState(false);
    const [passwordError, setPasswordError] = useState();
    const [emailError, setEmailError] = useState();

    const convertToBase64 = (blob) => {
      return new Promise((resolve) => {
        var reader = new FileReader();
        reader.onload = function () {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    };

    const loadImage = async (a) => {
      const file = a.target.files[0];
      const resizedString = await convertToBase64(file);
      setLoadImage(resizedString);
      setImage(file)
    }

    const insertVariants = (productData, variants)=> {
        let updatedVariants = productData;
        updatedVariants.variants = productData.variants.filter((v)=>{ if(v._id != props.variant._id) return v});
        variants._id = props.variant._id
        updatedVariants.variants.unshift(variants);

        return updatedVariants;
    }

console.log(image)
console.log(loadeImage)

    const handleSubmit = async (e)=> {
      e.preventDefault();
      if(!active &&
        !variantName &&
        !description &&
        !category &&
        !considerations &&
        !publicPriceEq &&
        !fromPublicPrice &&
        !toPublicPrice &&
        !prixerPriceEq &&
        !fromPrixerPrice &&
        !toPrixerPrice &&
        !image){
        setErrorMessage('Por favor completa todos los campos requeridos.');
        setSnackBarError(true);
        e.preventDefault();
      } else {
        setLoading(true);
        setButtonState(true);

        const productData = props.product;
        const formData = new FormData();
        const variants = {
            '_id': props.variant && props.variant._id || nanoid(),
            'image': image,
            'active' : active,
            'name' : variantName,
            'description' : description,
            'category' : category,
            'considerations' : considerations,
            publicPrice: {
                'from': fromPublicPrice,
                'to': toPublicPrice,
                'equation': publicPriceEq
            },
            prixerPrice: {
                'from': fromPrixerPrice,
                'to': toPrixerPrice,
                'equation': prixerPriceEq
            }
        }

        variants.attributes ?
            variants.attributes.push(...attributes)
        : variants.attributes = attributes;
        let updatedWithVariants = {};

        if(props.variant) {
            updatedWithVariants = insertVariants(productData, variants);
        } else {
            productData.variants.unshift(variants);
            updatedWithVariants = productData;
        }

        formData.append('_id', variants._id)
        formData.append('variantImage', variants.image)
        formData.append('active', variants.active)
        formData.append('name', variants.name)
        formData.append('description', variants.description)
        formData.append('category', variants.category)
        formData.append('considerations', variants.considerations)
        formData.append('publicPriceFrom', variants.publicPrice.from)
        formData.append('publicPriceTo', variants.publicPrice.to)
        formData.append('publicPriceEq', variants.publicPrice.equation)
        formData.append('prixerPriceFrom', variants.prixerPrice.from)
        formData.append('prixerPriceTo', variants.prixerPrice.to)
        formData.append('prixerPriceEq', variants.prixerPrice.equation)
        const base_url= process.env.REACT_APP_BACKEND_URL + "/product/create/variant/" + props.product._id;
        await axios.put(base_url, formData)
        const response = await axios.put(base_url, updatedWithVariants)

        if(response.data.success === false){
          setLoading(false);
          setButtonState(false);
          setErrorMessage(response.data.message);
          setSnackBarError(true);
          props.setVariant('');
        } else {
          setErrorMessage('Actualización de producto exitoso.');
          setSnackBarError(true);
          setActive('');
          setImage('');
          setVariantName('');
          setDescription('');
          setCategory('');
          setConsiderations('');
          setPublicPriceEq('');
          setFromPublicPrice('');
          setToPublicPrice('');
          setPrixerPriceEq('');
          setFromPrixerPrice('');
          setToPrixerPrice('');
          props.setVariant('');
          setLoading(false);
          history.push({pathname:"/admin/product/read"});
        }
      }

    }

  return (
    <React.Fragment>
    {
    <Backdrop className={classes.backdrop} open={loading}>
      <CircularProgress color="inherit" />
    </Backdrop>
    }
      <Title>Variantes</Title>
        <form noValidate encType="multipart/form-data" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                    <Grid item xs={12} md={6}>
                        <FormControl variant="outlined" xs={12} fullWidth={true} >
                        <Button variant="contained" component="label">
                          Upload File
                          <input
                            name="variantImage"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(a) => {
                              a.preventDefault();
                              loadImage(a);
                            }}
                          />
                        </Button>
                        </FormControl>
                        {
                          image ? (
                            <Grid item xs={12}>
                            <img style={{width: '100%', marginTop: '10px'}} src={loadeImage} alt="variantImage" />
                            </Grid>
                          )
                          :
                          ''
                        }
                    </Grid>
                        <Checkbox
                            checked={active}
                            color="primary"
                            inputProps={{ 'aria-label': 'secondary checkbox' }}
                            onChange={()=>{active?setActive(false):setActive(true)}}
                        /> Habilitado / Visible
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl variant="outlined" xs={12} fullWidth={true}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            display="inline"
                            id="variantName"
                            label="Nombre"
                            name="variantName"
                            autoComplete="variantName"
                            value={variantName}
                            onChange={(e) => {setVariantName(e.target.value);}}
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
                    <h3>Precios Público</h3>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                        <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            id="publicPriceEquation"
                            label="Ecuación"
                            name="publicPriceEquation"
                            autoComplete="publicPriceEquation"
                            value={publicPriceEq}
                            onChange={(e) => {setPublicPriceEq(e.target.value);}}
                        />
                        </FormControl>
                    </Grid>
                    <Grid container xs={12} md={12} spacing={2} style={{margin:0}}>
                        <Grid item xs={6} md={6}>
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
                        <Grid item xs={6} md={6}>
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
                </Grid>
                <Grid container style={{marginTop: 20}}>
                    <h3>Precios Prixers</h3>
                </Grid>
                <Grid container spacing={2}>
                    <Grid item xs={4} md={4}>
                        <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            id="prixerPriceEq"
                            label="Ecuación"
                            name="prixerPriceEq"
                            autoComplete="prixerPriceEq"
                            value={prixerPriceEq}
                            onChange={(e) => {setPrixerPriceEq(e.target.value);}}
                        />
                        </FormControl>
                    </Grid>
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
                <Grid container xs={12} spacing={2}>
                    <Grid container style={{marginTop: 20}}>
                        <h3>Atributos</h3>
                    </Grid>
                        {
                        attributes &&
                            attributes.map((att, i)=>(
                            <Grid container spacing={2} xs={12} style={{marginBottom: 10}}>
                                <Grid item xs={12} md={5}>
                                    <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="attribute"
                                        label="Nombre"
                                        name="attribute"
                                        autoComplete="attribute"
                                        value={att.name}
                                        onChange={(e) => {
                                            setAttributes(attributes.slice(0,i).concat({'name': e.target.value, 'value': att.value}).concat(attributes.slice(i+1,)));
                                        }}
                                    />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} md={5}>
                                    <FormControl className={clsx(classes.margin, classes.textField)} variant="outlined" xs={12} fullWidth={true}>
                                    <TextField
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="attributeValue"
                                        label="Valor"
                                        name="attributeValue"
                                        autoComplete="attributeValue"
                                        value={att.value}
                                        onChange={(e) => {
                                            setAttributes(attributes.slice(0,i).concat({'name': att.name, 'value': e.target.value}).concat(attributes.slice(i+1,)));
                                        }}
                                    />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={2}>
                                <Button variant="contained" color="primary" onClick={()=>{ setAttributes(attributes.slice(0, i).concat(attributes.slice(i+1,)))}} disabled={buttonState} style={{ marginTop: 20}}>
                                    -
                                </Button>
                                </Grid>
                            </Grid>
                            ))
                        }
                    <Grid item xs={12} align="center">
                    <Button variant="contained" color="default" onClick={()=>{setAttributes(attributes.concat({ name:'', value:'' }))}} disabled={buttonState} style={{ marginTop: 20}}>
                        +
                    </Button>
                    </Grid>
                </Grid>
                <Button variant="contained" color="primary" type="submit" disabled={buttonState} style={{ marginTop: 20}}>
                    {props.variant && "Actualizar" || "Crear"}
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
