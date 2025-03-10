import { useState, useEffect } from "react"
import { makeStyles } from "tss-react/mui"
import { useTheme, Theme } from "@mui/material/styles"
import Paper from "@mui/material/Paper"
import Grid2 from "@mui/material/Grid2"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Avatar from "@mui/material/Avatar"
import useMediaQuery from "@mui/material/useMediaQuery"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { getTestimonials } from "../api"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    cardMedia: {
      paddingTop: "81.25%",
      borderRadius: "50%",
      margin: "28px",
    },
    paper: {
      padding: theme.spacing(2),
      margin: "15px",
    },
    input: {
      padding: "2",
    },
    title: {
      flexGrow: 1,
    },
    avatar: {
      width: 80,
      height: 80,
    },
  }
})

// const MenuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//       width: 250,
//     },
//   },
// };

export default function TestimonialsFeed() {
  const classes = useStyles()
  const theme = useTheme()

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [tiles, setTiles] = useState([])

  const readTestimonial = async () => {
    try {
      const res = await getTestimonials()
      // add status filter
      setTiles(res)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    readTestimonial()
  }, [])

  return (
    <Grid2
      spacing={2}
      style={{
        width: "100%",
        padding: isMobile ? "0px" : "18px",
      }}
    >
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
        <Masonry style={{ columnGap: "8px" }}>
          {tiles.map(
            (tile) =>
              tile.status && (
                <Paper className={classes.paper}>
                  <Grid2
                    key={tile._id}
                    spacing={1}
                    marginBottom={2}
                    style={{ width: "100%" }}
                  >
                    <Box style={{ display: "flex", paddingLeft: "20px" }}>
                      <Avatar className={classes.avatar} src={tile.avatar} />
                      <Box
                        style={{
                          paddingLeft: "30px",
                        }}
                      >
                        <Typography>{tile.name}</Typography>
                        <Typography variant={"body2"} color={"secondary"}>
                          {tile.type}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography
                        variant={"body2"}
                        style={{
                          display: "flex",
                          textAlign: "center",
                          justifyContent: "center",
                          paddingTop: "10px",
                        }}
                      >
                        {tile.value}
                      </Typography>
                    </Box>
                    <Box
                      style={{
                        paddingTop: "8px",
                      }}
                    >
                      <Typography
                        variant={"body2"}
                        color="secondary"
                        style={{
                          display: "flex",
                          textAlign: "center",
                          justifyContent: "center",
                        }}
                      >
                        {tile.footer}
                      </Typography>
                    </Box>
                  </Grid2>
                </Paper>
              )
          )}
        </Masonry>
      </ResponsiveMasonry>
    </Grid2>
  )
}
