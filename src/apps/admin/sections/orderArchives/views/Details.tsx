import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, CircularProgress, Alert, Button,
    Divider, Chip, Stack, Card, CardContent, CardMedia, Avatar,
    // MUI components for Dialog
    Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText,
    FormControl, InputLabel, Select, MenuItem, IconButton, SelectChangeEvent,
    Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NotesIcon from '@mui/icons-material/Notes';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LaunchIcon from '@mui/icons-material/Launch';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EditIcon from '@mui/icons-material/Edit'; // For the edit button
import Grid2 from '@mui/material/Grid';

// Import types and API
import {
    OrderArchive,
    Status as OrderStatus, // Renamed to avoid conflict with component Status
    PayStatus as OrderPayStatus, // Renamed to avoid conflict
    Request as OrderRequest,
    ArchiveProduct as OrderProduct,
    SelectionClass
    // ArchiveArt, // Already imported if needed by OrderItem
} from 'types/orderArchive.types';
import { getOrderArchiveById, updateOrderArchive } from '@api/orderArchive.api'; // Added updateOrderArchive

// Import Helpers & Reusable Components
import Title from '@apps/admin/components/Title';
import InfoItem from '../components/InfoItem';
import SectionCard from '../components/SectionCard';
import { formatCurrency, formatDate, getCustomerName, getPayStatusColor, getStatusColor } from '../helpers/orderArchiveHelpers';
import { useSnackBar } from 'context/GlobalContext'; // For notifications

// --- Constants for Modal (can be imported from a shared file if available) ---
// Using explicit OrderStatus and OrderPayStatus types for clarity
const ALL_ORDER_STATUSES_MODAL: OrderStatus[] = ["Anulado", "Concretado", "En producción", "Por entregar", "Entregado", "En impresión", "Por producir"];
const ALL_PAY_STATUSES_MODAL: OrderPayStatus[] = ["Pagado", "Anulado", "Obsequio", "Abonado", "Pendiente"];
const FINAL_ORDER_STATUSES_MODAL: OrderStatus[] = ["Concretado", "Entregado", "Anulado"];
const UPDATABLE_TARGET_ORDER_STATUSES_MODAL: OrderStatus[] = ALL_ORDER_STATUSES_MODAL.filter(s => !FINAL_ORDER_STATUSES_MODAL.includes(s) || s === "Concretado");


// --- Order Item Component (Keep as is) ---
interface OrderItemProps {
    request: OrderRequest;
}

const OrderItem: React.FC<OrderItemProps> = ({ request }) => {
    const { product, art, quantity } = request;

    const renderAttributes = (selection: OrderProduct['selection']) => {
        if (!selection) return null; // O un mensaje como "Sin selección específica"
    
        let attributesToDisplay: { name: string; value: string }[] = [];
    
        if (typeof selection === 'string') {
            attributesToDisplay.push({ name: "Selección", value: selection });
        }
        else if (Array.isArray(selection)) {
            const validStrings = selection.filter((s): s is string => typeof s === 'string');
            if (validStrings.length > 0) {
                attributesToDisplay.push({ name: "Valores", value: validStrings.join(', ') });
            }
        }
        else if (typeof selection === 'object' && selection !== null) {
            const selectionObject = selection as SelectionClass;
                if (selectionObject.name) {
                attributesToDisplay.push({ name: "Selección", value: selectionObject.name });
            }
            if (selectionObject.attributes && Array.isArray(selectionObject.attributes)) {
                selectionObject.attributes.forEach(attr => {
                    let attrName = "Atributo";
                    let attrValue = "";
    
                    // Lógica para extraer nombre y valor de 'attr' (SelectionAttribute)
                    // Esto es una suposición y necesitará ajustarse a tu estructura de SelectionAttribute
                    // if (attr.name && attr.value) {
                        attrName = attr.name;
                        attrValue = attr.value;
                    // } else if (attr?.name) {
                    //     attrName = attr.name;
                    //     if (attr.valueStr && attr.valueStr.length > 0) {
                    //         attrValue = attr.valueStr.join(', ');
                    //     } else if (attr.value && attr.value.length > 0) {
                    //         attrValue = attr.value.map(v => v.name).filter(Boolean).join(', ');
                    //     }
                    // }
                    // // Solo añadir si tenemos un valor
                    // if (attrValue) {
                    //    attributesToDisplay.push({ name: attrName, value: attrValue });
                    // }
                });
            }
        }
    
        if (attributesToDisplay.length === 0) {
            return <Typography variant="caption" color="text.secondary">Sin atributos específicos</Typography>;
        }
    
        return (
            <Box component="ul" sx={{ pl: 2, mt: 0.5, mb: 0, listStyle: 'disc' }}>
                {attributesToDisplay.map((attr, idx) => (
                    <Typography component="li" variant="caption" key={idx} sx={{ display: 'list-item' }}>
                        <strong>{attr.name}:</strong> {attr.value}
                    </Typography>
                ))}
            </Box>
        );
    };

    const imageUrl = art?.smallThumbUrl || art?.thumbnailUrl || art?.squareThumbUrl || product?.thumbUrl;
    const itemPriceStr = product?.finalPrice;
    const itemPriceNum = itemPriceStr !== undefined && itemPriceStr !== null ? Number(itemPriceStr) : undefined;
    const quantityNum = quantity !== undefined && quantity !== null ? Number(quantity) : 1;
    const lineSubtotal = (itemPriceNum !== undefined && !isNaN(itemPriceNum) && quantityNum !== undefined && !isNaN(quantityNum))
        ? itemPriceNum * quantityNum
        : undefined;
    const discountInfo = product?.discount;

    return (
        <Card variant="outlined" sx={{ display: 'flex', mb: 2, alignItems: 'center' }}>
            {imageUrl && (
                <CardMedia
                    component="img"
                    sx={{ width: 120, height: 120, objectFit: 'contain', p: 1, mr: 1, flexShrink: 0 }}
                    image={imageUrl}
                    alt={`${product?.name || 'Producto'} - ${art?.title || 'Arte'}`}
                />
            )}
            {!imageUrl && (
                <Avatar variant="square" sx={{ width: 80, height: 80, bgcolor: 'grey.200', mr: 2, flexShrink: 0 }}>
                    <ShoppingCartIcon />
                </Avatar>
            )}
            <CardContent sx={{ flexGrow: 1, py: 1, '&:last-child': { pb: 1 } }}>
                <Typography variant="subtitle2" component="div" gutterBottom noWrap>
                    {product?.name || 'Producto Desconocido'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                    {art?.title || 'Arte no especificada'}
                </Typography>
                {renderAttributes(product?.selection)}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {product?.id && `Prod ID: ${product.id}`}
                    {product?.id && art?.artId && ' / '}
                    {art?.artId && `Art ID: ${art.artId}`}
                </Typography>
                {discountInfo && (
                    <Chip
                        icon={<LocalOfferIcon fontSize="small" />}
                        label={`Descuento: ${discountInfo}`}
                        size="small"
                        variant="outlined"
                        color="success"
                        sx={{ mt: 0.5, height: 'auto', '& .MuiChip-label': { display: 'block', whiteSpace: 'normal' } }}
                    />
                )}
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" component="span">
                        Cantidad: <strong>{String(quantity ?? 1)}</strong>
                    </Typography>
                    {itemPriceNum !== undefined && !isNaN(itemPriceNum) && (
                        <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                            {' @ '} {formatCurrency(itemPriceNum)}
                        </Typography>
                    )}
                </Box>
                {lineSubtotal !== undefined && !isNaN(lineSubtotal) && (
                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 'bold' }}>
                        Subtotal Item: {formatCurrency(lineSubtotal)}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

// --- Main Detail Component ---
const OrderArchiveDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showSnackBar } = useSnackBar(); // For notifications

    const [orderData, setOrderData] = useState<OrderArchive | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- Modal State ---
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
    const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
    const [newPayStatus, setNewPayStatus] = useState<OrderPayStatus | ''>('');
    const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

    useEffect(() => {
        if (!id) {
            setError("No se proporcionó ID de orden.");
            setIsLoading(false);
            return;
        }

        const fetchOrder = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getOrderArchiveById(id);
                if (data) {
                    setOrderData(data);
                } else {
                    setError(`Orden con ID ${id} no encontrada.`);
                }
            } catch (err: any) {
                setError(err.message || "Error al cargar los detalles de la orden.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    // --- Modal Handlers ---
    const handleOpenUpdateModal = () => {
        if (!orderData) return;
        setNewStatus(''); // Reset to empty, or prefill with orderData.status if you want it selected by default
        setNewPayStatus(''); // Reset to empty, or prefill with orderData.payStatus
        setIsUpdateModalOpen(true);
    };

    const handleCloseUpdateModal = () => {
        setIsUpdateModalOpen(false);
        setNewStatus('');
        setNewPayStatus('');
        setIsUpdatingStatus(false);
    };

    const handleStatusChangeInModal = (event: SelectChangeEvent<OrderStatus>) => {
        setNewStatus(event.target.value as OrderStatus);
    };

    const handlePayStatusChangeInModal = (event: SelectChangeEvent<OrderPayStatus>) => {
        setNewPayStatus(event.target.value as OrderPayStatus);
    };

    const handleConfirmUpdateStatus = async () => {
        if (!orderData?._id) {
            showSnackBar("Error: Datos de la orden no disponibles.");
            return;
        }

        const statusChanged = newStatus && newStatus !== orderData.status;
        const payStatusChanged = newPayStatus && newPayStatus !== orderData.payStatus;

        if (!statusChanged && !payStatusChanged) {
            showSnackBar("Por favor seleccione un estado o estado de pago diferente al actual.");
            return;
        }

        const orderId = orderData._id.toString();
        setIsUpdatingStatus(true);

        const payload: { status?: OrderStatus; payStatus?: OrderPayStatus } = {};
        if (statusChanged && newStatus) payload.status = newStatus;
        if (payStatusChanged && newPayStatus) payload.payStatus = newPayStatus;

        try {
            const updatedOrderData = await updateOrderArchive(orderId, payload);
            setOrderData(updatedOrderData); // Update local state with the new order data

            let updateMessage = `Orden ${orderData.orderId} actualizada:`;
            const updates = [];
            if (statusChanged && newStatus) updates.push(`Status a "${newStatus}"`);
            if (payStatusChanged && newPayStatus) updates.push(`Status de Pago a "${newPayStatus}"`);
            updateMessage += " " + updates.join(", ") + ".";

            showSnackBar(updateMessage);
            handleCloseUpdateModal();
        } catch (err: any) {
            console.error("Error updating order:", err);
            const message = err.message || "Error al actualizar.";
            showSnackBar(`Error al actualizar orden: ${message}`);
        } finally {
            setIsUpdatingStatus(false);
        }
    };


    if (isLoading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/orderArchives/read')} sx={{ mb: 2 }}>
                    Volver
                </Button>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!orderData) {
        return (
            <Box sx={{ p: 2 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/orderArchives/read')} sx={{ mb: 2 }}>
                    Volver
                </Button>
                <Alert severity="warning">No se encontraron datos para esta orden.</Alert>
            </Box>
        );
    }

    const createdByString = typeof orderData.createdBy === 'string'
        ? orderData.createdBy
        : `${orderData.createdBy?.firstname || ''} ${orderData.createdBy?.lastname || ''} (${orderData.createdBy?.username || 'Admin'})`.trim();

    const shippingMethodName = typeof orderData.shippingData.shippingMethod === 'string'
        ? orderData.shippingData.shippingMethod
        : orderData.shippingData.shippingMethod?.name ?? 'N/A';

    const canUpdateOrderStatus = orderData ? !FINAL_ORDER_STATUSES_MODAL.includes(orderData.status) || orderData.status === "Concretado" : false;

    console.log(orderData)

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Title title={`Detalle Orden: ${orderData.orderId}`} />
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/orderArchives/read')}>
                    Volver a Órdenes
                </Button>
            </Stack>

            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Grid2 container spacing={2} alignItems="center">
                    <Grid2 size={{ xs: 12, sm: 6, md: 3.5 }}>
                        <Chip
                            label={`Status: ${orderData.status || 'N/A'}`}
                            color={getStatusColor(orderData.status)}
                            size="medium"
                            sx={{ fontWeight: 'bold', width: '100%' }}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6, md: 3.5 }}>
                        <Chip
                            label={`Pago: ${orderData.payStatus || 'N/A'}`}
                            color={getPayStatusColor(orderData.payStatus)}
                            size="medium"
                            sx={{ fontWeight: 'bold', width: '100%' }}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 1 }} textAlign="center">
                        <Tooltip title="Actualizar Status de Orden y/o Pago">
                            <IconButton onClick={handleOpenUpdateModal} color="primary" disabled={isLoading}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 4 }}>
                        <Typography variant="body2" color="text.secondary" textAlign={{ xs: 'left', md: 'right' }}>
                            Tipo: {orderData.orderType}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign={{ xs: 'left', md: 'right' }}>
                            Creada: {formatDate(orderData.createdOn)}
                        </Typography>
                        {orderData.completionDate && (
                            <Typography variant="body2" color="text.secondary" textAlign={{ xs: 'left', md: 'right' }}>
                                Completada: {formatDate(orderData.completionDate)}
                            </Typography>
                        )}
                        {orderData.payDate && (
                            <Typography variant="body2" color="text.secondary" textAlign={{ xs: 'left', md: 'right' }}>
                                Pagada: {formatDate(orderData.payDate)}
                            </Typography>
                        )}
                    </Grid2>
                </Grid2>
            </Paper>

            <Grid2 container spacing={3}>
                {/* --- Left Column --- */}
                <Grid2 size={{ xs: 12, md: 6 }}>
                    <SectionCard title="Cliente" action={<PersonIcon color="action" />}>
                        <InfoItem label="Nombre" value={getCustomerName(orderData)} />
                        <InfoItem label="Email" value={orderData.basicData?.email} />
                        <InfoItem label="Teléfono" value={orderData.basicData?.phone} />
                        <InfoItem label="CI/RIF" value={orderData.basicData?.ci} />
                        <InfoItem label="Dirección (Base)" value={orderData.basicData?.address} display={{ xs: 'none', sm: 'block' }} />
                        {orderData.consumerData && (
                            <>
                                <Divider sx={{ my: 1.5 }} />
                                <InfoItem label="ID Consumidor" value={orderData.consumerData.consumerId} />
                                <InfoItem label="Tipo Consumidor" value={orderData.consumerData.consumerType} />
                            </>
                        )}
                    </SectionCard>

                    <SectionCard title="Envío" action={<LocalShippingIcon color="action" />}>
                        <InfoItem label="Método" value={shippingMethodName} />
                        <InfoItem label="Recibe" value={`${orderData.shippingData.shippingName || orderData.shippingData.name || ''} ${orderData.shippingData.shippingLastName || orderData.shippingData.lastname || ''}`.trim() || undefined} />
                        <InfoItem label="Teléfono (Envío)" value={orderData.shippingData.shippingPhone || orderData.shippingData.phone} />
                        <InfoItem label="Dirección" value={orderData.shippingData.shippingAddress || orderData.shippingData.address} />
                        <InfoItem label="Ciudad/País" value={[orderData.shippingData.city, orderData.shippingData.country].filter(Boolean).join(', ')} />
                        <InfoItem label="Código Postal" value={orderData.shippingData.zip} />
                    </SectionCard>
                </Grid2>

                {/* --- Right Column --- */}
                <Grid2 size={{ xs: 12, md: 6 }}>
                    <SectionCard title="Facturación y Pago" action={<ReceiptIcon color="action" />}>
                        {orderData.billingData ? (
                            <>
                                <InfoItem label="Facturar a" value={`${orderData.billingData.name || ''} ${orderData.billingData.lastname || ''}`.trim() || getCustomerName(orderData)} />
                                <InfoItem label="CI/RIF (Fact.)" value={orderData.billingData.ci} />
                                <InfoItem label="Empresa (Fact.)" value={orderData.billingData.billingCompany || orderData.billingData.company} />
                                <InfoItem label="Teléfono (Fact.)" value={orderData.billingData.phone} />
                                <InfoItem label="Dirección (Fact.)" value={orderData.billingData.address} />
                                <Divider sx={{ my: 1.5 }} />
                                <InfoItem label="Método de Pago" value={orderData.billingData.orderPaymentMethod} valueTypographyProps={{ fontWeight: 'bold' }} />
                            </>
                        ) : (
                            <Typography variant="body2" color="text.secondary">Sin datos de facturación específicos.</Typography>
                        )}
                        {orderData.paymentVoucher && (
                            <Box sx={{ mt: 1.5 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>Comprobante Pago:</Typography>
                                {isValidHttpUrl(orderData.paymentVoucher) ? (
                                    <Button variant="outlined" size="small" href={orderData.paymentVoucher} target="_blank" rel="noopener noreferrer" startIcon={<LaunchIcon />} sx={{ textTransform: 'none', maxWidth: '100%' }}>
                                        <Typography variant="body2" component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Ver Comprobante (URL)</Typography>
                                    </Button>
                                ) : (
                                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{orderData.paymentVoucher}</Typography>
                                )}
                            </Box>
                        )}
                        {orderData.dollarValue && (
                            <Box sx={{ mt: 1.5 }}>
                                <InfoItem label="Valor Dólar (Referencia)" value={'Bs ' + orderData.dollarValue} />
                            </Box>
                        )}
                    </SectionCard>

                    <SectionCard title="Resumen Financiero" action={<AttachMoneyIcon color="action" />}>
                        <InfoItem label="Subtotal" value={formatCurrency(orderData.subtotal)} />
                        <InfoItem label="Impuesto (IVA)" value={formatCurrency(orderData.tax)} />
                        <InfoItem label="Costo Envío" value={formatCurrency(orderData.shippingCost ?? 0)} />
                        <Divider sx={{ my: 1 }} />
                        <InfoItem label="Total Orden" value={formatCurrency(orderData.total)} valueTypographyProps={{ variant: 'h6', fontWeight: 'bold', color: 'primary.main' }} />
                    </SectionCard>

                    <SectionCard title="Información Adicional" action={<NotesIcon color="action" />}>
                        <InfoItem label="Observaciones" value={orderData.observations} valueTypographyProps={{ whiteSpace: 'pre-wrap' }} />
                        <InfoItem label="Creado Por" value={createdByString} />
                        {orderData.comissions && orderData.comissions.length > 0 && (
                            <InfoItem label="Comisiones" value={`(${orderData.comissions.length}) Registradas`} valueTypographyProps={{ fontStyle: 'italic' }} />
                        )}
                    </SectionCard>
                </Grid2>

                {/* --- Order Items Section (Full Width) --- */}
                <Grid2 size={{ xs: 12 }}>
                    <SectionCard title={`Items (${orderData.requests.length})`} action={<ShoppingCartIcon color="action" />}>
                        {orderData.requests.length > 0 ? (
                            orderData.requests.map((req, index) => (
                                <OrderItem key={index} request={req} />
                            ))
                        ) : (
                            <Typography>No hay items en esta orden.</Typography>
                        )}
                    </SectionCard>
                </Grid2>
            </Grid2 >

            {/* --- Update Status Modal --- */}
            {orderData && ( // Ensure orderData is available before rendering Dialog
                <Dialog open={isUpdateModalOpen} onClose={handleCloseUpdateModal} aria-labelledby="update-status-dialog-title" fullWidth maxWidth="xs">
                    <DialogTitle id="update-status-dialog-title">Actualizar Estado de la Orden</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            Orden ID: <strong>{orderData.orderId}</strong> <br />
                            Status Actual: <Chip label={orderData.status} color={getStatusColor(orderData.status)} size="small" /> <br />
                            Status Pago Actual: <Chip label={orderData.payStatus || 'N/A'} color={getPayStatusColor(orderData.payStatus)} size="small" />
                        </DialogContentText>

                        <FormControl fullWidth margin="normal" disabled={isUpdatingStatus}>
                            <InputLabel id="new-status-select-label">Nuevo Status Orden</InputLabel>
                            <Select
                                labelId="new-status-select-label"
                                id="new-status-select"
                                value={newStatus}
                                label="Nuevo Status Orden"
                                onChange={handleStatusChangeInModal}
                            >
                                {UPDATABLE_TARGET_ORDER_STATUSES_MODAL
                                    .filter(s => s !== orderData.status)
                                    .map(statusOption => (
                                        <MenuItem key={statusOption} value={statusOption}>{statusOption}</MenuItem>
                                    ))}
                            </Select>
                            {!canUpdateOrderStatus && (
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                    El status de la orden no se puede cambiar desde '{orderData.status}'.
                                </Typography>
                            )}
                        </FormControl>

                        <FormControl fullWidth margin="normal" disabled={isUpdatingStatus}>
                            <InputLabel id="new-pay-status-select-label">Nuevo Status Pago</InputLabel>
                            <Select
                                labelId="new-pay-status-select-label"
                                id="new-pay-status-select"
                                value={newPayStatus}
                                label="Nuevo Status Pago"
                                onChange={handlePayStatusChangeInModal}
                            >
                                {ALL_PAY_STATUSES_MODAL
                                    .filter(ps => ps !== orderData.payStatus)
                                    .map(payStatusOption => (
                                        <MenuItem key={payStatusOption} value={payStatusOption}>{payStatusOption}</MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseUpdateModal} color="inherit" disabled={isUpdatingStatus}>Cancelar</Button>
                        <Button
                            onClick={handleConfirmUpdateStatus}
                            color="primary"
                            variant="contained"
                            disabled={
                                isUpdatingStatus ||
                                ((!newStatus || newStatus === orderData.status) &&
                                    (!newPayStatus || newPayStatus === orderData.payStatus))
                            }
                        >
                            {isUpdatingStatus ? <CircularProgress size={24} color="inherit" /> : "Actualizar"}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box >
    );
};

export default OrderArchiveDetail;

// Helper to check if voucher string is a URL
function isValidHttpUrl(string?: string) {
    if (!string) return false;
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}