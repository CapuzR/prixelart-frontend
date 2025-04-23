// import { React, useState } from "react"
// import axios from "axios"

// import { makeStyles } from "@mui/styles"
// import Grid from "@mui/material/Grid"
// import Typography from "@mui/material/Typography"
// import IconButton from "@mui/material/IconButton"
// import CloseIcon from "@mui/icons-material/Close"
// import Button from "@mui/material/Button"
// import { useTheme } from "@mui/material"
// import { deletePrixer } from "./api"
// import { useSnackBar } from "@context/GlobalContext"

// const useStyles = makeStyles((theme) => ({
//   paper1: {},
// }))

// interface PrixerProps {
//   selectedPrixer: Prixer
//   selectedConsumer: Consumer
//   handleClose: () => void
// }

// export default function removePrixer({
//   handleClose,
//   selectedPrixer,
//   routine,
//   org,
// }: PrixerProps) {
//   const classes = useStyles()
//   const theme = useTheme()
//   const { showSnackBar } = useSnackBar()

//   const exPrixer = async () => {
//     const data = {
//       id: selectedPrixer.prixerId || selectedPrixer.orgId,
//       username: selectedPrixer.username,
//     }
//     try {
//       const response = await deletePrixer(data)
//       showSnackBar(response.data.message)
//       handleClose()
//       routine()
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   return (
//     <Grid
//       container
//       sx={{
//         position: "absolute",
//         width: "80%",
//         maxHeight: "90%",
//         overflowY: "auto",
//         backgroundColor: "white",
//         boxShadow: theme.shadows[2],
//         padding: "16px 32px 24px",
//         top: "50%",
//         left: "50%",
//         transform: "translate(-50%, -50%)",
//         textAlign: "justify",
//         minWidth: 320,
//         borderRadius: 10,
//         display: "flex",
//         flexDirection: "row",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           width: "100%",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//       >
//         <Typography
//           variant="h5"
//           color="secondary"
//           style={{ textAlign: "center", width: "100%" }}
//         >
//           {` ¿Seguro de eliminar este ${org ? "Organización" : "Prixer"}?`}
//         </Typography>
//         <IconButton onClick={handleClose}>
//           <CloseIcon />
//         </IconButton>
//       </div>

//       <Grid
//         container
//         style={{
//           display: "flex",
//           width: "100%",
//           flexDirection: "column",
//         }}
//       >
//         <Typography
//           variant="subtitle1"
//           style={{ padding: "16px 0", textAlign: "center" }}
//         >
//           Esta acción eliminará todo lo relacionado al perfil: <br />
//           {`${org ? "Organización" : "Prixer"}, Usuario, Artes, Servicio, Biografía y/o estadísticas`}
//           <strong>¡Irrecuperablemente!</strong>
//         </Typography>
//         <Grid
//           style={{
//             display: "flex",
//             justifyContent: "center",
//             gap: "4rem",
//             padding: "16px 0px 8px 0px",
//           }}
//         >
//           <Button
//             variant="contained"
//             color="primary"
//             style={{
//               width: 160,
//               alignSelf: "center",
//               fontWeight: "bold",
//             }}
//             onClick={(e) => {
//               exPrixer()
//             }}
//           >
//             Eliminar
//           </Button>
//           <Button
//             variant="contained"
//             // color="primary"
//             style={{
//               width: 160,
//               alignSelf: "center",
//               fontWeight: "bold",
//             }}
//             onClick={handleClose}
//           >
//             Cancelar
//           </Button>
//         </Grid>
//       </Grid>
//     </Grid>
//   )
// }
