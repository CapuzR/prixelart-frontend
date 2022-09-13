import { React, useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Backdrop } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import AddIcon from "@material-ui/icons/Add";
import useMediaQuery from "@material-ui/core/useMediaQuery";

function getStyles(type, theme) {
  return {
    fontWeight:
      type.indexOf(type) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const useStyles = makeStyles((theme) => ({
  loading: {
    display: "flex",
    "& > * + *": {
      marginLeft: theme.spacing(2),
    },
    marginLeft: "50vw",
    marginTop: "50vh",
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
  paper: {
    padding: theme.spacing(2),
    margin: "auto",
    width: "100%",
  },
  input: {
    padding: "2",
  },
  title: {
    flexGrow: 1,
  },
  avatar: {
    width: "60px",
    height: "60px",
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

export default function Testimonials() {
  const classes = useStyles();
  const [avatar, setAvatar] = useState("");
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [footer, setFooter] = useState("");
  const [tiles, setTiles] = useState([]);
  const [backdrop, setBackdrop] = useState(true);
  const theme = useTheme();
  const [avatarObj, setAvatarObj] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [inputChange, setInputChange] = useState(false);
  const [state, setState] = useState({
    checkedA: true,
  });
  // const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(true);
  const history = useHistory();

  // class TypeOfComment {
  //   constructor(props) {
  //     super(props);
  //     this.state = { value: "Client" };
  //     this.handleChange = this.handleChange.bind(this);
  //     this.handleSubmit = this.handleSubmit.bind(this);
  //   }
  // }

  const setValueText = (event) => {
    setValue(event.target.value);
  };
  const handleChange = (event) => {
    setType(event.target.value);
  };
  // const handleChange = (event) => {
  //   this.setType({ value: event.target.type });
  // };

  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  // useEffect(() => {
  //   const base_url =
  //     process.env.REACT_APP_BACKEND_URL + "/testimonial/read-all";

  //   axios.get(base_url).then((response) => {
  //     setTiles(utils.shuffle(response.data.Testimonials));
  //     setBackdrop(false);
  //   });
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !name || !value || !avatar || !footer || !state) {
      setErrorMessage("Por favor completa todos los campos requeridos.");
      setSnackBarError(true);
      e.preventDefault();
      // setIsChecked(true);
    } else {
      setLoading(true);
      setButtonState(true);
      const data = {
        type: type,
        name: name,
        value: value,
        avatar: avatar,
        footer: footer,
        status: state,
        // avatar: cldAvatarUrl,
        // name: JSON.parse(localStorage.getItem("token")).name,
      };
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/testimonial/create";
      // const cldAvatarUrl = await uploadToCld();

      const response = await axios
        .post(base_url, data)
        .then((response) => {
          if (response.data.success === false) {
            setLoading(false);
            setButtonState(false);
            setErrorMessage(response.data.message);
            setSnackBarError(true);
          } else {
            setErrorMessage("Creación de testimonio exitoso.");
            setSnackBarError(true);
            // history.push({
            //   pathname: "/" + response.data.testimonialData.name,
            // });
          }
          console.log(data);
        })

        .catch((error) => {
          setLoading(false);
          setButtonState(false);
          console.log(error.response);
        });
    }
  };

  const handleChangeState = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  }; //Switch

  const onImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setInputChange(true);
      setAvatarObj(URL.createObjectURL(e.target.files[0]));
      setProfilePic(e.target.files[0]);
    } //Avatar
  };
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleProfileDataEdit = async () => {
    setBackdrop(true);
    var formData = new FormData();
    if (inputChange) {
      formData.append("avatar", avatar);
    }
    formData.append("type", type);
    formData.append("name", name);
    formData.append("value", value);
    formData.append("footer", footer);
    formData.append("state", state);

    const base_url = process.env.REACT_APP_BACKEND_URL + "/testimonial/update";
    const response = await axios.put(base_url, formData);
    if (response.data) {
      setAvatar(response.data.avatar);
      setType(response.data.type);
      setName(response.data.name);
      setValue(response.data.value);
      setFooter(response.data.footer);
      setAvatarObj(response.data.avatar);
      setProfilePic(response.data.avatar);
      setBackdrop(false);
    } else {
      setBackdrop(false);
    }
  };
  return (
    <div className={classes.root}>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress />
      </Backdrop>
      <Paper className={classes.paper}>
        <AppBar position="static">
          <Typography
            style={{
              display: "flex",
              alignContent: "center",
              padding: "10px 40px",
            }}
            variant="h6"
            className={classes.title}
          >
            Testimonios
          </Typography>
        </AppBar>

        <Grid
          container
          spacing={2}
          xs={12}
          style={{
            width: "100%",
            padding: isMobile ? "18px" : "0px",
            display: "flex",
            textAlign: "start",
          }}
        >
          <Grid
            style={{
              padding: isMobile ? "0px" : "24px",
              paddingBottom: "15px",
            }}
            className={classes.paper}
            item
            xs={12}
            sm={12}
            md={6}
            lg={6}
            xl={6}
          >
            <Paper
              style={{ padding: isMobile ? "8px" : "24px" }}
              className={classes.paper}
              xs={12}
              sm={12}
            >
              <form
                onSubmit={handleSubmit}
                className={classes.form}
                // noValidate
                margin={6}
              >
                <Grid container spacing={1} style={{ paddingBottom: "10px" }}>
                  {loading && (
                    <div className={classes.loading}>
                      <CircularProgress />
                    </div>
                  )}
                  <Box
                    padding={"4px"}
                    paddingRight={4}
                    paddingLeft={2}
                    style={{
                      width: "30%",
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
                            style={{ maxHeight: 65 }}
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
                            style={{
                              width: 60,
                              height: 60,
                              color: "#d33f49",
                            }}
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
                  <Grid item xs={8} sm={8} md={8} lg={6} xl={6} padding={10}>
                    <InputLabel style={{ fontSize: ".85em" }}>Tipo</InputLabel>
                    <Select
                      style={{ width: "100%" }}
                      labelId="tipo"
                      id="tipo"
                      value={type}
                      onChange={(e) => handleChange(e)}
                      MenuProps={MenuProps}
                    >
                      {["Prixer", "Compañía", "Cliente"].map((type) => (
                        <MenuItem
                          key={type}
                          value={type}
                          style={getStyles(type, theme)}
                        >
                          {type}
                        </MenuItem>
                      ))}
                      {/* <option value="Prixer">Prixer</option>
                        <option value="Compañía">Compañía</option>
                        <option selected value="Cliente">
                          Cliente
                        </option> */}
                    </Select>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      name="footer"
                      label="footer"
                      type="text"
                      value={footer}
                      inputProps={{ maxLenght: 300 }}
                      id="footer"
                      autoComplete="fname"
                      onChange={(e) => {
                        setFooter(e.target.value);
                      }}
                      multiline
                    />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <TextField
                      autoComplete="fname"
                      name="name"
                      variant="outlined"
                      fullWidth
                      type="text"
                      value={name}
                      id="name"
                      label="Nombre"
                      autoFocus
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid item sm={12} md={8}>
                    <TextField
                      autoComplete="fname"
                      name="value"
                      variant="outlined"
                      fullWidth
                      type="text"
                      value={value}
                      id="value"
                      label="value"
                      autoFocus
                      onChange={(e) => {
                        setValue(e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    {/* <TextField
                        name="status"
                        label="status"
                        id="status"
                        autoComplete="fname"
                        onChange={(e) => {
                          setStatus(e.target.value);
                        }}
                      /> */}
                    <Switch
                      color={"primary"}
                      checked={state.checkedA}
                      onChange={handleChangeState}
                      name="checkedA"
                      value={state}
                      inputProps={{ "aria-label": "secondary checkbox" }}
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  value="submit"
                  paddingTop="4"
                  onClick={handleSubmit}
                >
                  Crear testimonio
                </Button>
              </form>
            </Paper>
          </Grid>

          <Grid
            style={{ padding: isMobile ? "0px" : "24px" }}
            // padding={"24px"}
            className={classes.paper}
            // display={"flex"}
            item
            xs={12}
            sm={12}
            md={6}
            lg={6}
            xl={6}
          >
            <Paper
              style={{ padding: isMobile ? "4px" : "24px" }}
              className={classes.paper}
              xs={12}
              sm={12}
            >
              <form
                onSubmit={handleSubmit}
                className={classes.form}
                // noValidate
                margin={6}
              >
                <Grid container spacing={1} style={{ paddingBottom: "10px" }}>
                  {loading && (
                    <div className={classes.loading}>
                      <CircularProgress />
                    </div>
                  )}
                  <Box marginBottom={2}>
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
                            style={{
                              width: 60,
                              height: 60,
                              color: "#d33f49",
                            }}
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
                  <Grid
                    item
                    xs={6}
                    padding={10}
                    display={"flex"}
                    alignItems={"center"}
                  >
                    <InputLabel style={{ fontSize: ".85em" }}>Tipo</InputLabel>
                    <Select
                      style={{ width: "100%" }}
                      labelId="tipo"
                      id="tipo"
                      value={type}
                      onChange={(e) => handleChange(e)}
                      MenuProps={MenuProps}
                    >
                      {["Prixer", "Compañía", "Cliente"].map((type) => (
                        <MenuItem
                          key={type}
                          value={type}
                          style={getStyles(type, theme)}
                        >
                          {type}
                        </MenuItem>
                      ))}
                      {/* <option value="Prixer">Prixer</option>
                      <option value="Compañía">Compañía</option>
                      <option selected value="Cliente">
                        Cliente
                      </option> */}
                    </Select>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      name="footer"
                      label="footer"
                      type="text"
                      value={footer}
                      inputProps={{ maxLenght: 300 }}
                      id="footer"
                      autoComplete="fname"
                      onChange={(e) => {
                        setFooter(e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <TextField
                      autoComplete="fname"
                      name="name"
                      variant="outlined"
                      fullWidth
                      type="text"
                      value={name}
                      id="name"
                      label="Nombre"
                      autoFocus
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      autoComplete="fname"
                      name="value"
                      variant="outlined"
                      fullWidth
                      type="text"
                      value={value}
                      id="value"
                      label="value"
                      autoFocus
                      onChange={(e) => {
                        setValue(e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    {/* <TextField
                      name="status"
                      label="status"
                      id="status"
                      autoComplete="fname"
                      onChange={(e) => {
                        setStatus(e.target.value);
                      }}
                    /> */}
                    <Switch
                      checked={state.checkedA}
                      onChange={handleChangeState}
                      name="checkedA"
                      value={state}
                      inputProps={{ "aria-label": "secondary checkbox" }}
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  value="submit"
                  paddingTop="4"
                  onClick={handleSubmit}
                >
                  Crear testimonio
                </Button>
              </form>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
