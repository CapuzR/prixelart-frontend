import React, { useEffect, useState, useRef } from "react"
import axios from "axios"

import { useHistory, useLocation } from "react-router-dom"
import Grid from "@material-ui/core/Grid"
import Paper from "@material-ui/core/Paper"
import clsx from "clsx"
import { useTheme } from "@material-ui/core/styles"
import useMediaQuery from "@material-ui/core/useMediaQuery"
import { makeStyles } from "@material-ui/core/styles"
import Fab from "@material-ui/core/Fab"
import AddIcon from "@material-ui/icons/Add"
import ViewListIcon from "@material-ui/icons/ViewList"
import Modal from "@material-ui/core/Modal"
import Button from "@material-ui/core/Button"
import MDEditor from "@uiw/react-md-editor"

import CreateProduct from "../../productCrud/createProduct"
import UpdateProduct from "../../productCrud/updateProduct"
// import DisableProduct from "../../productCrud/disableProduct";
import ReadProducts from "../../productCrud/readProducts"
import CreateDiscount from "./createDiscount"
import UpdateDiscount from "./updateDiscount"
import ListAltIcon from "@material-ui/icons/ListAlt"
import PublishIcon from "@material-ui/icons/Publish"
import Tooltip from "@material-ui/core/Tooltip"
import CreateSurcharge from "./createSurcharge"
import UpdateSurcharge from "./updateSurcharge"
import CreateCategory from "./createCategory"
import UpdateCategory from "./updateCategory"

const excelJS = require("exceljs")

const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "hidden",
    flexDirection: "column",
  },
  fixedHeight: {
    // height: "2000px",
    overflow: "hidden",
  },
  fab: {
    right: 0,
    position: "absolute",
  },
  paper2: {
    position: "absolute",
    width: "80%",
    maxHeight: 450,
    overflowY: "auto",
    backgroundColor: "white",
    boxShadow: theme.shadows[5],
    padding: "16px 32px 24px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "justify",
  },
}))

export default function Products(props) {
  const classes = useStyles()
  const history = useHistory()
  const location = useLocation()
  const theme = useTheme()
  const inputRef = useRef(null)
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight)
  const [productEdit, setProductEdit] = useState(true)
  const [activeCrud, setActiveCrud] = useState("read")
  const [page, setPage] = useState(0)
  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState()
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [product, setProduct] = useState(
    localStorage.getItem("product")
      ? JSON.parse(localStorage.getItem("product"))
      : undefined
  )
  const [category, setCategory] = useState(
    localStorage.getItem("category")
      ? JSON.parse(localStorage.getItem("category"))
      : undefined
  )
  const [discount, setDiscount] = useState(
    localStorage.getItem("discount")
      ? JSON.parse(localStorage.getItem("discount"))
      : undefined
  )
  const [surcharge, setSurcharge] = useState(
    localStorage.getItem("surcharge")
      ? JSON.parse(localStorage.getItem("surcharge"))
      : undefined
  )
  const handleProductAction = (action) => {
    history.push({ pathname: "/admin/product/" + action })
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

  const getProducts = (x) => {
    setProducts(x)
  }

  const Callback = (childData) => {
    setPage(childData)
  }

  const downloadProducts = async () => {
    const workbook = new excelJS.Workbook()
    const date = new Date().toLocaleDateString().replace(/\//g, "-")
    const worksheet = workbook.addWorksheet(`Productos`)
    worksheet.columns = [
      { header: "ID", key: "ID", width: 10 },
      { header: "Nombre", key: "name", width: 12 },
      { header: "Activo", key: "active", width: 12 },
      { header: "Descripción", key: "description", width: 24 },
      { header: "Categoría", key: "category", width: 10 },
      { header: "Consideraciones", key: "considerations", width: 16 },
      { header: "Tiempo de producción", key: "productionTime", width: 10 },
      { header: "Costo de producción", key: "cost", width: 10 },
      { header: "PVP mínimo", key: "PVPmin", width: 10 },
      { header: "PVP máximo", key: "PVPmax", width: 10 },
      { header: "PVM mínimo", key: "PVMmin", width: 10 },
      { header: "PVM máximo", key: "PVMmax", width: 10 },
      { header: "Variantes especiales", key: "hasSpecialVar", width: 12 },
      { header: "bestSeller", key: "bestSeller", width: 12 },
    ]
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      }
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      }
    })

    products.map((prod, i) => {
      const v2 = {
        ID: prod._id,
        name: prod.name,
        active: prod?.active,
        description: prod.description,
        category: prod.category,
        considerations: prod.considerations,
        productionTime: prod.productionTime,
        cost: prod.cost,
        PVPmin: prod.publicPrice.from,
        PVPmax: prod.publicPrice.to,
        PVMmin: prod.prixerPrice.from,
        PVMmax: prod.prixerPrice.to,
        hasSpecialVar: prod.hasSpecialVar,
        bestSeller: prod.bestSeller,
      }

      worksheet.addRow(v2).eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        }
        cell.alignment = {
          vertical: "middle",
          horizontal: "left",
          wrapText: true,
        }
      })

      prod.variants.map((v) => {
        const vsub2 = {
          ID: v._id,
          name: v.name,
          active: v?.active,
          description: v.description,
          category: v.category,
          considerations: v.considerations,
          productionTime: v.productionTime,
          cost: v.cost,
          PVPmin: v.publicPrice.equation,
          PVMmin: v.prixerPrice.equation,
        }

        worksheet.addRow(vsub2).eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          }
          cell.alignment = {
            vertical: "middle",
            horizontal: "left",
            wrapText: true,
          }
        })
      })
    })

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `Productos ${date}.xlsx`
      link.click()
    })
  }

  const handleFileSelect = () => {
    inputRef.current.click()
  }

  const updateManyProds = async (e) => {
    setLoading(true)
    const file = e.target.files[0]
    const workbook = new excelJS.Workbook()
    await workbook.xlsx.load(file)
    const worksheet = workbook.getWorksheet(1)
    let data = []

    worksheet.eachRow((row, i) => {
      if (i > 1) {
        const rowData = row.values
        const prod = {
          _id: rowData[1],
          name: rowData[2],
          active: rowData[3],
          description: rowData[4],
          category: rowData[5],
          considerations: rowData[6],
          productionTime: rowData[7],
          cost: rowData[8],
          publicPrice: { from: rowData[9], to: rowData[10] },
          prixerPrice: { from: rowData[11], to: rowData[12] },
          hasSpecialVar: rowData[13],
          bestSeller: rowData[14],
          variants: [],
        }

        const x = products.find((item) => prod._id === item._id)
        if (x) {
          data.push(prod)
        } else {
          prod.publicPrice = { equation: rowData[9] }
          prod.prixerPrice = { equation: rowData[11] }
          delete prod.hasSpecialVar
          delete prod.bestSeller
          data.at(-1)?.variants.push(prod)
        }
      }
    })

    const v2 = products
    v2.map((prod, i) => {
      prod.name = data[i].name
      prod.active = data[i].active
      prod.description = data[i].description
      prod.category = data[i].category
      prod.considerations = data[i].considerations
      prod.productionTime = data[i].productionTime
      prod.cost = data[i].cost
      prod.publicPrice = {
        from: data[i].publicPrice.from,
        to: data[i].publicPrice.to,
      }
      prod.prixerPrice = {
        from: data[i].prixerPrice.from,
        to: data[i].prixerPrice.to,
      }
      prod.hasSpecialVar = data[i].hasSpecialVar
      prod.bestSeller = data[i].bestSeller

      if (prod.variants.length > 0) {
        prod.variants.map((v, j) => {
          v.name = data[i].variants[j].name
          v.active = data[i].variants[j].active
          v.description = data[i].variants[j].description
          v.category = data[i].variants[j].category
          v.considerations = data[i].variants[j].considerations
          v.productionTime = data[i].variants[j].productionTime
          v.cost = data[i].variants[j].cost
          v.publicPrice.equation = data[i].variants[j].publicPrice.equation
          v.prixerPrice.equation = data[i].variants[j].prixerPrice.equation
        })
      }
    })

    const base_url = process.env.REACT_APP_BACKEND_URL + `/product/updateMany`
    const response = await axios.put(
      base_url,
      { adminToken: localStorage.getItem("adminTokenV"), products: v2 },
      {
        withCredentials: true,
      }
    )
    if (response.data.success === false) {
      setLoading(false)
      setDeleteOpen(true)
      setDeleteMessage(response.data.message)
    } else {
      setLoading(false)
      setDeleteOpen(true)
      setDeleteMessage(response.data.message)
    }
  }

  return (
    <>
      <div style={{ position: "relative" }}>
        {productEdit && (
          <div style={{ position: "absolute", right: 0, top: 16 }}>
            {props.permissions?.createProduct && page === 0 && (
              <>
                <Tooltip
                  title="Descargar listado"
                  style={{ height: 40, width: 40 }}
                >
                  <Fab
                    color="default"
                    aria-label="add"
                    style={{ marginRight: 10 }}
                    onClick={downloadProducts}
                  >
                    <ListAltIcon />
                  </Fab>
                </Tooltip>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <input
                    type="file"
                    accept=".xlsx"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      opacity: 0,
                      cursor: "pointer",
                    }}
                    ref={inputRef}
                    onChange={updateManyProds}
                  />
                  <Tooltip
                    title="Cargar listado"
                    style={{ height: 40, width: 40 }}
                  >
                    <Fab
                      color="default"
                      aria-label="add"
                      style={{ marginRight: 10 }}
                      onClick={handleFileSelect}
                    >
                      <PublishIcon />
                    </Fab>
                  </Tooltip>
                </div>
              </>
            )}
            <Fab
              color="default"
              aria-label="edit"
              onClick={() => {
                handleProductAction("read")
              }}
              style={{ marginRight: "10px" }}
            >
              <ViewListIcon />
            </Fab>
            {(props.permissions?.createProduct ||
              props.permissions?.createDiscount) && (
              <Fab
                color="primary"
                aria-label="add"
                onClick={() => {
                  if (page === 0) {
                    handleProductAction("create")
                  } else if (page === 1) {
                    handleProductAction("createCategory")
                  } else if (page === 2) {
                    handleProductAction("createDiscount")
                  } else {
                    handleProductAction("createSurcharge")
                  }
                }}
              >
                <AddIcon />
              </Fab>
            )}
          </div>
        )}
        <Grid
          container
          spacing={3}
          style={{ margin: isDesktop ? "10px" : "", height: "100%" }}
        >
          <Grid
            item
            xs={12}
            md={12}
            lg={12}
          >
            <Paper className={fixedHeightPaper}>
              {activeCrud === "create" ? (
                <CreateProduct />
              ) : activeCrud === "read" ? (
                <ReadProducts
                  handleCallback={Callback}
                  setProduct={setProduct}
                  product={product}
                  category={category}
                  setCategory={setCategory}
                  setDiscount={setDiscount}
                  setSurcharge={setSurcharge}
                  surcharge={surcharge}
                  permissions={props.permissions}
                  setActiveCrud={setActiveCrud}
                  getProducts={getProducts}
                  loading={loading}
                  setLoading={setLoading}
                  deleteMessage={deleteMessage}
                  setDeleteMessage={setDeleteMessage}
                  deleteOpen={deleteOpen}
                  setDeleteOpen={setDeleteOpen}
                />
              ) : activeCrud === "update" ? (
                <UpdateProduct
                  setProduct={setProduct}
                  product={product}
                  setProductEdit={setProductEdit}
                />
              ) : activeCrud === "createCategory" ? (
                <CreateCategory />
              ) : activeCrud === "updateCategory" ? (
                <UpdateCategory category={category} />
              ) : activeCrud === "createDiscount" ? (
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
            </Paper>
          </Grid>
        </Grid>
      </div>
    </>
  )
}
