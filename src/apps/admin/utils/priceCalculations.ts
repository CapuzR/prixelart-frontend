export const calculateFinalPrice = (basePrice: number, artCommission: number = 0): number => {
  const priceWithCommission = basePrice * (1 + artCommission / 100);
  return Number(priceWithCommission.toFixed(2));
}; 