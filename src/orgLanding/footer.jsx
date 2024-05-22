import { React, useState, useEffect } from "react";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import InstagramIcon from "@material-ui/icons/Instagram";
import LanguageIcon from "@material-ui/icons/Language";
import IconButton from "@material-ui/core/IconButton";
import Copyright from "../sharedComponents/Copyright/copyright";

export default function CBFooter() {
  return (
    <Grid container style={{ marginTop: 40, marginBottom: 70 }}>
      <Grid
        item
        style={{
          justifyContent: "center",
          display: "flex",
          width: "100%",
          flexDirection: "column",
          fontFamily: "Uncut Sans",
        }}
      >
        <Typography
          style={{
            fontFamily: "Uncut Sans",
            fontSize: 18,
            marginBottom: 10,
            justifyContent: "center",
            display: "flex",
          }}
        >
          {"Copyright © Prixelart "}

          {new Date().getFullYear()}
          {"."}
        </Typography>
        <Grid style={{ justifyContent: "center", display: "flex" }}>
          <IconButton
            style={{
              width: 40,
              height: 40,
              borderRadius: 5,
              backgroundColor: "#F4DF46",
              marginRight: 20,
            }}
          >
            <a target="blank" href="https://prixelart.com">
              <LanguageIcon
                style={{
                  color: "black",
                  display: "flex",
                  alignContent: "center",
                }}
              />
            </a>
          </IconButton>
          <IconButton
            style={{
              width: 40,
              height: 40,
              borderRadius: 5,
              backgroundColor: "#F4DF46",
            }}
          >
            <a target="blank" href="https://instagram.com/prixelart">
              <InstagramIcon
                style={{
                  color: "black",
                  display: "flex",
                  alignContent: "center",
                }}
              />
            </a>
          </IconButton>
        </Grid>
      </Grid>
    </Grid>
  );
}
