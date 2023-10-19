import React from "react";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Divider from "@mui/material/Divider";
import { useNavigate } from "react-router-dom";
import PaletteIcon from "@mui/icons-material/Palette";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import WebAssetIcon from "@mui/icons-material/WebAsset";
import { InsertEmoticon } from "@mui/icons-material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
export default function MainListItems(props) {
  const navigate = useNavigate();

  const handleClick = (value) => {
    navigate({ pathname: "/admin/" + value + "/read" });
  };

  return (
    <>
      <div>
        <ListItem
          button
          selected={props.active === "dashboard"}
          style={{ color: "gray" }}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText
            primary="Tablero General"
            // onClick={(e) => {
            //   handleClick("dashboard");
            // }}
          />
        </ListItem>
        <ListItem button selected={props.active === "product"}>
          <ListItemIcon>
            <LocalMallIcon />
          </ListItemIcon>
          <ListItemText
            primary="Productos"
            onClick={(e) => {
              handleClick("product");
            }}
          />
        </ListItem>
        {props.permissions?.readConsumers && (
          <ListItem button selected={props.active === "consumer"}>
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText
              primary="Clientes"
              onClick={(e) => {
                handleClick("consumer");
              }}
            />
          </ListItem>
        )}
        {props.permissions?.readMovements && (
          <ListItem button selected={props.active === "movements"}>
            <ListItemIcon>
              <AccountBalanceIcon />
            </ListItemIcon>
            <ListItemText
              primary="Movimientos"
              onClick={(e) => {
                handleClick("movements");
              }}
              selected={props.active === "movements"}
            />
          </ListItem>
        )}
        <ListItem button selected={props.active === "payment-method"}>
          <ListItemIcon>
            <PaymentIcon />
          </ListItemIcon>
          <ListItemText
            primary="Métodos de pago"
            onClick={(e) => {
              handleClick("payment-method");
            }}
            selected={props.active === "payment-method"}
          />
        </ListItem>
        <ListItem button selected={props.active === "shipping-method"}>
          <ListItemIcon>
            <LocalShippingIcon />
          </ListItemIcon>
          <ListItemText
            primary="Métodos de envío"
            onClick={(e) => {
              handleClick("shipping-method");
            }}
            selected={props.active === "shipping-method"}
          />
        </ListItem>
        <ListItem button selected={props.active === "order"}>
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText
            primary="Pedidos"
            onClick={(e) => {
              handleClick("order");
            }}
          />
        </ListItem>
        <ListItem
          button
          // style={{ color: "gray" }}
        >
          <ListItemIcon>
            <PaletteIcon />
          </ListItemIcon>
          <ListItemText
            primary="Prixers"
            onClick={(e) => {
              handleClick("prixer");
            }}
          />
        </ListItem>

        <ListItem button selected={props.active === "testimonials"}>
          <ListItemIcon>
            <InsertEmoticon />
          </ListItemIcon>
          <ListItemText
            primary="Testimonios"
            onClick={(e) => {
              handleClick("testimonials");
            }}
          />
        </ListItem>
      </div>
      <Divider />
      <div>
        {props.permissions?.modifyAdmins && (
          <ListItem button selected={props.active === "user"}>
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText
              primary="Usuarios"
              onClick={(e) => {
                handleClick("user");
              }}
            />
          </ListItem>
        )}
        {(props.permissions?.modifyBanners ||
          props.permissions?.modifyTermsAndCo) && (
          <ListItem button selected={props.active === "preferences"}>
            <ListItemIcon>
              <WebAssetIcon />
            </ListItemIcon>
            <ListItemText
              primary="Preferencias"
              onClick={(e) => {
                handleClick("preferences");
              }}
            />
          </ListItem>
        )}
      </div>
    </>
  );
}
