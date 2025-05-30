import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Permissions } from "types/permissions.types";

import { Box, CircularProgress, Typography, CssBaseline, Toolbar, AppBar as MuiAppBar, Button } from "@mui/material"; // Renamed AppBar import
import { getPermissions } from "@api/admin.api";
import Sidebar from "./SideBar";

const DRAWER_WIDTH = 300; // Define sidebar width here or import from theme/constants

const AdminLayout: React.FC = () => {
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
            setError(null); // Reset error on navigation
            try {
                const fetchedPermissions = await getPermissions();
                setPermissions(fetchedPermissions);
            } catch (err: any) {
                console.error("Permission check failed in Layout:", err);
                // Check if it's the specific unauthorized error thrown by getPermissions
                if (err.message === "Unauthorized") {
                    setError("Unauthorized access. Redirecting to login...");
                    // Redirect to login after a short delay to show message (optional)
                    setTimeout(() => navigate("/admin/inicio", { replace: true }), 1500);
                } else {
                    setError(err.message || "Failed to load permissions. Please try again.");
                    navigate("/admin/inicio", { replace: true });
                }
                setPermissions(null); // Clear permissions on error
            } finally {
                setLoading(false);
            }
        };

        checkAuthAndPermissions();

        // Re-check permissions every time the location changes within the admin section
    }, [location.pathname, navigate]); // Dependency on location.pathname triggers refetch

    // Render different states
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Cargando Panel de Administración...</Typography>
            </Box>
        );
    }

    if (error) {
        // Display error state, potentially with a retry button or just the redirect message
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh" flexDirection="column">
                <Typography color="error" variant="h6">Accesso Denegado</Typography>
                <Typography color="error">{error}</Typography>
                {/* You might not want a link back if they are unauthorized */}
                <Button onClick={() => navigate('/admin/inicio')}>Go to Login</Button>
            </Box>
        );
    }

    // Do not render sidebar/outlet for the login page
    if (location.pathname === "/admin/inicio") {
        return <Outlet />; // Render only the Login component
    }

    // Render the main layout with Sidebar and Content Area (Outlet)
    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            <Sidebar permissions={permissions} drawerWidth={DRAWER_WIDTH} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: "background.default",
                    p: 3, // Add padding to the content area
                    width: `calc(100% - ${DRAWER_WIDTH}px)`, // Adjust width based on drawer
                    height: '100vh', // Full height
                    overflowY: 'auto', // Scrollable content
                }}
            >
                {/* Toolbar to offset content below the fixed AppBar */}
                <Toolbar />

                {/* Outlet renders the matched nested route component */}
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;