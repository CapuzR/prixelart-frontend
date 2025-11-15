import { OnConditionChangeHandler } from "../../../../types/order.types";

export const createMirrorHandler = (
  watchedField: string,
  baseFields: string | string[], // Allow single or multiple base fields
): OnConditionChangeHandler => {
  return (conditionValue, { getValues, setValue }) => {
    // Ensure baseFields is treated as an array
    const sources = Array.isArray(baseFields) ? baseFields : [baseFields];

    // Fetch values from all base fields
    const baseValues = sources.map((field) => getValues(field));

    if (conditionValue) {
      // Combine values or use custom logic
      const combinedValue = baseValues.join(" "); // Adjust this logic
      setValue(watchedField, combinedValue); // Set the combined value in the watched field
      return { disabled: true }; // Disable the field when mirroring
    } else {
      return { disabled: false }; // Enable the field when not mirroring
    }
  };
};

export const isPickup = (methodSelected: string): boolean => {
  return methodSelected === "Pickup";
};
