import React, { useMemo, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Order } from "types/order.types";
import { format, eachDayOfInterval, parseISO } from "date-fns";

interface SalesTrendChartProps {
  orders: Order[];
  loading: boolean;
  startDate: Date;
  endDate: Date;
}

const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  orders,
  loading,
  startDate,
  endDate,
}) => {
  const theme = useTheme();
  const [metric, setMetric] = useState<"sales" | "units">("sales");

  const handleMetricChange = (
    _: React.MouseEvent<HTMLElement>,
    newMetric: "sales" | "units" | null,
  ) => {
    if (newMetric) setMetric(newMetric);
  };

  const chartData = useMemo(() => {
    const dailyData: Record<string, { sales: number; units: number }> = {};

    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    dateInterval.forEach((day) => {
      const formattedDate = format(day, "MMM d");
      dailyData[formattedDate] = { sales: 0, units: 0 };
    });

    orders.forEach((order) => {
      const orderDate = parseISO(order.createdOn.toString());
      const formattedDate = format(orderDate, "MMM d");
      if (dailyData[formattedDate]) {
        dailyData[formattedDate].sales += order.total || 0;
        dailyData[formattedDate].units += order.totalUnits || 0;
      }
    });

    return Object.entries(dailyData).map(([date, values]) => ({
      date,
      Ventas: values.sales,
      Unidades: values.units,
    }));
  }, [orders, startDate, endDate]);

  const dataKey = metric === "sales" ? "Ventas" : "Unidades";
  const stroke =
    metric === "sales"
      ? theme.palette.primary.main
      : theme.palette.secondary.main;
  const yAxisLabel = metric === "sales" ? "Ingresos ($)" : "Unidades Vendidas";

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, height: "100%" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight="bold">
          Tendencia de {yAxisLabel}
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
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1,
            height: 300,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                tickFormatter={(value) =>
                  metric === "sales" ? `$${(value / 1000).toFixed(0)}k` : value
                }
              />
              <Tooltip
                formatter={(value: number) =>
                  metric === "sales"
                    ? `$${value.toFixed(2)}`
                    : value.toLocaleString()
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={stroke}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};

export default SalesTrendChart;
