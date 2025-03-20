import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn'; // Para campos de ubicación
import PersonIcon from '@mui/icons-material/Person'; // Para campos de nombre
import DescriptionIcon from '@mui/icons-material/Description'; // Para campos de observaciones
import PaymentIcon from '@mui/icons-material/Payment';

import { createMirrorHandler, isPickup } from './helpers';
import { DataLists, FormConfig } from '../../../../types/order.types';

export function getFormConfig({ paymentMethods, shippingMethods, countries, sellers, billingStates, shippingStates }: DataLists): FormConfig {

  const formConfig: FormConfig = {
    basic: {
      title: "Datos Básicos",
      fields: {
        name: {
          label: "Nombre",
          errorCheck: (value) => value?.length >= 2,
          width: 4,
        },
        lastName: {
          label: "Apellido",
          errorCheck: (value) => value?.length >= 2,
          width: 4,
        },
        id: {
          label: "CI",
          adornment: <PersonIcon color="secondary" />,
          errorCheck: (value) => /^(?:[VEJ]-?)?\d{6,8}$/.test(value),
          helperText: "ej: V12345679 ó 12345678",
          width: 4,
        },
        phone: {
          label: "Teléfono",
          errorCheck: (value) => /^(?=(?:\D*\d){10,14}$)(?:(\+\d{1,3}\s?\d+)|(0\d+))$/.test(value),
          helperText: "ej: +584141234567 ó 04143201028",
          adornment: <LocalPhoneIcon color="secondary" />,
          width: 5,
        },
        email: {
          label: "Correo",
          errorCheck: (value) => /\S+@\S+\.\S+/.test(value),
          adornment: <EmailIcon color="secondary" />,
          width: 7,
        },
        shortAddress: {
          label: "Dirección corta",
          errorCheck: (value) => value?.length <= 40,
          helperText: "ej: Terrazas del Ávila",
          adornment: <HomeIcon color="secondary" />,
          width: 12,
        },
      },
      actionType: "SET_CONSUMER_BASIC",
    },
    shipping: {
      title: "Envío",
      fieldsTitle: "Dirección de Envío",
      fields: {
        method: {
          label: "Método de Entrega",
          type: "dropdown",
          errorCheck: (value) => value?.length >= 2,
          adornment: <TwoWheelerIcon color="secondary" />,
          options: shippingMethods?.map((method) => method.method) || [],
          actionType: "SET_SHIPPING_DETAILS",
          renderKey: "shipping",
          width: 5,
        },
        date: {
          label: "Fecha de Entrega deseada",
          type: "date",
          errorCheck: (value) => value && !isNaN(Date.parse(value)),
          helperText: "Ingrese una fecha válida.",
          actionType: "SET_SHIPPING_DETAILS",
          renderKey: "shipping",
          width: 7,
        },
        shippingEqualsBasic: {
          label: "Igual a datos básicos",
          type: "checkbox",
          defaultValue: true,
          width: 12,
        },
        name: {
          label: "Nombre",
          errorCheck: (value) => value?.length >= 2,
          width: 6,
          conditionedBy: "shipping.shippingEqualsBasic",
          onConditionChange: createMirrorHandler("shipping.name", "basic.name"),
          hiddingConditions: [(methodSelected: string) => isPickup(methodSelected)],
          requiredConditions: [(methodSelected: string) => isPickup(methodSelected)]
        },
        lastName: {
          label: "Apellido",
          errorCheck: (value) => value?.length >= 2,
          width: 6,
          conditionedBy: "shipping.shippingEqualsBasic",
          onConditionChange: createMirrorHandler("shipping.lastName", "basic.lastName"),
          hiddingConditions: [(methodSelected: string) => isPickup(methodSelected)],
          requiredConditions: [(methodSelected: string) => isPickup(methodSelected)]
        },
        phone: {
          label: "Teléfono",
          errorCheck: (value) => /^(?=(?:\D*\d){10,14}$)(?:(\+\d{1,3}\s?\d+)|(0\d+))$/.test(value),
          helperText: "ej: +584141234567 ó 04143201028",
          adornment: <LocalPhoneIcon color="secondary" />,
          conditionedBy: "shipping.shippingEqualsBasic",
          onConditionChange: createMirrorHandler("shipping.phone", "basic.phone"),
          hiddingConditions: [(methodSelected: string) => isPickup(methodSelected)],
          requiredConditions: [(methodSelected: string) => isPickup(methodSelected)],
          width: 5,
        },
        email: {
          label: "Correo",
          errorCheck: (value) => /\S+@\S+\.\S+/.test(value),
          adornment: <EmailIcon color="secondary" />,
          conditionedBy: "shipping.shippingEqualsBasic",
          onConditionChange: createMirrorHandler("shipping.email", "basic.email"),
          hiddingConditions: [(methodSelected: string) => isPickup(methodSelected)],
          requiredConditions: [(methodSelected: string) => isPickup(methodSelected)],
          width: 7,
        },
        line1: {
          label: "Dirección (Linea 1)",
          errorCheck: (value) => value?.length >= 20,
          helperText: "Incluir todos los detalles posibles.",
          minRows: 3,
          adornment: <HomeIcon color="secondary" />,
          width: 12,
          hiddingConditions: [(methodSelected: string) => isPickup(methodSelected)],
          requiredConditions: [(methodSelected: string) => isPickup(methodSelected)]
        },
        line2: {
          label: "Dirección (Linea 2)",
          helperText: "Incluir todos los detalles posibles.",
          minRows: 3,
          adornment: <HomeIcon color="secondary" />,
          width: 12,
          required: false,
          hiddingConditions: [(methodSelected: string) => isPickup(methodSelected)],
        },
        reference: {
          label: "Referencia",
          adornment: <HomeIcon color="secondary" />,
          errorCheck: (value) => value?.length >= 2,
          width: 12,
          minRows: 3,
          hiddingConditions: [(methodSelected: string) => isPickup(methodSelected)],
          requiredConditions: [(methodSelected: string) => isPickup(methodSelected)]
        },
        country: {
          label: "País",
          defaultValue: "Venezuela",
          type: "dropdown",
          options: countries?.map((s) => s.name) || [],
          errorCheck: (value) => value?.length >= 2,
          width: 5,
          hiddingConditions: [(methodSelected: string) => isPickup(methodSelected)],
          requiredConditions: [(methodSelected: string) => isPickup(methodSelected)]
        },
        state: {
          label: "Estado",
          defaultValue: "Miranda",
          type: "dropdown",
          options: shippingStates,
          errorCheck: (value) => value?.length >= 2,
          width: 7,
          hiddingConditions: [(methodSelected: string) => isPickup(methodSelected)],
          requiredConditions: [(methodSelected: string) => isPickup(methodSelected)]
        },
        city: {
          label: "Ciudad",
          errorCheck: (value) => value?.length >= 2,
          width: 8,
          hiddingConditions: [(methodSelected: string) => isPickup(methodSelected)],
          requiredConditions: [(methodSelected: string) => isPickup(methodSelected)]
        },
        zipCode: {
          label: "Código Postal",
          adornment: <LocationOnIcon color="secondary" />,
          errorCheck: (value) => !value || /^\d{4}$/.test(value),
          width: 4,
          required: false,
          hiddingConditions: [(methodSelected: string) => isPickup(methodSelected)],
        },
      },
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
        billingEqualsBasic: {
          label: "Igual a datos básicos",
          type: "checkbox",
          defaultValue: true,
          width: 12,
        },
        name: {
          label: "Nombre",
          errorCheck: (value) => value?.length >= 2,
          width: 6,
          conditionedBy: [
            "billing.billingEqualsBasic",
          ],
          onConditionChange: createMirrorHandler("billing.name", [
            "basic.name",
          ]),
        },
        lastName: {
          label: "Apellido",
          errorCheck: (value) => value?.length >= 2,
          width: 6,
          conditionedBy: "billing.billingEqualsBasic",
          onConditionChange: createMirrorHandler("billing.lastName", "basic.lastName"),
        },
        companyName: {
          label: "Razón Social",
          adornment: <BusinessIcon color="secondary" />,
          required: false,
        },
        id: {
          label: "Cédula o RIF",
          adornment: <PersonIcon color="secondary" />,
          errorCheck: (value, data) => {
            return data && data.companyName ? /^J-\d{8}-\d$/.test(value) : /^(?:[VEJ]-?)?\d{6,8}$/.test(value);
          },
          helperText:
            "ej: 12345678, V-12345679, E-12345679, o exactamente J-00012345-6 si es persona jurídica.",
          onConditionChange: (value, data) => {
            const billingEqualsBasic = data?.getValues('billing.billingEqualsBasic');
            const companyName = data?.getValues('companyName');
            // If "Igual a datos básicos" is active and Razón Social is empty, mirror basic.id
            if (billingEqualsBasic && !companyName) {
              return createMirrorHandler("billing.id", "basic.id")(value, data);
            }
            // Otherwise, allow the field to be edited
            return value;
          },
        },
        phone: {
          label: "Teléfono",
          errorCheck: (value) => /^[0-9]{10,14}$/.test(value),
          helperText: "ej: 584141234567 ó +584141234567 ó 04143201028",
          adornment: <LocalPhoneIcon color="secondary" />,
          conditionedBy: "billing.billingEqualsBasic",
          onConditionChange: createMirrorHandler("billing.phone", "basic.phone"),
          width: 5,
        },
        email: {
          label: "Correo",
          errorCheck: (value) => /\S+@\S+\.\S+/.test(value),
          adornment: <EmailIcon color="secondary" />,
          conditionedBy: "billing.billingEqualsBasic",
          onConditionChange: createMirrorHandler("billing.email", "basic.email"),
          width: 7,
        },
        line1: {
          label: "Dirección (Linea 1)",
          errorCheck: (value) => value?.length >= 20,
          helperText: "Incluir todos los detalles posibles.",
          minRows: 3,
          adornment: <HomeIcon color="secondary" />,
          width: 12,
        },
        line2: {
          label: "Dirección (Linea 2)",
          helperText: "Incluir todos los detalles posibles.",
          minRows: 3,
          adornment: <HomeIcon color="secondary" />,
          width: 12,
          required: false,
        },
        country: {
          label: "País",
          defaultValue: "Venezuela",
          type: "dropdown",
          options: countries?.map((s) => s.name) || [],
          errorCheck: (value) => value?.length >= 2,
          width: 5,
        },
        state: {
          label: "Estado",
          defaultValue: "Miranda",
          type: "dropdown",
          options: billingStates,
          errorCheck: (value) => value?.length >= 2,
          width: 7,
        },
        city: {
          label: "Ciudad",
          errorCheck: (value) => value?.length >= 2,
          width: 8,
        },
        zipCode: {
          label: "Código Postal",
          adornment: <LocationOnIcon color="secondary" />,
          errorCheck: (value) => !value || /^\d{4}$/.test(value),
          width: 4,
          required: false,
        },
        paymentMethod: {
          label: "Método de Pago",
          type: "dropdown",
          adornment: <PaymentIcon color="secondary" />,
          errorCheck: (value) => value?.length >= 2,
          options: paymentMethods?.map((method) => method.name) || [],
          actionType: "SET_PAYMENT_METHOD",
          renderKey: "billing",
        },
      },
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
          adornment: <DescriptionIcon color="secondary" />,
          helperText: "Incluir todos los detalles posibles.",
          actionType: "SET_OBSERVATIONS",
          multiline: true,
          minRows: 1,
          required: false,
          width: 6,
        },
        seller: {
          label: "Vendedor",
          type: "dropdownWithTooltip",
          options: sellers || [],
          actionType: "SET_SELLER",
          tooltip: "¿Alguno de nuestros asesores te ayudó en el proceso de compra?",
          required: false,
          width: 6,
        },
      },
    }
  };

  return formConfig;
}