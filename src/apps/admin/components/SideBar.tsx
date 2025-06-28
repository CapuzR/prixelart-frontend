import React, { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Permissions } from "types/permissions.types";

import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Divider,
  Theme,
  useTheme,
  SxProps,
} from "@mui/material";

// --- Icons ---
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import DiscountIcon from '@mui/icons-material/Discount';
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import WebAssetIcon from "@mui/icons-material/WebAsset";
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import BrushIcon from '@mui/icons-material/Brush';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import GavelIcon from '@mui/icons-material/Gavel';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

interface SidebarProps {
  permissions: Permissions | null;
  drawerWidth: number;
  collapsedWidth: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  openSections: SectionState;
  onSectionClick: (section: keyof SectionState) => void;
}

// --- Updated Section State ---
export interface SectionState {
  dashboard: boolean;
  admins: boolean;
  products: boolean;
  art: boolean;
  consumers: boolean;
  orders: boolean;
  shipping: boolean;
  payments: boolean;
  movements: boolean; // Now collapsible
  prixers: boolean;
  testimonials: boolean;
  preferences: boolean;
  discounts: boolean; // Added
  surcharges: boolean; // Added
}

const Sidebar: React.FC<SidebarProps> = ({
  permissions,
  drawerWidth,
  collapsedWidth,
  isOpen,
  onOpen,
  onClose,
  openSections,
  onSectionClick,
}) => {
  const theme = useTheme();
  const location = useLocation();

  const isSelected = (path: string): boolean => {
    // Check for exact match or if the current path starts with the item's path
    return location.pathname === path || (path !== '/admin/dashboard' && location.pathname.startsWith(path));
  };

  // --- Styling Functions (unchanged) ---
  const listItemStyle = (path: string): SxProps<Theme> => ({
    pl: 4, // Indent nested items
    whiteSpace: 'nowrap', // Prevent text wrapping on sub-items during animation
    backgroundColor: isSelected(path)
      ? theme.palette.action.selected
      : "inherit",
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    color: theme.palette.text.secondary,
    ...(isSelected(path) && {
      color: theme.palette.primary.main,
      fontWeight: 'bold',
    }),
  });

  const sectionHeaderStyle = (pathPrefix: string): SxProps<Theme> => ({
    // Add these two properties to prevent layout shift during collapse animation
    overflow: 'hidden',
    whiteSpace: 'nowrap',

    backgroundColor: location.pathname.startsWith(pathPrefix)
      ? theme.palette.action.selected // Highlight section if child active
      : "inherit",
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    color: theme.palette.text.primary, // Section headers slightly more prominent
    ...(location.pathname.startsWith(pathPrefix) && { // Styles when selected
      fontWeight: 'medium',
    }),
  });


  if (!permissions) {
    // Optionally render a loading state or null
    return null;
  }

  // --- Updated Permission Checks ---
  const canViewAdmins = permissions.modifyAdmins;
  const canViewProducts = permissions.createProduct || permissions.deleteProduct || permissions.modifyBestSellers || permissions.modifyArtBestSellers;
  const canViewArt = permissions.createProduct || permissions.deleteProduct;
  const canViewConsumers = permissions.createConsumer || permissions.readConsumers || permissions.deleteConsumer;
  const canViewOrders = permissions.createOrder || permissions.detailOrder || permissions.orderStatus;
  const canViewShipping = permissions.createShippingMethod || permissions.deleteShippingMethod;
  const canViewPayments = permissions.createPaymentMethod || permissions.deletePaymentMethod;
  const canViewMovements = permissions.readMovements;
  const canViewTestimonials = permissions.createTestimonial || permissions.deleteTestimonial;
  const canViewPreferencesSection = permissions.modifyBanners || permissions.modifyTermsAndCo || permissions.modifyDollar;
  const canViewDiscounts = permissions.createDiscount || permissions.deleteDiscount;
  const canViewSurcharges = permissions.createDiscount || permissions.deleteDiscount;

  return (
    <Box
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      sx={{
        width: isOpen ? drawerWidth : collapsedWidth,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        flexShrink: 0,
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        borderRight: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <List component="nav" aria-labelledby="admin-sidebar-nav">
        {/* Dashboard */}
        {permissions.area === 'Master' && (
          <>
            <ListItemButton component={RouterLink} to="/admin/dashboard" sx={sectionHeaderStyle('/admin/dashboard')}>
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              {isOpen && <ListItemText primary="Dashboard" />}
            </ListItemButton>
            <Divider sx={{ my: 1 }} />
          </>
        )}
        {/* Admins Section */}
        {canViewAdmins && (
          <>
            <ListItemButton
              onClick={() => onSectionClick("admins")}
              sx={sectionHeaderStyle('/admin/admins')}
            >
              <ListItemIcon>
                <AssignmentIndIcon />
              </ListItemIcon>
              <ListItemText primary="Admins" />
              {openSections.admins ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.admins} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {permissions.modifyAdmins && (
                  <>
                    <ListItemButton component={RouterLink} to="/admin/admins/create" sx={listItemStyle("/admin/admins/create")}>
                      <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Crear Admin" />
                    </ListItemButton>
                    <ListItemButton component={RouterLink} to="/admin/admins/read" sx={listItemStyle("/admin/admins/read")}>
                      <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Ver Admins" />
                    </ListItemButton>
                    <ListItemButton component={RouterLink} to="/admin/admins/roles/create" sx={listItemStyle("/admin/admins/roles/create")}>
                      <ListItemIcon><PlaylistAddIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Crear Área/Rol" />
                    </ListItemButton>
                    <ListItemButton component={RouterLink} to="/admin/admins/roles/read" sx={listItemStyle("/admin/admins/roles/read")}>
                      <ListItemIcon><ManageAccountsIcon fontSize="small" /></ListItemIcon>
                      <ListItemText primary="Ver Áreas/Roles" />
                    </ListItemButton>
                  </>
                )}
              </List>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Products Section */}
        {canViewProducts && (
          <>
            <ListItemButton
              onClick={() => onSectionClick("products")}
              sx={sectionHeaderStyle('/admin/product')}
            >
              <ListItemIcon>
                <LocalMallIcon />
              </ListItemIcon>
              <ListItemText primary="Productos" />
              {openSections.products ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.products} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {permissions.createProduct && (
                  <ListItemButton component={RouterLink} to="/admin/product/create" sx={listItemStyle("/admin/product/create")}>
                    <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Crear Producto" />
                  </ListItemButton>
                )}
                {(permissions.createProduct || permissions.deleteProduct) && (
                  <ListItemButton component={RouterLink} to="/admin/product/read" sx={listItemStyle("/admin/product/read")}>
                    <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Ver Productos" />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Art Section */}
        {canViewArt && (
          <>
            <ListItemButton onClick={() => onSectionClick("art")} sx={sectionHeaderStyle('/admin/art')}>
              <ListItemIcon><BrushIcon /></ListItemIcon>
              <ListItemText primary="Artes" />
              {openSections.art ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.art} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {(permissions.createProduct) && (
                  <ListItemButton component={RouterLink} to="/admin/art/create" sx={listItemStyle('/admin/art/create')}>
                    <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Crear Artes" />
                  </ListItemButton>
                )}
                {(permissions.deleteProduct || permissions.createProduct) && (
                  <ListItemButton component={RouterLink} to="/admin/art/read" sx={listItemStyle('/admin/art/read')}>
                    <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Ver Artes" />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Discounts Section */}
        {canViewDiscounts && (
          <>
            <ListItemButton onClick={() => onSectionClick("discounts")} sx={sectionHeaderStyle('/admin/discount')}>
              <ListItemIcon><DiscountIcon /></ListItemIcon>
              <ListItemText primary="Descuentos" />
              {openSections.discounts ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.discounts} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {permissions.createDiscount && (
                  <ListItemButton component={RouterLink} to="/admin/discount/create" sx={listItemStyle('/admin/discount/create')}>
                    {/* Keep original path for create or update */}
                    <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Crear Descuento" />
                  </ListItemButton>
                )}
                {permissions.deleteDiscount && ( // Use a specific read permission if available
                  <ListItemButton component={RouterLink} to="/admin/discount/read" sx={listItemStyle('/admin/discount/read')}>
                    <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Ver Descuentos" />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Surcharges Section */}
        {canViewSurcharges && (
          <>
            <ListItemButton onClick={() => onSectionClick("surcharges")} sx={sectionHeaderStyle('/admin/surcharges')}>
              <ListItemIcon><PriceChangeIcon /></ListItemIcon>
              <ListItemText primary="Recargos" />
              {openSections.surcharges ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.surcharges} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {permissions.createDiscount && (
                  <ListItemButton component={RouterLink} to="/admin/surcharges/create" sx={listItemStyle('/admin/surcharges/create')}>
                    {/* Keep original path for create or update */}
                    <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Crear Recargo" />
                  </ListItemButton>
                )}
                {permissions.createDiscount && (
                  <ListItemButton component={RouterLink} to="/admin/surcharges/read" sx={listItemStyle('/admin/surcharges/read')}>
                    <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Ver Recargos" />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Consumers Section */}
        {canViewConsumers && (
          <>
            <ListItemButton
              onClick={() => onSectionClick("consumers")}
              sx={sectionHeaderStyle('/admin/users')}
            >
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Clientes y Prixers" />
              {openSections.consumers ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.consumers} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {permissions.createConsumer && (
                  <ListItemButton component={RouterLink} to="/admin/users/create" sx={listItemStyle('/admin/users/create')}>
                    <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Crear Cliente o Prixer" />
                  </ListItemButton>
                )}
                {permissions.readConsumers && (
                  <ListItemButton component={RouterLink} to="/admin/users/read" sx={listItemStyle("/admin/users/read")}>
                    <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Ver Clientes y Prixers" />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Orders Section */}
        {/* {canViewOrders && ( */}
          <>
            <ListItemButton onClick={() => onSectionClick("orders")} sx={sectionHeaderStyle('/admin/orders')}>
              <ListItemIcon><ReceiptIcon /></ListItemIcon>
              <ListItemText primary="Órdenes" />
              {openSections.orders ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.orders} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {permissions.createOrder && (
                  <ListItemButton component={RouterLink} to="/admin/orders/create" sx={listItemStyle('/admin/orders/create')}>
                    <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Crear Órden" />
                  </ListItemButton>
                )}
                {/* {(permissions.detailOrder || permissions.orderStatus) && ( */}
                  <ListItemButton component={RouterLink} to="/admin/orders/read" sx={listItemStyle('/admin/orders/read')}>
                    <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Ver Órdenes" />
                  </ListItemButton>
                {/* )} */}
              </List>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        {/* )} */}

        {/* Order History Section */}
        {/*         {cancreateOrder && ( */}
        <>
          <ListItemButton
            component={RouterLink}
            to="/admin/orderArchives/read"
            sx={sectionHeaderStyle('/admin/orderArchives/*')} // Use path prefix for highlighting
          >
            <ListItemIcon>
              <ManageSearchIcon /> {/* Icon for searching/history */}
            </ListItemIcon>
            <ListItemText primary="Órdenes Archivadas" />
          </ListItemButton>
          <Divider sx={{ my: 1 }} />
        </>
        {/*         )} */}


        {/* Shipping Methods Section */}
        {canViewShipping && (
          <>
            <ListItemButton onClick={() => onSectionClick("shipping")} sx={sectionHeaderStyle('/admin/shipping-method')}>
              <ListItemIcon><LocalShippingIcon /></ListItemIcon>
              <ListItemText primary="Métodos de envío" />
              {openSections.shipping ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.shipping} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {permissions.createShippingMethod && (
                  <ListItemButton component={RouterLink} to="/admin/shipping-method/create" sx={listItemStyle('/admin/shipping-method/create')}>
                    <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Crear Método de envío" />
                  </ListItemButton>
                )}
                {(permissions.createShippingMethod || permissions.deleteShippingMethod) && (
                  <ListItemButton component={RouterLink} to="/admin/shipping-method/read" sx={listItemStyle('/admin/shipping-method/read')}>
                    <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Ver Métodos de envío" />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Payment Methods Section */}
        {canViewPayments && (
          <>
            <ListItemButton onClick={() => onSectionClick("payments")} sx={sectionHeaderStyle('/admin/payment-method')}>
              <ListItemIcon><PaymentIcon /></ListItemIcon>
              <ListItemText primary="Métodos de Pago" />
              {openSections.payments ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.payments} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {permissions.createPaymentMethod && (
                  <ListItemButton component={RouterLink} to="/admin/payment-method/create" sx={listItemStyle('/admin/payment-method/create')}>
                    <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Crear Método de Pago" />
                  </ListItemButton>
                )}
                {(permissions.createPaymentMethod || permissions.deletePaymentMethod) && (
                  <ListItemButton component={RouterLink} to="/admin/payment-method/read" sx={listItemStyle('/admin/payment-method/read')}>
                    <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Ver Métodos de Pago" />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Movements Section */}
        {canViewMovements && (
          <>
            <ListItemButton onClick={() => onSectionClick("movements")} sx={sectionHeaderStyle('/admin/movements')}>
              <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
              <ListItemText primary="Movimientos" />
              {openSections.movements ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.movements} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {permissions.readMovements && ( // Check for create permission
                  <ListItemButton component={RouterLink} to="/admin/movements/create" sx={listItemStyle('/admin/movements/create')}>
                    <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Crear Movimiento" />
                  </ListItemButton>
                )}
                {permissions.readMovements && ( // Check for read permission
                  <ListItemButton component={RouterLink} to="/admin/movements/read" sx={listItemStyle('/admin/movements/read')}>
                    <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Ver Movimientos" />
                  </ListItemButton>
                )}
                {/* Detail Pay link could be added here , or handled within read view */}
              </List>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Testimonials Section */}
        {canViewTestimonials && (
          <>
            <ListItemButton onClick={() => onSectionClick("testimonials")} sx={sectionHeaderStyle('/admin/testimonials')}>
              <ListItemIcon><InsertEmoticonIcon /></ListItemIcon>
              <ListItemText primary="Testimonios" />
              {openSections.testimonials ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.testimonials} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {permissions.createTestimonial && (
                  <ListItemButton component={RouterLink} to="/admin/testimonials/create" sx={listItemStyle('/admin/testimonials/create')}>
                    <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Crear Testimonio" />
                  </ListItemButton>
                )}
                {(permissions.createTestimonial || permissions.deleteTestimonial) && (
                  <ListItemButton component={RouterLink} to="/admin/testimonials/read" sx={listItemStyle('/admin/testimonials/read')}>
                    <ListItemIcon><ListAltIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Ver Testimonios" />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {/* Preferences Section */}
        {canViewPreferencesSection && (
          <>
            <ListItemButton onClick={() => onSectionClick("preferences")} sx={sectionHeaderStyle('/admin/preferences')}>
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Preferencias" />
              {openSections.preferences ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse in={openSections.preferences} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {/* Item 1: Banners/Carousel */}
                {permissions.modifyBanners && ( // Specific permission check
                  <ListItemButton component={RouterLink} to="/admin/preferences/banners" sx={listItemStyle('/admin/preferences/banners')}>
                    {/* Adjusted path */}
                    <ListItemIcon><WebAssetIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Editar Carrusel de Inicio" />
                  </ListItemButton>
                )}
                {/* Item 2: Terms & Conditions */}
                {permissions.modifyTermsAndCo && ( // Specific permission check
                  <ListItemButton component={RouterLink} to="/admin/preferences/terms" sx={listItemStyle('/admin/preferences/terms')}>
                    {/* New path */}
                    <ListItemIcon><GavelIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Términos y Condiciones" />
                  </ListItemButton>
                )}
                {/* Item 3: Dollar Value */}
                {permissions.modifyDollar && ( // Specific permission check
                  <ListItemButton component={RouterLink} to="/admin/preferences/dollar" sx={listItemStyle('/admin/preferences/dollar')}>
                    {/* New path */}
                    <ListItemIcon><AttachMoneyIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Valor del Dólar" />
                  </ListItemButton>
                )}
              </List>
            </Collapse>
            <Divider sx={{ my: 1 }} />
          </>
        )}
      </List>
    </Box>
  );
};

export default Sidebar;