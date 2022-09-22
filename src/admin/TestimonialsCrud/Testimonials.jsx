import { React, useState, useEffect } from "react";
import axios from "axios";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { Backdrop } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import AppBar from "@material-ui/core/AppBar";
import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import AddIcon from "@material-ui/icons/Add";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import Snackbar from "@material-ui/core/Snackbar";

function getStyles(type, theme) {
  return {
    fontWeight:
      type.indexOf(type) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

const useStyles = makeStyles((theme) => ({
  cardMedia: {
    paddingTop: "81.25%",
    borderRadius: "50%",
    margin: "28px",
  },
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
    margin: "15px",
  },
  input: {
    padding: "2",
  },
  title: {
    flexGrow: 1,
  },
  avatar: {
    width: 80,
    height: 80,
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
  const [testimonialDataState, setTestimonialDataState] = useState("read"); // borrar
  const [avatar, setAvatar] = useState({ file: "", _id: "" });
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [footer, setFooter] = useState("");
  const [tiles, setTiles] = useState([]);
  const [backdrop, setBackdrop] = useState(true); // borrar
  const theme = useTheme();
  const [avatarObj, setAvatarObj] = useState("");
  const [avatarPic, setAvatarPic] = useState("");
  const [inputChange, setInputChange] = useState(false);
  const [state, setState] = useState({
    checkedA: true,
  });
  const [updateId, setUpdateId] = useState();
  const [loading, setLoading] = useState(false);
  const handleChangeType = (event) => {
    setType(event.target.value);
  };

  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  const readTestimonial = async () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/testimonial/read-all";
    const res = await axios
      .get(base_url)
      .then((response) => {
        setTiles(response.data.testimonials);
        setBackdrop(false);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    readTestimonial();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!type || !name || !value || !avatar || footer || !state) {
      setErrorMessage("Por favor completa todos los campos requeridos.");
      setSnackBarError(true);
    } else {
      setLoading(true);
      const formData = new FormData();
      formData.append("avatar", avatarPic);
      formData.append("type", type);
      formData.append("name", name);
      formData.append("value", value);
      formData.append("footer", footer);
      formData.append("status", state.checkedA);

      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/testimonial/create";

      const response = axios
        .post(base_url, formData, {
          "Content-Type": "multipart/form-data",
        })
        .then((response) => {
          if (response.data.success === false) {
            setLoading(false);
            setErrorMessage(response.data.message);
            setSnackBarError(true);
          } else {
            setErrorMessage("Creación de testimonio exitoso");
            setSnackBarError(true);
            setLoading(false);
            readTestimonial();
          }
        })

        .catch((error) => {
          setLoading(false);
          console.log(error.response);
        });
    }
  };

  const handleChange = (event) => {
    setState({ ...state, [event.target.name]: event.target.checked });
  }; //Switch

  const onImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setInputChange(true);
      setAvatarObj(URL.createObjectURL(e.target.files[0]));
      setAvatarPic(e.target.files[0]);
    } //Avatar
  };
  const deleteTestimonial = async (DeleteId) => {
    setLoading(true);
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/testimonial/read/" + DeleteId;
    let res = await axios.delete(base_url);
    setErrorMessage("Testimonio eliminado exitosamente");
    setSnackBarError(true);
    setLoading(false);
    readTestimonial();
  };

  const GetIdForEdit = async () => {
    // borrar
    setUpdateId();
    handleTestimonialDataEdit();
  };
  const handleTestimonialDataEdit = async (GetId) => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/testimonial/" + GetId;
    const response = await axios.get(base_url);
    setName(response.data.name);
    setAvatarObj(response.data.avatar);
    setType(response.data.type);
    setValue(response.data.value);
    setFooter(response.data.footer);
    setState(response.data.status);
    setUpdateId(GetId);
  };

  const saveChanges = async (e, GetId) => {
    e.preventDefault();
    setLoading(true);
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/testimonial/update/" + GetId;
    const formData = new FormData();
    formData.append("avatar", avatarPic);
    formData.append("type", type);
    formData.append("name", name);
    formData.append("value", value);
    formData.append("footer", footer);
    formData.append("status", state.checkedA);
    const response = await axios.put(base_url, formData, {
      "Content-Type": "multipart/form-data",
    });
    setName("");
    setAvatarObj("");
    setType("");
    setValue("");
    setFooter("");
    setState(false);
    setUpdateId(undefined);
    setLoading(false);
    readTestimonial();
  };
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
            padding: isMobile ? "0px" : "18px",
            display: "flex",
            textAlign: "start",
          }}
        >
          <Grid
            style={{
              padding: isMobile ? "0px" : "24px",
              paddingBottom: "15px",
              margin: isMobile ? "0px" : "15px",
            }}
            className={classes.paper}
            item
            xs={12}
            sm={12}
            md={12}
            lg={10}
            xl={10}
          >
            <Paper
              style={{ padding: isMobile ? "8px" : "24px" }}
              className={classes.paper}
              xs={12}
              sm={12}
            >
              <form
                encType="multipart/form-data"
                onSubmit={handleSubmit}
                className={classes.form}
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
                            alt="testimonial avatar"
                            style={{
                              maxHeight: 80,
                            }}
                          />
                        </label>
                        <input
                          style={{ display: "none" }}
                          accept="image/*"
                          id="file-input"
                          type="file"
                          onChange={onImageChange}
                          required
                          name="avatar"
                        />
                      </Avatar>
                    ) : (
                      <Avatar className={classes.avatar}>
                        <label htmlFor="file-input">
                          <AddIcon
                            style={{
                              width: 40,
                              height: 40,
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
                          name="avatar"
                        />
                      </Avatar>
                    )}
                  </Box>
                  <Grid item xs={8} sm={8} md={8} lg={8} xl={8} padding={10}>
                    <InputLabel style={{ fontSize: ".85em" }}>Tipo</InputLabel>
                    <Select
                      style={{ width: "100%" }}
                      labelId="tipo"
                      id="tipo"
                      value={type}
                      onChange={(e) => handleChangeType(e)}
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
                    </Select>
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
                  <Grid item xs={12} sm={12}>
                    <TextField
                      autoComplete="fname"
                      name="value"
                      variant="outlined"
                      fullWidth
                      type="text"
                      value={value}
                      inputProps={{ maxLenght: 160 }}
                      id="value"
                      label="Body"
                      autoFocus
                      multiline
                      rows={3}
                      onChange={(e) => {
                        setValue(e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      variant="outlined"
                      fullWidth
                      name="footer"
                      label="Footer"
                      type="text"
                      value={footer}
                      inputProps={{ maxLenght: 60 }}
                      id="footer"
                      autoComplete="fname"
                      onChange={(e) => {
                        setFooter(e.target.value);
                      }}
                      multiline
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <FormGroup row>
                      <FormControlLabel
                        label="Mostrar en la página de inicio"
                        style={{ color: "secondary" }}
                        control={
                          <Switch
                            color="primary"
                            checked={state.checkedA}
                            onChange={handleChange}
                            name="checkedA"
                          />
                        }
                      ></FormControlLabel>
                    </FormGroup>
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  width={"100px"}
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  value="submit"
                  paddingTop="4"
                  onClick={(event) =>
                    updateId
                      ? saveChanges(event, updateId)
                      : handleSubmit(event)
                  }
                >
                  {updateId ? "Actualizar testimonio" : "Crear testimonio"}
                </Button>
              </form>
            </Paper>
          </Grid>

          {tiles.map((tile) => (
            <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
              <Paper
                className={classes.paper}
                style={{
                  padding: "15px",
                  height: 300,
                }}
              >
                <Grid key={tile._id} style={{ width: "100%" }}>
                  <Grid container spacing={1}>
                    {loading && (
                      <div className={classes.loading}>
                        <CircularProgress />
                      </div>
                    )}
                    <Grid marginBottom={2} style={{ width: "100%" }}>
                      <Box style={{ display: "flex", justifyContent: "end" }}>
                        <Switch
                          checked={tile.status}
                          color="primary"
                          onChange={handleChange}
                          name="checkedA"
                          value={tile.status}
                          inputProps={{
                            "aria-label": "secondary checkbox",
                          }}
                        />
                        <Button
                          style={{ marginLeft: "10px" }}
                          onClick={() => handleTestimonialDataEdit(tile._id)}
                        >
                          <EditIcon color={"secondary"} />
                        </Button>
                        <Button onClick={() => deleteTestimonial(tile._id)}>
                          <DeleteIcon color={"secondary"} />
                        </Button>
                      </Box>
                      <Box style={{ display: "flex", paddingLeft: "20px" }}>
                        <Avatar className={classes.avatar} src={tile.avatar} />
                        <Box
                          style={{
                            paddingLeft: "30px",
                          }}
                        >
                          <Typography>{tile.name}</Typography>
                          <Typography variant={"p"} color={"secondary"}>
                            {tile.type}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        style={{
                          paddingTop: "10px",
                        }}
                      >
                        <Typography
                          variant={"body2"}
                          style={{
                            display: "flex",
                            textAlign: "center",
                            justifyContent: "center",
                          }}
                        >
                          {tile.value}
                        </Typography>
                      </Box>
                      <Box
                        style={{
                          paddingTop: "8px",
                        }}
                      >
                        <Typography
                          variant={"body2"}
                          color="secondary"
                          style={{
                            display: "flex",
                            textAlign: "center",
                            justifyContent: "center",
                          }}
                        >
                          {tile.footer}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
          <Snackbar
            open={snackBarError}
            autoHideDuration={4000}
            onClose={() => {
              setSnackBarError(false);
            }}
            message={errorMessage}
            className={classes.snackbar}
          />
        </Grid>
      </Paper>
    </div>
  );
}
