import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme, SxProps, Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';

// --- Icons ---
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// --- Assets ---
import logo from './Logotipo_Prixelart_H2.png';
// import CB from '../../apps/orgs/orgLanding/assets/isotipo.svg';

// --- Contexts ---
import { useCurrency, useUser } from 'context/GlobalContext';
import { useCart } from 'context/CartContext';

// --- Constants ---
const LOCAL_STORAGE_TOKEN_KEY = 'token';
const LOCAL_STORAGE_TOKEN_EXPIRE_KEY = 'tokenExpire';
const drawerWidth = 240;

const NAV_ITEMS = [
  { label: 'Home', value: 'home', path: '/' },
  { label: 'Galería', value: 'gallery', path: '/galeria' },
  { label: 'Productos', value: 'products', path: '/productos' },
  { label: 'Prixers', value: 'prixers', path: '/prixers' },
  { label: 'Servicios', value: 'services', path: '/servicios' },
  { label: 'Tracking', value: 'tracking', path: '/track' },
  { label: 'Testimonios', value: 'testimonials', path: '/testimonios' },
  // { label: 'Organizaciones', value: 'organizaciones', path: '/organizaciones' },
];
interface LogoButtonProps {
  onClick: () => void;
  sx?: SxProps<Theme>;
}
const LogoButton: React.FC<LogoButtonProps> = ({ onClick, sx: inheritedSx }) => (
  <IconButton onClick={onClick} sx={{ padding: { xs: 1, md: '8px' }, ...inheritedSx }}>
    <img src={logo} alt="Prixelart logo" style={{ width: 100, display: 'block' }} />
  </IconButton>
);

interface ShoppingCartButtonProps {
  onClick: () => void;
  itemCount: number;
}
const ShoppingCartButton: React.FC<ShoppingCartButtonProps> = ({ onClick, itemCount }) => (
  <IconButton onClick={onClick} color="inherit">
    <Badge overlap="rectangular" badgeContent={itemCount} color="error">
      <ShoppingCartOutlinedIcon />
    </Badge>
  </IconButton>
);
// --- Main Component ---

const MenuAppBar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { cart } = useCart();
  const { user, setUser } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [avatar, setAvatar] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string | false>(false);

  // --- Effects ---

  useEffect(() => {
    const currentPath = location.pathname;
    const currentTab = NAV_ITEMS.find(item => item.path === currentPath);
    setSelectedTab(currentTab ? currentTab.value : false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (user) {
        const base_url = `${import.meta.env.VITE_BACKEND_URL}/prixer/get/${user.username}`;
        try {
          const response = await axios.get(base_url);
          console.log("Avatar response:", response.data);
          setAvatar(response.data.result.prixer.avatar);
        } catch (error) {
          console.error("Failed to fetch avatar:", error);
          setAvatar('');
        }
      } else {
        setAvatar('');
      }
    };
    fetchAvatar();
  }, [user]);

  // --- Handlers ---

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
    setUserMenuAnchorEl(null);
    setDrawerOpen(false);
  }, [navigate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    const navItem = NAV_ITEMS.find(item => item.value === newValue);
    if (navItem) {
      handleNavigate(navItem.path);
    }
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = async () => {
    const base_url = `${import.meta.env.VITE_BACKEND_URL}/logout`;
    try {
      await axios.post(base_url);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUserMenuAnchorEl(null);
      setDrawerOpen(false);
      setAvatar('');
      navigate('/');
      setUser(null)

    }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank');
    setUserMenuAnchorEl(null);
    setDrawerOpen(false);
  };

  // --- Menu Item Definitions ---

  const commonMenuItems = [
    { label: 'Contáctanos', onClick: () => handleExternalLink('https://linktr.ee/prixelart') },
  ];

  const loggedInUserMenuItems = [
    { label: 'Mi Perfil', onClick: () => handleNavigate(`/prixer/${user!.username}`) },
    { label: 'Mi Cuenta', onClick: () => handleNavigate(`/prixer/${user!.username}`) },
    // { label: 'Cambiar contraseña', onClick: () => handleNavigate(`/prixer/${user!.username}`) },

    { label: 'Cerrar Sesión', onClick: handleLogout },
  ];

  const loggedOutUserMenuItems = [
    { label: 'Iniciar sesión', onClick: () => handleNavigate('/iniciar') },
  ];

  // --- Style definitions ---
  const tabSx: SxProps<Theme> = {
    minWidth: '0px',
    color: 'white !important',
    '&.Mui-selected': {
      color: 'red !important',
    },
  };

  const logoButtonOuterSx: SxProps<Theme> = {
    position: 'relative',
    borderRadius: '30%',
  };

  const appBarSx: SxProps<Theme> = {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(isMobile && drawerOpen && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  };

  const drawerHeaderSx: SxProps<Theme> = (currentTheme) => ({
    display: 'flex',
    alignItems: 'center',
    padding: currentTheme.spacing(0, 1),
    ...currentTheme.mixins.toolbar,
    justifyContent: 'flex-end',
  });

  // --- Rendering Logic ---

  const renderNavTabs = (orientation: "horizontal" | "vertical" = "horizontal") => (
    <Tabs
      orientation={orientation}
      value={selectedTab}
      onChange={handleTabChange}
      sx={orientation === 'vertical'
        ? {
          display: 'flex',
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          alignItems: 'flex-start',
          width: '100%',
        }
        : {}
      }
    >
      {NAV_ITEMS.filter(item => item.value !== 'home' || !isMobile).map((item) => (
        <Tab key={item.value} sx={tabSx} value={item.value} label={item.label} />
      ))}
    </Tabs>
  );

  const renderMenuItems = (items: { label: string; onClick: () => void }[]) => (
    items.map(item => (
      <MenuItem key={item.label} onClick={item.onClick}>{item.label}</MenuItem>
    ))
  );

  const renderDrawerTabs = (items: { label: string; onClick: () => void }[]) => (
    <Tabs orientation="vertical" sx={{ display: 'flex', width: '100%' }}> {/* Added width 100% for better layout */}
      {items.map(item => (
        <Tab key={item.label} sx={tabSx} label={item.label} onClick={item.onClick} />
      ))}
    </Tabs>
  );

  // --- Mobile Drawer ---
  const drawerContent = (
    <Box sx={{ width: drawerWidth }} role="presentation">
      <Box sx={drawerHeaderSx}>
        <IconButton onClick={handleDrawerToggle}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
      <Divider />
      {user && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginY: '30px' }}>
          <IconButton onClick={() => handleNavigate(`/prixer${user.username}`)} sx={{ p: 0 }}>
            <img
              src={avatar}
              alt="User Avatar"
              style={{ height: 180, width: 180, borderRadius: '50%', objectFit: 'cover' }}
            />
          </IconButton>
        </Box>
      )}
      {renderNavTabs("vertical")}
      <Divider />
      {user
        ? renderDrawerTabs(loggedInUserMenuItems)
        : renderDrawerTabs(loggedOutUserMenuItems)
      }
      <Divider />
      {renderDrawerTabs(commonMenuItems)}
    </Box>
  );

  // Chiguire:
  // const brillanteKeyframes = {
  //   '0%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.7)' },
  //   '50%': { boxShadow: '0 0 0 20px rgba(255, 255, 255, 0)' },
  //   '100%': { boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' },
  // };
  // const chiguireImageSx: SxProps<Theme> = {
  //   width: 45,
  //   height: 45,
  //   borderRadius: '50%',
  //   '@keyframes animacion-brillo': brillanteKeyframes,
  //   animation: 'animacion-brillo 2s infinite',
  // };

  // --- Main Return ---
  return (
    <Box sx={{ flexGrow: 1, minWidth: '100%', minHeight: '100%' }}>
      <AppBar
        color="secondary"
        position="fixed"
        sx={appBarSx}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* Left Section (Menu/Logo) */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerToggle}
                edge="start"
                sx={{ mr: 2, display: { md: 'none' }, ...(drawerOpen && { display: 'none' }) }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <LogoButton onClick={() => handleNavigate('/')} sx={logoButtonOuterSx} />
            {/* Chiguireo
             <IconButton onClick={() => handleNavigate('/chiguirebipolar')} size="medium" sx={{ ml: 2, display: { xs: 'none', md: 'inline-flex'} }}>
               <Box component="img" src={CB} sx={chiguireImageSx} />
             </IconButton>
            */}
          </Box>

          {/* Middle Section (Desktop Tabs) */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              {renderNavTabs("horizontal")}
            </Box>
          )}

          {/* Right Section (Actions/User Menu) */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShoppingCartButton onClick={() => handleNavigate('/carrito')} itemCount={cart.lines.length} />
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleUserMenuOpen}
              color="inherit"
              size="medium"
            >
              {user && avatar ? (
                <img
                  src={avatar}
                  alt="User Avatar"
                  style={{ height: 40, width: 40, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <MenuIcon />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={userMenuAnchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(userMenuAnchorEl)}
              onClose={handleUserMenuClose}
              sx={{ mt: '45px' }}
            >
              {user
                ? renderMenuItems(loggedInUserMenuItems)
                : renderMenuItems(loggedOutUserMenuItems)
              }
              <Divider sx={{ display: { xs: 'none', md: 'block' } }} />
              {renderMenuItems(commonMenuItems)}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
            },
          }}
          variant="persistent"
          anchor="left"
          open={drawerOpen}        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
};

export default MenuAppBar;