import React from "react";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import DashboardIcon from "@material-ui/icons/Dashboard";
import PeopleIcon from "@material-ui/icons/People";
import BarChartIcon from "@material-ui/icons/BarChart";
import AssignmentIcon from "@material-ui/icons/Assignment";
import Divider from "@material-ui/core/Divider";
import { useHistory } from "react-router-dom";
import PaletteIcon from "@material-ui/icons/Palette";
import LoyaltyIcon from "@material-ui/icons/Loyalty";
import LocalMallIcon from "@material-ui/icons/LocalMall";
import PaymentIcon from "@material-ui/icons/Payment";
import ReceiptIcon from "@material-ui/icons/Receipt";
import WebAssetIcon from "@material-ui/icons/WebAsset";
import Preferences from "./preferences/Preferences";
import Testimonials from "../TestimonialsCrud/Testimonials";
import { InsertEmoticon } from "@material-ui/icons";

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
          <ListItemText primary="Tablero General" />
          {/* onClick={(e)=>{handleClick('dashboard')}} /> */}
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
        <ListItem
          button
          selected={props.active === "consumer"}
          style={{ color: "gray" }}
        >
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Consumidores" />
          {/* <ListItemText primary="Consumidores" onClick={(e)=>{handleClick('consumer')}}  /> */}
        </ListItem>
        <ListItem
          button
          selected={props.active === "payment-method"}
          style={{ color: "gray" }}
        >
          <ListItemIcon>
            <PaymentIcon />
          </ListItemIcon>
          <ListItemText primary="Métodos de pago" />
          {/* <ListItemText primary="Métodos de pago" onClick={(e)=>{handleClick('payment-method')}}  /> */}
        </ListItem>
        <ListItem
          button
          selected={props.active === "order"}
          style={{ color: "gray" }}
        >
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText primary="Pedidos" />
          {/* <ListItemText primary="Pedidos" onClick={(e)=>{handleClick('order')}}  /> */}
        </ListItem>
        <ListItem
          button
          selected={props.active === "prixer"}
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
        <ListItem
          button
          selected={props.active === "parameters"}
          style={{ color: "gray" }}
        >
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Parámetros" />
          {/* onClick={(e)=>{handleClick('parameters')}}  /> */}
        </ListItem>
        <ListItem
          button
          selected={props.active === "testimonials"}
          // style={{ color: "gray" }}
        >
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
        <ListSubheader inset>Configuración</ListSubheader>
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
        <ListItem
          button
          selected={props.active === "role"}
          style={{ color: "gray" }}
        >
          <ListItemIcon>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="Roles" />
          {/* onClick={(e)=>{handleClick('role')}}  /> */}
        </ListItem>
      </div>
    </>
  );
}
