import React, { ChangeEvent, MouseEvent } from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

interface SearchBarProps {
  queryValue: string;
  categoryValue: string;
  onQueryChange: (newQuery: string) => void;
  onCategoryChange: (newCategory: string) => void;
  onSearchSubmit: () => void;
  placeholderText?: string;
  categoriesList?: string[];
}

const CustomizedInputBase: React.FC<SearchBarProps> = ({
  queryValue,
  categoryValue,
  onQueryChange,
  onCategoryChange,
  onSearchSubmit,
  placeholderText: placeholderTextProp = "Busca lo que necesites",
  categoriesList,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const defaultCategories: string[] = [
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

  const currentCategoriesList = categoriesList || defaultCategories;
  const showCategoryFilter = categoriesList && categoriesList.length > 0;

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 5.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(e.target.value);
  };

  const handleClearQuery = () => {
    onQueryChange("");
  };

  const handleSearchSubmit = (
    e?: MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>,
  ) => {
    if (e) e.preventDefault();
    onSearchSubmit();
  };

  const isCategoryFilterActive = showCategoryFilter && !!categoryValue;
  const dynamicPlaceholderText = isCategoryFilterActive
    ? `Buscar en "${categoryValue}"...`
    : placeholderTextProp;

  return (
    <div
      style={{
        width: isMobile ? "100%" : "85%",
        margin: "auto",
        maxWidth: 700,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSearchSubmit}
        sx={{
          display: "flex",
          alignItems: "center",
          borderRadius: "8px",
          padding: "4px 8px",
          gap: 1,
        }}
        elevation={3}
      >
        <Tooltip title="Buscar">
          <IconButton
            type="submit"
            sx={{ padding: "10px" }}
            aria-label="search"
          >
            <SearchIcon />
          </IconButton>
        </Tooltip>
        <InputBase
          sx={{ marginLeft: "2px", flex: 1 }}
          placeholder={dynamicPlaceholderText}
          inputProps={{ "aria-label": dynamicPlaceholderText }}
          value={queryValue}
          onChange={handleInputChange}
          endAdornment={
            queryValue ? (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search query"
                  onClick={handleClearQuery}
                  edge="end"
                  size="small"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null
          }
        />
        {showCategoryFilter && (
          <TextField
            select
            value={categoryValue}
            onChange={(e) => onCategoryChange(e.target.value)}
            variant="outlined"
            size="small"
            label="Categoría"
            InputLabelProps={{ shrink: true }}
            sx={{
              minWidth: 160,
              textTransform: "capitalize",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
              "& .MuiSelect-select": {
                paddingTop: "8.5px",
                paddingBottom: "8.5px",
              },
            }}
            SelectProps={{
              MenuProps: MenuProps,
              displayEmpty: true,
              renderValue: (selected) => {
                if (!selected) {
                  return <em>Todas</em>;
                }
                return selected as string;
              },
            }}
          >
            <MenuItem value="">
              <em>Todas</em>
            </MenuItem>
            {currentCategoriesList.map((category) => (
              <MenuItem
                key={category}
                value={category}
                sx={{ textTransform: "capitalize" }}
              >
                {category}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Paper>
    </div>
  );
};

export default CustomizedInputBase;
