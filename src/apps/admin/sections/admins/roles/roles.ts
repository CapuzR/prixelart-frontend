import { Permissions } from 'types/permissions.types';

type PermissionItem = {
    key: keyof Omit<Permissions, '_id' | 'area'>; // The actual key in the Permissions type
    check: (r: Permissions) => boolean;
    label: string;
};

type PermissionGroup = {
    title: string;
    check: (r: Permissions) => boolean;
    items: PermissionItem[];
};

export const permissionGroups: PermissionGroup[] = [
    {
        title: "Pedidos",
        check: (r: Permissions) => r.detailOrder || r.detailPay || r.orderStatus || r.createOrder,
        items: [
            { key: 'detailOrder', check: (r: Permissions) => r.detailOrder, label: "Ver detalles de pedido" },
            { key: 'detailPay', check: (r: Permissions) => r.detailPay, label: "Modificar detalles de pago" },
            { key: 'orderStatus', check: (r: Permissions) => r.orderStatus, label: "Modificar status de pedido" },
            { key: 'createOrder', check: (r: Permissions) => r.createOrder, label: "Crear y modificar pedido" },
        ]
    },
    {
        title: "Productos",
        check: (r: Permissions) => r.createProduct || r.deleteProduct || r.createDiscount || r.deleteDiscount,
        items: [
            { key: 'createProduct', check: (r: Permissions) => r.createProduct, label: "Crear y modificar productos" },
            { key: 'deleteProduct', check: (r: Permissions) => r.deleteProduct, label: "Eliminar productos" },
            { key: 'createDiscount', check: (r: Permissions) => r.createDiscount, label: "Crear y modificar descuentos" },
            { key: 'deleteDiscount', check: (r: Permissions) => r.deleteDiscount, label: "Eliminar descuentos" },
        ]
    },
    // ... Add ALL other groups here, ensuring each item has a 'key' property ...
    {
        title: "Métodos de pago",
        check: (r: Permissions) => r.createPaymentMethod || r.deletePaymentMethod,
        items: [
            { key: 'createPaymentMethod', check: (r: Permissions) => r.createPaymentMethod, label: "Crear y modificar métodos de pago" },
            { key: 'deletePaymentMethod', check: (r: Permissions) => r.deletePaymentMethod, label: "Eliminar método de pago" },
        ]
    },
    {
        title: "Métodos de envío",
        check: (r: Permissions) => r.createShippingMethod || r.deleteShippingMethod,
        items: [
            { key: 'createShippingMethod', check: (r: Permissions) => r.createShippingMethod, label: "Crear y modificar métodos de envío" },
            { key: 'deleteShippingMethod', check: (r: Permissions) => r.deleteShippingMethod, label: "Eliminar método de envío" },
        ]
    },
    {
        title: "Preferencias",
        check: (r: Permissions) => r.modifyBanners || r.modifyTermsAndCo || r.modifyDollar || r.modifyBestSellers || r.modifyArtBestSellers,
        items: [
            { key: 'modifyBanners', check: (r: Permissions) => r.modifyBanners, label: "Modificar banners" },
            { key: 'modifyTermsAndCo', check: (r: Permissions) => r.modifyTermsAndCo, label: "Modificar términos y condiciones" },
            { key: 'modifyDollar', check: (r: Permissions) => r.modifyDollar, label: "Modificar valor del dolar" },
            { key: 'modifyBestSellers', check: (r: Permissions) => r.modifyBestSellers, label: "Modificar productos más vendidos" },
            { key: 'modifyArtBestSellers', check: (r: Permissions) => r.modifyArtBestSellers, label: "Modificar artes más vendidos" },
        ]
    },
    {
        title: "Testimonios",
        check: (r: Permissions) => r.createTestimonial || r.deleteTestimonial,
        items: [
            { key: 'createTestimonial', check: (r: Permissions) => r.createTestimonial, label: "Crear, modificar, mostrar y ordenar testimonios" },
            { key: 'deleteTestimonial', check: (r: Permissions) => r.deleteTestimonial, label: "Eliminar testimonios" },
        ]
    },
    {
        title: "Usuarios", // Note: Renamed from 'Administración' in original CreateRole grouping
        check: (r: Permissions) => r.modifyAdmins,
        items: [
            { key: 'modifyAdmins', check: (r: Permissions) => r.modifyAdmins, label: "Crear, modificar y eliminar Admins" },
        ]
    },
    {
        title: "Prixers", // Note: Renamed from 'Prixers y Arte'
        check: (r: Permissions) => r.prixerBan || r.setPrixerBalance || r.readMovements || r.artBan,
        items: [
            { key: 'prixerBan', check: (r: Permissions) => r.prixerBan, label: "Banear a Prixers" },
            { key: 'setPrixerBalance', check: (r: Permissions) => r.setPrixerBalance, label: "Modificar Balance de Prixers" },
            { key: 'readMovements', check: (r: Permissions) => r.readMovements, label: "Leer movimientos" },
            { key: 'artBan', check: (r: Permissions) => r.artBan, label: "Banear artes" },
        ]
    },
    {
        title: "Clientes", // Note: Renamed from 'Clientes'
        check: (r: Permissions) => r.createConsumer || r.readConsumers || r.deleteConsumer,
        items: [
            { key: 'createConsumer', check: (r: Permissions) => r.createConsumer, label: "Crear y modificar clientes" },
            { key: 'readConsumers', check: (r: Permissions) => r.readConsumers, label: "Leer clientes" },
            { key: 'deleteConsumer', check: (r: Permissions) => r.deleteConsumer, label: "Eliminar clientes" },
        ]
    },
];

// Also ensure permissionLabels includes keys for all items defined above
export const permissionLabels: { [key in keyof Omit<Permissions, '_id' | 'area'>]: string } = {
    detailOrder: "Ver detalles de pedido",
    detailPay: "Modificar detalles de pago",
    createOrder: "Crear y modificar pedido",
    createProduct: "Crear y modificar productos",
    deleteProduct: "Eliminar productos",
    createDiscount: "Crear y modificar descuentos",
    deleteDiscount: "Eliminar descuentos",
    createPaymentMethod: "Crear y modificar métodos de pago",
    deletePaymentMethod: "Eliminar método de pago",
    createShippingMethod: "Crear y modificar métodos de envío",
    deleteShippingMethod: "Eliminar método de envío",
    modifyBanners: "Modificar banners",
    modifyTermsAndCo: "Modificar términos y condiciones",
    modifyDollar: "Modificar valor del dólar",
    modifyBestSellers: "Modificar productos más vendidos",
    modifyArtBestSellers: "Modificar artes más vendidos",
    createTestimonial: "Crear, modificar, mostrar y ordenar testimonios",
    deleteTestimonial: "Eliminar testimonios",
    modifyAdmins: "Crear, modificar y eliminar Admins",
    prixerBan: "Banear a Prixers",
    setPrixerBalance: "Modificar balance de Prixers",
    readMovements: "Leer movimientos",
    artBan: "Banear artes",
    createConsumer: "Crear y modificar clientes",
    readConsumers: "Leer clientes",
    deleteConsumer: "Eliminar clientes",
    orderStatus: "Modificar status de pedido",
    updateAdmins: "Actualizar información de administradores",
    updateArtBestSellers: "Actualizar lista de artes más vendidos",
    updateBanners: "Actualizar banners",
    updateBestSellers: "Actualizar lista de productos más vendidos",
    updateDollar: "Actualizar valor del dólar",
    updateTermsAndCo: "Actualizar términos y condiciones"
};