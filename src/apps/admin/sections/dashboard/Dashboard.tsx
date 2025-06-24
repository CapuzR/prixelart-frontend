import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Alert,
  Box,
  Paper,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
} from "@mui/material";
import Grid2 from "@mui/material/Grid";

// Icons
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InventoryIcon from "@mui/icons-material/Inventory";
import GroupIcon from "@mui/icons-material/Group";
import PaletteIcon from "@mui/icons-material/Palette";
import CategoryIcon from "@mui/icons-material/Category";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PublicIcon from "@mui/icons-material/Public";
import PaidIcon from "@mui/icons-material/Paid";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// Child components
import { KPICard } from "./components/KPICard";
import { DashboardFiltersComponent } from "./components/DashboardFiltersComponent";
import PerformanceTable, { PerformanceData } from "./components/PerformanceTable";
import FilteredOrdersList from "./components/FilteredOrdersList";
import SalesTrendChart from "./components/SalesTrendChart";
import PerformanceBarChart from "./components/PerformanceBarChart";
import { OrderStatusPieChart } from "./components/OrderStatusPieChart";
import GeoChart from "./components/GeoChart";
import { PaymentMethodChart } from "./components/PaymentMethodChart";
import DashboardSkeleton from "./components/DashboardSkeleton";
import EmptyState from "./components/EmptyState";

// Types & API
import { Order, OrderStatus, GlobalPaymentStatus } from "types/order.types";
import {
  DashboardFilters,
  fetchGlobalOrdersList,
  fetchGlobalDashboardStats,
  fetchSellerPerformance,
  fetchPrixerPerformance,
  fetchProductPerformance,
  GlobalDashboardStatsData,
} from "@api/order.api";
import { getPermissions } from "@api/admin.api";
import { Permissions } from "types/permissions.types";

const getStartOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`dashboard-tabpanel-${index}`}
    aria-labelledby={`dashboard-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const a11yProps = (index: number) => ({
  id: `dashboard-tab-${index}`,
  "aria-controls": `dashboard-tabpanel-${index}`,
});

const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: getStartOfMonth(),
    endDate: new Date(),
  });
  const [activeTab, setActiveTab] = useState(0);
  const [metric, setMetric] = useState<"sales" | "units">("sales");

  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<GlobalDashboardStatsData | null>(null);
  const [sellerPerformance, setSellerPerformance] = useState<PerformanceData[]>([]);
  const [prixerPerformance, setPrixerPerformance] = useState<PerformanceData[]>([]);
  const [productPerformance, setProductPerformance] = useState<PerformanceData[]>([]);

    const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // --- REVERTED to Promise.all for parallel fetching ---
      const [
        ordersData,
        statsData,
        sellersData,
        prixersData,
        productsData,
        userPermissions,
      ] = await Promise.all([
        fetchGlobalOrdersList(filters),
        fetchGlobalDashboardStats(filters),
        fetchSellerPerformance(filters),
        fetchPrixerPerformance(filters),
        fetchProductPerformance(filters),
        getPermissions(),
      ]);

      setAllOrders(ordersData);
      setStats(statsData);
      setSellerPerformance(sellersData);
      setPrixerPerformance(prixersData);
      setProductPerformance(productsData);
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

  const handleFilterChange = (newFilters: DashboardFilters) =>
    setFilters(newFilters);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) =>
    setActiveTab(newValue);

  const handleMetricChange = (
    _: React.MouseEvent<HTMLElement>,
    newMetric: "sales" | "units" | null
  ) => {
    if (newMetric) setMetric(newMetric);
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/admin/orders/update/${orderId}`);
  };

  const pendingPaymentOrders = useMemo(
    () =>
      allOrders.filter(
        (o) =>
          o.payment?.status?.[o.payment.status.length - 1]?.[0] ===
          GlobalPaymentStatus.Pending
      ),
    [allOrders]
  );

  const activeOrders = useMemo(
    () =>
      allOrders.filter((o) => {
        const latestStatus = o.status?.[o.status.length - 1]?.[0];
        return (
          latestStatus !== OrderStatus.Finished &&
          latestStatus !== OrderStatus.Canceled
        );
      }),
    [allOrders]
  );

  const isRefetching = loading && !!stats;

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Error: {error}</Alert>
      </Container>
    );
  }

  if (loading && !stats) {
    return (
      <Container maxWidth={false} sx={{ py: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Dashboard</Typography>
          <Skeleton variant="text" width={150} height={24} />
        </Box>
        <DashboardFiltersComponent
          filters={filters}
          onFiltersChange={handleFilterChange}
        />
        <DashboardSkeleton />
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography variant="subtitle1">
          Bienvenido, {permissions?.area || "Admin"}!
        </Typography>
      </Box>

      <DashboardFiltersComponent
        filters={filters}
        onFiltersChange={handleFilterChange}
      />

      {!isRefetching && !stats && !error && (
        <Paper sx={{ mt: 3, borderRadius: 2 }}>
          <EmptyState
            icon={InfoOutlinedIcon}
            title="No hay datos para mostrar"
            message="Intenta seleccionar un rango de fechas diferente o espera a que se generen nuevas órdenes."
          />
        </Paper>
      )}

      {stats && (
        <>
          <Grid2 container spacing={3} mt={0} mb={3}>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <KPICard
                title="Ingresos Totales"
                value={stats.totalSales || 0}
                prefix="$"
                icon={MonetizationOnIcon}
                loading={isRefetching}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <KPICard
                title="# de Órdenes"
                value={stats.totalOrders || 0}
                icon={ShoppingCartIcon}
                loading={isRefetching}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <KPICard
                title="Promedio por Órden"
                value={stats.averageOrderValue || 0}
                prefix="$"
                icon={AssessmentIcon}
                loading={isRefetching}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
              <KPICard
                title="Unidades Vendidas"
                value={stats.unitsSold || 0}
                icon={InventoryIcon}
                loading={isRefetching}
              />
            </Grid2>
          </Grid2>

          <Box mb={3}>
            <SalesTrendChart
              orders={allOrders}
              loading={isRefetching}
              metric={metric}
              startDate={filters.startDate}
              endDate={filters.endDate}
            />
          </Box>

          <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                aria-label="dashboard tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab
                  label="Por Vendedor"
                  icon={<GroupIcon />}
                  iconPosition="start"
                  {...a11yProps(0)}
                />
                <Tab
                  label="Por Prixer"
                  icon={<PaletteIcon />}
                  iconPosition="start"
                  {...a11yProps(1)}
                />
                <Tab
                  label="Por Producto"
                  icon={<CategoryIcon />}
                  iconPosition="start"
                  {...a11yProps(2)}
                />
                <Tab
                  label="Geográfico"
                  icon={<PublicIcon />}
                  iconPosition="start"
                  {...a11yProps(3)}
                />
                <Tab
                  label="Financiero"
                  icon={<PaidIcon />}
                  iconPosition="start"
                  {...a11yProps(4)}
                />
                <Tab
                  label="Pendientes de Pago"
                  icon={<HourglassEmptyIcon />}
                  iconPosition="start"
                  {...a11yProps(5)}
                />
                <Tab
                  label="Órdenes Activas"
                  icon={<PlayCircleOutlineIcon />}
                  iconPosition="start"
                  {...a11yProps(6)}
                />
              </Tabs>
            </Box>

            <CustomTabPanel value={activeTab} index={0}>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, lg: 5 }}>
                  <PerformanceBarChart
                    data={sellerPerformance}
                    metric={metric}
                    loading={isRefetching}
                    title={`Top 10 Vendedores por ${
                      metric === "sales" ? "Ingresos" : "Unidades"
                    }`}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, lg: 7 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Rendimiento por Vendedor
                    </Typography>
                    <ToggleButtonGroup
                      value={metric}
                      exclusive
                      onChange={handleMetricChange}
                      size="small"
                    >
                      <ToggleButton value="sales">Ventas ($)</ToggleButton>
                      <ToggleButton value="units">Unidades</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <PerformanceTable
                    data={sellerPerformance}
                    metric={metric}
                    loading={isRefetching}
                  />
                </Grid2>
              </Grid2>
            </CustomTabPanel>

            <CustomTabPanel value={activeTab} index={1}>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, lg: 5 }}>
                  <PerformanceBarChart
                    data={prixerPerformance}
                    metric={metric}
                    loading={isRefetching}
                    title={`Top 10 Prixers por ${
                      metric === "sales" ? "Ingresos" : "Unidades"
                    }`}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, lg: 7 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Rendimiento por Prixer
                    </Typography>
                    <ToggleButtonGroup
                      value={metric}
                      exclusive
                      onChange={handleMetricChange}
                      size="small"
                    >
                      <ToggleButton value="sales">Ventas ($)</ToggleButton>
                      <ToggleButton value="units">Unidades</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <PerformanceTable
                    data={prixerPerformance}
                    metric={metric}
                    loading={isRefetching}
                  />
                </Grid2>
              </Grid2>
            </CustomTabPanel>

            <CustomTabPanel value={activeTab} index={2}>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, lg: 5 }}>
                  <PerformanceBarChart
                    data={productPerformance}
                    metric={metric}
                    loading={isRefetching}
                    title={`Top 10 Productos por ${
                      metric === "sales" ? "Ingresos" : "Unidades"
                    }`}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, lg: 7 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Rendimiento por Producto
                    </Typography>
                    <ToggleButtonGroup
                      value={metric}
                      exclusive
                      onChange={handleMetricChange}
                      size="small"
                    >
                      <ToggleButton value="sales">Ventas ($)</ToggleButton>
                      <ToggleButton value="units">Unidades</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <PerformanceTable
                    data={productPerformance}
                    metric={metric}
                    loading={isRefetching}
                    isProduct
                  />
                </Grid2>
              </Grid2>
            </CustomTabPanel>

            <CustomTabPanel value={activeTab} index={3}>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12 }}>
                  <GeoChart orders={allOrders} loading={isRefetching} />
                </Grid2>
              </Grid2>
            </CustomTabPanel>

            <CustomTabPanel value={activeTab} index={4}>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12 }}>
                  <PaymentMethodChart orders={allOrders} loading={isRefetching} />
                </Grid2>
              </Grid2>
            </CustomTabPanel>

            <CustomTabPanel value={activeTab} index={5}>
              <Typography variant="h6" mb={2}>
                Órdenes Pendientes de Pago
              </Typography>
              <FilteredOrdersList
                orders={pendingPaymentOrders}
                loading={isRefetching}
                onViewOrder={handleViewOrder}
                emptyMessage="No hay órdenes pendientes de pago."
              />
            </CustomTabPanel>

            <CustomTabPanel value={activeTab} index={6}>
              <Grid2 container spacing={3}>
                <Grid2 size={{ xs: 12, lg: 5 }}>
                  <OrderStatusPieChart
                    orders={activeOrders}
                    loading={isRefetching}
                    title="Distribución de Órdenes Activas"
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, lg: 7 }}>
                  <Typography variant="h6" mb={2}>
                    Lista de Órdenes Activas
                  </Typography>
                  <FilteredOrdersList
                    orders={activeOrders}
                    loading={isRefetching}
                    onViewOrder={handleViewOrder}
                    emptyMessage="No hay órdenes activas en este momento."
                  />
                </Grid2>
              </Grid2>
            </CustomTabPanel>
          </Paper>
        </>
      )}
    </Container>
  );
};

export default SellerDashboard;
