import { Theme, useTheme } from "@mui/material"
import { makeStyles } from "tss-react/mui"

import Button from "@mui/material/Button"
import Paper from "@mui/material/Paper"
import Grid2 from "@mui/material/Grid2"
import useMediaQuery from "@mui/material/useMediaQuery"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    root: {
      display: "flex",
      flexDirection: "column",
      minWidth: "100%",
      alignItems: "center",
      marginTop: 15,
      marginBottom: 15,
    },
    paper: {
      display: "flex",
      justifyContent: "space-evenly",
      margin: "auto",
      maxWidth: 616,
    },
  }
})

export default function BasicButtonGroup(props) {
  const { classes } = useStyles()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"))

  const tabs = ["Bio", "Artes", "Servicios"]

  const changeFeed = (op) => {
    props.setFeed(op)
  }
  return (
    <Grid2 container className={classes.root}>
      <Grid2
        size={{
          xs: 12,
        }}
        sx={{
          width: "100%",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Paper
          className={classes.paper}
          elevation={3}
          style={{ width: isDesktop ? "50%" : "100%" }}
        >
          {tabs.map((t) => (
            <Button
              onClick={(e) => {
                changeFeed(t)
              }}
              color="primary"
              style={{ textTransform: "none" }}
            >
              {t === "Bio" ? 'Biografía' : t}
            </Button>
          ))}
        </Paper>
      </Grid2>
    </Grid2>
  )
}
