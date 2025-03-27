import axios from 'axios';

const state = {
  orders: [],
  selectedOrder: undefined,
  nextId: 1,
};

//INIT
const init = async () => {
  const base_url = import.meta.env.VITE_BACKEND_URL + '/order/read-all';
  const response = await axios.post(base_url);
  if (response.data.length !== 0) {
    return Object.assign({}, state, {
      orders: response.data,
      // nextId: response.data[response.data.length].orderId
    });
  } else {
    return state;
  }
};

const initBlankOrder = async (input) => {
  const o = {
    orderId: input.order.nextId,
    consumerId: '',
    orderType: 'Venta',
    createdOn: new Date(),
    createdBy: input.order.admin,
    subtotal: 0,
    tax: 0,
    total: 0,
    shippingAddress: '',
    billingAddress: '',
    shippingPhone: '',
    internalShippingMethod: 'Yalo',
    domesticShippingMethod: 'No aplica',
    internationalShippingMethod: 'No aplica',
    paymentMethodID: '',
    generalProductionStatus: 'Por solicitar',
    paymentStatus: 'Por pagar',
    shippingStatus: 'Por entregar',
    observations: '',
    isSaleByPrixer: false,
    consumer: '',
    prix: [
      {
        product: '',
        art: '',
        arts: [],
      },
    ],
    products: [],
    consumers: [],
  };

  return Object.assign({}, input.order, {
    selectedOrder: o,
  });
};

//CRUD
// const createOrder = ()=> {

// };

// const readOrder = ()=> {

// };

// const deleteOrder = ()=> {

// };

const updateSelectedOrder = (input) => {
  if (Array.isArray(input.value)) {
    input.orderState.selectedOrder[input.key].push(input.value);
  } else {
    input.orderState.selectedOrder[input.key] = input.value;
  }
  return Object.assign({}, input.orderState, {
    selectedOrder: input.orderState.selectedOrder,
  });
};

const updateSelectedPrix = (input) => {
  if (Array.isArray(input.value)) {
    input.prix[input.key].push(input.value[0]);
  } else {
    input.prix[input.key] = input.value[0];
  }
  return Object.assign({}, input, {
    prix: input.prix,
  });
};

const getProductsAttributes = (products) => {
  let lol = products;
  lol = products.map((p, i) => {
    let att = [];
    p.variants.map((v) => {
      if (v.active) {
        if (att.length == 0) {
          att = [...new Set(v.attributes.flatMap((a) => a))];
        } else {
          att.push(...new Set(v.attributes.flatMap((a) => a)));
        }
      }
    });
    const result = [...new Set(att.flatMap(({ name }) => name))];
    const res1 = [
      ...new Set(
        result.map((a) => {
          return {
            name: a,
            value: [
              ...new Set(
                att.map((v) => {
                  if (v.name == a && v.value) {
                    return v.value;
                  }
                })
              ),
            ].filter((a) => a),
          };
        })
      ),
    ];
    p.attributes = res1;
    p.selection = [];
    p.selection.length = p.attributes.length;

    return p;
  });
  return lol;
};

const structureEquation = (equation, i, width, height) => {
  let eq = '';
  let x = equation.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  x.split(/[\s{}}]+/).map((n, j, arr) => {
    if (n == 'width') {
      eq = eq.concat(width[i] || 0);
    } else if (n == 'height') {
      eq = eq.concat(height[i] || 0);
    } else {
      eq = eq.concat(n);
    }
  });
  return eq;
};

const getEquation = async (product, iProd, productArr, width, height) => {
  if (product.selection?.length === 2) {
    const filteredVars = await product.variants.filter((v, i) => {
      if (v.attributes && v.attributes.length === 2) {
        return (
          v.attributes[0].value === product.selection[0] &&
          v.attributes[1].value === product.selection[1]
        );
      }
    });
    if (filteredVars.length != 0) {
      if (filteredVars[0].publicPrice.equation && filteredVars[0].prixerPrice?.equation) {
        productArr[iProd].needsEquation = true;

        productArr[iProd].publicEquation =
          structureEquation(filteredVars[0].publicPrice.equation, iProd, width, height) || 0;

        productArr[iProd].prixerEquation =
          structureEquation(filteredVars[0].prixerPrice.equation, iProd, width, height) || 0;
      } else if (filteredVars[0].publicPrice.equation) {
        productArr[iProd].needsEquation = true;
        productArr[iProd].publicEquation =
          structureEquation(filteredVars[0].publicPrice.equation, iProd, width, height) || 0;
      }
    } else {
      productArr[iProd].needsEquation = false;
    }
  } else if (typeof product.selection === 'string' && product.attributes.length === 1) {
    const filteredVars = await product.variants.filter((v, i) => {
      if (v.attributes && v.attributes.length === 1) {
        return v.attributes.every((a) => product.selection.includes(a.value));
      } else {
        return;
      }
    });

    if (filteredVars.length != 0) {
      if (filteredVars[0].publicPrice.equation && filteredVars[0].prixerPrice?.equation) {
        productArr[iProd].needsEquation = true;
        productArr[iProd].publicEquation =
          structureEquation(
            filteredVars[0].publicPrice.equation,

            iProd,
            width,
            height
          ) || 0;
        productArr[iProd].prixerEquation =
          structureEquation(filteredVars[0].prixerPrice.equation, iProd, width, height) || 0;
      } else if (filteredVars[0].publicPrice.equation) {
        productArr[iProd].needsEquation = true;
        productArr[iProd].publicEquation =
          structureEquation(filteredVars[0].publicPrice.equation, iProd, width, height) || 0;
      }
    } else {
      productArr[iProd].needsEquation = false;
    }
  } else {
    productArr[iProd].needsEquation = false;
    productArr[iProd].publicEquation = '';
    productArr[iProd].prixerEquation = '';
  }
  return productArr;
};

const oS = {
  init,
  initBlankOrder,
  updateSelectedOrder,
  updateSelectedPrix,
  getProductsAttributes,
  getEquation,
};

export default oS;
