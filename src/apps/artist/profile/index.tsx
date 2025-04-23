import { useState } from "react"

import { Theme } from "@mui/material"
import { makeStyles } from "tss-react/mui"

import FloatingAddButton from "components/floatingAddButton/floatingAddButton"
import CreateService from "@components/createService"
import InfoCard from "./components/InfoCard"
import Tabs from "./components/Tabs"
import ArtsGrid from "../../consumer/art/components/Grid"
import Container from "@mui/material/Container"
import Grid2 from "@mui/material/Grid2"

import ArtUploader from "@apps/artist/artUploader"
import ServiceGrid from "../prixerService"
import Biography from "./components/Bio"


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
      <InfoCard/>
      {/* {feed !== "Settings" && ( */}
        <Tabs
          feed={feed}
          setFeed={setFeed}
        />
       {/* )} */}
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
