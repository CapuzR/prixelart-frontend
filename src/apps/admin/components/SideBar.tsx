import React from "react"

import { useNavigate } from "react-router-dom"

import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import AssignmentIcon from "@mui/icons-material/Assignment"
import DashboardIcon from "@mui/icons-material/Dashboard"
import InsertEmoticon from "@mui/icons-material/InsertEmoticon"
import LocalMallIcon from "@mui/icons-material/LocalMall"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import PaletteIcon from "@mui/icons-material/Palette"
import PaymentIcon from "@mui/icons-material/Payment"
import PeopleIcon from "@mui/icons-material/People"
import ReceiptIcon from "@mui/icons-material/Receipt"
import WebAssetIcon from "@mui/icons-material/WebAsset"

import Divider from "@mui/material/Divider"
import ListItem from "@mui/material/ListItem"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import ListItemButton from "@mui/material/ListItemButton"
import { getPermissions } from "@context/GlobalContext"

export default function SideBar() {
  const navigate = useNavigate()
  const permissions = getPermissions()

  const handleClick = (value: string) => {
    navigate({ pathname: "/admin/" + value + "/read" })
  }

  return (
    <>
      <div>
        <ListItem sx={{ color: "gray" }}>
          <ListItemButton>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText
              primary="Tablero General"
              // onClick={(e) => {
              //   handleClick("dashboard");
              // }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem
          onClick={(e) => {
            handleClick("product")
          }}
        >
          <ListItemButton>
            <ListItemIcon>
              <LocalMallIcon />
            </ListItemIcon>
            <ListItemText primary="Productos" />
          </ListItemButton>
        </ListItem>
        {permissions?.readConsumers && (
          <ListItem
            onClick={(e) => {
              handleClick("consumer")
            }}
          >
            <ListItemButton>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Clientes" />{" "}
            </ListItemButton>
          </ListItem>
        )}
        {permissions?.readMovements && (
          <ListItem
            onClick={(e) => {
              handleClick("movements")
            }}
          >
            <ListItemButton>
              <ListItemIcon>
                <AccountBalanceIcon />
              </ListItemIcon>
              <ListItemText primary="Movimientos" />{" "}
            </ListItemButton>
          </ListItem>
        )}
        <ListItem
          onClick={(e) => {
            handleClick("payment-method")
          }}
        >
          <ListItemButton>
            <ListItemIcon>
              <PaymentIcon />
            </ListItemIcon>
            <ListItemText primary="Métodos de pago" />{" "}
          </ListItemButton>
        </ListItem>

        <ListItem
          onClick={(e) => {
            handleClick("shipping-method")
          }}
        >
          <ListItemButton>
            <ListItemIcon>
              <LocalShippingIcon />
            </ListItemIcon>
            <ListItemText primary="Métodos de envío" />{" "}
          </ListItemButton>
        </ListItem>
        <ListItem
          onClick={(e) => {
            handleClick("order")
          }}
        >
          <ListItemButton>
            <ListItemIcon>
              <ReceiptIcon />
            </ListItemIcon>
            <ListItemText primary="Pedidos" />{" "}
          </ListItemButton>
        </ListItem>
        <ListItem
          // style={{ color: "gray" }}
          onClick={(e) => {
            handleClick("prixer")
          }}
        >
          <ListItemButton>
            <ListItemIcon>
              <PaletteIcon />
            </ListItemIcon>
            <ListItemText primary="Prixers" />{" "}
          </ListItemButton>
        </ListItem>

        <ListItem
          onClick={(e) => {
            handleClick("testimonials")
          }}
        >
          <ListItemButton>
            <ListItemIcon>
              <InsertEmoticon />
            </ListItemIcon>
            <ListItemText primary="Testimonios" />
          </ListItemButton>
        </ListItem>
      </div>
      <Divider />
      <div>
        {permissions?.modifyAdmins && (
          <ListItem
            onClick={(e) => {
              handleClick("admins")
            }}
          >
            <ListItemButton>
              <ListItemIcon>
                <AssignmentIcon />
              </ListItemIcon>
              <ListItemText primary="Administradores" />
            </ListItemButton>
          </ListItem>
        )}
        {(permissions?.modifyBanners || permissions?.modifyTermsAndCo) && (
          <ListItem
            onClick={(e) => {
              handleClick("preferences")
            }}
          >
            <ListItemButton>
              <ListItemIcon>
                <WebAssetIcon />
              </ListItemIcon>
              <ListItemText primary="Preferencias" />{" "}
            </ListItemButton>
          </ListItem>
        )}
      </div>
    </>
  )
}
