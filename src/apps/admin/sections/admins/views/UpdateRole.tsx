import React, { useState } from "react"

import Title from "../../../components/Title"
import axios from "axios"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Grid2 from "@mui/material/Grid2"
import Snackbar from "@mui/material/Snackbar"
import CircularProgress from "@mui/material/CircularProgress"
import FormControl from "@mui/material/FormControl"
import { Switch, Typography } from "@mui/material"

import { useHistory } from "react-router-dom"
import { useSnackBar, useLoading } from "context/GlobalContext"

import { updateRole } from "../api"

export default function UpdateAdminRole({ admin, setActiveCrud }) {
  const history = useHistory()
  const [area, setArea] = useState(admin.area)
  const [detailOrder, setDetailOrder] = useState(admin.detailOrder || false)
  const [detailPay, setDetailPay] = useState(admin.detailOrder || false)
  const [orderStatus, setOrderStatus] = useState(admin.orderStatus || false)
  const [createOrder, setCreateOrder] = useState(admin.createOrder || false)
  const [createProduct, setCreateProduct] = useState(
    admin.createProduct || false
  )
  const [deleteProduct, setDeleteProduct] = useState(
    admin.deleteProduct || false
  )
  const [createDiscount, setCreateDiscount] = useState(
    admin.createDiscount || false
  )
  const [deleteDiscount, setDeleteDiscount] = useState(
    admin.deleteDiscount || false
  )
  const [modifyDollar, setModifyDollar] = useState(admin.modifyDollar || false)
  const [modifyBanners, setModifyBanners] = useState(
    admin.modifyBanners || false
  )
  const [modifyTermsAndCo, setModifyTermsAndCo] = useState(
    admin.modifyTermsAndCo || false
  )
  const [createPaymentMethod, setCreatePaymentMethod] = useState(
    admin.createPaymentMethod || false
  )
  const [deletePaymentMethod, setDeletePaymentMethod] = useState(
    admin.deletePaymentMethod || false
  )
  const [createShippingMethod, setCreateShippingMethod] = useState(
    admin.createShippingMethod || false
  )
  const [deleteShippingMethod, setDeleteShippingMethod] = useState(
    admin.deleteShippingMethod || false
  )
  const [prixerBan, setPrixerBan] = useState(admin.prixerBan || false)
  const [createTestimonial, setCreateTestimonial] = useState(
    admin.createTestimonial || false
  )
  const [deleteTestimonial, setDeleteTestimonial] = useState(
    admin.deleteTestimonial || false
  )

  const [modifyAdmins, setModifyAdmins] = useState(admin.modifyAdmins || false)

  const [setPrixerBalance, setSetPrixerBalance] = useState(
    admin.setPrixerBalance || false
  )

  const [readMovements, setReadMovements] = useState(
    admin.readMovements || false
  )

  const [createConsumer, setCreateConsumer] = useState(
    admin.createConsumer || false
  )
  const [readConsumers, setReadConsumers] = useState(
    admin.readConsumers || false
  )
  const [deleteConsumer, setDeleteConsumer] = useState(
    admin.deleteConsumer || false
  )
  const [artBan, setArtBan] = useState(admin.artBan || false)
  const [modifyBestSellers, setModifyBestSellers] = useState(
    admin.modifyBestSellers || false
  )
  const [modifyArtBestSellers, setModifyArtBestSellers] = useState(
    admin.modifyArtBestSellers || false
  )

  const [buttonState, setButtonState] = useState(false)
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!area) {
      showSnackBar("Por favor indica el área")
    } else {
      setLoading(true)
      setButtonState(true)

      const data = {
        _id: admin._id,
        area: area,
        detailOrder: detailOrder,
        detailPay: detailPay,
        orderStatus: orderStatus,
        createOrder: createOrder,
        createProduct: createProduct,
        deleteProduct: deleteProduct,
        createDiscount: createDiscount,
        deleteDiscount: deleteDiscount,
        modifyBanners: modifyBanners,
        modifyDollar: modifyDollar,
        modifyTermsAndCo: modifyTermsAndCo,
        createPaymentMethod: createPaymentMethod,
        deletePaymentMethod: deletePaymentMethod,
        createShippingMethod: createShippingMethod,
        deleteShippingMethod: deleteShippingMethod,
        prixerBan: prixerBan,
        createTestimonial: createTestimonial,
        deleteTestimonial: deleteTestimonial,
        modifyAdmins: modifyAdmins,
        setPrixerBalance: setPrixerBalance,
        readMovements: readMovements,
        createConsumer: createConsumer,
        readConsumers: readConsumers,
        deleteConsumer: deleteConsumer,
        artBan: artBan,
        modifyBestSellers: modifyBestSellers,
        modifyArtBestSellers: modifyArtBestSellers,
        adminToken: localStorage.getItem("adminTokenV"),
      }

      const updatedRole = await updateRole(data)
      if (updatedRole.success === false) {
        setLoading(false)
        setButtonState(false)
        showSnackBar(updatedRole.message)
      } else {
        showSnackBar(`Actualización de Rol de ${data.area} exitoso.`)
        history.push({ pathname: "/admin/user/read" })
      }
    }
  }

  const handleChangeDetailOrder = () => {
    setDetailOrder(!detailOrder)
  }

  const handleChangeDetailPay = () => {
    setDetailPay(!detailPay)
  }

  const handleChangeOrderStatus = () => {
    setOrderStatus(!orderStatus)
  }

  const handleChangeCreateOrder = () => {
    setCreateOrder(!createOrder)
  }
  const handleChangeCreateProduct = () => {
    setCreateProduct(!createProduct)
  }

  const handleChangeDeleteProduct = () => {
    setDeleteProduct(!deleteProduct)
  }

  const handleChangeCreateDiscount = () => {
    setCreateDiscount(!createDiscount)
  }

  const handleChangeDeleteDiscount = () => {
    setDeleteDiscount(!deleteDiscount)
  }

  const handleChangeModifyBanners = () => {
    setModifyBanners(!modifyBanners)
  }

  const handleChangeModifyTermsAndCo = () => {
    setModifyTermsAndCo(!modifyTermsAndCo)
  }

  const handleChangeModifyDollar = () => {
    setModifyDollar(!modifyDollar)
  }

  const handleChangeCreatePaymentMethod = () => {
    setCreatePaymentMethod(!createPaymentMethod)
  }

  const handleChangeDeletePaymentMethod = () => {
    setDeletePaymentMethod(!deletePaymentMethod)
  }

  const handleChangeCreateShippingMethod = () => {
    setCreateShippingMethod(!createShippingMethod)
  }

  const handleChangeDeleteShippingMethod = () => {
    setDeleteShippingMethod(!deleteShippingMethod)
  }

  const handleChangePrixerBan = () => {
    setPrixerBan(!prixerBan)
  }

  const handleChangeCreateTestimonial = () => {
    setCreateTestimonial(!createTestimonial)
  }

  const handleChangeDeleteTestimonial = () => {
    setDeleteTestimonial(!deleteTestimonial)
  }

  const handleChangeModifyAdmins = () => {
    setModifyAdmins(!modifyAdmins)
  }

  const handleChangeSetPrixerBalance = () => {
    setSetPrixerBalance(!setPrixerBalance)
  }

  const handleChangeSetReadMovements = () => {
    setReadMovements(!readMovements)
  }

  const handleChangeCreateConsumer = () => {
    setCreateConsumer(!createConsumer)
  }

  const handleChangeReadConsumers = () => {
    setReadConsumers(!readConsumers)
  }

  const handleChangeDeleteConsumer = () => {
    setDeleteConsumer(!deleteConsumer)
  }

  const handleChangeArtBan = () => {
    setArtBan(!artBan)
  }

  const handleChangeModifyBestSellers = () => {
    setModifyBestSellers(!modifyBestSellers)
  }

  const handleChangeModifyArtBestSellers = () => {
    setModifyArtBestSellers(!modifyArtBestSellers)
  }

  return (
    <React.Fragment>
      <Title>Actualizar Rol de Administrador</Title>
      <form noValidate onSubmit={handleSubmit}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <FormControl
            variant="outlined"
            style={{ width: "100%", margin: "20px 0px" }}
          >
            <TextField
              variant="outlined"
              required
              label="Área"
              value={area}
              onChange={(e) => {
                setArea(e.target.value)
              }}
            />
          </FormControl>
        </Grid2>
        <Grid2 container spacing={2}>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
            sx={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            <Typography color="secondary" style={{ marginLeft: "20px" }}>
              Órdenes
            </Typography>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para crear orden de compra</Typography>
                <Switch
                  checked={createOrder}
                  onChange={handleChangeCreateOrder}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para ver detalles de la orden</Typography>
                <Switch
                  checked={detailOrder}
                  onChange={handleChangeDetailOrder}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para modificar status de pago</Typography>
                <Switch
                  checked={detailPay}
                  onChange={handleChangeDetailPay}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para modificar status de orden de compra
                </Typography>
                <Switch
                  checked={orderStatus}
                  onChange={handleChangeOrderStatus}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
            sx={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            <Typography color="secondary" style={{ marginLeft: "20px" }}>
              Productos
            </Typography>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para crear y editar productos</Typography>
                <Switch
                  checked={createProduct}
                  onChange={handleChangeCreateProduct}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para eliminar productos</Typography>
                <Switch
                  checked={deleteProduct}
                  onChange={handleChangeDeleteProduct}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para crear descuentos</Typography>
                <Switch
                  checked={createDiscount}
                  onChange={handleChangeCreateDiscount}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para eliminar descuentos</Typography>
                <Switch
                  checked={deleteDiscount}
                  onChange={handleChangeDeleteDiscount}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              padding: "10px",
              marginTop: "20px",
            }}
          >
            <Typography color="secondary" style={{ marginLeft: "20px" }}>
              Preferencias
            </Typography>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para actualizar valor del dolar</Typography>
                <Switch
                  checked={modifyDollar}
                  onChange={handleChangeModifyDollar}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para modificar banners</Typography>
                <Switch
                  checked={modifyBanners}
                  onChange={handleChangeModifyBanners}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para modificar productos más vendidos
                </Typography>
                <Switch
                  checked={modifyBestSellers}
                  onChange={handleChangeModifyBestSellers}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para modificar artes más vendidos
                </Typography>
                <Switch
                  checked={modifyArtBestSellers}
                  onChange={handleChangeModifyArtBestSellers}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para modificar términos y condiciones
                </Typography>
                <Switch
                  checked={modifyTermsAndCo}
                  onChange={handleChangeModifyTermsAndCo}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              padding: "10px",
              marginTop: "20px",
            }}
          >
            <Typography color="secondary" style={{ marginLeft: "20px" }}>
              Prixers
            </Typography>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para banear Prixer </Typography>
                <Switch
                  checked={prixerBan}
                  onChange={handleChangePrixerBan}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para modificar balance de Prixer
                </Typography>
                <Switch
                  checked={setPrixerBalance}
                  onChange={handleChangeSetPrixerBalance}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para leer movimientos</Typography>
                <Switch
                  checked={readMovements}
                  onChange={handleChangeSetReadMovements}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para banear artes</Typography>
                <Switch
                  checked={artBan}
                  onChange={handleChangeArtBan}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              padding: "10px",
              marginTop: "20px",
            }}
          >
            <Typography color="secondary" style={{ marginLeft: "20px" }}>
              Métodos de Pago
            </Typography>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para crear y modificar métodos de pago
                </Typography>
                <Switch
                  checked={createPaymentMethod}
                  onChange={handleChangeCreatePaymentMethod}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para eliminar métodos de pago</Typography>
                <Switch
                  checked={deletePaymentMethod}
                  onChange={handleChangeDeletePaymentMethod}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              padding: "10px",
              marginTop: "20px",
            }}
          >
            <Typography color="secondary" style={{ marginLeft: "20px" }}>
              Métodos de Envío
            </Typography>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para crear y modificar métodos de envío
                </Typography>
                <Switch
                  checked={createShippingMethod}
                  onChange={handleChangeCreateShippingMethod}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para eliminar métodos de pago</Typography>
                <Switch
                  checked={deleteShippingMethod}
                  onChange={handleChangeDeleteShippingMethod}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              padding: "10px",
              marginTop: "20px",
            }}
          >
            <Typography color="secondary" style={{ marginLeft: "20px" }}>
              Testimonios
            </Typography>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para crear, modificar, mostrar y ordenar testimonios{" "}
                </Typography>
                <Switch
                  checked={createTestimonial}
                  onChange={handleChangeCreateTestimonial}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para eliminar testimonios </Typography>
                <Switch
                  checked={deleteTestimonial}
                  onChange={handleChangeDeleteTestimonial}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              padding: "10px",
              marginTop: "20px",
            }}
          >
            <Typography color="secondary" style={{ marginLeft: "20px" }}>
              Usuarios{" "}
            </Typography>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para crear, modificar y eliminar Admins{" "}
                </Typography>
                <Switch
                  checked={modifyAdmins}
                  onChange={handleChangeModifyAdmins}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
              md: 6,
            }}
            style={{
              border: "2px",
              borderStyle: "solid",
              borderColor: "silver",
              borderRadius: "10px",
              padding: "10px",
              marginTop: "20px",
            }}
          >
            <Typography color="secondary" style={{ marginLeft: "20px" }}>
              Clientes frecuentes
            </Typography>
            <div>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para crear y modificar clientes frecuentes
                </Typography>
                <Switch
                  checked={createConsumer}
                  onChange={handleChangeCreateConsumer}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>Permiso para leer clientes frecuentes</Typography>
                <Switch
                  checked={readConsumers}
                  onChange={handleChangeReadConsumers}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
              <FormControl
                variant="outlined"
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography>
                  Permiso para eliminar clientes frecuentes
                </Typography>
                <Switch
                  checked={deleteConsumer}
                  onChange={handleChangeDeleteConsumer}
                  name="checkedA"
                  color="primary"
                />
              </FormControl>
            </div>
          </Grid2>
          <Grid2
            size={{
              xs: 12,
            }}
            style={{ display: "flex", justifyContent: "center" }}
          >
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={buttonState}
            >
              Actualizar
            </Button>
          </Grid2>
        </Grid2>
      </form>
    </React.Fragment>
  )
}
