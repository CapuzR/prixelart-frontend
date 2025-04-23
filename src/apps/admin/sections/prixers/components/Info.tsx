import React, { useState } from "react"
import { Theme } from "@mui/material/styles"
import { makeStyles } from "tss-react/mui"

import Grid2 from "@mui/material/Grid2"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Box from "@mui/material/Box"

import { Prixer } from "../../../../../types/prixer.types"
import { Consumer } from "../../../../../types/consumer.types"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    paper1: {
      position: "absolute",
      width: "80%",
      maxHeight: "90%",
      overflowY: "auto",
      backgroundColor: "white",
      boxShadow: theme.shadows[2],
      padding: "16px 32px 24px",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      textAlign: "justify",
      minWidth: 320,
      borderRadius: 10,
      display: "flex",
      flexDirection: "row",
    },
  }
})

interface PrixerProps {
  selectedPrixer: Prixer | undefined
  selectedConsumer: Consumer | undefined
  handleClose: () => void
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

export default function PrixerInfo({
  handleClose,
  selectedPrixer,
  selectedConsumer,
}: PrixerProps) {
  const { classes } = useStyles()
  const [value1, setValue1] = useState(0)

  const handleChange1 = (event: React.SyntheticEvent, newValue: number) => {
    setValue1(newValue)
  }

  function TabPanel(props: TabPanelProps) {
    const { children, value, index } = props
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
      >
        {value === index && (
          <Box p={3}>
            <>{children}</>
          </Box>
        )}
      </div>
    )
  }

  return (
    <Grid2 container className={classes.paper1}>
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" color="secondary">
          {selectedPrixer?.firstName + " " + selectedPrixer?.lastName}
        </Typography>

        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </div>
      <Tabs
        value={value1}
        onChange={handleChange1}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab style={{ textTransform: "none" }} label="Información de Prixer" />
        <Tab style={{ textTransform: "none" }} label="Información de Cliente" />
        <Tab style={{ textTransform: "none" }} label="Historial" />
      </Tabs>
      <TabPanel value={value1} index={0}>
        <Grid2
          container
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
          }}
        >
          {selectedPrixer && (
            <>
              <Typography>
                {` Fecha de nacimiento: ${new Date(selectedPrixer?.dateOfBirth)?.toLocaleDateString()}`}
              </Typography>
              <Typography>{`Teléfono: ${selectedPrixer?.phone}`}</Typography>
              <Typography>{`Correo: ${selectedPrixer?.email}`}</Typography>
              <Typography
                style={{ marginBottom: 10 }}
              >{`Ubicación: ${selectedPrixer?.city}, ${selectedPrixer?.country}`}</Typography>
              <Typography>
                Redes sociales:
                {selectedPrixer?.instagram && (
                  <>
                    <br></br>Instagram: {selectedPrixer?.instagram}
                  </>
                )}
                {selectedPrixer?.facebook && (
                  <>
                    <br></br>Facebook: {selectedPrixer?.facebook}
                  </>
                )}
                {selectedPrixer?.twitter && (
                  <>
                    <br></br>Twitter: {selectedPrixer?.twitter}
                  </>
                )}
              </Typography>
            </>
          )}
        </Grid2>
      </TabPanel>

      <TabPanel value={value1} index={1}>
        <Grid2
          container
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
          }}
        >
          {selectedConsumer?.gender && (
            <Typography>Género: {selectedConsumer?.gender} </Typography>
          )}
          {selectedConsumer?.address && (
            <Typography>Dirección: {selectedConsumer?.address} </Typography>
          )}
          {selectedConsumer?.billingAddress && (
            <Typography>
              Dirección de facturación: {selectedConsumer?.billingAddress}{" "}
            </Typography>
          )}
          {selectedConsumer?.shippingAddress && (
            <Typography>
              Dirección de envío: {selectedConsumer?.shippingAddress}{" "}
            </Typography>
          )}
          {selectedConsumer?.nationalId && (
            <Typography>
              Documento de identidad: {selectedConsumer?.nationalIdType}{" "}
              {selectedConsumer?.nationalId}{" "}
            </Typography>
          )}
        </Grid2>
      </TabPanel>
    </Grid2>
  )
}
