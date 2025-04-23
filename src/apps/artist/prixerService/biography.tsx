import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import useMediaQuery from '@mui/material/useMediaQuery';
import EditIcon from '@mui/icons-material/Edit';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import Snackbar from '@mui/material/Snackbar';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Tooltip from '@mui/material/Tooltip';
import { Slider } from '@mui/material';
import { useStyles } from './biography.styles';
import { getUrlParams } from '@utils/util';

interface BiographyProps {
  prixerUsername: string;
}

interface BioData {
  biography: string;
  images?: (string | null)[];
}

const RenderHTML: React.FC<{ htmlString: string }> = ({ htmlString }) => {
  return <div dangerouslySetInnerHTML={{ __html: htmlString }} style={{ margin: 10 }} />;
};

export default function Biography(props: BiographyProps) {
  const classes = useStyles();
  const [backdrop, setBackdrop] = useState(false);
  const theme = useTheme();
  const [snackBar, setSnackBar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackBarMessage, setSnackBarMessage] = useState<string>('');
  const globalParams = getUrlParams();
  const entries = globalParams.entries();
  const firstEntry = entries.next().value as [string, string];
  const [key, value] = firstEntry || ['', ''];
  const [data, setData] = useState<BioData>({ biography: '' });
 const [openEdit, setOpenEdit] = useState<boolean>(false);

  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isTab = useMediaQuery(theme.breakpoints.up('xs'));
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const [disableButton, setDisableButton] = useState(false);
  const [images, setImages] = useState<string[]>([]); // Imágenes visualizadas
  const [newImg, setNewImg] = useState<File[]>([]);

  const getBio = async () => {
    setBackdrop(true);
    const base_url = window.location.pathname.includes('/org=')
      ? import.meta.env.VITE_BACKEND_URL + '/organization/getBio/' + props.prixerUsername
      : import.meta.env.VITE_BACKEND_URL + '/prixer/getBio/' + props.prixerUsername;
    await axios
      .get(base_url)
      .then((response) => {
        setData(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
    setBackdrop(false);
  };

  useEffect(() => {
    getBio();
  }, []);

  const updateBio = async () => {
    const formData = new FormData();
    setDisableButton(true);
    setLoading(true);
    setBackdrop(true);
    setSnackBar(true);
    setSnackBarMessage('No cierres esta ventana mientras se sube tu biografía, por favor espera.');

    formData.append('biography', data.biography);
    const tokenString = localStorage.getItem('token');
    if (tokenString) {
      const token = JSON.parse(tokenString);
      formData.append('prixerId', token.prixerId);
    }
    if (data?.images && data.images.length > 0) {
      data.images.forEach((file: string | null) => {
        if (file !== null) {
          formData.append('bioImages', file);
        }
      });
    }
    if (newImg.length > 0) {
      newImg.forEach((file: File) => formData.append('newBioImages', file));
    }
    const espc_url = key.includes('org') ? '/organization' : '/prixer';
    let ID = '';
    if (tokenString) {
      const token = JSON.parse(tokenString);
      ID = key.includes('org') ? token.orgId : token.prixerId;
    }
    const base_url = `${import.meta.env.VITE_BACKEND_URL}${espc_url}/updateBio/${ID}`;
    try {
      const petition = await axios.put(base_url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (petition.data.success) {
        setBackdrop(false);
        setSnackBarMessage(petition.data.message);
        setSnackBar(true);
        changeState();
        setNewImg([]);
        setImages([]);
        getBio();
      } else {
        setSnackBarMessage(
          'Por favor vuelve a intentarlo, puede que exista algún inconveniente de conexión. Si aún no lo has hecho por favor inicia sesión.'
        );
        setSnackBar(true);
      }
    } catch (error) {
      console.log(error);
      setSnackBarMessage('Error al actualizar la biografía.');
      setSnackBar(true);
    }
    setLoading(false);
    setBackdrop(false);
    setDisableButton(false);
  };

  const checkImages = async () => {
    const prevImg: string[] = [];
    data?.images?.forEach((img: string | null) => {
      if (img !== null) {
        prevImg.push(img);
      }
    });
    setImages(prevImg);
  };

  const loadNewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (images.length === 4) {
      setSnackBar(true);
      setSnackBarMessage('Has alcanzado el máximo de imágenes (4).');
    } else {
      const file = e.target.files ? e.target.files[0] : null;
      if (file) {
        const resizedString = await convertToBase64(file);
        setImages([...images, resizedString]);
        setNewImg([...newImg, file]);
      }
    }
  };

  const deleteImg = async (e: React.MouseEvent<HTMLButtonElement>, x: string) => {
    e.preventDefault();
    const filteredPrev = data?.images?.filter((prev: string | null) => prev !== null && prev !== x);
    setData({ ...data, images: filteredPrev });
    const filteredImg = images.filter((img: string) => img !== x);
    setImages(filteredImg);
    if (newImg.length > 0) {
      const filteredNewImg = newImg.filter((img: File) => {
        // If needed, compare by file name or another property
        return true;
      });
      setNewImg(filteredNewImg);
    }
  };

  const convertToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  };

  const closeAd = () => {
    setSnackBar(false);
  };

  const handleEditorChange = (value: string) => {
    setData((prevState) => ({
      ...prevState,
      biography: value,
    }));
  };

  interface ArrowProps {
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
  }

  function SampleNextArrow(props: ArrowProps) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          ...style,
          display: 'block',
          background: 'silver',
          paddingTop: '1px',
          borderRadius: 50,
        }}
        onClick={onClick}
      />
    );
  }

  function SamplePrevArrow(props: ArrowProps) {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{
          ...style,
          display: 'block',
          background: 'silver',
          borderRadius: 50,
          paddingTop: '1px',
        }}
        onClick={onClick}
      />
    );
  }


  const settings = {
    slidesToShow:
      images.length < 3
        ? images.length
        : (isMobile && 2) || (isTab && 3) || (isDesktop && 3),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 500,
    infinite: true,
    dots: true,
    adaptiveHeight: true,
  };

  const setting2 = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 500,
    infinite: true,
    dots: true,
    adaptiveHeight: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
  };

  const changeState = () => {
    setOpenEdit(!openEdit);
    checkImages();
  };

  return (
    <>
      <div className={classes.root}>
        <Backdrop className={classes.backdrop} open={backdrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
      <Grid container style={{ justifyContent: 'center', marginBottom: 20 }}>
        {openEdit ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              marginBottom: 20,
            }}
          >
            <Paper
              className={classes.paper}
              style={{
                minHeight: 160,
                width: isDesktop ? '50%' : '100%',
                backgroundColor: 'gainsboro',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
              elevation={3}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '90%',
                }}
              >
                {images.length > 0 ? (
                  <Slider {...settings}>
                    {images.map((img, i) => (
                      <div
                        key={i}
                        style={{
                          borderRadius: 40,
                          display: 'flex',
                          flexDirection: 'column',
                          width: '80%',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                          }}
                        >
                          <IconButton
                            className={classes.buttonImgLoader}
                            onClick={(d) => {
                              deleteImg(d, img);
                            }}
                          >
                            <HighlightOffOutlinedIcon />
                          </IconButton>
                          <img
                            style={{
                              width: '90%',
                              objectFit: 'cover',
                              borderRadius: 10,
                            }}
                            src={img}
                            alt="Imagen"
                          />
                        </div>
                      </div>
                    ))}
                  </Slider>
                ) : (
                  <Typography
                    variant="h4"
                    style={{
                      color: '#404e5c',
                      textAlign: 'center',
                    }}
                    fontWeight="bold"
                  >
                    No tienes imágenes seleccionadas aún
                  </Typography>
                )}
                <Button
                  className={classes.buttonImgLoader}
                  size="medium"
                  style={{ display: 'flex', marginTop: 15 }}
                  component="label"
                >
                  <input
                    name="bioImages"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(a) => {
                      loadNewImage(a);
                    }}
                  />
                  Cargar imagen
                </Button>
              </div>
            </Paper>
            <ReactQuill
              style={{
                marginBottom: 10,
                marginTop: 15,
                maxWidth: 1100,
                width: isDesktop ? '50%' : '100%',
                borderRadius: 30,
              }}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, 4, 5, 6, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ align: [] }],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                ],
              }}
              value={data.biography}
              onChange={handleEditorChange}
              placeholder="Escribe tu biografía aquí..."
            />
            <Button color="primary" size="large" onClick={updateBio} disabled={disableButton}>
              Guardar
            </Button>
          </div>
        ) : data.biography !== undefined &&
          localStorage.getItem('token') &&
          JSON.parse(localStorage.getItem('token') as string)?.username === props.prixerUsername ? (
          <Paper
            elevation={3}
            className={classes.paper}
            style={{ width: isDesktop ? '50%' : '100%' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'end',
                width: '100%',
              }}
            >
              <Tooltip title="Editar biografía">
                <IconButton
                  component="span"
                  color="primary"
                  onClick={() => changeState()}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </div>
            {data.images && data.images.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '100%',
                  marginTop: 20,
                }}
              >
                <Slider {...setting2}>
                  {data.images.map(
                    (img, i) =>
                      img !== null &&
                      img !== undefined && (
                        <div
                          key={i}
                          style={{
                            borderRadius: 40,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            width: '90%',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            <img
                              style={{
                                width: '90%',
                                objectFit: 'cover',
                                borderRadius: 10,
                              }}
                              src={img}
                              alt="Imagen"
                            />
                          </div>
                        </div>
                      )
                  )}
                </Slider>
              </div>
            )}
            <div className="ql-editor" style={{ height: 'auto' }}>
              <RenderHTML htmlString={data.biography} />
            </div>
          </Paper>
        ) : data.biography === undefined &&
          localStorage.getItem('token') &&
          JSON.parse(localStorage.getItem('token') as string)?.username === props.prixerUsername ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="h4"
              color="secondary"
              align="center"
              style={{
                paddingTop: 30,
              }}
            >
              No has publicado tu biografía aún.
            </Typography>
            <Button
              color="primary"
              size="large"
              onClick={() => changeState()}
            >
              Crear ahora
            </Button>
          </div>
        ) : data.biography !== undefined ? (
          <Paper
            elevation={3}
            className={classes.paper}
            style={{ width: isDesktop ? '50%' : '100%' }}
          >
            {data.images && data.images.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '92%',
                  marginLeft: '4%',
                  marginTop: 20,
                }}
              >
                <Slider {...setting2}>
                  {data.images.map(
                    (img, i) =>
                      img !== null &&
                      img !== undefined && (
                        <div
                          key={i}
                          style={{
                            borderRadius: 40,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            width: '100%',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                            }}
                          >
                            <img
                              style={{
                                width: '100%',
                                objectFit: 'cover',
                                borderRadius: 10,
                              }}
                              src={img}
                              alt="Imagen"
                            />
                          </div>
                        </div>
                      )
                  )}
                </Slider>
              </div>
            )}
            <div className="ql-editor" style={{ height: 'auto' }}>
              <RenderHTML htmlString={data.biography} />
            </div>
          </Paper>
        ) : (
          <Typography
            variant="h4"
            color="secondary"
            align="center"
            style={{
              paddingTop: 30,
            }}
          >
            Pronto publicaré mi biografía.
          </Typography>
        )}
      </Grid>
      <Snackbar
        open={snackBar}
        autoHideDuration={5000}
        message={snackBarMessage}
        onClose={closeAd}
      />
    </>
  );
}