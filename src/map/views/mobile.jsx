import * as React from "react";
import { Grid, Button, Typography } from "@material-ui/core";

import { Map } from "../components/map/map.jsx";
import { IconCard } from "../components/map/card.jsx";
import { IconsForm } from "../components/iconsForm/iconsForm.jsx";
import { IconsList } from "../components/iconsForm/iconList.jsx";

import data from "../data/LPG/data.json";

export const Mobile = () => {
  const [selectedIcon, setSelectedIcon] = React.useState();
  const [openSelected, setOpenSelected] = React.useState(false);
  const [icons, setIcons] = React.useState(data.array);

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
            display: "flex",
            width: "100%",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: "1.2rem",
            color: "#404e5c",
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

        <Map
          icons={icons}
          setSelectedIcon={setSelectedIcon}
          setOpenSelected={setOpenSelected}
        />
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
