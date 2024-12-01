import {
  ConsumerDetails,
  ShippingDetails,
  BillingDetails,
  BasicInfo,
} from './interfaces';
import {
  isAValidName,
  isAValidCi,
  isAValidPhoneNum,
  isAValidEmail,
} from 'utils/validations';


//ROTAS LAS VALIDACIONEEEES!!!
//Método de pago no funciona
//La dirección de envío y facturación no se guardan automáticamente con el basic.
//Detalles de la orden tampoco.

export const validateConsumerDetails = (
  consumerDetails?: ConsumerDetails
): boolean => {
  if (!consumerDetails) return false;

  // Helper to validate fields with dynamic inheritance
  const validateDetails = (
    details: Partial<BasicInfo> | Partial<ShippingDetails> | Partial<BillingDetails>,
    requiredFields: (keyof BasicInfo | keyof ShippingDetails | keyof BillingDetails)[],
    isValidField: (field: string, value: any) => boolean
  ): boolean => {
    if (!details) {
      console.error("Missing details for validation:", details);
      return false;
    }
    return requiredFields.every((field) => {
      const value = details[field as keyof typeof details];
      console.log(`Validating field: ${field}, value: ${value}`);
      return isValidField(field as string, value);
    });
  };

  const isValidField = (field: string, value: any): boolean => {
    if (!value) return false;
    switch (field) {
      case 'name':
      case 'lastName':
        return isAValidName(value);
      case 'email':
        return isAValidEmail(value);
      case 'phone':
        return isAValidPhoneNum(value);
      case 'ci':
        return isAValidCi(value);
      case 'address':
        return !!value; // Ensure address exists
      default:
        return true; // Allow additional fields
    }
  };

  const basicValid = validateDetails(
    consumerDetails.basic || {},
    ['name', 'lastName', 'email', 'phone'],
    isValidField
  );

  const addressesValid = consumerDetails.addresses.every((address) =>
    validateDetails(address.recepient || {}, ['name', 'lastName', 'phone'], isValidField)
  );

  return basicValid && addressesValid;
};


export const calculateEstimatedDeliveryDate = (lines: any[]): string => {
  const today = new Date();
  const monthsOrder = [
    "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12",
  ];

  const ProdTimes = lines
    ?.map((item) => item.product?.productionTime)
    ?.filter(Boolean); // Filter out invalid values

  const orderedProdT = ProdTimes?.sort((a, b) => a - b);
  let readyDate = new Date(
    today.setDate(today.getDate() + (orderedProdT?.[0] || 0))
  );

  // Adjust for weekends
  if (readyDate.getDay() === 6) {
    readyDate = new Date(today.setDate(today.getDate() + 2));
  } else if (readyDate.getDay() === 0) {
    readyDate = new Date(today.setDate(today.getDate() + 1));
  }

  return `${readyDate.getFullYear()}-${monthsOrder[readyDate.getMonth()]}-${readyDate.getDate()}`;
};
