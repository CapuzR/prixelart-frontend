import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Box, CircularProgress, Typography, CssBaseline, Button, useTheme } from '@mui/material';
import Sidebar, { SectionState } from './SideBar';
import { useSnackBar } from '@context/UIContext';

const EXPANDED_DRAWER_WIDTH = 300;

const initialSectionState: SectionState = {
  dashboard: false,
  admins: false,
  products: false,
  art: false,
  consumers: false,
  orders: false,
  shipping: false,
  payments: false,
  movements: false,
  prixers: false,
  testimonials: false,
  preferences: false,
  discounts: false,
  surcharges: false,
};

const AdminLayout: React.FC = () => {
  const theme = useTheme();
  const { permissions, loading, error } = useAuth();
  const { showSnackBar } = useSnackBar();
  const COLLAPSED_DRAWER_WIDTH = Number(theme.spacing(7).replace('px', '')); // Standard MUI icon size + padding
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState<SectionState>(initialSectionState);

  const handleSidebarOpen = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
    setOpenSections(initialSectionState);
  };

  const handleSectionClick = (section: keyof SectionState) => {
    if (isSidebarOpen) {
      setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    }
  };

  const currentDrawerWidth = isSidebarOpen ? EXPANDED_DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!permissions && location.pathname !== '/admin/inicio') {
        showSnackBar('No estás autenticado. Redireccionando...');
        navigate('/admin/inicio', { replace: true });
        return;
      }

      if (
        permissions &&
        location.pathname === '/admin/dashboard' &&
        permissions.area !== 'Master'
      ) {
        showSnackBar('El dashboard es solo para administradores Master.');
        navigate('/admin/orders/read', { replace: true });
      }
    }
  }, [permissions, loading, location.pathname, navigate, showSnackBar]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando Panel de Administración...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        flexDirection="column"
      >
        <Typography color="error" variant="h6">
          Accesso Denegado
        </Typography>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => navigate('/admin/inicio')}>Go to Login</Button>
      </Box>
    );
  }

  if (location.pathname === '/admin/inicio') {
    return <Outlet />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <Sidebar
        drawerWidth={EXPANDED_DRAWER_WIDTH}
        collapsedWidth={COLLAPSED_DRAWER_WIDTH}
        isOpen={isSidebarOpen}
        onOpen={handleSidebarOpen}
        onClose={handleSidebarClose}
        openSections={openSections}
        onSectionClick={handleSectionClick}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          pt: 6,
          width: `calc(100% - ${currentDrawerWidth}px)`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
