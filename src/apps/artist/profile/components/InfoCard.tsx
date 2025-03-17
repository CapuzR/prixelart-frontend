// Debo hacer los unit y functional tests.

import { makeStyles } from "tss-react/mui"
import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import { useState, useEffect } from "react"
import EditIcon from "@mui/icons-material/Edit"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import axios from "axios"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Select from "@mui/material/Select"
import Avatar from "@mui/material/Avatar"
import AddIcon from "@mui/icons-material/Add"
import SaveIcon from "@mui/icons-material/Save"
import InstagramIcon from "@mui/icons-material/Instagram"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import FacebookIcon from "@mui/icons-material/Facebook"
import TwitterIcon from "@mui/icons-material/Twitter"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme, Theme } from "@mui/material/styles"

import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Tooltip from "@mui/material/Tooltip"

import { useHistory } from "react-router-dom"
import { useLocation, useParams } from "react-router"
import { Prixer } from "../../../../types/prixer.types"
import { Organization } from "../../../../types/organization.types"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    root: {
      flexGrow: 1,
      width: "100%",
      display: "grid2",
    },
    paper: {
      padding: theme.spacing(2),
      margin: "auto",
      maxWidth: 616,
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
      "& > *": {},
      objectFit: "cover",
      backgroundColor: "#fff",
      width: "160px",
      height: "160px",
    },
  }
})

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

export default function InfoCard() {
  const { classes } = useStyles()
  let location = useLocation()
  const username = location.pathname.split("=")?.[1]
  const [prixerDataState, setPrixerDataState] = useState("read")
  // const [username, setUsername] = useState();
  const [email, setEmail] = useState<string>()
  const [firstName, setFirstName] = useState<string>()
  const [lastName, setLastName] = useState<string>()
  const [specialtyArt, setSpecialtyArt] = useState([])
  const [instagram, setInstagram] = useState<string>()
  const [facebook, setFacebook] = useState<string>()
  const [twitter, setTwitter] = useState<string>()
  const [description, setDescription] = useState<string>()
  const [dateOfBirth, setDateOfBirth] = useState<string>()
  const [phone, setPhone] = useState<string>()
  const [country, setCountry] = useState<string>()
  const [city, setCity] = useState<string>()
  const [prixerExists, setPrixerExists] = useState(false)
  const [avatarObj, setAvatarObj] = useState("")
  const [profilePic, setProfilePic] = useState("")
  const [inputChange, setInputChange] = useState(false)
  const [backdrop, setBackdrop] = useState(true)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"))
  const [prixer, setPrixer] = useState()

  function getStyles(specialty, specialtyArt, theme) {
    return {
      fontWeight:
        specialty.indexOf(specialty) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    }
  }

  useEffect(() => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/prixer/read"
    const data = {
      username: username,
    }
    if (typeof username === "string") {
      axios
        .post(base_url, data)
        .then((response) => {
          // if (!response.data.status) {
          //   return history.push("/");
          // }
          // setUsername(response.data.username)
          setEmail(response.data.email)
          setFirstName(response.data.firstName)
          setLastName(response.data.lastName)
          setSpecialtyArt(response.data.specialtyArt)
          setInstagram(response.data.instagram)
          setFacebook(response.data.facebook)
          setTwitter(response.data.twitter)
          setDescription(response.data.description)
          setDateOfBirth(response.data.dateOfBirth)
          setPhone(response.data.phone)
          setCountry(response.data.country)
          setCity(response.data.city)
          setAvatarObj(response.data.avatar)
          setProfilePic(response.data.avatar)
          setPrixer(response.data)
          setBackdrop(false)
          setPrixerExists(true)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }, [])

  const handleProfileDataEdit = async () => {
    if (prixerDataState === "edit") {
      setBackdrop(true)
      var formData = new FormData()
      // if (profilePic !== "") {
      //   formData.append("avatar", profilePic);
      // }
      formData.append("avatar", profilePic || avatarObj)
      formData.append("username", username)
      formData.append("firstName", firstName)
      formData.append("email", email)
      formData.append("lastName", lastName)
      formData.append("specialtyArt", specialtyArt.join())
      formData.append("instagram", instagram)
      formData.append("facebook", facebook)
      formData.append("twitter", twitter)
      formData.append("description", description)
      formData.append("dateOfBirth", dateOfBirth)
      formData.append("phone", phone)
      formData.append("country", country)
      formData.append("city", city)
      const base_url = import.meta.env.VITE_BACKEND_URL + "/prixer/update"
      const response = await axios.post(base_url, formData)
      if (response.data) {
        setEmail(response.data.email)
        setFirstName(response.data.firstName)
        setLastName(response.data.lastName)
        setSpecialtyArt(response.data.specialtyArt)
        setInstagram(response.data.instagram)
        setFacebook(response.data.facebook)
        setTwitter(response.data.twitter)
        setDescription(response.data.description)
        setDateOfBirth(response.data.dateOfBirth)
        setPhone(response.data.phone)
        setCountry(response.data.country)
        setCity(response.data.city)
        setAvatarObj(response.data.avatar)
        setProfilePic(response.data.avatar)
        setBackdrop(false)
        setPrixerExists(true)
        setPrixerDataState("read")
        // props.setFeed("Artes")
      } else {
        setBackdrop(false)
      }
    } else {
      setPrixerDataState("edit")
      // props.setFeed("Settings")
    }
  }

  const onImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setInputChange(true)
      setAvatarObj(URL.createObjectURL(e.target.files[0]))
      setProfilePic(e.target.files[0])
    }
  }

  const handleChange = (e) => {
    setSpecialtyArt(e.target.value)
  }

  return prixerExists ? (
    <div className={classes.root}>
      <Paper
        elevation={3}
        className={classes.paper}
        style={{ width: isDesktop ? "50%" : "100%", margin: "0 auto" }}
      >
        {/* Optimizar para llevar a una única maqueta y no duplicar dependiendo del estado */}
        {prixerDataState === "read" && (
          <>
            <Box style={{ textAlign: "end" }}>
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, sm: 4 }}>
                  <Box
                    style={{
                      marginBottom: "4px",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {avatarObj ? (
                      <div
                        style={{
                          borderStyle: "solid",
                          borderWidth: 2,
                          borderColor: "gray",
                          borderRadius: "50%",
                          padding: 8,
                          marginTop: "-8px",
                        }}
                      >
                        <Avatar
                          className={classes.avatar}
                          src={profilePic}
                          alt="Prixer profile avatar"
                        />
                      </div>
                    ) : (
                      JSON.parse(localStorage.getItem("token")) &&
                      JSON.parse(localStorage.getItem("token")).username ===
                        username && (
                        <div
                          style={{
                            borderStyle: "solid",
                            borderWidth: 2,
                            borderColor: "gray",
                            borderRadius: "50%",
                            padding: 8,
                          }}
                        >
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
                        </div>
                      )
                    )}
                  </Box>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 8 }}>
                  <Box
                    style={{
                      display: "flex",
                      marginBottom: "4px",
                      alignItems: isMobile ? "center" : "start",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 5,
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="h5"
                          color="secondary"
                          style={{ fontWeight: "bold" }}
                        >
                          {firstName} {lastName}
                        </Typography>
                        {prixer.role === "Organization" && (
                          <Tooltip title="Organización verificada">
                            <VerifiedUserIcon color="primary" />
                          </Tooltip>
                        )}
                      </div>
                      {JSON.parse(localStorage.getItem("token")) &&
                        JSON.parse(localStorage.getItem("token")).username ===
                          username && (
                          <IconButton
                            title="Editar perfil"
                            color="primary"
                            onClick={handleProfileDataEdit}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                    </div>
                    <Typography style={{ fontSize: 16 }} color="secondary">
                      {specialtyArt?.map(
                        (specialty, index) =>
                          specialty !== "" &&
                          (specialtyArt?.length === index + 1
                            ? specialty
                            : `${specialty}, `)
                      )}
                    </Typography>
                  </Box>
                  <Box
                    display={"flex"}
                    style={{
                      marginBottom: "4px",
                      justifyContent: isMobile ? "center" : "flexstart",
                    }}
                  ></Box>
                  <Box
                    display={"flex"}
                    style={{
                      marginBottom: "4px",
                      justifyContent: isMobile ? "center" : "flexstart",
                    }}
                  >
                    <Typography
                      align={isMobile ? "center" : "left"}
                      style={{ fontSize: 14 }}
                      color="secondary"
                    >
                      {description !== "undefined" && description}
                    </Typography>
                  </Box>
                  <Box
                    style={{
                      marginBottom: "4px",
                      justifyContent: isMobile ? "center" : "flexstart",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <IconButton
                      size="small"
                      target="_blank"
                      href={
                        "https://www.instagram.com/" +
                        instagram?.replace(/[@]/gi, "")
                      }
                      style={{
                        textDecoration: "none",
                        backgroundColor: "#d33f49",
                        color: "white",
                      }}
                    >
                      <InstagramIcon />
                    </IconButton>
                    {facebook && facebook !== "undefined" && (
                      <IconButton
                        size="small"
                        target="_blank"
                        href={"https://www.facebook.com/" + facebook}
                        style={{
                          textDecoration: "none",
                          backgroundColor: "#d33f49",
                          color: "white",
                          marginLeft: 20,
                        }}
                      >
                        <FacebookIcon />
                      </IconButton>
                    )}
                    {twitter && twitter !== "undefined" && (
                      <IconButton
                        size="small"
                        target="_blank"
                        href={
                          "https://www.twitter.com/" +
                          twitter?.replace(/[@]/gi, "")
                        }
                        style={{
                          textDecoration: "none",
                          backgroundColor: "#d33f49",
                          color: "white",
                          marginLeft: 20,
                        }}
                      >
                        <TwitterIcon />
                      </IconButton>
                    )}
                  </Box>
                </Grid2>
              </Grid2>
            </Box>
          </>
        )}
        {prixerDataState === "edit" && (
          <>
            <Box style={{ textAlign: "end", marginBottom: "-48px" }}>
              {JSON.parse(localStorage.getItem("token")) &&
                JSON.parse(localStorage.getItem("token")).username ===
                  username && (
                  // <Button
                  //   color="primary"
                  //   onClick={handleProfileDataEdit}
                  //   variant="contained"
                  //   style={{ marginBottom: "8px" }}
                  // >
                  //   Editar
                  // </Button>
                  <IconButton
                    title="Guardar perfil"
                    color="primary"
                    style={{ marginBottom: "8px" }}
                    onClick={handleProfileDataEdit}
                  >
                    <SaveIcon />
                  </IconButton>
                )}
            </Box>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <Box>
                  <Box
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: "4px",
                    }}
                  >
                    {avatarObj ? (
                      <div
                        style={{
                          borderStyle: "solid",
                          borderWidth: 2,
                          borderColor: "gray",
                          borderRadius: "50%",
                          padding: 8,
                          marginTop: "-8px",
                        }}
                      >
                        <Avatar className={classes.avatar}>
                          <label htmlFor="file-input">
                            <img
                              src={avatarObj}
                              alt="Prixer profile avatar"
                              style={{
                                objectFit: "cover",
                                cursor: "pointer",
                                width: 160,
                                height: 160,
                              }}
                            />
                          </label>
                          <input
                            style={{ display: "none", cursor: "pointer" }}
                            accept="image/*"
                            id="file-input"
                            type="file"
                            onChange={onImageChange}
                            required
                          />
                        </Avatar>
                      </div>
                    ) : (
                      <Avatar className={classes.avatar}>
                        <label htmlFor="file-input">
                          <AddIcon
                            style={{
                              width: 160,
                              height: 160,
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
                  <Box style={{ marginBottom: "8px" }}>
                    <TextField
                      fullWidth
                      id="firstName"
                      variant="outlined"
                      label="Nombre"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value)
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
                        setLastName(e.target.value)
                      }}
                    />
                  </Box>
                  <Box>
                    <FormControl style={{ width: "100%", marginBottom: 20 }}>
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
                        setInstagram(e.target.value)
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
                        setFacebook(e.target.value)
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
                        setTwitter(e.target.value)
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
                        setDescription(e.target.value)
                      }}
                      value={description}
                      inputProps={{ maxLength: 300 }}
                      multiline
                    />
                  </Box>
                </Box>
              </Grid2>
            </Grid2>
          </>
        )}
      </Paper>
    </div>
  ) : (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Grid2 container spacing={1}>
          <Grid2 container direction="column" spacing={2}>
            <Typography gutterBottom variant="subtitle1">
              Increíble, pero cierto
            </Typography>
            <Typography variant="body1" gutterBottom>
              Este usuario no existe
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Inténtalo de nuevo | ig: Wrong
            </Typography>
          </Grid2>
        </Grid2>
      </Paper>
    </div>
  )
}
