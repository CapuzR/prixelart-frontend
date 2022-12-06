import React, { useEffect, useImperativeHandle } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useState, useCallback } from "react";
import EasyCropper from "./easyCropper";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import PhotoLibraryIcon from "@material-ui/icons/PhotoLibrary";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import CheckCircleOutlineIcon from "@material-ui/icons/CheckCircleOutline";
import Tooltip from "@material-ui/core/Tooltip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { Typography } from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import getCroppedImg from "../../utils/cropImage";
import CropIcon from "@material-ui/icons/Crop";

const useStyles = makeStyles((theme) => ({
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
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    flexGrow: 1,
    overflow: "visible",
  },
  icon: {
    marginRight: theme.spacing(2),
  },
  cardGrid: {
    position: "relative",
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
  button: {
    width: "10px",
  },
}));

export default function AspectRatioSelector(props) {
  const { art, croppedArt, setCroppedArt } = props;
  const classes = useStyles();
  const [tabValue, setTabValue] = useState(1);
  const croppedArtTemp = croppedArt;
  const [croppedAreaPixels, setCroppedAreaPixels] = useState();
  const [state, setState] = React.useState({
    checkedA: false,
  });
  //Error states.
  const [errorMessage, setErrorMessage] = useState();
  const [snackBarAction, setSnackBarAction] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  useEffect(() => {});

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const updateCrop = (i) => {
    croppedArtTemp[i].thumb = "";
    croppedArtTemp[i].cropped = false;
    setCroppedArt([...croppedArtTemp]);
  };

  const handleCrop = useCallback(
    async (i) => {
      try {
        const { croppedImg, croppedImgFile } = await getCroppedImg(
          art,
          croppedAreaPixels
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
    [croppedAreaPixels]
  );

  const handleChangeCheck = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  return (
    <div className={classes.root}>
      {tabValue === 0 || state.checkedA === false ? (
        <>
          <Grid
            item
            xs={12}
            sm={12}
            md={12}
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
          </Grid>
        </>
      ) : (
        state.checkedA === true &&
        croppedArt.map(
          (ar, index) =>
            ar.id === tabValue && (
              <Grid
                item
                xs={12}
                sm={12}
                md={12}
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
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
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
                  </Grid>
                )}
                {croppedArt[index].cropped ? (
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    style={{ position: "absolute", right: 5, bottom: 5 }}
                  >
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
                  </Grid>
                ) : (
                  <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
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
                  </Grid>
                )}
              </Grid>
            )
        )
      )}

      <Grid xs={12} sm={12} md={12}>
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
                croppedArt.map((ar) => (
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
        <Grid
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FormControlLabel
            name="checkedA"
            style={{ marginRight: "0px" }}
            control={
              <Checkbox
                color={"primary"}
                checked={state.checkedA}
                onChange={handleChangeCheck}
              />
            }
          />
          <Typography style={{ color: "gray", fontSize: "0.875rem" }}>
            Quiero seleccionar los cortes de mi arte.
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
}
