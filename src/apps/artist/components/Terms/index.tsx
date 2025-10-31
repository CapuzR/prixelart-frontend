import { Theme } from "@mui/material";
import React, { FormEvent, useState, useEffect } from "react";
import { makeStyles } from "tss-react/mui";
import MDEditor from "@uiw/react-md-editor";
import Button from "@mui/material/Button";

import { getTerms } from "@apps/artist/api";
const useStyles = makeStyles()((theme: Theme) => {
  return {
    modal: {
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      width: "80%",
      maxHeight: "70vh",
      overflowY: "auto",
      backgroundColor: "white",
      padding: 40,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      textAlign: "justify",
      borderRadius: 16,
    },
  };
});

export default function InitialTerms({ setIsChecked, setModal }) {
  const { classes } = useStyles();
  const [value, setValue] = useState("");

  const terms = async () => {
    try {
      const response = await getTerms();
      setValue(response.data.terms.termsAndConditions);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    terms();
  }, []);

  return (
    <div className={classes.modal}>
      <div data-color-mode="light">
        <div
          style={{
            textAlign: "center",
            marginBottom: "12px",
            fontWeight: "bold",
          }}
        >
          CONVENIO DE RELACIÓN ENTRE LOS ARTISTAS Y LA COMPAÑÍA
        </div>
        <div>
          <MDEditor.Markdown source={value} style={{ textAlign: "justify" }} />
        </div>
      </div>

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setIsChecked(true);
          setModal(false);
        }}
        style={{
          fontWeight: "bold",
          margin: "20px auto 0",
          padding: "6px 30px",
        }}
      >
        De acuerdo
      </Button>
    </div>
  );
}
