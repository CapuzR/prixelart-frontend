import React, { useState, useEffect, ChangeEvent, MouseEvent } from 'react';
import { useTheme } from '@mui/styles';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FilterListIcon from '@mui/icons-material/FilterList';
import Tooltip from '@mui/material/Tooltip';
import { Theme } from '@mui/material/styles';
import useStyles from './searchBar.styles';

interface SearchBarProps {
  onSearch: (queryValue: string | null, categories: string | null) => void;
}

const CustomizedInputBase: React.FC<SearchBarProps> = ({ onSearch }) => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const params = new URLSearchParams(window.location.search);

  const categoriesList: string[] = [
    'Abstracto',
    'Animales',
    'Arquitectura',
    'Atardecer',
    'Cacao',
    'Café',
    'Carros',
    'Ciudades',
    'Comida',
    'Edificios',
    'Fauna',
    'Flora',
    'Lanchas, barcos o yates',
    'Montañas',
    'Naturaleza',
    'Navidad',
    'Playas',
    'Puentes',
    'Surrealista',
    'Transportes',
    'Vehículos',
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

  // Initialize with URL parameters or default to an empty string.
  const [categories, setCategories] = useState<string>(params.get('category') || "");
  const [queryValue, setQueryValue] = useState<string>(params.get('name') || "");

  const [isShowFilter, setIsShowFilter] = useState<boolean>(!!params.get('category'));

  useEffect(() => {
    if (!localStorage.getItem('filterCategory')) {
      setCategories("");
      setIsShowFilter(false);
    }
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQueryValue(newValue);
    onSearch(newValue, categories); // Update parent immediately
  };

  return (
    <div
      style={{
        width:'75%',
        margin: 'auto',
        maxWidth: 616,
      }}
    >
      <Paper component="form" className={classes.root} elevation={3}>
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', height: '50px' }}>
          <IconButton
            type="submit"
            className={classes.iconButton}
            aria-label="search"
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              localStorage.setItem('filterCategory', JSON.stringify(categories));
            }}
          >
            <SearchIcon />
          </IconButton>
          <InputBase
            className={classes.input}
            placeholder="Busca tu arte favorito"
            inputProps={{ 'aria-label': 'Busca tu arte favorito' }}
            value={queryValue}
            onChange={handleInputChange}
          />
          <Tooltip title="Aplicar filtro">
            <IconButton
              className={classes.iconButton}
              onClick={() => setIsShowFilter(!isShowFilter)}
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
            value={categories}
            onChange={(e: SelectChangeEvent<string>) => {
              const value = e.target.value;
              setCategories(value);
              onSearch(queryValue, value);
            }}
            input={<Input />}
            MenuProps={MenuProps}
          >
            <MenuItem value="">
              <em>Ninguno</em>
            </MenuItem>
            {categoriesList.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </div>
  );
};

export default CustomizedInputBase;
