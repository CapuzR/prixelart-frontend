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

import { Account } from "../../../../../types/account.types"
import { Consumer } from "../../../../../types/consumer.types"
import { Permissions } from "../../../../../types/permissions.types"
import { Organization } from "../../../../../types/organization.types"

interface GridProps {
  orgs: Organization[]
  selectedPrixer: Organization
  setSelectedPrixer: (org: Organization | undefined) => void
  permissions: Permissions
  consumers: Consumer[]
  setSelectedConsumer: (consumer: Consumer) => void
  TurnIntoPrixer: (e: React.ChangeEvent<HTMLInputElement>, prixer: string) => void
  ChangeVisibility: (
    e: React.ChangeEvent<HTMLInputElement>,
    prixer: Organization
  ) => void
  accounts: Account[]
  setType: (type: string) => void
  setOpenNewMovement: (x: boolean) => void
  setOpenList: (x: boolean) => void
  setOpenNewBalance: (x: boolean) => void
  setOpenInfo: (x: boolean) => void
  setOpenComission: (x: boolean) => void
  org: Organization[]
}

export default function OrgsGrid({
  orgs,
  selectedPrixer,
  setSelectedPrixer,
  permissions,
  consumers,
  setSelectedConsumer,
  ChangeVisibility,
  accounts,
  setType,
  setOpenNewMovement,
  setOpenList,
  setOpenNewBalance,
  setOpenInfo,
  TurnIntoPrixer,
  setOpenComission,
}: GridProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const formatBalance = (accounts: Account[], org: Organization) => {
    const balance = accounts?.find((acc) => acc._id === org?.account)?.balance

    if (balance) {
      const numericBalance = Number(balance)
      const formattedBalance =
        numericBalance !== undefined && numericBalance !== null
          ? numericBalance?.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : "0,00"

      return formattedBalance
    }
  }

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
      {orgs && orgs.length > 0 ? (
        orgs.map((tile: Organization) =>
          tile === selectedPrixer ? (
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
                        consumers?.map((cons) => {
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
                        justifyContent: "end",
                      }}
                    >
                      <Typography
                        color="secondary"
                        style={{ display: "flex", alignItems: "center" }}
                      >
                        Cambiar a Prixer
                      </Typography>
                      <Switch
                        color="primary"
                        onChange={(event) =>
                          TurnIntoPrixer(event, tile?.username)
                        }
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
                        justifyContent: "end",
                      }}
                    >
                      <Typography
                        color="secondary"
                        style={{ display: "flex", alignItems: "center" }}
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
                  )}
                  <Button
                    style={{
                      backgroundColor: "#e5e7e9",
                      textTransform: "none",
                    }}
                    onClick={() => {
                      setOpenComission(true)
                    }}
                  >
                    Definir comisión
                  </Button>
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
                />
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
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="h6"
                    style={{ fontSize: 16 }}
                  >
                    {tile?.username} -
                    {tile?.specialty ||
                      tile?.specialtyArt?.map(
                        (specialty: string, index: number) =>
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
                      {formatBalance(accounts, tile)}
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
                        textTransform: "lowercase",
                        marginTop: 5,
                      }}
                    >
                      <Button
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
            width: "100%",
          }}
        >
          No tenemos asociaciones registradas por ahora.
        </Typography>
      )}
    </Grid2>
  )
}
