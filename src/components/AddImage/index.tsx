import React from 'react';
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface AddImageProps {
  onClick?: () => void; // Optional onClick prop
}

const AddImage: React.FC<AddImageProps> = ({ onClick }) => {
  return (
    <div style={{ height: '100%', width: '100%', display: 'grid' }}>
      <IconButton onClick={onClick}>
        {' '}
        {/* Use onClick prop */}
        <AddIcon style={{ fontSize: 80 }} color="primary" />
      </IconButton>
    </div>
  );
};

export default AddImage;
