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
    'cursor' : 'pointer'
  }
})

function CarouselAdmin(props)
{
  const [images, newImages] = useState({images : []});
  const [maxImages, setMaxImages] = useState(0);


  const classes = useStyle();

  const handleSubmit = async (a) => 
  {
    a.preventDefault();
    const URI = process.env.REACT_APP_BACKEND_URL + '/admin/preferences/carousel';
    const formData = new FormData();
    formData.append('bannerImages', images.images[0])
    let res = await axios.post(URI, formData);
    console.log(res.data)
    getImagesForTheCarousel();
  }

  const getImagesForTheCarousel = () =>
  {
    const URI = 'http://localhost:8000/admin/preferences/carousel';
    fetch(URI)
    .then(res => res.json()
    .then(data => {
      images.images.push(data.imagesCarousels);
    })
    .catch(err => console.error(`Your request is wrong: ${err}`)))
    .catch(err => console.error(err))
  }

    useEffect(() => 
    {
      getImagesForTheCarousel();
    },[])

    return(
    <>
    <Grid>
    <Box style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', color: '#bababa'}}>
    <ViewCarouselIcon />
    <Typography style={{fontSize: '1.5rem'}}>Edit carousel</Typography>
    </Box>
    <Box style={{display:'flex', justifyContent: 'center'}}>
        <FormControl >
          <form method="post" onSubmit={handleSubmit} encType='multipart/form-data' style={{display: 'flex', justifyContent: 'space-evenly', flexDirection: 'row',  alignItems: 'center', width: '80vw', padding: '40px'}} >
          <Typography id='uploadImage'>Subir Imagenes</Typography>
          <Button variant="contained" component="label">
          Upload File
          <input name="bannerImages" type="file" hidden onChange={(a) => {
            a.preventDefault();
            const file = document.getElementById('uploadImage');
            file.innerHTML = a.target.files[0].name
            newImages({
              images: images.images.push(a.target.files[0])
            })
          }} />
         </Button>
         <Button variant='outlined' color="primary" type="submit">Enviar</Button>
          </form> 
        </FormControl>
    </Box>     
    <Box>
      <ImageList cols={2} rowHeight={300}>
       {
       images.images[0] ?
       images.images[0].map((img, key_id) =>  (
          <ImageListItem key={key_id}>
            <Box>
              <Box className={classes.buttons}>
                <EditIcon />
                <HighlightOffOutlinedIcon />
              </Box>
            <img  className={classes.images} src={img.carouselImages[0]} ></img>
            </Box>
          </ImageListItem>
        )
       )
       :
        <Typography>Que mal, parece que no tienes imagenes en el carrusel</Typography>
      }
      </ImageList>
    </Box>
    </Grid>
    </>
    )
}


export default CarouselAdmin;