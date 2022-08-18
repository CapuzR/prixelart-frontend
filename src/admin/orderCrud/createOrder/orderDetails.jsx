/* eslint no-eval: 0 */
import React from 'react';
import { useState, useEffect } from 'react';
// import { useHistory } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import Title from '../../adminMain/Title';
import axios from 'axios';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
// import Backdrop from '@material-ui/core/Backdrop';
// import CircularProgress from '@material-ui/core/CircularProgress';
// import IconButton from '@material-ui/core/IconButton';
// import OutlinedInput from '@material-ui/core/OutlinedInput';
import InputLabel from '@material-ui/core/InputLabel';
// import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
// import Visibility from '@material-ui/icons/Visibility';
// import VisibilityOff from '@material-ui/icons/VisibilityOff';
import clsx from 'clsx';
// import Checkbox from '@material-ui/core/Checkbox';
// import { nanoid } from 'nanoid';
import Paper from '@material-ui/core/Paper';
import { setProductAtts, getEquation } from '../../../products/services.js';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Autocomplete from '@material-ui/lab/Autocomplete';
import orderServices from '../../adminMain/orders/orderServices';

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  paper: {
    marginTop: 50,
    padding: theme.spacing(2),
    borderTopColor: "rgba(102,102,102, 1)",
    display: 'flex',
    overflow: 'none',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 'auto',
    overflow: 'none'
  },
}));

export default function OrderDetails(props) {
    const classes = useStyles();

    useEffect(()=> {
        async function onChangeOrderDetails(key, value) {
            const state = await orderServices.updateSelectedOrder({ orderState: props.orderState, key: key, value: value  });
          props.setOrderState(state);
        };

        async function initDetailInfo() {
          const base_url= process.env.REACT_APP_BACKEND_URL + "/product/read-all";
          axios.get(base_url)
          .then(async (response) =>{
              let productsAttTemp1 = response.data.products
              await productsAttTemp1.map(async (p, iProd, pArr)=>{
                  productsAttTemp1 = await getEquation(p, iProd, pArr);
              });
      
              onChangeOrderDetails('products', productsAttTemp1);
          });
        }
        initDetailInfo();
      }, [props]);

      const searchArt = async (searchValue)=> {
        const artBase_url= process.env.REACT_APP_BACKEND_URL + "/art/read-by-query";
        const params = {
            text: searchValue
        }
        const response = await axios.get(artBase_url, {params});
        if(response.data) {
            return response.data.arts;
        } else {
            return { result: false, message: "No arts" };
        }
      }
      
    // const [prodTiles, setProdTiles] = useState();
    // const [artTiles, setArtTiles] = useState();
    // const [prixer, setPrixer] = useState();
    // const [artImage, setArtImage] = useState();
    // const [ width, setWidth ] = useState([]);
    // const [ height, setHeight ] = useState([]);
    const [ open, setOpen ] = useState([false]);
    // const [load, setLoad] = useState(false);
    // const [ art, setArt ] = useState([]);
    // const [ props.selectedProduct, props.setSelectedProduct ] = useState(
    //     [
    //         {
    //             art: {
    //                 'artId': '',
    //                 'title': '',
    //                 'prixerUsername': '',
    //                 'userId': '',
    //             },
    //             base: {
    //                 'thumbUrl': '',
    //                 'active' : true,
    //                 'name' : '',
    //                 'description' : '',
    //                 'category' : '',
    //                 'considerations' : '',
    //                 publicPrice: {
    //                     'from': '',
    //                     'to': '',
    //                 },
    //                 prixerPrice: {
    //                     'from': '',
    //                     'to': '',
    //                 },
    //                 hasSpecialVar: ''
    //             }
    //         }
    //     ]
    // );

    // const [ active, setActive ] = useState(props.variant && props.variant.active || false);
    // const [ attributes, setAttributes ] = useState(props.variant && props.variant.attributes || [{ name:'', value:''}]);
    // const [ variantName, setVariantName ] = useState(props.variant && props.variant.name || '');
    // const [ description, setDescription ] = useState(props.variant && props.variant.description || '');
    // const [ category, setCategory ] = useState(props.variant && props.variant.category || '');
    // const [ considerations, setConsiderations ] = useState(props.variant && props.variant.considerations || '');
    // const [publicPriceEq, setPublicPriceEq] = useState(props.variant && props.variant.publicPrice.equation || '');
    // const [fromPublicPrice, setFromPublicPrice] = useState(props.variant && props.variant.publicPrice.from || '');
    // const [ toPublicPrice, setToPublicPrice ] = useState(props.variant && props.variant.publicPrice.to || '');
    // const [ prixerPriceEq, setPrixerPriceEq ] = useState(props.variant && props.variant.prixerPrice.equation || '');
    // const [ fromPrixerPrice, setFromPrixerPrice ] = useState(props.variant && props.variant.prixerPrice.from || '');
    // const [ toPrixerPrice, setToPrixerPrice ] = useState(props.variant && props.variant.prixerPrice.to || '');
    // const [loading, setLoading] = useState(false);
    // const [buttonState, setButtonState] = useState(false);
    // const [ typedArt, setTypedArt ] = useState('');
    // const history = useHistory();
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

    // const [ thumbUrl, setThumbUrl ] = useState(props.variant && props.variant.thumbUrl || '');

    //Error states.
    // const [errorMessage, setErrorMessage] = useState();
    // const [snackBarError, setSnackBarError] = useState(false);

    // const insertVariants = (productData, variants)=> {
    //     let updatedVariants = productData;
    //     updatedVariants.variants = productData.variants.filter((v)=>{ if(v._id != props.variant._id) return v});
    //     variants._id = props.variant._id
    //     updatedVariants.variants.unshift(variants);

    //     return updatedVariants;
    // }

    // const handleSubmit = async (e)=> {
    //   e.preventDefault();
    //   if(!active && 
    //     !variantName && 
    //     !description && 
    //     !category && 
    //     !considerations && 
    //     !publicPriceEq &&
    //     !fromPublicPrice &&
    //     !toPublicPrice && 
    //     !prixerPriceEq &&
    //     !fromPrixerPrice &&
    //     !toPrixerPrice &&
    //     !thumbUrl){
    //     setErrorMessage('Por favor completa todos los campos requeridos.');
    //     setSnackBarError(true);
    //     e.preventDefault();
    //   } else {
    //     setLoading(true);
    //     setButtonState(true);

    //     const productData = props.product;

    //     const variants = {
    //         '_id': props.variant && props.variant._id || nanoid(),
    //         'thumbUrl': thumbUrl,
    //         'active' : active,
    //         'name' : variantName,
    //         'description' : description,
    //         'category' : category,
    //         'considerations' : considerations,
    //         publicPrice: {
    //             'from': fromPublicPrice,
    //             'to': toPublicPrice,
    //             'equation': publicPriceEq
    //         },
    //         prixerPrice: {
    //             'from': fromPrixerPrice,
    //             'to': toPrixerPrice,
    //             'equation': prixerPriceEq
    //         }
    //     }

    //     variants.attributes ?
    //         variants.attributes.push(...attributes)
    //     : variants.attributes = attributes;
    //     let updatedWithVariants = {};
        
    //     if(props.variant) {
    //         updatedWithVariants = insertVariants(productData, variants);
    //     } else {
    //         productData.variants.unshift(variants);
    //         updatedWithVariants = productData;
    //     }
        
    //     const base_url= process.env.REACT_APP_BACKEND_URL + "/product/update";
    //     const response = await axios.post(base_url,updatedWithVariants)

    //     if(response.data.success === false){
    //       setLoading(false);
    //       setButtonState(false);
    //       setErrorMessage(response.data.message);
    //       setSnackBarError(true);
    //       props.setVariant('');
    //     } else {
    //       setErrorMessage('Actualización de producto exitoso.');
    //       setSnackBarError(true);
    //       setActive('');
    //       setThumbUrl('');
    //       setVariantName('');
    //       setDescription('');
    //       setCategory('');
    //       setConsiderations('');
    //       setPublicPriceEq('');
    //       setFromPublicPrice('');
    //       setToPublicPrice('');
    //       setPrixerPriceEq('');
    //       setFromPrixerPrice('');
    //       setToPrixerPrice('');
    //       props.setVariant('');
    //       setLoading(false);
    //       history.push({pathname:"/admin/product/read"});
    //     }
    //   }

    // }

  return (
    <React.Fragment>
    {/* {
    <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
    </Backdrop>
    } */}
        <form noValidate 
        // onSubmit={handleSubmit} 
        style={{minWidth: "100%"}}> 
            <Grid container spacing={2} xs={12}>
                <Grid container xs={12} spacing={2} style={{padding:5}}>
                    {
                    // (props.selectedProduct.length != 0 && 
                    // props.selectedProduct != 'undefined') &&
                    // props.selectedProduct.base != 'undefined' &&
                    // props.selectedProduct.art != 'undefined' &&


                    props.orderState.selectedOrder.prix.map((prod, iPrix, pArr)=>(
                        <Paper elevation={3} className={fixedHeightPaper} style={{minWidth: "100%"}} >
                        <Grid container xs={12}>
                        <Grid container xs={11}>
                            <Grid container spacing={2} xs={12} style={{marginBottom: 10, marginTop: 10}}>
                                <Grid xs={12}><Title>Producto {iPrix+1}</Title></Grid>
                                <Grid item xs={12} sm={12} md={4}>
                                    <FormControl variant="outlined" style={{minWidth: "100%"}}>
                                        <InputLabel required>Productos</InputLabel>
                                        <Select
                                        labelId="artTypeLabel"
                                        id="artType"
                                        autoHighlight
                                        value={prod.product.name || ''}
                                        getOptionLabel={
                                           (option) => {
                                             if(typeof option === 'string') {
                                              return option;
                                             } else {
                                               return "";
                                             }
                                            }
                                        }
                                        onChange={
                                            (e)=>{
                                                    const temp = props.orderState.selectedOrder
                                                    temp.prix[iPrix].product = props.orderState.selectedOrder.products.filter(n=> n.name === e.target.value);
                                                    onChangePrixDetails('product',[...temp.prix[iPrix].product], iPrix);
                                            }
                                        } 
                                        label={prod.product.name || ''}
                                        >
                                        {
                                        props.orderState.selectedOrder.products &&
                                        props.orderState.selectedOrder.products.map((n, i, pArr) => (
                                                            <MenuItem key={i} value={n.name}>
                                                            <Paper elevation={3} style={{minWidth: "100%"}} >
                                                                <Grid container spacing={2}  xs={12}>
                                                                    <Grid item xs={4} style={{padding:15}}>
                                                                        <img alt="img-thumb" style={{maxWidth: "100%"}} src={n.thumbUrl}/>
                                                                    </Grid>
                                                                    <Grid container xs={8}
                                                                        spacing={0}
                                                                        direction="column"
                                                                        alignItems="center"
                                                                        justify="center">
                                                                        {n.name}
                                                                        </Grid>
                                                                    </Grid>
                                                                </Paper>
                                                            </MenuItem>
                                            ))
                                        }
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item spacing={2} xs={12} md={6}>
                                <Grid container spacing={2} xs={12} md={12}>
                                    {
                                    prod.product.attributes && prod.product.attributes[0] && eval(prod.product.attributes[0]).length !== 0 &&
                                    eval(prod.product.attributes[0]).map((att,iAtt, attributesArr) => (
                                    <Grid item md={6/(attributesArr.length-1)} xs={12}>
                                        <FormControl variant="outlined" style={{minWidth: "100%"}}>
                                            
                                            <InputLabel required id="att.name">{att.name}</InputLabel>
                                            <Select
                                            labelId="artTypeLabel"
                                            id="artType"
                                            value={prod.product.selection && prod.product.selection[iAtt]}
                                            onChange={
                                                async (e)=>{
                                                    const pAtts = await setProductAtts(e.target.value, iPrix, iAtt, pArr, 0, 0);
                                                    if (pAtts) {
                                                        props.setSelectedProduct(pAtts.pAtt ? [...pAtts.pAtt] : [...pAtts.att]);
                                                    }
                                                }
                                            } 
                                            label={att.selection}
                                            >
                                            <MenuItem value="">
                                                <em></em>
                                            </MenuItem>
                                            {
                                            att.values &&
                                            att.values.map((n, i) => (
                                                <MenuItem key={n.name} value={n}>{n}</MenuItem>
                                            ))
                                            }
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    ))
                                    }
                                </Grid>
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} xs={12} style={{marginBottom: 10, marginTop: 10}}>
                            <Grid xs={12}><Title>Arte {iPrix+1}</Title></Grid>
                            <Grid item xs={12} md={12}>
                                <FormControl variant="outlined" style={{minWidth: "100%"}} xs={12} sm={12} md={12}>
                                    <Autocomplete
                                    id="asynchronous-demo"
                                    open={open[iPrix]}
                                    onOpen={() => {
                                        const temp = open;
                                        temp[iPrix] = true;
                                        setOpen(temp);
                                    }}
                                    onClose={() => {
                                        const temp = open;
                                        temp[iPrix] = false;
                                        setOpen(temp);
                                    }}
                                    value={props.orderState.selectedOrder.prix[iPrix].art}
                                    options={props.orderState.selectedOrder.prix[iPrix].arts}
                                    getOptionLabel={
                                        (option) => {
                                            if(typeof option === 'object') {
                                                return option.title;
                                            } else {
                                                return "";
                                            }
                                        }
                                    }
                                    onChange={async (event, newInputValue) => {
                                        
                                        const temp = props.orderState.selectedOrder.prix[iPrix];
                                        temp.art = newInputValue;

                                        onChangePrixDetails('art', [newInputValue], iPrix);

                                    }}
                                    onInputChange={async (event, newInputValue) => {
                                        let temp = props.orderState.selectedOrder.prix[iPrix].arts;
                                        // let temp1 = props.orderState.selectedOrder.prix[iPrix].art;
                                        
                                        if(temp.length < iPrix) {
                                            temp.push(await searchArt(newInputValue));
                                        } else {
                                            temp[iPrix] = await searchArt(newInputValue);
                                        }
    
                                        // if(temp1.length < iPrix) {
                                        //     temp1.push(temp[iPrix]);
                                        //     // temp.push(await searchArt(newInputValue));
                                        // } else {
                                        //     temp1[iPrix] = temp[iPrix];
                                        //     // temp[iPrix] = await searchArt(newInputValue);
                                        // }
    
                                        onChangePrixDetails('arts', temp, iPrix);
                                        // onChangePrixDetails('art', temp1);
                                        // props.setOptions(temp);
                                        // props.setSelectedArt(temp1);
                                    }}
                                    renderOption={(option) => (
                                      <React.Fragment>
                                        <Paper elevation={3} style={{minWidth: "100%"}} >
                                          <Grid container spacing={2}  xs={12}>
                                            <Grid item xs={12} md={4}>
                                                <img alt="thumb" style={{maxWidth: "100%"}} src={option.smallThumbUrl}/>
                                            </Grid>
                                            <Grid container xs={12} md={8}
                                                spacing={0}
                                                style={{minHeight:30, margin:0, padding: 0}}
                                                direction="column"
                                                alignItems="center"
                                                justify="center">
                                                <Typography variant="h3" style={{fontSize:"65%", wordWrap: "break-word"}}>{option.artId} | {option.title} - {option.prixerUsername}</Typography>
                                            </Grid>
                                          </Grid>
                                        </Paper>
                                      </React.Fragment>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                        {...params}
                                        label="Arte"
                                        variant="outlined"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                            <React.Fragment>
                                                {/* {loading ? <CircularProgress color="inherit" size={20} /> : null} */}
                                                {params.InputProps.endAdornment}
                                            </React.Fragment>
                                            ),
                                        }}
                                        />
                                    )}
                                    />
                                </FormControl>
                                </Grid>
                            </Grid>
                            <Grid>
                                {/* <Typography>{getPVP(props.order.selectedOrder.prix)}</Typography> */}
                            </Grid>
                            </Grid>
                            <Grid container xs={12} md={1}>
                                <Button variant="contained" color="primary" align="right" onClick={()=>{ props.setSelectedProduct(props.selectedProduct.slice(0, iPrix).concat(props.selectedProduct.slice(iPrix+1,)))}} 
                                > 
                                {/* disabled={buttonState}> */}
                                    -
                                </Button>
                            </Grid>
                            </Grid>
                        </Paper>
                            ))
                    
                    // props.selectedProduct.map((prod, iProd, pArr)=>(
                    // <Paper elevation={3} className={fixedHeightPaper} style={{minWidth: "100%"}} >
                    // <Grid container xs={12}>
                    // <Grid container xs={11}>
                    //     <Grid container spacing={2} xs={12} style={{marginBottom: 10, marginTop: 10}}>
                    //         <Grid xs={12}><Title>Producto {iProd+1}</Title></Grid>
                    //         <Grid item xs={12} sm={12} md={4}>
                    //             <FormControl variant="outlined" style={{minWidth: "100%"}}>
                    //                 <InputLabel required>Productos</InputLabel>
                    //                 <Select
                    //                 labelId="artTypeLabel"
                    //                 id="artType"
                    //                 autoHighlight
                    //                 value={prod.base.name}
                    //                 onChange={
                    //                     (e)=>{
                    //                             const sel = props.selectedProduct;
                    //                             const temp = prodTiles.filter(n=> n.name == e.target.value);
                    //                                 sel[iProd].base = temp[0];
                    //                             props.setSelectedProduct([...sel]);
                    //                     }
                    //                 } 
                    //                 label={prod.base.name}
                    //                 >
                    //                 {
                    //                 prodTiles &&
                    //                     prodTiles.map((n, i, pArr) => (
                    //                                     <MenuItem key={i} value={n.name}>
                    //                                     <Paper elevation={3} style={{minWidth: "100%"}} >
                    //                                         <Grid container spacing={2}  xs={12}>
                    //                                             <Grid item xs={4} style={{padding:15}}>
                    //                                                 <img style={{maxWidth: "100%"}} src={n.thumbUrl}/>
                    //                                             </Grid>
                    //                                             <Grid container xs={8}
                    //                                                 spacing={0}
                    //                                                 direction="column"
                    //                                                 alignItems="center"
                    //                                                 justify="center">
                    //                                                 {n.name}
                    //                                                 </Grid>
                    //                                             </Grid>
                    //                                         </Paper>
                    //                                     </MenuItem>
                    //                     ))
                    //                 }
                    //                 </Select>
                    //             </FormControl>
                    //         </Grid>
                    //         <Grid item spacing={2} xs={12} md={6}>
                    //         <Grid container spacing={2} xs={12} md={12}>
                    //             {
                    //             prod.base.attributes && prod.base.attributes.length != 0 &&
                    //             prod.base.attributes.map((att,iAtt, attributesArr) => (
                    //             <Grid item md={6/(attributesArr.length-1)} xs={12}>
                    //                 <FormControl variant="outlined" style={{minWidth: "100%"}}>
                                        
                    //                     <InputLabel required id="att.name">{att.name}</InputLabel>
                    //                     <Select
                    //                     labelId="artTypeLabel"
                    //                     id="artType"
                    //                     value={prod.base.selection && prod.base.selection[iAtt]}
                    //                     onChange={
                    //                         async (e)=>{
                    //                             const pAtts = await setProductAtts(e.target.value, iProd, iAtt, pArr, width, height);
                    //                             if (pAtts) {
                    //                                 props.setSelectedProduct(pAtts.pAtt ? [...pAtts.pAtt] : [...pAtts.att]);
                    //                             }
                    //                         }
                    //                     } 
                    //                     label={att.selection}
                    //                     >
                    //                     <MenuItem value="">
                    //                         <em></em>
                    //                     </MenuItem>
                    //                     {
                    //                     att.value &&
                    //                     att.value.map((n, i) => (
                    //                         <MenuItem key={n.name} value={n}>{n}</MenuItem>
                    //                     ))
                    //                     }
                    //                     </Select>
                    //                 </FormControl>
                    //             </Grid>
                    //             ))
                    //             }
                    //         </Grid>
                    //         </Grid>
                    //     </Grid>
                    //     <Grid container spacing={2} xs={12} style={{marginBottom: 10, marginTop: 10}}>
                    //     <Grid xs={12}><Title>Arte {iProd+1}</Title></Grid>
                    //     <Grid item xs={12} md={12}>
                    //         <FormControl variant="outlined" style={{minWidth: "100%"}} xs={12} sm={12} md={12}>
                    //             <Autocomplete
                    //             id="asynchronous-demo"
                    //             open={open[iProd]}
                    //             onOpen={() => {
                    //                 const temp = open;
                    //                 temp[iProd] = true;
                    //                 setOpen(temp);
                    //             }}
                    //             onClose={() => {
                    //                 const temp = open;
                    //                 temp[iProd] = false;
                    //                 setOpen(temp);
                    //             }}
                    //             value={props.selectedArt[iProd]}
                    //             options={props.options[iProd]}
                    //             getOptionLabel={
                    //                (option) => {
                    //                     return option.title;
                    //                 }
                    //             }
                    //             onChange={async (event, newInputValue) => {
                    //                 let temp = props.selectedArt;
                                    
                    //                 if(temp.length < iProd) {
                    //                     temp.push(newInputValue);
                    //                     // temp.push(await searchArt(newInputValue));
                    //                 } else {
                    //                     temp[iProd] = newInputValue;
                    //                     // temp[iProd] = await searchArt(newInputValue);
                    //                 }

                    //                 props.setSelectedArt(temp);
                    //             }}
                    //             onInputChange={async (event, newInputValue) => {
                    //                 setTypedArt(newInputValue);
                    //                 let temp = props.options;
                    //                     let temp1 = props.selectedArt;
                                    
                    //                 if(temp.length < iProd) {
                    //                     temp.push(await searchArt(newInputValue));
                    //                 } else {
                    //                     temp[iProd] = await searchArt(newInputValue);
                    //                 }

                    //                 if(temp1.length < iProd) {
                    //                     temp1.push(temp[iProd]);
                    //                     // temp.push(await searchArt(newInputValue));
                    //                 } else {
                    //                     temp1[iProd] = temp[iProd];
                    //                     // temp[iProd] = await searchArt(newInputValue);
                    //                 }

                    //                 props.setOptions(temp);
                    //                 props.setSelectedArt(temp1);
                    //             }}
                    //             renderOption={(option) => (
                    //               <React.Fragment>
                    //                 <Paper elevation={3} style={{minWidth: "100%"}} >
                    //                   <Grid container spacing={2}  xs={12}>
                    //                     <Grid item xs={12} md={4}>
                    //                         <img style={{maxWidth: "100%"}} src={option.smallThumbUrl}/>
                    //                     </Grid>
                    //                     <Grid container xs={12} md={8}
                    //                         spacing={0}
                    //                         style={{minHeight:30, margin:0, padding: 0}}
                    //                         direction="column"
                    //                         alignItems="center"
                    //                         justify="center">
                    //                         <Typography variant="h3" style={{fontSize:"65%", wordWrap: "break-word"}}>{option.artId} | {option.title} - {option.username}</Typography>
                    //                     </Grid>
                    //                   </Grid>
                    //                 </Paper>
                    //               </React.Fragment>
                    //             )}
                    //             renderInput={(params) => (
                    //                 <TextField
                    //                 {...params}
                    //                 label="Arte"
                    //                 variant="outlined"
                    //                 InputProps={{
                    //                     ...params.InputProps,
                    //                     endAdornment: (
                    //                     <React.Fragment>
                    //                         {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    //                         {params.InputProps.endAdornment}
                    //                     </React.Fragment>
                    //                     ),
                    //                 }}
                    //                 />
                    //             )}
                    //             />
                    //         </FormControl>
                    //         </Grid>
                    //     </Grid>
                    //     </Grid>
                    //     <Grid container xs={12} md={1}>
                    //         <Button variant="contained" color="primary" align="right" onClick={()=>{ props.setSelectedProduct(props.selectedProduct.slice(0, iProd).concat(props.selectedProduct.slice(iProd+1,)))}} disabled={buttonState}>
                    //             -
                    //         </Button>
                    //     </Grid>
                    //     </Grid>
                    // </Paper>
                    //     ))
                    }
                    <Grid item xs={12} align="center">
                    <Button variant="contained" color="default" onClick={()=>{

                        let temp = props.orderState.selectedOrder.prix;
                        
                        temp.push({
                            art: {
                                'artId': '',
                                'tittle': '',
                                'prixerUsername': '',
                                'userId': '',
                            },
                            product: {
                                'thumbUrl': '',
                                'active' : true,
                                'name' : '',
                                'description' : '',
                                'category' : '',
                                'considerations' : '',
                                publicPrice: {
                                    'from': '',
                                    'to': '',
                                },
                                prixerPrice: {
                                    'from': '',
                                    'to': '',
                                },
                                hasSpecialVar: ''
                            },
                            arts: []
                        }
                    );
                    props.setSelectedProduct([...temp]);
                    }} 
                    // disabled={buttonState} 
                    style={{ marginTop: 20}}>
                        +
                    </Button>
                    </Grid>
                </Grid>
            </Grid>
        </form>
        <Snackbar
        //   open={snackBarError}
          autoHideDuration={1000}
        //   message={errorMessage}
          className={classes.snackbar}
        />
    </React.Fragment>
  );

  async function onChangePrixDetails(key, value, iPrix) {
    const { prix } = await orderServices.updateSelectedPrix({ prix: props.orderState.selectedOrder.prix[iPrix], key: key, value: value  });
    const state = await orderServices.updateSelectedOrder({ orderState: props.orderState, key: 'prix', value: [prix]  });
    props.setOrderState(state);
  };

}