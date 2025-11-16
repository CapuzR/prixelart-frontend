import React, { useMemo } from "react";
import { Paper, Typography, Box, CircularProgress } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Order, OrderStatus } from "@prixpon/types/order.types";
import { getSpanishOrderStatus } from "../../../utils/translations";

interface OrderStatusPieChartProps {
  orders: Order[];
  loading: boolean;
  title: string;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "#FFBB28",
  Impression: "#00C49F",
  Production: "#0088FE",
  ReadyToShip: "#AA00FF",
  Delivered: "#4CAF50",
  Finished: "#4CAF50",
  Paused: "#FF8042",
  Canceled: "#F44336",
  Desconocido: "#BDBDBD",
};

export const OrderStatusPieChart: React.FC<OrderStatusPieChartProps> = ({
  orders,
  loading,
  title,
}) => {
  const chartData = useMemo(() => {
    if (!orders) return [];
    const statusCounts: Record<string, number> = {};

    orders.forEach((order) => {
      const latestStatusEnum = order.status?.[order.status.length - 1]?.[0];
      if (latestStatusEnum !== undefined) {
        const statusKey = OrderStatus[latestStatusEnum] || "Desconocido";
        statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
      }
    });

    return Object.entries(statusCounts).map(([englishKey, value]) => ({
      englishKey: englishKey, // e.g., "ReadyToShip"
      name: getSpanishOrderStatus(
        OrderStatus[englishKey as keyof typeof OrderStatus],
      ),
      value: value,
    }));
  }, [orders]);

  return (
    <Paper sx={{ p: 2, height: 400, display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                labelLine={false}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.englishKey] || "#8884d8"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} órdenes`,
                  name,
                ]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Paper>
  );
};
