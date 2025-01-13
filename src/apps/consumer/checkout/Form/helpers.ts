import { OnConditionChangeHandler } from "../interfaces";

export const createMirrorHandler = (
    watchedField: string,
    baseField: string
  ): OnConditionChangeHandler => {
    return (conditionValue, { getValues, setValue }) => {
      const baseValue = getValues(baseField); // Get the value from the base field
      if (conditionValue) {
        setValue(watchedField, baseValue); // Set the value in the watched field
        return { disabled: true }; // Disable the field when mirroring
      } else {
        return { disabled: false }; // Enable the field when not mirroring
      }
    };
  };