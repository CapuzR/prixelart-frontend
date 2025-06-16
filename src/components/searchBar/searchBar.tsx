import React, { useState, ChangeEvent, MouseEvent, useCallback, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import { SelectChangeEvent } from '@mui/material/Select';
import { debounce } from '@utils/utils';
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"

interface SearchBarProps {
  onSearch: (queryValue: string | null, category: string | null) => void;
  initialQuery?: string;
  initialCategory?: string;
  placeholderText?: string;
  categoriesList?: string[];
}

const CustomizedInputBase: React.FC<SearchBarProps> = ({
  onSearch,
  initialQuery = "",
  initialCategory = "",
  placeholderText: placeholderTextProp = "Busca lo que necesites",
  categoriesList,
}) => {
  const params = new URLSearchParams(window.location.search);
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const defaultCategories: string[] = [
    'Abstracto', 'Animales', 'Arquitectura', 'Atardecer', 'Cacao', 'Café',
    'Carros', 'Ciudades', 'Comida', 'Edificios', 'Fauna', 'Flora',
    'Lanchas, barcos o yates', 'Montañas', 'Naturaleza', 'Navidad',
    'Playas', 'Puentes', 'Surrealista', 'Transportes', 'Vehículos',
  ];

  const currentCategoriesList = categoriesList || defaultCategories; // Use provided list or default
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

  const [categories, setCategories] = useState<string>(params.get('category') || initialCategory);
  const [queryValue, setQueryValue] = useState<string>(params.get('name') || initialQuery);

  const debouncedOnSearch = useCallback(
    debounce((currentQuery: string | null, currentCategories: string | null) => {
      onSearch(currentQuery, showCategoryFilter ? currentCategories : null); // Pass null for category if filter is hidden
    }, 500),
    [onSearch, showCategoryFilter] // Add showCategoryFilter to dependencies
  );

  useEffect(() => {
    const currentUrlName = params.get('name') || initialQuery;
    const currentUrlCategory = params.get('category') || initialCategory;

    if (queryValue !== currentUrlName) {
      setQueryValue(currentUrlName);
    }
    if (showCategoryFilter && categories !== currentUrlCategory) {
      setCategories(currentUrlCategory);
    }
    // If the category filter is hidden, and there was a category in the URL,
    // we might want to clear it or decide how to handle it.
    // For now, it will just use initialCategory if the filter is re-enabled.
  }, [window.location.search, initialQuery, initialCategory, showCategoryFilter]);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQueryValue(newValue);
    debouncedOnSearch(newValue, categories);
  };

  const handleClearQuery = () => {
    setQueryValue('');
    onSearch('', showCategoryFilter ? categories : null);
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    if (!showCategoryFilter) return; // Should not happen if TextField is hidden
    const value = e.target.value as string;
    setCategories(value);
    onSearch(queryValue, value);
  };

  const handleSearchSubmit = (e?: MouseEvent<HTMLButtonElement> | React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    onSearch(queryValue, showCategoryFilter ? categories : null);
  };

  const isCategoryFilterActive = showCategoryFilter && !!categories;
  const dynamicPlaceholderText = isCategoryFilterActive
    ? `Buscar en "${categories}"...`
    : placeholderTextProp; // Use the prop for the placeholder

  return (
    <div
      style={{
        width: isMobile ? '100%' : '85%',
        margin: 'auto',
        maxWidth: 700,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSearchSubmit}
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: '8px',
          padding: '4px 8px',
          gap: 1,
        }}
        elevation={3}
      >
        <Tooltip title="Buscar">
          <IconButton type="submit" sx={{ padding: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Tooltip>
        <InputBase
          sx={{
            marginLeft: '2px',
            flex: 1,
          }}
          placeholder={dynamicPlaceholderText} // Use dynamic placeholder
          inputProps={{ 'aria-label': dynamicPlaceholderText }}
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
        {showCategoryFilter && ( // Conditionally render the TextField
          <TextField
            select
            value={categories}
            onChange={(e) => handleCategoryChange(e as unknown as SelectChangeEvent<string>)}
            variant="outlined"
            size="small"
            label="Categoría"
            InputLabelProps={{ shrink: true }}
            sx={{
              minWidth: 160,
              textTransform: 'capitalize',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              },
              '& .MuiSelect-select': {
                paddingTop: '8.5px',
                paddingBottom: '8.5px',
              }
            }}
            SelectProps={{
              MenuProps: MenuProps,
              displayEmpty: true,
              renderValue: (selected) => {
                if (!selected) {
                  return <em>Todas</em>;
                }
                return selected as string;
              }
            }}
          >
            <MenuItem value="">
              <em>Todas</em>
            </MenuItem>
            {currentCategoriesList.map((category) => ( // Use currentCategoriesList
              <MenuItem key={category} value={category} sx={{ textTransform: 'capitalize' }}>
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