import { PermissionsV2 } from "../../../../../types/permissions.types"

type PermissionPath = `${keyof Omit<PermissionsV2, "_id" | "area">}.${string}`

export type PermissionItem = {
  key: PermissionPath
  check: (r: PermissionsV2) => boolean
  label: string
}

type PermissionGroup = {
  title: string
  check: (r: PermissionsV2) => boolean
  items: PermissionItem[]
}

const anyPermissionIn = (
  obj: Record<string, boolean | any> | undefined
): boolean => {
  if (!obj) return false
  for (const key in obj) {
    if (
      Object.prototype.hasOwnProperty.call(obj, key) &&
      typeof obj[key] === "boolean" &&
      obj[key]
    ) {
      return true
    }
  }
  return false
}

export const permissionGroups: PermissionGroup[] = [
  {
    title: "Pedidos",
    check: (r: PermissionsV2) => anyPermissionIn(r.orders),
    items: [
      {
        key: "orders.create",
        check: (r: PermissionsV2) => r.orders.create,
        label: "Crear pedidos",
      },
      {
        key: "orders.readHistory",
        check: (r: PermissionsV2) => r.orders.readHistory,
        label: "Ver historial de cambios del pedido",
      },
      {
        key: "orders.readOrderDetails",
        check: (r: PermissionsV2) => r.orders.readOrderDetails,
        label: "Ver detalles de pedido",
      },
      {
        key: "orders.readAllOrders",
        check: (r: PermissionsV2) => r.orders.readPayDetails,
        label: "Ver todos los pedidos",
      },
      {
        key: "orders.readPayDetails",
        check: (r: PermissionsV2) => r.orders.readPayDetails,
        label: "Ver detalles de pago",
      },
      {
        key: "orders.updateDetails",
        check: (r: PermissionsV2) => r.orders.updateDetails,
        label: "Actualizar datos de cliente/envío/facturación",
      },
      {
        key: "orders.updateGeneralStatus",
        check: (r: PermissionsV2) => r.orders.updateGeneralStatus,
        label: "Modificar status general de pedido",
      },
      {
        key: "orders.updateItem",
        check: (r: PermissionsV2) => r.orders.updateItem,
        label: "Modificar ítems de pedido",
      },
      {
        key: "orders.updateItemPrice",
        check: (r: PermissionsV2) => r.orders.updateItemPrice,
        label: "Modificar precio de ítems de pedido",
      },
      {
        key: "orders.updateItemStatus",
        check: (r: PermissionsV2) => r.orders.updateItemStatus,
        label: "Modificar status de ítems de pedido",
      },
      {
        key: "orders.updatePayDetails",
        check: (r: PermissionsV2) => r.orders.updatePayDetails,
        label: "Actualizar detalles de pago",
      },
      {
        key: "orders.updatePayStatus",
        check: (r: PermissionsV2) => r.orders.updatePayStatus,
        label: "Modificar status de pago",
      },
      {
        key: "orders.updateSeller",
        check: (r: PermissionsV2) => r.orders.updateSeller,
        label: "Modificar vendedor de pedido",
      },
      {
        key: "orders.deleteOrder",
        check: (r: PermissionsV2) => r.orders.deleteOrder,
        label: "Eliminar pedidos",
      },
      {
        key: "orders.archiveOrder",
        check: (r: PermissionsV2) => r.orders.archiveOrder,
        label: "Archivar pedidos",
      },
      {
        key: "orders.downloadData",
        check: (r: PermissionsV2) => r.orders.downloadData,
        label: "Descargar datos de pedidos",
      },
    ],
  },
  {
    title: "Productos",
    check: (r: PermissionsV2) => anyPermissionIn(r.products),
    items: [
      {
        key: "products.createProduct",
        check: (r: PermissionsV2) => r.products.createProduct,
        label: "Crear productos",
      },
      {
        key: "products.readAllProducts",
        check: (r: PermissionsV2) => r.products.readAllProducts,
        label: "Ver todos los productos",
      },
      {
        key: "products.updateProduct",
        check: (r: PermissionsV2) => r.products.updateProduct,
        label: "Modificar productos",
      },
      {
        key: "products.deleteProduct",
        check: (r: PermissionsV2) => r.products.deleteProduct,
        label: "Eliminar productos",
      },
      {
        key: "products.createVariant",
        check: (r: PermissionsV2) => r.products.createVariant,
        label: "Crear variantes de producto",
      },
      {
        key: "products.updateVariant",
        check: (r: PermissionsV2) => r.products.updateVariant,
        label: "Modificar variantes de producto",
      },
      {
        key: "products.deleteVariant",
        check: (r: PermissionsV2) => r.products.deleteVariant,
        label: "Eliminar variantes de producto",
      },
      {
        key: "products.updateImages",
        check: (r: PermissionsV2) => r.products.updateImages,
        label: "Actualizar imágenes de producto",
      },
      {
        key: "products.updateMockup",
        check: (r: PermissionsV2) => r.products.updateMockup,
        label: "Actualizar mockups de producto",
      },
      {
        key: "products.downloadData",
        check: (r: PermissionsV2) => r.products.downloadData,
        label: "Descargar datos de productos",
      },
      {
        key: "products.loadData",
        check: (r: PermissionsV2) => r.products.loadData,
        label: "Cargar datos de productos",
      },
    ],
  },
  {
    title: "Descuentos",
    check: (r: PermissionsV2) => anyPermissionIn(r.discounts),
    items: [
      {
        key: "discounts.createDiscount",
        check: (r: PermissionsV2) => r.discounts.createDiscount,
        label: "Crear descuentos",
      },
      {
        key: "discounts.readAllDiscounts",
        check: (r: PermissionsV2) => r.discounts.readAllDiscounts,
        label: "Ver todos los descuentos",
      },
      {
        key: "discounts.updateDiscount",
        check: (r: PermissionsV2) => r.discounts.updateDiscount,
        label: "Modificar descuentos",
      },
      {
        key: "discounts.deleteDiscount",
        check: (r: PermissionsV2) => r.discounts.deleteDiscount,
        label: "Eliminar descuentos",
      },
      {
        key: "discounts.useDiscount",
        check: (r: PermissionsV2) => r.discounts.useDiscount,
        label: "Usar descuentos",
      },
    ],
  },
  {
    title: "Recargos",
    check: (r: PermissionsV2) => anyPermissionIn(r.surcharges),
    items: [
      {
        key: "surcharges.createSurcharge",
        check: (r: PermissionsV2) => r.surcharges.createSurcharge,
        label: "Crear descuentos",
      },
      {
        key: "surcharges.readAllSurcharges",
        check: (r: PermissionsV2) => r.surcharges.readAllSurcharges,
        label: "Ver todos los descuentos",
      },
      {
        key: "surcharges.updateSurcharge",
        check: (r: PermissionsV2) => r.surcharges.updateSurcharge,
        label: "Modificar descuentos",
      },
      {
        key: "surcharges.deleteSurcharge",
        check: (r: PermissionsV2) => r.surcharges.deleteSurcharge,
        label: "Eliminar descuentos",
      },
      {
        key: "surcharges.useSurcharge",
        check: (r: PermissionsV2) => r.surcharges.useSurcharge,
        label: "Usar descuentos",
      },
    ],
  },
  {
    title: "Métodos de Pago",
    check: (r: PermissionsV2) => anyPermissionIn(r.paymentMethods),
    items: [
      {
        key: "paymentMethods.createPaymentMethod",
        check: (r: PermissionsV2) => r.paymentMethods.createPaymentMethod,
        label: "Crear métodos de pago",
      },
      {
        key: "paymentMethods.readAllPaymentMethod",
        check: (r: PermissionsV2) => r.paymentMethods.readAllPaymentMethod,
        label: "Ver todos los métodos de pago",
      },
      {
        key: "paymentMethods.updatePaymentMethod",
        check: (r: PermissionsV2) => r.paymentMethods.updatePaymentMethod,
        label: "Modificar métodos de pago",
      },
      {
        key: "paymentMethods.deletePaymentMethod",
        check: (r: PermissionsV2) => r.paymentMethods.deletePaymentMethod,
        label: "Eliminar métodos de pago",
      },
    ],
  },
  {
    title: "Métodos de Envío",
    check: (r: PermissionsV2) => anyPermissionIn(r.shippingMethod),
    items: [
      {
        key: "shippingMethod.createShippingMethod",
        check: (r: PermissionsV2) => r.shippingMethod.createShippingMethod,
        label: "Crear métodos de envío",
      },
      {
        key: "shippingMethod.readAllShippingMethod",
        check: (r: PermissionsV2) => r.shippingMethod.readAllShippingMethod,
        label: "Ver todos los métodos de envío",
      },
      {
        key: "shippingMethod.updateShippingMethod",
        check: (r: PermissionsV2) => r.shippingMethod.updateShippingMethod,
        label: "Modificar métodos de envío",
      },
      {
        key: "shippingMethod.deleteShippingMethod",
        check: (r: PermissionsV2) => r.shippingMethod.deleteShippingMethod,
        label: "Eliminar métodos de envío",
      },
    ],
  },
  {
    title: "Preferencias (Banners, Best Sellers, Términos, Dólar)",
    check: (r: PermissionsV2) => anyPermissionIn(r.preferences),
    items: [
      {
        key: "preferences.createBanner",
        check: (r: PermissionsV2) => r.preferences.createBanner,
        label: "Crear banners",
      },
      {
        key: "preferences.readAllBanners",
        check: (r: PermissionsV2) => r.preferences.readAllBanners,
        label: "Ver todos los banners",
      },
      {
        key: "preferences.updateBanner",
        check: (r: PermissionsV2) => r.preferences.updateBanner,
        label: "Modificar banners",
      },
      {
        key: "preferences.deleteBanner",
        check: (r: PermissionsV2) => r.preferences.deleteBanner,
        label: "Eliminar banners",
      },
      {
        key: "preferences.updateTermsAndCo",
        check: (r: PermissionsV2) => r.preferences.updateTermsAndCo,
        label: "Modificar términos y condiciones",
      },
      {
        key: "preferences.updateDollarValue",
        check: (r: PermissionsV2) => r.preferences.updateDollarValue,
        label: "Modificar valor del dólar",
      },
      {
        key: "preferences.updateBestSellers",
        check: (r: PermissionsV2) => r.preferences.updateBestSellers,
        label: "Modificar productos más vendidos",
      },
      {
        key: "preferences.updateArtBestSellers",
        check: (r: PermissionsV2) => r.preferences.updateArtBestSellers,
        label: "Modificar artes más vendidos",
      },
    ],
  },
  {
    title: "Testimonios",
    check: (r: PermissionsV2) => anyPermissionIn(r.testimonials),
    items: [
      {
        key: "testimonials.createTestimonial",
        check: (r: PermissionsV2) => r.testimonials.createTestimonial,
        label: "Crear testimonios",
      },
      {
        key: "testimonials.readTestimonials",
        check: (r: PermissionsV2) => r.testimonials.readTestimonials,
        label: "Ver testimonios",
      },
      {
        key: "testimonials.updateTestimonial",
        check: (r: PermissionsV2) => r.testimonials.updateTestimonial,
        label: "Modificar testimonios",
      },
      {
        key: "testimonials.deleteTestimonial",
        check: (r: PermissionsV2) => r.testimonials.deleteTestimonial,
        label: "Eliminar testimonios",
      },
    ],
  },
  {
    title: "Administradores y Roles",
    check: (r: PermissionsV2) => anyPermissionIn(r.admins),
    items: [
      {
        key: "admins.createAdmin",
        check: (r: PermissionsV2) => r.admins.createAdmin,
        label: "Crear administradores",
      },
      {
        key: "admins.readAdmins",
        check: (r: PermissionsV2) => r.admins.readAdmins,
        label: "Ver administradores",
      },
      {
        key: "admins.updateAdmin",
        check: (r: PermissionsV2) => r.admins.updateAdmin,
        label: "Modificar administradores",
      },
      {
        key: "admins.deleteAdmin",
        check: (r: PermissionsV2) => r.admins.deleteAdmin,
        label: "Eliminar administradores",
      },
      {
        key: "admins.deleteAdminRole",
        check: (r: PermissionsV2) => r.admins.deleteAdminRole,
        label: "Eliminar rol de administrador",
      },
      {
        key: "admins.createAdminRole",
        check: (r: PermissionsV2) => r.admins.createAdminRole,
        label: "Crear roles de administrador",
      },
      {
        key: "admins.readAdminRoles",
        check: (r: PermissionsV2) => r.admins.readAdminRoles,
        label: "Ver roles de administrador",
      },
      {
        key: "admins.updateAdminRole",
        check: (r: PermissionsV2) => r.admins.updateAdminRole,
        label: "Modificar roles de administrador",
      },
    ],
  },
  {
    title: "Artes",
    check: (r: PermissionsV2) => anyPermissionIn(r.art),
    items: [
      {
        key: "art.createArt",
        check: (r: PermissionsV2) => r.art.createArt,
        label: "Crear artes",
      },
      {
        key: "art.readAllArts",
        check: (r: PermissionsV2) => r.art.readAllArts,
        label: "Ver todos los artes",
      },
      {
        key: "art.updateArt",
        check: (r: PermissionsV2) => r.art.updateArt,
        label: "Modificar artes",
      },
      {
        key: "art.deleteArt",
        check: (r: PermissionsV2) => r.art.deleteArt,
        label: "Eliminar artes",
      },
      {
        key: "art.artBan",
        check: (r: PermissionsV2) => r.art.artBan,
        label: "Banear artes",
      },
    ],
  },
  {
    title: "Movimientos",
    check: (r: PermissionsV2) => anyPermissionIn(r.movements),
    items: [
      {
        key: "movements.createWallet",
        check: (r: PermissionsV2) => r.movements.createWallet,
        label: "Crear billetera",
      },
      {
        key: "movements.createMovement",
        check: (r: PermissionsV2) => r.movements.createMovement,
        label: "Crear movimientos",
      },
      {
        key: "movements.readAllMovements",
        check: (r: PermissionsV2) => r.movements.readAllMovements,
        label: "Ver todos los movimientos",
      },
      {
        key: "movements.readMovementsByPrixer",
        check: (r: PermissionsV2) => r.movements.readMovementsByPrixer,
        label: "Ver movimientos por Prixer",
      },
      {
        key: "movements.updateMovement",
        check: (r: PermissionsV2) => r.movements.updateMovement,
        label: "Modificar movimientos",
      },
      {
        key: "movements.deleteMovement",
        check: (r: PermissionsV2) => r.movements.deleteMovement,
        label: "Eliminar movimientos",
      },
      {
        key: "movements.reverseMovement",
        check: (r: PermissionsV2) => r.movements.reverseMovement,
        label: "Revertir movimientos",
      },
    ],
  },
  {
    title: "Usuarios (Generales, Clientes, Prixers)",
    check: (r: PermissionsV2) => anyPermissionIn(r.users),
    items: [
      {
        key: "users.promoteToPrixer",
        check: (r: PermissionsV2) => r.users.promoteToPrixer,
        label: "Promover a Prixer",
      },
      {
        key: "users.createConsumer",
        check: (r: PermissionsV2) => r.users.createConsumer,
        label: "Crear clientes",
      },
      {
        key: "users.readAllUsers",
        check: (r: PermissionsV2) => r.users.readAllUsers,
        label: "Ver todos los usuarios (clientes, prixers, organizaciones)",
      },
      {
        key: "users.deleteConsumer",
        check: (r: PermissionsV2) => r.users.deleteConsumer,
        label: "Eliminar clientes",
      },
      {
        key: "users.deleteUser",
        check: (r: PermissionsV2) => r.users.deleteUser,
        label: "Eliminar usuario",
      },
      {
        key: "users.banConsumer",
        check: (r: PermissionsV2) => r.users.banConsumer,
        label: "Banear clientes",
      },
      {
        key: "users.banPrixer",
        check: (r: PermissionsV2) => r.users.banPrixer,
        label: "Banear Prixers",
      },
      {
        key: "users.banUser",
        check: (r: PermissionsV2) => r.users.banUser,
        label: "Banear usuarios generales",
      },
      {
        key: "users.updatePrixer",
        check: (r: PermissionsV2) => r.users.updatePrixer,
        label: "Actualizar Prixer",
      },
      {
        key: "users.updateUser",
        check: (r: PermissionsV2) => r.users.updateUser,
        label: "Actualizar Usuario",
      },
      {
        key: "users.readPrixerBalance",
        check: (r: PermissionsV2) => r.users.readPrixerBalance,
        label: "Ver balance de Prixers",
      },
      {
        key: "users.setPrixerBalance",
        check: (r: PermissionsV2) => r.users.setPrixerBalance,
        label: "Modificar balance de Prixers",
      },
    ],
  },
]
