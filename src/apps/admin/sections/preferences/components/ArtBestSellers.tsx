import { useState, useEffect } from "react"
import axios from "axios"
import { makeStyles } from "tss-react/mui"
import { Theme } from "@mui/material/styles"
import Paper from "@mui/material/Paper"
import Grid2 from "@mui/material/Grid2"
import Button from "@mui/material/Button"
import { Typography } from "@mui/material"
import {
  VictoryChart,
  VictoryBar,
  VictoryAxis,
  VictoryLabel,
  VictoryTheme,
} from "victory"
import ArtsGrid from "@apps/consumer/art/components/ArtsGrid/ArtsGrid"
import { useSnackBar, useLoading, getPermissions } from "@context/GlobalContext"
// Migrar gráficos de Victory a Mui X-charts
import { Art } from "../../../../../types/art.types"
import { getArtBestSellers, getArtBestSellers2, getArts } from "../api"

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

export default function ArtBestSellers() {
  const { classes } = useStyles()
  const { showSnackBar } = useSnackBar()
  const { setLoading } = useLoading()
  const permissions = getPermissions()

  const [arts, setArts] = useState<Art[]>([])
  const [bestSellers, setBestSellers] = useState<Art[]>([])
  const [mostSellers, setMostSellers] = useState<Art[]>([])

  const addMostSellerToBestSeller = (selectedMostSeller: string) => {
    const artv1 =
      arts && arts.find((art: Art) => art.title === selectedMostSeller)
    if (
      (artv1 !== undefined && bestSellers?.length === 0) ||
      (artv1 !== undefined && bestSellers === undefined)
    ) {
      setBestSellers([artv1])
    } else if (bestSellers?.some((art) => art.title === selectedMostSeller)) {
      const withoutArt = bestSellers.filter(
        (art) => art.title !== selectedMostSeller
      )
      setBestSellers(withoutArt)
      showSnackBar("Arte eliminado del banner.")
    } else if (bestSellers && bestSellers.length === 9) {
      showSnackBar("Has alcanzado el máximo de Artes a mostrar (9 artes).")
    } else if (artv1) {
      setBestSellers([...bestSellers, artv1])
    }
  }

  const getAllArts = async () => {
    try {
      const arts = await getArts()
      setArts(arts)
    } catch (error) {
      console.log(error)
    }
  }

  const getMostSellers = async () => {
    try {
      const arts = await getArtBestSellers2()
      setMostSellers(arts)
    } catch (error) {
      console.log(error)
    }
  }

  const getBestSellers = async () => {
    try {
      const arts = await getArtBestSellers()
      setBestSellers(arts.data.arts)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    setLoading(true)
    getAllArts()
    getMostSellers()
    getBestSellers()
  }, [])

  const updateBestSellers = async () => {
    if (permissions.modifyArtBestSellers) {
      let data: string[] = []
      bestSellers.map((prod: Art) => {
        data.push(prod._id)
      })
      const base_url =
        import.meta.env.VITE_BACKEND_URL + "/updateArtBestSellers"
      await axios
        .put(base_url, {
          data: data,
        })
        .then((response) => {
          showSnackBar(response.data.message)
        })
    } else {
      showSnackBar("No tienes permiso para realizar acciones en esta área.")
    }
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
            Artes más vendidos en el último año
          </Typography>
          <VictoryChart
            theme={VictoryTheme.material}
            padding={{ top: 20, bottom: 60, right: -100, left: -60 }}
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
          {bestSellers !== undefined && bestSellers.length > 0 ? (
            bestSellers.map((art, i) => (
              <div>
                <div
                  key={i}
                  style={{
                    backgroundImage:
                      `url(${art.largeThumbUrl.replace(" ", "_")})` ||
                      `url(${art?.thumbUrl?.replace(" ", "_")})`,
                    width: 100,
                    height: 100,
                    backgroundSize: "cover",
                    borderRadius: 10,
                    marginTop: 5,
                    marginRight: 10,
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    addMostSellerToBestSeller(art.title)
                  }}
                />
                <div
                  style={{
                    color: "#404e5c",
                    display: "flex",
                    justifyContent: "center",
                    fontSize: 10,
                  }}
                >
                  {art.title.substring(0, 17)}
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
              No tienes artes seleccionados aún
            </Typography>
          )}
        </div>
      </Paper>
      <Grid2 style={{ marginTop: 20 }}>
        <ArtsGrid />
      </Grid2>

      {permissions.modifyBestSellers && (
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
        </>
      )}
    </div>
  )
}
