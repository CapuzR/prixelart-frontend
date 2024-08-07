import axios from "axios";
jest.mock("axios");

const createAdminAreaMockedResponse = [
  {
    _id: "644b32cd4f2e3b25b87f39f1",
    area: "Master",
    detailOrder: true,
    detailPay: true,
    orderStatus: true,
    __v: 0,
    createOrder: true,
    createProduct: true,
    deleteProduct: true,
    modifyBanners: true,
    modifyTermsAndCo: true,
    createPaymentMethod: true,
    deletePaymentMethod: true,
    createShippingMethod: true,
    deleteShippingMethod: true,
    modifyDollar: true,
    prixerBan: true,
    createTestimonial: true,
    deleteTestimonial: true,
    modifyAdmins: true,
    createDiscount: true,
    deleteDiscount: true,
    setPrixerBalance: true,
    readMovements: true,
  },
  {
    _id: "645e868abfed2427447ecc74",
    area: "Ventas",
    detailOrder: true,
    detailPay: true,
    orderStatus: true,
    createOrder: true,
    createProduct: true,
    deleteProduct: false,
    __v: 0,
    createDiscount: false,
    createPaymentMethod: false,
    createShippingMethod: false,
    createTestimonial: false,
    deleteDiscount: false,
    deletePaymentMethod: false,
    deleteShippingMethod: false,
    deleteTestimonial: false,
    modifyAdmins: false,
    modifyBanners: false,
    modifyDollar: false,
    modifyTermsAndCo: false,
    prixerBan: false,
    setPrixerBalance: false,
  },
  {
    _id: "6470131e13ea27282046e15d",
    area: "Test",
    detailOrder: true,
    detailPay: false,
    orderStatus: false,
    createOrder: true,
    createProduct: false,
    deleteProduct: false,
    modifyBanners: false,
    modifyTermsAndCo: false,
    createPaymentMethod: false,
    deletePaymentMethod: false,
    createShippingMethod: true,
    deleteShippingMethod: false,
    __v: 0,
  },
];

export default axios.get.mockResolvedValue(createAdminAreaMockedResponse);
