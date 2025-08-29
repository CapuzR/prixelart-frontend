import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid2 from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Button } from '@mui/material';
import MovDetails from './MovDetails';
import CircularProgress from '@mui/material/CircularProgress';
import Modal from '@mui/material/Modal';

import { Theme, useTheme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useSnackBar, useUser } from '@context/GlobalContext';
import { Movement } from 'types/movement.types';
import { Order, OrderStatus } from 'types/order.types';
import { ObjectId } from 'mongodb';
import CountUp from 'react-countup';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Art } from '../../../types/art.types';

export interface TopCategoryStat {
  category: string;
  count: number;
}

export interface TopProductStat {
  product: string;
  count: number;
}

const paginationModel = { page: 0, pageSize: 5 };

const useStyles = makeStyles()((theme: Theme) => {
  return {
    paper: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    },
    paper2: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 80,
    },
    tabs: {
      borderRight: `1px solid ${theme.palette.divider}`,
    },
  };
});

export default function PrixerProfile() {
  const { classes } = useStyles();
  const theme = useTheme();
  const isDeskTop = useMediaQuery(theme.breakpoints.up('sm'));
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { showSnackBar } = useSnackBar();

  const [balance, setBalance] = useState(0);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [myArts, setMyArts] = useState<Art[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategoryStat[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductStat[]>([]);
  const [topMyProducts, setTopMyProducts] = useState<TopProductStat[]>([]);

  const [loadingStats, setLoadingStats] = useState(true);

  const [tab, setTab] = useState(0);
  const [openOrderDetails, setOpenOrderDetails] = useState(false);
  const [orderId, setOrderId] = useState<ObjectId | string | undefined>();
  const [placement, setPlacement] = useState<string | undefined>();
  const [type, setType] = useState<string | undefined>();

  const columns: GridColDef[] = [
    {
      field: 'artId',
      headerName: 'ID',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const artId = params.value as string;
        return (
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate(`/arte/${artId}`)}
            sx={{ textTransform: 'none', width: '100%' }}
          >
            {'Ver ' + params.value}
          </Button>
        );
      },
    },
    { field: 'title', headerName: 'Título', flex: 1, minWidth: 200 },
    {
      field: 'comission',
      headerName: 'Comisión',
      description: 'Este es el porcentaje que recibes al venderse tu arte',
      type: 'number',
      width: 90,
    },
    {
      field: 'selled',
      headerName: 'Ventas',
      description: 'Cantidad de veces que se ha vendido tu arte',
      width: 90,
    },
  ];

  const handleClick =
    (newPlacement: string, orderId: string | undefined, type?: string) =>
    (event: React.MouseEvent<HTMLButtonElement>) => {
      setOpenOrderDetails((prev) => placement !== newPlacement || !prev);
      setPlacement('right-start');
      setOrderId(orderId);
      setType(type);
    };

  const getBalance = async () => {
    const url = import.meta.env.VITE_BACKEND_URL + '/account/readMyAccount/' + user?.account;
    await axios.get(url).then((response) => setBalance(response.data.result?.balance || 0));
  };

  const getMovements = async () => {
    const url = import.meta.env.VITE_BACKEND_URL + '/movement/readByAccount';
    const data = { _id: user?.account };
    await axios.post(url, data).then((response) => setMovements(response.data.result?.reverse()));
  };

  const getOrders = async () => {
    const url = import.meta.env.VITE_BACKEND_URL + '/order/byEmail';
    const data = {
      email: user?.email,
      prixerId: user?.prixer?._id,
    };
    await axios.post(url, data).then((response) => setOrders(response.data.result.reverse()));
  };

  const getMostSelled = async () => {
    setLoadingStats(true);
    try {
      const url = import.meta.env.VITE_BACKEND_URL + '/prixer/readStats/' + user?.username;
      const response = await axios.get(url);
      showSnackBar(response.data.message);
      if (response.data.success) {
        const { myArtStats, topCategories, topProducts, myProductStats } =
          response.data.result;
        console.log(myProductStats);
        setMyArts(myArtStats);
        setTopCategories(topCategories);
        setTopProducts(topProducts);
        setTopMyProducts(myProductStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      showSnackBar('No se pudieron cargar las estadísticas.');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (user) {
      if (user?.account !== undefined) {
        getBalance();
        getMovements();
      }
      getMostSelled();
      getOrders();
    }

    const redirectTimer = setTimeout(() => {
      if (!user) {
        const pathname = location.pathname;
        navigate(pathname.slice(0, -5));
      }
    }, 1500);

    return () => {
      clearTimeout(redirectTimer);
    };
  }, [user, navigate, location]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleClose = () => {
    setOpenOrderDetails(false);
  };

  const getPercentage = (status: [OrderStatus, Date][]) => {
    const latest =
      !status || status.length === 0 ? OrderStatus.Pending : status[status.length - 1][0];

    switch (latest) {
      case 0:
        return 10;
        break;
      case 1:
        return 20;
        break;
      case 2:
        return 30;
        break;
      case 3:
        return 80;
        break;
      case 4:
        return 90;
        break;
      case 5:
        return 100;
        break;
      case 6:
        return 50;
        break;
      case 7:
        return 0;
        break;
      default:
        return 10;
    }
  };

  const getStatus = (status: [OrderStatus, Date][]) => {
    const latest =
      !status || status.length === 0 ? OrderStatus.Pending : status[status.length - 1][0];

    switch (latest) {
      case 0:
        return 'Por producir';
        break;
      case 1:
        return 'En impresión';
        break;
      case 2:
        return 'En producción';
        break;
      case 3:
        return 'Por entregar';
        break;
      case 4:
        return 'Entregado';
        break;
      case 5:
        return 'Concretado';
        break;
      case 6:
        return 'Detenido';
        break;
      case 7:
        return 'Anulado';
        break;
      default:
        return 'Por producir';
    }
  };

  return (
    <Container component="main" maxWidth="xl" className={classes.paper}>
      <CssBaseline />
      <Grid2 className={classes.paper2}>
        <Paper
          sx={{
            width: isDeskTop ? '70%' : '100%',
            padding: isDeskTop ? 5 : 2,
            borderRadius: 10,
          }}
          elevation={2}
        >
          <Typography
            color="primary"
            variant={isDeskTop ? 'h4' : 'h5'}
            style={{
              color: '#404e5c',
              textAlign: 'center',
              marginBottom: 40,
              marginTop: 0,
            }}
          >
            {`Estadísticas de ${user?.firstName}`}
          </Typography>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, sm: 3 }}>
              <Tabs
                onChange={handleChange}
                orientation={isDeskTop ? 'vertical' : 'horizontal'}
                value={tab}
                indicatorColor="primary"
                className={classes.tabs}
                variant="scrollable"
              >
                <Tab
                  label="Balance general"
                  style={{
                    textTransform: 'none',
                    fontSize: isDeskTop ? 18 : 11,
                    color: '#404e5c',
                    padding: isDeskTop ? '6px 12px' : '6px 6px',
                  }}
                />
                <Tab
                  label="Tus pedidos"
                  style={{
                    textTransform: 'none',
                    fontSize: isDeskTop ? 18 : 11,
                    color: '#404e5c',
                    padding: isDeskTop ? '6px 12px' : '6px 6px',
                  }}
                />
                <Tab
                  label="Tus movimientos"
                  style={{
                    textTransform: 'none',
                    fontSize: isDeskTop ? 18 : 11,
                    color: '#404e5c',
                    padding: isDeskTop ? '6px 12px' : '6px 6px',
                  }}
                />
                <Tab
                  label="Estadísticas"
                  style={{
                    textTransform: 'none',
                    fontSize: isDeskTop ? 18 : 11,
                    color: '#404e5c',
                    padding: isDeskTop ? '6px 12px' : '6px 6px',
                  }}
                />
              </Tabs>
            </Grid2>

            <Grid2
              size={{
                xs: 12,
                sm: 9,
              }}
              style={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                minHeight: 200,
                marginLeft: 0,
              }}
            >
              {tab === 0 && (
                <Grid2>
                  {user?.account ? (
                    <>
                      <Typography
                        variant="body1"
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          color: '#404e5c',
                        }}
                      >
                        Tu balance es de:
                      </Typography>
                      <Typography
                        variant="h2"
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          color: '#404e5c',
                        }}
                      >
                        <CountUp
                          end={balance}
                          duration={2}
                          decimals={2}
                          decimal=","
                          separator="."
                          prefix="$ "
                        />
                      </Typography>
                    </>
                  ) : (
                    <Typography
                      variant="body1"
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        color: '#404e5c',
                      }}
                    >
                      Aún no tienes una cuenta asignada, nuestro equipo pronto te asignará una.
                    </Typography>
                  )}
                </Grid2>
              )}
              {tab === 1 && (
                <Grid2>
                  {orders.length > 0 ? (
                    <>
                      <Grid2
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0 2rem',
                          alignItems: 'center',
                        }}
                      >
                        <Typography style={{ fontSize: isDeskTop ? '14px' : '9px' }}>
                          Fecha
                        </Typography>
                        <Typography
                          style={{
                            fontSize: isDeskTop ? '14px' : '9px',
                            minWidth: 32,
                          }}
                        >
                          Pedido
                        </Typography>
                        <Typography
                          style={{
                            fontSize: isDeskTop ? '14px' : '9px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          Estado
                        </Typography>
                      </Grid2>
                      {orders.map((order, i) => (
                        <Grid2
                          key={i}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: 'grey',
                            backgroundColor: 'ghostwhite',
                            padding: 2,
                            borderRadius: 10,
                            margin: '10px 0px 10px 0px',
                            alignItems: 'center',
                          }}
                        >
                          <Grid2 style={{ fontSize: isDeskTop ? '14px' : '9px' }}>
                            {new Date(order.createdOn)
                              .toLocaleString('en-GB', {
                                timeZone: 'UTC',
                              })
                              .slice(0, 10)}
                          </Grid2>
                          <Grid2 style={{ fontSize: isDeskTop ? '14px' : '9px' }}>
                            <Button
                              sx={{
                                textTransform: 'none',
                                color: '#404e5c',
                                fontSize: isDeskTop ? '14px' : '9px',
                                minWidth: 32,
                                '&:hover': {
                                  backgroundColor: '#404e5c',
                                  color: 'white',
                                },
                              }}
                              onClick={handleClick('right-start', order._id?.toString(), 'Retiro')}
                            >
                              {order?._id?.toString().slice(-6)}
                            </Button>
                          </Grid2>
                          <Grid2
                            style={{
                              fontWeight: 'bold',
                              fontSize: isDeskTop ? '14px' : '9px',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {getStatus(order.status)}
                            <CircularProgress
                              style={{ marginLeft: 10 }}
                              variant="determinate"
                              value={getPercentage(order?.status)}
                            />
                          </Grid2>
                        </Grid2>
                      ))}
                    </>
                  ) : (
                    <Typography align="center" variant="h5" color="secondary">
                      Aún no hay pedidos registrados para ti.
                    </Typography>
                  )}
                </Grid2>
              )}
              {tab === 2 && (
                <Grid2>
                  {movements?.length > 0 ? (
                    movements?.map((mov) => (
                      <Grid2
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          color: 'grey',
                          backgroundColor: 'ghostwhite',
                          padding: 10,
                          borderRadius: 10,
                          margin: '10px 0px 10px 0px',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Grid2 style={{ fontSize: isDeskTop ? '14px' : '9px' }}>
                          {mov.date
                            ? new Date(mov.date)
                                .toLocaleString('en-GB', {
                                  timeZone: 'UTC',
                                })
                                .slice(0, 10)
                            : new Date(mov.createdOn)
                                .toLocaleString('en-GB', {
                                  timeZone: 'UTC',
                                })
                                .slice(0, 10)}
                        </Grid2>
                        <Grid2
                          style={{
                            fontSize: isDeskTop ? '14px' : '9px',
                            maxWidth: '70%',
                          }}
                        >
                          {mov.description.split('#')[0]}{' '}
                          <Button
                            style={{
                              textTransform: 'none',
                              color: '#404e5c',
                              fontSize: isDeskTop ? '14px' : '9px',
                              minWidth: 32,
                            }}
                            onClick={handleClick(
                              'right-start',
                              mov.description.split('#')[1],
                              mov.type
                            )}
                          >
                            {mov.description.split('#')[1]}
                          </Button>
                        </Grid2>
                        {mov.type === 'Depósito' ? (
                          <Grid2
                            style={{
                              color: 'green',
                              fontWeight: 'bold',
                              fontSize: isDeskTop ? '14px' : '9px',
                            }}
                          >
                            + $
                            {mov.value?.toLocaleString('de-DE', {
                              minimumFractionDigits: 2,
                            })}
                          </Grid2>
                        ) : (
                          mov.type === 'Retiro' && (
                            <Grid2
                              style={{
                                color: 'red',
                                fontWeight: 'bold',
                                fontSize: isDeskTop ? '14px' : '9px',
                              }}
                            >
                              - $
                              {mov.value?.toLocaleString('de-DE', {
                                minimumFractionDigits: 2,
                              })}
                            </Grid2>
                          )
                        )}
                      </Grid2>
                    ))
                  ) : (
                    <Typography align="center" variant="h5" color="secondary">
                      Aún no hay movimientos registrados para ti.
                    </Typography>
                  )}
                </Grid2>
              )}
              {tab === 3 && (
                <Grid2>
                  {loadingStats ? (
                    <Grid2
                      size={{ xs: 12 }}
                      style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}
                    >
                      <CircularProgress />
                    </Grid2>
                  ) : (
                    <>
                      <Grid2 size={{ xs: 12 }}>
                        <Typography align="center" variant="h5" color="secondary" mb={2}>
                          Tus artes más vendidos
                        </Typography>
                        <Paper sx={{ height: 'auto', width: '100%' }}>
                          <DataGrid
                            rows={myArts}
                            columns={columns}
                            initialState={{ pagination: { paginationModel } }}
                            pageSizeOptions={[5, 10, 20]}
                            sx={{ border: 0 }}
                          />
                        </Paper>
                      </Grid2>

                      <Grid2 size={{ xs: 12 }} mt={4}>
                        <Typography align="center" variant="h5" color="secondary" mb={2}>
                          Tus productos más vendidos
                        </Typography>
                        <Paper sx={{ height: 'auto', width: '100%', p:3 }}>
                          {topMyProducts?.length > 0 ? (
                            topMyProducts.map((item, index) => (
                              <div
                                key={index}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  padding: '8px 0',
                                }}
                              >
                                <Typography>
                                  {index + 1}. {item.product}
                                </Typography>
                                <Typography fontWeight="bold">{item.count} ventas</Typography>
                              </div>
                            ))
                          ) : (
                            <Typography color="textSecondary">
                              No hay datos de productos.
                            </Typography>
                          )}
                        </Paper>
                      </Grid2>

                      <Grid2 size={{ xs: 12 }} mt={4}>
                        <Typography align="center" variant="h5" color="secondary" mb={2}>
                          Estadísticas Globales
                        </Typography>
                        <Grid2 container spacing={3}>
                          <Grid2 size={{ xs: 12, md: 6 }}>
                            <Paper sx={{ p: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                Top 6 Categorías
                              </Typography>
                              {topCategories.length > 0 ? (
                                topCategories.map((item, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      padding: '8px 0',
                                    }}
                                  >
                                    <Typography>
                                      {index + 1}. {item.category}
                                    </Typography>
                                    <Typography fontWeight="bold">{item.count} ventas</Typography>
                                  </div>
                                ))
                              ) : (
                                <Typography color="textSecondary">
                                  No hay datos de categorías.
                                </Typography>
                              )}
                            </Paper>
                          </Grid2>

                          <Grid2 size={{ xs: 12, md: 6 }}>
                            <Paper sx={{ p: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                Top 10 Productos
                              </Typography>
                              {topProducts.length > 0 ? (
                                topProducts.map((item, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      padding: '8px 0',
                                    }}
                                  >
                                    <Typography>
                                      {index + 1}. {item.product}
                                    </Typography>
                                    <Typography fontWeight="bold">{item.count} ventas</Typography>
                                  </div>
                                ))
                              ) : (
                                <Typography color="textSecondary">
                                  No hay datos de productos.
                                </Typography>
                              )}
                            </Paper>
                          </Grid2>
                        </Grid2>
                      </Grid2>
                    </>
                  )}
                </Grid2>
              )}
            </Grid2>
          </Grid2>
        </Paper>
      </Grid2>
      <div style={{ maxWidth: '80%' }}>
        <Modal open={openOrderDetails} onClose={handleClose}>
          {/* <Popper
          open={openOrderDetails}
          anchorEl={anchorEl}
          placement={placement}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <ClickAwayListener onClickAway={handleClose}> */}
          <MovDetails orderId={orderId} handleClose={handleClose} type={type} />
          {/* </ClickAwayListener>
            </Fade>
          )}
        </Popper> */}
        </Modal>
      </div>
    </Container>
  );
}
