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
import axios from 'axios';

const useStyle = makeStyles({
  images: {
   'width': '510px',
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
  }
})

function CarouselAdmin(props)
{
  const [image, newImage] = useState({file : ''})
  const [images, newImages] = useState({_id: '', images : []});
  const [update, setUpdate] = useState(0);
  const [open, setOpen] = useState(false);
  const [Open, setOpenI] = useState(false);
  const [create, setCreate] = useState(false)

  const classes = useStyle();

  const createOpen = () => {
    setCreate(true)
  }

  const createClose = () => {
    setCreate(false)
  }

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClickOpenI = () => 
  {
    setOpenI(true)
  }

  const handleCloseI = () => 
  {
    setOpenI(false)
  }

  const handleClose = () => {
    setOpen(false);
  };

  const openUpdate = () => {
    setUpdate(true)
  }

  const closeUpdate = () => 
  {
    setUpdate(false)
  }

  const handleSubmit = async (a) => 
  {
    a.preventDefault();
    const URI = process.env.REACT_APP_BACKEND_URL + '/admin/preferences/carousel';
    const formData = new FormData();
    formData.append('bannerImages', image.file)
    let res = await axios.post(URI, formData);
    console.log(res.data)
    newImage({
      file: ''
    })
    createOpen();
    getImagesForTheCarousel();
  }


 const getImagesForTheCarousel = () =>
  {
    const URI = 'http://localhost:8000/admin/preferences/carousel';
    fetch(URI)
    .then(res => res.json()
    .then(data => { newImages({images: [data.imagesCarousels]})})
    .catch(err => console.error(`Your request is wrong: ${err}`)))
    .catch(err => console.error(err))
  }

    return(
    <>
    <Grid onLoad={getImagesForTheCarousel()}>
    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', color: '#bababa'}}>
    <ViewCarouselIcon />
    <Typography style={{fontSize: '1.5rem'}}>Edit carousel</Typography>
    </div>
    <Box style={{display:'flex', justifyContent: 'center'}}>
        <FormControl >
          <form method="post" onSubmit={handleSubmit} encType='multipart/form-data' style={{display: 'flex', justifyContent: 'space-evenly', flexDirection: 'row',  alignItems: 'center', width: '80vw', padding: '40px'}} >
          <Typography id='uploadImage'>Subir Imagenes</Typography>
          <Button variant="contained" component="label">
          Upload File
          <input name="bannerImages" type="file" hidden onChange={(a) => {
            a.preventDefault();
            const file = document.getElementById('uploadImage');
            file ?
            file.innerHTML = a.target.files[0].name
            :
            file.innerHtml = 'Subir Imagenes'
            newImage({
              file: a.target.files[0]
            })
          }}  />
         </Button>
         <Button variant='outlined' color="primary" type="submit">Enviar</Button>
          </form> 
        </FormControl>
        {
          image.file ?
          <Dialog
          open={create}
          onClose={createClose}
        >
          <DialogTitle >{"Process successful"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Imagen creada y agregada exitosamente
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={createClose} color="primary" autoFocus>
              Aceptar
            </Button>
          </DialogActions>
    </Dialog>
          :
          <Dialog
              open={create}
              onClose={createClose}
            >
              <DialogTitle >{"Process failed"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Debes agregar una imagen para colocarla en el Carrusel
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={createClose} color="primary" autoFocus>
                  Aceptar
                </Button>
              </DialogActions>
        </Dialog>
        }
        
    </Box>     
    <div>
      <ImageList cols={2} rowHeight={300}>
      {
       images.images[0] ?
       images.images[0].map((img, key_id) =>  (
          <ImageListItem key={key_id}>
            <Box>
              <Box className={classes.buttons}>
                <EditIcon onClick={openUpdate} />
                <HighlightOffOutlinedIcon onClick={handleClickOpen} /> 

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
                <Button onClick={async () => {
                  handleClickOpenI()
                    const URI = process.env.REACT_APP_BACKEND_URL + `/admin/preferences/carousel/${img._id}`;
                    let res = await axios.delete(URI);
                    getImagesForTheCarousel();
                  handleClose();
                  }} color="primary" autoFocus>
                  Aceptar
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog
              open={Open}
              onClose={handleCloseI}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">{"Imagen borrada exitosamente"}</DialogTitle>
              <DialogActions>
                <Button onClick={handleCloseI} color="primary">
                  Cancelar
                </Button>
                <Button onClick={handleCloseI} color="primary" autoFocus>
                  Aceptar
                </Button>
              </DialogActions>
            </Dialog>

            <Dialog
              open={update}
              onClose={closeUpdate}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">{"Actualizar imagenes"}</DialogTitle>
              <DialogContent>
              <FormControl >
                <form method="post" encType='multipart/form-data' >
                <Typography id='uploadImage'>Subir Imagenes</Typography>
                <Button variant="contained" component="label">
                Upload File
                <input name="bannerImages" type="file" hidden onChange={(a) => {
                  a.preventDefault();
                  const file = document.getElementById('uploadImage');
                  file ?
                  file.innerHTML = a.target.files[0].name
                  :
                  file.innerHtml = 'Subir Imagenes'
                  newImage({
                    file: a.target.files[0]
                  })
                }}  />
              </Button>
              <Button variant='outlined' color="primary" type="submit">Enviar</Button>
                </form> 
               </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeUpdate} color="primary">
                  Cancelar
                </Button>
                <Button onClick={closeUpdate} color="primary" autoFocus>
                  Aceptar
                </Button>
              </DialogActions>
            </Dialog>
              </Box>
            <img  className={classes.images} src={img.carouselImages[0]} ></img>
            </Box>
          </ImageListItem>
          
        )
       )
       :
        <Typography>Que mal, parece que no tienes imagenes en el carrusel</Typography>
          // const Max = images.images[0].lenght
          // console.log(Max)
        }
      </ImageList>
    </div>
    </Grid>
    </>
    )
}


export default CarouselAdmin;