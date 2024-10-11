import React from "react"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { makeStyles } from "@material-ui/core/styles"
import Tabs from "@material-ui/core/Tabs"
import Tab from "@material-ui/core/Tab"
import Table from "@material-ui/core/Table"
import TableBody from "@material-ui/core/TableBody"
import TableCell from "@material-ui/core/TableCell"
import TableHead from "@material-ui/core/TableHead"
import TableRow from "@material-ui/core/TableRow"
import axios from "axios"
import Checkbox from "@material-ui/core/Checkbox"
import EditIcon from "@material-ui/icons/Edit"
import DeleteIcon from "@material-ui/icons/Delete"
import Snackbar from "@material-ui/core/Snackbar"
import Fab from "@material-ui/core/Fab"
import Typography from "@material-ui/core/Typography"
import Paper from "@material-ui/core/Paper"
import CircularProgress from "@material-ui/core/CircularProgress"
import { Backdrop } from "@material-ui/core"
import Box from "@material-ui/core/Box"
import Modal from "@material-ui/core/Modal"
import UpdateProductV2 from "./updateProductv2"
const useStyles = makeStyles((theme) => ({
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
}))

export default function ReadProducts(props) {
  const history = useHistory()
  const classes = useStyles()
  const [rows, setRows] = useState()
  const [discountList, setDiscountList] = useState([])
  const [surchargeList, setSurchargeList] = useState([])
  const [value, setValue] = useState(0)
  const [loading, setLoading] = useState(false)
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

  const getRows = async () => {
    setLoading(true)

    const base_url = process.env.REACT_APP_BACKEND_URL + "/product/read-allv1"
    await axios
      .post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        setRows(response.data.products)
        props.getProducts(response.data.products)
        setLoading(false)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const getDiscounts = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/discount/read-allv1"
    await axios
      .post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        setDiscountList(response.data.discounts)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const getSurcharges = async () => {
    const base_url = process.env.REACT_APP_BACKEND_URL + "/surcharge/read-all"
    await axios
      .post(
        base_url,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then((response) => {
        setSurchargeList(response.data.surcharges)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const getCategories = async () => {
    const base_url =
      process.env.REACT_APP_BACKEND_URL + "/product/read-categories"
    await axios
      .get(base_url, { withCredentials: true })
      .then((response) => {
        setCategories(response.data.surcharges)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  useEffect(() => {
    getRows()
    getDiscounts()
    getSurcharges()
    getCategories()
  }, [])

  const handleActive = (product, action) => {
    props.setProduct(product)
    localStorage.setItem("product", JSON.stringify(product))
    // setUpdateProduct(true);
    history.push("/admin/product/" + action + "/" + product._id)
  }

  const handleActiveDiscount = (discount, action) => {
    props.setDiscount(discount)
    localStorage.setItem("discount", JSON.stringify(discount))
    history.push("/admin/product/" + action + "/" + discount._id)
    props.setActiveCrud("updateDiscount")
  }

  const handleActiveSurcharge = (surcharge, action) => {
    props.setSurcharge(surcharge)
    localStorage.setItem("surcharge", JSON.stringify(surcharge))
    history.push("/admin/product/" + action + "/" + surcharge._id)
    props.setActiveCrud("updateSurcharge")
  }

  const deleteProduct = async (id) => {
    const URI = process.env.REACT_APP_BACKEND_URL + `/product/delete/${id}`
    const res = await axios
      .put(
        URI,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then(
        setTimeout(() => {
          props.setDeleteOpen(true)
          props.setDeleteMessage("Producto eliminado exitosamente.")
          getRows()
        }, 500)
      )
  }

  const deleteDiscount = async (id) => {
    const URI = process.env.REACT_APP_BACKEND_URL + `/discount/delete/${id}`
    const res = await axios
      .put(
        URI,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then(
        setTimeout(() => {
          props.setDeleteOpen(true)
          props.setDeleteMessage("Descuento eliminado exitosamente.")
          getDiscounts()
        }, 500)
      )
  }

  const deleteSurcharge = async (id) => {
    const URI = process.env.REACT_APP_BACKEND_URL + `/surcharge/delete/${id}`
    const res = await axios
      .put(
        URI,
        { adminToken: localStorage.getItem("adminTokenV") },
        { withCredentials: true }
      )
      .then(
        setTimeout(() => {
          props.setDeleteOpen(true)
          props.setDeleteMessage("Recargo eliminado exitosamente.")
          getSurcharges()
        }, 500)
      )
  }

  return (
    <React.Fragment>
      <Backdrop
        className={classes.backdrop}
        open={loading}
      >
        <CircularProgress />
      </Backdrop>
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
      <TabPanel
        value={value}
        index={0}
      >
        {rows && (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center"></TableCell>
                <TableCell align="center">Imagen</TableCell>
                <TableCell align="center">Nombre</TableCell>
                <TableCell align="center">Activo</TableCell>
                <TableCell align="center">Categoría</TableCell>
                <TableCell align="center">PVP desde-hasta</TableCell>
                <TableCell align="center">PVM desde-hasta</TableCell>
                <TableCell align="center">Descuento</TableCell>
                <TableCell align="center">Tiempo de producción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows &&
                rows.map((row) => (
                  <TableRow key={row._id}>
                    <TableCell align="center">
                      {props.permissions?.createProduct && (
                        <Fab
                          color="default"
                          style={{ width: 35, height: 35 }}
                          aria-label="edit"
                          onClick={(e) => {
                            handleActive(row, "update")
                          }}
                        >
                          <EditIcon />
                        </Fab>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {row.sources.images?.length > 0 ? (
                        <>
                          {row.sources.images[0]?.type === "video" ? (
                            <span
                              // key={key_id}
                              dangerouslySetInnerHTML={{
                                __html: row.sources.images[0]?.url,
                              }}
                            />
                          ) : (
                            <Paper
                              elevation={3}
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignContent: "center",
                                width: 220,
                                height: 210,
                                objectFit: "contain",
                                padding: 10,
                              }}
                            >
                              <img
                                src={row.sources.images[0]?.url || row.thumbUrl}
                                width={200}
                                alt="imageProduct"
                              />
                            </Paper>
                          )}

                          <Typography
                            style={{ fontSize: "1rem", color: "#bdbdbd" }}
                          >{`Cantidad de imagenes: ${row.sources.images.length}`}</Typography>
                        </>
                      ) : (
                        <Paper
                          elevation={3}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignContent: "center",
                            width: 220,
                            height: 210,
                            objectFit: "contain",
                            padding: 10,
                          }}
                        >
                          <img
                            src={row.thumbUrl}
                            alt="prix-product"
                            width={200}
                          />{" "}
                        </Paper>
                      )}
                    </TableCell>
                    <TableCell align="center">{row.name}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        disabled
                        checked={row.active}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                      />
                    </TableCell>
                    <TableCell align="center">{row.category}</TableCell>
                    <TableCell align="center">
                      $
                      {Number(row.publicPrice.from).toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      {row.publicPrice.to &&
                        " - " +
                          Number(row.publicPrice.to).toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                    </TableCell>
                    <TableCell align="center">
                      {row.prixerPrice &&
                        row.prixerPrice.from &&
                        "$" +
                          Number(row.prixerPrice?.from).toLocaleString(
                            "de-DE",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                      {row.prixerPrice &&
                        row.prixerPrice.to &&
                        " - " +
                          Number(row.prixerPrice.to).toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                    </TableCell>
                    <TableCell>
                      {row.discount &&
                        discountList.map((discount) => {
                          if (discount._id === row.discount)
                            return discount.name
                        })}
                    </TableCell>
                    <TableCell align="center">
                      {row.productionTime && Number(row.productionTime) > 1
                        ? row.productionTime + " días"
                        : row.productionTime && row.productionTime + " día"}
                    </TableCell>
                    <TableCell align="center">
                      {props.permissions?.deleteProduct && (
                        <Fab
                          color="default"
                          style={{ width: 35, height: 35 }}
                          aria-label="Delete"
                          onClick={(e) => {
                            e.preventDefault()
                            deleteProduct(row._id)
                          }}
                        >
                          <DeleteIcon />
                        </Fab>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </TabPanel>
      <TabPanel
        value={value}
        index={1}
      >
        {categories ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center"></TableCell>
                <TableCell align="center">Nombre</TableCell>
                <TableCell align="center">Activo</TableCell>
                <TableCell align="center">Ícono</TableCell>
                <TableCell align="center">Imagen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories &&
                categories.map((dis) => (
                  <TableRow key={dis._id}>
                    <TableCell align="center">
                      {props.permissions?.createDiscount && (
                        <Fab
                          color="default"
                          style={{ width: 35, height: 35 }}
                          aria-label="edit"
                          onClick={(e) => {
                            handleActiveDiscount(dis, "updateDiscount")
                          }}
                        >
                          <EditIcon />
                        </Fab>
                      )}
                    </TableCell>
                    <TableCell align="center">{dis.name}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        disabled
                        checked={dis.active}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                      />
                    </TableCell>
                    <TableCell align="center">{dis.type}</TableCell>
                    <TableCell align="center">
                      {dis.type === "Porcentaje"
                        ? "%" + dis.value
                        : "$" + dis.value}
                    </TableCell>
                    <TableCell align="center">
                      <ul>
                        {dis.appliedProducts.map((el, i) => (
                          <li key={i}>{el}</li>
                        ))}
                      </ul>
                    </TableCell>

                    <TableCell align="center">
                      {props.permissions?.deleteDiscount && (
                        <Fab
                          color="default"
                          style={{ width: 35, height: 35 }}
                          aria-label="Delete"
                          onClick={(e) => {
                            e.preventDefault()
                            deleteDiscount(dis._id)
                          }}
                        >
                          <DeleteIcon />
                        </Fab>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
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
      <TabPanel
        value={value}
        index={2}
      >
        {discountList ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center"></TableCell>
                <TableCell align="center">Nombre</TableCell>
                <TableCell align="center">Activo</TableCell>
                <TableCell align="center">Tipo</TableCell>
                <TableCell align="center">Valor</TableCell>
                <TableCell align="center">Productos aplicados</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {discountList &&
                discountList.map((dis) => (
                  <TableRow key={dis._id}>
                    <TableCell align="center">
                      {props.permissions?.createDiscount && (
                        <Fab
                          color="default"
                          style={{ width: 35, height: 35 }}
                          aria-label="edit"
                          onClick={(e) => {
                            handleActiveDiscount(dis, "updateDiscount")
                          }}
                        >
                          <EditIcon />
                        </Fab>
                      )}
                    </TableCell>
                    <TableCell align="center">{dis.name}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        disabled
                        checked={dis.active}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                      />
                    </TableCell>
                    <TableCell align="center">{dis.type}</TableCell>
                    <TableCell align="center">
                      {dis.type === "Porcentaje"
                        ? "%" + dis.value
                        : "$" + dis.value}
                    </TableCell>
                    <TableCell align="center">
                      <ul>
                        {dis.appliedProducts.map((el, i) => (
                          <li key={i}>{el}</li>
                        ))}
                      </ul>
                    </TableCell>

                    <TableCell align="center">
                      {props.permissions?.deleteDiscount && (
                        <Fab
                          color="default"
                          style={{ width: 35, height: 35 }}
                          aria-label="Delete"
                          onClick={(e) => {
                            e.preventDefault()
                            deleteDiscount(dis._id)
                          }}
                        >
                          <DeleteIcon />
                        </Fab>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
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
      <TabPanel
        value={value}
        index={3}
      >
        {surchargeList.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center"></TableCell>
                <TableCell align="center">Nombre</TableCell>
                <TableCell align="center">Activo</TableCell>
                <TableCell align="center">Tipo</TableCell>
                <TableCell align="center">Valor</TableCell>
                <TableCell align="center">Productos aplicados</TableCell>
                <TableCell align="center">Usuarios aplicados</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {surchargeList &&
                surchargeList.map((sur) => (
                  <TableRow key={sur._id}>
                    <TableCell align="center">
                      {props.permissions?.createDiscount && (
                        <Fab
                          color="default"
                          style={{ width: 35, height: 35 }}
                          aria-label="edit"
                          onClick={(e) => {
                            handleActiveSurcharge(sur, "updateSurcharge")
                          }}
                        >
                          <EditIcon />
                        </Fab>
                      )}
                    </TableCell>
                    <TableCell align="center">{sur.name}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        disabled
                        checked={sur.active}
                        color="primary"
                        inputProps={{ "aria-label": "secondary checkbox" }}
                      />
                    </TableCell>
                    <TableCell align="center">{sur.type}</TableCell>
                    <TableCell align="center">
                      {sur.type === "Porcentaje"
                        ? "%" + sur.value
                        : "$" + sur.value}
                    </TableCell>
                    <TableCell align="center">
                      <ul>
                        {sur.appliedProducts.map((el) => (
                          <li>{el}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell align="center">
                      <ul>
                        {sur.appliedUsers.map((el) => (
                          <li>{el}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell align="center">
                      {props.permissions?.deleteDiscount && (
                        <Fab
                          color="default"
                          style={{ width: 35, height: 35 }}
                          aria-label="Delete"
                          onClick={(e) => {
                            e.preventDefault()
                            deleteSurcharge(sur._id)
                          }}
                        >
                          <DeleteIcon />
                        </Fab>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
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
      <Snackbar
        open={props.deleteOpen}
        autoHideDuration={3000}
        message={props.deleteMessage}
        onClose={handleClose}
      />
      <Modal
        open={openUpdateProduct}
        onClose={handleClose}
      >
        <UpdateProductV2
          product={props.product}
          setProduct={props.setProduct}
          permissions={props.permissions}
          handleClose={handleClose}
        ></UpdateProductV2>
      </Modal>
      {props.handleCallback(value)}
    </React.Fragment>
  )
}
