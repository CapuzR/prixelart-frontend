import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';
import AppBar from '../../sharedComponents/appBar/appBar';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import FloatingAddButton from '../../sharedComponents/floatingAddButton/floatingAddButton';
import ArtUploader from '../../sharedComponents/artUploader/artUploader';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import utils from '../../utils/utils';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Img from "react-cool-img";

const useStyles = makeStyles((theme)=> ({
  loading: {
    display: 'flex',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
    marginLeft: "50vw",
    marginTop: "50vh"
  },
  paper: {
    marginTop: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'left',
    maxWidth: 850,
    flexGrow:1
  },
  root: {
    width: '100vw'
  },
  float: {
    position:'relative',
    marginLeft:'87%'
  }
}));

const photoIsos = [
  '100',
  '200',
  '400'
]

export default function FullscreePhoto(props) {
  const classes = useStyles();
  const history = useHistory();
  const [ready, setReady] = useState(false);
  const [tiles, setTiles] = useState([]);
  const [updatedTile, setUpdatedTile] = useState([]);
  const [artDataState, setArtDataState] = useState();
  const [snackBar, setSnackBar] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState(false);
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);

const handleArtEdit = (e, tile)=> {
  if(artDataState===tile.artId) {
    setUpdatedTile(tile);
    setArtDataState('');
  } else {
    setArtDataState(tile.artId);
  } 
}

const handleArtDescriptionEdit = async (e, tile)=> {
  let tempTiles = tiles;
  let result = await descriptionEdit(tempTiles,tile, e);
  setTiles(result);
}

const handleArtTitleEdit = async (e, tile)=> {
  let tempTiles = tiles;
  let result = await titleEdit(tempTiles, tile, e);
  setTiles(result);
}

const handleOriginalPhotoHeight = async (e, tile)=> {
  let tempTiles = tiles;
  let result = await originalPhotoHeightEdit(tempTiles, tile, e);
  setTiles(result);
}

const handleOriginalPhotoWidth = async (e, tile)=> {
  let tempTiles = tiles;
  let result = await originalPhotoWidthEdit(tempTiles, tile, e);
  setTiles(result);
}

const handleOriginalPhotoPpi = async (e, tile)=> {
  let tempTiles = tiles;
  let result = await originalPhotoPpiEdit(tempTiles, tile, e);
  setTiles(result);
}

const handleOriginalPhotoIso = async (e, tile)=> {
  let tempTiles = tiles;
  let result = await originalPhotoIsoEdit(tempTiles, tile, e);
  setTiles(result);
}

const handleArtTagsEdit = async (e, tile, tags)=> {
  let tempTiles = tiles;
  let result = await tagsEdit(tempTiles, tile, e, tags);
  setTiles(result);
}

const handleArtLocationEdit = async (e, tile)=> {
  let tempTiles = tiles;
  let result = await locationEdit(tempTiles, tile, e);
  setTiles(result);
}

function tagsEdit(tempTiles, tile, e, tags) {
  return tempTiles.map((item) => {
    if (item.artId === tile.artId) {
      item.tags = tags
    }
    return item;
  });
}

function locationEdit(tempTiles, tile, e) {
  return tempTiles.map((item) => {
    if (item.artId === tile.artId) {
      item.artLocation = e.target.value
    }
    return item;
  });
}

function titleEdit(tempTiles, tile, e) {
  return tempTiles.map((item) => {
    if (item.artId === tile.artId) {
      item.title = e.target.value
    }
    return item;
  });
}

function originalPhotoHeightEdit(tempTiles, tile, e) {
  return tempTiles.map((item) => {
    if (item.artId === tile.artId) {
      item.originalPhotoHeight = e.target.value
    }
    return item;
  });
}

function originalPhotoWidthEdit(tempTiles, tile, e) {
  return tempTiles.map((item) => {
    if (item.artId === tile.artId) {
      item.originalPhotoWidth = e.target.value
    }
    return item;
  });
}

function originalPhotoPpiEdit(tempTiles, tile, e) {
  return tempTiles.map((item) => {
    if (item.artId === tile.artId) {
      item.originalPhotoPpi = e.target.value
    }
    return item;
  });
}

function originalPhotoIsoEdit(tempTiles, tile, e) {
  return tempTiles.map((item) => {
    if (item.artId === tile.artId) {
      item.originalPhotoIso = e.target.value
    }
    return item;
  });
}

function descriptionEdit(tempTiles, tile, e) {
  return tempTiles.map((item)=> {
    if(item.artId === tile.artId) {
      item.description = e.target.value;
    }
    return item;
  });
}

const maxPrintValues = (tile)=> {

  const [maxPrintWidthCm, maxPrintHeightCm] = 
    utils.maxPrintCalc(
      tile.originalPhotoWidth, 
      tile.originalPhotoHeight, 
      tile.originalPhotoPpi, 
      tile.originalPhotoIso
      );

  return maxPrintWidthCm + " x " + maxPrintHeightCm + " cm";
        
}

const navigateToPrixer = (e, prixerUsername)=> {
  // history.push({pathname:'/'+ prixerUsername});
}

// const copyCodeToClipboard = (e, tile) => {
//   const el = document.createElement('textarea');
//   el.value = utils.generateArtMessage(tile, 'copy');
//   document.body.appendChild(el);
//   el.select();
//   document.execCommand('copy');
//   document.body.removeChild(el);
// }
  
useEffect(()=> {
  if(tiles){
    const base_url= process.env.REACT_APP_BACKEND_URL + "/art/read-by-prixer";
    const data = {
      username: props.match.params.username
    }
    axios.post(base_url, data)
    .then(response =>{
      if(tiles.length !== response.data.arts.length) {
        setTiles(response.data.arts);
        setReady(true);
        if(document.getElementById(props.match.params.artId)) {
          document.getElementById(props.match.params.artId).scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
        } else {
          setSnackBarMessage('Arte no encontrado, por favor inténtalo de nuevo.');
          setSnackBar(true);
        }
      }
    });
  }
  }, []);

  useEffect(()=>{
    if(artDataState === '') {
      const base_url= process.env.REACT_APP_BACKEND_URL + "/art/update";
      const data= {
          'title': updatedTile.title,
          'description': updatedTile.description,
          'tags': updatedTile.tags,
          'imageUrl': updatedTile.imageUrl,
          'thumbnailUrl': updatedTile.thumbnailUrl,
          'userId': updatedTile.userId,
          'category': updatedTile.category,
          'license': updatedTile.license,
          'use': updatedTile.use,
          'prixerUsername': updatedTile.prixerUsername,
          'status': updatedTile.status,
          'publicId': updatedTile.publicId,
          '_id': updatedTile._id,
          'artId': updatedTile.artId,
          'artType': updatedTile.artType,
          'originalPhotoWidth': updatedTile.originalPhotoWidth,
          'originalPhotoHeight': updatedTile.originalPhotoHeight,
          'originalPhotoIso': updatedTile.originalPhotoIso,
          'originalPhotoPpi': updatedTile.originalPhotoPpi,
          'artLocation': updatedTile.artLocation
          };
          axios.post(base_url,data)
          .then(response =>{
            if(response.data.data.success){
              setSnackBarMessage(response.data.data.artResult);
              setSnackBar(true);
            } else {
              setSnackBarMessage(response.data.data.error_message);
              setSnackBar(true);
            }
          })
          .catch(error =>{
              console.log(error.response)
          })
    }
  }, [artDataState])


  return (
      !ready? 
      <div className={classes.loading}>
        <CircularProgress />
      </div> 
      :
      <Container component="main" className={classes.paper}>
      <div style={{position:'fixed', zIndex:'20', marginTop: 10}}>
      <AppBar />
      </div>
      <div style={{marginTop: 55}}>
      {tiles ?
      tiles.map((tile) => (
        (artDataState !== tile.artId) ?
        <div id={tile.artId} key={tile.artId}>
        <Card style={{marginTop: 35}}>
            <CardActionArea>
                {/* <CardMedia
                component="img"
                alt="Contemplative Reptile"
                image={tile.imageUrl}
                title="Contemplative Reptile"
                /> */}
                <Img 
                  placeholder="/imgLoading.svg"
                  style={{ backgroundColor: "#eeeeee", width: '100%' }}
                  src={tile.largeThumbUrl || tile.thumbnailUrl} 
                  debounce={1000} // Default is 300 (ms)
                  cache
                  error="/imgError.svg"
                  srcSet={tile.smallThumbUrl + ' 600w, ' + tile.mediumThumbUrl + ' 850w, ' + tile.largeThumbUrl + ' 1300w'}
                  sizes="(min-width: 960px) 1300px, (min-width: 640px) 850px, 600px"
                  alt={tile.title}
                  id={tile.artId}
                />
                <CardContent>
                  <Grid item container xs={12} sm={12} style={{whiteSpace: 'nowrap', padding:0, margin:0}} justify="space-between">
                    <Typography style={{display:'inline-block', fontSize: '0.8em', paddingLeft:0}}> 
                        ID: {tile.artId}
                    </Typography>
                    <div onClick={navigateToPrixer(tile.prixerUsername)}>
                    <Typography gutterBottom variant="h7" component="h2" style={{display:'inline-block', right: 0, textAlign:'right', margin:0, fontSize: 12}}>
                      Prixer: {tile.prixerUsername}
                    </Typography>
                    </div>
                  </Grid>
                <Grid item container xs={12} sm={12} justify="space-between" style={{textAlign:'left', padding:0, margin:0}}>
                  <Grid item xs={6} sm={6} style={{textAlign:'left', padding:0, margin:0}}>
                    <Typography gutterBottom variant="h5" component="h2" style={{margin:0}}>
                        {tile.title}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item container xs={12} sm={12} style={{textAlign:'left', padding:0, margin:0}}>
                  { tile.artLocation &&
                    <Typography style={{fontSize: '0.8em', paddingBottom: 10, paddingLeft: 3}}> 
                      Ubicación: {tile.artLocation}
                    </Typography>
                  }
                </Grid>
                <Typography variant="body2" color="textSecondary" component="p" style={{whiteSpace: 'pre-line', fontSize: '1.1em', marginBottom: 10}}>
                    {tile.description}
                </Typography>
                {
                  (tile.originalPhotoHeight && tile.originalPhotoWidth) &&
                  <Typography variant="body2" color="textSecondary" component="p">
                      Máximo para impresión: {maxPrintValues(tile)}
                  </Typography>
                }
                </CardContent>
            </CardActionArea>
            <CardActions>
                {/* <Button size="small" color="primary">
                  Comparte
                </Button> */}
                <Button size="small" color="primary" onClick={(e)=>{window.open(utils.generateWaMessage(tile), '_blank');}}>
                  <WhatsAppIcon /> Escríbenos
                </Button>
                {
                JSON.parse(localStorage.getItem('token')) &&
                JSON.parse(localStorage.getItem('token')).username == tile.prixerUsername &&
                    <Button size="small" color="primary" onClick={(e)=>{handleArtEdit(e, tile)}}>
                      Editar
                    </Button>
                }
                {/* <Button size="small" color="primary" onClick={(e)=>{copyCodeToClipboard(e, tile)}}>
                  <FileCopyIcon/>
                </Button> */}
            </CardActions>
        </Card>
        </div>
      :
      <Card id={tile.artId} key={tile.artId}>
      <CardActionArea>
          {/* <CardMedia
          component="img"
          alt="img"
          image={tile.imageUrl}
          title="img"
          /> */}
          <Img
            placeholder="/imgLoading.svg"
            style={{ backgroundColor: "#eeeeee", height: '100%' }}
            src={tile.largeThumbUrl || tile.thumbnailUrl} 
            debounce={1000} // Default is 300 (ms)
            cache
            error="/imgError.svg"
            srcSet={tile.smallThumbUrl + ' 600w, ' + tile.mediumThumbUrl + ' 850w, ' + tile.largeThumbUrl + ' 1300w'}
            sizes="(min-width: 960px) 1300px, (min-width: 640px) 850px, 600px"
            alt={tile.title} 
            id={tile.artId}
          />
          <CardContent>
          <Grid item xs={12} container>
            <Grid item xs container direction="column">
              <Grid item xs>
                <Grid item xs>
                  <TextField 
                  fullWidth id='artTitle' 
                  label="Titulo del arte" 
                  variant="outlined"
                  value={tile.title} 
                  onChange={(e)=> {handleArtTitleEdit(e, tile)}} />
                </Grid>
                {
                tile.artType === 'Foto' &&
                <React.Fragment>
                  <Grid item container xs={12} style={{paddingTop: 15, paddingBottom: 15}}>
                    <Grid item xs={12} sm={12} style={{textAlign:'left'}}>
                      <Typography style={{whiteSpace: 'pre-line', fontSize: '1.3em'}}> Medida del archivo original </Typography>
                    </Grid>
                    {
                    (tile.originalPhotoWidth && tile.originalPhotoHeight) &&
                      <Grid item container xs={12} sm={12} style={{paddingTop: 15}} justify="space-between">
                        <Grid item xs={5} sm={5}>
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="originalPhotoWidth"
                            label="Ancho"
                            type="number"
                            name="originalPhotoWidth"
                            autoComplete="originalPhotoWidth"
                            value={tile.originalPhotoWidth}
                            onChange={(e)=>{
                              handleOriginalPhotoWidth(e, tile);
                              if(e.target.value < 2000) {
                                setSnackBarMessage('La foto original debe tener un ancho mayor a 2.000 px.');
                                setSnackBar(true);
                              }
                            }}
                          />
                        </Grid>
                          <Typography style={{paddingTop: 13}}> x </Typography>
                        <Grid item xs={5} sm={5}>
                          <TextField
                            variant="outlined"
                            fullWidth
                            type="number"
                            id="originalPhotoHeight"
                            label="Alto"
                            name="originalPhotoHeight"
                            autoComplete="originalPhotoHeight"
                            value={tile.originalPhotoHeight}
                            onChange={(e)=>{
                              handleOriginalPhotoHeight(e, tile);
                              if(e.target.value < 2000) {
                                setSnackBarMessage('La foto original debe tener un alto mayor a 2.000 px.');
                                setSnackBar(true);
                              }
                            }}
                          />
                        </Grid>
                          <Typography style={{paddingTop: 13, paddingLeft: 2}}> px </Typography>
                      </Grid>
                    }
                    <Grid item container xs={12} sm={12} style={{paddingTop: 15}} justify="space-between">
                      <Grid item xs={5} sm={5}>
                            <TextField
                              variant="outlined"
                              fullWidth
                              type="number"
                              id="originalPhotoPpi"
                              label="PPI"
                              name="originalPhotoPpi"
                              autoComplete="originalPhotoPpi"
                              value={tile.originalPhotoPpi}
                              onChange={(e)=>{
                                handleOriginalPhotoPpi(e, tile);
                                if(e.target.value < 100) {
                                  setSnackBarMessage('La foto original debe ser mayor a 100 ppi.');
                                  setSnackBar(true);
                                }
                              }}
                            />
                      </Grid>
                      <Grid item xs={5} sm={6} style={{paddingLeft: 0}}>
                        <FormControl variant="outlined" style={{width:"100%"}}>
                          <InputLabel id="originalPhotoIsoLabel" style={{width:"100%"}}>ISO</InputLabel>
                          <Select
                            labelId="originalPhotoIsoLabel"
                            id="originalPhotoIso"
                            value={tile.originalPhotoIso}
                            onChange={(e)=>{
                              handleOriginalPhotoIso(e, tile);
                            }}
                            label="originalPhotoIso"
                          >
                            <MenuItem value="">
                              <em></em>
                            </MenuItem>
                            { photoIsos.map((n)=> (
                                <MenuItem key={n} value={n}>{n}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item container xs={12} justify="space-between">
                    <Grid item xs={12} sm={12} style={{textAlign:'left'}}>
                      <Typography style={{whiteSpace: 'pre-line', fontSize: '1.3em'}}> Medida máxima para impresión:</Typography>
                    </Grid>
                    <Grid item xs={12} sm={12} style={{textAlign:'left'}}>
                      <Typography style={{whiteSpace: 'pre-line', fontSize: '1.3em'}}>  {maxPrintValues(tile)} </Typography>
                    </Grid>
                  </Grid>
                  <Grid item container xs={12}>
                  </Grid>
                </React.Fragment>
                }
                {/* <Grid item container xs={12} style={{marginBottom: 15}}>
                  <Grid item xs={4} sm={4}>
                    <Typography style={{whiteSpace: 'pre-line', padding: 15, fontSize: '0.7em'}}> Máximo para <br/> impresión (cm) </Typography>
                  </Grid>
                  <Grid item container xs={8} sm={8}>
                    <Grid item xs={5} sm={5}>
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="originalArtWidth"
                        label="Ancho"
                        name="originalArtWidth"
                        autoComplete="originalArtHeight"
                        value={tile.originalArtWidth}
                        onChange={(e)=> {handleArtOriginalWidthEdit(e, tile)}}
                      />
                    </Grid>
                      <Typography style={{padding: 10}}> x </Typography>
                    <Grid item xs={5} sm={5}>
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        id="originalArtHeight"
                        label="Alto"
                        name="originalArtHeight"
                        autoComplete="originalArtHeight"
                        value={tile.originalArtHeight}
                        onChange={(e)=> {handleArtOriginalHeightEdit(e, tile)}}
                      />
                    </Grid>
                  </Grid>
                </Grid> */}
                <Grid item xs style={{marginBottom:20, marginTop: 20}}>  
                  <TextField 
                    multiline rows={2} 
                    fullWidth id='artDescription'
                    variant="outlined" 
                    label="Descripción del arte" 
                    value={tile.description} 
                    inputProps={{ maxLength: 300 }}
                    onChange={(e)=> {handleArtDescriptionEdit(e, tile)}} />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Autocomplete
                      multiple
                      freeSolo
                      id="tags-outlined"
                      options={[]}
                      defaultValue={[]}
                      value={tile.tags}
                      onChange={(e, tags, reason) => {
                        handleArtTagsEdit(e, tile, tags);
                      }}
                      renderInput={params => (
                        <TextField
                            {...params}
                            onKeyDown={e => {
                              if (e.key === 13 && e.target.value) {
                                handleArtTagsEdit(e, tile);
                              }
                            }}
                            variant="outlined"
                            label="Etiquetas"
                            placeholder="tags"
                        />
                      )}
                  />
                </Grid>
                <Grid item xs={12} style={{paddingTop: 15}}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    id="artLocation"
                    label="Ubicación"
                    name="artLocation"
                    autoComplete="artLocation"
                    value={tile.artLocation}
                    onChange={(e)=>handleArtLocationEdit(e, tile)}
                  />
                </Grid> 
              </Grid>
            </Grid>
          </Grid>
          </CardContent>
            </CardActionArea>
            <CardActions>
                {/* <Button size="small" color="primary">
                Comparte
                </Button> */}
                {
                JSON.parse(localStorage.getItem('token')) &&
                JSON.parse(localStorage.getItem('token')).username &&
                  <Button size="small" color="primary" onClick={(e)=>{handleArtEdit(e, tile)}}>
                    Guardar
                  </Button>
                }
            </CardActions>
        </Card>
          ))
          :
          <p>Prueba prueba</p>
        }
        {
          openArtFormDialog &&
          <ArtUploader  
            openArtFormDialog={openArtFormDialog} 
            setOpenArtFormDialog={setOpenArtFormDialog} 
            />
        }
        {
          JSON.parse(localStorage.getItem('token')) &&
          JSON.parse(localStorage.getItem('token')).username &&
          <Grid className={classes.float}>
            <FloatingAddButton setOpenArtFormDialog={setOpenArtFormDialog} />
          </Grid>
        }
        <Snackbar
          open={snackBar}
          autoHideDuration={2000}
          message={snackBarMessage}
          className={classes.snackbar}
          onClose={() => setSnackBar(false)}
        />
    </div>
    </Container>
  );
}

