import * as React from 'react';
import {  Typography } from '@mui/material';
import { Map } from '../components/map/map.jsx';
import { IconCard } from '../components/map/card.jsx';
import { IconsForm } from '../components/iconsForm/iconsForm.jsx';
import { IconsList } from '../components/iconsForm/iconList.jsx';
import { useHistory, useLocation } from 'react-router-dom';

import data from '../data/LPG/data.json';

export const Desktop = () => {
  const [selectedIcon, setSelectedIcon] = React.useState();
  const [openSelected, setOpenSelected] = React.useState(false);
  const [icons, setIcons] = React.useState(data.array);
  const history = useHistory();

  return (
    <Grid2
      container
      justifyContent={'center'}
      alignItems={'center'}
      style={{ padding: 0, marginTop: 80 }}
    >
      <Grid2 size={{xs:12}}>
        <Typography
          variant="h4"
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            fontWeight: 'bold',
            // fontSize: "1.2rem",
            color: '#404e5c',
          }}
        >
          Murales de los Palos Grandes
        </Typography>
      </Grid2>
      <Grid2
size={{ xs: 4 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        <IconsList
          icons={icons}
          selected={selectedIcon}
          setSelectedIcon={setSelectedIcon}
          setOpenSelected={setOpenSelected}
        />
        {/* <IconsForm icons={icons} setIcons={setIcons} /> */}
      </Grid2>
      <Grid
        item
        xs={4}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            flexDirection: 'column',
          }}
        >
          <Map
            icons={icons}
            selected={selectedIcon}
            setSelectedIcon={setSelectedIcon}
            setOpenSelected={setOpenSelected}
          />

          <img
            alt="icon"
            src="/LPG/logocolor.jpg"
            style={{
              maxWidth: '140px',
              maxHeight: '160px',
              marginTop: '-110px',
              marginRight: '-20px',
              zIndex: 2,
            }}
            onClick={(e) => history.push({ pathname: '/prixer=LPG' })}
          />
        </div>
      </Grid2>
      <Grid
        item
        container
        xs={4}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        <IconCard
          icon={selectedIcon}
          openSelected={openSelected}
          setSelectedIcon={setSelectedIcon}
          setOpenSelected={setOpenSelected}
        />
        {/* <div
          style={{
            display: "flex",
            marginRight: "650px",
            marginTop: "300px",
            zIndex: 2,
          }}
        >
          <img
            alt="icon"
            src="/LPG/logocolor.jpg"
            style={{
              maxWidth: "140px",
              maxHeight: "140px",
            }}
            onClick={(e) => history.push({ pathname: "/LPG" })}
          />
        </div> */}
      </Grid2>
    </Grid2>
  );
};
