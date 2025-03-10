import { useEffect, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"
import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"

import Create from "./views/Create"
import Update from "./views/Update"
import Table from "./components/Table"
import { ConsumerFormProvider } from "@context/ConsumerFormContext"

export default function Consumers() {
  const history = useHistory()
  const location = useLocation()
  const [activeCrud, setActiveCrud] = useState("read")
  const [consumer, setConsumer] = useState()

  useEffect(() => {
    location.pathname.split("/").length === 5
      ? setActiveCrud(
          location.pathname.split("/")[location.pathname.split("/").length - 2]
        )
      : location.pathname.split("/").length === 4 &&
        setActiveCrud(
          location.pathname.split("/")[location.pathname.split("/").length - 1]
        )
  }, [location.pathname])

  return (
    <div style={{ position: "relative" }}>
      <Grid2 container spacing={3}>
        <Grid2>
          <Paper
            sx={{
              padding: 6,
              display: "flex",
              overflow: "none",
              flexDirection: "column",
              height: "auto",
            }}
          >
            <ConsumerFormProvider>
              {activeCrud === "create" ? (
                <Create />
              ) : activeCrud === "read" ? (
                <Table />
              ) : (
                activeCrud == "update" && (
                  <div>
                    <Update />
                  </div>
                )
              )}
            </ConsumerFormProvider>
          </Paper>
        </Grid2>
      </Grid2>
    </div>
  )
}
