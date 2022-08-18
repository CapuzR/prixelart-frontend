import React from 'react';
import {useEffect, useState} from 'react';
import { useHistory } from "react-router-dom";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from '../adminMain/Title';
import axios from 'axios';
import Checkbox from '@material-ui/core/Checkbox';
import EditIcon from '@material-ui/icons/Edit';
import Fab from '@material-ui/core/Fab';

export default function ReadConsumers(props) {
    const history = useHistory();
    const [rows, setRows] = useState();

useEffect(()=> {
  const base_url= process.env.REACT_APP_BACKEND_URL + "/consumer/read-all";
    axios.post(base_url)
    .then(response =>{
        setRows(response.data);
    })
    .catch(error =>{
        console.log(error);
    })
},[]);

  const handleActive = (consumer, action)=> {
    props.setConsumer(consumer);
    history.push('/admin/consumer/'+action+'/'+consumer._id);
  }

  return (
    <React.Fragment>
      <Title>Consumidor</Title>
        {
        rows &&
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center"></TableCell>
            <TableCell align="center">Activo</TableCell>
            <TableCell align="center">Nombre</TableCell>
            <TableCell align="center">Apellido</TableCell>
            <TableCell align="center">Usuario</TableCell>
            <TableCell align="center">Teléfono</TableCell>
            <TableCell align="center">Email</TableCell>
            <TableCell align="center">Envío</TableCell>
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
              <TableCell align="center">{row.firstname}</TableCell>
              <TableCell align="center">{row.lastname}</TableCell>
              <TableCell align="center">{row.username}</TableCell>
              <TableCell align="center">{row.phone}</TableCell>
              <TableCell align="center">{row.email}</TableCell>
              <TableCell align="center">{row.shippingAddress}</TableCell>
            </TableRow>
          ))
        }
        </TableBody>
      </Table>
} 
    </React.Fragment>
  );
}