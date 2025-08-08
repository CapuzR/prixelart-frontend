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
    archiveOrder: boolean
    create: boolean
    deleteOrder: boolean
    downloadData: boolean
    readAllOrders: boolean
    readHistory: boolean
    readOrderDetails: boolean
    readPayDetails: boolean // read prices and vouchers register
    updateDetails: boolean // basicInfo: client data, billing or shipping data
    updateGeneralStatus: boolean
    updateItem: boolean // after creation can change the Item, WARNING: this will change price, subtotal, taxs, total costs, etc
    updateItemPrice: boolean
    updateItemStatus: boolean
    updatePayDetails: boolean
    updatePayStatus: boolean
    updateSeller: boolean
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
