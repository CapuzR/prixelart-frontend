import { useEffect, useRef, useState } from "react";

import { fetchConsumer, fetchShippingMethods, fetchBillingMethods, fetchSellers } from "../api";
import { calculateEstimatedDeliveryDate } from "../utils";
import FormSection from "@apps/consumer/checkout/Form/FormSection";
import { FormConfig, DataLists } from "../interfaces";
import { getFormConfig } from "./formConfig";
import { useFormContext } from "react-hook-form";

interface FormProps {
  dataLists: DataLists;
  setDataLists: (dataLists: DataLists) => void;
}

function Form({ dataLists, setDataLists }: FormProps) {
  const { setValue, getValues, watch } = useFormContext<FormConfig>();
  const [formConfig, setFormConfig] = useState<FormConfig>(getFormConfig(dataLists));
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
      const countryObj = dataLists.countries.find(
        (country) => country.name === shippingCountry
      );
      const newStates = countryObj ? countryObj.states.map((s) => s.name) : [];

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
        setValue("shipping.state", newStates[0]);
      }
    }
  }, [shippingCountry, dataLists.countries, setFormConfig, getValues, setValue]);

  // Actualizar estados dependiendo del país (para facturación)

  const billingCountry = watch("billing.country");

  useEffect(() => {
    if (billingCountry) {
      const countryObj = dataLists.countries.find(
        (country) => country.name === billingCountry
      );
      const newStates = countryObj ? countryObj.states.map((s) => s.name) : [];

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
        setValue("billing.state", newStates[0]);
      }
    }
  }, [billingCountry, dataLists.countries, setFormConfig, setValue]);

  // Si se decide usar los mismos datos para envío o facturación
  useEffect(() => {
    const sections = ["shipping", "billing"];
    sections.map((section) => {
      if (state?.[section]?.[`${section}EqualsBasic`]) {
        setValue(section, {
          ...getValues(section),
          name: basicFields[0],
          lastName: basicFields[1],
          ci: basicFields[2],
          email: basicFields[3],
          phone: basicFields[4],
        });
      }
    });
  }, [state.shipping?.shippingEqualsBasic, ...basicFields, setValue]);

  // Si se cambia entre Pickup y Delivery
  
  const shippingMethod = watch("shipping.method");

  useEffect(() => {
    const updatedFormConfig = { ...formConfig };

    Object.keys(updatedFormConfig.shipping.fields).forEach((fieldKey) => {
      updatedFormConfig.shipping.fields[fieldKey].isHidden =
        shippingMethod === "Pickup" &&
        fieldKey !== "method" &&
        fieldKey !== "date";

      updatedFormConfig.shipping.fields[fieldKey].required =
        !(shippingMethod === "Pickup" &&
          fieldKey !== "method" &&
          fieldKey !== "date");
    });

    setFormConfig(updatedFormConfig);
  }, [shippingMethod]);

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

        const shippingMethods = await fetchShippingMethods();
        const paymentMethods = await fetchBillingMethods();
        const sellers = await fetchSellers();

        setDataLists({ ...dataLists, sellers, shippingMethods, paymentMethods });

        const updatedFormConfig = getFormConfig({
          ...dataLists,
          sellers,
          shippingMethods,
          paymentMethods,
        });
        setFormConfig(updatedFormConfig);


        const estimatedDeliveryDate = getValues(
          "order.shipping.estimatedDeliveryDate"
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
  }, [lines, setValue, getValues, dataLists, setDataLists]);

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