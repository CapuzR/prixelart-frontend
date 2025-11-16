import React from "react";
import {
  Typography,
  Box,
  Button,
  Chip,
  Stack,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Order, OrderStatus } from "@prixpon/types/order.types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { getSpanishOrderStatus } from "@apps/admin/utils/translations";
import EmptyState from "./EmptyState";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import VisibilityIcon from "@mui/icons-material/Visibility";

interface FilteredOrdersListProps {
  orders: Order[];
  loading?: boolean;
  onViewOrder: (orderId: string, openInNewTab: boolean) => void;
  onViewAll: () => void;
  emptyMessage: string;
}

const FilteredOrdersList: React.FC<FilteredOrdersListProps> = ({
  orders,
  loading,
  onViewOrder,
  onViewAll,
  emptyMessage,
}) => {
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1,
            minHeight: 300,
          }}
        >
          <p>Cargando...</p>
        </Box>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCartIcon}
          title="Sin Órdenes"
          message={emptyMessage}
        />
      ) : (
        <Stack
          spacing={1.5}
          sx={{ flexGrow: 1, overflowY: "auto", maxHeight: 400 }}
        >
          {orders.slice(0, 5).map((order) => {
            const latestStatus = order.status?.[order.status.length - 1]?.[0];
            const customer = order.consumerDetails?.basic;
            const customerName = customer
              ? `${customer.name} ${customer.lastName}`.trim()
              : "N/A";

            return (
              <Card key={order._id?.toString()} variant="outlined">
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight="bold">
                        #{order.number || order._id?.toString().slice(-6)} -{" "}
                        {customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {`Hace ${formatDistanceToNow(new Date(order.createdOn), { locale: es })}`}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        ${(order.total || 0).toFixed(2)}
                      </Typography>
                      <Tooltip title="Ver Orden en nueva pestaña">
                        <IconButton
                          size="small"
                          onClick={() =>
                            onViewOrder(order._id!.toString(), true)
                          }
                          sx={{ ml: 1 }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box>
                    {latestStatus !== undefined && (
                      <Chip
                        label={getSpanishOrderStatus(latestStatus)}
                        size="small"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
      {orders.length > 5 && (
        <Button
          size="small"
          sx={{ mt: 2, alignSelf: "center" }}
          onClick={onViewAll}
        >
          Ver todas las {orders.length} órdenes
        </Button>
      )}
    </Box>
  );
};

export default FilteredOrdersList;
