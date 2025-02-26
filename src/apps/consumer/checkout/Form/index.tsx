import React, { useEffect, useRef, useState } from "react";

import { fetchConsumer, fetchShippingMethods, fetchBillingMethods, fetchSellers } from "../api";
import { calculateEstimatedDeliveryDate } from "../utils";
import FormSection from "@apps/consumer/checkout/Form/FormSection";
import { FormConfig, DataLists } from "../interfaces";
import { getFormConfig } from "./formConfig";
import { useFormContext } from "react-hook-form";
import { requiresDelivery } from "./helpers";

interface FormProps {
  dataLists: DataLists;
  setDataLists: (dataLists: DataLists) => void;
}

function Form<FormProps>({ dataLists, setDataLists }) {
  const { setValue, getValues, watch } = useFormContext<FormConfig>();  
  const [formConfig, setFormConfig] = useState<FormConfig>(getFormConfig(dataLists));
  const state = watch();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const order = state.order;
  const lines = state.order?.lines;
  const isFetched = useRef(false);
  const basicFields = watch([
    "basic.name",
    "basic.lastName",
    "basic.id",
    "basic.email",
    "basic.phone",
  ]);
  
  const shippingMethod = watch("shipping.method");

  useEffect(() => {
    const sections = ["shipping", "billing"];
    sections.map((section) => {
      if(state?.[section]?.[`${section}EqualsBasic`]) {
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

  // Set shipping and billing states based on selected country
  useEffect(() => {
    const shippingSelectedCountry = state?.shipping?.country || "Venezuela";
    const shippingCountryDetails = dataLists.countries.find((c) => c.name === shippingSelectedCountry);
    const shippingStates = shippingCountryDetails ? shippingCountryDetails.states.map((state) => state.name) : [];
    setValue("shippingStates", shippingStates);
  }, [state?.shipping?.country, dataLists.countries, setValue]);
  
  useEffect(() => {
    const billingSelectedCountry = state?.shipping?.country || "Venezuela";
    const billingCountryDetails = dataLists.countries.find((c) => c.name === billingSelectedCountry);
    const billingStates = billingCountryDetails ? billingCountryDetails.states.map((state) => state.name) : [];
    setValue("billingStates", billingStates);
  }, [state?.billing?.country, dataLists.countries, setValue]);

  //When multiple Hidding conditions, this should be a hook.
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

        setDataLists({ sellers, shippingMethods, paymentMethods, ...dataLists });
        
        const billingStates = watch("billingStates") || [];
        const shippingStates = watch("shippingStates") || [];
        const updatedFormConfig = getFormConfig({ ...dataLists, sellers, shippingMethods, paymentMethods, shippingStates, billingStates });
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
            order={order}
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