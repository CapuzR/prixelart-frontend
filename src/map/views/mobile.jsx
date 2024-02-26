import * as React from "react";
import { Grid, Button } from "@material-ui/core";

import { Map } from "../components/map/map.jsx";
import { IconCard } from "../components/map/card.jsx";
import { IconsForm } from "../components/iconsForm/iconsForm.jsx";
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
    <Grid
      container
      spacing={0}
      // sx={{ height: "100vh" }}
      justifyContent="center"
      alignItems="center"
      style={{ padding: 0, marginTop: 100 }}
    >
      <Grid
        item
        container
        xs={12}
        justifyContent="center"
        alignItems="center"
        sx={{ width: "auto", height: "90vh" }}
      >
        <Map
          icons={icons}
          setSelectedIcon={setSelectedIcon}
          setOpenSelected={setOpenSelected}
        />
      </Grid>
      <IconCard
        icon={selectedIcon}
        openSelected={openSelected}
        setSelectedIcon={setSelectedIcon}
        setOpenSelected={setOpenSelected}
      />
    </Grid>
  );
};
