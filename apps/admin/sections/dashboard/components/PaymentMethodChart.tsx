//--- File: src/apps/admin/sections/dashboard/components/PaymentMethodChart.tsx ---
import React, { useMemo } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Order } from "types/order.types";
import EmptyState from "./EmptyState";
import PaymentIcon from "@mui/icons-material/Payment";

interface PaymentMethodChartProps {
  orders: Order[];
  loading: boolean;
}

const COLORS = [
  "#003f5c",
  "#58508d",
  "#bc5090",
  "#ff6361",
  "#ffa600",
  "#0077b6",
  "#00b4d8",
];

export const PaymentMethodChart: React.FC<PaymentMethodChartProps> = ({
  orders,
  loading,
}) => {
  const chartData = useMemo(() => {
    if (!orders) return [];
    const methodCounts: Record<string, number> = {};

    orders.forEach((order) => {
      const methodName = order.payment?.payment?.[0]?.method?.name;
      if (methodName) {
        methodCounts[methodName] = (methodCounts[methodName] || 0) + 1;
      }
    });

    return Object.entries(methodCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [orders]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Métodos de Pago
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
      ) : chartData.length === 0 ? (
        <EmptyState
          icon={PaymentIcon}
          title="Sin Datos de Pago"
          message="No se utilizaron métodos de pago en el período seleccionado."
        />
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
                innerRadius={80}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={5}
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} órdenes`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Box>
  );
};
