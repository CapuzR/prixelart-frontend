import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Icon,
  Link as MuiLink,
  ListItemIcon,
} from "@mui/material";
import Grid2 from "@mui/material/Grid";
import {
  CalendarToday,
  PersonOutline,
  MailOutline,
  PhoneOutlined,
  HomeOutlined,
  LocalShippingOutlined,
  ReceiptOutlined,
  StorefrontOutlined,
  InfoOutlined,
  ArrowBack,
  PaletteOutlined,
  CollectionsOutlined,
} from "@mui/icons-material";
import {
  BasicAddress,
  CustomImage,
  Order,
  OrderLine,
  OrderStatus,
} from "@prixpon/types/order.types";
import {
  getCurrentOrderStatus,
  getOrderStatusIcon,
  getOrderStatusLabel,
} from "./utils";
import { getOrderById } from "@prixpon/api-client/order.api";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@mui/lab";
import { VariantAttribute } from "@prixpon/types/product.types";
import { PickedArt } from "@prixpon/types/art.types";

const OrderDetailsPage: React.FC = () => {
  const { id: orderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      setLoading(true);
      setError(null);
      setOrder(null);
      getOrderById(orderId)
        .then((data) => {
          setOrder(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(
            err.message ||
              "Ocurrió un error al cargar los detalles de la orden.",
          );
          setLoading(false);
        });
    } else {
      navigate("/track");
    }
  }, [orderId, navigate]);

  const formatDate = (
    date: Date | string | undefined,
    includeTime: boolean = true,
  ): string => {
    if (!date) return "N/A";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    if (includeTime) {
      options.hour = "2-digit";
      options.minute = "2-digit";
    }
    return new Date(date).toLocaleDateString("es-ES", options);
  };

  const formatAddress = (addr: BasicAddress | undefined): string => {
    if (!addr) return "N/A";
    return `${addr.line1}${addr.line2 ? `, ${addr.line2}` : ""}, ${addr.city}, ${addr.state} ${addr.zipCode || ""}, ${addr.country}`;
  };

  const getOverallOrderStatus = (orderLines: OrderLine[]): OrderStatus => {
    if (!orderLines || orderLines.length === 0) return OrderStatus.Paused;

    const statuses = orderLines.map(
      (line) => getCurrentOrderStatus(line.status)?.[0],
    );

    if (statuses.every((s) => s === OrderStatus.Finished))
      return OrderStatus.Finished;
    if (statuses.every((s) => s === OrderStatus.Delivered))
      return OrderStatus.Delivered;
    if (statuses.every((s) => s === OrderStatus.Canceled))
      return OrderStatus.Canceled;
    // Check for statuses in reverse order of progression
    if (statuses.some((s) => s === OrderStatus.ReadyToShip))
      return OrderStatus.ReadyToShip;
    if (statuses.some((s) => s === OrderStatus.Production))
      return OrderStatus.Production;
    if (statuses.some((s) => s === OrderStatus.Impression))
      return OrderStatus.Impression;
    if (statuses.some((s) => s === OrderStatus.Paused))
      return OrderStatus.Paused;
    return OrderStatus.Pending; // Default status
  };

  const overallStatus = order
    ? getOverallOrderStatus(order.lines)
    : OrderStatus.Paused;

  const renderInfoItem = (
    icon: React.ReactNode,
    primary: string,
    secondary: string | React.ReactNode | undefined,
  ) =>
    secondary ? (
      <ListItem sx={{ py: 0.5 }}>
        <ListItemIcon sx={{ minWidth: "40px" }}>{icon}</ListItemIcon>
        <ListItemText
          primary={primary}
          secondary={secondary}
          primaryTypographyProps={{ variant: "body2", fontWeight: "medium" }}
          secondaryTypographyProps={{
            variant: "body2",
            color: "text.secondary",
          }}
        />
      </ListItem>
    ) : null;

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 3, color: "text.secondary" }}>
          Cargando detalles de la orden...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: { xs: 2, md: 4 }, textAlign: "center" }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: "600px", margin: "auto" }}>
          <Alert
            severity="error"
            icon={<InfoOutlined sx={{ fontSize: "2rem" }} />}
            sx={{
              mb: 3,
              justifyContent: "center",
              "& .MuiAlert-message": { textAlign: "center" },
            }}
          >
            <Typography variant="h6" gutterBottom>
              No se pudo cargar la orden
            </Typography>
            {error}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate("/track")}
          >
            Volver a rastrear
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container sx={{ mt: 4, textAlign: "center" }}>
        <Alert severity="warning">
          No se encontró información para la orden ID: {orderId}.
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
          onClick={() => navigate("/track")}
        >
          Intentar con otro ID
        </Button>
      </Container>
    );
  }

  const renderVariantAttributes = (
    selection: VariantAttribute[] | undefined,
  ) => {
    if (!selection || selection.length === 0) {
      return null;
    }
    return (
      <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
        <PaletteOutlined
          fontSize="small"
          sx={{ mr: 0.5, color: "text.secondary" }}
        />
        <Typography variant="caption" color="textSecondary">
          Variante:{" "}
          {selection.map((attr) => `${attr.name} ${attr.value}`).join(", ")}
        </Typography>
      </Box>
    );
  };

  const renderArtDetails = (art: PickedArt | CustomImage | undefined) => {
    if (!art) {
      return null;
    }
    return (
      <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
        <CollectionsOutlined
          fontSize="small"
          sx={{ mr: 0.5, color: "text.secondary" }}
        />
        <Typography variant="caption" color="textSecondary">
          Arte: "{art.title}" por {art.prixerUsername}
        </Typography>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Button
        component={RouterLink}
        to="/track"
        startIcon={<ArrowBack />}
        sx={{ mb: 2 }}
      >
        Rastrear otra orden
      </Button>
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              gutterBottom
            >
              Orden #{order.number || orderId}
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <CalendarToday fontSize="small" sx={{ mr: 0.5 }} /> Realizada el:{" "}
              {formatDate(order.createdOn)}
            </Typography>
          </Box>
          <Chip
            icon={getOrderStatusIcon(overallStatus)}
            label={getOrderStatusLabel(overallStatus)}
            color={
              overallStatus === OrderStatus.Finished ||
              overallStatus === OrderStatus.Delivered
                ? "success"
                : overallStatus === OrderStatus.Canceled
                  ? "error"
                  : overallStatus === OrderStatus.Paused
                    ? "warning"
                    : overallStatus === OrderStatus.ReadyToShip
                      ? "primary"
                      : overallStatus === OrderStatus.Production ||
                          overallStatus === OrderStatus.Impression
                        ? "info"
                        : "default" // for Pending
            }
            sx={{
              fontSize: "1rem",
              py: 2.5,
              px: 1.5,
              borderRadius: "8px",
              fontWeight: "medium",
            }}
          />
        </Box>
        {order.shipping.estimatedDeliveryDate &&
          overallStatus !== OrderStatus.Delivered &&
          overallStatus !== OrderStatus.Canceled && (
            <Alert
              severity="info"
              icon={<LocalShippingOutlined />}
              sx={{ mb: 3, borderRadius: 2 }}
            >
              Fecha estimada de entrega:{" "}
              <strong>
                {formatDate(order.shipping.estimatedDeliveryDate, false)}
              </strong>
            </Alert>
          )}
      </Paper>

      <Grid2 container spacing={{ xs: 2, md: 4 }}>
        <Grid2 size={{ xs: 12, lg: 7 }}>
          <Typography
            variant="h5"
            fontWeight="medium"
            gutterBottom
            sx={{ mb: 2 }}
          >
            Artículos del Pedido
          </Typography>
          {order.lines.map((line) => {
            const currentLineStatusInfo = getCurrentOrderStatus(line.status);
            const currentLineStatus = currentLineStatusInfo
              ? currentLineStatusInfo[0]
              : OrderStatus.Pending;
            const currentLineStatusDate = currentLineStatusInfo
              ? currentLineStatusInfo[1]
              : new Date();

            return (
              <Card key={line.id} sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Grid2 container spacing={2} alignItems="center">
                    <Grid2
                      size={{ xs: 12, sm: 2 }}
                      sx={{ textAlign: "center" }}
                    >
                      <Avatar
                        variant="rounded"
                        src={
                          line.item.product.sources.images[0]?.url ||
                          "https://via.placeholder.com/80?text=Img"
                        }
                        alt={line.item.product.name}
                        sx={{
                          width: { xs: 60, sm: 80 },
                          height: { xs: 60, sm: 80 },
                          m: "auto",
                          borderRadius: 1.5,
                        }}
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                      <Typography
                        variant="h6"
                        component="div"
                        fontWeight="medium"
                        sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                      >
                        {line.item.product.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        SKU: {line.item.sku}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Cantidad: {line.quantity} x $
                        {parseFloat(line.item.price).toFixed(2)}
                      </Typography>
                      {/* Display Variant Attributes */}
                      {renderVariantAttributes(line.item.product.selection)}
                      {/* Display Art Details */}
                      {renderArtDetails(line.item.art)}
                    </Grid2>
                    <Grid2
                      size={{ xs: 12, sm: 4 }}
                      sx={{ textAlign: { xs: "left", sm: "right" } }}
                    >
                      <Chip
                        icon={getOrderStatusIcon(currentLineStatus)}
                        label={getOrderStatusLabel(currentLineStatus)}
                        size="small"
                        sx={{ mb: 1 }}
                        // CHANGE 2: Update Chip color logic
                        color={
                          currentLineStatus === OrderStatus.Finished ||
                          currentLineStatus === OrderStatus.Delivered
                            ? "success"
                            : currentLineStatus === OrderStatus.Canceled
                              ? "error"
                              : currentLineStatus === OrderStatus.Paused
                                ? "warning"
                                : currentLineStatus === OrderStatus.ReadyToShip
                                  ? "primary"
                                  : currentLineStatus ===
                                        OrderStatus.Production ||
                                      currentLineStatus ===
                                        OrderStatus.Impression
                                    ? "info"
                                    : "default" // for Pending
                        }
                      />
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        {formatDate(currentLineStatusDate)}
                      </Typography>
                    </Grid2>
                  </Grid2>
                  <Box sx={{ mt: 2.5, pl: { xs: 0, sm: 1 } }}>
                    <Timeline position="right" sx={{ p: 0 }}>
                      {line.status
                        .slice()
                        .sort(
                          (a, b) =>
                            new Date(a[1]).getTime() - new Date(b[1]).getTime(),
                        )
                        .map(([statusEnum, date], idx) => (
                          <TimelineItem
                            key={idx}
                            sx={{
                              minHeight: 56,
                              "&::before": { content: "none" },
                            }}
                          >
                            {" "}
                            {/* Adjusted TimelineItem for better alignment */}
                            <TimelineOppositeContent
                              sx={{ flex: 0.3, pr: 1, textAlign: "left" }}
                            >
                              {" "}
                              {/* Adjusted flex and padding */}
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(date, true)}{" "}
                                {/* Ensure time is included if needed */}
                              </Typography>
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                              <TimelineDot
                                variant="outlined"
                                color={
                                  statusEnum === OrderStatus.Finished ||
                                  statusEnum === OrderStatus.Delivered
                                    ? "success"
                                    : statusEnum === OrderStatus.Canceled
                                      ? "error"
                                      : statusEnum === OrderStatus.Paused
                                        ? "warning"
                                        : statusEnum === OrderStatus.ReadyToShip
                                          ? "primary"
                                          : statusEnum ===
                                                OrderStatus.Production ||
                                              statusEnum ===
                                                OrderStatus.Impression
                                            ? "info"
                                            : "grey" // for Pending
                                }
                              >
                                {getOrderStatusIcon(statusEnum)}
                              </TimelineDot>
                              {idx < line.status.length - 1 && (
                                <TimelineConnector />
                              )}
                            </TimelineSeparator>
                            <TimelineContent sx={{ pl: 2 }}>
                              {" "}
                              {/* Added padding to content */}
                              <Typography variant="body2">
                                {getOrderStatusLabel(statusEnum)}
                              </Typography>
                            </TimelineContent>
                          </TimelineItem>
                        ))}
                    </Timeline>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Grid2>

        <Grid2 size={{ xs: 12, lg: 5 }}>
          <Paper
            elevation={1}
            sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 3 }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
            >
              <ReceiptOutlined sx={{ mr: 1, color: "primary.main" }} /> Resumen
              del Pedido
            </Typography>
            <List dense disablePadding>
              {renderInfoItem(
                null,
                "Subtotal:",
                `$${order.subTotal.toFixed(2)}`,
              )}
              {order.discount
                ? renderInfoItem(
                    null,
                    "Descuento:",
                    <Typography color="success.main">
                      -${order.discount.toFixed(2)}
                    </Typography>,
                  )
                : null}
              {order.shippingCost
                ? renderInfoItem(
                    null,
                    "Costo de Envío:",
                    `$${order.shippingCost.toFixed(2)}`,
                  )
                : null}
              {order.tax.map((t) =>
                renderInfoItem(
                  null,
                  `${t.name} (${t.value}%):`,
                  `$${t.amount.toFixed(2)}`,
                ),
              )}
              <Divider sx={{ my: 1.5 }} />
              <ListItem sx={{ py: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  Total:
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  ${order.total.toFixed(2)}
                </Typography>
              </ListItem>
            </List>
          </Paper>

          {order.shipping && (
            <Paper
              elevation={1}
              sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 3 }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
              >
                <LocalShippingOutlined sx={{ mr: 1, color: "primary.main" }} />{" "}
                Detalles de Envío
              </Typography>
              <List dense disablePadding>
                {renderInfoItem(
                  <Icon component={LocalShippingOutlined} fontSize="small" />,
                  "Método:",
                  order.shipping.method.name,
                )}
                {renderInfoItem(
                  <HomeOutlined fontSize="small" />,
                  "Dirección:",
                  formatAddress(order.shipping.address.address),
                )}
                {order.shipping.address.recepient.name &&
                  renderInfoItem(
                    <PersonOutline fontSize="small" />,
                    "Recibe:",
                    `${order.shipping.address.recepient.name} ${order.shipping.address.recepient.lastName}`,
                  )}
                {order.shipping.address.recepient.phone &&
                  renderInfoItem(
                    <PhoneOutlined fontSize="small" />,
                    "Teléfono:",
                    order.shipping.address.recepient.phone,
                  )}
              </List>
            </Paper>
          )}

          {order.consumerDetails && (
            <Paper
              elevation={1}
              sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 3 }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
              >
                <PersonOutline sx={{ mr: 1, color: "primary.main" }} /> Detalles
                del Cliente
              </Typography>
              <List dense disablePadding>
                {renderInfoItem(
                  <PersonOutline fontSize="small" />,
                  "Nombre:",
                  `${order.consumerDetails.basic.name} ${order.consumerDetails.basic.lastName}`,
                )}
                {order.consumerDetails.basic.email &&
                  renderInfoItem(
                    <MailOutline fontSize="small" />,
                    "Email:",
                    <MuiLink
                      href={`mailto:${order.consumerDetails.basic.email}`}
                    >
                      {order.consumerDetails.basic.email}
                    </MuiLink>,
                  )}
                {order.consumerDetails.basic.phone &&
                  renderInfoItem(
                    <PhoneOutlined fontSize="small" />,
                    "Teléfono:",
                    <MuiLink href={`tel:${order.consumerDetails.basic.phone}`}>
                      {order.consumerDetails.basic.phone}
                    </MuiLink>,
                  )}
              </List>
            </Paper>
          )}
          {order.seller && (
            <Paper
              elevation={1}
              sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 3 }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
              >
                <StorefrontOutlined sx={{ mr: 1, color: "primary.main" }} />{" "}
                Información del Vendedor
              </Typography>
              <Typography variant="body2">{order.seller}</Typography>
            </Paper>
          )}
          {order.observations && (
            <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", mb: 1.5 }}
              >
                <InfoOutlined sx={{ mr: 1, color: "primary.main" }} />{" "}
                Observaciones
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ whiteSpace: "pre-wrap" }}
              >
                {order.observations}
              </Typography>
            </Paper>
          )}
        </Grid2>
      </Grid2>
    </Container>
  );
};

export default OrderDetailsPage;
