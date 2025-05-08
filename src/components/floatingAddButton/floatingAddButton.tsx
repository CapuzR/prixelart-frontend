import React from 'react';
import Fab from '@mui/material/Fab';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import Tooltip from '@mui/material/Tooltip';

// Interface for the component props
interface FloatingAddButtonProps {
  setOpenArtFormDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenServiceFormDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

// Interface for the token data structure
interface Token {
  username: string;
  // Add other token properties if they exist
}

// Define base styles for the Floating Action Buttons (FABs)
const fabBaseStyle: React.CSSProperties = {
  position: 'fixed', 
  right: 10,       
  margin: "8px", 
};

// Styles for the "Add Service" FAB
const serviceFabStyle: React.CSSProperties = {
  ...fabBaseStyle, // Inherit base FAB styles
  bottom: 80,      // Specific bottom position for this FAB
};

// Styles for the "Add Art" FAB
const artFabStyle: React.CSSProperties = {
  ...fabBaseStyle, // Inherit base FAB styles
  bottom: 10,      // Specific bottom position for this FAB
};


const FloatingAddButton: React.FC<FloatingAddButtonProps> = (props) => {
  // Function to open the art dialog
  const openArtDialog = () => {
    props.setOpenArtFormDialog(true);
  };

  // Function to open the service dialog
  const openServiceDialog = () => {
    props.setOpenServiceFormDialog(true);
  };

  // Retrieve and parse the token from localStorage
  const tokenString = localStorage.getItem('token');
  let tokenData: Token | null = null;
  if (tokenString) {
    try {
      tokenData = JSON.parse(tokenString) as Token;
    } catch (error) {
      // Log an error if token parsing fails
      console.error('Error parsing token:', error);
    }
  }

  return (
    // This div is a wrapper for the conditionally rendered FABs.
    // It no longer has specific styles applied to it directly.
    <div>
      {/* Conditionally render buttons if tokenData and username exist */}
      {tokenData && tokenData.username && (
        <>
          {/* Tooltip and Fab for adding a service */}
          <Tooltip title="Agregar Servicio" placement="left">
            <Fab
              color="primary"
              aria-label="add service"
              onClick={openServiceDialog}
              style={serviceFabStyle} // Apply specific styles for this Fab
            >
              <LocalActivityIcon />
            </Fab>
          </Tooltip>
          {/* Tooltip and Fab for adding art */}
          <Tooltip title="Agregar Arte" placement="left">
            <Fab
              color="primary"
              aria-label="add art"
              onClick={openArtDialog}
              style={artFabStyle} // Apply specific styles for this Fab
            >
              <AddPhotoAlternateIcon />
            </Fab>
          </Tooltip>
        </>
      )}
    </div>
  );
};

export default FloatingAddButton;
