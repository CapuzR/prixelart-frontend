import FloatingAddButton from "components/floatingAddButton/floatingAddButton"
import CreateService from "components/createService/createService"
import InfoCard from "./components/InfoCard"
import PrixerOptions from "../stats/prixerOptions"
import ArtsGrid from "../../consumer/art/components/grid"
import Container from "@mui/material/Container"
import Grid2 from "@mui/material/Grid2"
import { useState } from "react"
import ArtUploader from "@apps/artist/artUploader/artUploader"
import ServiceGrid from "../grid/serviceGrid"
import Modal from "@mui/material/Modal"
import Button from "@mui/material/Button"
import MDEditor from "@uiw/react-md-editor"
import Dialog from "@mui/material/Dialog"
import Typography from "@mui/material/Typography"
import { useHistory } from "react-router-dom"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/styles"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import Img from "react-cool-img"
import Biography from "../grid/biography"
import { Theme } from "@mui/material"
import { makeStyles } from "tss-react/mui"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    paper: {
      display: "flex",
      flexDirection: "column",
      alignItems: "left",
      flexGrow: 1,
      height: "calc(100% + 60px)",
      marginTop: "74px",
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: "100%", // Fix IE 11 issue.
      marginTop: theme.spacing(3),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
    float: {
      position: "relative",
      marginLeft: "95%",
    },
    paper2: {
      position: "absolute",
      width: "80%",
      maxHeight: 450,
      overflowY: "auto",
      backgroundColor: "white",
      boxShadow: theme.shadows[5],
      padding: "16px 32px 24px",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      textAlign: "justify",
    },
  }
})

export default function Profile() {
  const { classes } = useStyles()
  const globalParams = new URLSearchParams(window.location.pathname)
  const username = window.location.pathname.includes("org")
    ? globalParams.get("/org")
    : globalParams.get("/prixer")

  const [openArtFormDialog, setOpenArtFormDialog] = useState(false)
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false)
  const [openShoppingCart, setOpenShoppingCart] = useState(false)
  const [feed, setFeed] = useState("Artes")
  const [createdService, setCreatedService] = useState(false)

  const showPrixerGrid2 = () => {
    switch (feed) {
      // case "Settings":
      //   return <div></div>
      case "Artes":
        return <ArtsGrid />

      case "Servicios":
        return (
          <ServiceGrid
            createdService={createdService}
            setCreatedService={setCreatedService}
          />
        )

      case "Bio":
        return <Biography/>
    }
  }

  return (
    <Container component="main" maxWidth="xl" className={classes.paper}>
      <InfoCard feed={feed} setFeed={setFeed} />
      {feed !== "Settings" && (
        <PrixerOptions
          feed={feed}
          setFeed={setFeed}
        />
      )}
      {showPrixerGrid2()}

      {openArtFormDialog && (
        <ArtUploader
          openArtFormDialog={openArtFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
        />
      )}

      {openServiceFormDialog && (
        <CreateService
          openArtFormDialog={openServiceFormDialog}
          setOpenServiceFormDialog={setOpenServiceFormDialog}
          setCreatedService={setCreatedService}
        />
      )}

      <Grid2 className={classes.float}>
        <FloatingAddButton
          setOpenServiceFormDialog={setOpenServiceFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
          setOpenShoppingCart={setOpenShoppingCart}
        />
      </Grid2>
    </Container>
  )
}
