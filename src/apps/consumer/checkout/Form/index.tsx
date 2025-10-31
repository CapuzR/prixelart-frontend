import { useEffect, useRef, useState } from "react";

import { fetchConsumer } from "../api";
import { calculateEstimatedDeliveryDate } from "../helpers";
import FormSection from "@apps/consumer/checkout/Form/FormSection";
import { getFormConfig } from "./formConfig";
import { useFormContext } from "react-hook-form";
import { DataLists, FormConfig } from "../../../../types/order.types";
import {
  readAllActivePaymentMethods,
  fetchActiveShippingMethods,
} from "@api/order.api";
import { fetchSellers } from "@api/admin.api";

interface FormProps {
  dataLists: DataLists;
  setDataLists: (dataLists: DataLists) => void;
}

interface Country {
  name: string;
  states: { name: string }[];
}

const computeStatesFromCountry = (
  countries: Country[],
  countryName: string,
): string[] => {
  const countryObj = countries.find((country) => country.name === countryName);
  return countryObj ? countryObj.states.map((state) => state.name) : [];
};

function Form({ dataLists, setDataLists }: FormProps) {
  const { setValue, getValues, watch } = useFormContext<FormConfig>();
  const [formConfig, setFormConfig] = useState<FormConfig>(
    getFormConfig(dataLists),
  );
  const state = watch();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const lines = state.order?.lines;
  const isFetched = useRef(false);
  const basicFields = watch([
    "basic.name",
    "basic.lastName",
    "basic.id",
    "basic.email",
    "basic.phone",
  ]);

  // Actualizar estados dependiendo del país (para envío)

  const shippingCountry = watch("shipping.country");

  useEffect(() => {
    if (shippingCountry) {
      const newStates = computeStatesFromCountry(
        dataLists.countries,
        shippingCountry,
      );
      setFormConfig((prevConfig) => ({
        ...prevConfig,
        shipping: {
          ...prevConfig.shipping,
          fields: {
            ...prevConfig.shipping.fields,
            state: {
              ...prevConfig.shipping.fields.state,
              options: newStates,
            },
          },
        },
      }));
      if (newStates.length > 0) {
        const stateValue =
          shippingCountry === "Venezuela" ? "Miranda" : newStates[0];
        setValue("shipping.state", stateValue);
      }
    }
  }, [
    shippingCountry,
    dataLists.countries,
    setFormConfig,
    getValues,
    setValue,
  ]);

  // Actualizar estados dependiendo del país (para facturación)

  const billingCountry = watch("billing.country");

  useEffect(() => {
    if (billingCountry) {
      const newStates = computeStatesFromCountry(
        dataLists.countries,
        billingCountry,
      );
      setFormConfig((prevConfig) => ({
        ...prevConfig,
        billing: {
          ...prevConfig.billing,
          fields: {
            ...prevConfig.billing.fields,
            state: {
              ...prevConfig.billing.fields.state,
              options: newStates,
            },
          },
        },
      }));
      if (newStates.length > 0) {
        const stateValue =
          shippingCountry === "Venezuela" ? "Miranda" : newStates[0];
        setValue("billing.state", stateValue);
      }
    }
  }, [billingCountry, dataLists, setFormConfig, setValue]);

  // Si se decide usar los mismos datos para envío o facturación
  useEffect(() => {
    const sections = ["shipping", "billing"];
    sections.map((section) => {
      if (state?.[section]?.[`${section}EqualsBasic`]) {
        setValue(section, {
          ...getValues(section),
          name: basicFields[0],
          lastName: basicFields[1],
          id: basicFields[2],
          email: basicFields[3],
          phone: basicFields[4],
        });
      }
    });
  }, [state.shipping?.shippingEqualsBasic, ...basicFields, setValue]);

  // Si se cambia entre Pickup y Delivery

  const shippingMethod = watch("shipping.method");

  useEffect(() => {
    setFormConfig((prevConfig) => {
      const updatedShippingFields = { ...prevConfig.shipping.fields };
      Object.keys(updatedShippingFields).forEach((fieldKey) => {
        updatedShippingFields[fieldKey].isHidden =
          shippingMethod === "Pickup" &&
          fieldKey !== "method" &&
          fieldKey !== "date";
        // updatedShippingFields[fieldKey].required =
        //   !(shippingMethod === "Pickup" &&
        //     fieldKey !== "method" &&
        //     fieldKey !== "date");
      });
      return {
        ...prevConfig,
        shipping: {
          ...prevConfig.shipping,
          fields: updatedShippingFields,
        },
      };
    });
  }, [shippingMethod, dataLists]);

  // Fetch data on mount
  useEffect(() => {
    if (isFetched.current) return;
    isFetched.current = true;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const consumerDetails = await fetchConsumer(token);
          if (consumerDetails) {
            setValue("order.consumerDetails", consumerDetails);
          }
        }

        const shippingMethodsData = await fetchActiveShippingMethods(); // Renamed to avoid conflict
        const paymentMethodsData = await readAllActivePaymentMethods(); // Renamed to avoid conflict
        const sellersData = await fetchSellers(); // Renamed to avoid conflict

        // Correctly update dataLists with fetched data
        setDataLists({
          ...dataLists, // Keep existing dataLists properties
          sellers: sellersData,
          shippingMethods: shippingMethodsData, // Use the fetched data
          paymentMethods: paymentMethodsData, // Use the fetched data
        });

        setFormConfig(() => {
          const newConfig = getFormConfig({
            ...dataLists, // Use the potentially updated dataLists
            sellers: sellersData, // Use fetched data for form config
            shippingMethods: shippingMethodsData, // Use fetched data for form config
            paymentMethods: paymentMethodsData, // Use fetched data for form config
          });
          // The state options logic here might be redundant if getFormConfig handles it.
          // Let's rely on getFormConfig to use the correct dataLists.

          return newConfig;
        });

        const estimatedDeliveryDate = getValues(
          "order.shipping.estimatedDeliveryDate",
        );
        if (!estimatedDeliveryDate) {
          const calculatedDate = calculateEstimatedDeliveryDate(lines);
          if (calculatedDate) {
            setValue("order.shipping.estimatedDeliveryDate", calculatedDate);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    // Added dataLists to the dependency array to ensure fetchData runs if initial dataLists changes
  }, [
    lines,
    setValue,
    getValues,
    dataLists,
    setDataLists,
    shippingCountry,
    billingCountry,
  ]);

  const handleSectionToggle = (sectionKey: string) => {
    setActiveSection((prev) => (prev === sectionKey ? null : sectionKey));
  };

  return (
    <>
      {Object.keys(formConfig).map((sectionKey) => {
        const sectionConfig = formConfig[sectionKey];
        return (
          <FormSection
            sectionKey={sectionKey}
            sectionConfig={sectionConfig}
            isExpanded={activeSection === sectionKey}
            onToggle={() => handleSectionToggle(sectionKey)}
          />
        );
      })}
    </>
  );
}

export default Form;
