import React from "react"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"

import { Theme } from "@mui/material/styles"
import { makeStyles } from "tss-react/mui"

import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import axios from "axios"
import Checkbox from "@mui/material/Checkbox"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import Fab from "@mui/material/Fab"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Modal from "@mui/material/Modal"
import UpdateProductV2 from "../views/updateProductv2"
import { getAllProducts, getCategories, getSurcharges } from "../api"
import { useSnackBar, useLoading } from "@context/GlobalContext"
import { getDiscounts } from "../../movements/api"
import { Product } from "../../../../../types/product.types"
import { Discount } from "../../../../../types/discount.types"
import { Surcharge } from "../../../../../types/surcharge.types"
import { Category } from "../../../../../types/category.types"
import ProductsTable from "./ProductsTable"
import CategoriesTable from "./CategoriesTable"
import DiscountsTable from "./DiscountsTable"
import SurchargesTable from "./SurchargesTable"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    loading: {
      display: "flex",
      "& > * + *": {
        marginLeft: theme.spacing(2),
      },
      marginLeft: "50vw",
      marginTop: "50vh",
    },
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: theme.palette.primary.main,
    },
  }
})

export default function Table({
  handleCallback,
  setProduct,
  product,
  setDiscount,
  setSurcharge,
  surcharge,
  category,
  setCategory,
  permissions,
  setActiveCrud,
  getProducts,
}) {
  const history = useHistory()
  const classes = useStyles()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const [rows, setRows] = useState<Product[]>()
  const [discountList, setDiscountList] = useState<Discount[]>([])
  const [surchargeList, setSurchargeList] = useState<Surcharge[]>([])
  const [value, setValue] = useState(0)
  const [categories, setCategories] = useState([])
  const [openUpdateProduct, setUpdateProduct] = useState(false)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setUpdateProduct(false)
  }

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

  const readProducts = async () => {
    const products = await getAllProducts()
    try {
      setRows(products)
      getProducts(products)
    } catch (error) {
      console.log(error)
    }
  }

  const readDiscounts = async () => {
    try {
      const response = await getDiscounts()
      setDiscountList(response)
    } catch (error) {
      console.log(error)
    }
  }

  const readSurcharges = async () => {
    try {
      const response = await getSurcharges()
      setSurchargeList(response)
    } catch (error) {
      console.log(error)
    }
  }

  const readCategories = async () => {
    try {
      const response = await getCategories()
      setCategories(response?.data?.categories)
    } catch (error) {
      console.log(error)
    }
  }

  const deleteElement = async (type: string, id: string) => {
    const URI = import.meta.env.VITE_BACKEND_URL + `/${type}/delete/${id}`
    const res = await axios.delete(URI)

    let element: string
    if (type === "product") {
      element = "Producto"
      readProducts()
    } else if (type === "discount") {
      element = "Descuento"
      readDiscounts()
    } else if (type === "surcharge") {
      element = "Recargo"
      readSurcharges()
    } else {
      element = "Categoría"
      readCategories()
    }
    showSnackBar(`${element} eliminado exitosamente.`)
  }

  useEffect(() => {
    setLoading(true)
    readProducts()
    readDiscounts()
    readSurcharges()
    readCategories()
  }, [])

  const handleActive = (
    type: string,
    element: Product | Discount | Surcharge | Category,
    action: string
  ) => {
    if (type === "product") {
      setProduct(element)
    } else if (type === "discount") {
      setDiscount(element)
    } else if (type === "surcharge") {
      setSurcharge(element)
    } else if (type === "category") {
      setCategory(element)
    }

    localStorage.setItem(`${type}`, JSON.stringify(element))
    history.push("/product/" + action + "/" + element._id)
    setActiveCrud(action)
  }

  return (
    <React.Fragment>
      <Tabs
        value={value}
        onChange={handleChange}
        style={{ width: "70%" }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab label="Productos" />
        <Tab label="Categorías" />
        <Tab label="Descuentos" />
        <Tab label="Recargos" />
      </Tabs>
      <TabPanel value={value} index={0}>
        {rows?.length > 0 ? (
          <ProductsTable
            rows={rows}
            permissions={permissions}
            handleActive={handleActive}
            discountList={discountList}
            deleteElement={deleteElement}
          />
        ) : (
          <Typography
            variant="h6"
            color="secondary"
            style={{ display: "flex", justifyContent: "center" }}
          >
            No pudimos cargar el listado de productso, recarga la ventana por
            favor.
          </Typography>
        )}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {categories?.length > 0 ? (
          <CategoriesTable
            categories={categories}
            permissions={permissions}
            handleActive={handleActive}
            deleteElement={deleteElement}
          />
        ) : (
          <Typography
            variant="h6"
            color="secondary"
            style={{ display: "flex", justifyContent: "center" }}
          >
            No tenemos categorías por ahora.
          </Typography>
        )}
      </TabPanel>
      <TabPanel value={value} index={2}>
        {discountList ? (
          <DiscountsTable
            permissions={permissions}
            discountList={discountList}
            handleActive={handleActive}
            deleteElement={deleteElement}
          />
        ) : (
          <Typography
            variant="h6"
            color="secondary"
            style={{ display: "flex", justifyContent: "center" }}
          >
            No tenemos descuentos por ahora.
          </Typography>
        )}
      </TabPanel>
      <TabPanel value={value} index={3}>
        {surchargeList?.length > 0 ? (
          <SurchargesTable
            permissions={permissions}
            handleActive={handleActive}
            deleteElement={deleteElement}
            surchargeList={surchargeList}
          />
        ) : (
          <Typography
            variant="h6"
            color="secondary"
            style={{ display: "flex", justifyContent: "center" }}
          >
            No tenemos recargos por ahora.
          </Typography>
        )}
      </TabPanel>

      <Modal open={openUpdateProduct} onClose={handleClose}>
        <UpdateProductV2
          product={product}
          setProduct={setProduct}
          permissions={permissions}
          handleClose={handleClose}
        />
      </Modal>
      {handleCallback(value)}
    </React.Fragment>
  )
}
