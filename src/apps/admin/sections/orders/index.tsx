import React, { useEffect, useState } from "react"
import axios from "axios"
import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"
import { Theme, useTheme } from "@mui/material"
import Fab from "@mui/material/Fab"
import AddIcon from "@mui/icons-material/Add"
import GetAppIcon from "@mui/icons-material/GetApp"
import BackspaceIcon from "@mui/icons-material/Backspace"

import Title from "../../components/Title"
import useMediaQuery from "@mui/material/useMediaQuery"
import Modal from "@mui/material/Modal"
import RefreshIcon from "@mui/icons-material/Refresh"
import Tooltip from "@mui/material/Tooltip"
import ReadOrders from "./components/Table"
import OrderDetails from "./views/Details"
import CreateOrder from "./views/Create"
// import PayComission from "./payComission"
import { getComission } from "../../../consumer/checkout/pricesFunctions.jsx"
import moment from "moment-timezone"
import "moment/locale/es"
import ExcelJS from "exceljs"
import { makeStyles } from "tss-react/mui"
import { useSnackBar, useLoading, getPermissions } from "@context/GlobalContext"
import { Consumer } from "../../../../types/consumer.types"
import { Order, basicData } from "../../../../types/order.types"
import { Discount } from "../../../../types/discount.types"
import { Surcharge } from "../../../../types/surcharge.types"
import { Organization } from "../../../../types/organization.types"

// const drawerWidth = 240

const useStyles = makeStyles()((theme: Theme) => {
  return {
    paper: {
      padding: theme.spacing(1),
      display: "flex",
      overflow: "none",
      flexDirection: "column",
    },
    fixedHeight: {
      height: "auto",
      overflow: "none",
    },
  }
})

export default function Orders({}) {
  const { classes, cx } = useStyles()
  // const navigate = useNavigate();
  const theme = useTheme()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const permissions = getPermissions()

  const fixedHeightPaper = cx(classes.paper, classes.fixedHeight)
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"))
  // const isMobile = useMediaQuery(theme.breakpoints.down("md"))
  // const isIphone = useMediaQuery(theme.breakpoints.down("xs"))
  const [isShowDetails, setIsShowDetails] = useState(false)
  const [showVoucher, setShowVoucher] = useState(false)
  const [rows, setRows] = useState<Order[]>([])
  const [modalContent, setModalContent] = useState<Order | undefined>(undefined)
  const [openCreateOrder, setOpenCreateOrder] = useState(false)
  const [discountList, setDiscountList] = useState<Discount[]>([])
  const [surchargeList, setSurchargeList] = useState<Surcharge[]>([])
  const [prixers, setPrixers] = useState([])
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [consumers, setConsumers] = useState<Consumer[]>([])
  const [filters, setFilters] = useState({
    creationDate: undefined,
    shippingDate: undefined,
    client: undefined,
    payStatus: undefined,
    status: undefined,
    seller: undefined,
  })
  const [clients, setClients] = useState<string[]>([])
  const [activeRemoveFilters, setActiveRemoveFilters] = useState(false)
  const [refresh, setRefresh] = useState(null)

  // const findPrixer = async (prx: string) => {
  //   const base_url = import.meta.env.VITE_BACKEND_URL + "/prixer/read"
  //   return await axios
  //     .post(base_url, { username: prx })
  //     .then((response) => {
  //       return response.data
  //     })
  //     .catch((error) => {
  //       console.log(error)
  //     })
  // }

  const readOrders = async () => {
    setLoading(true)
    const base_url = import.meta.env.VITE_BACKEND_URL + "/order/read-all"
    try {
      const response = await axios.post(base_url, { withCredentials: true })
      // setRows(response.data.orders)
      // console.log(response.data.orders)
      return response.data.orders
    } catch (error) {
      console.log(error)
      return []
    } finally {
      setLoading(false)
    }
  }

  const downloadOrders = async () => {
    const orders: Order[] = await readOrders()
    const workbook = new ExcelJS.Workbook()
    let date: Date | string = new Date()
    date = moment(date).format("DD/MM/YYYY").replace(/\//g, "-")
    const worksheet = workbook.addWorksheet(`Pedidos`)
    worksheet.columns = [
      { header: "status", key: "status", width: 16 },
      { header: "ID", key: "ID", width: 10 },
      { header: "Fecha de solicitud", key: "createdOn", width: 12 },
      { header: "Nombre del cliente", key: "basicData", width: 24 },
      { header: "Tipo de cliente", key: "typeConsumer", width: 12 },
      { header: "certificado", key: "", width: 12 },
      { header: "Prixer", key: "prixer", width: 18 },
      { header: "Arte", key: "art", width: 24 },
      { header: "Producto", key: "product", width: 20 },
      { header: "Atributo", key: "attributes", width: 20 },
      { header: "Cantidad", key: "quantity", width: 10 },
      { header: "Observación", key: "observations", width: 18 },
      { header: "Vendedor", key: "createdBy", width: 16 },
      { header: "Método de pago", key: "paymentMethod", width: 14 },
      { header: "Validación del pago", key: "payStatus", width: 12 },
      { header: "Fecha de pago", key: "payDate", width: 11 },
      { header: "Método de entrega", key: "shippingData", width: 14 },
      { header: "Costo unitario", key: "price", width: 8 },
      { header: "Fecha de entrega", key: "shippingDate", width: 11 },
      { header: "Fecha concretada", key: "completionDate", width: 11 },
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

    function eliminarEtiquetasHTML(observations: string) {
      return observations?.replace(/<[^>]+>/g, "")
    }

    const searchConsumerType = (basicData: basicData) => {
      if (
        basicData !== undefined &&
        (basicData.firstname !== undefined || basicData.name !== undefined)
      ) {
        const match: Consumer | undefined = consumers.find(
          (cons: Consumer) =>
            cons.firstname === (basicData.firstname || basicData.name) &&
            cons.lastname === basicData.lastname
        )
        if (match) {
          return match.consumerType
        } else {
          return undefined
        }
      } else {
        return undefined
      }
    }

    orders.map((order, i) => {
      const v2 = {
        status: order?.status,
        ID: order.orderId,
        createdOn: new Date(order.createdOn)?.toLocaleDateString(),
        basicData:
          (order.basicData?.firstname || order.basicData?.name) +
          " " +
          order.basicData?.lastname,
        typeConsumer:
          // consumerData?.consumerType ||
          searchConsumerType(order.basicData),
        shippingDate: "",
        // Certificado
        prixer: "",
        art: "",
        product: "",
        attributes: "",
        quantity: "",
        observations: eliminarEtiquetasHTML(order?.observations),
        createdBy: order.createdBy?.username,
        paymentMethod: order?.billingData?.paymentMethod,
        shippingData: "",
        payStatus: order.payStatus,
        payDate: order.payDate && new Date(order?.payDate).toLocaleDateString(),
        price: "",
        completionDate:
          order.completionDate &&
          new Date(order?.completionDate).toLocaleDateString(),
      }

      let shippingData: string
      if (order.shippingData?.method !== undefined) {
        shippingData =
          typeof order.shippingData?.method === "string"
            ? order.shippingData?.method
            : order.shippingData?.method?.name
      }
      let shippingDate: string
      if (order.shippingData?.shippingDate !== undefined) {
        shippingDate = new Date(
          order.shippingData?.shippingDate
        ).toLocaleDateString()
      }
      let prixer: any = ""
      let art: any = ""
      let product: any = ""
      let attributes: any = ""
      let quantity: any = ""
      let price: any = ""
      order.requests.map((item) => {
        prixer = item.art && item.art?.prixerUsername

        art = item.art && item.art?.title

        product = item.product.name

        if (typeof item.product.selection === "string") {
          attributes = item.product.selection
        } else if (
          item.product.selection &&
          typeof item.product.selection === "object" &&
          item.product.selection?.attributes &&
          item.product.selection?.attributes[1]?.value
        ) {
          attributes =
            item.product.selection?.attributes[0]?.value +
            ", " +
            item.product.selection?.attributes[1]?.value
        } else if (
          item.product.selection &&
          typeof item.product.selection === "object" &&
          item.product.selection?.attributes
        ) {
          attributes = item.product.selection?.attributes[0]?.value
        }

        quantity = item.quantity

        if (
          item.product.finalPrice !== undefined &&
          typeof item.product.finalPrice === "string"
        ) {
          price = "$" + item.product.finalPrice
        } else if (item.product.finalPrice !== undefined) {
          price = "$" + item.product.finalPrice
        } else if (item.product.publicPrice.equation !== undefined) {
          price = "$" + item.product.publicPrice.equation
        } else if (item.product.prixerPrice.equation !== undefined) {
          price = "$" + item.product.prixerPrice.equation
        } else price = "$" + item.product?.publicPrice?.from

        v2.prixer = prixer
        v2.art = art
        v2.product = product
        v2.attributes = attributes
        v2.quantity = quantity
        v2.price = price
        v2.shippingData = shippingData
        v2.shippingDate = shippingDate

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
      })
    })

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `Pedidos ${date}.xlsx`
      link.click()
    })
  }

  const handleClose = () => {
    setIsShowDetails(false)
    setOpenCreateOrder(false)
    setModalContent(undefined)
    setShowVoucher(false)
  }

  const handleCloseVoucher = () => {
    setShowVoucher(!showVoucher)
  }

  const handleChangeStatus = async (order: Order, status: string) => {
    const URI =
      import.meta.env.VITE_BACKEND_URL + "/order/update/" + order.orderId
    const body = {
      status: status,
    }
    await axios.put(URI, body, { withCredentials: true }).then((res) => {
      if (res.data.message) {
        showSnackBar(res.data.message)
      }
    })
    const updated = orders.map((x) => {
      if (x.orderId === order.orderId) {
        x.status = status
        return x
      } else return x
    })
    setOrders(updated)
    if (filters.status !== undefined) {
      const updatedv2 = rows.filter((x) => x.orderId !== order.orderId)
      setRows(updatedv2)
    }

    if (
      (order.payStatus === "Pagado" ||
        order.payStatus === "Giftcard" ||
        order.payStatus === "Obsequio") &&
      status === "Concretado"
    ) {
      // payComission(order)
    }
  }

  // const payComission = async (order: Order) => {
  //   for (let item of order.requests) {
  //     if (item.art !== undefined) {
  //       const art = item.art;
  //       let unitPrice: number = 0
  //       let amount: number = 0
  //       let destinatary: string | undefined = undefined
  //       let discount = discountList.find(
  //         (dis) => dis._id === item.product.discount
  //       )
  //       let surcharge = surchargeList.find(
  //         (sur) =>
  //           sur.appliedUsers.includes(art.prixerUsername) ||
  //           sur.appliedUsers.includes(art.owner)
  //       )
  //       let consumersFiltered = consumers.filter(
  //         (con) => con.consumerType === "Prixer"
  //       )
  //       const ORGS = orgs.find((o) => o.username === art.owner)
  //       const prx = await findPrixer(item.art.prixerUsername)
  //       const prixer = await consumersFiltered.find(
  //         (con) =>
  //           con.firstname
  //             ?.toLowerCase()
  //             .includes(basicData?.name?.toLowerCase()) &&
  //           con.lastname
  //             ?.toLowerCase()
  //             .includes(basicData?.lastname?.toLowerCase())
  //       )

  //       if (ORGS !== undefined) {
  //         destinatary = ORGS.account
  //         let profit = item.product.finalPrice

  //         let p = ORGS?.agreement?.appliedProducts?.find(
  //           (p) => p._id === item.product._id
  //         )
  //         let co =
  //           p?.variants?.length > 0
  //             ? Number(p?.variants[0]?.cporg)
  //             : Number(p?.cporg)
  //         if (
  //           order.consumerData &&
  //           order.consumerData.consumerType === "DAs" &&
  //           ORGS.agreement.considerations["da"] > 0
  //         ) {
  //           co = co - (co / 100) * ORGS.agreement.considerations["da"]
  //         } else if (
  //           order.consumerData &&
  //           order.consumerData.consumerType === "Corporativo" &&
  //           ORGS.agreement.considerations["corporativo"] > 0
  //         ) {
  //           co = co - (co / 100) * ORGS.agreement.considerations["corporativo"]
  //         } else if (
  //           order.consumerData &&
  //           order.consumerData.consumerType === "Prixer" &&
  //           ORGS.agreement.considerations["prixer"] > 0
  //         ) {
  //           co = co - (co / 100) * ORGS.agreement.considerations["prixer"]
  //         } else if (
  //           order.consumerData &&
  //           order.consumerData.consumerType === "Artista" &&
  //           ORGS.agreement.considerations["artista"] > 0
  //         ) {
  //           co = co - (co / 100) * ORGS.agreement.considerations["artista"]
  //         }

  //         let prev = (profit / 100) * (co || ORGS.agreement.comission)
  //         let total

  //         if (surcharge !== undefined) {
  //           if (surcharge.type === "Porcentaje") {
  //             total = prev - (prev / 100) * surcharge.value
  //           } else if (surcharge.type === "Monto") {
  //             total = prev - surcharge.value
  //           }
  //         } else {
  //           total = prev
  //         }
  //         amount = total * item.quantity
  //       } else {
  //         destinatary = prx.account
  //         // Obtener el precio base
  //         if (item.product.modifyPrice) {
  //           unitPrice = item.product.finalPrice
  //         } else if (item.product.finalPrice) {
  //           unitPrice = item.product.finalPrice
  //         } else if (prixer !== undefined) {
  //           item.product.prixerEquation
  //             ? (unitPrice = Number(
  //                 item.product?.prixerEquation?.replace(/[,]/gi, ".")
  //               ))
  //             : (unitPrice = Number(
  //                 item.product?.prixerPrice?.from?.replace(/[,]/gi, ".")
  //               ))
  //         } else {
  //           item.product.publicEquation
  //             ? (unitPrice = Number(
  //                 item.product?.publicEquation.replace(/[,]/gi, ".")
  //               ))
  //             : (unitPrice = Number(
  //                 item.product.publicPrice.from?.replace(/[,]/gi, ".")
  //               ))
  //         }

  //         // Restar 10% automático y calcular precio base con %comisión
  //         // Hay que cambiar esto por un ID
  //         if (
  //           prx.firstName === order.basicData.name.trim() &&
  //           prx.lastName === order.basicData.lastname.trim()
  //         ) {
  //           return
  //         } else if (item.product.finalPrice === undefined) {
  //           unitPrice =
  //             (unitPrice - unitPrice / 10) / (1 - item.art.comission / 100)
  //         }

  //         // De existir descuentos y no ser Prixer se aplica el descuento
  //         if (item.product.modifyPrice !== true) {
  //           if (
  //             typeof item.product.discount === "string" &&
  //             discount?.type === "Porcentaje" &&
  //             prixer === undefined
  //           ) {
  //             let op = Number(unitPrice - (unitPrice / 100) * discount.value)
  //             unitPrice = op
  //           } else if (
  //             typeof item.product.discount === "string" &&
  //             discount?.type === "Monto" &&
  //             prixer === undefined
  //           ) {
  //             let op = Number(unitPrice - discount.value)
  //             unitPrice = op
  //           }
  //         }

  //         // Calcular comisión
  //         amount = (unitPrice / 100) * (item.art.comission || 10)
  //         // Aplcar recargo
  //         if (surcharge) {
  //           let total
  //           if (surcharge.type === "Porcentaje") {
  //             total = amount - (amount / 100) * surcharge.value
  //             amount = total
  //           } else if (surcharge.type === "Monto") {
  //             total = amount - surcharge.value
  //             amount = total
  //           }
  //         }
  //         console.log(amount, "amount after surcharge")
  //         amount = amount * item.quantity
  //       }

  //       if (
  //         item.art?.prixerUsername &&
  //         item.art?.prixerUsername !== "Personalizado" &&
  //         destinatary !== undefined
  //       ) {
  //         const url = import.meta.env.VITE_BACKEND_URL + "/movement/create"
  //         const data = {
  //           _id: nanoid(),
  //           createdOn: new Date(),
  //           createdBy: JSON.parse(localStorage.getItem("adminToken")).username,
  //           date: new Date(),
  //           destinatary: destinatary,
  //           description: `Comisión de la orden #${order.orderId}`,
  //           type: "Depósito",
  //           value: amount,
  //           item: item,
  //           adminToken: localStorage.getItem("adminTokenV"),
  //         }
  //         await axios.post(url, data).then(async (res) => {
  //           if (res.data.success === false) {
  //             setSnackBarError(true)
  //             showSnackBar(res.data.message)
  //           } else {
  //             //     const data2 = {
  //             //       orderId: order.orderId,
  //             //       comissions: data,
  //             //       adminToken: localStorage.getItem("adminTokenV"),
  //             //     }
  //             //     const url2 =
  //             //       import.meta.env.VITE_BACKEND_URL + "/order/addComissions"
  //             //     await axios.put(url2, data2).then(async (res) => {
  //             //       if (res.data.success === false) {
  //             setSnackBarError(true)
  //             showSnackBar(res.data.message)
  //           }
  //         })
  //         //   }
  //         // })
  //       } else if (destinatary === undefined) {
  //         setSnackBarError(true)
  //         showSnackBar(
  //           "La cartera no ha sido encontrada, verifique que el propietario y/o owner tenga una cartera válida e inténtelo de nuevo."
  //         )
  //       }
  //     }
  //   }
  // }

  const handleChangePayStatus = async (order: Order, payStatus: string) => {
    const URI =
      import.meta.env.VITE_BACKEND_URL +
      "/order/updatePayStatus/" +
      order.orderId
    const body = {
      payStatus: payStatus,
    }

    await axios.put(URI, body, { withCredentials: true }).then((res) => {
      if (res.data.message) {
        showSnackBar(res.data.message)
      }
    })

    const updated = orders.map((x) => {
      if (x.orderId === order.orderId) {
        x.payStatus = payStatus
        return x
      } else return x
    })
    setOrders(updated)

    // const updatedv2 = rows.filter((x) => x.orderId !== order.orderId);
    // setRows(updatedv2);

    if (
      (payStatus === "Pagado" ||
        payStatus === "Giftcard" ||
        payStatus === "Obsequio") &&
      order.status === "Concretado"
    ) {
      // payComission(order)
    }
  }

  const handleRemoveFilters = () => {
    if (activeRemoveFilters) {
      setActiveRemoveFilters(false)
    } else {
      console.log("No hay función activa para eliminar filtros.")
    }
  }

  const getClients = async () => {
    const URI = import.meta.env.VITE_BACKEND_URL + "/order/getClients"
    const response = await axios.get(URI)
    setClients(response.data.clients)
  }

  const updateItemFromOrders = (
    order: string,
    index: number,
    status: string
  ) => {
    let orderv2 = orders
    let rowsv2 = rows

    orderv2.map((o) => {
      if (o.orderId === order) {
        o.requests[index].product.status = status
      }
    })

    rowsv2.map((o) => {
      if (o.orderId === order) {
        o.requests[index].product.status = status
      }
    })

    setRows(rowsv2)
    setOrders(orderv2)
  }

  useEffect(() => {
    getClients()
  }, [])

  return (
    <>
      <Grid2
        container
        spacing={2}
        style={{ marginLeft: isDesktop ? "12px" : "" }}
      >
        <Paper className={fixedHeightPaper}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Title title="Pedidos" />
            <div>
              <Tooltip
                title="Descargar listado"
                style={{ height: 40, width: 40 }}
              >
                <Fab
                  color="primary"
                  size="small"
                  onClick={downloadOrders}
                  style={{ marginRight: 10 }}
                  // download
                  // href={url}
                >
                  <GetAppIcon />
                </Fab>
              </Tooltip>
              {permissions?.createOrder && (
                <Tooltip title="Crear pedido" style={{ height: 40, width: 40 }}>
                  <Fab
                    color="primary"
                    size="small"
                    onClick={() => {
                      setOpenCreateOrder(true)
                    }}
                    style={{ marginRight: 10 }}
                  >
                    <AddIcon />
                  </Fab>
                </Tooltip>
              )}
              <Tooltip
                title="Eliminar filtros"
                style={{ height: 40, width: 40 }}
              >
                <Fab
                  color="primary"
                  size="small"
                  onClick={handleRemoveFilters}
                  style={{ marginRight: 10 }}
                >
                  <BackspaceIcon />
                </Fab>
              </Tooltip>
              <Tooltip
                title="Recargar listado"
                style={{ height: 40, width: 40 }}
              >
                <Fab
                  color="primary"
                  size="small"
                  onClick={handleRemoveFilters}
                  style={{ marginRight: 10 }}
                >
                  <RefreshIcon />
                </Fab>
              </Tooltip>
            </div>
          </div>
          <ReadOrders
            rows={rows}
            setModalContent={setModalContent}
            setIsShowDetails={setIsShowDetails}
            isShowDetails={isShowDetails}
            handleChangePayStatus={handleChangePayStatus}
            handleChangeStatus={handleChangeStatus}
            // admins={props.admins}
            // sellers={props.sellers}
            clients={clients}
            setActiveRemoveFilters={setActiveRemoveFilters}
            activeRemoveFilters={activeRemoveFilters}
            setRefresh={setRefresh}
          />
        </Paper>
      </Grid2>

      <Modal open={isShowDetails} onClose={handleClose}>
        <OrderDetails
          discountList={discountList}
          modalContent={modalContent}
          setModalContent={setModalContent}
          showVoucher={showVoucher}
          setShowVoucher={setShowVoucher}
          handleClose={handleClose}
          handleCloseVoucher={handleCloseVoucher}
          updateItemFromOrders={updateItemFromOrders}
        />
      </Modal>

      <Modal open={openCreateOrder}>
        <CreateOrder
          readOrders={readOrders}
          // buyState={props.buyState}
          // setBuyState={props.setBuyState}
          discountList={discountList}
          surchargeList={surchargeList}
          // deleteItemInBuyState={props.deleteItemInBuyState}
          // setSelectedArtToAssociate={props.setSelectedArtToAssociate}
          // setSelectedProductToAssociate={props.setSelectedProductToAssociate}
          // AssociateProduct={props.AssociateProduct}
          // addItemToBuyState={props.addItemToBuyState}
          // changeQuantity={props.changeQuantity}
          handleClose={handleClose}
          // dollarValue={props.dollarValue}
          orgs={orgs}
          setDiscountList={setDiscountList}
          setSurchargeList={setSurchargeList}
          setPrixers={setPrixers}
          setOrgs={setOrgs}
          setConsumers={setConsumers}
        />
      </Modal>
      {/* <Modal open={openPayComission}>
        <PayComission
          setLoading={setLoading}
          readOrders={readOrders}
          buyState={props.buyState}
          setBuyState={props.setBuyState}
          discountList={discountList}
          surchargeList={surchargeList}
          handleClose={handleClose}
          dollarValue={dollarValue}
          orgs={orgs}
          consumers={consumers}
          prixers={prixers}
          showSnackBar={showSnackBar}
          setSnackBarError={setSnackBarError}
          permissions={permissions}
          modalContent={modalContent}
          setModalContent={setModalContent}
        />
      </Modal> */}
    </>
  )
}
