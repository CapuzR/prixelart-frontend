import Grid2 from "@mui/material/Grid2"
import Box from "@mui/material/Box"
import Switch from "@mui/material/Switch"
import Typography from "@mui/material/Typography"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import CloseIcon from "@mui/icons-material/Close"
import DehazeIcon from "@mui/icons-material/Dehaze"

import MoreVertIcon from "@mui/icons-material/MoreVert"
import { useTheme, Theme } from "@mui/material/styles"
import useMediaQuery from "@mui/material/useMediaQuery"

import { Prixer } from "@types/prixer.types"
import { Consumer } from "@types/consumer.types"

export default function PrixersGrid({
  tiles,
  selectedPrixer,
  setSelectedPrixer,
  permissions,
  consumers,
  setSelectedConsumer,
  TurnIntoOrg,
  ChangeVisibility,
  setOpenDestroy,
  accounts,
  setType,
  setOpenNewMovement,
  setOpenList,
  setOpenNewBalance,
  setOpenInfo
}) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

    
  return (
    <Grid2
      container
      spacing={2}
      style={{
        padding: isMobile ? "0px" : "18px",
        display: "flex",
        textAlign: "start",
      }}
    >
      {tiles?.length > 0 ? (
        tiles.map((tile: Prixer) =>
          tile === selectedPrixer ? (
            <Grid2 size={{ xs: 6, sm: 6, md: 3 }}>
              <Card
                key={tile?.prixerId}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "end",
                    marginBottom: "-25px",
                  }}
                >
                  <IconButton
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={(e) => {
                      setSelectedPrixer(undefined)
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>

                <CardContent
                  sx={{
                    marginTop: -10,
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Typography gutterBottom variant="h5" component="h2">
                    {tile?.firstName} {tile?.lastName}
                  </Typography>
                  {permissions?.readConsumers && (
                    <Button
                      style={{
                        backgroundColor: "#e5e7e9",
                        textTransform: "none",
                      }}
                      onClick={() => {
                        setOpenInfo(true)
                        consumers.map((cons: Consumer) => {
                          if (cons.prixerId === tile.prixerId) {
                            setSelectedConsumer(cons)
                          }
                        })
                      }}
                    >
                      Ver información
                    </Button>
                  )}
                  {permissions?.setPrixerBalance && (
                    <Box
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        color="secondary"
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        Cambiar a Organización
                      </Typography>
                      <Switch
                        color="primary"
                        onChange={(event) => TurnIntoOrg(event, tile?.username)}
                        name="checkedA"
                        inputProps={{
                          "aria-label": "secondary checkbox",
                        }}
                      />
                    </Box>
                  )}
                  {permissions?.prixerBan && (
                    <Box
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography
                          color="secondary"
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          Visible
                        </Typography>
                        <Switch
                          checked={tile?.status}
                          color="primary"
                          onChange={(event) =>
                            // handleChange(event, tile?.state) ||
                            ChangeVisibility(event, tile)
                          }
                          name="checkedA"
                          value={tile?.status}
                          inputProps={{
                            "aria-label": "secondary checkbox",
                          }}
                        />
                      </Box>
                      <Box
                        style={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          onClick={(e) => {
                            setSelectedPrixer(tile)
                            setOpenDestroy(true)
                          }}
                          style={{
                            backgroundColor: "rgb(229, 231, 233)",
                            textTransform: "none",
                          }}
                        >
                          Eliminar Prixer
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid2>
          ) : (
            <Grid2 size={{ xs: 6, sm: 6, md: 3 }}>
              <Card
                key={tile?._id}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "end",
                    marginBottom: "-50px",
                  }}
                >
                  <IconButton
                    aria-controls="simple-menu"
                    aria-haspopup="true"
                    onClick={(e) => {
                      setSelectedPrixer(tile)
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </div>
                <CardMedia
                  component="img"
                  alt={tile?.username}
                  image={tile?.avatar || "/PrixLogo.png"}
                  sx={{
                    borderRadius: "50%",
                    margin: "auto",
                    maxWidth: 250,
                    maxHeight: 250
                  }}
                  style={{
                    opacity: tile?.status === true ? "100%" : "50%",
                  }}
                />
                <CardContent
                  sx={{
                    // marginTop: -10,
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Typography gutterBottom variant="h5">
                    {tile?.firstName} {tile?.lastName}
                  </Typography>
                  <Typography gutterBottom style={{ fontSize: 16 }}>
                    {tile?.username} -
                    {tile?.specialty ||
                      tile?.specialtyArt?.map(
                        (specialty, index) =>
                          specialty !== "" &&
                          (tile?.specialtyArt?.length === index + 1
                            ? specialty
                            : `${specialty}, `)
                      )}
                  </Typography>
                </CardContent>
                {tile?.account !== undefined &&
                permissions?.setPrixerBalance ? (
                  <div
                    style={{
                      borderStyle: "solid",
                      borderWidth: "thin",
                      borderRadius: "10px",
                      borderColor: "#e5e7e9",
                      margin: "5px",
                      paddingBottom: "5px",
                    }}
                  >
                    <Typography variant="h6" align="center">
                      Balance $
                      {accounts &&
                        accounts
                          ?.find((acc) => acc._id === tile?.account)
                          ?.balance.toLocaleString("de-DE", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                    </Typography>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                      }}
                    >
                      <Button
                        onClick={(e) => {
                          setSelectedPrixer(tile)
                          setType("Depósito")
                          setOpenNewMovement(true)
                        }}
                        style={{
                          width: "40%",
                          backgroundColor: "#e5e7e9",
                          textTransform: "none",
                        }}
                      >
                        Depósito
                      </Button>
                      <Button
                        onClick={(e) => {
                          setSelectedPrixer(tile)
                          setType("Retiro")
                          setOpenNewMovement(true)
                        }}
                        style={{
                          width: "40%",
                          backgroundColor: "#e5e7e9",
                          textTransform: "none",
                        }}
                      >
                        Retiro
                      </Button>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        marginTop: 5,
                      }}
                    >
                      <Button
                        style={{ textTransform: "none" }}
                        onClick={() => {
                          setSelectedPrixer(tile)
                          setOpenList(true)
                        }}
                      >
                        <DehazeIcon />
                        Detalles
                      </Button>
                    </div>
                  </div>
                ) : (
                  permissions?.setPrixerBalance && (
                    <Button
                      variant="contained"
                      color="primary"
                      style={{
                        width: 160,
                        alignSelf: "center",
                        fontWeight: "bold",
                      }}
                      onClick={(e) => {
                        setSelectedPrixer(tile)
                        setOpenNewBalance(true)
                      }}
                    >
                      Crear Cartera
                    </Button>
                  )
                )}
              </Card>
            </Grid2>
          )
        )
      ) : (
        <Typography
          variant="h6"
          color="secondary"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          No se han cargado los Prixers aún.
        </Typography>
      )}
    </Grid2>
  )
}
