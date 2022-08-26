// Debo hacer los unit y functional tests.
// Debo migrar los states a Redux.

import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import ButtonBase from "@material-ui/core/ButtonBase";
import { useState, useEffect } from "react";
import EditIcon from "@material-ui/icons/Edit";
import { IconButton } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import axios from "axios";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import CircularProgress from "@material-ui/core/CircularProgress";
import Avatar from "@material-ui/core/Avatar";
import AddIcon from "@material-ui/icons/Add";
import Backdrop from "@material-ui/core/Backdrop";

const useStyles = makeStyles((theme) => ({
  loading: {
    display: "flex",
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
    marginLeft: "50vw",
    marginTop: "50vh",
  },
  root: {
    flexGrow: 1,
    paddingTop: 73,
    width: "100%",
  },
  paper: {
    padding: theme.spacing(2),
    margin: "auto",
    width: "100%",
  },
  image: {
    width: 128,
    height: 128,
  },
  img: {
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  avatar: {
    display: "flex",
    "& > *": {
      margin: theme.spacing(1),
    },
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#fff",
    width: "160px",
    height: "160px",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function UserData(props) {
  const classes = useStyles();
  const [prixerDataState, setPrixerDataState] = useState("read");
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [specialty, setSpecialty] = useState();
  const [instagram, setInstagram] = useState();
  const [description, setDescription] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState();
  const [phone, setPhone] = useState();
  const [country, setCountry] = useState();
  const [city, setCity] = useState("");
  const [ready, setReady] = useState(false);
  const [prixerExists, setPrixerExists] = useState(false);
  const [avatarObj, setAvatarObj] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [inputChange, setInputChange] = useState(false);
  const [backdrop, setBackdrop] = useState(true);

  useEffect(() => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/prixer/read";
    const data = {
      username: props.prixerUsername,
    };

    axios
      .post(base_url, data)
      .then((response) => {
        setUsername(response.data.username);
        setEmail(response.data.email);
        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);
        setSpecialty(response.data.specialty);
        setInstagram(response.data.instagram);
        setDescription(response.data.description);
        setDateOfBirth(response.data.dateOfBirth);
        setPhone(response.data.phone);
        setCountry(response.data.country);
        setCity(response.data.city);
        setAvatarObj(response.data.avatar);
        setProfilePic(response.data.avatar);
        setReady(true);
        setBackdrop(false);
        setPrixerExists(true);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [props.prixerUsername]);

  const handleProfileDataEdit = async () => {
    if (prixerDataState === "edit") {
      setBackdrop(true);
      var formData = new FormData();
      if (inputChange) {
        formData.append("avatar", profilePic);
      }
      formData.append("username", username);
      formData.append("firstName", firstName);
      formData.append("email", email);
      formData.append("lastName", lastName);
      formData.append("specialty", specialty);
      formData.append("instagram", instagram);
      formData.append("description", description);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("phone", phone);
      formData.append("country", country);
      formData.append("city", city);
      const base_url = process.env.REACT_APP_BACKEND_URL + "/prixer/update";
      const response = await axios.post(base_url, formData, {
        "Content-Type": "multipart/form-data",
      });
      if (response.data) {
        setUsername(response.data.username);
        setEmail(response.data.email);
        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);
        setSpecialty(response.data.specialty);
        setInstagram(response.data.instagram);
        setDescription(response.data.description);
        setDateOfBirth(response.data.dateOfBirth);
        setPhone(response.data.phone);
        setCountry(response.data.country);
        setCity(response.data.city);
        setAvatarObj(response.data.avatar);
        setProfilePic(response.data.avatar);
        setReady(true);
        setBackdrop(false);
        setPrixerExists(true);
        setPrixerDataState("read");
      } else {
        setReady(true);
        setBackdrop(false);
      }
    } else {
      setPrixerDataState("edit");
    }
  };

  const onImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setInputChange(true);
      setAvatarObj(URL.createObjectURL(e.target.files[0]));
      setProfilePic(e.target.files[0]);
    }
  };

  return prixerExists ? (
    <div className={classes.root}>
      <Backdrop className={classes.backdrop} open={backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Paper className={classes.paper}>
        <Grid container spacing={1}>
          {JSON.parse(localStorage.getItem("token")) &&
            JSON.parse(localStorage.getItem("token")).username === username && (
              <Grid>
                <IconButton
                  title="Profile Edit"
                  color="primary"
                  component="span"
                  onClick={handleProfileDataEdit}
                >
                  <EditIcon />
                </IconButton>
              </Grid>
            )}
          {prixerDataState === "read" && (
            <Grid item xs={12} container>
              <Grid item xs container direction="column" spacing={2}>
                <Grid item xs>
                  <Typography gutterBottom variant="subtitle1">
                    {firstName + " " + lastName}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {specialty === "Ambas" ? "Fotografía y Diseño" : specialty}
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    {username} | ig: {instagram}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    maxWidth="60%"
                  >
                    {description}
                  </Typography>
                </Grid>
              </Grid>

              <Grid item>
                {avatarObj ? (
                  <Avatar className={classes.avatar}>
                    <label htmlFor="file-input">
                      <img
                        src={profilePic}
                        alt="Prixer profile avatar"
                        style={{ maxHeight: 200 }}
                      />
                    </label>
                  </Avatar>
                ) : (
                  JSON.parse(localStorage.getItem("token")) &&
                  JSON.parse(localStorage.getItem("token")).username ===
                    username && (
                    <Avatar className={classes.avatar}>
                      <label htmlFor="file-input">
                        <img
                          src="/PrixLogo.png"
                          alt="Prixer profile avatar"
                          style={{ maxHeight: 200, height: 120 }}
                          onClick={handleProfileDataEdit}
                        />
                      </label>
                    </Avatar>
                  )
                )}
              </Grid>
            </Grid>
          )}
          {prixerDataState === "edit" && (
            <Grid item xs={12} container>
              <Grid item xs container direction="column">
                <Grid item xs>
                  <Grid item xs={7} style={{ marginBottom: 10 }}>
                    <TextField
                      id="firstName"
                      variant="outlined"
                      label="Nombre"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={7}>
                    <TextField
                      id="lastName"
                      variant="outlined"
                      label="Apellido"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={7}>
                    <InputLabel
                      id="demo-simple-select-label"
                      variant="outlined"
                    >
                      Especialidad
                    </InputLabel>
                  </Grid>
                  <Grid item xs style={{ marginBottom: 10 }}>
                    <Select
                      labelId="Especialidad"
                      id="specialty"
                      variant="outlined"
                      onChange={(e) => {
                        setSpecialty(e.target.value);
                      }}
                      value={
                        specialty === "Ambas"
                          ? "Fotografía y Diseño"
                          : specialty
                      }
                    >
                      <MenuItem value="Fotografía">Fotografía</MenuItem>
                      <MenuItem value="Diseño">Diseño</MenuItem>
                      <MenuItem value="Fotografía y Diseño">
                        Fotografía y Diseño
                      </MenuItem>
                    </Select>
                  </Grid>
                  {/* <Grid item xs={7}>
                <TextField id="username" variant="outlined" label="Username" onChange={handleTest} value={username}/>
                </Grid> */}
                  <Grid item xs={7}>
                    <TextField
                      id="instagram"
                      variant="outlined"
                      label="Instagram"
                      onChange={(e) => {
                        setInstagram(e.target.value);
                      }}
                      value={instagram}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs>
                <TextField
                  id="description"
                  label="Descripción"
                  onChange={(e) => {
                    setDescription(e.target.value);
                  }}
                  value={description}
                  multiline
                />
              </Grid>

              <Grid item>
                {avatarObj ? (
                  <Avatar className={classes.avatar}>
                    <label htmlFor="file-input">
                      <img
                        src={avatarObj}
                        alt="Prixer profile avatar"
                        style={{ maxHeight: 200 }}
                      />
                    </label>
                    <input
                      style={{ display: "none" }}
                      accept="image/*"
                      id="file-input"
                      type="file"
                      onChange={onImageChange}
                      required
                    />
                  </Avatar>
                ) : (
                  <Avatar className={classes.avatar}>
                    <label htmlFor="file-input">
                      <AddIcon
                        style={{ width: 60, height: 60, color: "#d33f49" }}
                      />
                    </label>
                    <input
                      style={{ display: "none" }}
                      accept="image/*"
                      id="file-input"
                      type="file"
                      onChange={onImageChange}
                    />
                  </Avatar>
                )}
              </Grid>
            </Grid>
          )}
        </Grid>
      </Paper>
    </div>
  ) : (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Backdrop className={classes.backdrop} open={backdrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid container spacing={1}>
          <Grid item xs={12} container>
            <Grid item xs container direction="column" spacing={2}>
              <Grid item xs>
                <Typography gutterBottom variant="subtitle1">
                  Increíble, pero cierto
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Este usuario no existe
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Inténtalo de nuevo | ig: Wrong
                </Typography>
              </Grid>
            </Grid>
            {/* <Typography variant="body1" color="textSecondary" maxWidth="60%">
                  {description}
            </Typography> */}
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
