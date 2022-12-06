// Debo hacer los unit y functional tests.
// Debo migrar los states a Redux.

import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { useState, useEffect } from "react";
import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import axios from "axios";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import CircularProgress from "@material-ui/core/CircularProgress";
import Avatar from "@material-ui/core/Avatar";
import AddIcon from "@material-ui/icons/Add";
import Backdrop from "@material-ui/core/Backdrop";
import InstagramIcon from "@material-ui/icons/Instagram";
import FacebookIcon from "@material-ui/icons/Facebook";
import TwitterIcon from "@material-ui/icons/Twitter";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { useHistory } from "react-router-dom";

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
    display: "grid",
  },
  paper: {
    padding: theme.spacing(2),
    margin: "auto",
    // width: "100%",
  },
  image: {
    width: 128,
    height: 128,
  },
  snackbar: {
    [theme.breakpoints.down("xs")]: {
      bottom: 90,
    },
    margin: {
      margin: theme.spacing(1),
    },
    withoutLabel: {
      marginTop: theme.spacing(3),
    },
    textField: {
      width: "25ch",
    },
  },
  img: {
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  },
  avatar: {
    display: "flex",
    "& > *": {},
    objectFit: "cover",
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
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function UserData(props) {
  const classes = useStyles();
  const [prixerDataState, setPrixerDataState] = useState("read");
  const [username, setUsername] = useState();
  const [email, setEmail] = useState();
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [specialtyArt, setSpecialtyArt] = useState([]);
  const [instagram, setInstagram] = useState();
  const [facebook, setFacebook] = useState();
  const [twitter, setTwitter] = useState();
  const [description, setDescription] = useState();
  const [dateOfBirth, setDateOfBirth] = useState();
  const [phone, setPhone] = useState();
  const [country, setCountry] = useState();
  const [city, setCity] = useState();
  const [ready, setReady] = useState(false);
  const [prixerExists, setPrixerExists] = useState(false);
  const [avatarObj, setAvatarObj] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [inputChange, setInputChange] = useState(false);
  const [backdrop, setBackdrop] = useState(true);
  const theme = useTheme();
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [prixer, setPrixer] = useState();

  function getStyles(specialty, specialtyArt, theme) {
    return {
      fontWeight:
        specialty.indexOf(specialty) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

  useEffect(() => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/prixer/read";
    const data = {
      username: props.prixerUsername,
    };

    axios
      .post(base_url, data)
      .then((response) => {
        if (!response.data.status) {
          return history.push("/");
        }
        setUsername(response.data.username);
        setEmail(response.data.email);
        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);
        setSpecialtyArt(response.data.specialtyArt);
        setInstagram(response.data.instagram);
        setFacebook(response.data.facebook);
        setTwitter(response.data.twitter);
        setDescription(response.data.description);
        setDateOfBirth(response.data.dateOfBirth);
        setPhone(response.data.phone);
        setCountry(response.data.country);
        setCity(response.data.city);
        setAvatarObj(response.data.avatar);
        setProfilePic(response.data.avatar);
        setPrixer(response.data);
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
      formData.append("avatar", profilePic || avatarObj);
      formData.append("username", username);
      formData.append("firstName", firstName);
      formData.append("email", email);
      formData.append("lastName", lastName);
      formData.append("specialtyArt", specialtyArt);
      formData.append("instagram", instagram);
      formData.append("facebook", facebook);
      formData.append("twitter", twitter);
      formData.append("description", description);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("phone", phone);
      formData.append("country", country);
      formData.append("city", city);
      console.log(formData);
      const base_url = process.env.REACT_APP_BACKEND_URL + "/prixer/update";
      const response = await axios.post(base_url, formData, {
        "Content-Type": "multipart/form-data",
      });
      if (response.data) {
        setUsername(response.data.username);
        setEmail(response.data.email);
        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);
        setSpecialtyArt(response.data.specialtyArt);
        setInstagram(response.data.instagram);
        setFacebook(response.data.facebook);
        setTwitter(response.data.twitter);
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
  const handleChange = (e) => {
    setSpecialtyArt(e.target.value);
  };
  return prixerExists ? (
    <div className={classes.root}>
      <Backdrop className={classes.backdrop} open={backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Paper
        className={classes.paper}
        style={{ width: isDesktop ? "50%" : "100%" }}
      >
        {prixerDataState === "read" && (
          <>
            <Box style={{ textAlign: "end", marginBottom: "4px" }}>
              {JSON.parse(localStorage.getItem("token")) &&
                JSON.parse(localStorage.getItem("token")).username ===
                  username && (
                  <IconButton
                    title="Profile Edit"
                    component="span"
                    color="primary"
                    onClick={handleProfileDataEdit}
                    variant="contained"
                    // style={{ marginBottom: "8px" }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
              <Grid container spacing={2}>
                <Grid
                  item
                  xs={12}
                  sm={4}
                  md={4}
                  lg={4}
                  xl={4}
                  // style={{ marginLeft: 15 }}
                >
                  <Box
                    style={{
                      marginBottom: "4px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {avatarObj ? (
                      <Avatar
                        className={classes.avatar}
                        src={profilePic}
                        alt="Prixer profile avatar"
                      />
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
                  </Box>
                </Grid>
                <Grid item xs={12} sm={8} md={8} lg={8} xl={8}>
                  <Box
                    display={"flex"}
                    style={{
                      marginBottom: "4px",
                      justifyContent: isMobile ? "center" : "flexstart",
                    }}
                  >
                    <Typography variant="body1">
                      {specialtyArt?.map((specialty, index) =>
                        specialtyArt?.length === index + 1
                          ? specialty
                          : `${specialty}, `
                      )}
                    </Typography>
                    {/* <Typography variant="h5">
                    {firstName} {lastName}
                  </Typography> */}
                  </Box>
                  <Box
                    display={"flex"}
                    style={{
                      marginBottom: "4px",
                      justifyContent: isMobile ? "center" : "flexstart",
                    }}
                  >
                    <Typography variant="body1" color="textSecondary">
                      {username}
                    </Typography>
                  </Box>
                  {/* <Box style={{ marginBottom: "4px" }}>
                  <Typography variant="body1">
                    {specialtyArt?.map((specialty, index) =>
                      specialtyArt?.length === index + 1
                        ? specialty
                        : `${specialty}, `
                    )}
                  </Typography>
                </Box> */}

                  <Box
                    display={"flex"}
                    style={{
                      marginBottom: "4px",
                      justifyContent: isMobile ? "center" : "flexstart",
                    }}
                  >
                    <Typography>{description}</Typography>
                  </Box>
                  <Box
                    style={{
                      marginBottom: "4px",
                      justifyContent: isMobile ? "center" : "flexstart",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <InstagramIcon style={{ marginRight: "4px" }} />
                    <a
                      target="_blank"
                      href={"https://www.instagram.com/" + instagram}
                      style={{ textDecoration: "none", color: "#d33f49" }}
                    >
                      {instagram}
                    </a>
                  </Box>
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "4px",
                      justifyContent: isMobile ? "center" : "flexstart",
                    }}
                  >
                    {facebook && (
                      <>
                        <FacebookIcon style={{ marginRight: "4px" }} />
                        <a
                          target="_blank"
                          href={"https://www.facebook.com/" + facebook}
                          style={{ textDecoration: "none", color: "#d33f49" }}
                        >
                          {facebook}
                        </a>
                      </>
                    )}
                  </Box>
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "4px",
                      justifyContent: isMobile ? "center" : "flexstart",
                    }}
                  >
                    {twitter && (
                      <>
                        <TwitterIcon style={{ marginRight: "4px" }} />
                        <a
                          target="_blank"
                          href={"https://www.twitter.com/" + twitter}
                          style={{ textDecoration: "none", color: "#d33f49" }}
                        >
                          {twitter}
                        </a>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
        {prixerDataState === "edit" && (
          <>
            <Box style={{ textAlign: "end", marginBottom: "4px" }}>
              {JSON.parse(localStorage.getItem("token")) &&
                JSON.parse(localStorage.getItem("token")).username ===
                  username && (
                  <Button
                    color="primary"
                    onClick={handleProfileDataEdit}
                    variant="contained"
                    style={{ marginBottom: "8px" }}
                  >
                    Editar
                  </Button>
                )}
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12} md={6} lg={6} xl={6}>
                <Box>
                  <Box
                    marginBottom={2}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {avatarObj ? (
                      <Avatar className={classes.avatar}>
                        <label htmlFor="file-input">
                          <img
                            src={avatarObj}
                            alt="Prixer profile avatar"
                            style={{ height: 200, objectFit: "cover" }}
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
                  </Box>
                  <Box style={{ marginBottom: "8px" }}>
                    <TextField
                      fullWidth
                      id="firstName"
                      variant="outlined"
                      label="Nombre"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                    />
                  </Box>
                  <Box style={{ marginBottom: "8px" }}>
                    <TextField
                      fullWidth
                      id="lastName"
                      variant="outlined"
                      label="Apellido"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                    />
                  </Box>
                  <Box>
                    <FormControl
                      className={classes.formControl}
                      style={{ width: "100%", marginBottom: 20 }}
                    >
                      <InputLabel id="demo-mutiple-name-label">
                        Especialidad
                      </InputLabel>
                      <Select
                        labelId="demo-multiple-name-label"
                        id="demo-multiple-name"
                        multiple
                        value={specialtyArt}
                        onChange={(e) => setSpecialtyArt(e) || handleChange(e)}
                        MenuProps={MenuProps}
                      >
                        {["Fotografía", "Diseño", "Artes plásticas"].map(
                          (specialty) => (
                            <MenuItem
                              key={specialty}
                              value={specialty}
                              style={getStyles(specialty, specialtyArt, theme)}
                            >
                              {specialty}
                            </MenuItem>
                          )
                        )}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box style={{ marginBottom: "8px" }}>
                    <TextField
                      fullWidth
                      id="instagram"
                      variant="outlined"
                      label="Instagram"
                      onChange={(e) => {
                        setInstagram(e.target.value);
                      }}
                      value={instagram}
                    />
                  </Box>
                  <Box style={{ marginBottom: "8px" }}>
                    <TextField
                      fullWidth
                      id="facebook"
                      variant="outlined"
                      label="Facebook"
                      onChange={(e) => {
                        setFacebook(e.target.value);
                      }}
                      value={facebook}
                    />
                  </Box>
                  <Box style={{ marginBottom: "8px" }}>
                    <TextField
                      fullWidth
                      id="twitter"
                      variant="outlined"
                      label="Twitter"
                      onChange={(e) => {
                        setTwitter(e.target.value);
                      }}
                      value={twitter}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      id="description"
                      label="Descripción"
                      onChange={(e) => {
                        setDescription(e.target.value);
                      }}
                      value={description}
                      inputProps={{ maxLength: 300 }}
                      multiline
                      item
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </>
        )}
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
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
