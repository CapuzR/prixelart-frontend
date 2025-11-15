import React, { useEffect, useState, useCallback } from "react";
import { makeStyles } from "tss-react/mui";

import EasyCropper from "./easyCropper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import Paper from "@mui/material/Paper";
import Grid2 from "@mui/material/Grid";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import Tooltip from "@mui/material/Tooltip";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { Theme, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import getCroppedImg from "../../../../../src/utils/cropImage";
import CropIcon from "@mui/icons-material/Crop";

interface ARprops {
  art: string;
  croppedArt: any;
  setCroppedArt: (x: any) => void;
}

const useStyles = makeStyles()((theme: Theme) => {
  return {
    iconTabs: {
      flexGrow: 1,
      width: "100%",
      margin: "auto",
      marginBottom: 10,
    },
    root: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-around",
      overflow: "hidden",
      backgroundColor: theme.palette.background.paper,
    },
    img: {
      maxWidth: "100%",
      maxHeight: "200px",
      width: "100%",
      height: "100%",
      objectFit: "contain",
      objectPosition: "50% 50%",
    },
    tab: {
      minWidth: 100,
    },
  };
});

export default function AspectRatioSelector({
  art,
  croppedArt,
  setCroppedArt,
}: ARprops) {
  const { classes } = useStyles();
  const [tabValue, setTabValue] = useState(1);
  const croppedArtTemp = croppedArt;
  const [croppedAreaPixels, setCroppedAreaPixels] = useState();
  const [state, setState] = React.useState({
    checkedA: false,
  });
  //Error states.
  // const [errorMessage, setErrorMessage] = useState();
  // const [snackBarAction, setSnackBarAction] = useState();
  // const [snackBarError, setSnackBarError] = useState(false);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const updateCrop = (i: number) => {
    croppedArtTemp[i].thumb = "";
    croppedArtTemp[i].cropped = false;
    setCroppedArt([...croppedArtTemp]);
  };

  const handleCrop = useCallback(
    async (i: number) => {
      try {
        if (!croppedAreaPixels) return;
        const { croppedImg, croppedImgFile } = await getCroppedImg(
          art,
          croppedAreaPixels,
        );
        croppedArtTemp[i].thumb = croppedImg;
        croppedArtTemp[i].thumbFile = croppedImgFile;
        croppedArtTemp[i].cropped = true;
        croppedArtTemp[i].croppedAreaPixels = croppedAreaPixels;
        setCroppedArt([...croppedArtTemp]);
      } catch (e) {
        console.error(e);
      }
    },
    [croppedAreaPixels],
  );

  const handleChangeCheck = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <div className={classes.root}>
      {tabValue === 0 || state.checkedA === false ? (
        <>
          <Grid2
            style={{
              position: "relative",
              height: 300,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <label htmlFor="inputfile" style={{ cursor: "pointer" }}>
              <Tooltip
                title={
                  "Carga tu arte con un mínimo de 1080px tanto de ancho como de alto. Tu Arte debe pesar máximo 5Mb y estar en formato .jpeg o .png"
                }
              >
                <img className={classes.img} alt="Uploaded" src={art} />
              </Tooltip>
            </label>
          </Grid2>
        </>
      ) : (
        state.checkedA === true &&
        croppedArt.map(
          (ar: any, index: number) =>
            ar.id === tabValue && (
              <Grid2
                style={{
                  position: "relative",
                  height: 300,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                {croppedArt[index].thumb == "" ? (
                  <EasyCropper
                    art={art}
                    ar={ar}
                    croppedArt={croppedArt}
                    setCroppedArt={setCroppedArt}
                    index={index}
                    setCroppedAreaPixels={setCroppedAreaPixels}
                  />
                ) : (
                  <Grid2
                    style={{
                      position: "relative",
                      height: 300,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Tooltip
                      title={
                        "Genera el recorte para recomendar a tus clientes las mejores secciones de tu arte."
                      }
                    >
                      <img
                        className={classes.img}
                        alt="Uploaded"
                        src={croppedArtTemp[index].thumb}
                      />
                    </Tooltip>
                  </Grid2>
                )}
                {croppedArt[index].cropped ? (
                  <Grid2 style={{ position: "absolute", right: 5, bottom: 5 }}>
                    <IconButton
                      color="secondary"
                      aria-label="add an alarm"
                      style={{ padding: 0 }}
                      onClick={() => {
                        updateCrop(index);
                      }}
                    >
                      <Typography>Recortar</Typography>
                      <CropIcon />
                    </IconButton>
                  </Grid2>
                ) : (
                  <Grid2
                    style={{
                      position: "absolute",
                      right: 5,
                      bottom: 5,
                      zIndex: 20,
                    }}
                  >
                    <IconButton
                      color="secondary"
                      aria-label="add an alarm"
                      style={{ padding: 0 }}
                      onClick={() => {
                        handleCrop(index);
                      }}
                    >
                      <Typography>Listo</Typography>
                      <CheckCircleOutlineIcon />
                    </IconButton>
                  </Grid2>
                )}
              </Grid2>
            ),
        )
      )}

      <Grid2>
        <Paper square className={classes.iconTabs}>
          {state.checkedA === true && (
            <Tabs
              value={tabValue}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="secondary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                className={classes.tab}
                icon={<PhotoLibraryIcon />}
                label="Original"
              />

              {state.checkedA === true &&
                croppedArt.map((ar: any) => (
                  <Tab
                    className={classes.tab}
                    icon={<PhotoLibraryIcon />}
                    label={ar.name}
                    id={ar.id}
                  />
                ))}
            </Tabs>
          )}
        </Paper>
        <Grid2
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FormControlLabel
            style={{ marginRight: "0px" }}
            control={
              <Checkbox
                color={"primary"}
                checked={state.checkedA}
                onChange={handleChangeCheck}
              />
            }
            label="Quiero seleccionar los cortes de mi arte."
          />
          {/* <Typography style={{ color: "gray", fontSize: "0.875rem" }}>
            Quiero seleccionar los cortes de mi arte.
          </Typography> */}
        </Grid2>
      </Grid2>
    </div>
  );
}
