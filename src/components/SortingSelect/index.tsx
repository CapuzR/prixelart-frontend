import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import styles from './styles.module.scss';

interface SortingSelectProps {
  sort: string;
  handleChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  options: { value: string; label: string }[]; // Array of options for sorting
}

//OLD: MUI should be replaced
const SortingSelect: React.FC<SortingSelectProps> = ({ sort, handleChange, options }) => {
  return (
    <FormControl className={styles['form-control']}>
      <InputLabel className={styles['input-label']} id="sorting-select-label">
        Ordenar
      </InputLabel>
      <Select
        variant="outlined"
        labelId="sorting-select-label"
        id="sorting-select"
        value={sort}
        onChange={handleChange}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SortingSelect;
