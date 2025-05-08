// src/apps/admin/sections/orders/views/CreateOrder.tsx
import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, SyntheticEvent, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid2 from '@mui/material/Grid';
import { v4 as uuidv4 } from 'uuid';

// Hooks, Types, Context, API
import { useSnackBar } from 'context/GlobalContext';
import { fetchShippingMethods, readAllPaymentMethods, createOrder } from '@api/order.api';
import { fetchActiveProducts } from '@api/product.api';
import { getArts } from '@api/art.api';

// MUI Components
import {
  Box, Typography, TextField, Button, Paper, CircularProgress, Alert, Stack,
  Divider, Select, SelectChangeEvent, MenuItem, InputLabel, FormControl, Avatar,
  Autocomplete, FormHelperText, FormControlLabel, Checkbox, Tooltip,
  Card, CardContent, CardHeader, IconButton, Chip, List, ListItem, ListItemIcon, ListItemText,
  Container
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import ReceiptOutlined from '@mui/icons-material/ReceiptOutlined';
import PersonOutline from '@mui/icons-material/PersonOutline';
import InfoOutlined from '@mui/icons-material/InfoOutlined';

import EditableAddressForm from './components/EditableAddressForm';
import Title from '@apps/admin/components/Title';

// Types
import {
  BasicInfo, Address, Order, OrderLine, OrderStatus, PaymentMethod,
  ShippingMethod, Tax, PaymentDetails, ConsumerDetails, BillingDetails, ShippingDetails
} from 'types/order.types';
import { Product, Variant } from 'types/product.types';
import { Art, PickedArt } from 'types/art.types';

// --- Helper Interfaces ---
interface MethodOption { id: string; label: string; fullMethod: ShippingMethod | PaymentMethod; }
interface ProductOption { id: string; label: string; fullProduct: Product; }
interface ArtOption { id: string; label: string; thumb: string; fullArt: Art; }
interface VariantOption { id: string; label: string; fullVariant: Variant; }

interface OrderLineFormState extends Partial<OrderLine> {
  tempId: string;
  selectedArt: ArtOption | null;
  selectedProduct: ProductOption | null;
  selectedVariant: VariantOption | null;
  availableVariants: VariantOption[];
  quantity: number;
  pricePerUnit: number;
}

const initialLine: Omit<OrderLineFormState, 'tempId'> = {
  selectedArt: null,
  selectedProduct: null,
  selectedVariant: null,
  availableVariants: [],
  quantity: 1,
  pricePerUnit: 0,
};

const getStatusChipProps = (status?: OrderStatus) => {
  const s = status ?? OrderStatus.PendingPayment;
  switch (s) {
    case OrderStatus.PendingPayment: return { label: 'Pendiente Pago', color: 'warning', icon: <InfoOutlined /> };
    case OrderStatus.PaymentFailed: return { label: 'Pago Fallido', color: 'error', icon: <CancelIcon /> };
    case OrderStatus.PaymentConfirmed: return { label: 'Pago Confirmado', color: 'info', icon: <CheckCircleIcon /> };
    default: return { label: 'Pendiente Pago', color: 'warning', icon: <InfoOutlined /> };
  }
};

const formatDate = (date: Date | string | undefined, includeTime: boolean = true) => {
  if (!date) return 'N/A';
  const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  if (includeTime) { opts.hour = '2-digit'; opts.minute = '2-digit'; }
  return new Date(date).toLocaleDateString('es-ES', opts);
};

const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();

  // --- Form State ---
  const [observations, setObservations] = useState<string>('');
  const [editableClientInfo, setEditableClientInfo] = useState<BasicInfo>({ name: '', lastName: '', email: '', phone: '' });

  const [shippingMethod, setShippingMethod] = useState<MethodOption | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<MethodOption | null>(null);
  const [useShippingForBilling, setUseShippingForBilling] = useState<boolean>(true);

  const [shippingMethodOptions, setShippingMethodOptions] = useState<MethodOption[]>([]);
  const [paymentMethodOptions, setPaymentMethodOptions] = useState<MethodOption[]>([]);

  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [artOptions, setArtOptions] = useState<ArtOption[]>([]);
  const [orderLines, setOrderLines] = useState<OrderLineFormState[]>([{ ...initialLine, tempId: uuidv4() }]);

  const [editableShippingAddress, setEditableShippingAddress] = useState<Address | null>(null);
  const [editableBillingAddress, setEditableBillingAddress] = useState<Address | null>(null);

  const [displayTotals, setDisplayTotals] = useState<{
    subTotal: number; discount: number; shippingCost: number; taxes: Tax[]; total: number; totalUnits: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);

  const isPickupSelected = useMemo(() => {
    if (!shippingMethod) return false;
    const name = (shippingMethod.fullMethod as ShippingMethod).name?.toLowerCase() || '';
    return name.includes('pickup') || name.includes('recoger');
  }, [shippingMethod]);

  useEffect(() => {
    if (isPickupSelected) {
      setUseShippingForBilling(false);
    }
  }, [isPickupSelected]);

  // --- Create Blank Address Helper ---
  const createBlankAddress = useCallback((): Address => ({
    recepient: { ...editableClientInfo },
    address: { line1: '', line2: '', reference: '', city: '', state: '', country: '', zipCode: '' }
  }), [editableClientInfo]);

  // --- Load Options ---
  const loadData = useCallback(async () => {
    setIsLoading(true); setErrorFetch(null);
    try {
      const [shippingMethods, paymentMethods, products, arts] = await Promise.all([
        fetchShippingMethods(), readAllPaymentMethods(), fetchActiveProducts(), getArts()
      ]);

      setShippingMethodOptions(shippingMethods.filter(s => s.active).map(s => ({ id: s._id!.toString(), label: `${s.name} ($${s.price})`, fullMethod: s })));
      setPaymentMethodOptions(paymentMethods.filter(p => p.active).map(p => ({ id: p._id!.toString(), label: p.name, fullMethod: p })));
      setProductOptions(products.map(p => ({ id: p._id!.toString(), label: p.name, fullProduct: p })));
      setArtOptions(arts.map(a => ({ id: a._id!.toString(), label: a.title, thumb: a.squareThumbUrl || a.smallThumbUrl || '', fullArt: a })));

      // Initialize blank addresses
      setEditableShippingAddress(createBlankAddress());
      setEditableBillingAddress(createBlankAddress());
    } catch (err: any) {
      console.error(err);
      setErrorFetch('Error cargando datos.');
      showSnackBar('Error cargando datos.');
    } finally {
      setIsLoading(false);
    }
  }, [showSnackBar]);

  useEffect(() => { loadData(); }, []);

  // --- Totals Calculation ---
  useEffect(() => {
    const sub = orderLines.reduce((sum, l) => (sum + (l.pricePerUnit || 0) * (l.quantity || 0)), 0);
    const ship = shippingMethod ? parseFloat((shippingMethod.fullMethod as ShippingMethod).price) : 0;
    const disc = 0;
    const base = sub - disc + ship;
    const taxes: Tax[] = [];
    const computed: Tax[] = taxes.map(t => ({ ...t, amount: base > 0 ? parseFloat((base * (t.value / 100)).toFixed(2)) : 0 }));
    const totalTax = computed.reduce((s, t) => s + t.amount, 0);
    setDisplayTotals({ subTotal: sub, discount: disc, shippingCost: ship, taxes: computed, total: sub - disc + ship + totalTax, totalUnits: orderLines.reduce((u, l) => (u + (l.quantity || 0)), 0) });
  }, [orderLines, shippingMethod]);

  // after your other hooks:
  useEffect(() => {
    const sub = orderLines.reduce(
      (sum, l) => sum + (l.pricePerUnit || 0) * (l.quantity || 0),
      0
    );
    const ship = shippingMethod
      ? parseFloat((shippingMethod.fullMethod as ShippingMethod).price)
      : 0;
    const disc = 0;
    const base = sub - disc + ship;

    // — build the two taxes we always need —
    const taxesToApply: Tax[] = [
      { name: 'IVA', value: 16, amount: 0 },
    ];

    // — if payment is Zelle or Efectivo $, add IGTF —
    const pmName = (paymentMethod?.fullMethod as PaymentMethod)?.name;
    if (pmName === 'Zelle' || pmName === 'Efectivo $') {
      taxesToApply.push({ name: 'IGTF', value: 3, amount: 0 });
    }

    // — compute each tax amount off the same base —
    const computedTaxes = taxesToApply.map(t => ({
      ...t,
      amount:
        base > 0
          ? parseFloat(((base * t.value) / 100).toFixed(2))
          : 0,
    }));

    const totalTax = computedTaxes.reduce((sum, t) => sum + t.amount, 0);

    setDisplayTotals({
      subTotal: sub,
      discount: disc,
      shippingCost: ship,
      taxes: computedTaxes,
      total: base + totalTax,
      totalUnits: orderLines.reduce((u, l) => u + (l.quantity || 0), 0),
    });
  }, [orderLines, shippingMethod, paymentMethod]);


  // --- Line Handlers ---
  const handleAddLine = () => setOrderLines(prev => [...prev, { ...initialLine, tempId: uuidv4() }]);
  const handleRemoveLine = (tempId: string) => setOrderLines(prev => prev.filter(l => l.tempId !== tempId));
  const updateLine = (tempId: string, values: Partial<OrderLineFormState>) => {
    setOrderLines(prev => prev.map(l => l.tempId === tempId ? { ...l, ...values } : l));
  };
  const handleArt = (tempId: string, v: ArtOption | null) => updateLine(tempId, { selectedArt: v });
  const handleProduct = (tempId: string, v: ProductOption | null) => {
    const variants = v?.fullProduct.variants || [];
    const opts = variants.map(vt => ({ id: vt._id!, label: vt.name, fullVariant: vt }));
    const price = parseFloat(v?.fullProduct.cost || '0');
    updateLine(tempId, { selectedProduct: v, availableVariants: opts, selectedVariant: null, pricePerUnit: price });
  };
  const handleVariant = (tempId: string, v: VariantOption | null) => {
    const price = parseFloat(v?.fullVariant.publicPrice || '0');
    updateLine(tempId, { selectedVariant: v, pricePerUnit: price });
  };
  const handleQty = (
    lineTempId: string,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const q = parseInt(event.target.value, 10) || 1;
    updateLine(lineTempId, { quantity: q });
  };

  // --- Other Handlers ---
  const handleShipChange = (_: SyntheticEvent, v: MethodOption | null) => setShippingMethod(v);
  const handlePayChange = (_: SyntheticEvent, v: MethodOption | null) => setPaymentMethod(v);
  const handleObs = (e: ChangeEvent<HTMLTextAreaElement>) => setObservations(e.target.value);
  const handleClientChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableClientInfo(prev => ({ ...prev, [name]: value }));
  };
  const handleShipAddrChange = (addr: Address) => setEditableShippingAddress(addr);
  const handleBillAddrChange = (addr: Address) => setEditableBillingAddress(addr);
  const handleUseShipBill = (e: ChangeEvent<HTMLInputElement>) => {
    setUseShippingForBilling(e.target.checked);
    if (e.target.checked && editableShippingAddress) setEditableBillingAddress(editableShippingAddress);
  };

  // --- Validation ---
  const validateForm = (): boolean => {
    if (!shippingMethod) { showSnackBar('Método envío requerido.'); return false; }
    if (!paymentMethod) { showSnackBar('Método pago requerido.'); return false; }
    if (!useShippingForBilling && !editableBillingAddress?.address.line1) { showSnackBar('Dirección facturación incompleta.'); return false; }
    if (!isPickupSelected && !editableShippingAddress?.address.line1) {
      showSnackBar('Dirección envío incompleta.');
      return false;
    }
    for (const [i, line] of orderLines.entries()) {
      if (!line.selectedProduct) { showSnackBar(`Item #${i + 1}: producto requerido.`); return false; }
      if (line.selectedProduct.fullProduct.variants!.length > 0 && !line.selectedVariant) { showSnackBar(`Item #${i + 1}: variante requerida.`); return false; }
      if (!line.quantity || line.quantity < 1) { showSnackBar(`Item #${i + 1}: cantidad inválida.`); return false; }
    }
    return true;
  };

  // --- Submit ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const consumerDetails: ConsumerDetails = {
        basic: editableClientInfo,
        selectedAddress: editableShippingAddress!.address,
        addresses: [editableShippingAddress!],
        paymentMethods: [(paymentMethod!.fullMethod as PaymentMethod)]
      };
      const paymentDetails: PaymentDetails = { total: displayTotals!.total, method: [(paymentMethod!.fullMethod as PaymentMethod)] };
      const shippingDetails: ShippingDetails = {
        method: shippingMethod!.fullMethod as ShippingMethod,
        country: editableShippingAddress!.address.country,
        address: editableShippingAddress!,
      };
      const billingDetails: BillingDetails = {
        billTo: useShippingForBilling ? editableShippingAddress!.recepient : editableBillingAddress!.recepient,
        address: useShippingForBilling ? editableShippingAddress! : editableBillingAddress!
      };
      const lines: OrderLine[] = orderLines.map(l => ({
        id: uuidv4(),
        item: {
          sku: `${l.selectedProduct!.id}-${l.selectedVariant?.id || ''}-${l.selectedArt?.id || ''}`,
          art: l.selectedArt ? { _id: l.selectedArt.fullArt._id, artId: l.selectedArt.fullArt.artId, title: l.selectedArt.fullArt.title, largeThumbUrl: l.selectedArt.fullArt.largeThumbUrl, prixerUsername: l.selectedArt.fullArt.prixerUsername, exclusive: l.selectedArt.fullArt.exclusive } : undefined,
          product: { _id: l.selectedProduct!.fullProduct._id, name: l.selectedProduct!.fullProduct.name, productionTime: l.selectedProduct!.fullProduct.productionTime, sources: l.selectedProduct!.fullProduct.sources, variants: l.selectedProduct!.fullProduct.variants, selection: l.selectedVariant?.fullVariant.attributes || [], mockUp: l.selectedProduct!.fullProduct.mockUp },
          price: l.pricePerUnit.toString(),
        },
        quantity: l.quantity,
        pricePerUnit: l.pricePerUnit,
        subtotal: l.pricePerUnit * l.quantity,
        status: [[OrderStatus.PendingPayment, new Date()]],
      }));

      const payload: Partial<Order> = {
        consumerDetails, payment: paymentDetails, shipping: shippingDetails, billing: billingDetails,
        lines, observations: observations || undefined,
        subTotal: displayTotals!.subTotal, totalUnits: displayTotals!.totalUnits,
        shippingCost: displayTotals!.shippingCost, tax: displayTotals!.taxes,
        totalWithoutTax: displayTotals!.subTotal, total: displayTotals!.total,
      };

      await createOrder(payload);
      showSnackBar('Orden creada exitosamente.');
      navigate('/admin/orders/read');
    } catch (err: any) {
      console.error(err);
      setErrorSubmit('Error al crear la orden.');
      showSnackBar('Error al crear la orden.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate('/admin/orders/read');

  // --- Render ---
  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  if (errorFetch) return <Alert severity="error" sx={{ m: 2 }}>{errorFetch}<Button onClick={loadData} size="small">Reintentar</Button></Alert>;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Title title="Crear Nueva Orden" />
      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={{ xs: 2, md: 3 }}>
          {/* Left pane: Order Lines */}
          <Grid2 size={{ xs: 12, lg: 7 }}>
            <Typography variant="h5" gutterBottom>Artículos del Pedido</Typography>
            {orderLines.map((line, index) => (
              <Card
                key={line.tempId}
                sx={{ mb: 2.5, borderRadius: 2, boxShadow: 2 }}
              >
                <CardHeader
                  title={`Item #${index + 1}`}
                  action={
                    <IconButton
                      onClick={() => handleRemoveLine(line.tempId)}
                      disabled={isSubmitting || orderLines.length <= 1}
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  }
                />
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Grid2 container spacing={2} alignItems="flex-start">
                    {/* Avatar column */}
                    <Grid2
                      size={{ xs: 12, sm: 'auto' }}
                      sx={{ textAlign: 'center', mb: { xs: 1, sm: 0 } }}
                    >
                      <Avatar
                        variant="rounded"
                        src={
                          line.selectedProduct?.fullProduct.sources?.images?.[0]?.url
                          || 'https://via.placeholder.com/80'
                        }
                        alt={line.selectedProduct?.label || 'Producto'}
                        sx={{
                          width: { xs: 60, sm: 70 },
                          height: { xs: 60, sm: 70 },
                          m: 'auto',
                          borderRadius: 1.5,
                          border: '1px solid #eee'
                        }}
                      />
                    </Grid2>

                    {/* Form fields column */}
                    <Grid2 size={{ xs: 12, sm: 9 }}>
                      {/* Row 1: Art + Product */}
                      <Grid2 container spacing={1.5} alignItems="center">
                        <Grid2 size={{ xs: 12, md: 6 }}>
                          <Autocomplete
                            fullWidth
                            options={artOptions}
                            value={line.selectedArt}
                            onChange={(e, v) => handleArt(line.tempId, v)}
                            disabled={isSubmitting}
                            renderOption={(props, op) => (
                              <Box component="li" {...props}>
                                <Avatar
                                  variant="rounded"
                                  src={op.thumb}
                                  sx={{ mr: 1, width: 24, height: 24, border: '1px solid lightgrey' }}
                                />
                                {op.label}
                              </Box>
                            )}
                            renderInput={params => (
                              <TextField {...params} size="small" label="Arte" />
                            )}
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                          <Autocomplete
                            fullWidth
                            options={productOptions}
                            value={line.selectedProduct}
                            onChange={(e, v) => handleProduct(line.tempId, v)}
                            disabled={isSubmitting}
                            renderInput={params => (
                              <TextField {...params} size="small" label="Producto *" required />
                            )}
                          />
                        </Grid2>
                      </Grid2>

                      {/* Row 2: Variant, Qty, Prices */}
                      <Grid2 container spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
                        <Grid2 size={{ xs: 12, md: 6 }}>
                          <Autocomplete
                            fullWidth
                            options={line.availableVariants}
                            value={line.selectedVariant}
                            onChange={(e, v) => handleVariant(line.tempId, v)}
                            disabled={!line.availableVariants.length || isSubmitting}
                            renderInput={params => (
                              <TextField
                                {...params}
                                size="small"
                                label="Variante"
                                helperText={!line.availableVariants.length ? "Sin variantes" : ''}
                              />
                            )}
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 6, md: 3 }}>
                          <TextField
                            label="Cant."
                            type="number"
                            value={line.quantity}
                            onChange={e => handleQty(line.tempId, e)}
                            fullWidth
                            size="small"
                            disabled={isSubmitting}
                            inputProps={{ min: 1 }}
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 6, md: 3 }} sx={{ textAlign: 'right' }}>
                          <Typography variant="body2">
                            ${(line.pricePerUnit || 0).toFixed(2)} c/u
                          </Typography>
                          <Typography variant="subtitle2" color="primary.main">
                            ${((line.pricePerUnit || 0) * (line.quantity || 0)).toFixed(2)}
                          </Typography>
                        </Grid2>
                      </Grid2>
                    </Grid2>
                  </Grid2>
                </CardContent>
              </Card>
            ))}

            <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleAddLine} disabled={isSubmitting} sx={{ mt: 1, mb: 2 }}>Agregar Item</Button>
          </Grid2>

          {/* Right pane: Summary, Shipping & Billing, Client, Observations */}
          <Grid2 size={{ xs: 12, lg: 5 }}>
            <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 2 }} elevation={1}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <ReceiptOutlined sx={{ mr: 1 }} />Resumen
              </Typography>
              <List dense disablePadding>
                {/* Subtotal */}
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Subtotal:" secondary={`$${displayTotals?.subTotal.toFixed(2)}`} />
                </ListItem>

                {/* IVA, IGTF, etc. */}
                {displayTotals?.taxes.map((t, idx) => (
                  <ListItem key={idx} sx={{ px: 0, justifyContent: 'space-between' }}>
                    <ListItemText primary={`${t.name} (${t.value}%)`} />
                    <Typography>${t.amount.toFixed(2)}</Typography>
                  </ListItem>
                ))}

                <Divider sx={{ my: 1 }} />

                {/* Total */}
                <ListItem sx={{ px: 0, justifyContent: 'space-between' }}>
                  <Typography fontWeight="bold">Total:</Typography>
                  <Typography fontWeight="bold">${displayTotals?.total.toFixed(2)}</Typography>
                </ListItem>
              </List>
            </Paper>

            <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 2 }} elevation={1}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}><LocalShippingOutlined sx={{ mr: 1 }} />Envío y Facturación</Typography>
              <Autocomplete fullWidth options={shippingMethodOptions} value={shippingMethod} onChange={handleShipChange} disabled={isSubmitting}
                renderInput={params => <TextField {...params} label="Método Envío *" />} sx={{ mb: 2 }} />
              {!isPickupSelected ? (
                <>
                  {/* Shipping address */}
                  <Typography variant="subtitle1" gutterBottom>
                    Dirección Envío *
                  </Typography>
                  {editableShippingAddress && (
                    <EditableAddressForm
                      title="Dirección de Envío"
                      address={editableShippingAddress}
                      onAddressChange={handleShipAddrChange}
                      isDisabled={isSubmitting}
                    />
                  )}

                  {/* Billing toggle + billing address */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={useShippingForBilling}
                        onChange={handleUseShipBill}
                        disabled={isSubmitting}
                      />
                    }
                    label="Usar para Facturación"
                    sx={{ mt: 1, mb: useShippingForBilling ? 0 : 1 }}
                  />

                  {!useShippingForBilling && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Dirección Facturación *
                      </Typography>
                      {editableBillingAddress && (
                        <EditableAddressForm
                          title="Dirección de Facturación"
                          address={editableBillingAddress}
                          onAddressChange={handleBillAddrChange}
                          isDisabled={isSubmitting}
                        />
                      )}
                    </>
                  )}
                </>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  El método seleccionado es <strong>Recogida en Tienda</strong>. No se requiere dirección de envío, ni facturación.
                </Alert>
              )}
              <FormControlLabel control={<Checkbox checked={useShippingForBilling} onChange={handleUseShipBill} />} label="Usar para Facturación" sx={{ mt: 1, mb: useShippingForBilling ? 0 : 1 }} />
              {!useShippingForBilling && (
                <>
                  <Typography variant="subtitle1" gutterBottom>Dirección Facturación *</Typography>
                  {editableBillingAddress && <EditableAddressForm title="Dirección de Facturación" address={editableBillingAddress} onAddressChange={handleBillAddrChange} isDisabled={isSubmitting} />}
                </>
              )}
              <Divider sx={{ my: 2 }} />
              <Autocomplete fullWidth options={paymentMethodOptions} value={paymentMethod} onChange={handlePayChange} disabled={isSubmitting}
                renderInput={params => <TextField {...params} label="Método Pago *" />} sx={{ mb: 1 }} />
            </Paper>
            <Paper sx={{ p: 2.5, mb: 2.5, borderRadius: 2 }} elevation={1}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}><PersonOutline sx={{ mr: 1 }} />Detalles Cliente</Typography>
              <Stack spacing={2}>
                <TextField name="name" label="Nombre Cliente" value={editableClientInfo.name} onChange={handleClientChange} size="small" fullWidth required disabled={isSubmitting} />
                <TextField name="lastName" label="Apellido Cliente" value={editableClientInfo.lastName} onChange={handleClientChange} size="small" fullWidth required disabled={isSubmitting} />
                <TextField name="email" label="Email Cliente" type="email" value={editableClientInfo.email} onChange={handleClientChange} size="small" fullWidth disabled={isSubmitting} />
                <TextField name="phone" label="Teléfono Cliente" value={editableClientInfo.phone} onChange={handleClientChange} size="small" fullWidth required disabled={isSubmitting} />
              </Stack>
            </Paper>
            <Paper sx={{ p: 2.5, borderRadius: 2 }} elevation={1}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}><InfoOutlined sx={{ mr: 1 }} />Observaciones</Typography>
              <TextField name="observations" value={observations} onChange={handleObs} fullWidth multiline rows={3} disabled={isSubmitting} placeholder="Observaciones" />
            </Paper>
          </Grid2>
        </Grid2>

        {/* Action Buttons */}
        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3, mb: 2 }}>
          <Button variant="outlined" color="secondary" onClick={handleCancel} disabled={isSubmitting} startIcon={<CancelIcon />}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}>
            {isSubmitting ? 'Creando Orden...' : 'Crear Orden'}
          </Button>
        </Stack>
        {errorSubmit && <Alert severity="error" sx={{ mt: 1 }}>{errorSubmit}</Alert>}
      </form>
    </Container>
  );
};

export default CreateOrder;