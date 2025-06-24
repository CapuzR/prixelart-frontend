import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Alert,
  Box,
  Paper,
  Skeleton,
  Tabs,
  Tab,
} from "@mui/material";
import Grid2 from "@mui/material/Grid";

// Icons
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InventoryIcon from "@mui/icons-material/Inventory";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PaletteIcon from "@mui/icons-material/Palette";
import CategoryIcon from "@mui/icons-material/Category";

// Child components
import { KPICardWithComparison } from "./components/KPICardWithComparison";
import { DashboardFiltersComponent } from "./components/DashboardFiltersComponent";
import SalesTrendChart from "./components/SalesTrendChart";
import PerformanceWidget from "./components/PerformanceWidget";
import GeoChart from "./components/GeoChart";
import { PaymentStatusPieChart } from "./components/PaymentStatusPieChart";
import { PaymentMethodChart } from "./components/PaymentMethodChart";
import FilteredOrdersList from "./components/FilteredOrdersList";
import DashboardSkeleton from "./components/DashboardSkeleton";
import EmptyState from "./components/EmptyState";
import { OrderStatusFunnelChart } from "./components/OrderStatusFunnelChart";
import { CustomerAnalyticsChart } from "./components/CustomerAnalyticsChart";
import { CycleTimeChart } from "./components/CycleTimeChart";

// Types & API
import { Order, OrderStatus, GlobalPaymentStatus } from "types/order.types";
import {
  DashboardFilters,
  fetchGlobalOrdersList,
  fetchGlobalDashboardStats,
  fetchSellerPerformance,
  fetchPrixerPerformance,
  fetchProductPerformance,
  fetchProductionLinePerformance,
  fetchArtPerformance,
  fetchCustomerAnalytics,
  fetchCycleTimeAnalytics,
  GlobalDashboardStatsData,
  CustomerAnalyticsData,
  CycleTimeData,
} from "@api/order.api";
import { getPermissions } from "@api/admin.api";
import { Permissions } from "types/permissions.types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const getStartOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: getStartOfMonth(),
    endDate: new Date(),
  });

  // Data States
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<GlobalDashboardStatsData | null>(null);
  const [sellerPerformance, setSellerPerformance] = useState<any[]>([]);
  const [prixerPerformance, setPrixerPerformance] = useState<any[]>([]);
  const [productPerformance, setProductPerformance] = useState<any[]>([]);
  const [productionLinePerformance, setProductionLinePerformance] = useState<any[]>([]);
  const [artPerformance, setArtPerformance] = useState<any[]>([]);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalyticsData | null>(null);
  const [cycleTimeAnalytics, setCycleTimeAnalytics] = useState<CycleTimeData[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        ordersData,
        statsData,
        sellersData,
        prixersData,
        productsData,
        productionLinesData,
        artsData,
        customerData,
        cycleTimeData,
        userPermissions,
      ] = await Promise.all([
        fetchGlobalOrdersList(filters),
        fetchGlobalDashboardStats(filters),
        fetchSellerPerformance(filters),
        fetchPrixerPerformance(filters),
        fetchProductPerformance(filters),
        fetchProductionLinePerformance(filters),
        fetchArtPerformance(filters),
        fetchCustomerAnalytics(filters),
        fetchCycleTimeAnalytics(filters),
        getPermissions(),
      ]);

      setAllOrders(ordersData);
      setStats(statsData);
      setSellerPerformance(sellersData);
      setPrixerPerformance(prixersData);
      setProductPerformance(productsData);
      setProductionLinePerformance(productionLinesData);
      setArtPerformance(artsData);
      setCustomerAnalytics(customerData);
      setCycleTimeAnalytics(cycleTimeData);
      setPermissions(userPermissions);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleFilterChange = (newFilters: DashboardFilters) => setFilters(newFilters);

  const handleViewOrder = (orderId: string, openInNewTab: boolean) => {
    const path = `/admin/orders/update/${orderId}`;
    if (openInNewTab) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
  };

  const handleViewAllOrders = (statusFilter?: string) => {
    const params = new URLSearchParams({
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
    });
    if (statusFilter) params.append('payStatus', statusFilter);
    navigate(`/admin/orders/read?${params.toString()}`);
  }

  const pendingPaymentOrders = useMemo(() => allOrders.filter(o => o.payment?.status?.[o.payment.status.length - 1]?.[0] === GlobalPaymentStatus.Pending), [allOrders]);
  const activeOrders = useMemo(() => allOrders.filter(o => {
    const latestStatus = o.status?.[o.status.length - 1]?.[0];
    return latestStatus !== OrderStatus.Finished && latestStatus !== OrderStatus.Canceled;
  }), [allOrders]);

  const isRefetching = loading && !!stats;

  if (error) {
    return <Container sx={{ py: 4 }}><Alert severity="error">Error: {error}</Alert></Container>;
  }

  if (loading && !stats) {
    return (
      <Container maxWidth={false} sx={{ py: 3, backgroundColor: '#f4f6f8' }}>
        <DashboardFiltersComponent filters={filters} onFiltersChange={handleFilterChange} />
        <DashboardSkeleton />
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 3, backgroundColor: '#f4f6f8' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Dashboard Global</Typography>
        <Typography variant="subtitle1">Bienvenido, {permissions?.area || "Admin"}!</Typography>
      </Box>

      <DashboardFiltersComponent filters={filters} onFiltersChange={handleFilterChange} />

      {!isRefetching && !stats && !error && (
        <Paper sx={{ mt: 3, borderRadius: 2 }}>
          <EmptyState icon={InfoOutlinedIcon} title="No hay datos para mostrar" message="Intenta seleccionar un rango de fechas diferente o espera a que se generen nuevas órdenes." />
        </Paper>
      )}

      {stats && (
        <>
          <Grid2 container spacing={3} mt={0}>
            {/* KPI Row - Always Visible */}
            <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
              <KPICardWithComparison title="Ingresos Totales" value={stats.totalSales} previousValue={stats.prevPeriodTotalSales} prefix="$" icon={MonetizationOnIcon} loading={isRefetching} />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
              <KPICardWithComparison title="# de Órdenes" value={stats.totalOrders} previousValue={stats.prevPeriodTotalOrders} icon={ShoppingCartIcon} loading={isRefetching} isInteger />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
              <KPICardWithComparison title="Promedio por Órden" value={stats.averageOrderValue} previousValue={0} prefix="$" icon={AssessmentIcon} loading={isRefetching} />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, lg: 3 }}>
              <KPICardWithComparison title="Unidades Vendidas" value={stats.unitsSold} previousValue={0} icon={InventoryIcon} loading={isRefetching} isInteger />
            </Grid2>
          </Grid2>

          <Paper sx={{ width: '100%', mt: 3, borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="dashboard sections" variant="scrollable" scrollButtons="auto">
                <Tab icon={<BarChartIcon />} iconPosition="start" label="Rendimiento General" />
                <Tab icon={<PaletteIcon />} iconPosition="start" label="Rendimiento de Artes" />
                <Tab icon={<CategoryIcon />} iconPosition="start" label="Rendimiento de Productos" />
                <Tab icon={<PieChartIcon />} iconPosition="start" label="Análisis Visual" />
                <Tab icon={<ListAltIcon />} iconPosition="start" label="Órdenes Recientes" />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <Grid2 container spacing={3}>
                <Grid2 size={12}>
                  <SalesTrendChart orders={allOrders} loading={isRefetching} startDate={filters.startDate} endDate={filters.endDate} />
                </Grid2>
                <Grid2 size={{ xs: 12, xl: 6 }}>
                  <PerformanceWidget title="Análisis por Vendedor" data={sellerPerformance} loading={isRefetching} />
                </Grid2>
                <Grid2 size={{ xs: 12, xl: 6 }}>
                  <PerformanceWidget title="Análisis por Prixer" data={prixerPerformance} loading={isRefetching} isPrixer />
                </Grid2>
              </Grid2>
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <PerformanceWidget title="Análisis por Arte" data={artPerformance} loading={isRefetching} isArt />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, xl: 6 }}>
                  <PerformanceWidget title="Análisis por Producto" data={productPerformance} loading={isRefetching} isProductData={true} />
                </Grid2>
                <Grid2 size={{ xs: 12, xl: 6 }}>
                  <PerformanceWidget title="Análisis por Línea de Producción" data={productionLinePerformance} loading={isRefetching} />
                </Grid2>
              </Grid2>
            </TabPanel>

            <TabPanel value={activeTab} index={3}>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold">Embudo de Operaciones</Typography>
                    <OrderStatusFunnelChart statusCounts={stats.orderStatusCounts} loading={isRefetching} />
                  </Paper>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                    <Typography variant="h6" fontWeight="bold">Tiempo Promedio por Etapa</Typography>
                    <CycleTimeChart cycleTimeData={cycleTimeAnalytics} loading={isRefetching} />
                  </Paper>
                </Grid2>
                <Grid2 size={12}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold">Clientes Nuevos vs. Recurrentes</Typography>
                    <CustomerAnalyticsChart analyticsData={customerAnalytics} loading={isRefetching} />
                  </Paper>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: 450, display: 'flex', flexDirection: 'column' }}>
                    <PaymentStatusPieChart orders={allOrders} loading={isRefetching} title="Estados de Pago" />
                  </Paper>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: 450, display: 'flex', flexDirection: 'column' }}>
                    <PaymentMethodChart orders={allOrders} loading={isRefetching} />
                  </Paper>
                </Grid2>
                <Grid2 size={12}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold">Análisis Geográfico</Typography>
                    <GeoChart orders={allOrders} loading={isRefetching} />
                  </Paper>
                </Grid2>
              </Grid2>
            </TabPanel>

            <TabPanel value={activeTab} index={4}>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold" mb={1.5}>Órdenes Pendientes de Pago ({pendingPaymentOrders.length})</Typography>
                    <FilteredOrdersList orders={pendingPaymentOrders} loading={isRefetching} onViewOrder={handleViewOrder} onViewAll={() => handleViewAllOrders('Pendiente')} emptyMessage="No hay órdenes pendientes de pago." />
                  </Paper>
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight="bold" mb={1.5}>Órdenes Activas ({activeOrders.length})</Typography>
                    <FilteredOrdersList orders={activeOrders} loading={isRefetching} onViewOrder={handleViewOrder} onViewAll={() => handleViewAllOrders()} emptyMessage="No hay órdenes activas en este momento." />
                  </Paper>
                </Grid2>
              </Grid2>
            </TabPanel>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default SellerDashboard;