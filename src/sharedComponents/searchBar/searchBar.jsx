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

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
    width: 450,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 100,
    width: "40%",
  },
}));
export default function CustomizedInputBase(props) {
  const classes = useStyles();
  let params = new URLSearchParams(window.location.search);
  const theme = useTheme();

  const [categories, setCategories] = useState([]);
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

  function getStyles(categorie, categories, theme) {
    return {
      fontWeight:
        categories.indexOf(categorie) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }

  const handleChange = (event) => {
    setCategories(event);
  };

  const [queryValue, setQueryValue] = useState(
    params.get("name", "description", "tags", "categories")
  );

  return (
    <Paper component="form" className={classes.root}>
      <div style={{ display: "flex", width: "60%" }}>
        <IconButton
          type="submit"
          className={classes.iconButton}
          aria-label="search"
          onClick={(e) => {
            props.searchPhotos(e, queryValue, categories);
          }}
        >
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
      </div>
      <FormControl className={classes.formControl}>
        <InputLabel>Categoría</InputLabel>
        <Select
          value={categories}
          multiple
          onChange={(e) => {
            handleChange(e.target.value);
          }}
          input={<Input />}
          MenuProps={MenuProps}
        >
          {categoriesList.map((categorie) => (
            <MenuItem
              key={categorie}
              value={categorie}
              style={getStyles(categorie, categories, theme)}
            >
              {categorie}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
}
