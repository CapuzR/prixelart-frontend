import * as React from "react";
import { Grid, Typography } from "@material-ui/core";
import { Map } from "../components/map/map.jsx";
import { IconCard } from "../components/map/card.jsx";
import { IconsForm } from "../components/iconsForm/iconsForm.jsx";
import { IconsList } from "../components/iconsForm/iconList.jsx";

import data from "../data/LPG/data.json";

export const Desktop = () => {
  const [selectedIcon, setSelectedIcon] = React.useState();
  const [openSelected, setOpenSelected] = React.useState(false);
  const [icons, setIcons] = React.useState(data.array);

  return (
    <Grid
      container
      justifyContent={"center"}
      alignItems={"center"}
      style={{ padding: 0, marginTop: 80 }}
    >
      <Grid xs={12}>
        <Typography
          variant="h4"
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            fontWeight: "bold",
            // fontSize: "1.2rem",
            color: "#404e5c",
          }}
        >
          Murales de los Palos Grandes
        </Typography>
      </Grid>
      <Grid
        item
        xs={4}
        style={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <IconsList
          icons={icons}
          selected={selectedIcon}
          setSelectedIcon={setSelectedIcon}
          setOpenSelected={setOpenSelected}
        />
        {/* <IconsForm icons={icons} setIcons={setIcons} /> */}
      </Grid>
      <Grid
        item
        xs={4}
        style={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "end",
            flexDirection: "column",
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
              maxWidth: "140px",
              maxHeight: "160px",
              marginTop: "-110px",
              marginRight: "-20px",
              zIndex: 2,
            }}
            onClick={(e) => history.push({ pathname: "/LPG" })}
          />
        </div>
      </Grid>
      <Grid
        item
        container
        xs={4}
        style={{
          display: "flex",
          justifyContent: "center",
          alignContent: "center",
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
      </Grid>

      {/* <Grid item xs={12} id="webapp">
          <Showcase />
        </Grid>
        <Grid item xs={12} id="about">
          <ProductCarrousel />
        </Grid>
        <Grid item xs={12} id="about">
          <ArtistSign />
        </Grid>
        <Grid item xs={12}>
          <Footer/>
        </Grid> */}
    </Grid>
    // <Grid container sx={{ padding: "3% 8% 0 8%", backgroundImage: "Bg" }}>
    //   <Grid item xs={12}>
    //     <TopBar />
    //   </Grid>
    //   <Grid item xs={12}>
    //     <Banner />
    //   </Grid>
    //   <Grid item xs={12} id="webapp">
    //     <Showcase />
    //   </Grid>
    //   <Grid item xs={12} id="about">
    //     <About />
    //   </Grid>
    //   <Grid item xs={12}>
    //     <Prefooter/>
    //   </Grid>
    //   <Grid item xs={12}>
    //     <Footer/>
    //   </Grid>
    // </Grid>
  );
};
