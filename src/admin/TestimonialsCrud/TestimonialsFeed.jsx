import { React, useState, useEffect } from "react";
import axios from "axios";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

const useStyles = makeStyles((theme) => ({
  cardMedia: {
    paddingTop: "81.25%",
    borderRadius: "50%",
    margin: "28px",
  },
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

export default function TestimonialsFeed() {
  const classes = useStyles();
  const [tiles, setTiles] = useState([]);
  const theme = useTheme();

  const readTestimonial = async () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/testimonial/read-all";
    const res = await axios
      .get(base_url)
      .then((response) => {
        let responsev2 = response.data.testimonials.sort(function (a, b) {
          return a.position - b.position;
        });
        setTiles(responsev2);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    readTestimonial();
  }, []);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Grid
      // container
      spacing={2}
      xs={12}
      style={{
        width: "100%",
        padding: isMobile ? "0px" : "18px",
        // display: "flex",
        // textAlign: "start",
      }}
    >
      <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
        <Masonry style={{ columnGap: "7px" }}>
          {tiles.map(
            (tile) =>
              tile.status && (
                <Grid item>
                  <Paper
                    className={classes.paper}
                    style={
                      {
                        // padding: "15px",
                        // height: 240,
                      }
                    }
                  >
                    <Grid key={tile._id} style={{ width: "100%" }}>
                      <Grid container spacing={1}>
                        <Grid marginBottom={2} style={{ width: "100%" }}>
                          <Box style={{ display: "flex", paddingLeft: "20px" }}>
                            <Avatar
                              className={classes.avatar}
                              src={tile.avatar}
                            />
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
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )
          )}
        </Masonry>
      </ResponsiveMasonry>
    </Grid>
  );
}
