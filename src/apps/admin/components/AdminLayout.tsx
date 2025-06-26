import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Permissions } from "types/permissions.types";

import { Box, CircularProgress, Typography, CssBaseline, Toolbar, Button, useTheme } from "@mui/material";
import { getPermissions } from "@api/admin.api";
import Sidebar, { SectionState } from "./SideBar";
import { useSnackBar } from "@context/GlobalContext";

const EXPANDED_DRAWER_WIDTH = 300; // The full width of the sidebar when open

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

    const [permissions, setPermissions] = useState<Permissions | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname === "/admin/inicio") {
            setLoading(false);
            setPermissions(null);
            setError(null);
            return;
        }

        const checkAuthAndPermissions = async () => {
            setLoading(true);
            setError(null);
            try {
                const fetchedPermissions = await getPermissions();
                setPermissions(fetchedPermissions);
            } catch (err: any) {
                console.error("Permission check failed in Layout:", err);
                if (err.message === "Unauthorized") {
                    setError("Unauthorized access. Redirecting to login...");
                    setTimeout(() => navigate("/admin/inicio", { replace: true }), 1500);
                } else {
                    setError(err.message || "Failed to load permissions. Please try again.");
                    navigate("/admin/inicio", { replace: true });
                }
                setPermissions(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndPermissions();
    }, [location.pathname, navigate]);

    useEffect(() => {
        if (permissions && !loading) {
            if (location.pathname === '/admin/dashboard' && permissions.area !== 'Master') {
                showSnackBar("El dashboard es solo para administradores Master.");
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
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh" flexDirection="column">
                <Typography color="error" variant="h6">Accesso Denegado</Typography>
                <Typography color="error">{error}</Typography>
                <Button onClick={() => navigate('/admin/inicio')}>Go to Login</Button>
            </Box>
        );
    }

    if (location.pathname === "/admin/inicio") {
        return <Outlet />;
    }

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            <Sidebar
                permissions={permissions}
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
                    bgcolor: "background.default",
                    p: 3,
                    // --- Animate the width and margin to match the sidebar state ---
                    width: `calc(100% - ${currentDrawerWidth}px)`,
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    height: '100vh',
                    overflowY: 'auto',
                }}
            >
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;