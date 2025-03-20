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
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import useStyles from './serviceSearchBar.styles';

interface ServiceSearchBarProps {
  query: string;
  setQuery: (value: string) => void;
  categories: string | undefined;
  setCategories: (value: string) => void;
}

const ServiceSearchBar: React.FC<ServiceSearchBarProps> = (props) => {
  const classes = useStyles();
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

  return (
    <div
      style={{
        width: isDesktop ? '50%' : '100%',
        margin: 'auto',
        maxWidth: 616,
      }}
    >
      <Paper component="form" className={classes.root} elevation={3}>
        <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
          <IconButton
            type="submit"
            className={classes.iconButton}
            aria-label="search"
          >
            <SearchIcon />
          </IconButton>
          <InputBase
            className={classes.input}
            placeholder="Busca el servicio ideal"
            inputProps={{ 'aria-label': 'Busca el servicio ideal' }}
            value={props.query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              props.setQuery(e.target.value);
            }}
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
            value={props.categories || ''}
            onChange={(e: SelectChangeEvent) => {
              props.setCategories(e.target.value as string);
            }}
            input={<Input />}
            MenuProps={MenuProps}
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
