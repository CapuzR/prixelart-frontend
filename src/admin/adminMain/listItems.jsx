import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DashboardIcon from "@material-ui/icons/Dashboard";
import PeopleIcon from "@material-ui/icons/People";
import AssignmentIcon from "@material-ui/icons/Assignment";
import Divider from "@material-ui/core/Divider";
import { useHistory } from "react-router-dom";
import PaletteIcon from "@material-ui/icons/Palette";
import LocalMallIcon from "@material-ui/icons/LocalMall";
import PaymentIcon from "@material-ui/icons/Payment";
import ReceiptIcon from "@material-ui/icons/Receipt";
import WebAssetIcon from "@material-ui/icons/WebAsset";
import { InsertEmoticon } from "@material-ui/icons";
import LocalShippingIcon from "@material-ui/icons/LocalShipping";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
export default function MainListItems(props) {
  const history = useHistory();

  const handleClick = (value) => {
    history.push({ pathname: "/admin/" + value + "/read" });
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
