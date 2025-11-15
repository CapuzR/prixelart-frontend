import React, { useState, FormEvent } from "react";

import Avatar from "@mui/material/Avatar";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Grid2 from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/AddRounded";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import useMediaQuery from "@mui/material/useMediaQuery";
import Modal from "@mui/material/Modal";

import { Theme, useTheme } from "@mui/material/styles";
import { makeStyles } from "tss-react/mui";
import dayjs, { Dayjs } from "dayjs";

import { useSnackBar, useLoading } from "@context/GlobalContext";
import Copyright from "@components/Copyright/copyright";
import { createPrixer } from "../api";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import InitialTerms from "@/artist/components/Terms/index";

const useStyles = makeStyles()((theme: Theme) => {
  return {
    paper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      height: "100%",
    },
    avatar: {
      display: "flex",
      "& > *": {
        margin: "8px",
      },
      borderStyle: "solid",
      borderWidth: 1,
      borderColor: "#000",
      backgroundColor: "#fff",
      width: "160px",
      height: "160px",
    },
    form: {
      width: "100%",
    },
    submit: {
      marginTop: "24px",
      marginRight: "0px",
      marginBottom: "16px",
      marginLeft: "0px",
      fontWeight: "bold",
      textTransform: "none",
    },
    formControl: {
      margin: "8px",
      minWidth: 120,
      maxWidth: 300,
    },
    modal: {
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      width: "80%",
      maxHeight: "70vh",
      overflowY: "auto",
      backgroundColor: "white",
      padding: 40,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      textAlign: "justify",
      borderRadius: 16,
    },
    button: {
      textAlign: "center",
    },
    root: {
      height: 300,
      flexGrow: 1,
      minWidth: 300,
    },
  };
});

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
function getStyles(specialty, theme) {
  return {
    fontWeight:
      specialty.indexOf(specialty) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function PrixerRegistration() {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const theme = useTheme();

  const { showSnackBar } = useSnackBar();
  const { setLoading } = useLoading();

  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Dayjs | null>(
    dayjs("2022-04-17"),
  );
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [avatarObj, setAvatarObj] = useState("");
  const [avatarPic, setAvatarPic] = useState("");
  const [buttonState, setButtonState] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [specialty, setSpecialty] = useState<string[]>([]);
  const [modal, setModal] = useState(false);

  const specialties = ["Fotografía", "Diseño", "Artes plásticas"];
  // const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));
  const status = true;

  const handleOnChange = () => {
    setIsChecked(!isChecked);
  };

  const openModal = () => {
    setModal(!modal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !specialty ||
      !instagram ||
      !dateOfBirth ||
      !specialty ||
      !phone ||
      !country ||
      !city ||
      !isChecked
    ) {
      showSnackBar("Por favor completa todos los campos requeridos.");
      setIsChecked(true);
    } else {
      setLoading(true);
      setButtonState(true);

      const formData = new FormData();
      formData.append("specialtyArt", specialty.join());
      formData.append("instagram", instagram);
      formData.append("facebook", facebook);
      formData.append("twitter", twitter);
      formData.append("dateOfBirth", dateOfBirth.format("DD-MM-YYYY"));
      formData.append("phone", phone);
      formData.append("country", country);
      formData.append("city", city);
      formData.append("description", description);
      formData.append("termsAgree", isChecked.toString());
      formData.append("status", status.toString());
      formData.append("avatar", avatarPic);
      formData.append(
        "username",
        JSON.parse(localStorage.getItem("token")).username,
      );
      try {
        const response = await createPrixer(formData);
        if (response.data.success === false) {
          setButtonState(false);
          showSnackBar(response.data.message);
        } else {
          // const data = {
          //   balance: 0,
          //   email: JSON.parse(localStorage.getItem("token")).email,
          // }
          // const base_url =
          //   import.meta.env.VITE_BACKEND_URL + "/account/create"
          // axios.post(base_url, data, {
          //   "Content-Type": "multipart/form-data",
          // })
          // showSnackBar("Registro de Prixer exitoso.")
          const token = JSON.parse(localStorage.getItem("token"));
          token.prixerId = token.id;
          localStorage.setItem("token", JSON.stringify(token));
          navigate({
            pathname: "/prixer=" + response.data.prixerData.username,
          });
        }
      } catch (error) {
        setButtonState(false);
        console.log(error.response);
      }
    }
  };

  const handleChange = (event) => {
    setSpecialty(event.target.value);
  };

  const onImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarObj(URL.createObjectURL(e.target.files[0]));
      setAvatarPic(e.target.files[0]);
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      style={{ height: "calc(100vh - 128px)", marginTop: 100 }}
    >
      {/* <CssBaseline /> */}
      <div className={classes.paper}>
        <Typography
          component="h1"
          variant="h5"
          color="secondary"
          style={{ textAlign: "center" }}
        >
          Comparte con tus futuros clientes
        </Typography>
        <form
          onSubmit={handleSubmit}
          className={classes.form}
          style={{ marginTop: "32px" }}
          noValidate
        >
          <Grid2
            container
            spacing={3}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Grid2
              size={{ xs: 8 }}
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              {avatarObj ? (
                <Avatar
                  sx={{
                    display: "flex",
                    "& > *": {
                      margin: "8px",
                    },
                    borderStyle: "solid",
                    borderWidth: 1,
                    borderColor: "#000",
                    backgroundColor: "#fff",
                    width: "160px",
                    height: "160px",
                    cursor: "pointer",
                  }}
                >
                  <label htmlFor="file-input">
                    <img
                      src={avatarObj}
                      alt="Prixer profile avatar"
                      style={{
                        cursor: "pointer",
                        maxHeight: 160,
                        maxWidth: 160,
                        objectFit: "cover",
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
                  />
                </Avatar>
              ) : (
                <Avatar
                  sx={{
                    display: "flex",
                    "& > *": {
                      margin: "8px",
                    },
                    cursor: "pointer",
                    borderStyle: "dashed",
                    borderWidth: 2,
                    borderColor: "#404e5c",
                    backgroundColor: "#FFF",
                    width: "160px",
                    height: "160px",
                  }}
                >
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
            </Grid2>
            <Grid2 size={{ xs: 6 }}>
              <FormControl
                className={classes.formControl}
                style={{ width: "100%" }}
              >
                <InputLabel id="demo-mutiple-name-label">
                  Especialidad
                </InputLabel>
                <Select
                  labelId="demo-mutiple-name-label"
                  id="demo-mutiple-name"
                  multiple
                  value={specialty}
                  onChange={handleChange}
                  input={<Input />}
                  MenuProps={MenuProps}
                >
                  {specialties.map((specialty) => (
                    <MenuItem
                      key={specialty}
                      value={specialty}
                      style={getStyles(specialty, theme)}
                    >
                      {specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid2>
            <Grid2
              size={{ xs: 6 }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <DatePicker
                label="Fecha de Nacimiento"
                value={dateOfBirth}
                onChange={(newValue) => setDateOfBirth(newValue)}
              />
            </Grid2>
            <Grid2 size={{ xs: 6 }}>
              <TextField
                autoComplete="fname"
                name="instagram"
                variant="outlined"
                required
                fullWidth
                value={instagram}
                id="instagram"
                label="Instagram"
                autoFocus
                onChange={(e) => {
                  setInstagram(e.target.value);
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 6 }}>
              <TextField
                autoComplete="fname"
                name="facebook"
                variant="outlined"
                fullWidth
                value={facebook}
                id="facebook"
                label="Facebook"
                autoFocus
                onChange={(e) => {
                  setFacebook(e.target.value);
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 6 }}>
              <TextField
                autoComplete="fname"
                name="twitter"
                variant="outlined"
                fullWidth
                value={twitter}
                id="twitter"
                label="Twitter"
                autoFocus
                onChange={(e) => {
                  setTwitter(e.target.value);
                }}
              />
            </Grid2>

            <Grid2 size={{ xs: 6 }}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="phone"
                label="Teléfono"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 6 }}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="country"
                label="País"
                value={country}
                type="country"
                id="country"
                onChange={(e) => {
                  setCountry(e.target.value);
                }}
              />
            </Grid2>
            <Grid2 size={{ xs: 6 }}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="city"
                label="Ciudad"
                value={city}
                type="city"
                id="city"
                onChange={(e) => {
                  setCity(e.target.value);
                }}
              />
            </Grid2>
            <TextField
              variant="outlined"
              fullWidth
              multiline
              minRows={3}
              name="description"
              label="Descripción"
              value={description}
              type="description"
              id="description"
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
          </Grid2>
          <Grid2
            style={{
              display: "flex",
              paddingTop: "24px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FormControlLabel
              style={{ margin: 0, paddingRight: 8 }}
              control={
                <Checkbox
                  color="primary"
                  value={isChecked}
                  checked={isChecked}
                />
              }
              label="Acepto los"
              onChange={handleOnChange}
            />
            <a
              style={{
                textTransform: "lowercase",
                fontSize: "1rem",
                textDecoration: "underline",
                cursor: "pointer",
              }}
              onClick={openModal}
            >
              Términos y condiciones
            </a>
            <Modal open={modal} onClose={openModal}>
              <InitialTerms setIsChecked={setIsChecked} setModal={setModal} />
            </Modal>
          </Grid2>
          <Button
            // type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={!isChecked}
            onClick={(e) => handleSubmit(e)}
          >
            Guardar e ir a mi perfil
          </Button>
        </form>
      </div>
      <Copyright />
    </Container>
  );
}
