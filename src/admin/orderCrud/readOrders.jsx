import React from 'react';
import {useEffect, useState} from 'react';
import { useHistory } from "react-router-dom";
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from '../adminMain/Title';
import axios from 'axios';
import CircularProgress from '@material-ui/core/CircularProgress';
import Backdrop from '@material-ui/core/Backdrop';
import Checkbox from '@material-ui/core/Checkbox';
import EditIcon from '@material-ui/icons/Edit';
import Fab from '@material-ui/core/Fab';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

export default function ReadPaymentMethods(props) {
    const history = useHistory();
    const [rows, setRows] = useState();
    const base_url= process.env.REACT_APP_BACKEND_URL + "/payment-method/read-all";

useEffect(()=> {
    axios.post(base_url)
    .then(response =>{
        setRows(response.data);
    })
    .catch(error =>{
        console.log(error);
    })
},[]);

  const handleActive = (paymentMethod, action)=> {
    props.setPaymentMethod(paymentMethod);
    history.push('/admin/payment-method/'+action+'/'+paymentMethod._id);
  }

  return (
    <React.Fragment>
      <Title>Métodos de pago</Title>
        {
        rows &&
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center"></TableCell>
            <TableCell align="center">Activo</TableCell>
            <TableCell align="center">Nombre</TableCell>
            <TableCell align="center">Datos de pago</TableCell>
            <TableCell align="center">Instrucciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {
        rows &&
          rows.map((row) => (
            <TableRow key={row._id}>
              <TableCell align="center">
                <Fab color="default" style={{width: 35, height: 35}} aria-label="edit" onClick={(e)=>{handleActive(row, 'update')}}>
                  <EditIcon/>
                </Fab>
              </TableCell>
              <TableCell align="center">
                <Checkbox 
                  disabled
                  checked={row.active}
                  color="primary" 
                  inputProps={{ 'aria-label': 'secondary checkbox' }}
                />
              </TableCell>
              <TableCell align="center">{row.name}</TableCell>
              <TableCell align="center">{row.paymentData}</TableCell>
              <TableCell align="center">{row.instructions}</TableCell>
            </TableRow>
          ))
        }
        </TableBody>
      </Table>
} 
    </React.Fragment>
  );
}