import * as React from "react";
import { Grid, Button } from "@material-ui/core";
import { Map } from "../components/map/map.jsx";
import { IconCard } from "../components/map/card.jsx";
import { IconsForm } from "../components/iconsForm/iconsForm.jsx";
import data from "../data/LPG/data.json";

export const Mobile = () => {
  const [selectedIcon, setSelectedIcon] = React.useState();
  const [icons, setIcons] = React.useState(data.array);

  const handleCloseIconCard = () => {
    setSelectedIcon(null);
  };

  return (
    <Grid
      container
      spacing={0}
      sx={{ height: "100vh" }}
      justifyContent="center"
      alignItems="center"
      style={{ padding: 0, marginTop: 56 }}
    >
      <Grid
        item
        container
        xs={12}
        justifyContent="center"
        alignItems="center"
        sx={{ width: "100vw", height: "auto" }}
      >
        <Map icons={icons} setSelectedIcon={setSelectedIcon} />
      </Grid>
      {selectedIcon && (
        <Grid item container sx={{ position: "absolute" }}>
          <Grid item container sx={{ position: "relative" }}>
            <Grid
              item
              container
              xs={12}
              justifyContent="right"
              sx={{ position: "absolute", top: "3%", right: "7%" }}
            >
              <Button variant="text" onClick={handleCloseIconCard}>
                X
              </Button>
            </Grid>
            <Grid item container xs={12} justifyContent="center">
              <IconCard icon={selectedIcon} />
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};
