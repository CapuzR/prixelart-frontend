import React, { useRef } from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import Tabs from "@mui/material/Tabs"
import Tab from "@mui/material/Tab"
import axios from "axios"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Modal from "@mui/material/Modal"
import IconButton from "@mui/material/IconButton"
import Tooltip from "@mui/material/Tooltip"
import ListAltIcon from "@mui/icons-material/ListAlt"
import PublishIcon from "@mui/icons-material/Publish"
import AddIcon from "@mui/icons-material/Add"
import ViewListIcon from "@mui/icons-material/ViewList"

import UpdateProductV2 from "./updateProductv2"
import { getAllProducts, getCategories, getSurcharges } from "../api"
import { useSnackBar, useLoading, getPermissions } from "@context/GlobalContext"
import { getDiscounts } from "../../movements/api"
import { Product } from "../../../../../types/product.types"
import { Discount } from "../../../../../types/discount.types"
import { Surcharge } from "../../../../../types/surcharge.types"
import { Category } from "../../../../../types/category.types"

import ProductsTable from "../components/ProductsTable"
// import CategoriesTable from "../components/CategoriesTable"
import DiscountsTable from "../components/DiscountsTable"
import SurchargesTable from "../components/SurchargesTable"
import ExcelJS from "exceljs"

import { useProductForm } from "@context/ProductContext"

interface TableProps {
  product: Product
  setActiveCrud: (active: string) => void
  handleCallback: (value: number) => void
  setDiscount: (disc: Discount | undefined) => void
  setSurcharge: (surc: Surcharge | undefined) => void
  setCategory: (cat: Category | undefined) => void
  setProduct: (prod: Product | undefined) => void
}

export default function Table({
  handleCallback,
  setProduct,
  product,
  setDiscount,
  setSurcharge,
  setCategory,
  setActiveCrud,
}: TableProps) {
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const permissions = getPermissions()
  const { state, dispatch } = useProductForm()

  const inputRef = useRef<HTMLInputElement | null>(null)

  const [rows, setRows] = useState<Product[]>([])
  const [discountList, setDiscountList] = useState<Discount[]>([])
  const [surchargeList, setSurchargeList] = useState<Surcharge[]>([])
  const [value, setValue] = useState(0)
  const [categories, setCategories] = useState([])
  const [openUpdateProduct, setUpdateProduct] = useState(false)

  const tabs = ["Productos", "Categorías", "Descuentos", "Recargos"]
  const handleProductAction = (action: string) => {
    navigate({ pathname: "/admin/product/" + action })
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  const handleClose = (event: any, reason: string) => {
    if (reason === "clickaway") {
      return
    }
    setUpdateProduct(false)
  }

  const readProducts = async () => {
    const products = await getAllProducts()
    try {
      setRows(products)
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
    type: string | "product" | "discount" | "surcharge" | "category",
    element: Product | Discount | Surcharge | Category,
    action: string
  ) => {
    if (type === "product" && isProduct(element)) {
      setProduct(element)
    } else if (type === "discount" && isDiscount(element)) {
      setDiscount(element)
    } else if (type === "surcharge" && isSurcharge(element)) {
      setSurcharge(element)
    } else if (type === "category" && isCategory(element)) {
      setCategory(element)
    }

    if (action === "update" && type === "product" && isProduct(element)) {
      dispatch({
        type: "SET_FULL_FORM",
        product: element,
      })
    }
    navigate({ pathname: "/admin/product/" + action + "/" + element._id })
    setActiveCrud(action)
  }

  const isProduct = (el: any): el is Product => "productName" in el
  const isDiscount = (el: any): el is Discount => "discountRate" in el
  const isSurcharge = (el: any): el is Surcharge => "surchargeAmount" in el
  const isCategory = (el: any): el is Category => "categoryName" in el
  // Cambiar el almacenamiento en el localStorage por reducer
  // localStorage.setItem(`${type}`, JSON.stringify(element))

  const CustomTypography = (text: string) => (
    <Typography
      variant="h6"
      color="secondary"
      style={{ display: "flex", justifyContent: "center" }}
    >
      {text}
    </Typography>
  )

  const downloadProducts = async () => {
    const workbook = new ExcelJS.Workbook()
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

    rows.map((prod, i) => {
      const v2 = {
        ID: prod._id,
        name: prod.name,
        active: prod?.active,
        description: prod.description,
        category: prod.category,
        considerations: prod.considerations,
        productionTime: prod.productionTime,
        cost: prod.cost,
        PVPmin: prod.publicPrice?.from,
        PVPmax: prod.publicPrice?.to,
        PVMmin: prod.prixerPrice?.from,
        PVMmax: prod.prixerPrice?.to,
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
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const updateManyProds = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true)
    const file: any = e.target.files?.[0]
    const workbook = new ExcelJS.Workbook()
    if (file) {
      await workbook.xlsx.load(file)
      const worksheet = workbook.getWorksheet(1)
      let data: any = []

      interface Price {
        from: any
        to: any
      }

      interface AlternativePrice {
        equation: any
      }
      worksheet &&
        worksheet.eachRow((row, i) => {
          if (i > 1) {
            const rowData = Array.isArray(row.values)
              ? row.values
              : Object.values(row.values)
            const prod: {
              _id: any
              name: any
              active: any
              description: any
              category: any
              considerations: any
              productionTime: any
              cost: any
              publicPrice: Price | AlternativePrice
              prixerPrice: Price | AlternativePrice
              hasSpecialVar?: any
              bestSeller?: any
              variants: any[]
            } = {
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

            const x = rows.find((item) => prod._id === item._id)
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

      const v2 = rows
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

      const base_url = import.meta.env.VITE_BACKEND_URL + `/product/updateMany`
      const response = await axios.put(base_url, { products: v2 })
      if (response.data.success === false) {
        showSnackBar(response.data.message)
      } else {
        showSnackBar(response.data.message)
      }
    }
  }

  const selectedTable = () => {
    let message: string
    if (value === 0) {
      if (rows?.length > 0) {
        return (
          <ProductsTable
            rows={rows}
            handleActive={handleActive}
            discountList={discountList}
            deleteElement={deleteElement}
          />
        )
      } else {
        message =
          "No pudimos cargar el listado de productos, recarga la ventana por favor."
        return CustomTypography(message)
      }
    }
    if (value === 1) {
      if (categories?.length > 0) {
        // return (
        //   <CategoriesTable
        //     categories={categories}
        //     handleActive={handleActive}
        //     deleteElement={deleteElement}
        //   />
        // )
      } else {
        message = "No tenemos categorías por ahora."
        return CustomTypography(message)
      }
    }
    if (value === 2) {
      if (discountList?.length > 0) {
        return (
          <DiscountsTable
            discountList={discountList}
            handleActive={handleActive}
            deleteElement={deleteElement}
          />
        )
      } else {
        message = "No tenemos descuentos por ahora."
        return CustomTypography(message)
      }
    }
    if (value === 3) {
      if (surchargeList?.length > 0) {
        return (
          <SurchargesTable
            handleActive={handleActive}
            deleteElement={deleteElement}
            surchargeList={surchargeList}
          />
        )
      } else {
        message = "No tenemos recargos por ahora."
        return CustomTypography(message)
      }
    }
  }

  const buttonTitle = () => {
    if (value === 0) {
      return "Crear Producto"
    } else if (value === 1) {
      return "Crear Categoría"
    }
    if (value === 2) {
      return "Crear Descuento"
    } else return "Crear Recargo"
  }

  useEffect(() => {
    handleCallback(value)
  }, [value])

  return (
    <React.Fragment>
      <Tabs
        value={value}
        onChange={handleChange}
        style={{ width: "70%" }}
        indicatorColor="primary"
        textColor="primary"
      >
        {tabs.map((t) => (
          <Tab
            label={t}
            style={{ textTransform: "none", fontWeight: "bold", fontSize: 20 }}
          />
        ))}
      </Tabs>
      <div style={{ position: "absolute", right: 0, top: 16 }}>
        {permissions?.createProduct && value === 0 && (
          <>
            <Tooltip
              title="Descargar listado"
              style={{ height: 40, width: 40 }}
            >
              <IconButton
                color="default"
                aria-label="add"
                style={{ marginRight: 10 }}
                onClick={downloadProducts}
              >
                <ListAltIcon />
              </IconButton>
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
              <Tooltip title="Cargar listado" style={{ height: 40, width: 40 }}>
                <IconButton
                  color="default"
                  aria-label="add"
                  style={{ marginRight: 10 }}
                  onClick={handleFileSelect}
                >
                  <PublishIcon />
                </IconButton>
              </Tooltip>
            </div>
          </>
        )}
        {/* <IconButton
          color="default"
          aria-label="edit"
          onClick={() => {
            handleProductAction("read")
          }}
          style={{ marginRight: "10px" }}
        >
          <ViewListIcon />
        </IconButton> */}
        {(permissions?.createProduct || permissions?.createDiscount) && (
          <Tooltip title={buttonTitle()}>
            <IconButton
              color="primary"
              aria-label="add"
              onClick={() => {
                if (value === 0) {
                  handleProductAction("create")
                } else if (value === 1) {
                  handleProductAction("createCategory")
                } else if (value === 2) {
                  handleProductAction("createDiscount")
                } else {
                  handleProductAction("createSurcharge")
                }
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
      <Box p={3}>{selectedTable()}</Box>

      <Modal open={openUpdateProduct} onClose={handleClose}>
        <UpdateProductV2
          product={product}
          // setProduct={setProduct}
          // handleClose={handleClose}
        />
      </Modal>
    </React.Fragment>
  )
}
