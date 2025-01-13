import React, { useEffect, useRef } from "react";

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

function Form<FormProps>({ dataLists, setDataLists }) {
  const { setValue, getValues, watch } = useFormContext<FormConfig>();  
  const state = watch();
  const order = state.order;
  const lines = state.order?.lines;
  const isFetched = useRef(false);
  const basicFields = watch([
    "basic.name",
    "basic.lastName",
    "basic.id",
    "basic.email",
    "basic.phone",
    "basic.line1",
    "basic.line2",
    "basic.city",
    "basic.state",
    "basic.country",
    "basic.zipCode",
  ]);

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
        setDataLists({ sellers, shippingMethods, paymentMethods });
        
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

  useEffect(() => {
    console.log("Basic fields changed", basicFields);
    console.log("State", state);
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
            line1: basicFields[5],
            line2: basicFields[6],
            city: basicFields[7],
            state: basicFields[8],
            country: basicFields[9],
            zipCode: basicFields[10],
          });
        }
      });
  }, [state.shipping?.shippingEqualsBasic, ...basicFields, setValue]);

  const formConfig = getFormConfig(dataLists);
  return (
    <>
      {Object.keys(formConfig).map((sectionKey) => {
        const sectionConfig = formConfig[sectionKey];
        return (
          <FormSection
            order={order}
            sectionKey={sectionKey}
            sectionConfig={sectionConfig}
          />
        );
      })}
    </>
  );
}

export default Form;