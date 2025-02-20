import React, { useEffect, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"
import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"

import Fab from "@mui/material/Fab"
import AddIcon from "@mui/icons-material/Add"
import ViewListIcon from "@mui/icons-material/ViewList"
import CreateConsumer from "./createConsumer"
import UpdateConsumer from "./updateConsumer"
import ReadConsumers from "./consumersTable"

export default function Consumers({ permissions }) {
  const history = useHistory()
  const location = useLocation()
  const [activeCrud, setActiveCrud] = useState("read")
  const [consumer, setConsumer] = useState()
  const [consumerEdit, setConsumerEdit] = useState(true)

  const handleConsumerAction = (action: string) => {
    history.push({ pathname: "/consumer/" + action })
  }

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
      {/* {consumerEdit && (
        <div style={{ position: "absolute", right: 10, top: 20 }}>
          <Fab
            color="default"
            aria-label="edit"
            onClick={() => {
              handleConsumerAction("read")
            }}
            style={{ right: 10 }}
          >
            <ViewListIcon />
          </Fab>
          {permissions?.createConsumer && (
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => {
                handleConsumerAction("create")
              }}
            >
              <AddIcon />
            </Fab>
          )}
        </div>
      )} */}
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
            {activeCrud === "create" ? (
              <CreateConsumer />
            ) : activeCrud === "read" ? (
              <ReadConsumers
                setConsumer={setConsumer}
                permissions={permissions}
              />
            ) : (
              activeCrud == "update" && (
                <div>
                  <UpdateConsumer
                    consumer={consumer}
                    setConsumerEdit={setConsumerEdit}
                  />
                </div>
              )
            )}
          </Paper>
        </Grid2>
      </Grid2>
    </div>
  )
}
