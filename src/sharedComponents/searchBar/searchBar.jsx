import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import makeStyles from '@mui/styles/makeStyles';
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import FilterListIcon from "@mui/icons-material/FilterList";
import Tooltip from "@mui/material/Tooltip";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: 450,
    marginTop: 5,
    marginBottom: 10,
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

export default function CustomizedInputBase(props) {
  const classes = useStyles();
  let params = new URLSearchParams(window.location.search);
  const theme = useTheme();
  const categoriesList = [
    "Abstracto",
    "Animales",
    "Arquitectura",
    "Atardecer",
    "Cacao",
    "Café",
    "Carros",
    "Ciudades",
    "Comida",
    "Edificios",
    "Fauna",
    "Flora",
    "Lanchas, barcos o yates",
    "Montañas",
    "Naturaleza",
    "Navidad",
    "Playas",
    "Puentes",
    "Surrealista",
    "Transportes",
    "Vehículos",
  ];
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

  const [categories, setCategories] = useState(
    // localStorage.getItem("filterCategory")
    //   ? JSON.parse(localStorage.getItem("filterCategory"))
    //   : []
    params.get("category")
  );
  const [queryValue, setQueryValue] = useState(params.get("name"));

  const [isShowFilter, setIsShowFilter] = useState(
    params.get("category") ? true : false
  );

  useEffect(() => {
    if (!localStorage.getItem("filterCategory")) {
      setCategories([]);
      setIsShowFilter(false);
    }
  }, []);

  // function getStyles(category, categories, theme) {
  //   return {
  //     fontWeight:
  //       categories.indexOf(category) === -1
  //         ? theme.typography.fontWeightRegular
  //         : theme.typography.fontWeightMedium,
  //   };
  // }

  // const handleChange = (event) => {
  //   setCategories(event);
  // };

  return (
    <div>
      <Paper component="form" className={classes.root} elevation={3}>
        <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
          <IconButton
            type="submit"
            className={classes.iconButton}
            aria-label="search"
            onClick={(e) => {
              props.searchPhotos(e, queryValue, categories);
              localStorage.setItem(
                "filterCategory",
                JSON.stringify(categories)
              );
            }}
            size="large">
            <SearchIcon />
          </IconButton>
          <InputBase
            className={classes.input}
            placeholder="Busca tu arte favorito"
            inputProps={{ "aria-label": "Busca tu arte favorito" }}
            value={queryValue}
            onChange={(e) => {
              setQueryValue(e.target.value);
            }}
          />
          <Tooltip title={"Aplicar filtro"}>
            <IconButton
              className={classes.iconButton}
              onClick={() => {
                setIsShowFilter(!isShowFilter);
              }}
              size="large">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Paper>
      {isShowFilter && (
        <FormControl className={classes.formControl}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={categories}
            onChange={(e) => {
              setCategories(e.target.value);
              props.searchPhotos(e, queryValue, e.target.value);
            }}
            input={<Input />}
            MenuProps={MenuProps}
          >
            <MenuItem value="">
              <em>Ninguno</em>
            </MenuItem>
            {categoriesList.map((category) => (
              <MenuItem
                key={category}
                value={category}
                // style={getStyles(category, categories, theme)}
              >
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </div>
  );
}
