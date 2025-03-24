import { useState, useEffect } from "react"
import axios from "axios"
import Paper from "@mui/material/Paper"
import Grid2 from "@mui/material/Grid2"
import Button from "@mui/material/Button"
import { makeStyles } from "tss-react/mui"
import { Theme } from "@mui/material/styles"
import { Typography, Checkbox } from "@mui/material"
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryLabel,
  VictoryTheme,
} from "victory"
import { useSnackBar, useLoading, getPermissions } from "@context/GlobalContext"
// Migrar gráficos de Victory a Mui X-charts
import { Product } from "../../../../../types/product.types"

const useStyles = makeStyles()((theme: Theme) => {
  return {
    root: {
      "& .MuiTextField-root": {
        margin: theme.spacing(1),
        width: "100%",
        height: "100%",
      },
    },
    paper: {
      padding: theme.spacing(2),
      margin: "auto",
      width: "100%",
    },
  }
})

export default function BestSellers() {
  const {classes} = useStyles()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const permissions = getPermissions()

  const [products, setProducts] = useState<Product[]>()
  const [bestSellers, setBestSellers] = useState<Product[]>()
  const [mostSellers, setMostSellers] = useState<Product[]>()

  const addMostSellerToBestSeller = (selectedMostSeller: string) => {
    const prodv1 = products && products.find((prod) => prod.name === selectedMostSeller)
    if (prodv1 && bestSellers?.length === 0 || prodv1 && bestSellers === undefined) {
      setBestSellers([prodv1])
    } else if (bestSellers?.some((p) => p.name === selectedMostSeller)) {
      showSnackBar("Este producto ya está incluido en el banner.")
    } else if (bestSellers && bestSellers.length === 9) {
      showSnackBar(
        "Has alcanzado el máximo de Productos a mostrar (9 productos)."
      )
    } else if (bestSellers !== undefined && prodv1 !== undefined) {
      setBestSellers([...bestSellers, prodv1])
    }
  }

  const getProducts = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/product/read-allv1"
    await axios
      .post(base_url)
      .then((response) => {
        setProducts(response.data.products)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const getBestSellers = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/getBestSellers"
    await axios
      .get(base_url)
      .then((response) => {
        setBestSellers(response.data.products)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const getMostSellers = async () => {
    const base_url = import.meta.env.VITE_BACKEND_URL + "/product/bestSellers"
    await axios
      .get(base_url)
      .then((response) => {
        setMostSellers(response.data.ref)
      })
      .catch((error) => {
        console.log(error)
      })
  }

  useEffect(() => {
    setLoading(true)
    getProducts()
    getBestSellers()
    getMostSellers()
  }, [])

  const updateBestSellers = async () => {
    let data:string[] = []
    bestSellers && bestSellers.map((prod) => {
      data.push(prod._id)
    })
    const base_url = import.meta.env.VITE_BACKEND_URL + "/updateBestSellers"
    await axios
      .put(base_url, {
        data: data,
      })
      .then((response) => {
        showSnackBar(response.data.message)
      })
  }

  return (
    <div
      className={classes.root}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {mostSellers && (
        <div
          style={{
            width: "90%",
            height: 350,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid gainsboro",
            borderRadius: "10px",
            marginBottom: 10,
            paddingBottom: -10,
            alignSelf: "center",
          }}
        >
          <Typography variant="h6" style={{ color: "#404e5c", marginTop: 30 }}>
            Productos más vendidos en el último año
          </Typography>
          <VictoryChart
            theme={VictoryTheme.material}
            padding={{ top: 20, bottom: 60, right: -100, left: -100 }}
            horizontal
          >
            <VictoryAxis />

            <VictoryAxis dependentAxis />
            <VictoryBar
              data={mostSellers}
              x="name"
              y="quantity"
              style={{
                data: { fill: "#d33f49", width: 25 },
              }}
              alignment="start"
              animate={{
                duration: 2000,
                onLoad: { duration: 1000 },
              }}
              labels={({ datum }) => datum.quantity}
              labelComponent={
                <VictoryLabel
                  dx={-24}
                  dy={-10}
                  style={[{ fill: "white", fontSize: 14 }]}
                />
              }
              events={[
                {
                  target: "data",
                  eventHandlers: {
                    onClick: () => {
                      return [
                        {
                          target: "data",
                          mutation: ({ datum }) => {
                            addMostSellerToBestSeller(datum.name)
                          },
                        },
                      ]
                    },
                  },
                },
              ]}
            />
          </VictoryChart>
        </div>
      )}
      <Paper
        className={classes.paper}
        style={{
          height: 160,
          width: "90%",
          backgroundColor: "gainsboro",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
        elevation={3}
      >
        <Typography variant="h6" style={{ color: "#404e5c" }}>
          Banner de la pantalla principal
        </Typography>
        <div style={{ display: "flex", flexDirection: "row" }}>
          {bestSellers ? (
            bestSellers.map((prod, i) => (
              <div>
                <div
                  key={i}
                  style={{
                    backgroundImage:
                      prod.sources.images.length > 0
                        ? "url(" + prod.sources.images[0]?.url + ")"
                        : "url(" + prod.thumbUrl + ")",
                    width: 100,
                    height: 100,
                    backgroundSize: "cover",
                    borderRadius: 10,
                    marginTop: 5,
                    marginRight: 10,
                  }}
                />
                <div
                  style={{
                    color: "#404e5c",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {prod.name}
                </div>
              </div>
            ))
          ) : (
            <Typography
              variant="h4"
              style={{
                color: "#404e5c",
                textAlign: "center",
              }}
              fontWeight="bold"
            >
              No tienes productos seleccionados aún
            </Typography>
          )}
        </div>
      </Paper>
      {permissions?.modifyBestSellers && (
        <>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              size="small"
              style={{ marginTop: 20 }}
              onClick={updateBestSellers}
            >
              Actualizar
            </Button>
          </div>
          <Grid2 container style={{ marginTop: 20 }}>
            {products &&
              bestSellers &&
              products.map((product) => (
                <Grid2 size={{ xs: 3 }}>
                  <Checkbox
                    checked={bestSellers?.some((p) => p.name === product.name)}
                    color="primary"
                    inputProps={{ "aria-label": "secondary checkbox" }}
                    onChange={() => {
                      if (bestSellers.length === 0) {
                        setBestSellers([product])
                      } else if (
                        bestSellers.some((p) => p.name === product.name)
                      ) {
                        setBestSellers(
                          bestSellers.filter(
                            (item) => item.name !== product.name
                          )
                        )
                      } else if (bestSellers.length === 9) {
                        showSnackBar(
                          "Has alcanzado el máximo de Productos a mostrar (9 productos)."
                        )
                      } else {
                        setBestSellers([...bestSellers, product])
                      }
                    }}
                  />
                  {product.name}
                </Grid2>
              ))}
          </Grid2>
        </>
      )}
    </div>
  )
}
