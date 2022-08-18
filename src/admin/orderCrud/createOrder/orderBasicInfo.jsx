import React from 'react';
import { useState } from 'react';
import Title from '../../adminMain/Title';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import Checkbox from '@material-ui/core/Checkbox';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { searchConsumer } from '../../consumerCrud/consumerServices';
import orderServices from '../../adminMain/orders/orderServices';


  const orderTypeList = ['Consignación', 'Venta', 'Obsequio'];
  const productionStatusList = ['Por solicitar', 'Solicitado', 'Por producir', 'En producción', 'En diseño'];
  const shippingStatusList = ['Por entregar', 'Entregado', 'Devuelto', 'Cambio'];
  const internalShippingList = ['Yalo', 'DH', 'CC', 'No aplica'];
  const domesticShippingList = ['Tealca', 'Zoom', 'MRW', 'No aplica'];
  const internationalShippingList = ['FedEx', 'DHL', 'MRW', 'No aplica'];



export default function OrderBasicInfo(props) {
    const [ open, setOpen ] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <React.Fragment>
            <Grid container spacing={2}>
              <Grid container style={{marginTop: 20}}>
                  <Title>Información básica</Title>
              </Grid>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={12}>
                      <Checkbox 
                          checked={props.orderState.selectedOrder.isSaleByPrixer}
                          color="primary" 
                          id="isSaleByPrixer"
                          inputProps={{ 'aria-label': 'secondary checkbox' }}
                          onChange={(e)=>{onChangeOrderBasics(e.target.id, e.target.checked);}}
                      /> Vendido por Prixer
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl style={{minWidth: "100%"}} variant="outlined">
                  <InputLabel required id="orderType">Tipo</InputLabel>
                  <Select
                    labelId="orderType"
                    id="orderType"
                    name="orderType"
                    value={props.orderState.selectedOrder.orderType}
                    onChange={(e)=>{onChangeOrderBasics(e.target.name, e.target.value);}}
                    label="orderType"
                  >
                    <MenuItem value="">
                      <em></em>
                    </MenuItem>
                    {orderTypeList.map((n) => (
                      <MenuItem key={n} value={n}>{n}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl variant="outlined" style={{minWidth: "100%"}} xs={12} sm={12} md={12}>
                    <InputLabel required id="generalProductionStatus">Estatus de producción</InputLabel>
                    <Select
                      labelId="generalProductionStatus"
                      id="generalProductionStatus"
                      name="generalProductionStatus"
                      value={props.orderState.selectedOrder.generalProductionStatus}
                      onChange={(e)=>{onChangeOrderBasics(e.target.name, e.target.value);}}
                      label="generalProductionStatus"
                    >
                      <MenuItem value="">
                        <em></em>
                      </MenuItem>
                      {productionStatusList.map((n) => (
                        <MenuItem key={n} value={n}>{n}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl variant="outlined" style={{minWidth: "100%"}} xs={12} sm={12} md={12}>
                    <InputLabel required id="shippingStatus">Estatus de envío</InputLabel>
                    <Select
                      labelId="shippingStatus"
                      id="shippingStatus"
                      name="shippingStatus"
                      value={props.orderState.selectedOrder.shippingStatus}
                      onChange={(e)=>{onChangeOrderBasics(e.target.name, e.target.value);}}
                      label="shippingStatus"
                    >
                      <MenuItem value="">
                        <em></em>
                      </MenuItem>
                      {shippingStatusList.map((n) => (
                        <MenuItem key={n} value={n}>{n}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid container style={{marginTop: 20}}>
                    <Title>Información del cliente</Title>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl variant="outlined" style={{minWidth: "100%"}} xs={12} sm={12} md={12}>
                    <Autocomplete
                      id="asynchronous-demo"
                      open={open}
                      onOpen={() => {
                        setOpen(true);
                      }}
                      onClose={() => {
                        setOpen(false);
                      }}
                      value={props.orderState.selectedOrder.consumer || ''}
                      options={props.orderState.selectedOrder.consumers || ['Buscar consumidor']}
                      getOptionLabel={
                         (option) => {
                           if(typeof option === 'string') {
                            return option;
                           } else {
                             return "";
                           }
                          }
                      }
                      loading={loading}
                      onChange={async (event, newValue) => {onConsumerChange(newValue);}}
                      onInputChange={async (event, newInputValue) => {
                        setLoading(true);
                        const search = await searchConsumer(newInputValue);
                        
                        if(search) {
                          const selOpt = await search.filter(n=>n.active).map((n)=> {
                              return (n.firstname + ' ' + n.lastname);
                        });

                        onChangeOrderBasics('consumers', selOpt);
                        setLoading(false);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Consumidor"
                          variant="outlined"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <React.Fragment>
                                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                {params.InputProps.endAdornment}
                              </React.Fragment>
                            ),
                          }}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
                  <Grid item xs={12} md={4}>
                        <FormControl variant="outlined" xs={12} fullWidth={true}>
                        <TextField
                            variant="outlined"
                            required
                            fullWidth
                            display="inline"
                            id="shippingPhone"
                            label="Teléfono de envío"
                            name="shippingPhone"
                            autoComplete="shippingPhone"
                            value={props.orderState.selectedOrder.shippingPhone}
                            onChange={(e)=>{onChangeOrderBasics(e.target.id, e.target.value);}}
                        />
                        </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                      <FormControl variant="outlined" xs={12} fullWidth={true}>
                      <TextField
                          variant="outlined"
                          required
                          multiline
                          rows="3"
                          fullWidth
                          display="inline"
                          id="billingAddress"
                          label="Dirección de facturación"
                          name="billingAddress"
                          autoComplete="billingAddress"
                          value={props.orderState.selectedOrder.billingAddress}
                          onChange={(e)=>{onChangeOrderBasics(e.target.id, e.target.value);}}
                      />
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl variant="outlined" xs={12} fullWidth={true}>
                        <TextField
                            variant="outlined"
                            required
                            rows="3"
                            multiline
                            fullWidth
                            display="inline"
                            id="shippingAddress"
                            label="Dirección de envío"
                            name="shippingAddress"
                            autoComplete="shippingAddress"
                            value={props.orderState.selectedOrder.shippingAddress}
                            onChange={(e)=>{onChangeOrderBasics(e.target.id, e.target.value);}}
                        />
                        </FormControl>
                    </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid container style={{marginTop: 20}}>
                      <Title>Medios de envío</Title>
                  </Grid>
                  <Grid item xs={12} md={4}>
                      <FormControl style={{minWidth: "100%"}} variant="outlined">
                        <InputLabel required id="internalShippingMethod">En Caracas</InputLabel>
                        <Select
                          labelId="internalShippingMethod"
                          id="internalShippingMethod"
                          name="internalShippingMethod"
                          value={props.orderState.selectedOrder.internalShippingMethod}
                          onChange={(e)=>{onChangeOrderBasics(e.target.name, e.target.value);}}
                          label="En Caracas"
                        >
                          <MenuItem value="">
                            <em></em>
                          </MenuItem>
                          {internalShippingList.map((n) => (
                            <MenuItem key={n} value={n}>{n}</MenuItem>
                          ))}
                        </Select>
                    </FormControl>
                    </Grid>
                  <Grid item xs={12} md={4}>
                      <FormControl style={{minWidth: "100%"}} variant="outlined">
                        <InputLabel required id="domesticShippingMethod">En Venezuela</InputLabel>
                        <Select
                          labelId="domesticShippingMethod"
                          id="domesticShippingMethod"
                          name="domesticShippingMethod"
                          value={props.orderState.selectedOrder.domesticShippingMethod}
                          onChange={(e)=>{onChangeOrderBasics(e.target.name, e.target.value);}}
                          label="En Venezuela"
                        >
                          <MenuItem value="">
                            <em></em>
                          </MenuItem>
                          {domesticShippingList.map((n) => (
                            <MenuItem key={n} value={n}>{n}</MenuItem>
                          ))}
                        </Select>
                    </FormControl>
                    </Grid>
                  <Grid item xs={12} md={4}>
                      <FormControl style={{minWidth: "100%"}} variant="outlined">
                        <InputLabel required id="internationalShippingMethod">Internacional</InputLabel>
                        <Select
                          labelId="internationalShippingMethod"
                          id="internationalShippingMethod"
                          name="internationalShippingMethod"
                          value={props.orderState.selectedOrder.internationalShippingMethod}
                          onChange={(e)=>{onChangeOrderBasics(e.target.name, e.target.value);}}
                          label="Internacional"
                        >
                          <MenuItem value="">
                            <em></em>
                          </MenuItem>
                          {internationalShippingList.map((n) => (
                            <MenuItem key={n} value={n}>{n}</MenuItem>
                          ))}
                        </Select>
                    </FormControl>
                    </Grid>
                <Grid item xs={12} md={12}>
                      <FormControl variant="outlined" xs={12} fullWidth={true}>
                      <TextField
                          variant="outlined"
                          rows="3"
                          multiline
                          fullWidth
                          display="inline"
                          id="observations"
                          label="Observaciones"
                          name="observations"
                          autoComplete="observations"
                          value={props.orderState.selectedOrder.observations}
                          onChange={(e)=>{onChangeOrderBasics(e.target.name, e.target.value);}}
                      />
                      </FormControl>
                  </Grid>
                </Grid>
        </React.Fragment>
      );

      async function onChangeOrderBasics(key, value) {
        const state = await orderServices.updateSelectedOrder({ orderState: props.orderState, key: key, value: value  });
        props.setOrderState(state);
      }

      async function onConsumerChange(newValue) {
        if (newValue) {
          let consumersData = await searchConsumer(newValue);
          onChangeOrderBasics('consumerId', consumersData[0].id);
          onChangeOrderBasics('billingAddress', consumersData[0].billingAddress);
          onChangeOrderBasics('shippingAddress', consumersData[0].shippingAddress);
          onChangeOrderBasics('shippingPhone', consumersData[0].phone);
          onChangeOrderBasics('consumer', newValue);
        } else {
          onChangeOrderBasics('consumerId', '');
          onChangeOrderBasics('billingAddress', '');
          onChangeOrderBasics('shippingAddress', '');
          onChangeOrderBasics('shippingPhone', '');
          onChangeOrderBasics('consumer', '');
          onChangeOrderBasics('consumers', ['']);
        }
      }
}