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
  const [type, setType] = useState();
  const [name, setName] = useState();
  const [value, setValue] = useState("");
  const [footer, setFooter] = useState();
  const [tiles, setTiles] = useState([]);
  const [backdrop, setBackdrop] = useState(true);
  const theme = useTheme();
  const [state, setState] = useState({
    checkedA: true,
  });
  // const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [buttonState, setButtonState] = useState(true);
  const history = useHistory();

  const setValueText = (event) => {
    setValue(event.target.value);
  };
  const handleChange = (event) => {
    setType(event.target.type);
  };

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
        // 'avatar': cldAvatarUrl,
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
  };

  return (
    <div className={classes.root}>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress />
      </Backdrop>
      <Paper className={classes.paper}>
        <AppBar position="static">
          <Tabs value={value}>
            <Tab
              label="Testimonios"
              aria-selected="true"
              style={{ display: "flex", alignContent: "center" }}
            />
          </Tabs>
        </AppBar>
        <Grid container spacing={2}>
          <Grid
            item
            xs={12}
            style={{
              width: "100%",
              padding: "24px",
              display: "flex",
              textAlign: "start",
            }}
          >
            <Grid
              padding={"24px"}
              className={classes.paper}
              item
              xs={12}
              sm={12}
              md={6}
              lg={6}
              xl={6}
            >
              <Paper padding={"24px"} className={classes.paper}>
                <form
                  onSubmit={handleSubmit}
                  className={classes.form}
                  noValidate
                  margin={6}
                >
                  <Grid container spacing={1} style={{ paddingBottom: "10px" }}>
                    {loading && (
                      <div className={classes.loading}>
                        <CircularProgress />
                      </div>
                    )}
                    <Grid item xs={6}>
                      <TextField
                        variant="outlined"
                        required
                        fullWidth
                        type="text"
                        id="avatar"
                        label="Avatar"
                        value={avatar}
                        onChange={(e) => {
                          setAvatar(e.target.value);
                        }}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={6}
                      padding={10}
                      display={"flex"}
                      alignItems={"center"}
                    >
                      <InputLabel style={{ fontSize: ".85em" }}>
                        Tipo
                      </InputLabel>
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
            <Grid
              padding={"24px"}
              className={classes.paper}
              item
              xs
              sm
              md
              lg
              xl
            ></Grid>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
}
