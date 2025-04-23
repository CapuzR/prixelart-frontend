import React, { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"

import { Theme } from "@mui/material"
import { makeStyles } from "tss-react/mui"
import Fab from "@mui/material/Fab"
import AddIcon from "@mui/icons-material/Add"
import ViewListIcon from "@mui/icons-material/ViewList"
import CreateVariant from "./CreateVariant"
// import UpdateVariant from '../../productCrud/variants/updateVariant';
// import DisableVariant from '../../productCrud/variants/disableVariant';
import ReadVariant from "./ReadVariants"
import { Product, Variant } from "../../../../../types/product.types"

interface VarProps {
  setActiveVCrud: (path: string) => void
  activeVCrud: string
  product: Product | undefined
}

const useStyles = makeStyles()((theme: Theme) => {
  return {
    toolbar: {
      paddingRight: 24,
    },
    paper: {
      padding: theme.spacing(2),
      display: "flex",
      overflow: "none",
      flexDirection: "column",
      boxShadow: "none",
      marginBottom: 10,
    },
    fixedHeight: {
      height: "auto",
    },
  }
})

export default function Variants({
  product,
  activeVCrud,
  setActiveVCrud,
}: VarProps) {
  const { classes, cx } = useStyles()
  const navigate = useNavigate()
  const location = useLocation()
  const fixedHeightPaper = cx(classes.paper, classes.fixedHeight)
  const [variant, setVariant] = useState<Variant | undefined>(undefined)

  const handleProductAction = (action:string) => {
    if (action === "read") {
      setVariant(undefined)
      navigate({
        pathname: "/product/" + product?._id + "/variant/read",
      })
    } else {
      navigate({
        pathname: "/product/" + product?._id + "/variant/create",
      })
    }
  }

  useEffect(() => {
    location.pathname.split("/").length === 9
      ? setActiveVCrud(
          location.pathname.split("/")[location.pathname.split("/").length - 4]
        )
      : location.pathname.split("/").length === 8
        ? setActiveVCrud(
            location.pathname.split("/")[
              location.pathname.split("/").length - 2
            ]
          )
        : (location.pathname.split("/").length === 7 ||
            location.pathname.split("/").length === 6) &&
          setActiveVCrud(
            location.pathname.split("/")[
              location.pathname.split("/").length - 1
            ]
          )
  }, [location.pathname, activeVCrud, product, setActiveVCrud])

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", right: 0, top: -50 }}>
        <Fab
          color="default"
          aria-label="edit"
          onClick={() => {
            handleProductAction("read")
          }}
        >
          <ViewListIcon />
        </Fab>
        {!variant && (
          <Fab
            style={{ marginLeft: 10 }}
            color="primary"
            aria-label="add"
            onClick={() => {
              handleProductAction("create")
            }}
          >
            <AddIcon />
          </Fab>
        )}
      </div>
      <Grid container spacing={3}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={fixedHeightPaper}>
            {activeVCrud === "create" ? (
              <CreateVariant
                product={product}
                setVariant={setVariant}
                setActiveVCrud={setActiveVCrud}
              />
            ) : activeVCrud === "read" ? (
              <ReadVariant product={product} setVariant={setVariant} />
            ) : activeVCrud === "update" ? (
              <CreateVariant
                product={product}
                variant={variant}
                setVariant={setVariant}
                setActiveVCrud={setActiveVCrud}
              />
            ) : (
              <></>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}
