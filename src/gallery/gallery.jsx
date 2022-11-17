import React, { useEffect } from "react";
import axios from "axios";

import AppBar from "../sharedComponents/appBar/appBar";
import FloatingAddButton from "../sharedComponents/floatingAddButton/floatingAddButton";
import ArtsGrid from "../prixerProfile/grid/grid";
import Container from "@material-ui/core/Container";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import { makeStyles } from "@material-ui/core/styles";
import { useState } from "react";
import ArtUploader from "../sharedComponents/artUploader/artUploader";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import MDEditor from "@uiw/react-md-editor";

const useStyles = makeStyles((theme) => ({
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    flexGrow: 1,
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
    marginLeft: "87%",
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

export default function Gallery(props) {
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);
  const prixerUsername = "all";
  const [termsAgreeVar, setTermsAgreeVar] = useState(true);
  const [value, setValue] = useState("");

  const classes = useStyles();

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
      <AppBar prixerUsername={prixerUsername} />

      <Container component="main" maxWidth="s" className={classes.paper}>
        <CssBaseline />

        <Grid style={{ marginTop: 90 }}>
          <h1 style={{ margin: 0 }}>Galería</h1>
          <Typography
            variant="body2"
            color="textSecondary"
            component="p"
            style={{ marginBottom: 20 }}
          >
            Encuentra tu arte preferido. Ejemplo: escribe "playa" y toca la
            lupa.
          </Typography>
        </Grid>
        <Grid>
          <ArtsGrid prixerUsername={null} />
        </Grid>
        {openArtFormDialog && (
          <ArtUploader
            openArtFormDialog={openArtFormDialog}
            setOpenArtFormDialog={setOpenArtFormDialog}
          />
        )}
        {JSON.parse(localStorage.getItem("token")) &&
          JSON.parse(localStorage.getItem("token")).username && (
            <Grid className={classes.float}>
              <FloatingAddButton setOpenArtFormDialog={setOpenArtFormDialog} />
            </Grid>
          )}
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
              Hemos actualizado nuestros términos y condiciones y queremos que
              estés al tanto.
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
      </Container>
    </>
  );
}
