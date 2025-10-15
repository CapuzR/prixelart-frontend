import { ObjectId } from "mongodb"

export interface Permissions {
  _id?: ObjectId
  area: string
  artBan: boolean
  createConsumer: boolean
  createDiscount: boolean
  createOrder: boolean
  createPaymentMethod: boolean
  createProduct: boolean
  createShippingMethod: boolean
  createTestimonial: boolean
  deleteConsumer: boolean
  deleteDiscount: boolean
  deletePaymentMethod: boolean
  deleteProduct: boolean
  deleteShippingMethod: boolean
  deleteTestimonial: boolean
  detailOrder: boolean
  detailPay: boolean
  modifyAdmins: boolean
  modifyArtBestSellers: boolean
  modifyBanners: boolean
  modifyBestSellers: boolean
  modifyDollar: boolean
  modifyTermsAndCo: boolean
  orderStatus: boolean
  prixerBan: boolean
  readConsumers: boolean
  readMovements: boolean
  setPrixerBalance: boolean
  updateAdmins: boolean
  updateArtBestSellers: boolean
  updateBanners: boolean
  updateBestSellers: boolean
  updateDollar: boolean
  updateTermsAndCo: boolean
}

export interface PermissionsV2 {
  _id?: ObjectId
  area: string
  admins: {
    createAdmin: boolean
    createAdminRole: boolean
    deleteAdmin: boolean
    deleteAdminRole: boolean
    readAdmins: boolean
    readAdminRoles: boolean
    readGlobalStats?: boolean
    updateAdmin: boolean
    updateAdminRole: boolean
  }
  art: {
    artBan: boolean
    createArt: boolean
    readAllArts: boolean
    updateArt: boolean
    deleteArt: boolean
  }
  announcement: {
    createAnnouncement: boolean
    readAnnouncements: boolean
    updateAnnouncement: boolean
    deleteAnnouncement: boolean
    archiveAnnouncement: boolean
    enableAnnouncement: boolean 
  } 
  discounts: {
    createDiscount: boolean
    deleteDiscount: boolean
    readAllDiscounts: boolean
    updateDiscount: boolean
    useDiscount: boolean
  }
  movements: {
    createWallet: boolean
    createMovement: boolean
    deleteMovement: boolean
    reverseMovement: boolean
    readAllMovements: boolean
    readMovementsByPrixer: boolean
    updateMovement: boolean
  }
  orders: {
    archiveOrder: boolean // can archive order
    create: boolean // can create a new order
    deleteOrder: boolean // can delete a order
    downloadData: boolean // can download the xlsx file with orders of the last 5 months
    readAllOrders: boolean // can read all the orders
    readHistory: boolean // can read the changes inner record of changes of an order 
    readOrderDetails: boolean // can read client info
    readPayDetails: boolean // read prices, total, subtotal, etc and vouchers register
    updateDetails: boolean // basicInfo: client data, billing or shipping data
    updateGeneralStatus: boolean //can update the general status of the order
    updateItem: boolean // after creation can change the Item, WARNING: this will change price, subtotal, taxs, total costs, etc
    updateItemPrice: boolean  // after creation can change the item price, WARNING: this will change price, subtotal, taxs, total, costs, etc
    updateItemStatus: boolean // can update the specific production status of an item
    updatePayDetails: boolean // can update the payment record: add, remove or update payments
    updatePayStatus: boolean // can update the payment status, obviusly the general of the order cause is the only one
    updateSeller: boolean //  can update the seller data, this is the person who was supposed to serve the costumer
  }
  paymentMethods: {
    createPaymentMethod: boolean
    deletePaymentMethod: boolean
    readAllPaymentMethod: boolean
    updatePaymentMethod: boolean
  }
  preferences: {
    createBanner: boolean
    deleteBanner: boolean
    readAllBanners: boolean
    updateArtBestSellers: boolean
    updateBanner: boolean
    updateBestSellers: boolean
    updateDollarValue: boolean
    updateTermsAndCo: boolean
  }
  products: {
    createProduct: boolean
    createVariant: boolean
    deleteProduct: boolean
    deleteVariant: boolean
    downloadData: boolean
    loadData: boolean
    readAllProducts: boolean
    updateImages: boolean
    updateMockup: boolean
    updateProduct: boolean
    updateVariant: boolean
  }
  shippingMethod: {
    createShippingMethod: boolean
    deleteShippingMethod: boolean
    readAllShippingMethod: boolean
    updateShippingMethod: boolean
  }
  surcharges: {
    createSurcharge: boolean
    deleteSurcharge: boolean
    readAllSurcharges: boolean
    updateSurcharge: boolean
    useSurcharge: boolean
  }
  testimonials: {
    createTestimonial: boolean
    deleteTestimonial: boolean
    readTestimonials: boolean
    updateTestimonial: boolean
  }
  users: {
    banConsumer: boolean
    banPrixer: boolean
    banUser: boolean
    promoteToPrixer: boolean
    createConsumer: boolean
    deleteConsumer: boolean
    deleteUser: boolean
    readAllUsers: boolean
    readPrixerBalance: boolean
    setPrixerBalance: boolean
    updatePrixer: boolean
    updateUser: boolean
  }
}
