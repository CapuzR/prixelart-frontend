import { useState } from "react"
import { makeStyles } from "tss-react/mui"
import { Theme } from "@mui/material/styles"

import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Carousel from "./components/Carousel"
import TermsAndConditions from "./components/Terms"
import BestSellers from "./components/ProductsBestSellers"
import ArtBestSellers from "./components/ArtBestSellers"
import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"

function TabPanel(props) {
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
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

const useStyles = makeStyles()((theme: Theme) => {
  return {
    root: {
      flexGrow: 1,
      backgroundColor: "white",
      "margin-left": "60px",
    },
  }
})

export default function Preferences() {
  const classes = useStyles()
  const [value, setValue] = useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const tabs = [
    "Carrusel",
    "Términos y condiciones",
    "Productos más vendidos",
    "Artes más vendidos",
  ]
  return (
    <div style={{ position: "relative" }}>
      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12 }}>
          <Paper
            sx={{
              padding: 6,
              display: "flex",
              overflow: "none",
              flexDirection: "column",
              height: "auto",
            }}
          >
            <Tabs value={value} onChange={handleChange}>
              {tabs.map((t, i) => {
                return (
                  <Tab
                    label={t}
                    sx={{
                      textTransform: "none",
                      fontSize: 20,
                    }}
                  />
                )
              })}
            </Tabs>
            <TabPanel value={value} index={0}>
              <Carousel />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <TermsAndConditions />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <BestSellers />
            </TabPanel>
            <TabPanel value={value} index={3}>
              <ArtBestSellers
              // permissions={props.permissions}
              // setSearchResult={props.setSearchResult}
              // searchResult={props.searchResult}
              />
            </TabPanel>
          </Paper>
        </Grid2>
      </Grid2>
    </div>
  )
}
