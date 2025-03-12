import React from 'react';
import { useNavigate } from 'react-router-dom';

import { CardActionArea, Typography, IconButton, Tooltip } from '@mui/material';
import Img from 'react-cool-img';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import Star from '@mui/icons-material/StarRate';
import StarOutline from '@mui/icons-material/StarOutline';
import { Art } from '../interfaces';
import { addingToCart } from '../services';
import { queryCreator } from 'apps/consumer/flow/utils';

interface ArtThumbnailProps {
  tile: Art;
  i: number;
  handleFullImageClick: (e: React.MouseEvent<HTMLImageElement>, tile: Art) => void;
}

export default function ArtThumbnail({ tile, i, handleFullImageClick, }: ArtThumbnailProps) {

  //Mover estilo a archivos de estilos

  const navigate = useNavigate();

  function handleArtSelection(e: React.MouseEvent<HTMLButtonElement>): void {


    const queryString = queryCreator(
      undefined,
      undefined,
      undefined,
      tile.artId,
      undefined,
    );

    navigate({ pathname: '/crear-prix', search: queryString });

  }

  const adminToken = localStorage.getItem('adminToken');

  return (
    <div key={i}>
      {adminToken && JSON.parse(adminToken) && tile.visible && (
        <Typography
          style={{
            opacity: 0.5,
            fontSize: '0.8rem',
            fontWeight: 100,
            backgroundColor: '#fff',
          }}
        >
          Puntos: {tile.points}
        </Typography>
      )}

      <CardActionArea>

        {/*!isSelectedInFlow && (
          <Tooltip
            title={
              window.location.search.includes('producto=')
                ? 'Asociar al producto'
                : 'Agregar al carrito'
            }
          >
            <IconButton
              size="small"
              color="primary"
              onClick={handleArtSelection}
              style={{ position: 'absolute', padding: '8px' }}
            >
              <AddShoppingCartIcon />
            </IconButton>
          </Tooltip>
        )*/}
        {tile.exclusive === 'exclusive' && (
          <Tooltip title="Arte exclusivo">
            <IconButton size="small" color="primary" style={{ position: 'absolute', right: 0 }}>
              <Star
                style={{
                  marginRight: '-2.2rem',
                  marginTop: '0.05rem',
                }}
                color="primary"
                fontSize="large"
              />
              <StarOutline
                style={{
                  color: 'white',
                }}
                fontSize="large"
              />
            </IconButton>
          </Tooltip>
        )}
        <Img
          draggable={false}
          onClick={(e: React.MouseEvent<HTMLImageElement>) => {
            handleFullImageClick(e, tile);
          }}
          placeholder="/imgLoading.svg"
          style={{
            backgroundColor: '#eeeeee',
            width: '100%',
            marginBottom: '7px',
            borderRadius: '4px',
          }}
          src={tile.largeThumbUrl || tile.squareThumbUrl}
          debounce={1000}
          cache
          error="/imgError.svg"
          alt={tile.title}
          id={tile.artId}
          key={tile.artId}
        />
      </CardActionArea>
    </div>
  );
}
