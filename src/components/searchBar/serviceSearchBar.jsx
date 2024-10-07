import React, { useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import FilterListIcon from "@material-ui/icons/FilterList";
import Tooltip from "@material-ui/core/Tooltip";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  formControl: {
    minWidth: 100,
    width: "100%",
    marginTop: "12px",
  },
}));

export default function serviceSearchBar(props) {
  const classes = useStyles();
  const theme = useTheme();
  let params = new URLSearchParams(window.location.search);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const serviceAreas = ["Diseño", "Fotografía", "Artes Plásticas", "Otro"];

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

  const [isShowFilter, setIsShowFilter] = useState();

  return (
    <div
      style={{
        width: isDesktop ? "50%" : "100%",
        margin: "auto",
        maxWidth: 616,
      }}
    >
      <Paper component="form" className={classes.root} elevation={3}>
        <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
          <IconButton
            type="submit"
            className={classes.iconButton}
            aria-label="search"
            // onClick={(e) => {
            //   props.searchPhotos(e, queryValue, categories);
            //   localStorage.setItem(
            //     "filterCategory",
            //     JSON.stringify(categories)
            //   );
            // }}
          >
            <SearchIcon />
          </IconButton>
          <InputBase
            className={classes.input}
            placeholder="Busca el servicio ideal"
            inputProps={{ "aria-label": "Busca el servicio ideal" }}
            value={props.query}
            onChange={(e) => {
              props.setQuery(e.target.value);
            }}
          />
          <Tooltip title={"Aplicar filtro"}>
            <IconButton
              className={classes.iconButton}
              onClick={() => {
                setIsShowFilter(!isShowFilter);
              }}
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Paper>
      {isShowFilter && (
        <FormControl className={classes.formControl}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={props.categories}
            onChange={(e) => {
              props.setCategories(e.target.value);
            }}
            input={<Input />}
            MenuProps={MenuProps}
          >
            <MenuItem value={undefined}>
              <em>Ninguno</em>
            </MenuItem>
            {serviceAreas.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </div>
  );
}
