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
import { Order, GlobalPaymentStatus } from "types/order.types";
import EmptyState from "./EmptyState";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

interface PaymentStatusPieChartProps {
  orders: Order[];
  loading: boolean;
  title: string;
}

const getSpanishPaymentStatus = (status: GlobalPaymentStatus | undefined) => {
  if (status === undefined) return "Desconocido";
  switch (status) {
    case GlobalPaymentStatus.Pending:
      return "Pendiente";
    case GlobalPaymentStatus.Paid:
      return "Pagado";
    case GlobalPaymentStatus.Credited:
      return "Abonado";
    case GlobalPaymentStatus.Cancelled:
      return "Cancelado";
    default:
      return "Desconocido";
  }
};

const STATUS_COLORS: Record<string, string> = {
  Pending: "#FFBB28", // Orange
  Paid: "#4CAF50", // Green
  Credited: "#2196F3", // Blue
  Cancelled: "#F44336", // Red
  Desconocido: "#BDBDBD", // Grey
};

export const PaymentStatusPieChart: React.FC<PaymentStatusPieChartProps> = ({
  orders,
  loading,
  title,
}) => {
  const chartData = useMemo(() => {
    if (!orders) return [];
    const statusCounts: Record<string, number> = {};

    orders.forEach((order) => {
      const latestStatusEnum =
        order.payment?.status?.[order.payment.status.length - 1]?.[0];
      if (latestStatusEnum !== undefined) {
        const statusKey =
          GlobalPaymentStatus[latestStatusEnum] || "Desconocido";
        statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
      }
    });

    return Object.entries(statusCounts).map(([englishKey, value]) => ({
      englishKey: englishKey,
      name: getSpanishPaymentStatus(
        GlobalPaymentStatus[englishKey as keyof typeof GlobalPaymentStatus],
      ),
      value: value,
    }));
  }, [orders]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
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
      ) : chartData.length === 0 ? (
        <EmptyState
          icon={MonetizationOnIcon}
          title="Sin Datos de Pago"
          message="No hay órdenes con estado de pago en el período seleccionado."
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
    </Box>
  );
};
