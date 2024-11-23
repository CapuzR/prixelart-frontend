import React from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Divider from '@mui/material/Divider';
import { useHistory } from 'react-router-dom';
import PaletteIcon from '@mui/icons-material/Palette';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WebAssetIcon from '@mui/icons-material/WebAsset';
import { InsertEmoticon } from '@mui/icons-material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
export default function MainListItems(props) {
  const history = useHistory();

  const handleClick = (value) => {
    history.push({ pathname: '/admin/' + value + '/read' });
  };

  return (
    <>
      <div>
        <ListItem button selected={props.active === 'dashboard'} style={{ color: 'gray' }}>
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
        <ListItem
          button
          selected={props.active === 'product'}
          onClick={(e) => {
            handleClick('product');
          }}
        >
          <ListItemIcon>
            <LocalMallIcon />
          </ListItemIcon>
          <ListItemText primary="Productos" />
        </ListItem>
        {props.permissions?.readConsumers && (
          <ListItem
            button
            selected={props.active === 'consumer'}
            onClick={(e) => {
              handleClick('consumer');
            }}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Clientes" />
          </ListItem>
        )}
        {props.permissions?.readMovements && (
          <ListItem
            button
            selected={props.active === 'movements'}
            onClick={(e) => {
              handleClick('movements');
            }}
          >
            <ListItemIcon>
              <AccountBalanceIcon />
            </ListItemIcon>
            <ListItemText primary="Movimientos" selected={props.active === 'movements'} />
          </ListItem>
        )}
        <ListItem
          button
          selected={props.active === 'payment-method'}
          onClick={(e) => {
            handleClick('payment-method');
          }}
        >
          <ListItemIcon>
            <PaymentIcon />
          </ListItemIcon>
          <ListItemText primary="Métodos de pago" selected={props.active === 'payment-method'} />
        </ListItem>
        <ListItem
          button
          selected={props.active === 'shipping-method'}
          onClick={(e) => {
            handleClick('shipping-method');
          }}
        >
          <ListItemIcon>
            <LocalShippingIcon />
          </ListItemIcon>
          <ListItemText primary="Métodos de envío" selected={props.active === 'shipping-method'} />
        </ListItem>
        <ListItem
          button
          selected={props.active === 'order'}
          onClick={(e) => {
            handleClick('order');
          }}
        >
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText primary="Pedidos" />
        </ListItem>
        <ListItem
          button
          // style={{ color: "gray" }}
          onClick={(e) => {
            handleClick('prixer');
          }}
        >
          <ListItemIcon>
            <PaletteIcon />
          </ListItemIcon>
          <ListItemText primary="Prixers" />
        </ListItem>

        <ListItem
          button
          selected={props.active === 'testimonials'}
          onClick={(e) => {
            handleClick('testimonials');
          }}
        >
          <ListItemIcon>
            <InsertEmoticon />
          </ListItemIcon>
          <ListItemText primary="Testimonios" />
        </ListItem>
      </div>
      <Divider />
      <div>
        {props.permissions?.modifyAdmins && (
          <ListItem
            button
            selected={props.active === 'user'}
            onClick={(e) => {
              handleClick('user');
            }}
          >
            <ListItemIcon>
              <AssignmentIcon />
            </ListItemIcon>
            <ListItemText primary="Usuarios" />
          </ListItem>
        )}
        {(props.permissions?.modifyBanners || props.permissions?.modifyTermsAndCo) && (
          <ListItem
            button
            selected={props.active === 'preferences'}
            onClick={(e) => {
              handleClick('preferences');
            }}
          >
            <ListItemIcon>
              <WebAssetIcon />
            </ListItemIcon>
            <ListItemText primary="Preferencias" />
          </ListItem>
        )}
      </div>
    </>
  );
}
