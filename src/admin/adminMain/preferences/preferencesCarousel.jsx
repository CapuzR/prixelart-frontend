import { React, useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ViewCarouselIcon from '@material-ui/icons/ViewCarousel';
import { Button, InputLabel, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import { FormControl, FormGroup, FilledInput, Input, TextField} from '@material-ui/core';
import ImageListItem from '@material-ui/core/ImageListItem';
import ImageList from '@material-ui/core/ImageList';
import EditIcon from '@material-ui/icons/Edit';
import HighlightOffOutlinedIcon from '@material-ui/icons/HighlightOffOutlined';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Snackbar from '@material-ui/core/Snackbar';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';

const useStyle = makeStyles((theme) => ({
  images: {
   'width': '500px',
   height: '300px',
   'borderRadius' : '10px',
   'cursor': 'pointer'
  },
  buttons: {
    position: 'absolute',
    'color': '#ccc',
    'display': 'flex',
    'cursor' : 'pointer',
    'padding': '10px',
    'flexDirection': 'row',
    'justifyContent' : 'space-between',
    'width': '37vw'
  },
  nameFile:{
    'width': '300px',
    'whiteSpace': 'nowrap',
    'overflow': 'hidden',
    'textOverflow': 'ellipsis',
    'padding': '10px',
    'fontSize': '1rem',
    'margin': '0',
    'background': '#cccc'
  },
  loaderImage: {
    width: '50vw',
    height: '60vh',
    marginLeft: '220px',
    backgroundColor: '#cccc',
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center'
  },
  imageLoad: {
    width: '50vw',
    height: '60vh'
  },
  buttonImgLoader: {
    color: '#ccc',
    width: '50vw',
    height: '60vh',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    padding: '10px',
    position: 'absolute',
    justifyContent: 'flex-end'
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main
  }}));

function CarouselAdmin(props)
{
  const [image, newImage] = useState({file : '', _id: ''})//enviar
  const [imageLoader, setLoadImage] = useState({loader: '', filename: 'Subir imagenes'})//loader de imagenes
  const [images, newImages] = useState({images : []}); // lista de imagenes para renderizar
  const [update, setUpdate] = useState(0); // modal de update
  const [open, setOpen] = useState(false); //modal de eliminar -> confirm
  const [Open, setOpenI] = useState(false);// Toast para imagen eliminada exitosamente
  const [maxImage, setMaxImages] = useState(false); //Toast para maximo de 6 imagenes
  const [create, setCreate] = useState(false); // toast para imagen creada y listada
  const [createF, setCreateF] = useState(false);
  const [loading, setLoading] = useState(false); // Loading

  const classes = useStyle();

  const maxImageOpen = () => {
    setMaxImages(true)
  }

  const maxImageClose = () => {
    setMaxImages(false)
  }

  const createOpen = () => {
    setCreate(true)
  }

  const createClose = () => {
    setCreate(false)
  }

  const createOpenF = () => {
    setCreateF(true)
  }

  const createCloseF = () => {
    setCreateF(false)
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpenI = () =>
  {
    setOpenI(true)
  }

  const handleCloseI = () =>
  {
    setOpenI(false)
  }


  const openUpdate = () => {
    setUpdate(true)
  }

  const closeUpdate = () =>
  {
    setUpdate(false)
  }


    // CRUD
    //Editar imagen:
  const handleUpdate= async (x) =>
  {
    x.preventDefault();
    setLoading(true)
    const URI = process.env.REACT_APP_BACKEND_URL + '/admin/preferences/carousel/' + image._id;
    const formData = new FormData();
    formData.append('newBannerImages', image.file);
    let res = await axios.put(URI, formData)
    setLoadImage({
      loader: '',
      filename: 'Subir imagenes'
    })
    newImage({
      _id: '',
      file: ''
    })
    setLoadImage(false)
    openUpdate();
    getImagesForTheCarousel();
    closeUpdate();
  }

  // Crear imagen:
  const handleSubmit = async (a) =>
  {
      a.preventDefault();
      if(images.images[0].length >= 6){
        maxImageOpen();
        setLoadImage({
          loader: '',
          filename: 'Subir imagenes'
        })
      } else{
        setLoading(true)
      setLoadImage({
        loader: '',
        filename: 'Subir imagenes'
      })
      const URI = process.env.REACT_APP_BACKEND_URL + '/admin/preferences/carousel';
      const newFormData = new FormData();
      newFormData.append('bannerImages', image.file)
      let res = await axios.post(URI, newFormData);
      createOpen();
      newImage({
        _id: '',
        file: ''
      })
      setLoadImage(false)
      getImagesForTheCarousel();
    }
  }

  const deleteImage = async (d) => {
    d.preventDefault();
    handleClose();
    setLoading(true)
    const URI = process.env.REACT_APP_BACKEND_URL + '/admin/preferences/carousel/' + image._id;
    let res = await axios.delete(URI);
    getImagesForTheCarousel();
    handleClickOpenI()
    setLoading(false)
    handleCloseI();
  }
  //Preview de imagen antes de enviar
  const convertToBase64 = (blob) => {
    return new Promise((resolve) => {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
  };
  // Actualizacion del estado para preview de imagen
  const loadImage = async (e) =>
  {
    const file = e.target.files[0];
    const resizedString = await convertToBase64(file);
    setLoadImage({loader: resizedString, filename: file.name})
  }

  //Cancelar subida de imagen
  const cancelUploadImage = () =>
  {
      setLoadImage({loader: '', filename: 'Subir imagenes'})
      newImage({_id: '', file: ''})
  }
  //Tomar imagenes en array para ser listadas y renderizadas
 const getImagesForTheCarousel = () =>
  {
    setLoading(true)
    const URI = 'http://localhost:8000/admin/preferences/carousel';
    fetch(URI)
    .then(res => res.json()
    .then(data => { newImages({images: [data.imagesCarousels]})})
    .catch(err => console.error(`Your request is wrong: ${err}`)))
    .catch(err => console.error(err))
    setLoading(false)
  }

  useEffect(()=>{ getImagesForTheCarousel() }, [])

    return(
    <>
    <Backdrop className={classes.backdrop} open={loading}>
      <CircularProgress value={loading} style={{marginTop: '-250px'}}/>
    </Backdrop>
    <Grid>
    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', color: '#bababa'}}>
    <ViewCarouselIcon />
    <Typography style={{fontSize: '1.5rem', padding: '10px'}}>Edit carousel</Typography>
    </div>

    <div className={classes.loaderImage}>
      <Box className={classes.buttonImgLoader}>
        {
          imageLoader.loader ?
          <HighlightOffOutlinedIcon style={{width: '2rem'}} onClick={cancelUploadImage}/>
          :
          <HighlightOffOutlinedIcon hidden/>
        }
        </Box>
        {imageLoader.loader && <img className={classes.imageLoad} src={imageLoader.loader} alt='+'></img>}
        {
          imageLoader.loader ?
          ''
          :
          <h1 style={{color: '#e0e0e0'}}>1300x700px</h1>
        }
    </div>

    <Box style={{display:'flex', justifyContent: 'center'}}>
        <FormControl >
          <form onSubmit={(s) => {
            if(image._id != "")
            {
              handleUpdate(s);
            } else{
              handleSubmit(s);
            }
          }} encType='multipart/form-data' style={{display: 'flex', justifyContent: 'space-evenly', flexDirection: 'row',  alignItems: 'center', width: '80vw', padding: '40px'}} >
          <Typography className={classes.nameFile} id='uploadImage'>{imageLoader.filename}</Typography>
          <Button variant="contained" component="label">
          Upload File
          <input name="bannerImages" type="file" hidden onChange={(a) => {
            a.preventDefault();
            loadImage(a)
            newImage({
              _id: image._id,
              file: a.target.files[0]
            })
          }}  />
         </Button>
         <Button variant='outlined' color="primary" type="submit" >Enviar</Button>
          </form>
        </FormControl>

          <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          open={create}
          onClose={createClose}
          autoHideDuration={5000}
          message="Process sucessfull"/>

            <Snackbar
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            open={createF}
            onClose={createCloseF}
            autoHideDuration={5000}
            message="You must send a image"/>


      <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          open={update}
          onClose={closeUpdate}
          autoHideDuration={5000}
          message="Process sucessfull"/>
    </Box>
    <div>
      <ImageList cols={2} rowHeight={300}>
      {
       images.images[0] ?
       images.images[0].map((img, key_id) =>  (
          <ImageListItem key={key_id}>
            <Box>
              <Box className={classes.buttons}>
                <Button variant="text" style={{color: 'white'}} component='label'>
                   <input  type="file"  name="newBannerImages" hidden onChange={(a) => {
                  a.preventDefault();
                  loadImage(a)
                  newImage({
                    _id: img._id,
                    file: a.target.files[0]
                  })
                }}/>
                   <EditIcon />
                </Button>
                <Button variant="text" style={{color: 'white'}} onClick={handleClickOpen}>
                <HighlightOffOutlinedIcon onClick={() =>
                {
                  newImage({
                    _id: img._id,
                    file: image.file
                  })
                }}/>
                </Button>
            <Dialog
              open={open}
              onClose={handleClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">{"Estas seguro de eliminar esta imagen del carrusel?"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Esta imagen ya no se vera en el carrusel del banner principal
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} color="primary">
                  Cancelar
                </Button>
                <Button onClick={(d) => {
                  deleteImage(d)
                }} color="primary">
                  Aceptar
                </Button>
              </DialogActions>
            </Dialog>

            <Snackbar
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            open={Open}
            onClose={handleClose}
            autoHideDuration={5000}
            message="Imagen borrada exitosamente"
            />
              </Box>
              <a href={img.carouselImages[0]} target='_BLANK'>
              <img className={classes.images} title={img.carouselImages[0]} src={img.carouselImages[0]}></img>
              </a>
            </Box>
          </ImageListItem>

        )
       )
       :
        <Typography>Que mal, parece que no tienes imagenes en el carrusel</Typography>
        }
      </ImageList>

    </div>
    </Grid>
    <Dialog
              open={maxImage}
              onClose={maxImageClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">{"Limite alcanzado"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Solo puedes agregar 6 imagenes al carrusel,
                  procura eliminar algunas imagenes o reemplazar
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={maxImageClose}>
                  Aceptar
                </Button>
              </DialogActions>
            </Dialog>
    </>
    )
}

export default CarouselAdmin;
