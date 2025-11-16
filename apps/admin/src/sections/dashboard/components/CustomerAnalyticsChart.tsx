import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  useTheme,
  Card,
  CardContent,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
} from "@mui/material";
import Grid2 from "@mui/material/Grid";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"; // Added Cell
import { CustomerAnalyticsData } from "@prixpon/api/order.api";
import EmptyState from "./EmptyState";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import RepeatIcon from "@mui/icons-material/Repeat";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssessmentIcon from "@mui/icons-material/Assessment";

interface CustomerAnalyticsChartProps {
  analyticsData: CustomerAnalyticsData | null;
  loading: boolean;
}

const KPICard = ({
  title,
  value,
  icon,
  prefix = "",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  prefix?: string;
}) => (
  <Box>
    <Typography variant="subtitle2" color="text.secondary">
      {title}
    </Typography>
    <Box display="flex" alignItems="center" gap={1} mt={0.5}>
      {icon}
      <Typography variant="h5" fontWeight="bold">
        {prefix}
        {value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </Typography>
    </Box>
  </Box>
);

export const CustomerAnalyticsChart: React.FC<CustomerAnalyticsChartProps> = ({
  analyticsData,
  loading,
}) => {
  const theme = useTheme();
  const [chartMetric, setChartMetric] = useState<"count" | "sales">("sales");

  const newAvg =
    (analyticsData?.newCustomers.count ?? 0) === 0
      ? 0
      : (analyticsData?.newCustomers.totalSales ?? 0) /
        analyticsData!.newCustomers.count;
  const returningAvg =
    (analyticsData?.returningCustomers.count ?? 0) === 0
      ? 0
      : (analyticsData?.returningCustomers.totalSales ?? 0) /
        analyticsData!.returningCustomers.count;

  const barChartData = useMemo(() => {
    if (!analyticsData) return [];
    if (chartMetric === "count") {
      return [
        { name: "Clientes Nuevos", Valor: analyticsData.newCustomers.count },
        {
          name: "Clientes Recurrentes",
          Valor: analyticsData.returningCustomers.count,
        },
      ];
    }
    return [
      { name: "Clientes Nuevos", Valor: analyticsData.newCustomers.totalSales },
      {
        name: "Clientes Recurrentes",
        Valor: analyticsData.returningCustomers.totalSales,
      },
    ];
  }, [analyticsData, chartMetric]);

  const handleMetricChange = (
    _: React.MouseEvent<HTMLElement>,
    newMetric: "count" | "sales" | null,
  ) => {
    if (newMetric) setChartMetric(newMetric);
  };

  return (
    <Box sx={{ width: "100%" }}>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      ) : !analyticsData ||
        (analyticsData.newCustomers.count === 0 &&
          analyticsData.returningCustomers.count === 0) ? (
        <EmptyState
          icon={PeopleIcon}
          title="Sin Datos de Clientes"
          message="No hay suficientes datos para analizar el comportamiento de clientes."
        />
      ) : (
        <Grid2 container spacing={2}>
          {/* KPI Cards */}
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Clientes Nuevos
                </Typography>
                <Stack spacing={2} mt={2}>
                  <KPICard
                    title="Total de Clientes"
                    value={analyticsData.newCustomers.count}
                    icon={<PersonAddIcon color="primary" />}
                  />
                  <KPICard
                    title="Ingresos Totales"
                    value={analyticsData.newCustomers.totalSales}
                    icon={<MonetizationOnIcon color="action" />}
                    prefix="$"
                  />
                  <KPICard
                    title="Valor Promedio"
                    value={newAvg}
                    icon={<AssessmentIcon color="action" />}
                    prefix="$"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid2>
          <Grid2 size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Clientes Recurrentes
                </Typography>
                <Stack spacing={2} mt={2}>
                  <KPICard
                    title="Total de Clientes"
                    value={analyticsData.returningCustomers.count}
                    icon={<RepeatIcon color="secondary" />}
                  />
                  <KPICard
                    title="Ingresos Totales"
                    value={analyticsData.returningCustomers.totalSales}
                    icon={<MonetizationOnIcon color="action" />}
                    prefix="$"
                  />
                  <KPICard
                    title="Valor Promedio"
                    value={returningAvg}
                    icon={<AssessmentIcon color="action" />}
                    prefix="$"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid2>

          {/* Bar Chart */}
          <Grid2 size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">Comparación Visual</Typography>
              <ToggleButtonGroup
                value={chartMetric}
                exclusive
                onChange={handleMetricChange}
                size="small"
              >
                <ToggleButton value="sales">Ingresos</ToggleButton>
                <ToggleButton value="count">Clientes</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ height: 250, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  layout="vertical"
                  margin={{ left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickFormatter={(value) =>
                      chartMetric === "sales"
                        ? `$${(value / 1000).toFixed(0)}k`
                        : value.toString()
                    }
                  />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip
                    cursor={{ fill: theme.palette.action.hover }}
                    formatter={(value: number) =>
                      chartMetric === "sales"
                        ? `$${value.toFixed(2)}`
                        : value.toLocaleString()
                    }
                  />
                  <Bar dataKey="Valor" barSize={35}>
                    {barChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          index === 0
                            ? theme.palette.primary.main
                            : theme.palette.secondary.main
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid2>
        </Grid2>
      )}
    </Box>
  );
};

export default CustomerAnalyticsChart;
