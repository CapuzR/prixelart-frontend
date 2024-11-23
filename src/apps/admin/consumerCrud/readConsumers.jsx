import React from 'react';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Title from '../adminMain/Title';
import axios from 'axios';
import Checkbox from '@mui/material/Checkbox';
import EditIcon from '@mui/icons-material/Edit';
import Fab from '@mui/material/Fab';
import { Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Grid from '@mui/material/Grid';
import { Snackbar } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { makeStyles } from '@mui/styles';
import Backdrop from '@mui/material/Backdrop';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'none',
    flexDirection: 'column',
    marginLeft: 30,
  },
  fixedHeight: {
    height: 'auto',
    overflow: 'none',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: theme.palette.primary.main,
  },
}));

export default function ReadConsumers(props) {
  const history = useHistory();
  const classes = useStyles();
  const [rows, setRows] = useState();
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState();
  const [snackbar, setSnackbar] = useState(false);
  const [totalConsumers, setTotalConsumers] = useState(rows?.length);
  const [itemsPerPage, setItemPerPage] = useState(20);
  const noOfPages = Math.ceil(totalConsumers / itemsPerPage);
  const [pageNumber, setPageNumber] = useState(1);
  const itemsToSkip = (pageNumber - 1) * itemsPerPage;
  const [rowsv2, setRowsv2] = useState([]);

  const readConsumers = () => {
    setLoading(true);
    const base_url = import.meta.env.VITE_BACKEND_URL + '/consumer/read-all';
    axios
      .post(base_url, { adminToken: localStorage.getItem('adminTokenV') })
      .then((response) => {
        if (response.data.success === false) {
          setSnackbar(true);
          setMessage(response.data.error_message);
        } else {
          setRows(response.data);
          setRowsv2(response?.data?.slice(itemsToSkip, itemsPerPage + itemsToSkip));
          setTotalConsumers(response.data.length);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    readConsumers();
  }, []);

  const handleActive = (consumer, action) => {
    props.setConsumer(consumer);
    history.push('/consumer/' + action + '/' + consumer._id);
  };

  const deleteConsumer = (row) => {
    setLoading(true);
    const base_url = import.meta.env.VITE_BACKEND_URL + '/consumer/delete/' + row._id;
    axios
      .put(base_url, {
        adminToken: localStorage.getItem('adminTokenV'),
        consumer: row,
      })
      .then((response) => {
        setSnackbar(true);
        setMessage('Cliente eliminado con éxito');
        readConsumers();
      });
    setLoading(false);
  };

  const closeAd = () => {
    setSnackbar(false);
  };

  const changeFilter = (e) => {
    setLoading(true);
    let f = e.target.value.toLowerCase();

    setFilter(e.target.value);
    if (typeof f === 'string' && f.length > 0) {
      let filtered = rows.filter((row) => row.firstname.toLowerCase().includes(f));
      setRowsv2(filtered);
      setTotalConsumers(filtered.length);
      setItemPerPage(filtered.length);
    } else {
      setRowsv2(rows?.slice(itemsToSkip, itemsPerPage + itemsToSkip)); // setRowsv2(rowsLimited);
      setTotalConsumers(rows?.length);
      setItemPerPage(20);
    }
    setLoading(false);
  };
  useEffect(() => {
    setRowsv2(rows?.slice(itemsToSkip, itemsPerPage + itemsToSkip));
  }, [pageNumber]);

  const changePage = (i) => {
    setPageNumber(i);
  };

  return (
    <React.Fragment>
      <Backdrop className={classes.backdrop} open={loading} transitionDuration={1000}>
        <CircularProgress />
      </Backdrop>

      {props?.permissions?.readConsumers ? (
        <>
          <Title>Clientes frecuentes</Title>
          <Grid>
            <TextField
              variant="outlined"
              value={filter}
              onChange={(e) => {
                changeFilter(e);
              }}
              style={{ padding: 0 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="secondary" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Activo</TableCell>
                  <TableCell align="center">Nombre</TableCell>
                  <TableCell align="center">Apellido</TableCell>
                  <TableCell align="center">Tipo</TableCell>
                  <TableCell align="center">Teléfono</TableCell>
                  <TableCell align="center">Email</TableCell>
                  <TableCell align="center">Envío</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rowsv2?.length > 0 ? (
                  rowsv2.map((row, i) => (
                    <>
                      <TableRow key={i}>
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
                        <TableCell align="center">{row?.consumerType}</TableCell>
                        <TableCell align="center">{row.phone}</TableCell>
                        <TableCell align="center">{row.email}</TableCell>
                        <TableCell align="center">{row.shippingAddress}</TableCell>
                        <TableCell align="center">
                          <Grid style={{ display: 'flex' }}>
                            {props?.permissions?.createConsumer && (
                              <Fab
                                color="default"
                                style={{
                                  width: 35,
                                  height: 35,
                                  marginRight: 16,
                                }}
                                aria-label="edit"
                                onClick={(e) => {
                                  handleActive(row, 'update');
                                }}
                              >
                                <EditIcon />
                              </Fab>
                            )}
                            {props?.permissions?.deleteConsumer && (
                              <Fab
                                color="default"
                                style={{
                                  width: 35,
                                  height: 35,
                                }}
                                onClick={() => {
                                  deleteConsumer(row);
                                }}
                              >
                                <DeleteIcon />
                              </Fab>
                            )}
                          </Grid>
                        </TableCell>
                      </TableRow>
                    </>
                  ))
                ) : (
                  <Typography style={{ margin: 20 }} align="center" color="secondary">
                    No hay clientes que coincidan con tu criterio de búsqueda, intenta de nuevo.
                  </Typography>
                )}
              </TableBody>
            </Table>

            <Box
              style={{
                display: 'flex',
                alignSelf: 'center',
                paddingTop: 5,
                marginBottom: 4,
              }}
            >
              {pageNumber - 3 > 0 && (
                <Button
                  style={{ minWidth: 30, marginRight: 5 }}
                  onClick={() => {
                    setPageNumber(1);
                  }}
                >
                  {1}
                </Button>
              )}
              {pageNumber - 3 > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 5,
                  }}
                >
                  ...
                </div>
              )}
              {pageNumber - 2 > 0 && (
                <Button
                  style={{ minWidth: 30, marginRight: 5 }}
                  onClick={() => {
                    setPageNumber(pageNumber - 2);
                  }}
                >
                  {pageNumber - 2}
                </Button>
              )}
              {pageNumber - 1 > 0 && (
                <Button
                  style={{ minWidth: 30, marginRight: 5 }}
                  onClick={() => {
                    setPageNumber(pageNumber - 1);
                  }}
                >
                  {pageNumber - 1}
                </Button>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 80,
                  marginRight: 5,
                  backgroundColor: 'rgb(238, 238, 238)',
                  borderRadius: 4,
                }}
              >
                Página {pageNumber}
              </div>
              {pageNumber + 1 <= noOfPages && (
                <Button
                  style={{ minWidth: 30, marginRight: 5 }}
                  onClick={() => {
                    changePage(pageNumber + 1);
                  }}
                >
                  {pageNumber + 1}
                </Button>
              )}

              {pageNumber + 2 <= noOfPages && (
                <Button
                  style={{ minWidth: 30, marginRight: 5 }}
                  onClick={() => {
                    setPageNumber(pageNumber + 2);
                  }}
                >
                  {pageNumber + 2}
                </Button>
              )}
              {pageNumber + 3 <= noOfPages && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 5,
                  }}
                >
                  ...
                </div>
              )}
              {pageNumber + 3 <= noOfPages && (
                <Button
                  style={{ minWidth: 30, marginRight: 5 }}
                  onClick={() => {
                    setPageNumber(noOfPages);
                  }}
                >
                  {noOfPages}
                </Button>
              )}
            </Box>
          </>
        </>
      ) : (
        <Typography
          variant="h3"
          color="secondary"
          align="center"
          style={{ paddingTop: 30, marginTop: 60, marginBottom: 80 }}
        >
          No tienes permiso para entrar a esta área.
        </Typography>
      )}

      <Snackbar open={snackbar} autoHideDuration={6000} message={message} onClose={closeAd} />
    </React.Fragment>
  );
}
