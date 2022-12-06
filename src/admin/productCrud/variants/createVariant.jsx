import React from 'react';
import { useState, useEffect } from 'react';
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
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
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
    const [ image , setImage ] = useState(props.variant && props.variant.variantImage || []);
    const [ newFile, setNewFile ] =  useState();
    const [ videoUrl, setVideoUrl ] = useState('')
    const [ videoPreview, setVideoPreview ] = useState('')
    const [ loadeImage, setLoadImage ] = useState({ loader: [] }) //props.variant && props.variant.variantImage ||
    //Error states.
    const [errorMessage, setErrorMessage] = useState();
    const [open, setOpen] = useState(false);
      const [loadOpen, setLoadOpen] = useState(false);
    const [snackBarError, setSnackBarError] = useState(false);
    const [passwordError, setPasswordError] = useState();
    const [emailError, setEmailError] = useState();
    const [mustImage, setMustImages] = useState(false);

    useEffect(() => {
      image.map((url) => {
        url.type === 'images' ?
        loadeImage.loader.push(url.url)
        :
        setVideoUrl(url.url)
    })

  }, [])

    const handleClickOpen = () => {
          setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const convertToBase64 = (blob) => {
      return new Promise((resolve) => {
        var reader = new FileReader();
        reader.onload = function () {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    };

    const replaceImage = async (e, index) => {
      e.preventDefault();
      const file = e.target.files[0];
      const resizedString = await convertToBase64(file);
      loadeImage.loader[index] = resizedString;
      image[index] = file;
      setImage(image)
      setLoadImage({loader: loadeImage.loader})
    };

    const loadImage = async (e) => {
      e.preventDefault();
      if (loadeImage.loader.length >= 4 || image?.length >= 5) {
        setLoadOpen(true);
        setTimeout(() => {
          setLoadOpen(false);
        }, 3000);
      } else {
        const file = e.target.files[0];
        const resizedString = await convertToBase64(file);
        loadeImage.loader.push(resizedString);
        image.push(file);
        setImage(image)
        setLoadImage({loader: loadeImage.loader})
      }
    };

    const modifyString = (a, sti) => {
        const url = sti.split(' ')
        const width = sti.replace('560', '326').replace('315', '326');
        const previewMp4 = sti.replace('1350', '510').replace('494', '350');
        setVideoUrl(width)
        setVideoPreview(previewMp4)
        // const index = url[3].indexOf()
        // sti.replace(index, '?controls=0\"')
      //sti[79]
    }

    const insertVariants = (productData, variants)=> {
        let updatedVariants = productData;
        updatedVariants.variants = productData.variants.filter((v)=>{ if(v._id != props.variant._id) return v});
        variants._id = props.variant._id
        updatedVariants.variants.unshift(variants);

        return updatedVariants;
    }

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (image.length === 0) {
        setMustImages(true);
        setTimeout(() => {
          setMustImages(false);
        }, 3000);
      }else{
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
        let updatedWithVariants = {}

        if(props.variant) {
            updatedWithVariants = insertVariants(productData, variants);
        } else {
            productData.variants.unshift(variants);
            updatedWithVariants = productData;
        }

        formData.append('productActive', updatedWithVariants.active)
        formData.append('productCategory', updatedWithVariants.category)
        formData.append('productConsiderations', updatedWithVariants.considerations)
        formData.append('productDescription', updatedWithVariants.description)
        formData.append('productHasSpecialVar', updatedWithVariants.hasSpecialVar)
        formData.append('productName', updatedWithVariants.name)
        variants.attributes.map(obj => {
          if(obj.name){
          formData.append('attributesName', obj.name)
          }
          if(obj.value){
          formData.append('attributesValue', obj.value)
          }
        })
        updatedWithVariants.sources.images.map(img => formData.append('productImages', img.url))
        formData.append('variants', JSON.stringify(updatedWithVariants.variants))
        formData.append('productPublicPriceFrom', updatedWithVariants.publicPrice.from)
        formData.append('productPublicPriceTo', updatedWithVariants.publicPrice.to)
        formData.append('productPrixerPriceFrom', updatedWithVariants.prixerPrice.from)
        formData.append('productPrixerPriceTo', updatedWithVariants.prixerPrice.to)
        formData.append('variant_id', variants._id)
        formData.append('video', videoUrl)
        image.map(file => {
          if(file.url === undefined){
              formData.append('variantImage', file)
          }
          if(typeof file.url === 'string'){
            formData.append('images', file.url)
          }
        })
        formData.append('variantActive', variants.active)
        formData.append('variantName', variants.name)
        formData.append('variantDescription', variants.description)
        formData.append('variantCategory', variants.category)
        formData.append('variantConsiderations', variants.considerations)
        formData.append('variantPublicPriceFrom', variants.publicPrice.from)
        formData.append('variantPublicPriceTo', variants.publicPrice.to)
        formData.append('variantPublicPriceEq', variants.publicPrice.equation)
        formData.append('variantPrixerPriceFrom', variants.prixerPrice.from)
        formData.append('variantPrixerPriceTo', variants.prixerPrice.to)
        formData.append('variantPrixerPriceEq', variants.prixerPrice.equation)
        const base_url= process.env.REACT_APP_BACKEND_URL + "/product/update/" + props.product._id;
        // await axios.put(base_url, formData)
        const response = await axios.put(base_url, formData)

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
                <Grid container spacing={2}>
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={4}
                    lg={4}
                    xl={4}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <FormControl variant="outlined">
                      <Button variant="contained" component="label">
                        Upload File
                        <input
                          name="productImages"
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={(a) => {
                            loadImage(a);
                          }}
                        />
                      </Button>
                          - O -
                      <Button variant="contained" componenet="label" onClick={handleClickOpen}>
                       Upload video
                      </Button>
                    </FormControl>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={8}
                    lg={8}
                    xl={8}
                    style={{ display: "flex" }}
                  >
                    {loadeImage.loader &&
                      loadeImage.loader.map((img, key_id) => {
                        return (
                          <div
                            style={{
                              width: "25%",
                              // maxHeight: "200px",
                              marginRight: "4px",
                            }}
                          >
                            <div
                              style={{
                                // marginBottom: "-32px",
                                textAlign: "right",
                              }}
                            >
                              <IconButton
                                variant="text"
                                className={classes.buttonImgLoader}
                                style={{ color: "#d33f49" }}
                                component="label"
                              >
                                <input
                                  name="productImages"
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={(a) => {
                                    const i = loadeImage.loader.indexOf(img);
                                    replaceImage(a, i);
                                  }}
                                />
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                variant="text"
                                className={classes.buttonImgLoader}
                                style={{ color: "#d33f49" }}
                                onClick={(d) => {
                                  loadeImage.loader.splice(key_id, 1);
                                  image.splice(key_id, 1);
                                    setImage(image)
                                    setLoadImage({loader: loadeImage.loader})
                                }}
                              >
                                <HighlightOffOutlinedIcon />
                              </IconButton>
                            </div>

                            <img
                              style={{
                                width: "100%",
                                // height: "200px",
                                objectFit: "contain",
                              }}
                              src={img}
                              alt="+"
                            />
                          </div>
                        );
                      })}
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
        <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Youtube Url</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Copia y pega la url que quieres mostrar en el carrusel de imagenes
          </DialogContentText>
          <div id='ll'>
          </div>
          <TextField
          onChange={(a)=>{
            const div = document.getElementById('ll');
            modifyString(a, a.target.value)
            div.innerHTML = videoPreview;
          }}
          value={videoUrl}
            autoFocus
            label="Url"
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleClose} color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
        <Snackbar
          open={snackBarError}
          autoHideDuration={1000}
          message={errorMessage}
          className={classes.snackbar}
        />
        <Snackbar
          open={loadOpen}
          autoHideDuration={1000}
          message={"No puedes colocar mas de 4 fotos"}
          className={classes.snackbar}
        />
        <Snackbar
          open={mustImage}
          autoHideDuration={1000}
          message={"No puedes actualizar un variant sin foto. Agrega 1 o mas"}
          className={classes.snackbar}
        />
    </React.Fragment>
  )
}
