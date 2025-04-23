
import { makeStyles } from "tss-react/mui"
import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"

import { Theme } from "@mui/material/styles"

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
  }
})

export default function Random() {
    const { classes } = useStyles()

  return (
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
