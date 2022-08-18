import axios from 'axios';


    const state = {
        orders: [],
        selectedOrder: undefined,
        nextId: 1,
        admin: JSON.parse(localStorage.getItem("adminToken")),
    };


//INIT
    const init = async ()=> {
        const base_url= process.env.REACT_APP_BACKEND_URL + "/order/read-all";
        const response = await axios.post(base_url);
        if(response.data.length !== 0) {
            return Object.assign({}, state, {
                orders: response.data,
                nextId: response.data[response.data.length].orderId
            });
        } else {
            return state;
        }
    };

    const initBlankOrder = async (input)=> {
        const o = {
          'orderId': input.order.nextId,
          'consumerId': '',
          'orderType' : 'Venta',
          'createdOn' : new Date(),
          'createdBy': input.order.admin,
          'subtotal' : 0,
          'tax': 0,
          'total' : 0,
          'shippingAddress' : '',
          'billingAddress' : '',
          'shippingPhone' : '',
          'internalShippingMethod': 'Yalo',
          'domesticShippingMethod' : 'No aplica',
          'internationalShippingMethod': 'No aplica',
          'paymentMethodID' : '',
          'generalProductionStatus' : 'Por solicitar',
          'paymentStatus': 'Por pagar',
          'shippingStatus' : 'Por entregar',
          'observations': '',
          'isSaleByPrixer' : false,
          'consumer': '',
          'prix': [{
              'product': '',
              'art': '',
              'arts': []
          }],
          'products': [],
          'consumers': []
        };

        return Object.assign({}, input.order, {
            selectedOrder: o
        });
    }


//CRUD
    // const createOrder = ()=> {

    // };

    // const readOrder = ()=> {

    // };

    // const deleteOrder = ()=> {

    // };

    const updateSelectedOrder = (input)=> {
        if(Array.isArray(input.value)) {
            input.orderState.selectedOrder[input.key].push(input.value);
        } else {
            input.orderState.selectedOrder[input.key] = input.value;
        }
        return Object.assign({}, input.orderState, {
            selectedOrder: input.orderState.selectedOrder,
          });
    };

    const updateSelectedPrix = (input)=> {
        if(Array.isArray(input.value)) {
            input.prix[input.key].push(input.value[0]);
        } else {
            input.prix[input.key] = input.value[0];
        }
        return Object.assign({}, input, {
            prix: input.prix
        });
    };

const oS = {
    init,
    initBlankOrder,
    updateSelectedOrder,
    updateSelectedPrix
}

export default oS;