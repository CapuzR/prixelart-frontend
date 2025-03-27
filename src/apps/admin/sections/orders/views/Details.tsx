import React, { useEffect, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

import Grid2 from "@mui/material/Grid2"
import Paper from "@mui/material/Paper"
import { Theme, Typography } from "@mui/material"
import MenuItem from "@mui/material/MenuItem"
import Select from "@mui/material/Select"
import OutlinedInput from "@mui/material/OutlinedInput"
import Stepper from "@mui/material/Stepper"
import Step from "@mui/material/Step"
import StepButton from "@mui/material/StepButton"
import Button from "@mui/material/Button"

import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import Img from "react-cool-img"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
// import WarpImage from '../products/components/WarpImage';

import { getPVP, getPVM } from "../../../../consumer/checkout/pricesFunctions.js"
// import moment from 'moment';
import moment from "moment-timezone"
import "moment/locale/es"
import { makeStyles } from "tss-react/mui/mui.js"
import { Discount } from "../../../../../types/discount.types.js"
import { Order } from "../../../../../types/order.types.js"
import {
  getPermissions,
  useConversionRate,
  useSnackBar,
} from "@context/GlobalContext.js"
import { Item } from "../../../../../types/item.types.js"
import { Consumer } from "../../../../../types/consumer.types.js"

interface OrderProps {
  discountList: Discount[]
  setModalContent: (order: Order) => void
  modalContent: Order | undefined
  handleClose: () => void
  showVoucher: boolean
  setShowVoucher: (x: boolean) => void
  handleCloseVoucher: () => void
  updateItemFromOrders: (order: string, index: number, status: string) => void
}

const useStyles = makeStyles()((theme: Theme) => {
  return {
    paper2: {
      position: "absolute",
      width: "80%",
      maxHeight: "90%",
      overflowY: "auto",
      backgroundColor: "white",
      boxShadow: theme.shadows[2],
      padding: "16px 32px 24px",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      textAlign: "justify",
      minWidth: 320,
      borderRadius: 10,
      marginTop: "12px",
      display: "flex",
      flexDirection: "row",
    },
  }
})

export default function OrderDetails({
  discountList,
  setModalContent,
  modalContent,
  updateItemFromOrders,
  handleClose,
  setShowVoucher,
  showVoucher,
  handleCloseVoucher,
}: OrderProps) {
  const { classes } = useStyles()
  const navigate = useNavigate()
  const { showSnackBar } = useSnackBar()

  const permissions = getPermissions()
  const { conversionRate } = useConversionRate()
  const [consumer, setConsumer] = useState<Consumer | undefined>(undefined)
  const [activeStep, setActiveStep] = useState(0)
  const [paymentVoucher, setPaymentVoucher] = useState<File | undefined>()
  const [previewVoucher, setPreviewVoucher] = useState<string | undefined>()
  const [owners, setOwners] = useState([])
  const steps = [`Detalles`, `Comprobante de pago`, `Comisiones`]

  const handleStep = (step: number) => () => {
    setActiveStep(step)
  }

  // const checkMov = async (id: string) => {
  //   const url =
  //     import.meta.env.VITE_BACKEND_URL + "/movement/readMovementByOrderId"

  //   const body = {
  //     order: id,
  //   }
  //   await axios.post(url, body).then((res) => {
  //     const oDate = res.data.createdOn
  //     const Datev2 = moment(oDate).tz("America/Caracas").format()
  //   })
  // }

  const checkConsumer = async (order: Order) => {
    let id: string
    id = modalContent?.consumerData.id || modalContent?.consumerId
    const url = import.meta.env.VITE_BACKEND_URL + "/consumer/read-by-id"

    const body = {
      consumer: id,
    }
    await axios.post(url, body).then((res) => {
      setConsumer(res.data)
    })
  }

  const updateItemStatus = async (
    newStatus: string,
    index: number,
    orderId: string
  ) => {
    const url = import.meta.env.VITE_BACKEND_URL + "/order/updateItemStatus"
    const body = {
      status: newStatus,
      index: index,
      order: orderId,
    }
    await axios.put(url, body).then((res) => {
      if (res.data.auth) {
        setModalContent(res.data.order)
        updateItemFromOrders(orderId, index, newStatus)
      }
    })
  }

  const PriceSelect = (item: Item) => {
    // if (typeof props.selectedPrixer?.username === "string") {
    //   return getPVM(
    //     item,
    //     false,
    //     props?.dollarValue,
    //     discountList,
    //     props?.selectedPrixer?.username
    //   ).toLocaleString("de-DE", {
    //     minimumFractionDigits: 2,
    //     maximumFractionDigits: 2,
    //   })
    // } else {
    return getPVP(item, false, conversionRate, discountList).toLocaleString(
      "de-DE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )
    // }
  }

  const RenderHTML: React.FC<{ htmlString: string }> = ({ htmlString }) => {
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      handleClose()
    } else return
  }
  document.addEventListener("keydown", handleKeyDown)

  useEffect(() => {
    checkConsumer(modalContent)
  }, [])

  const allowMockup = (item: Item, index: number) => {
    if (
      item.art &&
      item.product?.mockUp !== undefined &&
      item.art.title !== "Personalizado"
    ) {
      return (
        <div>
          <div
            style={{
              width: 210,
              height: 210,
              position: "relative",
            }}
            onClick={() => {
              // setSelectedArtToAssociate({
              //   index,
              //   item: item.product,
              //   previous: true,
              // })
              navigate({ pathname: "/galeria" })
            }}
          >
            {/* <WarpImage
              warpPercentage={item.product.mockUp.warpPercentage}
              warpOrientation={item.product.mockUp.warpOrientation}
              invertedWrap={item.product.mockUp.invertedWrap}
              randomArt={item.art}
              topLeft={item.product.mockUp.topLeft}
              width={item.product.mockUp.width}
              height={item.product.mockUp.height}
              perspective={item.product.mockUp.perspective}
              rotate={item.product.mockUp.rotate}
              rotateX={item.product.mockUp.rotateX}
              rotateY={item.product.mockUp.rotateY}
              skewX={item.product.mockUp.skewX}
              skewY={item.product.mockUp.skewY}
              translateX={item.product.mockUp.translateX}
              translateY={item.product.mockUp.translateY}
            /> */}
            <div
              style={{
                backgroundImage: "url(" + item.product.mockUp.mockupImg + ")",
                width: 210,
                height: 210,
                backgroundSize: "cover",
                borderRadius: 5,
                position: "absolute",
                top: "0",
                left: "0",
                zIndex: "2",
              }}
            />
          </div>
        </div>
      )
    } else if (item.art) {
      return (
        <>
          <Paper
            style={{
              width: 150,
              height: 150,
              borderRadius: 10,
              backgroundColor: "#eeeeee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            elevation={3}
          >
            <Img
              src={
                item.art.title === "Personalizado"
                  ? "/apple-touch-icon-180x180.png"
                  : item.art?.squareThumbUrl
              }
              style={{
                maxWidth: 150,
                maxHeight: 150,
                borderRadius: 10,
              }}
            />
          </Paper>
          {item.product === undefined && (
            <Paper
              style={{
                width: 150,
                height: 150,
                borderRadius: 10,
                backgroundColor: "#eeeeee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              elevation={3}
            >
              <Img
                // src={
                //   item.product?.thumbUrl &&
                //   item.product?.thumbUrl !== "undefined"
                //     ? item.product?.thumbUrl
                //     : item.product?.sources?.images[0]?.url
                // }
                style={{
                  maxWidth: 150,
                  maxHeight: 150,
                  borderRadius: 10,
                }}
              />
            </Paper>
          )}
        </>
      )
    }
  }

  const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Debería poder cargar varios comprobantes de pago(?)
    const file = e.target.files?.[0]
    if (!file) return

    setPaymentVoucher(file)
    setPreviewVoucher(URL.createObjectURL(file))
  }

  function formatNumber(x: number, l: number) {
    return x.toString().padStart(l, "0")
  }

  const uploadVoucher = async () => {
    // const formData = new FormData()
    // formData.append("paymentVoucher", paymentVoucher)

    const data = {
      paymentVoucher: paymentVoucher,
    }
    let ID = modalContent.orderId
    const base_url2 =
      import.meta.env.VITE_BACKEND_URL + "/order/addVoucher/" + ID
    const uv = await axios.put(base_url2, data)
    showSnackBar("Comprobante de pago agregado")
    setPaymentVoucher(undefined)
  }

  const findOwner = async (account: string) => {
    const url = import.meta.env.VITE_BACKEND_URL + "/user/getByAccount"
    const user = await axios.post(url, { account: account })
    const data = user.data.username
    if (typeof data === "string") return data
  }

  // useEffect(() => {
  //   let prix = []
  //   if (modalContent?.comissions && modalContent?.comissions.length > 0) {
  //     modalContent?.comissions.map(async (com: any, i: number) => {
  //       const ownerPromises = modalContent.comissions.map((com: any) =>
  //         findOwner(com.destinatary)
  //       )
  //       const resolvedOwners = await Promise.all(ownerPromises)
  //       setOwners(resolvedOwners.filter((owner) => owner !== null))
  //     })
  //   }
  // }, [])

  console.log(modalContent)

  return (
    <Grid2 container className={classes.paper2}>
      <Grid2
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Typography
          // variant="h6"
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            fontSize: "1.4rem",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          {"Pedido"}
          <strong>#{modalContent.orderId}</strong>
          {"de"}
          <strong>
            {(modalContent.basicData.firstname || modalContent.basicData.name) +
              " " +
              modalContent.basicData.lastname}
          </strong>
        </Typography>
        {showVoucher && (
          <IconButton onClick={handleCloseVoucher}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </Grid2>
      {modalContent && (
        <>
          {permissions?.detailOrder ? (
            <>
              <Stepper
                activeStep={activeStep}
                nonLinear
                style={{ width: "100%" }}
              >
                {steps.map((label, index) => {
                  return (
                    <Step key={label}>
                      <StepButton onClick={handleStep(index)}>
                        {label}
                      </StepButton>
                    </Step>
                  )
                })}
              </Stepper>
              <div
                style={{
                  paddingRight: "10px",
                  marginLeft: "13px",
                  paddingBottom: 10,
                  maxHeight: "70%",
                  width: "100%",
                }}
              >
                {activeStep === 0 && (
                  <div style={{ display: "flex" }}>
                    <Grid2
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                      size={{
                        xs: 12,
                        sm: 6,
                      }}
                    >
                      {modalContent?.requests.map((item, index) => (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            margin: "0px 20px 20px 0px",
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderRadius: 10,
                            padding: 5,
                            borderColor: "#d33f49",
                          }}
                        >
                          <Typography
                            variant="h6"
                            style={{ textAlign: "center", margin: 5 }}
                          >
                            {"Item #"}
                            {index + 1}
                          </Typography>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-evenly",
                            }}
                          >
                            {allowMockup(item, index)}
                          </div>
                          <div style={{ padding: 10 }}>
                            {item.art?.title !== "Personalizado" ? (
                              <>
                                <div>{"Arte: " + item?.art?.title}</div>
                                <div>{"Id: " + item.art?.artId}</div>
                                <div style={{ marginBottom: 10 }}>
                                  {item.art?.prixerUsername !== undefined &&
                                    "Prixer: " + item.art?.prixerUsername}
                                </div>
                              </>
                            ) : (
                              <>
                                <div>{"Arte: " + item.art?.title}</div>
                                <div style={{ marginBottom: 10 }}>
                                  {"Prixer: " + item.art?.prixerUsername}
                                </div>
                              </>
                            )}
                            <div>{"Producto: " + item.product.name}</div>
                            <div>{"Id: " + item.product._id}</div>
                            {item.product.selection &&
                            item.product.attributes &&
                            typeof item.product.selection === "object" ? (
                              item.product.attributes.map((a, i) => {
                                return (
                                  <p
                                    style={{
                                      padding: 0,
                                      margin: 0,
                                    }}
                                  >
                                    {item.product?.selection?.attributes[i]
                                      ?.name +
                                      ": " +
                                      item.product?.selection?.attributes[i]
                                        ?.value}
                                  </p>
                                )
                              })
                            ) : item.product.selection &&
                              typeof item.product.selection === "string" &&
                              item.product?.selection?.includes(" ") ? (
                              <div>
                                {item.product.selection}{" "}
                                {item.product?.variants &&
                                  item.product?.variants.length > 0 &&
                                  item.product.variants?.find(
                                    (v) => v.name === item.product.selection
                                  )?.attributes[1]?.value}
                              </div>
                            ) : (
                              item.product.selection && (
                                <div>{item.product.selection.name}</div>
                              )
                            )}
                            Precio unitario: $
                            {item.product?.finalPrice
                              ? item.product?.finalPrice?.toLocaleString(
                                  "de-DE",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )
                              : PriceSelect(item)}
                            <div>
                              {
                                typeof item.product?.discount === "string" &&
                                  "Descuento: " + item.product?.discount
                                //     discountList?.find(
                                //       ({ _id }) => _id === item.product.discount
                                //     )?.name +
                                //     " ("}
                                // {typeof item.product?.discount === "string" &&
                                // discountList?.find(
                                //   ({ _id }) => _id === item.product.discount
                                // )?.type === "Monto"
                                //   ? "$" +
                                //     discountList?.find(
                                //       ({ _id }) => _id === item.product.discount
                                //     )?.value +
                                //     ")"
                                //   : typeof item.product?.discount === "string" &&
                                //     discountList?.find(
                                //       ({ _id }) => _id === item.product.discount
                                //     )?.type === "Porcentaje" &&
                                //     "%" +
                                //       discountList?.find(
                                //         ({ _id }) => _id === item.product.discount
                                //       )?.value +
                                //       ")"
                              }
                              {consumer?.consumerType === "Prixer" &&
                                "No aplicado"}
                            </div>
                            {item.product?.autoCertified && (
                              <div
                                style={{
                                  marginTop: 10,
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                {/* {"Certificado: " +
                                  modalContent.requests[0]?.art?.certificate?
                                    .code +
                                  formatNumber(
                                    modalContent.requests[0].art?.certificate?
                                      .serial,
                                    2
                                  ) +
                                  formatNumber(
                                    modalContent.requests[0].art?.certificate?
                                      .sequence,
                                    3
                                  )} */}
                                <div />
                              </div>
                            )}
                            <div
                              style={{
                                marginTop: 10,
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              {"Cantidad: " + (item.quantity || 1)}
                              <Select
                                input={<OutlinedInput />}
                                id="status"
                                value={
                                  item.product?.status
                                    ? item.product?.status
                                    : "Por producir"
                                }
                                onChange={(e) => {
                                  updateItemStatus(
                                    e.target.value,
                                    index,
                                    modalContent.orderId
                                  )
                                }}
                              >
                                <MenuItem key={0} value={"Por producir"}>
                                  Por producir
                                </MenuItem>
                                <MenuItem key={1} value={"En impresión"}>
                                  En impresión
                                </MenuItem>
                                <MenuItem key={2} value={"En producción"}>
                                  En producción
                                </MenuItem>
                                <MenuItem key={0} value={"Por entregar"}>
                                  Por entregar
                                </MenuItem>
                                <MenuItem key={1} value={"Entregado"}>
                                  Entregado
                                </MenuItem>
                                <MenuItem key={2} value={"Concretado"}>
                                  Concretado
                                </MenuItem>
                                <MenuItem key={3} value={"Detenido"}>
                                  Detenido
                                </MenuItem>
                                <MenuItem key={4} value={"Anulado"}>
                                  Anulado
                                </MenuItem>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </Grid2>
                    <Grid2
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: 20,
                      }}
                    >
                      <Grid2
                        style={{
                          marginBottom: 40,
                          marginRight: 20,
                          borderWidth: "1px",
                          borderStyle: "solid",
                          borderRadius: 10,
                          borderColor: "grey",
                          padding: 15,
                        }}
                      >
                        <strong>Datos básicos</strong>
                        <div>
                          {"Nombre: " +
                            (modalContent.basicData.firstname ||
                              modalContent.basicData.name) +
                            " " +
                            modalContent.basicData.lastname}
                        </div>
                        <div>{"CI o RIF: " + modalContent?.basicData.ci}</div>
                        <div>
                          {"Teléfono: " + modalContent?.basicData.phone}
                        </div>
                        <div>{"Email: " + modalContent?.basicData.email}</div>
                        <div>
                          {"Dirección: " + modalContent?.basicData.address}
                        </div>
                      </Grid2>

                      {modalContent.shippingData !== undefined && (
                        <Grid2
                          style={{
                            marginBottom: 40,
                            marginRight: 20,
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderRadius: 10,
                            borderColor: "grey",
                            padding: 15,
                          }}
                        >
                          <strong>Datos de entrega</strong>
                          {modalContent.shippingData?.name &&
                            modalContent.shippingData?.lastname && (
                              <div>
                                {"Nombre: " +
                                  modalContent?.shippingData?.name +
                                  " " +
                                  modalContent?.shippingData?.lastname}
                              </div>
                            )}
                          {modalContent.shippingData?.phone && (
                            <div>
                              {"Teléfono: " + modalContent?.shippingData?.phone}
                            </div>
                          )}
                          {modalContent.shippingData?.shippingMethod && (
                            <div>
                              {"Método de entrega: " +
                                modalContent?.shippingData?.shippingMethod.name}
                            </div>
                          )}
                          {modalContent.shippingData?.address ? (
                            <div>
                              {"Dirección de envío: " +
                                modalContent?.shippingData?.address}
                            </div>
                          ) : (
                            modalContent?.basicData?.address && (
                              <div>
                                {"Dirección de envío: " +
                                  modalContent?.basicData?.address}
                              </div>
                            )
                          )}
                          {modalContent.shippingData?.shippingDate && (
                            <div>
                              {"Fecha de entrega: " +
                                moment(
                                  modalContent?.shippingData?.shippingDate
                                )?.format("DD/MM/YYYY")}
                            </div>
                          )}
                        </Grid2>
                      )}

                      {modalContent.billingData !== undefined && (
                        <Grid2
                          style={{
                            marginBottom: 40,
                            marginRight: 20,
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderRadius: 10,
                            borderColor: "grey",
                            padding: 15,
                          }}
                        >
                          <strong>Datos de facturación</strong>
                          <div>
                            {modalContent.createdBy.username !== undefined &&
                              "Pedido creado por: " +
                                modalContent.createdBy.username}
                          </div>
                          {modalContent.billingData.name &&
                            modalContent.billingData.lastname && (
                              <div>
                                {"Nombre: " +
                                  modalContent?.billingData.name +
                                  " " +
                                  modalContent?.billingData.lastname}
                              </div>
                            )}
                          {modalContent.billingData.ci && (
                            <div>
                              {"CI o RIF: " + modalContent?.billingData.ci}
                            </div>
                          )}
                          {modalContent.billingData.company && (
                            <div>
                              {"Razón social: " +
                                modalContent?.billingData.company}
                            </div>
                          )}
                          {modalContent.billingData.phone && (
                            <div>
                              {"Teléfono: " + modalContent?.billingData.phone}
                            </div>
                          )}
                          {modalContent.billingData.address && (
                            <div style={{ marginBottom: 20 }}>
                              {"Dirección de cobro: " +
                                modalContent?.billingData.address}
                            </div>
                          )}
                        </Grid2>
                      )}

                      <Grid2
                        style={{
                          marginBottom: 40,
                          marginRight: 20,
                          borderWidth: "1px",
                          borderStyle: "solid",
                          borderRadius: 10,
                          borderColor: "grey",
                          padding: 15,
                        }}
                      >
                        <strong>Datos de pago</strong>
                        <div>
                          {"Subtotal: $" +
                            Number(modalContent?.subtotal).toLocaleString(
                              "de-DE",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                        </div>
                        <div>
                          IVA: $
                          {modalContent?.billingData?.orderPaymentMethod ===
                          "Balance Prixer"
                            ? "0,00"
                            : Number(modalContent?.tax).toLocaleString(
                                "de-DE",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              )}
                        </div>
                        <div>
                          {modalContent.shippingData?.shippingMethod &&
                            "Envío: $" +
                              Number(
                                modalContent?.shippingData?.shippingMethod
                                  ?.price
                              ).toLocaleString("de-DE", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                        </div>
                        <div>
                          {"Total: $" +
                            Number(modalContent?.total).toLocaleString(
                              "de-DE",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,

                                // maximumSignificantDigits: 2,
                              }
                            )}
                        </div>
                        {modalContent?.dollarValue && (
                          <div style={{ marginBottom: 10 }}>
                            {"Tasa del dólar: Bs" +
                              Number(modalContent?.dollarValue).toLocaleString(
                                "de-DE",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,

                                  // maximumSignificantDigits: 2,
                                }
                              )}
                          </div>
                        )}
                        <div>
                          {"Forma de pago: " +
                            modalContent?.billingData?.orderPaymentMethod}
                        </div>
                        {modalContent.paymentVoucher && (
                          <Paper
                            style={{
                              width: 200,
                              borderRadius: 10,
                              marginTop: 10,
                            }}
                            elevation={3}
                          >
                            <Img
                              style={{
                                width: 200,
                                borderRadius: 10,
                                lineHeight: 0,
                              }}
                              src={modalContent?.paymentVoucher}
                              alt="voucher"
                              onClick={() => {
                                setShowVoucher(!showVoucher)
                              }}
                            />
                          </Paper>
                        )}
                      </Grid2>

                      {modalContent.observations && (
                        <Grid2
                          style={{
                            marginBottom: 40,
                            marginRight: 20,
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderRadius: 10,
                            borderColor: "grey",
                            padding: 15,
                          }}
                        >
                          <strong>Observaciones</strong>
                          <RenderHTML htmlString={modalContent.observations} />
                        </Grid2>
                      )}
                    </Grid2>
                  </div>
                )}
                {activeStep === 1 && !permissions.detailPay ? (
                  <Typography
                    color="secondary"
                    variant="h6"
                    style={{ paddingTop: 16, paddingBottom: 16 }}
                  >
                    No tienes autorización para esta área.
                  </Typography>
                ) : activeStep === 1 &&
                  modalContent?.paymentVoucher !== undefined ? (
                  <Paper
                    elevation={3}
                    style={{
                      width: "fit-content",
                      height: "fit-content",
                      maxWidth: 600,
                      maxHeight: 400,
                      borderRadius: 10,
                      marginTop: 10,
                    }}
                  >
                    <Img
                      src={modalContent?.paymentVoucher}
                      alt="Comprobante de pago"
                      style={{
                        maxWidth: 600,
                        maxHeight: 400,
                        borderRadius: 10,
                      }}
                    />
                  </Paper>
                ) : (
                  activeStep === 1 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      {previewVoucher && (
                        <Img
                          alt="Comprobante de pago"
                          src={previewVoucher}
                          style={{
                            width: 200,
                            borderRadius: 10,
                            marginBottom: 10,
                          }}
                        />
                      )}
                      <input
                        type="file"
                        id="inputfile"
                        accept="image/jpeg, image/jpg, image/webp, image/png"
                        onChange={onImageChange}
                        style={{ display: "none" }}
                      />
                      <div>
                        <label htmlFor="inputfile">
                          <Button
                            size="small"
                            variant="contained"
                            component="span"
                            style={{ textTransform: "capitalize" }}
                          >
                            Cargar comprobante
                          </Button>
                        </label>
                        {paymentVoucher && (
                          <Button
                            size="small"
                            variant="contained"
                            component="span"
                            color="primary"
                            style={{
                              textTransform: "capitalize",
                              marginLeft: 10,
                            }}
                            onClick={uploadVoucher}
                          >
                            Guardar
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                )}
                {activeStep === 2 && !permissions.detailPay ? (
                  <Typography
                    color="secondary"
                    variant="h6"
                    style={{ paddingTop: 16, paddingBottom: 16 }}
                  >
                    No tienes autorización para esta área.
                  </Typography>
                ) : activeStep === 2 &&
                  modalContent?.comissions &&
                  modalContent?.comissions.length > 0 ? (
                  modalContent?.comissions.map((com: any, i: number) => (
                    <div
                      style={{
                        width: "100%",
                        backgroundColor: i % 2 === 0 ? "#eee" : "white",
                        padding: "15px 30px",
                        borderRadius: 10,
                      }}
                    >
                      <Typography color="secondary" variant="h6">
                        Propietario: {owners[i]}
                      </Typography>

                      <Typography
                        color="secondary"
                        variant="h6"
                        style={{
                          color:
                            com.type === "Depósito" && com.value > 0
                              ? "green"
                              : "red",
                        }}
                      >
                        {com.type === "Depósito" && "+"}
                        {"$" + com.value}
                      </Typography>
                    </div>
                  ))
                ) : (
                  activeStep === 2 && (
                    <Typography
                      color="secondary"
                      variant="h6"
                      style={{ paddingTop: 16, paddingBottom: 16 }}
                    >
                      No hay comisiones registradas aún.
                    </Typography>
                  )
                )}
              </div>
            </>
          ) : (
            <Grid2
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {modalContent?.requests.map((item, index) => (
                <div
                  style={{
                    margin: "0px 20px 20px 0px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderRadius: 10,
                    padding: 5,
                    borderColor: "#d33f49",
                  }}
                >
                  <Typography
                    variant="h6"
                    style={{ textAlign: "center", margin: 5 }}
                  >
                    {"Item #"}
                    {index + 1}
                  </Typography>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    {item.product?.mockUp !== undefined && (
                      <div style={{ width: 210 }}>
                        {allowMockup(item, index)}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        width: "100%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                        }}
                      >
                        {item.product?.mockUp === undefined && (
                          <Paper
                            style={{
                              width: 150,
                              height: 150,
                              borderRadius: 10,
                              backgroundColor: "#eeeeee",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: 10,
                              marginBottom: 10,
                            }}
                            elevation={3}
                          >
                            <Img
                              src={item.art?.squareThumbUrl}
                              style={{
                                maxWidth: 150,
                                maxHeight: 150,
                                borderRadius: 10,
                              }}
                            />
                          </Paper>
                        )}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            paddingTop: 20,
                          }}
                        >
                          <div>{"Arte: " + item.art?.title}</div>
                          <div>{"Id: " + item.art?.artId}</div>
                          <div style={{ marginBottom: 10 }}>
                            {"Prixer: " + item.art?.prixerUsername}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "row" }}>
                        {/* {item.product?.mockUp === undefined &&
                          item.product?.sources?.images.length > 0 && (
                            <Paper
                              style={{
                                width: 150,
                                height: 150,
                                borderRadius: 10,
                                backgroundColor: "#eeeeee",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 10,
                              }}
                              elevation={3}
                            >
                              <Img
                                src={
                                  item.product.thumbUrl ||
                                  item.product?.sources?.images[0].url
                                }
                                style={{
                                  maxWidth: 150,
                                  maxHeight: 150,
                                  borderRadius: 10,
                                }}
                              />
                            </Paper>
                          )} */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            paddingTop: 20,
                            width: 400,
                          }}
                        >
                          <div>
                            <div>{"Producto: " + item.product.name}</div>
                            <div>{"Id: " + item.product._id}</div>
                            {item.product.selection &&
                            typeof item.product.selection === "object" ? (
                              item.product.attributes.map((a, i) => {
                                return (
                                  <p
                                    style={{
                                      padding: 0,
                                      margin: 0,
                                    }}
                                  >
                                    {item.product?.selection?.attributes[i]
                                      ?.name +
                                      ": " +
                                      item.product?.selection?.attributes[i]
                                        ?.value}
                                  </p>
                                )
                              })
                            ) : item.product.selection &&
                              typeof item.product.selection === "string" &&
                              item.product?.selection?.includes(" ") ? (
                              <div>
                                {item.product.selection}{" "}
                                {item.products?.variants &&
                                  item.products?.variants.length > 0 &&
                                  item.product.variants.find(
                                    (v) => v.name === item.product.selection
                                  ).attributes[1]?.value}
                              </div>
                            ) : (
                              item.product.selection && (
                                <div>{item.product.selection}</div>
                              )
                            )}
                          </div>
                          <div
                            style={{
                              marginTop: 10,
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            {"Cantidad: " + (item.quantity || 1)}
                            <Select
                              input={<OutlinedInput />}
                              id="status"
                              value={
                                item.product?.status
                                  ? item.product?.status
                                  : "Por producir"
                              }
                              onChange={(e) => {
                                updateItemStatus(
                                  e.target.value,
                                  index,
                                  modalContent.orderId
                                )
                              }}
                            >
                              <MenuItem key={0} value={"Por producir"}>
                                Por producir
                              </MenuItem>
                              <MenuItem key={1} value={"En impresión"}>
                                En impresión
                              </MenuItem>
                              <MenuItem key={2} value={"En producción"}>
                                En producción
                              </MenuItem>
                              <MenuItem key={0} value={"Por entregar"}>
                                Por entregar
                              </MenuItem>
                              <MenuItem key={1} value={"Entregado"}>
                                Entregado
                              </MenuItem>
                              <MenuItem key={2} value={"Concretado"}>
                                Concretado
                              </MenuItem>
                              <MenuItem key={3} value={"Detenido"}>
                                Detenido
                              </MenuItem>
                              <MenuItem key={4} value={"Anulado"}>
                                Anulado
                              </MenuItem>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {modalContent.observations && (
                <Grid2
                  style={{
                    marginBottom: 40,
                    marginRight: 20,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderRadius: 10,
                    borderColor: "grey",
                    padding: 15,
                  }}
                >
                  <strong>Observaciones</strong>
                  <RenderHTML htmlString={modalContent.observations} />
                </Grid2>
              )}
            </Grid2>
          )}
        </>
      )}
    </Grid2>
  )
}
