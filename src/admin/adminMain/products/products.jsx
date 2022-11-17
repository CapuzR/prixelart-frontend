import React, { useEffect, useState } from "react";
import axios from "axios";

import { useHistory, useLocation } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import clsx from "clsx";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { makeStyles } from "@material-ui/core/styles";
import Fab from "@material-ui/core/Fab";
import AddIcon from "@material-ui/icons/Add";
import ViewListIcon from "@material-ui/icons/ViewList";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import MDEditor from "@uiw/react-md-editor";

import CreateProduct from "../../productCrud/createProduct";
import UpdateProduct from "../../productCrud/updateProduct";
import DisableProduct from "../../productCrud/disableProduct";
import ReadProducts from "../../productCrud/readProducts";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "hidden",
    flexDirection: "column",
    height: "auto",
  },
  fixedHeight: {
    height: "auto",
    overflow: "hidden",
  },
  fab: {
    right: 0,
    position: "absolute",
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
}));

export default function Products(props) {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
  const [activeCrud, setActiveCrud] = useState("read");
  const [product, setProduct] = useState(
    localStorage.getItem("product")
      ? JSON.parse(localStorage.getItem("product"))
      : undefined
  );
  const [productEdit, setProductEdit] = useState(true);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isDeskTop = useMediaQuery(theme.breakpoints.up("sm"));
  const [termsAgreeVar, setTermsAgreeVar] = useState(true);
  const [value, setValue] = useState("");

  const handleProductAction = (action) => {
    history.push({ pathname: "/admin/product/" + action });
  };

  useEffect(() => {
    location.pathname.split("/").length === 5
      ? setActiveCrud(
          location.pathname.split("/")[location.pathname.split("/").length - 2]
        )
      : location.pathname.split("/").length === 4 &&
        setActiveCrud(
          location.pathname.split("/")[location.pathname.split("/").length - 1]
        );
  }, [location.pathname]);

  useEffect(() => {
    {
      JSON.parse(localStorage.getItem("token")) && TermsAgreeModal();
    }
  }, []);

  const getTerms = () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/termsAndConditions/read";
    axios
      .get(base_url)
      .then((response) => {
        setValue(response.data.terms.termsAndConditions);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleSubmit = async (e, Id) => {
    e.preventDefault();
    const formData = new FormData();
    const termsAgree = true;
    formData.append("termsAgree", termsAgree);
    // formData.append(
    //   "username",
    //   JSON.parse(localStorage.getItem("token")).username
    // );
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/prixer/update-terms/" + Id;
    const response = await axios
      .put(
        base_url,
        { termsAgree: true },
        {
          "Content-Type": "multipart/form-data",
        }
      )
      .then((response) => {
        setTermsAgreeVar(true);
      });
  };

  const TermsAgreeModal = () => {
    const GetId = JSON.parse(localStorage.getItem("token")).username;
    const base_url = process.env.REACT_APP_BACKEND_URL + "/prixer/get/" + GetId;
    axios.get(base_url).then((response) => {
      setTermsAgreeVar(response.data.termsAgree);
      getTerms();
    });
  };
  return (
    <>
      <div style={{ position: "relative" }}>
        {productEdit && (
          <div style={{ position: "absolute", right: 0 }}>
            <Fab
              color="default"
              aria-label="edit"
              onClick={() => {
                handleProductAction("read");
              }}
            >
              <ViewListIcon />
            </Fab>
            {/* <Fab color="secondary" aria-label="edit" onClick={()=>{handleUserAction('update')}}>
            <EditIcon />
          </Fab> */}
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => {
                handleProductAction("create");
              }}
            >
              <AddIcon />
            </Fab>
            <Modal
              xl={800}
              lg={800}
              md={480}
              sm={360}
              xs={360}
              open={termsAgreeVar === false}
              onClose={termsAgreeVar === true}
            >
              <div className={classes.paper2}>
                <h2 style={{ textAlign: "center", fontWeight: "Normal" }}>
                  Hemos actualizado nuestros términos y condiciones y queremos
                  que estés al tanto.
                </h2>
                <div>
                  <div data-color-mode="light">
                    <div
                      style={{
                        textAlign: "center",
                        marginBottom: "12px",
                        fontWeight: "bold",
                        fontSize: "1.2rem",
                      }}
                    >
                      CONVENIO DE RELACIÓN ENTRE LOS ARTISTAS Y LA COMPAÑÍA
                    </div>
                    <div data-color-mode="light">
                      <MDEditor.Markdown
                        source={value}
                        style={{ textAlign: "justify" }}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ justifyContent: "center", display: "flex" }}>
                  <Button
                    onClick={(e) => {
                      handleSubmit(
                        e,
                        JSON.parse(localStorage.getItem("token")).username
                      );
                    }}
                    type="submit"
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    required
                  >
                    Acepto los nuevos términos y condiciones
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        )}
        <Grid container spacing={3} style={{ margin: isDesktop ? "12px" : "" }}>
          {/* Chart */}
          <Grid item xs={12} md={12} lg={12}>
            <Paper className={fixedHeightPaper}>
              {activeCrud === "create" ? (
                <CreateProduct />
              ) : activeCrud === "read" ? (
                <ReadProducts setProduct={setProduct} />
              ) : activeCrud === "update" ? (
                <div style={{ height: "155vh" }}>
                  <UpdateProduct
                    product={product}
                    setProductEdit={setProductEdit}
                  />
                </div>
              ) : (
                <DisableProduct />
              )}
            </Paper>
          </Grid>
        </Grid>
      </div>
    </>
  );
}
