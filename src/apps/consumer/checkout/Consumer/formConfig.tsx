// getFormConfig.tsx

import React from 'react';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import { CheckoutState, CheckoutAction } from '../interfaces';

// Type for the errorCheck function used in form fields
type FormFieldErrorCheck = (value: any, data?: any) => boolean;

interface FormFieldConfig {
  label: string;
  errorCheck?: FormFieldErrorCheck;
  helperText?: string;
  width?: number;
  adornment?: React.ReactNode;
  multiline?: boolean;
  minRows?: number;
  required?: boolean;
  type?: string; // e.g., 'dropdown', 'date'
  options?: string[];
  actionType?: CheckoutAction['type'];
  renderKey?: string;
  dataKey?: string;
  tooltip?: string;
  [key: string]: any; // To allow additional properties if needed
}

interface CheckboxConfig {
  label: string;
  type: string;
  activeFields: string[];
  checked?: boolean;
}

interface FormSectionConfig {
  title: string;
  fieldsTitle?: string;
  fields: { [fieldKey: string]: FormFieldConfig };
  actionType?: CheckoutAction['type'];
  additionalFieldsPosition?: string;
  additional?: { [fieldKey: string]: FormFieldConfig };
  checkboxes?: CheckboxConfig[];
  defaultCheckbox?: string;
  headerLabel?: string;
  headerValue?: string[];
  [key: string]: any;
}

interface FormConfig {
  [sectionKey: string]: FormSectionConfig;
}

export function getFormConfig(checkoutState: CheckoutState): FormConfig {
  const formConfig: FormConfig = {
    basic: {
      title: "Datos Básicos",
      fields: {
        name: {
          label: "Nombre",
          errorCheck: (value) => value?.length >= 2,
          helperText: "Formato no válido.",
          width: 4,
        },
        lastName: {
          label: "Apellido",
          errorCheck: (value) => value?.length >= 2,
          helperText: "Formato no válido.",
          width: 4,
        },
        id: {
          label: "CI",
          errorCheck: (value) => /^(?:[VEJ]-?)?\d{7,8}$/.test(value),
          helperText: "ej: V12345679 ó 12345678",
          width: 4,
        },
        phone: {
          label: "Teléfono",
          errorCheck: (value) => /^[0-9]{10,14}$/.test(value),
          helperText: "ej: 584141234567 ó +584141234567 ó 04143201028",
          adornment: <LocalPhoneIcon color="secondary" />,
        },
        email: {
          label: "Correo",
          errorCheck: (value) => /\S+@\S+\.\S+/.test(value),
          helperText: "Formato no válido.",
          adornment: <EmailIcon color="secondary" />,
        },
        line1: {
          label: "Dirección (Linea 1)",
          errorCheck: (value) => value?.length >= 20,
          helperText: "Incluir todos los detalles posibles, incluidas referencias.",
          minRows: 3,
          adornment: <HomeIcon color="secondary" />,
          width: 12,
        },
        line2: {
          label: "Dirección (Linea 2)",
          errorCheck: (value) => value?.length >= 20,
          helperText: "Incluir todos los detalles posibles, incluidas referencias.",
          minRows: 3,
          adornment: <HomeIcon color="secondary" />,
          width: 12,
        },
        city: {
          label: "Ciudad",
          errorCheck: (value) => value?.length >= 2,
          helperText: "Formato no válido.",
          width: 4,
        },
        state: {
          label: "Estado",
          errorCheck: (value) => value?.length >= 2,
          helperText: "Formato no válido.",
          width: 4,
        },
        country: {
          label: "País",
          errorCheck: (value) => value?.length >= 2,
          helperText: "Formato no válido.",
          width: 4,
        },
        zipCode: {
          label: "Código Postal",
          errorCheck: (value) => /^\d{5}$/.test(value),
          helperText: "Formato no válido.",
          width: 4,
        },
        reference: {
          label: "Referencia",
          errorCheck: (value) => value?.length >= 2,
          helperText: "Formato no válido.",
          width: 4,
        },
        // address: {
        //   label: "Dirección",
        //   errorCheck: (value) => value?.length >= 20,
        //   helperText: "Incluir todos los detalles posibles, incluidas referencias.",
        //   multiline: true,
        //   minRows: 3,
        //   adornment: <HomeIcon color="secondary" />,
        //   width: 12,
        //   actionType: "SET_CONSUMER_ADDRESS",
        //   },
      },
      actionType: "SET_CONSUMER_BASIC",
    },
    shipping: {
      title: "Datos de Envío",
      fieldsTitle: "Dirección de Envío",
      fields: {
        name: {
          label: "Nombre",
          errorCheck: (value) => value?.length >= 2,
          helperText: "Formato no válido.",
          width: 4,
        },
        lastName: {
          label: "Apellido",
          errorCheck: (value) => value?.length >= 2,
          helperText: "Formato no válido.",
          width: 4,
        },
        email: {
          label: "Correo",
          errorCheck: (value) => /\S+@\S+\.\S+/.test(value),
          helperText: "Formato no válido.",
          adornment: <EmailIcon color="secondary" />,
        },
        phone: {
          label: "Teléfono",
          errorCheck: (value) => /^[0-9]{10,14}$/.test(value),
          helperText: "ej: 584141234567 ó +584141234567 ó 04143201028",
          adornment: <LocalPhoneIcon color="secondary" />,
        },
        address: {
          label: "Dirección de Envío",
          errorCheck: (value) => value?.length >= 20,
          helperText: "Incluir todos los detalles posibles, incluidas referencias.",
          multiline: true,
          minRows: 3,
          adornment: <HomeIcon color="secondary" />,
          width: 12,
        },
      },
      additional: {
        ShippingMethod: {
          label: "Método de Entrega",
          type: "dropdown",
          errorCheck: (value) => value?.length >= 2,
          helperText: "Formato no válido.",
          options: checkoutState.shippingMethods?.map((method) => method.name) || [],
          actionType: "SET_SHIPPING_DETAILS",
          renderKey: "shipping", 
          dataKey: "shipping", 
        },
        date: {
          label: "Fecha de Entrega",
          type: "date",
          errorCheck: (value) => value && !isNaN(Date.parse(value)),
          helperText: "Ingrese una fecha válida.",
          actionType: "SET_SHIPPING_DETAILS",
          renderKey: "shipping", 
          dataKey: "shipping", 
        },
      },
      checkboxes: [{ label: "Igual a datos básicos", type: "shippingEqualsBasic", activeFields: ["ShippingMethod", "date"], checked: true }],
      actionType: "SET_SHIPPING_DETAILS",
      defaultCheckbox: "shippingEqualsBasic",
      headerLabel: "Enviado a:",
      headerValue: ["name", "lastName"],
      additionalFieldsPosition: "start",
    },
    billing: {
      title: "Datos de Facturación",
      fieldsTitle: "Dirección de Facturación",
      fields: {
        name: {
          label: "Nombre",
          errorCheck: (value) => value?.length >= 2,
          helperText: "Formato no válido.",
        },
        lastName: {
          label: "Apellido",
          errorCheck: (value) => value?.length >= 2,
          helperText: "Formato no válido.",
        },
        companyName: {
          label: "Razón Social",
          helperText: "Formato no válido.",
          required: false,
        },
        ci: {
          label: "Cédula o RIF",
          errorCheck: (value, data) => {
            return data && data.companyName ? /^J-\d{8}-\d$/.test(value) : /^(?:[VEJ]-?)?\d{7,8}$/.test(value);
          },
          helperText:
            "Debe ser 12345678, V-12345679, E-12345679, o exactamente J-00012345-6 si es persona jurídica.",
        },
        email: {
          label: "Correo",
          errorCheck: (value) => /\S+@\S+\.\S+/.test(value),
          helperText: "Formato no válido.",
          adornment: <EmailIcon color="secondary" />,
        },
        phone: {
          label: "Teléfono",
          errorCheck: (value) => /^[0-9]{10,14}$/.test(value),
          helperText: "ej: 584141234567 ó +584141234567 ó 04143201028",
          adornment: <LocalPhoneIcon color="secondary" />,
        },
        address: {
          label: "Dirección de Facturación",
          errorCheck: (value) => value?.length >= 5,
          multiline: true,
          minRows: 3,
          adornment: <BusinessIcon />,
          width: 12,
        },
      },
      additionalFieldsPosition: "start",
      additional: {
        paymentMethod: {
          label: "Método de Pago",
          type: "dropdown",
          errorCheck: (value) => value?.length >= 2,
          helperText: "Formato no válido.",
          options: checkoutState.paymentMethods?.map((method) => method.name) || [],
          actionType: "SET_PAYMENT_METHOD",
          renderKey: "billing", 
          dataKey: "billing",
        },
      },
      checkboxes: [
        { label: "Igual a datos básicos", type: "billingEqualsBasic", activeFields: ["paymentMethod"], checked: true },
      ],
      actionType: "SET_BILLING_DETAILS",
      defaultCheckbox: "billingEqualsBasic",
      headerLabel: "Facturado con:",
      headerValue: ["paymentMethod"],
    },
    general: {
      title: "Detalles de la Orden",
      fields: {
        observations: {
          label: "Observaciones",
          helperText: "Incluir todos los detalles posibles.",
          actionType: "SET_OBSERVATIONS",
          multiline: true,
          minRows: 3,
          required: false,
        },
      },
      additionalFieldsPosition: "start",
      additional: {
        seller: {
          label: "Vendedor",
          type: "dropdown",
          errorCheck: (value) => value?.length >= 2,
          helperText: "Formato no válido.",
          options: checkoutState.sellers || [],
          actionType: "SET_SELLER",
          tooltip: "¿Alguno de nuestros asesores te ayudó en el proceso de compra?",
          required: false,
        },
      },
    }
  };

  return formConfig;
}
