import React, { useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  FunnelChart,
  Funnel,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from "recharts";
import { getSpanishOrderStatus } from "@apps/admin/utils/translations";
import { OrderStatus } from "types/order.types";
import EmptyState from "./EmptyState";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

interface OrderStatusFunnelChartProps {
  statusCounts: Record<string, number>;
  loading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: "#FFBB28",
  Impression: "#00C49F",
  Production: "#0088FE",
  ReadyToShip: "#AA00FF",
  Delivered: "#4CAF50",
  Finished: "#4CAF50", // Same as delivered for positive outcome
  Paused: "#FF8042",
  Canceled: "#F44336",
  Desconocido: "#BDBDBD",
};

const ORDERED_STATUSES = [
  OrderStatus.Pending,
  OrderStatus.Production,
  OrderStatus.ReadyToShip,
  OrderStatus.Delivered,
  OrderStatus.Finished,
];

export const OrderStatusFunnelChart: React.FC<OrderStatusFunnelChartProps> = ({
  statusCounts,
  loading,
}) => {
  const funnelData = useMemo(() => {
    if (!statusCounts) return [];

    const data = ORDERED_STATUSES.map((statusEnum) => {
      const statusName = OrderStatus[statusEnum];
      return {
        value: statusCounts[statusName] || 0,
        name: getSpanishOrderStatus(statusEnum),
        fill: STATUS_COLORS[statusName],
      };
    }).filter((item) => item.value > 0); // Only show stages with orders

    return data;
  }, [statusCounts]);

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      ) : funnelData.length === 0 ? (
        <EmptyState
          icon={AccountTreeIcon}
          title="Sin Flujo de Órdenes"
          message="No hay órdenes en progreso para mostrar en el embudo."
        />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip />
            <Funnel dataKey="value" data={funnelData} isAnimationActive>
              <LabelList
                position="right"
                fill="#000"
                stroke="none"
                dataKey="name"
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};
