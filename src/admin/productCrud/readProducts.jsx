import React from 'react';
import {useEffect, useState} from 'react';
import { useHistory } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Title from '../adminMain/Title';
import axios from 'axios';
import Checkbox from '@material-ui/core/Checkbox';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Snackbar from '@material-ui/core/Snackbar';
import Fab from '@material-ui/core/Fab';

export default function ReadProducts(props) {
    const history = useHistory();
    const [rows, setRows] = useState();
    const [deleteSuccess, setDelete] = useState()
    const[deleteOpen, setDeleteOpen] = useState(false)

useEffect(()=> {
  const base_url= process.env.REACT_APP_BACKEND_URL + "/admin/product/read-all";
    axios.get(base_url)
    .then(response =>{
        console.log(response.data.products)
        setRows(response.data.products);
    })
    .catch(error =>{
        console.log(error);
    })
},[]);

  const handleActive = (product, action)=> {
    props.setProduct(product);
    history.push('/admin/product/'+action+'/'+product._id);
  }

  const deleteProduct = async (id) =>
  {
    const URI = process.env.REACT_APP_BACKEND_URL + `/product/delete/${id}`
    const res = await axios.delete(URI)
    setDelete(res.data)
    setRows(rows)
    setDeleteOpen(true)
    setTimeout(()=> {
      setDeleteOpen(false)
    }, 3000)
  }
  console.log(rows)

  return (
    <React.Fragment>
      <Title>Productos</Title>
        {
        rows &&
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center"></TableCell>
            <TableCell align="center">Imagen</TableCell>
            <TableCell align="center">Nombre</TableCell>
            <TableCell align="center">Activo</TableCell>
            <TableCell align="center">Categoría</TableCell>
            <TableCell align="center">PVP desde-hasta</TableCell>
            <TableCell align="center">PVM desde-hasta</TableCell>
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
              <img src={row.images[0]} width={150} alt="imageProduct"/>
              </TableCell>
              <TableCell align="center">{row.name}</TableCell>
              <TableCell align="center">
                <Checkbox
                  disabled
                  checked={row.active}
                  color="primary"
                  inputProps={{ 'aria-label': 'secondary checkbox' }}
                />
              </TableCell>
              <TableCell align="center">{row.category}</TableCell>
              <TableCell align="center">{row.publicPrice.from}-{row.publicPrice.from}</TableCell>
              <TableCell align="center">{row.prixerPrice.from}-{row.prixerPrice.to}</TableCell>
              <TableCell align="center">
                <Fab color="default" style={{width: 35, height: 35}} aria-label="Delete" onClick={(e) => {
                  e.preventDefault();
                  deleteProduct(row._id)
                }}>
                  <DeleteIcon/>
                </Fab>
              </TableCell>
            </TableRow>
          ))
        }
        </TableBody>
      </Table>
}
  <Snackbar
  open={deleteOpen}
  autoHideDuration={1000}
  message={deleteSuccess?.productResult}
  />
    </React.Fragment>
  );
}
