import Grid2 from "@mui/material/Grid2"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Avatar from "@mui/material/Avatar"
import useMediaQuery from "@mui/material/useMediaQuery"
import Tooltip from "@mui/material/Tooltip"
import IconButton from "@mui/material/IconButton"
import InstagramIcon from "@mui/icons-material/Instagram"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import CameraAltIcon from "@mui/icons-material/CameraAlt"
import FacebookIcon from "@mui/icons-material/Facebook"
import TwitterIcon from "@mui/icons-material/Twitter"
import EditIcon from "@mui/icons-material/Edit"
import SaveIcon from "@mui/icons-material/Save"
import AddIcon from "@mui/icons-material/Add"
import TextField from "@mui/material/TextField"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import InputAdornment from "@mui/material/InputAdornment"

import { Theme, useTheme } from "@mui/material"
import { makeStyles } from "tss-react/mui"

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

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 48 * 4.5 + 8,
      width: 250,
    },
  },
}

export default function EditInfo({
  avatarObj,
  username,
  onImageChange,
  handleProfileDataEdit,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  prixer,
  specialtyArt,
  setSpecialtyArt,
  description,
  handleDescription,
  instagram,
  setInstagram,
  facebook,
  setFacebook,
  twitter,
  setTwitter,
  handleChange,
}) {
  const { classes } = useStyles()
  const theme = useTheme()

  function getStyles(specialty, specialtyArt, theme) {
    return {
      fontWeight:
        specialty.indexOf(specialty) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    }
  }

  return (
    <>
      <Box style={{ textAlign: "end", marginBottom: "-48px" }}>
        {JSON.parse(localStorage.getItem("token")) &&
          JSON.parse(localStorage.getItem("token")).username === username && (
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
        <Grid2 size={{ xs: 12, md: 4 }}>
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
        </Grid2>
        <Grid2 size={{ xs: 12, md: 7 }} sx={{ height: "fit-content" }}>
          <Grid2
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 2,
              marginBottom: 3,
            }}
          >
            <Box style={{ width: "48.5%" }}>
              <TextField
                id="firstName"
                variant="outlined"
                label="Nombre"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                }}
              />
            </Box>
            <Box style={{ width: "48.5%" }}>
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
          </Grid2>
          <Box>
            <FormControl style={{ width: "100%", marginBottom: 20 }}>
              <InputLabel id="demo-mutiple-name-label">Especialidad</InputLabel>
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
        </Grid2>
        <Grid2 size={{ xs: 12, md: 12 }}>
          <Box sx={{ marginBottom: 2 }}>
            <TextField
              fullWidth
              id="description"
              label="Descripción"
              minRows={3}
              multiline
              onChange={handleDescription}
              value={description}
            />
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
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
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <InstagramIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
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
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <FacebookIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 4 }}>
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
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <TwitterIcon />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Grid2>
      </Grid2>
    </>
  )
}
