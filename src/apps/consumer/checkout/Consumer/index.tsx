import React, { useEffect, useRef } from "react";

import { fetchConsumer, fetchShippingMethods, fetchBillingMethods, fetchSellers } from "../api";
import { calculateEstimatedDeliveryDate } from "../utils";
import FormSection from "@apps/consumer/checkout/Consumer/FormSection";
import { CheckoutState, CheckoutAction } from "../interfaces";
import { getFormConfig } from "./formConfig";

interface ConsumerFormProps {
  checkoutState: CheckoutState;
  handleDispatch: (type: CheckoutAction['type'], payload: any) => void;
}

function ConsumerForm({ checkoutState, handleDispatch }: ConsumerFormProps) {
  const isFetched = useRef(false); 

useEffect(() => {
  if (isFetched.current) return;
  isFetched.current = true;
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (token) {
        const consumerDetails = await fetchConsumer(token);
        if (consumerDetails) {
          // handleDispatch("SET_CONSUMER_DETAILS", consumerDetails);
        }
      }

      const shippingMethods = await fetchShippingMethods();
      handleDispatch("SET_SHIPPING_METHODS", shippingMethods);
      

      const billingMethods = await fetchBillingMethods();
      handleDispatch("SET_PAYMENT_METHODS", billingMethods);

      const sellers = await fetchSellers();
      handleDispatch("SET_SELLERS", sellers);
      
      if (!checkoutState.order?.shipping?.estimatedDeliveryDate) {
        const estimatedDate = calculateEstimatedDeliveryDate(
          checkoutState.order?.lines
        );
        if (estimatedDate) {
          handleDispatch( "SET_SHIPPING_DETAILS", { estimatedDeliveryDate: estimatedDate });
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
}, [handleDispatch, checkoutState]);

  const handleAccordionExpansion = (sectionKey) => () => {
    handleDispatch("SET_EXPANDED_SECTION", sectionKey);
  };

  const formConfig = getFormConfig(checkoutState);
  
  return (
    <>
      {Object.keys(formConfig).map((sectionKey) => {
        const sectionConfig = formConfig[sectionKey];
        const sectionData = (() => {
          if (sectionKey === 'general') {
            return checkoutState.order;
          } else if (sectionKey === 'basic') {
            return checkoutState.order.consumerDetails.basic || {};
          } else if (sectionKey === 'shipping') {
            return checkoutState.order.shipping || {};
          } else if (sectionKey === 'billing') {
            return checkoutState.order.billing || {};
          } else {
            return {};
          }
        })();
        
        const sourceData = {
          shippingEqualsBasic: {
            ...checkoutState.order.consumerDetails.basic,
            address: checkoutState.order.consumerDetails.addresses?.[0],
          },
          billingEqualsBasic: {
            ...checkoutState.order.consumerDetails.basic,
            id: checkoutState.order.consumerDetails.basic.id,
            address: checkoutState.order.shipping.address,
            companyName: "",
          },
        };
        
        return (
          <FormSection
            sectionKey={sectionKey}
            sectionConfig={sectionConfig}
            sectionData={sectionData}
            sourceData={sourceData}
            handleDispatch={handleDispatch}
            expanded={checkoutState.expandedSection === sectionKey}
            onChange={handleAccordionExpansion(sectionKey)}
          />
        );
      })}
    </>
  );
}

export default ConsumerForm;