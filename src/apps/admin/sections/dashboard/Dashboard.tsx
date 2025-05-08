import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Grid,
    Typography,
    CircularProgress,
    Alert,
    Box,
    Paper,
    Button,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';

// Import Child Components
import { KPICard } from './components/KPICard';
import { SalesTrendChart } from './components/SalesTrendChart';
import { OrderStatusDistributionChart } from './components/OrderStatusDistributionChart';
import { RecentOrdersList } from './components/RecentOrdersList';
import { TopPerformingItemsList } from './components/TopPerformingItemsList';
import { DashboardFiltersComponent } from './components/DashboardFiltersComponent';
import { Order, OrderLine, OrderStatus } from 'types/order.types';
import { DashboardFilters, fetchGlobalDashboardStats, fetchGlobalOrdersList, fetchGlobalTopPerformingItems, GlobalDashboardStatsData } from '@api/order.api';
import { useNavigate } from 'react-router-dom';

interface TopItemLocal {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
    imageUrl?: string;
}


const SellerDashboard: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState<GlobalDashboardStatsData | null>(null);
    const [topItems, setTopItems] = useState<TopItemLocal[]>([]);
    const navigate = useNavigate();
    const [filters, setFilters] = useState<DashboardFilters>({
        startDate: new Date(new Date().setDate(new Date().getDate() - 29)),
        endDate: new Date(),
    });

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const sellerName = "Admin";

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Parallel fetching using global API functions
            const [ordersData, statsData, topItemsData] = await Promise.all([
                fetchGlobalOrdersList(filters),
                fetchGlobalDashboardStats(filters),
                fetchGlobalTopPerformingItems(filters, 5)
            ]);

            setOrders(ordersData);
            setStats(statsData);
            // The backend now returns GlobalTopPerformingItemData which matches TopItemLocal
            setTopItems(topItemsData);

        } catch (err) {
            console.error('Failed to load global dashboard data:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred while loading dashboard data.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]); // Re-run when loadDashboardData (and thus filters) changes

    const handleFilterChange = (newFilters: DashboardFilters) => {
        setFilters(newFilters);
    };

    const handleViewOrder = (orderId: string) => {
        navigate(`/admin/orders/update/${orderId}`); //
    };

    // Derived data for charts (can be memoized with useMemo if complex)
    const salesTrendChartData = orders.reduce((acc, order) => {
        const date = new Date(order.createdOn).toLocaleDateString();
        const existingEntry = acc.find(entry => entry.name === date);
        if (existingEntry) {
            existingEntry.sales += order.total;
            existingEntry.orders += 1;
        } else {
            acc.push({ name: date, sales: order.total, orders: 1 });
        }
        return acc;
    }, [] as { name: string; sales: number; orders: number }[]).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());


    const orderStatusChartData = React.useMemo(() => {
        if (!orders) return [];
        const counts: Record<number, number> = {};
        orders.forEach(order => {
            order.lines.forEach((line: OrderLine) => {
                const currentStatusEnum = line.status[line.status.length - 1][0];
                counts[currentStatusEnum] = (counts[currentStatusEnum] || 0) + 1;
            });
        });
        return Object.entries(counts).map(([statusKey, value]) => ({
            name: OrderStatus[Number(statusKey) as OrderStatus],
            value,
        }));
    }, [orders]);


    if (error) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">Error: {error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">
                    Dashboard
                </Typography>
                <Box>
                    {/* Placeholder for Avatar/Seller Name */}
                    <Typography variant="subtitle1">Bienvenido, {sellerName}!</Typography>
                </Box>
            </Box>

            <DashboardFiltersComponent filters={filters} onFiltersChange={handleFilterChange} />

            {loading && !stats && ( // Show main loader only if no data is present yet
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ minHeight: '60vh' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ ml: 2 }}>Cargando...</Typography>
                </Box>
            )}

            {!loading && !stats && !error && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6">No hay información disponible para ese periodo.</Typography>
                    <Typography>Intenta seleccionando otro rango de fechas.</Typography>
                </Paper>
            )}

            {stats && ( // Render dashboard sections only if stats are loaded
                <>
                    {/* Section 1: KPIs */}
                    <Grid container spacing={3} mb={3}>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <KPICard title="Ingresos" value={`$${stats.totalSales.toFixed(2)}`} icon={MonetizationOnIcon} loading={loading} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <KPICard title="# de Órdenes" value={stats.totalOrders.toString()} icon={ShoppingCartIcon} loading={loading} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <KPICard title="Promedio de $ por órden" value={`$${stats.averageOrderValue.toFixed(2)}`} icon={AssessmentIcon} loading={loading} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <KPICard title="Productos Vendidos" value={stats.unitsSold.toString()} icon={InventoryIcon} loading={loading} />
                        </Grid>
                    </Grid>

                    {/* Section 2: Sales & Order Overview */}
                    <Grid container spacing={3} mb={3}>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <SalesTrendChart data={salesTrendChartData} loading={loading} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <OrderStatusDistributionChart data={orderStatusChartData} loading={loading} />
                        </Grid>
                    </Grid>

                    {/* Section 3: Pending Actions & Recent Orders */}
                    <Grid container spacing={3} mb={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <RecentOrdersList orders={orders} loading={loading} onViewOrder={handleViewOrder} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TopPerformingItemsList items={topItems} loading={loading} />
                        </Grid>
                    </Grid>
                </>
            )}
        </Container>
    );
};

export default SellerDashboard;