import * as React from 'react';
import { Grid, Button, Typography } from '@mui/material';

import { Map } from '../components/map/map.jsx';
import { IconCard } from '../components/map/card.jsx';
import { IconsForm } from '../components/iconsForm/index.js';
import { IconsList } from '../components/iconsForm/iconList.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

import data from '../data/LPG/data.json';

export const Mobile = () => {
  const [selectedIcon, setSelectedIcon] = React.useState();
  const [openSelected, setOpenSelected] = React.useState(false);
  const [icons, setIcons] = React.useState(data.array);
  const navigate = useNavigate();

  const handleClose = () => {
    setOpenSelected(false);
    setSelectedIcon(undefined);
  };

  return (
    <>
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        style={{
          padding: 0,
          marginTop: 70,
          // backgroundColor: "#252872"
        }}
      >
        <Typography
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            color: '#404e5c',
          }}
        >
          Murales de los Palos Grandes
        </Typography>

        <IconsList
          icons={icons}
          selected={selectedIcon}
          setSelectedIcon={setSelectedIcon}
          setOpenSelected={setOpenSelected}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            flexDirection: 'column',
          }}
        >
          <Map icons={icons} setSelectedIcon={setSelectedIcon} setOpenSelected={setOpenSelected} />
          {/* <div
        style={{
          display: "flex",
          top: 0,
          right: 0,
          // marginRight: "650px",
          // marginTop: "300px",
        }}
      > */}
          <img
            alt="icon"
            src="/LPG/logocolor.jpg"
            style={{
              maxWidth: '140px',
              maxHeight: '160px',
              marginTop: '-170px',
              zIndex: 2,
            }}
            onClick={(e) => navigate({ pathname: '/prixer=LPG' })}
          />
        </div>
        {/* </div> */}
        <IconCard
          icon={selectedIcon}
          openSelected={openSelected}
          setSelectedIcon={setSelectedIcon}
          setOpenSelected={setOpenSelected}
        />
      </Grid>
    </>
  );
};
