import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
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
import CloseIcon from '@mui/icons-material/Close'; // Import for the clear search button
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import InputAdornment from '@mui/material/InputAdornment'; // For adding the clear button

interface ServiceSearchBarProps {
  query: string;
  setQuery: (value: string) => void;
  categories: string | undefined;
  setCategories: (value: string) => void;
}

const ServiceSearchBar: React.FC<ServiceSearchBarProps> = (props) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const serviceAreas: string[] = ['Diseño', 'Fotografía', 'Artes Plásticas', 'Otro'];

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

  const [isShowFilter, setIsShowFilter] = useState<boolean>(false);

  const handleClearQuery = () => {
    props.setQuery('');
  };

  const isFilterActive = !!props.categories;
  const placeholderText = isFilterActive
    ? `Busca en ${props.categories}...`
    : "Busca el servicio ideal";

  const filterIconTooltip = isFilterActive
    ? `Modificar/Quitar filtro: ${props.categories}`
    : "Aplicar filtro";

  return (
    <div
      style={{
        width: isDesktop ? '50%' : '100%',
        margin: 'auto',
        maxWidth: 616,
      }}
    >
      <Paper
        component="form"
        onSubmit={(e) => e.preventDefault()} // Prevent form submission if Enter is pressed
        sx={{
          display: 'flex',
          alignItems: 'center',
          borderRadius: '8px',
          padding: '2px 4px',
        }}
        elevation={3}
      >
        <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
          <IconButton
            type="submit" // Kept as submit, can be changed if search-on-type is preferred later
            sx={{ padding: '10px' }}
            aria-label="search"
          >
            <SearchIcon />
          </IconButton>
          <InputBase
            sx={{
              marginLeft: '8px',
              flex: 1,
            }}
            placeholder={placeholderText}
            inputProps={{ 'aria-label': placeholderText }}
            value={props.query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              props.setQuery(e.target.value);
            }}
            endAdornment={
              props.query && ( // Show clear button only if there's a query
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search query"
                    onClick={handleClearQuery}
                    edge="end"
                    size="small"
                    sx={{ marginRight: '-4px' }} // Adjust spacing if needed
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }
          />
          <Tooltip title={filterIconTooltip}>
            <IconButton
              sx={{
                padding: '10px',
                color: isFilterActive ? theme.palette.primary.main : 'inherit', // Change color if filter is active
              }}
              onClick={() => setIsShowFilter(!isShowFilter)}
              aria-pressed={isFilterActive} // For accessibility
            >
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Paper>
      {isShowFilter && (
        <FormControl
          sx={{
            minWidth: 100,
            width: '100%',
            marginTop: '12px',
            backgroundColor: 'background.paper',
            borderRadius: '8px',
            boxShadow: theme.shadows[1], // Add a subtle shadow to the dropdown
          }}
        >
          <InputLabel
            id="category-select-label" // Added id for accessibility
            sx={{
              marginLeft: '14px',
              marginTop: '2px',
              // Ensure label doesn't overlap with Select input when value is present
              '&.MuiInputLabel-shrink': {
                marginTop: '2px', // Adjust if needed
              }
            }}
          >
            Categoría
          </InputLabel>
          <Select
            labelId="category-select-label" // Link to InputLabel
            value={props.categories || ''}
            onChange={(e: SelectChangeEvent) => {
              props.setCategories(e.target.value as string);
            }}
            // The input prop is used to customize the appearance of the Select's input itself
            input={<Input disableUnderline sx={{ paddingLeft: '14px', paddingRight: '32px', paddingTop: '8px', paddingBottom: '8px' }} />}
            MenuProps={MenuProps}
            displayEmpty
          >
            <MenuItem value="">
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
};

export default ServiceSearchBar;
