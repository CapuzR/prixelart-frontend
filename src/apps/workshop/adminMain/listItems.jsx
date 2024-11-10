import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PeopleIcon from '@material-ui/icons/People';
import AssignmentIcon from '@material-ui/icons/Assignment';
import Divider from '@material-ui/core/Divider';
import { useHistory } from 'react-router-dom';
import PaletteIcon from '@material-ui/icons/Palette';
import LocalMallIcon from '@material-ui/icons/LocalMall';
import PaymentIcon from '@material-ui/icons/Payment';
import ReceiptIcon from '@material-ui/icons/Receipt';
import WebAssetIcon from '@material-ui/icons/WebAsset';
import { InsertEmoticon } from '@material-ui/icons';
import LocalShippingIcon from '@material-ui/icons/LocalShipping';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
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
