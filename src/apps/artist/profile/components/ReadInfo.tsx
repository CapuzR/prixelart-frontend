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

import { Theme, useTheme } from "@mui/material"
import { makeStyles } from "tss-react/mui"

const useStyles = makeStyles()((theme: Theme) => {
  return {
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

export default function ReadInfo({
  avatarObj,
  profilePic,
  username,
  handleProfileDataEdit,
  firstName,
  lastName,
  prixer,
  specialtyArt,
  description,
  instagram,
  facebook,
  twitter,
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const { classes } = useStyles()

  return (
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
        <Grid2
          size={{ xs: 12, sm: 8 }}
          sx={{ display: "flex", flexDirection: "column" }}
        >
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
              marginTop: "auto",
              justifyContent: isMobile ? "center" : "flexstart",
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconButton
              size="small"
              target="_blank"
              href={
                "https://www.instagram.com/" + instagram?.replace(/[@]/gi, "")
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
                  "https://www.twitter.com/" + twitter?.replace(/[@]/gi, "")
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
  )
}
