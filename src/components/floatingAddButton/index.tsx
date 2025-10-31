import React, { useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import { usePrixerCreator } from "@context/GlobalContext";

const FloatingAddButton: React.FC = () => {
  const { setArtModal, setServiceModal } = usePrixerCreator();
  const [open, setOpen] = useState(false);

  const actions = [
    {
      icon: <AddPhotoAlternateIcon />,
      name: "Agregar Arte",
      onClick: () => setArtModal(true),
    },
    {
      icon: <LocalActivityIcon />,
      name: "Agregar Servicio",
      onClick: () => setServiceModal(true),
    },
  ];

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Backdrop open={open} />

      <SpeedDial
        ariaLabel="Menú de acciones rápidas"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        icon={<SpeedDialIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
        direction="up"
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            slotProps={{
              tooltip: {
                open: true,
                title: action.name,
              },
            }}
            onClick={() => {
              action.onClick();
              handleClose();
            }}
            sx={{
              "& .MuiSpeedDialAction-staticTooltipLabel": {
                whiteSpace: "nowrap",
              },
            }}
          />
        ))}
      </SpeedDial>
    </>
  );
};

export default FloatingAddButton;
