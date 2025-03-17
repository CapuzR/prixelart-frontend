import { useState, useEffect } from "react"
import { Theme } from "@mui/material/styles"
import { makeStyles } from "tss-react/mui"

import Grid2 from "@mui/material/Grid2"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import Accordion from "@mui/material/Accordion"
import AccordionSummary from "@mui/material/AccordionSummary"
import AccordionDetails from "@mui/material/AccordionDetails"
import Checkbox from "@mui/material/Checkbox"
import FormControlLabel from "@mui/material/FormControlLabel"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import FormLabel from "@mui/material/FormLabel"
import FormControl from "@mui/material/FormControl"
import FormGroup from "@mui/material/FormGroup"
import Divider from "@mui/material/Divider"
import TextField from "@mui/material/TextField"
import InputAdornment from "@mui/material/InputAdornment"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import InfoIcon from "@mui/icons-material/Info"
import Tooltip from "@mui/material/Tooltip"

import { useSnackBar, useLoading } from "context/GlobalContext"
import { getAllProducts, getSurcharges } from "../../products/api"
import { getSurchargesList } from "../services"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: theme.palette.primary.main,
    },
    paper1: {
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
      display: "flex",
      flexDirection: "row",
    },
  }
})

export default function OrgCommission({
  selectedPrixer,
  handleClose,
  setOpenComission,
  readOrg,
}) {
  const classes = useStyles()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()

  const [surchargeList, setSurchargeList] = useState([])
  const [selectedSurcharges, setSelectedSurcharges] = useState([])
  const [base, setBase] = useState(selectedPrixer?.agreement?.base)
  const [comission, setComission] = useState(
    selectedPrixer?.agreement?.comission || 10
  )
  const [considerations, setConsiderations] = useState(
    selectedPrixer?.agreement?.considerations || {
      artista: 0,
      corporativo: 0,
      da: 0,
      prixer: 0,
    }
  )
  const [appliedAll, setAppliedAll] = useState(true)
  const [appliedProducts, setAppliedProducts] = useState([])
  const [products, setProducts] = useState()

  useEffect(() => {
    setLoading(true)
    getProducts()
    getSurchs()
    getSurchargesList(
      selectedPrixer,
      products,
      surchargeList,
      setSelectedSurcharges,
      setProductList
    )
  }, [])

  useEffect(() => {
    const allAreTrue = appliedProducts.every((product) =>
      product?.variants?.every((variant) => variant.appliedGlobalCporg === true)
    )
    setAppliedAll(allAreTrue)
  }, [appliedProducts])

  const getProducts = async () => {
    try {
      const response = await getAllProducts()
      setProducts(response)
    } catch (error) {
      console.log(error)
    }
  }

  const getSurchs = async () => {
    try {
      const response = await getSurcharges()
      setSurchargeList(response)
    } catch (error) {
      console.log(error)
    }
  }

  const handleBase = (event) => {
    setBase(event.target.name)
  }

  const handleConsiderations = (type, value) => {
    const newValue = Number(value)
    setConsiderations((prevState) => ({
      ...prevState,
      [type]: newValue,
    }))
  }

  const updateComission = async () => {
    setLoading(true)
    const base_url =
      import.meta.env.VITE_BACKEND_URL +
      "/organization/updateComission/" +
      selectedPrixer.orgId
    const body = {
      adminToken: localStorage.getItem("adminTokenV"),
      comission: Number(comission),
      appliedProducts: appliedProducts,
      base: base,
      considerations: considerations,
    }

    await axios.put(base_url, body).then((response) => {
      if (response.data.success === true) {
        setOpenComission(false)
        setOpen(true)
        showSnackBar(response.data.message)
      }
    })
    await readOrg()
    setLoading(false)
  }

  const notifySurcharge = (product) => {
    const matchingSurcharge = selectedSurcharges.find((sur) =>
      sur.appliedProducts.includes(product.name)
    )

    if (matchingSurcharge) {
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Tooltip
            title={`Este producto tiene un recargo de ${
              matchingSurcharge.value
            }${matchingSurcharge.type === "Porcentaje" ? "%" : "$"} aplicado`}
            style={{ height: 40, width: 40 }}
          >
            <InfoIcon color="primary" style={{ fontSize: "24px" }} />
          </Tooltip>
        </div>
      )
    } else {
      return null
    }
  }

  const verifySurcharge = (product) => {
    const matchingSurcharge = selectedSurcharges.find((sur) =>
      sur.appliedProducts.includes(product.name)
    )

    if (matchingSurcharge) {
      return matchingSurcharge
    } else {
      return undefined
    }
  }

  const finalComission = (v) => {
    let finalPrice
    let surchargeAmount = 0

    if ((base === "pvprixer" || base === undefined) && v.pvm !== undefined) {
      if (v.appliedGlobalCporg) {
        finalPrice =
          (Number((v.pvm - v.pvm / 10) / (1 - comission / 100)) / 100) *
          comission
      } else {
        finalPrice = Number(
          ((v.pvm - v.pvm / 10) / (1 - v.cporg / 100) / 100) * comission
        )
      }
    } else if (base === "pvm" || base === undefined) {
      if (v.appliedGlobalCporg) {
        finalPrice = Number(v.pvm / (1 - comission / 100)) - v.pvm
      } else {
        finalPrice = Number(v.pvm / (1 - v.cporg / 100) - v.pvm)
      }
    } else if (base === "pvp" || base === undefined) {
      if (v.appliedGlobalCporg) {
        finalPrice = Number(v.pvp / (1 - comission / 100)) - v.pvp
      } else {
        finalPrice = Number(v.pvp / (1 - v.cporg / 100) - v.pvp)
      }
    }

    if (v.surcharge !== undefined) {
      if (v.surcharge.type === "Porcentaje") {
        surchargeAmount = (finalPrice / 100) * v.surcharge.value
      } else if (v.surcharge.type === "Monto") {
        surchargeAmount = v.surcharge.value
      }
    }

    finalPrice -= surchargeAmount

    const formattedPrice = finalPrice.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    return (
      <Typography variant="p" style={{ color: "grey" }}>
        {"= " + formattedPrice + "$"}
      </Typography>
    )
  }

  const considerationFormat = (v, category) => {
    let value
    if (base === "pvp" || base === undefined) {
      if (v.appliedGlobalCporg) {
        value = Number(
          v.pvp /
            (1 -
              (comission - (comission / 100) * considerations[category]) /
                100) -
            v.pvp
        )
      } else {
        value = Number(
          v.pvp /
            (1 -
              Number(v.cporg - (v.cporg / 100) * considerations[category]) /
                100) -
            v.pvp
        )
      }
    } else if (base === "pvm" || base === undefined) {
      if (v.appliedGlobalCporg) {
        value = Number(
          v.pvm /
            (1 -
              (comission - (comission / 100) * considerations[category]) /
                100) -
            v.pvm
        )
      } else {
        value = Number(
          v.pvm /
            (1 -
              Number(v.cporg - (v.cporg / 100) * considerations[category]) /
                100) -
            v.pvm
        )
      }
    } else if (base === "pvprixer" || base === undefined) {
      if (v.appliedGlobalCporg) {
        value = Number(
          (v.pvm - v.pvm / 10) /
            (1 -
              (comission - (comission / 100) * considerations[category]) /
                100) -
            (v.pvm - v.pvm / 10)
        )
      } else {
        value = Number(
          (v.pvm - v.pvm / 10) /
            (1 -
              Number(v.cporg - (v.cporg / 100) * considerations[category]) /
                100) -
            (v.pvm - v.pvm / 10)
        )
      }
    }

    return (
      <Typography variant="p" style={{ color: "grey" }}>
        {"= " +
          value.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) +
          "$"}
      </Typography>
    )
  }

  const reducedComission = (v) => {
    let result = null

    if (considerations?.artista > 0) {
      result = considerationFormat(v, "artista")
    }
    if (considerations?.corporativo > 0) {
      result = considerationFormat(v, "corporativo")
    }
    if (considerations?.da > 0) {
      result = considerationFormat(v, "da")
    }
    if (considerations?.prixer > 0) {
      result = considerationFormat(v, "prixer")
    }

    return result
  }

  return (
    <div>
      <Grid2 container className={classes.paper1}>
        <div
          style={{
            display: "flex",
            width: "100%",
            marginBottom: 30,
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <Typography
            variant="h4"
            color="secondary"
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {selectedPrixer?.firstName + " " + selectedPrixer?.lastName}
            {selectedSurcharges?.length > 0 && (
              <Tooltip
                title={"Esta ORG tiene aplicado recargo(s)"}
                style={{ height: 40, width: 40 }}
              >
                <InfoIcon color="primary" style={{ fontSize: "24px" }} />
              </Tooltip>
            )}
          </Typography>

          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </div>

        <Grid2
          container
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Grid2
            style={{
              display: "flex",
              width: "80%",
              justifyContent: "space-between",
              marginLeft: "10%",
            }}
          >
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend" style={{ color: "#404e5c" }}>
                Precio Base
              </FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={base === "pvp"}
                      onChange={handleBase}
                      name="pvp"
                    />
                  }
                  style={{ color: "gray" }}
                  label="PVP"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={base === "pvm"}
                      onChange={handleBase}
                      name="pvm"
                    />
                  }
                  style={{ color: "gray" }}
                  label="PVM"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={base === "pvprixer"}
                      onChange={handleBase}
                      name="pvprixer"
                    />
                  }
                  style={{ color: "gray" }}
                  label="PVPrixer"
                />
              </FormGroup>
            </FormControl>

            <Grid2
              style={{
                display: "flex",
                alignItems: "end",
                flexDirection: "column",
              }}
            >
              <Typography color="secondary">Porcentaje de comisión:</Typography>
              <TextField
                size="small"
                variant="outlined"
                style={{ marginLeft: 10, width: 100 }}
                value={comission}
                onChange={(e) => {
                  setComission(e.target.value)
                }}
                type={"number"}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">% </InputAdornment>
                    ),
                  },
                }}
              />
              <Accordion style={{ marginTop: 10 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography color="secondary">Ajustes</Typography>
                </AccordionSummary>
                <AccordionDetails
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <Grid2
                    item
                    xs={12}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <Typography style={{ color: "gray" }}>
                      Reducción para Artista :
                    </Typography>
                    <TextField
                      size="small"
                      variant="outlined"
                      style={{ marginLeft: 10, width: 100 }}
                      value={considerations?.artista}
                      onChange={(e) => {
                        handleConsiderations("artista", e.target.value)
                      }}
                      type={"number"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">-%</InputAdornment>
                        ),
                      }}
                    />
                  </Grid2>
                  <Grid2
                    item
                    xs={12}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <Typography style={{ color: "gray" }}>
                      Reducción para Corporativo :
                    </Typography>
                    <TextField
                      size="small"
                      variant="outlined"
                      style={{ marginLeft: 10, width: 100 }}
                      value={considerations?.corporativo}
                      onChange={(e) => {
                        handleConsiderations("corporativo", e.target.value)
                      }}
                      type={"number"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">-%</InputAdornment>
                        ),
                      }}
                    />
                  </Grid2>
                  <Grid2
                    item
                    xs={12}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <Typography style={{ color: "gray" }}>
                      Reducción para DAs :
                    </Typography>
                    <TextField
                      size="small"
                      variant="outlined"
                      style={{ marginLeft: 10, width: 100 }}
                      value={considerations?.da}
                      onChange={(e) => {
                        handleConsiderations("da", e.target.value)
                      }}
                      type={"number"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">-%</InputAdornment>
                        ),
                      }}
                    />
                  </Grid2>
                  <Grid2
                    item
                    xs={12}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography style={{ color: "gray" }}>
                      Reducción para Prixer :
                    </Typography>
                    <TextField
                      size="small"
                      variant="outlined"
                      style={{ marginLeft: 10, width: 100 }}
                      value={considerations?.prixer}
                      onChange={(e) => {
                        handleConsiderations("prixer", e.target.value)
                      }}
                      type={"number"}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">-%</InputAdornment>
                        ),
                      }}
                    />
                  </Grid2>
                </AccordionDetails>
              </Accordion>
            </Grid2>
          </Grid2>

          <Divider light variant="fullWidth" />
          <Grid2
            container
            spacing={2}
            style={{
              display: "flex",
            }}
          >
            <Grid2
              item
              xs={12}
              style={{ display: "flex", alignItems: "center", marginTop: 10 }}
            >
              <Checkbox
                checked={appliedAll}
                color="primary"
                inputProps={{ "aria-label": "secondary checkbox" }}
                onChange={() => {
                  if (appliedProducts.length !== products.length) {
                    let v1 = []
                    products.map((product) => v1.push(product.name))
                    setAppliedProducts(v1)
                  } else if (appliedProducts.length === products.length) {
                    setAppliedProducts([])
                  }
                }}
              />
              <Typography color="secondary">
                Todos los productos y sus variantes
              </Typography>
            </Grid2>

            {appliedProducts &&
              appliedProducts.map((product, index) => (
                <Grid2 item xs={12}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <FormControlLabel
                        onClick={(event) => {
                          event.stopPropagation()
                          setAppliedProducts((prev) => {
                            const prevCopy = [...prev]
                            const prodCopy = {
                              ...prevCopy[index],
                            }
                            prodCopy.appliedGlobalCporg =
                              !prodCopy.appliedGlobalCporg
                            prodCopy.cporg = comission
                            prevCopy[index].variants.map((v) => {
                              ;(v.appliedGlobalCporg = true),
                                (v.cporg = comission)
                            })
                            prevCopy[index] = prodCopy
                            return prevCopy
                          })
                        }}
                        control={
                          <Checkbox
                            color="primary"
                            checked={
                              product.variants?.length > 0
                                ? product.variants.every(
                                    (item) => item.appliedGlobalCporg === true
                                  )
                                  ? true
                                  : false
                                : product.appliedGlobalCporg
                            }
                          />
                        }
                        label={product.name}
                        style={{ color: "#404e5c" }}
                      />
                      {notifySurcharge(product)}
                    </AccordionSummary>
                    <AccordionDetails
                      style={{ display: "flex", flexDirection: "column" }}
                    >
                      {product.variants && product.variants?.length > 0 ? (
                        product.variants?.map((v, i) => (
                          <Box
                            m={1}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Checkbox
                                checked={v.appliedGlobalCporg}
                                inputProps={{
                                  "aria-label": "secondary checkbox",
                                }}
                                onChange={() => {
                                  setAppliedProducts((prev) => {
                                    const prevCopy = [...prev]
                                    const variantCopy = {
                                      ...prevCopy[index].variants[i],
                                    }
                                    variantCopy.appliedGlobalCporg =
                                      !variantCopy.appliedGlobalCporg
                                    variantCopy.cporg = comission
                                    prevCopy[index].variants[i] = variantCopy
                                    return prevCopy
                                  })
                                }}
                              />
                              <Typography style={{ color: "grey" }}>
                                {v.name}
                              </Typography>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "end",
                                }}
                              >
                                {(base === "pvprixer" || base === undefined) &&
                                  (v.pvm !== undefined ? (
                                    <Typography
                                      variant="p"
                                      style={{
                                        marginRight: 10,
                                        color: "grey",
                                      }}
                                    >
                                      PVPrixer: $
                                      {v.appliedGlobalCporg
                                        ? (Number(v.pvm) - Number(v.pvm) / 10) /
                                          (1 - comission / 100).toLocaleString(
                                            "de-DE",
                                            {
                                              minimumFractionDigits: 2,
                                              maximumFractionDigits: 2,
                                            }
                                          )
                                        : (
                                            (Number(v.pvm) -
                                              Number(v.pvm) / 10) /
                                            (1 - v.cporg / 100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                    </Typography>
                                  ) : (
                                    <Typography
                                      variant="p"
                                      style={{
                                        marginRight: 10,
                                        color: "grey",
                                      }}
                                    >
                                      Esta variante no tiene costo, por favor
                                      edita la variante.
                                    </Typography>
                                  ))}
                                {(base === "pvprixer" || base === undefined) &&
                                  v.pvm !== undefined &&
                                  considerations?.artista > 0 && (
                                    <Typography
                                      variant="p"
                                      style={{
                                        marginRight: 10,
                                        color: "grey",
                                      }}
                                    >
                                      Precio para Artista Externo: $
                                      {v.appliedGlobalCporg
                                        ? Number(
                                            (v.pvm - v.pvm / 10) /
                                              (1 -
                                                Number(
                                                  comission -
                                                    (comission / 100) *
                                                      considerations?.artista
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })
                                        : Number(
                                            (v.pvm - v.pvm / 10) /
                                              (1 -
                                                Number(
                                                  v.cporg -
                                                    (v.cporg / 100) *
                                                      considerations?.artista
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                    </Typography>
                                  )}
                                {(base === "pvprixer" || base === undefined) &&
                                  v.pvm !== undefined &&
                                  considerations?.corporativo > 0 && (
                                    <Typography
                                      variant="p"
                                      style={{
                                        marginRight: 10,
                                        color: "grey",
                                      }}
                                    >
                                      Precio para Corporativo: $
                                      {v.appliedGlobalCporg
                                        ? Number(
                                            (v.pvm - v.pvm / 10) /
                                              (1 -
                                                Number(
                                                  comission -
                                                    (comission / 100) *
                                                      considerations?.corporativo
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })
                                        : Number(
                                            (v.pvm - v.pvm / 10) /
                                              (1 -
                                                Number(
                                                  v.cporg -
                                                    (v.cporg / 100) *
                                                      considerations?.corporativo
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                    </Typography>
                                  )}
                                {(base === "pvprixer" || base === undefined) &&
                                  v.pvm !== undefined &&
                                  considerations?.da > 0 && (
                                    <Typography
                                      variant="p"
                                      style={{
                                        marginRight: 10,
                                        color: "grey",
                                      }}
                                    >
                                      Precio para DAs: $
                                      {v.appliedGlobalCporg
                                        ? Number(
                                            (v.pvm - v.pvm / 10) /
                                              (1 -
                                                Number(
                                                  comission -
                                                    (comission / 100) *
                                                      considerations?.da
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })
                                        : Number(
                                            (v.pvm - v.pvm / 10) /
                                              (1 -
                                                Number(
                                                  v.cporg -
                                                    (v.cporg / 100) *
                                                      considerations?.da
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                    </Typography>
                                  )}
                                {(base === "pvprixer" || base === undefined) &&
                                  v.pvm !== undefined &&
                                  considerations?.prixer > 0 && (
                                    <Typography
                                      variant="p"
                                      style={{
                                        marginRight: 10,
                                        color: "grey",
                                      }}
                                    >
                                      Precio para Prixer: $
                                      {v.appliedGlobalCporg
                                        ? Number(
                                            (v.pvm - v.pvm / 10) /
                                              (1 -
                                                Number(
                                                  comission -
                                                    (comission / 100) *
                                                      considerations?.prixer
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })
                                        : Number(
                                            (v.pvm - v.pvm / 10) /
                                              (1 -
                                                Number(
                                                  v.cporg -
                                                    (v.cporg / 100) *
                                                      considerations?.prixer
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                    </Typography>
                                  )}
                                {(base === "pvp" || base === undefined) && (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    PVP: $
                                    {v.appliedGlobalCporg
                                      ? Number(
                                          v.pvp / (1 - comission / 100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          v.pvp / (1 - v.cporg / 100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                )}
                                {(base === "pvp" || base === undefined) &&
                                  considerations?.artista > 0 && (
                                    <Typography
                                      variant="p"
                                      style={{
                                        marginRight: 10,
                                        color: "grey",
                                      }}
                                    >
                                      Precio para Artista Externo: $
                                      {v.appliedGlobalCporg
                                        ? Number(
                                            v.pvp /
                                              (1 -
                                                Number(
                                                  comission -
                                                    (comission / 100) *
                                                      considerations?.artista
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })
                                        : Number(
                                            v.pvp /
                                              (1 -
                                                Number(
                                                  v.cporg -
                                                    (v.cporg / 100) *
                                                      considerations?.artista
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                    </Typography>
                                  )}
                                {(base === "pvp" || base === undefined) &&
                                  considerations?.corporativo > 0 && (
                                    <Typography
                                      variant="p"
                                      style={{
                                        marginRight: 10,
                                        color: "grey",
                                      }}
                                    >
                                      Precio para Corporativo: $
                                      {v.appliedGlobalCporg
                                        ? Number(
                                            v.pvp /
                                              (1 -
                                                Number(
                                                  comission -
                                                    (comission / 100) *
                                                      considerations?.corporativo
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })
                                        : Number(
                                            v.pvp /
                                              (1 -
                                                Number(
                                                  v.cporg -
                                                    (v.cporg / 100) *
                                                      considerations?.corporativo
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                    </Typography>
                                  )}
                                {(base === "pvp" || base === undefined) &&
                                  considerations?.da > 0 && (
                                    <Typography
                                      variant="p"
                                      style={{
                                        marginRight: 10,
                                        color: "grey",
                                      }}
                                    >
                                      Precio para DAs: $
                                      {v.appliedGlobalCporg
                                        ? Number(
                                            v.pvp /
                                              (1 -
                                                Number(
                                                  comission -
                                                    (comission / 100) *
                                                      considerations?.da
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })
                                        : Number(
                                            v.pvp /
                                              (1 -
                                                Number(
                                                  v.cporg -
                                                    (v.cporg / 100) *
                                                      considerations?.da
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                    </Typography>
                                  )}
                                {(base === "pvp" || base === undefined) &&
                                  considerations?.prixer > 0 && (
                                    <Typography
                                      variant="p"
                                      style={{
                                        marginRight: 10,
                                        color: "grey",
                                      }}
                                    >
                                      Precio para Prixer: $
                                      {v.appliedGlobalCporg
                                        ? Number(
                                            v.pvp /
                                              (1 -
                                                Number(
                                                  comission -
                                                    (comission / 100) *
                                                      considerations?.prixer
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })
                                        : Number(
                                            v.pvp /
                                              (1 -
                                                Number(
                                                  v.cporg -
                                                    (v.cporg / 100) *
                                                      considerations?.prixer
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                    </Typography>
                                  )}
                                {(base === "pvm" || base === undefined) && (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    PVM: $
                                    {v.appliedGlobalCporg
                                      ? Number(
                                          v.pvm / (1 - comission / 100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          v.pvm / (1 - v.cporg / 100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                )}
                                {(base === "pvm" || base === undefined) &&
                                  considerations?.artista > 0 && (
                                    <Typography
                                      variant="p"
                                      style={{
                                        marginRight: 10,
                                        color: "grey",
                                      }}
                                    >
                                      Precio para Artista externo: $
                                      {v.appliedGlobalCporg
                                        ? Number(
                                            v.pvm /
                                              (1 -
                                                Number(
                                                  comission -
                                                    (comission / 100) *
                                                      considerations?.artista
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })
                                        : Number(
                                            v.pvm /
                                              (1 -
                                                Number(
                                                  v.cporg -
                                                    (v.cporg / 100) *
                                                      considerations?.artista
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                    </Typography>
                                  )}
                                {(base === "pvm" || base === undefined) &&
                                  considerations?.corporativo > 0 && (
                                    <Typography
                                      variant="p"
                                      style={{
                                        marginRight: 10,
                                        color: "grey",
                                      }}
                                    >
                                      Precio para Corporativo: $
                                      {v.appliedGlobalCporg
                                        ? Number(
                                            v.pvm /
                                              (1 -
                                                Number(
                                                  comission -
                                                    (comission / 100) *
                                                      considerations?.corporativo
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })
                                        : Number(
                                            v.pvm /
                                              (1 -
                                                Number(
                                                  v.cporg -
                                                    (v.cporg / 100) *
                                                      considerations?.corporativo
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                    </Typography>
                                  )}
                                {(base === "pvm" || base === undefined) &&
                                  considerations?.da > 0 && (
                                    <Typography
                                      variant="p"
                                      style={{
                                        marginRight: 10,
                                        color: "grey",
                                      }}
                                    >
                                      Precio para DAs: $
                                      {v.appliedGlobalCporg
                                        ? Number(
                                            v.pvm /
                                              (1 -
                                                Number(
                                                  comission -
                                                    (comission / 100) *
                                                      considerations?.da
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })
                                        : Number(
                                            v.pvm /
                                              (1 -
                                                Number(
                                                  v.cporg -
                                                    (v.cporg / 100) *
                                                      considerations?.da
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                    </Typography>
                                  )}
                                {(base === "pvm" || base === undefined) &&
                                  considerations?.prixer > 0 && (
                                    <Typography
                                      variant="p"
                                      style={{
                                        marginRight: 10,
                                        color: "grey",
                                      }}
                                    >
                                      Precio para Prixer: $
                                      {v.appliedGlobalCporg
                                        ? Number(
                                            v.pvm /
                                              (1 -
                                                Number(
                                                  comission -
                                                    (comission / 100) *
                                                      considerations?.prixer
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })
                                        : Number(
                                            v.pvm /
                                              (1 -
                                                Number(
                                                  v.cporg -
                                                    (v.cporg / 100) *
                                                      considerations?.prixer
                                                ) /
                                                  100)
                                          ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          })}
                                    </Typography>
                                  )}
                              </div>
                              <TextField
                                variant="outlined"
                                size="small"
                                type="Number"
                                style={{
                                  width: "90px",
                                  padding: 0,
                                  marginRight: 10,
                                }}
                                InputProps={{
                                  endAdornment: (
                                    <InputAdornment position="center">
                                      %
                                    </InputAdornment>
                                  ),
                                  style: { padding: 0 },
                                }}
                                inputProps={{
                                  min: 0,
                                }}
                                value={
                                  v.appliedGlobalCporg ? comission : v.cporg
                                }
                                onChange={(e) => {
                                  setAppliedProducts((prev) => {
                                    const prevCopy = [...prev]
                                    const variantCopy = {
                                      ...prevCopy[index].variants[i],
                                    }
                                    variantCopy.appliedGlobalCporg = false
                                    variantCopy.cporg = e?.target?.value || 0
                                    prevCopy[index].variants[i] = variantCopy
                                    return prevCopy
                                  })
                                }}
                              />

                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "end",
                                }}
                              >
                                {finalComission(v)}
                                {reducedComission(v)}
                              </div>
                            </div>
                          </Box>
                        ))
                      ) : (
                        <Box
                          m={1}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Checkbox
                              checked={product.appliedGlobalCporg}
                              inputProps={{
                                "aria-label": "secondary checkbox",
                              }}
                              onChange={() => {
                                setAppliedProducts((prev) => {
                                  const prevCopy = [...prev]
                                  const prodCopy = {
                                    ...prevCopy[index],
                                  }
                                  prodCopy.appliedGlobalCporg =
                                    !prodCopy.appliedGlobalCporg
                                  prodCopy.cporg = comission
                                  prevCopy[index].variants.map((v) => {
                                    ;(v.appliedGlobalCporg = true),
                                      (v.cporg = comission)
                                  })
                                  prevCopy[index] = prodCopy
                                  return prevCopy
                                })
                              }}
                            />
                            <Typography style={{ color: "grey" }}>
                              {product.name}
                            </Typography>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "end",
                              }}
                            >
                              {(base === "pvprixer" || base === undefined) &&
                                (product.pvm !== undefined ? (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    Costo: $
                                    {product.appliedGlobalCporg
                                      ? Number(
                                          (product.pvm - product.pvm / 10) /
                                            (1 - comission / 100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          (product.pvm - product.pvm / 10) /
                                            (1 - product.cporg / 100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                ) : (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    Esta variante no tiene costo, por favor
                                    edita la variante.
                                  </Typography>
                                ))}
                              {(base === "pvprixer" || base === undefined) &&
                                considerations?.artista > 0 &&
                                product.pvm !== undefined && (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    Precio para Artista Externo: $
                                    {product.appliedGlobalCporg
                                      ? Number(
                                          (product.pvm - product.pvm / 10) /
                                            (1 -
                                              Number(
                                                comission -
                                                  (comission / 100) *
                                                    considerations?.artista
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          (product.pvm - product.pvm / 10) /
                                            (1 -
                                              Number(
                                                product.cporg -
                                                  (product.cporg / 100) *
                                                    considerations?.artista
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                )}
                              {(base === "pvprixer" || base === undefined) &&
                                considerations?.corporativo > 0 &&
                                product.pvm !== undefined && (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    Precio para Corporativo: $
                                    {product.appliedGlobalCporg
                                      ? Number(
                                          (product.pvm - product.pvm / 10) /
                                            (1 -
                                              Number(
                                                comission -
                                                  (comission / 100) *
                                                    considerations?.corporativo
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          (product.pvm - product.pvm / 10) /
                                            (1 -
                                              Number(
                                                product.cporg -
                                                  (product.cporg / 100) *
                                                    considerations?.corporativo
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                )}
                              {(base === "pvprixer" || base === undefined) &&
                                considerations?.da > 0 &&
                                product.pvm !== undefined && (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    Precio para DAs: $
                                    {product.appliedGlobalCporg
                                      ? Number(
                                          (product.pvm - product.pvm / 10) /
                                            (1 -
                                              Number(
                                                comission -
                                                  (comission / 100) *
                                                    considerations?.da
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          (product.pvm - product.pvm / 10) /
                                            (1 -
                                              Number(
                                                product.cporg -
                                                  (product.cporg / 100) *
                                                    considerations?.da
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                )}
                              {(base === "pvprixer" || base === undefined) &&
                                considerations?.prixer > 0 &&
                                product.pvm !== undefined && (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    Precio para Prixer: $
                                    {product.appliedGlobalCporg
                                      ? Number(
                                          (product.pvm - product.pvm / 10) /
                                            (1 -
                                              Number(
                                                comission -
                                                  (comission / 100) *
                                                    considerations?.prixer
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          (product.pvm - product.pvm / 10) /
                                            (1 -
                                              Number(
                                                product.cporg -
                                                  (product.cporg / 100) *
                                                    considerations?.prixer
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                )}
                              {(base === "pvm" || base === undefined) && (
                                <Typography
                                  variant="p"
                                  style={{
                                    marginRight: 10,
                                    color: "grey",
                                  }}
                                >
                                  PVM: $
                                  {product.appliedGlobalCporg
                                    ? Number(
                                        product.pvm / (1 - comission / 100)
                                      ).toLocaleString("de-DE", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })
                                    : Number(
                                        product.pvm / (1 - product.cporg / 100)
                                      ).toLocaleString("de-DE", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                </Typography>
                              )}
                              {(base === "pvm" || base === undefined) &&
                                considerations?.artista > 0 && (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    Precio para Artista Externo: $
                                    {product.appliedGlobalCporg
                                      ? Number(
                                          product.pvm /
                                            (1 -
                                              Number(
                                                comission -
                                                  (comission / 100) *
                                                    considerations?.artista
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          product.pvm /
                                            (1 -
                                              Number(
                                                product.cporg -
                                                  (product.cporg / 100) *
                                                    considerations?.artista
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                )}
                              {(base === "pvm" || base === undefined) &&
                                considerations?.corporativo > 0 && (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    Precio para Corporativo: $
                                    {product.appliedGlobalCporg
                                      ? Number(
                                          product.pvm /
                                            (1 -
                                              Number(
                                                comission -
                                                  (comission / 100) *
                                                    considerations?.corporativo
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          product.pvm /
                                            (1 -
                                              Number(
                                                product.cporg -
                                                  (product.cporg / 100) *
                                                    considerations?.corporativo
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                )}
                              {(base === "pvm" || base === undefined) &&
                                considerations?.da > 0 && (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    Precio para DA: $
                                    {product.appliedGlobalCporg
                                      ? Number(
                                          product.pvm /
                                            (1 -
                                              Number(
                                                comission -
                                                  (comission / 100) *
                                                    considerations?.da
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          product.pvm /
                                            (1 -
                                              Number(
                                                product.cporg -
                                                  (product.cporg / 100) *
                                                    considerations?.da
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                )}
                              {(base === "pvm" || base === undefined) &&
                                considerations?.prixer > 0 && (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    Precio para Prixer: $
                                    {product.appliedGlobalCporg
                                      ? Number(
                                          product.pvm /
                                            (1 -
                                              Number(
                                                comission -
                                                  (comission / 100) *
                                                    considerations?.prixer
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          product.pvm /
                                            (1 -
                                              Number(
                                                product.cporg -
                                                  (product.cporg / 100) *
                                                    considerations?.prixer
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                )}
                              {(base === "pvp" || base === undefined) && (
                                <Typography
                                  variant="p"
                                  style={{
                                    marginRight: 10,
                                    color: "grey",
                                  }}
                                >
                                  PVP: $
                                  {product.appliedGlobalCporg
                                    ? Number(
                                        product.pvp / (1 - comission / 100)
                                      ).toLocaleString("de-DE", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })
                                    : Number(
                                        product.pvp / (1 - product.cporg / 100)
                                      ).toLocaleString("de-DE", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                </Typography>
                              )}
                              {(base === "pvp" || base === undefined) &&
                                considerations?.artista > 0 && (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    Precio para Artista Externo: $
                                    {product.appliedGlobalCporg
                                      ? Number(
                                          product.pvp /
                                            (1 -
                                              Number(
                                                comission -
                                                  (comission / 100) *
                                                    considerations?.artista
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          product.pvp /
                                            (1 -
                                              Number(
                                                product.cporg -
                                                  (product.cporg / 100) *
                                                    considerations?.artista
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                )}
                              {(base === "pvp" || base === undefined) &&
                                considerations?.corporativo > 0 && (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    Precio para Corporativo: $
                                    {product.appliedGlobalCporg
                                      ? Number(
                                          product.pvp /
                                            (1 -
                                              Number(
                                                comission -
                                                  (comission / 100) *
                                                    considerations?.corporativo
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          product.pvp /
                                            (1 -
                                              Number(
                                                product.cporg -
                                                  (product.cporg / 100) *
                                                    considerations?.corporativo
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                )}
                              {(base === "pvp" || base === undefined) &&
                                considerations?.da > 0 && (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    Precio para DA: $
                                    {product.appliedGlobalCporg
                                      ? Number(
                                          product.pvp /
                                            (1 -
                                              Number(
                                                comission -
                                                  (comission / 100) *
                                                    considerations?.da
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          product.pvp /
                                            (1 -
                                              Number(
                                                product.cporg -
                                                  (product.cporg / 100) *
                                                    considerations?.da
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                )}
                              {(base === "pvp" || base === undefined) &&
                                considerations?.prixer > 0 && (
                                  <Typography
                                    variant="p"
                                    style={{
                                      marginRight: 10,
                                      color: "grey",
                                    }}
                                  >
                                    Precio para Prixer: $
                                    {product.appliedGlobalCporg
                                      ? Number(
                                          product.pvp /
                                            (1 -
                                              Number(
                                                comission -
                                                  (comission / 100) *
                                                    considerations?.prixer
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })
                                      : Number(
                                          product.pvp /
                                            (1 -
                                              Number(
                                                product.cporg -
                                                  (product.cporg / 100) *
                                                    considerations?.prixer
                                              ) /
                                                100)
                                        ).toLocaleString("de-DE", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        })}
                                  </Typography>
                                )}
                            </div>
                            <TextField
                              variant="outlined"
                              size="small"
                              type="Number"
                              style={{
                                width: "90px",
                                padding: 0,
                                marginRight: 10,
                              }}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="center">
                                    %
                                  </InputAdornment>
                                ),
                                style: { padding: 0 },
                              }}
                              value={
                                product.appliedGlobalCporg
                                  ? comission
                                  : product.cporg
                              }
                              onChange={(e) => {
                                setAppliedProducts((prev) => {
                                  const prevCopy = [...prev]
                                  const productCopy = {
                                    ...prevCopy[index],
                                  }
                                  productCopy.appliedGlobalCporg = false
                                  productCopy.cporg = e.target.value
                                  prevCopy[index] = productCopy
                                  return prevCopy
                                })
                              }}
                            />

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "end",
                              }}
                            >
                              {finalComission(product)}
                              {reducedComission(product)}
                            </div>
                          </div>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </Grid2>
              ))}
          </Grid2>
          <Grid2
            style={{
              display: "flex",
              justifyContent: "end",
              marginTop: 20,
              width: "100%",
            }}
          >
            <Button
              variant="contained"
              color={"primary"}
              onClick={updateComission}
            >
              Guardar comisión
            </Button>
          </Grid2>
        </Grid2>
      </Grid2>
    </div>
  )
}
