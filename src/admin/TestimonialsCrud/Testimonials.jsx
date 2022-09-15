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
import CardMedia from "@material-ui/core/CardMedia";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";

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
    margin: "auto",
    marginBottom: "20px",
  },
  input: {
    padding: "2",
  },
  title: {
    flexGrow: 1,
  },
  avatar: {
    width: "80px",
    height: "80px",
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
  const [avatar, setAvatar] = useState(/*{ file: "", _id: "" }*/ "");
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [footer, setFooter] = useState("");
  const [tiles, setTiles] = useState([]);
  const [backdrop, setBackdrop] = useState(true);
  const theme = useTheme();
  const [avatarObj, setAvatarObj] = useState("");
  const [avatarPic, setAvatarPic] = useState("");
  const [inputChange, setInputChange] = useState(false);
  const [state, setState] = useState({
    checkedA: true,
  });

  const [loading, setLoading] = useState(false);
  // const [buttonState, setButtonState] = useState(true);
  // const history = useHistory();

  // const setValueText = (event) => {
  //   setValue(event.target.value);
  // };
  const handleChangeType = (event) => {
    setType(event.target.value);
  };

  const [errorMessage, setErrorMessage] = useState();
  const [snackBarError, setSnackBarError] = useState(false);

  useEffect(() => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/testimonial/read-all";
    axios.get(base_url).then((response) => {
      setTiles(response.data.testimonials);
      setBackdrop(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type || !name || !value || avatar || !footer || !state) {
      setErrorMessage("Por favor completa todos los campos requeridos.");
      setSnackBarError(true);
      e.preventDefault();
    } else {
      setLoading(true);
      // setButtonState(true);

      const formData = new FormData();
      formData.append("avatar", avatarPic);
      formData.append("type", type);
      formData.append("name", name);
      formData.append("value", value);
      formData.append("footer", footer);
      formData.append("status", state.checkedA);
      console.log(formData);
      const base_url =
        process.env.REACT_APP_BACKEND_URL + "/testimonial/create";

      const response = await axios.post(base_url, formData, {
        "Content-Type": "multipart/form-data",
      });
      setLoading(false);
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
  const deleteTestimonial = async (d) => {
    d.preventDefault();
    setLoading(true);
    const base_url = process.env.REACT_APP_BACKEND_URL + "/testimonial/delete";
    let res = await axios.delete(base_url);
    setLoading(false);
  };
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // const handleTestimonialDataEdit = async () => {
  //   setBackdrop(true);
  //   var formData = new FormData();
  //   if (inputChange) {
  //     formData.append("avatar", avatarPic);
  //   }
  //   formData.append("type", type);
  //   formData.append("name", name);
  //   formData.append("value", value);
  //   formData.append("footer", footer);
  //   formData.append("state", state);

  //   const base_url = process.env.REACT_APP_BACKEND_URL + "/testimonial/update";
  //   const response = await axios.put(base_url, formData);
  //   if (response.data) {
  //     setAvatar(response.data.avatar);
  //     setType(response.data.type);
  //     setName(response.data.name);
  //     setValue(response.data.value);
  //     setFooter(response.data.footer);
  //     setAvatarObj(response.data.avatar);
  //     setAvatarPic(response.data.avatar);
  //     setBackdrop(false);
  //   } else {
  //     setBackdrop(false);
  //   }
  // };
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
                            alt="testimonial avatar"
                            style={{ maxHeight: 80 }}
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
                  <Grid
                    item
                    xs={8}
                    sm={8}
                    md={8}
                    lg={8}
                    xl={8}
                    padding={10}
                    // style={{ display: "flex", alignItems: "center" }}
                  >
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
                      {/* <option value="Prixer">Prixer</option>
                        <option value="Compañía">Compañía</option>
                        <option selected value="Cliente">
                          Cliente
                        </option> */}
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
                      inputProps={{ maxLenght: 300 }}
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
                      // justifyContent: "end",
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
                    {/* <Typography color="secondary">
                      Mostrar en el inicio
                    </Typography>
                    <Switch
                      color={"primary"}
                      checked={state.checkedA}
                      onChange={handleChangeState}
                      name="state"
                      // value={state.checkedA}
                      inputProps={{ "aria-label": "secondary checkbox" }}
                    /> */}
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
                  onClick={handleSubmit}
                >
                  Crear testimonio
                </Button>
              </form>
            </Paper>
          </Grid>

          {tiles &&
            tiles.map((tile) => (
              <Paper
                key={tile._id}
                style={{
                  padding: isMobile ? "4px" : "24px",
                }}
                className={classes.paper}
                item
                // style={{ padding: isMobile ? "18px 0px" : "24px 24px" }}
                xs={6}
                sm={6}
                md={4}
                lg={4}
                xl={4}
              >
                <Grid container spacing={1} style={{ padding: "10px" }}>
                  {loading && (
                    <div className={classes.loading}>
                      <CircularProgress />
                    </div>
                  )}
                  <Grid
                    marginBottom={2}
                    item
                    xs={4}
                    style={{ display: "flex", justifyContent: "center" }}
                  >
                    <Avatar className={classes.avatar}>
                      <CardMedia
                        alt={tile.title}
                        height="60"
                        image={tile.avatar}
                        className={classes.cardMedia}
                        title={tile.title}
                      />
                      <img
                        src={avatarPic}
                        alt="testimonial avatar"
                        style={{ maxHeight: 200 }}
                      />
                    </Avatar>
                  </Grid>
                  <Grid
                    item
                    xs
                    padding={10}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Typography>{tile.name}</Typography>
                    <Typography variant={"p"} color={"secondary"}>
                      {tile.type}
                    </Typography>
                  </Grid>
                  <Box item sm={8}>
                    <EditIcon color={"secondary"} />{" "}
                    <DeleteIcon
                      color={"secondary"}
                      onClick={deleteTestimonial}
                    />
                  </Box>
                  <Grid item xs={12}>
                    <Typography variant={"body2"}>{tile.value}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant={"body2"} color="secondary">
                      {tile.footer}
                    </Typography>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    style={{ display: "flex", justifyContent: "end" }}
                  >
                    <Switch
                      checked={tile.state /*.checkedA*/}
                      color="primary"
                      onChange={handleChange}
                      name="checkedA"
                      value={tile.state}
                      inputProps={{ "aria-label": "secondary checkbox" }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
        </Grid>
      </Paper>
    </div>
  );
}
