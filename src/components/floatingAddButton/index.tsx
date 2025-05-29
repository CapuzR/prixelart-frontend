import React from "react"
import Fab from "@mui/material/Fab"
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate"
import LocalActivityIcon from "@mui/icons-material/LocalActivity"
import Tooltip from "@mui/material/Tooltip"
import { usePrixerCreator } from "@context/GlobalContext"

// Interface for the component props

// Interface for the token data structure
interface Token {
  username: string
  // Add other token properties if they exist
}

// Define base styles for the Floating Action Buttons (FABs)
const fabBaseStyle: React.CSSProperties = {
  position: "fixed",
  right: 10,
  margin: "8px",
}

// Styles for the "Add Service" FAB
const serviceFabStyle: React.CSSProperties = {
  ...fabBaseStyle, // Inherit base FAB styles
  bottom: 80, // Specific bottom position for this FAB
}

// Styles for the "Add Art" FAB
const artFabStyle: React.CSSProperties = {
  ...fabBaseStyle, // Inherit base FAB styles
  bottom: 10, // Specific bottom position for this FAB
}

const FloatingAddButton: React.FC = () => {
  const { setArtModal, setServiceModal } = usePrixerCreator()

  // WAR TODO: use Menu from MaterialUI for a general button with animation of 180,
  // will look great! when receive onClick event the TWO upload buttons will grow up,
  // thinking about it maybe show them only doing hover (on desktop obviously)

  return (
    // This div is a wrapper for the conditionally rendered FABs.
    // It no longer has specific styles applied to it directly.
    <div>
      {/* {tokenData && tokenData.username && ( */}
      <div style={fabBaseStyle}>
        <Tooltip title="Agregar Servicio" placement="left">
          <Fab
            color="primary"
            aria-label="add service"
            onClick={() => setServiceModal(true)}
            style={serviceFabStyle}
          >
            <LocalActivityIcon />
          </Fab>
        </Tooltip>
        <Tooltip title="Agregar Arte" placement="left">
          <Fab
            color="primary"
            aria-label="add art"
            onClick={() => setArtModal(true)}
            style={artFabStyle}
          >
            <AddPhotoAlternateIcon />
          </Fab>
        </Tooltip>
      </div>
      {/* )} */}
    </div>
  )
}

export default FloatingAddButton
