import { useState, useEffect } from "react"

import { useNavigate, useLocation } from "react-router-dom"
import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"
import { Theme, useTheme } from "@mui/material/styles"
import { makeStyles } from "tss-react/mui"
import useMediaQuery from "@mui/material/useMediaQuery"

import CreateProduct from "./views/Create"
import UpdateProduct from "./views/Update"
import ReadProducts from "./views/Table"
import CreateDiscount from "./views/CreateDiscount"
import UpdateDiscount from "./views/UpdateDiscount"
import CreateSurcharge from "./views/CreateSurcharge"
import UpdateSurcharge from "./views/UpdateSurcharge"
// import CreateCategory from "./views/CreateCategory"
// import UpdateCategory from "./views/UpdateCategory"

import { ProductFormProvider } from "@context/ProductContext"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    paper: {
      padding: theme.spacing(2),
      display: "flex",
      overflow: "hidden",
      flexDirection: "column",
      width: "100%",
    },
    fixedHeight: {
      overflow: "hidden",
    },
  }
})

export default function Products() {
  const { classes, cx } = useStyles()
  const theme = useTheme()
  const location = useLocation()

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  const fixedHeightPaper = cx(classes.paper, classes.fixedHeight)
  const [productEdit, setProductEdit] = useState(true)
  const [activeCrud, setActiveCrud] = useState("read")
  const [page, setPage] = useState(0)
  const prod = localStorage.getItem("product")
  const sur = localStorage.getItem("surcharge")
  const disc = localStorage.getItem("discount")
  const cat = localStorage.getItem("category")

  const [product, setProduct] = useState(prod && JSON.parse(prod))
  const [surcharge, setSurcharge] = useState(sur && JSON.parse(sur))
  const [discount, setDiscount] = useState(disc && JSON.parse(disc))
  const [category, setCategory] = useState(cat && JSON.parse(cat))

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

  const Callback = (childData: number) => {
    setPage(childData)
  }

  return (
    <>
      <div style={{ position: "relative" }}>
        <Grid2
          container
          spacing={3}
          sx={{
            margin: isDesktop ? "10px" : "",
            height: "100%",
            width: "100%",
          }}
        >
          <Paper className={fixedHeightPaper}>
            <ProductFormProvider>
              {activeCrud === "create" ? (
                <CreateProduct />
              ) : activeCrud === "read" ? (
                <ReadProducts
                  handleCallback={Callback}
                  setProduct={setProduct}
                  product={product}
                  setDiscount={setDiscount}
                  setSurcharge={setSurcharge}
                  setCategory={setCategory}
                  setActiveCrud={setActiveCrud}
                />
              ) : activeCrud === "update" ? (
                <UpdateProduct />
              ) : // ) : activeCrud === "createCategory" ? (
              //   <CreateCategory />
              // activeCrud === "updateCategory" ? (
              //   <UpdateCategory category={category} />
              // ) :
              activeCrud === "createDiscount" ? (
                <CreateDiscount />
              ) : activeCrud === "updateDiscount" ? (
                <UpdateDiscount discount={discount} />
              ) : activeCrud === "createSurcharge" ? (
                <CreateSurcharge />
              ) : (
                activeCrud === "updateSurcharge" && (
                  <UpdateSurcharge surcharge={surcharge} />
                )
              )}
            </ProductFormProvider>
          </Paper>
        </Grid2>
      </div>
    </>
  )
}
