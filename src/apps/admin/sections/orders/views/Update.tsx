import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent, SyntheticEvent, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Grid2 from '@mui/material/Grid'; // Changed to Unstable_Grid2 for consistency if using v5, otherwise Grid

// Hooks, Types, Context, API
import { useSnackBar } from 'context/GlobalContext';
import { Address, BasicInfo, Item, Order, OrderLine, OrderStatus, PaymentMethod, ShippingMethod, Tax } from 'types/order.types'; // Added Tax
import { fetchShippingMethods, getOrderById, readAllPaymentMethods, updateOrder } from '@api/order.api';

// MUI Components
import {
    Box, Typography, TextField, Button, Paper, CircularProgress, Alert, Stack,
    Divider, Select, SelectChangeEvent, MenuItem, InputLabel, FormControl, Avatar, Chip, List,
    Autocomplete, FormHelperText,
    FormControlLabel,
    Checkbox,
    Tooltip,
    IconButton,
    ListItemText,
    Container, // Added
    Card, // Added
    CardContent, // Added
    ListItemIcon,
    ListItem,
    CardHeader, // Added
} from '@mui/material';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineOppositeContent, TimelineSeparator } from '@mui/lab'; // Added
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    CalendarToday, PersonOutline,
    LocalShippingOutlined, ReceiptOutlined, StorefrontOutlined,
    PaletteOutlined, // Added
    CollectionsOutlined, // Added
    InfoOutlined
} from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

import { getCurrentOrderStatus } from '@apps/consumer/trackOrder/utils'; // Assuming this util is accessible
import { fetchActiveProducts } from '@api/product.api';
import { Product, Variant, VariantAttribute } from 'types/product.types'; // Added VariantAttribute
import { Art, PickedArt } from 'types/art.types'; // Added PickedArt
import { getArts } from '@api/art.api';
import EditableAddressForm from './components/EditableAddressForm';

interface MethodOption { id: string; label: string; fullMethod: ShippingMethod | PaymentMethod; }
// interface AddressOption { id: string; label: string; fullAddress: Address; } // No longer needed for dropdowns

interface ProductOption { id: string; label: string; fullProduct: Product; }
interface ArtOption { id: string; label: string; thumb: string; fullArt: Art; }
interface VariantOption { id: string; label: string; fullVariant: Variant; }

interface OrderLineFormState extends Partial<OrderLine> {
    tempId: string;
    selectedArt: ArtOption | null;
    selectedProduct: ProductOption | null;
    selectedVariant: VariantOption | null;
    availableVariants: VariantOption[];
}

interface DisplayTotals {
    subTotal: number;
    discount: number;
    shippingCost: number;
    taxes: Tax[]; // Store the full tax objects
    total: number;
    totalUnits: number;
}


const getStatusChipProps = (status?: OrderStatus): { label: string; color: any, icon?: React.ReactElement } => {
    const s = status ?? OrderStatus.PendingPayment;
    switch (s) {
        case OrderStatus.PendingPayment: return { label: 'Pendiente Pago', color: 'warning', icon: <InfoIcon /> };
        case OrderStatus.PaymentFailed: return { label: 'Pago Fallido', color: 'error', icon: <CancelIcon /> };
        case OrderStatus.PaymentConfirmed: return { label: 'Pago Confirmado', color: 'info', icon: <CheckCircleIcon /> };
        case OrderStatus.Processing: return { label: 'Procesando', color: 'secondary' };
        case OrderStatus.ReadyToShip: return { label: 'Listo Envío', color: 'secondary', icon: <CheckCircleIcon /> };
        case OrderStatus.Shipped: return { label: 'Enviado', color: 'primary', icon: <LocalShippingOutlined /> };
        case OrderStatus.InTransit: return { label: 'En Tránsito', color: 'primary', icon: <LocalShippingOutlined /> };
        case OrderStatus.Delivered: return { label: 'Entregado', color: 'success', icon: <CheckCircleIcon /> };
        case OrderStatus.Canceled: return { label: 'Cancelado', color: 'error', icon: <CancelIcon /> };
        case OrderStatus.OnHold: return { label: 'En Espera', color: 'default', icon: <InfoIcon /> };
        case OrderStatus.ReturnRequested: return { label: 'Dev. Solicitada', color: 'warning' };
        case OrderStatus.ReturnReceived: return { label: 'Dev. Recibida', color: 'info' };
        case OrderStatus.Refunded: return { label: 'Reembolsado', color: 'success' };
        default: return { label: 'Desconocido', color: 'default' };
    }
};

const getLatestStatus = (statusHistory?: [OrderStatus, Date][]): OrderStatus => {
    if (!statusHistory || statusHistory.length === 0) {
        return OrderStatus.PendingPayment; // Default for new lines or lines without status
    }
    return statusHistory[statusHistory.length - 1][0];
};

// Helper function from OrderDetailsPage (or similar)
const formatDate = (date: Date | string | undefined, includeTime: boolean = true): string => {
    if (!date) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    return new Date(date).toLocaleDateString('es-ES', options);
};

const UpdateOrder: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showSnackBar } = useSnackBar();

    const [order, setOrder] = useState<Order | null>(null);
    const [observations, setObservations] = useState<string>("");
    const [selectedShippingMethod, setSelectedShippingMethod] = useState<MethodOption | null>(null);
    const [editableClientInfo, setEditableClientInfo] = useState<BasicInfo | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<MethodOption | null>(null);
    const [editableShippingAddress, setEditableShippingAddress] = useState<Address | null>(null);
    const [editableBillingAddress, setEditableBillingAddress] = useState<Address | null>(null);
    const [useShippingForBilling, setUseShippingForBilling] = useState<boolean>(true);

    const [shippingMethodOptions, setShippingMethodOptions] = useState<MethodOption[]>([]);
    const [paymentMethodOptions, setPaymentMethodOptions] = useState<MethodOption[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorFetch, setErrorFetch] = useState<string | null>(null);
    const [errorSubmit, setErrorSubmit] = useState<string | null>(null);

    const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
    const [artOptions, setArtOptions] = useState<ArtOption[]>([]);
    const [editableOrderLines, setEditableOrderLines] = useState<OrderLineFormState[]>([]);

    const [displayTotals, setDisplayTotals] = useState<DisplayTotals | null>(null);

    const isPickupSelected = useMemo(() => {
        if (!selectedShippingMethod || !selectedShippingMethod.fullMethod) return false;
        const method = selectedShippingMethod.fullMethod as ShippingMethod;
        const methodName = method.name?.toLowerCase() || '';
        return methodName.includes('pickup') || methodName.includes('recoger');
    }, [selectedShippingMethod]);

    const initialOrderLineFormStateForUpdate: Omit<OrderLineFormState, 'id' | 'status' | 'item' | 'tempId'> & { item: undefined } = {
        selectedArt: null,
        selectedProduct: null,
        selectedVariant: null,
        availableVariants: [],
        quantity: 1,
        item: undefined,
        pricePerUnit: 0,
        subtotal: 0,
    };

    const createBlankAddress = useCallback((): Address => {
        return {
            recepient: editableClientInfo ? JSON.parse(JSON.stringify(editableClientInfo)) : { name: '', lastName: '', phone: '', email: '' },
            address: { line1: '', city: '', state: '', country: '', line2: '', reference: '', zipCode: '' }
        };
    }, [editableClientInfo]);


    const loadData = useCallback(async () => {
        if (!id) { return; }
        setIsLoading(true); setErrorFetch(null);

        try {
            const [orderData, shippingMethods, paymentMethods, products, arts] = await Promise.all([
                getOrderById(id) as Promise<Order>,
                fetchShippingMethods() as Promise<ShippingMethod[]>,
                readAllPaymentMethods() as Promise<PaymentMethod[]>,
                fetchActiveProducts() as Promise<Product[]>,
                getArts() as Promise<Art[]>
            ]);

            if (!orderData) throw new Error("Orden no encontrada.");
            setOrder(orderData);

            console.log("Order data:", orderData);
            setObservations(orderData.observations || "");
            if (orderData.consumerDetails?.basic) {
                setEditableClientInfo(JSON.parse(JSON.stringify(orderData.consumerDetails.basic)));
            } else {
                setEditableClientInfo({ name: '', lastName: '', email: '', phone: '' });
            }
            const productOpts = products.filter(p => p._id).map(p => ({ id: p._id!.toString(), label: p.name, fullProduct: p }));
            const artOpts = arts.filter(a => a._id).map(a => ({ id: a._id!.toString(), label: a.title, thumb: a.squareThumbUrl || a.smallThumbUrl || '', fullArt: a }));
            setProductOptions(productOpts);
            setArtOptions(artOpts);

            const transformedLines: OrderLineFormState[] = orderData.lines.map(line => {
                const selectedProductOpt = productOpts.find(p => p.id === line.item?.product?._id?.toString());
                const variants = selectedProductOpt?.fullProduct.variants || [];
                const variantOptions = variants.filter(v => v._id).map(v => ({ id: v._id!, label: v.name, fullVariant: v }));
                const currentVariantOpt = variantOptions.find(vo =>
                    vo.fullVariant.attributes.length === (line.item?.product?.selection?.length || 0) &&
                    vo.fullVariant.attributes.every(attr =>
                        line.item?.product?.selection?.find(selAttr => selAttr.name === attr.name && selAttr.value === attr.value)
                    )
                ) || null;

                return {
                    ...line,
                    tempId: line.id || uuidv4(),
                    selectedArt: artOpts.find(a => a.id === line.item?.art?._id?.toString()) || null,
                    selectedProduct: selectedProductOpt || null,
                    selectedVariant: currentVariantOpt,
                    availableVariants: variantOptions,
                    pricePerUnit: line.pricePerUnit,
                    quantity: line.quantity,
                };
            });
            setEditableOrderLines(transformedLines);

            const shippingOptions = shippingMethods.filter(s => s._id && s.active).map(s => ({ id: s._id!.toString(), label: `${s.name} ($${s.price})`, fullMethod: s }));
            const paymentOptions = paymentMethods.filter(p => p._id && p.active).map(p => ({ id: p._id!.toString(), label: p.name, fullMethod: p }));
            setShippingMethodOptions(shippingOptions);
            setPaymentMethodOptions(paymentOptions);

            const orderShip = orderData.shipping?.method;
            const currentSelectedShippingMethod = shippingOptions.find(opt =>
            // match by _id if present, else by name
            (!!orderShip._id
                ? opt.id === orderShip._id.toString()
                : opt.fullMethod.name === orderShip.name)
            ) || null;
            setSelectedShippingMethod(currentSelectedShippingMethod);

            // payment
            const orderPay = orderData.payment?.method?.[0];
            const currentSelectedPaymentMethod = paymentOptions.find(opt =>
            (!!orderPay._id
                ? opt.id === orderPay._id.toString()
                : opt.fullMethod.name === orderPay.name)
            ) || null;
            setSelectedPaymentMethod(currentSelectedPaymentMethod);

            // Initialize editable addresses
            setEditableShippingAddress(orderData.shipping?.address ? JSON.parse(JSON.stringify(orderData.shipping.address)) : createBlankAddress());
            setEditableBillingAddress(orderData.billing?.address ? JSON.parse(JSON.stringify(orderData.billing.address)) : createBlankAddress());

            const isInitiallyPickup = currentSelectedShippingMethod?.fullMethod && ((currentSelectedShippingMethod.fullMethod as ShippingMethod).name?.toLowerCase().includes('pickup') || (currentSelectedShippingMethod.fullMethod as ShippingMethod).name?.toLowerCase().includes('recoger'));
            if (isInitiallyPickup) {
                setUseShippingForBilling(false);
                setEditableShippingAddress(createBlankAddress()); // Clear shipping if pickup on load, or keep if it was pre-filled by user for pickup for some reason
                if (!orderData.billing?.address?.address?.line1) { // If original billing was empty, ensure new one
                    setEditableBillingAddress(createBlankAddress());
                }
            } else {
                setUseShippingForBilling(
                    !!orderData.shipping?.address &&
                    !!orderData.billing?.address &&
                    JSON.stringify(orderData.shipping.address) === JSON.stringify(orderData.billing.address)
                );
            }

        } catch (err: any) {
            console.error("Failed to load data:", err);
            setErrorFetch(err.message || "Error al cargar los datos.");
            showSnackBar(err.message || "Error al cargar datos.");
        } finally { setIsLoading(false); }
    }, [id, showSnackBar]);

    useEffect(() => { loadData(); }, [loadData]);

    // Recalculate display totals when relevant fields change
    useEffect(() => {
        if (!order) return setDisplayTotals(null);

        // 1) recompute subtotal & shipping
        const newSubTotal = editableOrderLines.reduce((sum, line) => sum + (line.pricePerUnit || 0) * (line.quantity || 1), 0);
        const newShippingCost = selectedShippingMethod
            ? parseFloat((selectedShippingMethod.fullMethod as ShippingMethod).price || '0')
            : order.shippingCost || 0;

        // 2) recompute each tax rule against (subtotal – discount + shipping)
        const base = newSubTotal - (order.discount || 0) + newShippingCost;
        const newTaxes: Tax[] = (order.tax || []).map(taxRule => ({
            ...taxRule,
            amount: base > 0
                ? parseFloat((base * (taxRule.value / 100)).toFixed(2))
                : 0
        }));

        // 3) total up
        const totalTaxAmount = newTaxes.reduce((sum, t) => sum + t.amount, 0);
        const newTotal = newSubTotal - (order.discount || 0) + newShippingCost + totalTaxAmount;

        setDisplayTotals({
            subTotal: newSubTotal,
            discount: order.discount || 0,
            shippingCost: newShippingCost,
            taxes: newTaxes,
            total: newTotal,
            totalUnits: editableOrderLines.reduce((u, l) => u + (l.quantity || 0), 0),
        });
    }, [editableOrderLines, selectedShippingMethod, order]);

    useEffect(() => {
        if (isPickupSelected) {
            // For pickup, shipping address is not used, billing address is independent and required.
            setEditableShippingAddress(createBlankAddress()); // Clear shipping address fields
            setUseShippingForBilling(false); // Ensure this is false
            // If billing address is empty or was mirroring shipping, re-initialize it
            if (!editableBillingAddress?.address?.line1) {
                setEditableBillingAddress(order?.billing?.address ? JSON.parse(JSON.stringify(order.billing.address)) : createBlankAddress());
            }
        } else {
            // Not pickup mode
            if (useShippingForBilling && editableShippingAddress) {
                setEditableBillingAddress(JSON.parse(JSON.stringify(editableShippingAddress)));
            } else if (!useShippingForBilling) {
                // If 'use for billing' is unchecked, billing is independent.
                // If it was previously mirroring or is empty, try to load original or set to new.
                const shippingAndBillingWereSameOrBillingEmpty =
                    editableShippingAddress && editableBillingAddress && JSON.stringify(editableShippingAddress) === JSON.stringify(editableBillingAddress) ||
                    !editableBillingAddress?.address?.line1;

                if (shippingAndBillingWereSameOrBillingEmpty) {
                    setEditableBillingAddress(order?.billing?.address ? JSON.parse(JSON.stringify(order.billing.address)) : createBlankAddress());
                }
            }
        }
    }, [isPickupSelected, useShippingForBilling, editableShippingAddress, order, createBlankAddress, editableBillingAddress?.address?.line1]);


    const handleAddOrderLine = () => {
        setEditableOrderLines(prev => [...prev, {
            ...initialOrderLineFormStateForUpdate,
            tempId: uuidv4(),
            status: [[OrderStatus.PendingPayment, new Date()]],
            id: '',
        }]);
    };

    const handleRemoveOrderLine = (lineTempIdToRemove: string) => {
        setEditableOrderLines(prev => prev.filter(line => line.tempId !== lineTempIdToRemove));
    };

    const updateEditableLine = (lineTempIdToUpdate: string, newValues: Partial<OrderLineFormState>) => {
        setEditableOrderLines(prevLines =>
            prevLines.map(line =>
                line.tempId === lineTempIdToUpdate ? { ...line, ...newValues } : line
            )
        );
    };

    const handleArtSelection = (lineTempIdToUpdate: string, newValue: ArtOption | null) => {
        updateEditableLine(lineTempIdToUpdate, { selectedArt: newValue });
    };

    const handleProductSelection = (lineTempIdToUpdate: string, newValue: ProductOption | null) => {
        const variants = newValue?.fullProduct.variants || [];
        const variantOptions = variants.filter(v => v._id).map(v => ({ id: v._id!, label: v.name, fullVariant: v }));
        const basePrice = parseFloat(newValue?.fullProduct.cost || '0');

        updateEditableLine(lineTempIdToUpdate, {
            selectedProduct: newValue,
            availableVariants: variantOptions,
            selectedVariant: null,
            pricePerUnit: basePrice,
        });
    };

    const handleVariantSelection = (lineTempIdToUpdate: string, newValue: VariantOption | null) => {
        const line = editableOrderLines.find(l => l.tempId === lineTempIdToUpdate);
        const productBasePrice = parseFloat(line?.selectedProduct?.fullProduct.cost || '0');
        const pricePerUnit = parseFloat(newValue?.fullVariant.publicPrice || productBasePrice.toString() || '0');

        updateEditableLine(lineTempIdToUpdate, {
            selectedVariant: newValue,
            pricePerUnit: pricePerUnit,
        });
    };

    const handleQuantityChange = (lineTempIdToUpdate: string, event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const q = parseInt(event.target.value, 10);
        const quantity = q >= 1 ? q : 1;
        updateEditableLine(lineTempIdToUpdate, { quantity });
    };

    const handleStatusChange = (lineTempIdToUpdate: string, event: SelectChangeEvent<OrderStatus>) => {
        const newStatus = event.target.value as OrderStatus;
        setEditableOrderLines(prevLines =>
            prevLines.map(line => {
                if (line.tempId === lineTempIdToUpdate) {
                    const currentLatestStatusTuple = getCurrentOrderStatus(line.status!);
                    const currentLatestStatus = currentLatestStatusTuple ? currentLatestStatusTuple[0] : getLatestStatus(line.status);

                    if (currentLatestStatus !== newStatus) {
                        const newStatusHistory: [OrderStatus, Date][] = [
                            ...(line.status || []),
                            [newStatus, new Date()]
                        ];
                        return { ...line, status: newStatusHistory };
                    }
                }
                return line;
            })
        );
    };

    const handleObservationsChange = (event: ChangeEvent<HTMLTextAreaElement>) => setObservations(event.target.value);
    const handleShippingChange = (event: SyntheticEvent, newValue: MethodOption | null) => setSelectedShippingMethod(newValue);
    const handlePaymentChange = (event: SyntheticEvent, newValue: MethodOption | null) => setSelectedPaymentMethod(newValue);

    const handleClientInfoChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setEditableClientInfo(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleShippingAddressChange = (updatedAddress: Address) => {
        setEditableShippingAddress(updatedAddress);
    };

    const handleBillingAddressChange = (updatedAddress: Address) => {
        setEditableBillingAddress(updatedAddress);
    };

    const handleUseShippingForBillingChange = (event: ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setUseShippingForBilling(checked);
        if (checked && editableShippingAddress) {
            setEditableBillingAddress(JSON.parse(JSON.stringify(editableShippingAddress)));
        } else if (!checked) {
            // If unchecking, restore original billing or set to blank if it was mirroring.
            // This logic is now primarily handled in the useEffect hook.
            setEditableBillingAddress(order?.billing?.address ? JSON.parse(JSON.stringify(order.billing.address)) : createBlankAddress());
        }
    };


    const validateForm = (): boolean => {
        if (!selectedShippingMethod) { showSnackBar("Método de envío es requerido."); return false; }
        if (!selectedPaymentMethod) { showSnackBar("Método de pago es requerido."); return false; }

        if (!isPickupSelected) {
            if (!editableShippingAddress?.address?.line1 || !editableShippingAddress?.address?.city || !editableShippingAddress?.address?.country || !editableShippingAddress?.recepient?.name) {
                showSnackBar("Dirección de Envío: campos requeridos (Destinatario, Línea 1, Ciudad, País) están incompletos."); return false;
            }
        }

        if (!useShippingForBilling && (!editableBillingAddress?.address?.line1 || !editableBillingAddress?.address?.city || !editableBillingAddress?.address?.country || !editableBillingAddress?.recepient?.name)) {
            showSnackBar("Dirección de Facturación: campos requeridos (Destinatario, Línea 1, Ciudad, País) están incompletos."); return false;
        }
        return true;
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        if (!validateForm()) {
            setIsSubmitting(false);
            return;
        }

        for (const [index, line] of editableOrderLines.entries()) {
            if (!line.selectedProduct) {
                showSnackBar(`Item #${index + 1}: Producto es requerido.`);
                setIsSubmitting(false); return;
            }
            if (line.selectedProduct.fullProduct.variants && line.selectedProduct.fullProduct.variants.length > 0 && !line.selectedVariant) {
                showSnackBar(`Item #${index + 1}: Variante es requerida para ${line.selectedProduct.label}.`);
                setIsSubmitting(false); return;
            }
            if (!line.quantity || line.quantity < 1) {
                showSnackBar(`Item #${index + 1}: Cantidad inválida.`);
                setIsSubmitting(false); return;
            }
        }

        setErrorSubmit(null);

        if (!order) {
            setErrorSubmit("Error: Datos de la orden no disponibles.");
            setIsSubmitting(false); return;
        }
        if (!isPickupSelected && !editableShippingAddress?.address?.line1) {
            setErrorSubmit("Dirección de envío no seleccionada o inválida.");
            setIsSubmitting(false); return;
        }
        if (!editableBillingAddress?.address?.line1) {
            setErrorSubmit("Dirección de facturación no seleccionada o inválida.");
            setIsSubmitting(false); return;
        }


        const shippingAddr = isPickupSelected ? createBlankAddress() : (editableShippingAddress || createBlankAddress()); // Use blank if pickup, otherwise the editable one
        const billingAddr = useShippingForBilling ? shippingAddr : (editableBillingAddress || createBlankAddress());

        const finalOrderLines: OrderLine[] = editableOrderLines.map(lineState => {
            if (!lineState.selectedProduct) throw new Error("Producto no seleccionado en una línea.");

            const pricePerUnit = parseFloat(
                lineState.selectedVariant?.fullVariant.publicPrice ||
                lineState.pricePerUnit?.toString() ||
                lineState.selectedProduct.fullProduct.cost ||
                '0'
            );

            const item: Item = {
                sku: `${lineState.selectedProduct.id}-${lineState.selectedVariant?.id || 'novar'}-${lineState.selectedArt?.id || 'noart'}`,
                art: lineState.selectedArt ? {
                    _id: lineState.selectedArt.fullArt._id,
                    artId: lineState.selectedArt.fullArt.artId,
                    title: lineState.selectedArt.fullArt.title,
                    largeThumbUrl: lineState.selectedArt.fullArt.largeThumbUrl,
                    prixerUsername: lineState.selectedArt.fullArt.prixerUsername,
                    exclusive: lineState.selectedArt.fullArt.exclusive
                } : undefined,
                product: {
                    _id: lineState.selectedProduct.fullProduct._id,
                    name: lineState.selectedProduct.fullProduct.name,
                    productionTime: lineState.selectedProduct.fullProduct.productionTime,
                    sources: lineState.selectedProduct.fullProduct.sources,
                    variants: lineState.selectedProduct.fullProduct.variants,
                    selection: lineState.selectedVariant?.fullVariant.attributes || [],
                    mockUp: lineState.selectedProduct.fullProduct.mockUp
                },
                price: pricePerUnit.toString(),
            };

            return {
                id: lineState.id && lineState.id !== lineState.tempId ? lineState.id : uuidv4(),
                item: item,
                quantity: lineState.quantity || 1,
                pricePerUnit: pricePerUnit,
                subtotal: (lineState.quantity || 1) * pricePerUnit,
                status: lineState.status || [[OrderStatus.PendingPayment, new Date()]],
                discount: lineState.discount,
                surcharge: lineState.surcharge,
            };
        });

        const finalSubTotal = finalOrderLines.reduce((sum, line) => sum + line.subtotal, 0);
        const finalTotalUnits = finalOrderLines.reduce((sum, line) => sum + line.quantity, 0);
        const finalShippingCost = selectedShippingMethod ? parseFloat((selectedShippingMethod.fullMethod as ShippingMethod).price || '0') : 0;
        const orderDiscount = order.discount || 0;

        const finalTaxes: Tax[] = (order.tax || []).map(taxRule => {
            const taxableAmount = finalSubTotal - orderDiscount;
            const amount = (taxableAmount > 0 ? taxableAmount : 0) * (taxRule.value / 100);
            return { ...taxRule, amount };
        });
        const finalTotalTaxAmount = finalTaxes.reduce((sum, t) => sum + t.amount, 0);
        const finalTotal = finalSubTotal - orderDiscount + finalShippingCost + finalTotalTaxAmount;

        let finalBillToInfo: BasicInfo | undefined = editableClientInfo || order?.consumerDetails?.basic;

        if (!useShippingForBilling && billingAddr?.recepient && (billingAddr.recepient.name || billingAddr.recepient.lastName)) {
            finalBillToInfo = billingAddr.recepient;
        } else if (useShippingForBilling && shippingAddr?.recepient && (shippingAddr.recepient.name || shippingAddr.recepient.lastName)) {
            finalBillToInfo = shippingAddr.recepient;
        }

        const payload: Partial<Order> = {
            observations: observations || undefined,
            lines: finalOrderLines,
            consumerDetails: order.consumerDetails ? {
                ...order.consumerDetails,
                basic: editableClientInfo || order.consumerDetails.basic,
            } : undefined,
            shipping: selectedShippingMethod ? {
                ...(order?.shipping || {}),
                method: selectedShippingMethod.fullMethod as ShippingMethod,
                address: isPickupSelected ? createBlankAddress() : shippingAddr, // Use blank address for pickup
                country: isPickupSelected ? createBlankAddress().address.country : (shippingAddr.address.country || ''),
            } : undefined,
            payment: {
                ...(order.payment),
                ...(selectedPaymentMethod && { method: [selectedPaymentMethod.fullMethod as PaymentMethod] }),
                total: finalTotal,
            },
            billing: billingAddr ? {
                ...(order?.billing || {}),
                address: billingAddr,
                billTo: finalBillToInfo,
            } : undefined,
            subTotal: finalSubTotal,
            totalUnits: finalTotalUnits,
            shippingCost: finalShippingCost,
            tax: finalTaxes,
            totalWithoutTax: finalSubTotal - orderDiscount,
            total: finalTotal,
            discount: orderDiscount,
            updates: [...(order?.updates || []), [new Date(), "Order updated via admin panel (v2 UI - no dropdown addr)"]]
        };

        try {
            console.log("Updating Order Data:", id, JSON.stringify(payload, null, 2));
            const response = await updateOrder(id!, payload);
            if (response) {
                showSnackBar(`Orden #${order?.number || id} actualizada.`);
                navigate("/admin/orders/read");
            } else { throw new Error("La actualización no devolvió respuesta."); }
        } catch (err: any) {
            console.error("Failed to submit order update:", err);
            setErrorSubmit(err.message || "Error al guardar la orden.");
            showSnackBar(err.message || "Error al guardar la orden.");
        } finally { setIsSubmitting(false); }
    };

    const handleCancel = () => navigate("/admin/orders/read");

    const renderBasicInfoItem = (
        itemKey: React.Key,
        icon: React.ReactNode,
        primary: string,
        secondary: string | React.ReactNode | undefined,
        isLink: boolean = false,
        href?: string
    ) => (
        secondary ? (
            <ListItem key={itemKey} sx={{ py: 0.5, px: 0 }}>
                {icon && <ListItemIcon sx={{ minWidth: '36px', color: 'text.secondary' }}>{icon}</ListItemIcon>}
                <ListItemText
                    primary={primary}
                    secondary={isLink && href ? <a href={href} target="_blank" rel="noopener noreferrer">{secondary}</a> : secondary}
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                    secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }} />
            </ListItem>
        ) : null
    );

    const renderVariantAttributes = (selection: VariantAttribute[] | undefined) => {
        if (!selection || selection.length === 0) return null;
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <PaletteOutlined fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="textSecondary">
                    Variante: {selection.map(attr => `${attr.name}: ${attr.value}`).join(', ')}
                </Typography>
            </Box>
        );
    };

    const renderArtDetails = (art: PickedArt | undefined) => {
        if (!art) return null;
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <CollectionsOutlined fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="textSecondary">
                    Arte: "{art.title}" por {art.prixerUsername}
                </Typography>
            </Box>
        );
    };


    if (isLoading) { return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>; }
    if (errorFetch) { return (<Alert severity="error" sx={{ m: 2 }}>{errorFetch}<Button onClick={loadData} size="small">Reintentar</Button></Alert>); }
    if (!order) { return (<Alert severity="warning" sx={{ m: 2 }}>No se pudo cargar la orden.</Alert>); }

    const getOverallOrderStatus = (orderLines: OrderLineFormState[]): OrderStatus => {
        if (!orderLines || orderLines.length === 0) return OrderStatus.OnHold;
        const statuses = orderLines.map(line => getLatestStatus(line.status));
        if (statuses.every(s => s === OrderStatus.Delivered)) return OrderStatus.Delivered;
        if (statuses.every(s => s === OrderStatus.Canceled)) return OrderStatus.Canceled;
        if (statuses.some(s => s === OrderStatus.Shipped || s === OrderStatus.InTransit)) return OrderStatus.Shipped;
        if (statuses.some(s => s === OrderStatus.ReadyToShip)) return OrderStatus.ReadyToShip;
        if (statuses.some(s => s === OrderStatus.Processing)) return OrderStatus.Processing;
        if (statuses.some(s => s === OrderStatus.PaymentConfirmed)) return OrderStatus.PaymentConfirmed;
        if (statuses.some(s => s === OrderStatus.PaymentFailed)) return OrderStatus.PaymentFailed;
        return OrderStatus.PendingPayment;
    };
    const overallStatusChipProps = getStatusChipProps(getOverallOrderStatus(editableOrderLines));


    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>

            <form onSubmit={handleSubmit}>
                <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mb: 3, backgroundColor: 'transparent' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" component="h1" fontWeight="bold">
                                Orden #{order.number || order._id?.toString()}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <CalendarToday fontSize="small" sx={{ mr: 0.5 }} /> Realizada el: {formatDate(order.createdOn)}
                            </Typography>
                        </Box>
                        <Chip
                            icon={overallStatusChipProps.icon}
                            label={overallStatusChipProps.label}
                            color={overallStatusChipProps.color}
                            sx={{ fontSize: '1rem', py: 2.5, px: 1.5, borderRadius: '8px', fontWeight: 'medium' }}
                        />
                    </Box>
                    {order.shipping?.estimatedDeliveryDate && getOverallOrderStatus(editableOrderLines) !== OrderStatus.Delivered && getOverallOrderStatus(editableOrderLines) !== OrderStatus.Canceled && (
                        <Alert severity="info" icon={<LocalShippingOutlined />} sx={{ mb: 2, borderRadius: 2 }}>
                            Fecha estimada de entrega original: <strong>{formatDate(order.shipping.estimatedDeliveryDate, false)}</strong>
                        </Alert>
                    )}
                </Paper>

                <Grid2 container spacing={{ xs: 2, md: 3 }}>
                    {/* --- Order Lines (Left Pane) --- */}
                    <Grid2 size={{ xs: 12, lg: 7 }}>
                        <Typography variant="h5" fontWeight="medium" gutterBottom sx={{ mb: 2 }}>Artículos del Pedido</Typography>
                        {editableOrderLines.map((line, index) => {
                            const lineStatus = getLatestStatus(line.status);
                            // const lineStatusChipProps = getStatusChipProps(lineStatus); // Not directly used here, but available
                            const productImageUrl = line.selectedProduct?.fullProduct.sources?.images?.[0]?.url || line.selectedProduct?.fullProduct.sources?.images?.[0]?.url || 'https://via.placeholder.com/80?text=Img';

                            return (
                                <Card key={line.tempId} sx={{ mb: 2.5, borderRadius: 2, boxShadow: 2 }}>
                                    {/* 1) Header with title + delete */}
                                    <CardHeader
                                        title={line.selectedProduct?.label || "Seleccionar Producto"}
                                        action={
                                            <IconButton
                                                onClick={() => handleRemoveOrderLine(line.tempId)}
                                                disabled={isSubmitting || editableOrderLines.length <= 1}
                                            >
                                                <DeleteIcon color="error" />
                                            </IconButton>
                                        }
                                    />

                                    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                                        {/* 2) Avatar + two-row form */}
                                        <Grid2 container spacing={2} alignItems="flex-start">
                                            {/* Avatar */}
                                            <Grid2 size={{ xs: 12, sm: 'auto' }} sx={{ textAlign: 'center', mb: { xs: 1, sm: 0 } }}>
                                                <Avatar
                                                    variant="rounded"
                                                    src={productImageUrl}
                                                    alt={line.selectedProduct?.label || "Producto"}
                                                    sx={{
                                                        width: { xs: 60, sm: 70 },
                                                        height: { xs: 60, sm: 70 },
                                                        m: 'auto',
                                                        borderRadius: 1.5,
                                                        border: '1px solid #eee'
                                                    }}
                                                />
                                            </Grid2>

                                            {/* Form fields */}
                                            <Grid2 size={{ xs: 12, sm: 9 }}>
                                                {/* Row 1: Arte + Producto */}
                                                <Grid2 container spacing={1.5} alignItems="center">
                                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                                        <Autocomplete
                                                            fullWidth
                                                            options={artOptions}
                                                            value={line.selectedArt}
                                                            onChange={(e, v) => handleArtSelection(line.tempId, v)}
                                                            disabled={isSubmitting}
                                                            renderOption={(props, option) => (
                                                                <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                                                                    <Avatar
                                                                        variant="rounded"
                                                                        src={option.thumb || undefined}
                                                                        sx={{ width: 24, height: 24, mr: 1, border: '1px solid lightgrey' }}
                                                                    />
                                                                    {option.label}
                                                                </Box>
                                                            )}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    size="small"
                                                                    label="Arte"
                                                                    helperText={line.selectedArt?.fullArt.prixerUsername ? `Artista: ${line.selectedArt.fullArt.prixerUsername}` : ''}
                                                                />
                                                            )}
                                                        />
                                                    </Grid2>

                                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                                        <Autocomplete
                                                            fullWidth
                                                            options={productOptions}
                                                            value={line.selectedProduct}
                                                            onChange={(e, v) => handleProductSelection(line.tempId, v)}
                                                            disabled={isSubmitting}
                                                            renderInput={(params) => (
                                                                <TextField {...params} size="small" label="Producto *" required />
                                                            )}
                                                        />
                                                    </Grid2>
                                                </Grid2>

                                                {/* Row 2: Variante, Cant., precio/unit, subtotal */}
                                                <Grid2 container spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
                                                    <Grid2 size={{ xs: 12, md: 6 }}>
                                                        <Autocomplete
                                                            fullWidth
                                                            options={line.availableVariants}
                                                            value={line.selectedVariant}
                                                            onChange={(e, v) => handleVariantSelection(line.tempId, v)}
                                                            disabled={isSubmitting || !line.selectedProduct || !line.availableVariants.length}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    size="small"
                                                                    label="Variante *"
                                                                    required={!!(line.selectedProduct && line.availableVariants.length > 0)}
                                                                    helperText={line.availableVariants.length === 0 && line.selectedProduct ? "Sin variantes" : ''}
                                                                />
                                                            )}
                                                        />
                                                    </Grid2>

                                                    <Grid2 size={{ xs: 6, md: 3 }}>
                                                        <TextField
                                                            label="Cant."
                                                            type="number"
                                                            value={line.quantity || 1}
                                                            onChange={(e) => handleQuantityChange(line.tempId, e)}
                                                            required
                                                            fullWidth
                                                            size="small"
                                                            disabled={isSubmitting}
                                                            inputProps={{ min: 1 }}
                                                        />
                                                    </Grid2>

                                                    <Grid2 size={{ xs: 6, md: 3 }} sx={{ textAlign: 'right' }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                            ${(line.pricePerUnit || 0).toFixed(2)} c/u
                                                        </Typography>
                                                        <Typography variant="subtitle2" color="primary.main">
                                                            ${((line.quantity || 0) * (line.pricePerUnit || 0)).toFixed(2)}
                                                        </Typography>
                                                    </Grid2>
                                                </Grid2>
                                            </Grid2>
                                        </Grid2>

                                        {/* 3) Timeline at the very bottom */}
                                        <Box sx={{ mt: 2, borderTop: '1px solid #eee', pt: 2 }}>
                                            <Grid2 container spacing={2}>
                                                <Grid2 size={{ xs: 12, md: 6 }}>
                                                    <Typography variant="caption" color="text.secondary" gutterBottom>
                                                        Historial de Estado del Item:
                                                    </Typography>
                                                    {line.status && line.status.length > 0 ? (
                                                        <Timeline
                                                            position="right"
                                                            sx={{
                                                                p: 0,
                                                                '& .MuiTimelineOppositeContent-root': {
                                                                    flex: '0 0 120px',
                                                                    minWidth: 120,
                                                                    pr: 1
                                                                },
                                                                '& .MuiTimelineContent-root': {
                                                                    pl: 1
                                                                }
                                                            }}
                                                        >
                                                            {line.status
                                                                .slice()
                                                                .sort((a, b) => new Date(a[1]).getTime() - new Date(b[1]).getTime())
                                                                .map(([st, date], idx, arr) => {
                                                                    const chip = getStatusChipProps(st);
                                                                    return (
                                                                        <TimelineItem key={idx} sx={{ minHeight: 'auto', mt: idx === 0 ? 0.5 : 0 }}>
                                                                            <TimelineOppositeContent sx={{ py: 0.2 }}>
                                                                                <Typography variant="caption" color="text.secondary">
                                                                                    {formatDate(date, true)}
                                                                                </Typography>
                                                                            </TimelineOppositeContent>
                                                                            <TimelineSeparator>
                                                                                <Tooltip title={chip.label}>
                                                                                    <TimelineDot variant="outlined" color={chip.color as any} sx={{ p: 0.3 }}>
                                                                                        {React.cloneElement(chip.icon || <InfoIcon />, {
                                                                                            sx: { fontSize: '0.8rem' }
                                                                                        })}
                                                                                    </TimelineDot>
                                                                                </Tooltip>
                                                                                {idx < arr.length - 1 && <TimelineConnector sx={{ minHeight: '10px' }} />}
                                                                            </TimelineSeparator>
                                                                            <TimelineContent sx={{ py: 0.2 }}>
                                                                                <Typography variant="caption">{chip.label}</Typography>
                                                                            </TimelineContent>
                                                                        </TimelineItem>
                                                                    );
                                                                })}
                                                        </Timeline>
                                                    ) : (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Sin historial
                                                        </Typography>
                                                    )}
                                                </Grid2>

                                                <Grid2 size={{ xs: 12, md: 6 }} sx={{ mt: { xs: 1, md: 0 } }}>
                                                    <FormControl size="small" fullWidth disabled={isSubmitting}>
                                                        <InputLabel>Estado Actual Item</InputLabel>
                                                        <Select value={lineStatus} label="Estado Actual Item"
                                                            onChange={(e) => handleStatusChange(line.tempId, e)}>
                                                            {Object.values(OrderStatus)
                                                                .filter(v => typeof v === 'number')
                                                                .map((statusValue) => {
                                                                    const props = getStatusChipProps(statusValue as OrderStatus);
                                                                    return (
                                                                        <MenuItem key={statusValue} value={statusValue}>
                                                                            <Chip icon={props.icon} label={props.label} color={props.color as any} size="small" variant="outlined" sx={{ mr: 1, borderRadius: '4px', fontSize: '0.75rem' }} />
                                                                            {props.label}
                                                                        </MenuItem>
                                                                    );
                                                                })}
                                                        </Select>
                                                        {line.status && line.status.length > 0 && (
                                                            <FormHelperText sx={{ textAlign: 'right' }}>
                                                                Últ. act: {formatDate(line.status[line.status.length - 1][1])}
                                                            </FormHelperText>
                                                        )}
                                                    </FormControl>
                                                </Grid2>
                                            </Grid2>
                                        </Box>
                                    </CardContent>
                                </Card>

                            );
                        })}
                        <Button type="button" variant="outlined" onClick={handleAddOrderLine} disabled={isSubmitting} sx={{ mt: 1, mb: 2 }}>
                            Agregar Item
                        </Button>
                    </Grid2>

                    {/* --- Right Pane (Summary, Shipping, etc.) --- */}
                    <Grid2 size={{ xs: 12, lg: 5 }}>
                        <Paper elevation={1} sx={{ p: { xs: 2, md: 2.5 }, mb: 2.5, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <ReceiptOutlined sx={{ mr: 1, color: 'primary.main' }} /> Resumen del Pedido
                            </Typography>
                            <List dense disablePadding>
                                {renderBasicInfoItem("summary-subtotal", null, "Subtotal:", `$${(displayTotals?.subTotal ?? order.subTotal).toFixed(2)}`)}
                                {(displayTotals?.discount ?? order.discount) ? renderBasicInfoItem("summary-discount", null, "Descuento:", <Typography color="error.main">-${(displayTotals?.discount ?? order.discount)?.toFixed(2)}</Typography>) : null}
                                {(displayTotals?.shippingCost ?? order.shippingCost) ? renderBasicInfoItem("summary-shipping", null, "Costo de Envío:", `$${(displayTotals?.shippingCost ?? order.shippingCost)?.toFixed(2)}`) : null}
                                {(displayTotals?.taxes ?? order.tax).map((t, idx) => renderBasicInfoItem(`summary-tax-${idx}`, null, `${t.name} (${t.value}%):`, `$${t.amount.toFixed(2)}`))}

                                <Divider sx={{ my: 1 }} />
                                <ListItem sx={{ py: 1, px: 0, justifyContent: 'space-between' }}>
                                    <Typography variant="h6" fontWeight="bold">Total:</Typography>
                                    <Typography variant="h6" fontWeight="bold">${(displayTotals?.total ?? order.total).toFixed(2)}</Typography>
                                </ListItem>
                                <ListItem sx={{ px: 0, justifyContent: 'space-between' }}>
                                    <Typography variant="body2">Items Totales:</Typography>
                                    <Typography variant="body2">{(displayTotals?.totalUnits ?? order.totalUnits)}</Typography>
                                </ListItem>
                            </List>
                        </Paper>

                        <Paper elevation={1} sx={{ p: { xs: 2, md: 2.5 }, mb: 2.5, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                <LocalShippingOutlined sx={{ mr: 1, color: 'primary.main' }} /> Envío y Facturación
                            </Typography>
                            <Autocomplete fullWidth sx={{ mb: 2 }} options={shippingMethodOptions} value={selectedShippingMethod} onChange={handleShippingChange} getOptionLabel={(o) => o.label} isOptionEqualToValue={(o, v) => o.id === v.id} loading={isLoading && shippingMethodOptions.length === 0} disabled={isSubmitting} renderInput={(params) => (<TextField {...params} label="Método de Envío *" required InputProps={{ ...params.InputProps, endAdornment: (<>{isLoading && !shippingMethodOptions.length ? <CircularProgress size={20} /> : null}{params.InputProps.endAdornment}</>), }} />)} />

                            {!isPickupSelected && (
                                <>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 1, mb: 1 }}>Dirección de Envío *</Typography>
                                    {editableShippingAddress && (
                                        <EditableAddressForm
                                            title="" // Title removed as it's clear from context
                                            address={editableShippingAddress}
                                            onAddressChange={handleShippingAddressChange}
                                            isDisabled={isSubmitting}
                                        />
                                    )}
                                    {!editableShippingAddress?.address?.line1 && !isPickupSelected && <FormHelperText error sx={{ mb: 1 }}>La dirección de envío es requerida y debe estar completa.</FormHelperText>}
                                </>
                            )}
                            {isPickupSelected && (
                                <Alert severity="info" sx={{ mb: 2 }}>El método de envío seleccionado es Recogida en Tienda. No se requiere dirección de envío.</Alert>
                            )}


                            <FormControlLabel
                                control={<Checkbox checked={useShippingForBilling} onChange={handleUseShippingForBillingChange} name="useShippingForBilling" disabled={isSubmitting || isPickupSelected || !editableShippingAddress?.address?.line1} />}
                                label="Usar para Facturación" sx={{ mt: 1, mb: useShippingForBilling ? 0 : 1 }}
                            />

                            {!useShippingForBilling && (
                                <>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 2, mb: 1 }}>Dirección de Facturación *</Typography>
                                    {editableBillingAddress && (
                                        <EditableAddressForm
                                            title="" // Title removed
                                            address={editableBillingAddress}
                                            onAddressChange={handleBillingAddressChange}
                                            isDisabled={isSubmitting}
                                        />
                                    )}
                                    {!editableBillingAddress?.address?.line1 && <FormHelperText error>La dirección de facturación es requerida y debe estar completa.</FormHelperText>}
                                </>
                            )}
                            <Divider sx={{ my: 2 }} />
                            <Autocomplete fullWidth sx={{ mb: 1 }} options={paymentMethodOptions} value={selectedPaymentMethod} onChange={handlePaymentChange} getOptionLabel={(o) => o.label} isOptionEqualToValue={(o, v) => o.id === v.id} loading={isLoading && paymentMethodOptions.length === 0} disabled={isSubmitting} renderInput={(params) => (<TextField {...params} label="Método de Pago *" required InputProps={{ ...params.InputProps, endAdornment: (<>{isLoading && !paymentMethodOptions.length ? <CircularProgress size={20} /> : null}{params.InputProps.endAdornment}</>), }} />)} />
                            {selectedPaymentMethod && (selectedPaymentMethod.fullMethod as PaymentMethod).instructions && (
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 0.5, mb: 1 }}>{(selectedPaymentMethod.fullMethod as PaymentMethod).instructions}</Typography>
                            )}
                        </Paper>

                        {order.consumerDetails && (
                            <Paper elevation={1} sx={{ p: { xs: 2, md: 2.5 }, mb: 2.5, borderRadius: 2 }} id="client-details-section">
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <PersonOutline sx={{ mr: 1, color: 'primary.main' }} /> Detalles del Cliente
                                </Typography>
                                {editableClientInfo && (
                                    <Stack spacing={2}>
                                        <Grid2 container spacing={2}>
                                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    name="name"
                                                    label="Nombre Cliente"
                                                    value={editableClientInfo.name}
                                                    onChange={handleClientInfoChange}
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    disabled={isSubmitting}
                                                    required
                                                />
                                            </Grid2>
                                            <Grid2 size={{ xs: 12, sm: 6 }}>
                                                <TextField
                                                    name="lastName"
                                                    label="Apellido Cliente"
                                                    value={editableClientInfo.lastName}
                                                    onChange={handleClientInfoChange}
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    disabled={isSubmitting}
                                                    required
                                                />
                                            </Grid2>
                                        </Grid2>
                                        <TextField
                                            name="email"
                                            label="Email Cliente"
                                            type="email"
                                            value={editableClientInfo.email || ''}
                                            onChange={handleClientInfoChange}
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            disabled={isSubmitting}
                                        />
                                        <TextField
                                            name="phone"
                                            label="Teléfono Cliente"
                                            value={editableClientInfo.phone}
                                            onChange={handleClientInfoChange}
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            disabled={isSubmitting}
                                            required
                                        />
                                    </Stack>
                                )}
                            </Paper>
                        )}

                        <Paper elevation={1} sx={{ p: { xs: 2, md: 2.5 }, mb: 2.5, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <InfoOutlined sx={{ mr: 1, color: 'primary.main' }} /> Observaciones del Cliente
                            </Typography>
                            <TextField name="observations" value={observations} onChange={handleObservationsChange} fullWidth multiline rows={3} disabled={isSubmitting} placeholder="Observaciones ingresadas por el cliente" variant="outlined" />
                        </Paper>

                        {order.seller && (
                            <Paper elevation={1} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <StorefrontOutlined sx={{ mr: 1, color: 'primary.main' }} /> Información del Vendedor
                                </Typography>
                                <Typography variant="body2" color="textSecondary">{order.seller}</Typography>
                            </Paper>
                        )}
                    </Grid2>
                </Grid2>

                {/* --- Action Buttons --- */}
                <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3, mb: 2 }}>
                    <Button type="button" variant="outlined" color="secondary" onClick={handleCancel} disabled={isSubmitting} startIcon={<CancelIcon />}>Cancelar</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isSubmitting || isLoading} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}>
                        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                </Stack>
                {errorSubmit && (<Alert severity="error" sx={{ mt: 1 }}>{errorSubmit}</Alert>)}
            </form>
        </Container>
    );
};

export default UpdateOrder;