import { React, useState, useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ViewCarouselIcon from '@material-ui/icons/ViewCarousel';
import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid'



export default function carouselAdmin(props)
{
    const imgsDesktop =  [
        {
          url: './Portada_de_Pagina_Web_Museo_Chuao_Espejo_PC_v2.jpg'
        },
        {
          url : 'https://devprix.nyc3.digitaloceanspaces.com/bedroom-g9548c5f75_1920.jpg'
        },
        {
          url : 'https://devprix.nyc3.digitaloceanspaces.com/corporate-building-with-minimalist-empty-room%202.jpg'
        },
        {
          url : 'https://devprix.nyc3.digitaloceanspaces.com/Foto%20de%20Vecislavas%20Popa%20en%20Pexels_lINEAL%20120X40.2.jpg'
        },
        {
          url : 'https://devprix.nyc3.digitaloceanspaces.com/interior_dark_blue_wall_with_yellow_sofa_and_decor_in_living_room.jpg'
        },
        {
          url : 'https://devprix.nyc3.digitaloceanspaces.com/interior-g373dfef45_1920.2.jpg'
        },
        {
          url : 'https://devprix.nyc3.digitaloceanspaces.com/interior-g373dfef45_1920.jpg'
        }
      ]
    return(
    <>
    <Grid>
    <Box style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', color: 'GrayText'}}>
    <ViewCarouselIcon />
    <Typography style={{fontSize: '1.5rem'}}>Edit carousel</Typography>
    </Box>
    <Box>
    
    </Box>     
           
    </Grid>
    </>
    )
}