export const calculateEstimatedDeliveryDate = (lines: any[]): Date => {
  const today = new Date();

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
  return readyDate;
};
