import { OnConditionChangeHandler } from "../interfaces";

export const createMirrorHandler = (
  watchedField: string,
  baseFields: string | string[] // Allow single or multiple base fields
): OnConditionChangeHandler => {
  return (conditionValue, { getValues, setValue }) => {
    // Ensure baseFields is treated as an array
    const sources = Array.isArray(baseFields) ? baseFields : [baseFields];

    // Fetch values from all base fields
    const baseValues = sources.map((field) => getValues(field));

    if (conditionValue) {
      // Combine values or use custom logic
      const combinedValue = baseValues.join(" "); // Adjust this logic if needed
      setValue(watchedField, combinedValue); // Set the combined value in the watched field
      return { disabled: true }; // Disable the field when mirroring
    } else {
      return { disabled: false }; // Enable the field when not mirroring
    }
  };
};


export const requiresDelivery = (
  methodSelected: string,
): boolean => {
  //The Shipping methods should be an object  that specifies if
  // it requires delivery or not, so we don't have to hardcode it.
  if (methodSelected !== 'Pickup') {
    return true
  };
  return false
};