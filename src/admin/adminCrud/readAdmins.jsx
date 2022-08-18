import React from 'react';
import {useEffect, useState} from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from '../adminMain/Title';
import axios from 'axios';


export default function ReadAdmins() {
    const [rows, setRows] = useState();

//AQUIIIII
useEffect(()=> {
  let isMounted = true
  const base_url= process.env.REACT_APP_BACKEND_URL + "/admin/read-all";
  async function fetchMyAPI() {
    try {
      const rowState = await axios.post(base_url);
    
      if(rowState.data && isMounted) {
        setRows(rowState.data);
      }
      return () => { isMounted = false };
    } catch(e) {
      console.log(e);
    }
  }

  fetchMyAPI()
},[]);

  return (
    <React.Fragment>
      <Title>Administradores</Title>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center">Nombre</TableCell>
            <TableCell align="center">Apellido</TableCell>
            <TableCell align="center">Correo</TableCell>
            <TableCell align="center">Usuario</TableCell>
            <TableCell align="center">Teléfono</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {
        rows &&
          rows.map((row) => (
            <TableRow key={row.username}>
              <TableCell align="center">{row.firstname}</TableCell>
              <TableCell align="center">{row.lastname}</TableCell>
              <TableCell align="center">{row.email}</TableCell>
              <TableCell align="center">{row.username}</TableCell>
              <TableCell align="center">{row.phone}</TableCell>
            </TableRow>
          ))
        }
        </TableBody>
      </Table>
      {/* <div className={classes.seeMore}>
        <Link color="primary" href="#" onClick={preventDefault}>
          See more orders
        </Link>
      </div> */}
    </React.Fragment>
  );
}