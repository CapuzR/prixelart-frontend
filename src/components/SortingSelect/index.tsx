import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';

interface SortingSelectProps {
  sort: string;
  handleChange: (event: SelectChangeEvent<string>, child: React.ReactNode) => void;
  options: { value: string; label: string }[];
}

const SortingSelect: React.FC<SortingSelectProps> = ({ sort, handleChange, options }) => {
  return (
    <FormControl style={{ width: '100%', marginLeft: '10px', minWidth: '120px' }}>
      <InputLabel style={{ marginLeft: '10px' }} id="sorting-select-label">
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
