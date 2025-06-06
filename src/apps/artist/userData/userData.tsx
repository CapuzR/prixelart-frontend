// Debo hacer los unit y functional tests.
// Debo migrar los states a Redux.

import React from 'react';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useState, useEffect } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import AddIcon from '@mui/icons-material/Add';
import Backdrop from '@mui/material/Backdrop';
import InstagramIcon from '@mui/icons-material/Instagram';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Grid2 from '@mui/material/Grid';
import { Theme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useStyles } from './userData.styles';

interface UserDataProps {
  prixerUsername: string;
  setFeed: (feed: string) => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const UserData: React.FC<UserDataProps> = (props) => {
  const classes = useStyles();
  const [prixerDataState, setPrixerDataState] = useState<'read' | 'edit'>('read');
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [firstName, setFirstName] = useState<string | undefined>(undefined);
  const [lastName, setLastName] = useState<string | undefined>(undefined);
  const [specialtyArt, setSpecialtyArt] = useState<string[]>([]);
  const [instagram, setInstagram] = useState<string | undefined>(undefined);
  const [facebook, setFacebook] = useState<string | undefined>(undefined);
  const [twitter, setTwitter] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [dateOfBirth, setDateOfBirth] = useState<string | undefined>(undefined);
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [city, setCity] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState<boolean>(false);
  const [prixerExists, setPrixerExists] = useState<boolean>(false);
  const [avatarObj, setAvatarObj] = useState<string>('');
  const [profilePic, setProfilePic] = useState<File | string>('');
  const [inputChange, setInputChange] = useState<boolean>(false);
  const [backdrop, setBackdrop] = useState<boolean>(true);
  const [prixer, setPrixer] = useState<any>(undefined);

  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const getStyles = (specialty: string, specialtyArt: string[], theme: Theme): React.CSSProperties => {
    return {
      fontWeight:
        specialtyArt.indexOf(specialty) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  };

  useEffect(() => {
    const base_url = import.meta.env.VITE_BACKEND_URL + '/prixer/read';
    const data = {
      username: props.prixerUsername,
    };
    if (typeof props.prixerUsername === 'string') {
      axios
        .post(base_url, data)
        .then((response) => {
          // if (!response.data.status) {
          //   return navigate("/");
          // }
          setUsername(response.data.username);
          setEmail(response.data.email);
          setFirstName(response.data.firstName);
          setLastName(response.data.lastName);
          setSpecialtyArt(response.data.specialtyArt);
          setInstagram(response.data.instagram);
          setFacebook(response.data.facebook);
          setTwitter(response.data.twitter);
          setDescription(response.data.description);
          setDateOfBirth(response.data.dateOfBirth);
          setPhone(response.data.phone);
          setCountry(response.data.country);
          setCity(response.data.city);
          setAvatarObj(response.data.avatar);
          setProfilePic(response.data.avatar);
          setPrixer(response.data);
          setReady(true);
          setBackdrop(false);
          setPrixerExists(true);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }, []);

  const handleProfileDataEdit = async () => {
    if (prixerDataState === 'edit') {
      setBackdrop(true);
      const formData = new FormData();
      formData.append('avatar', profilePic || avatarObj);
      formData.append('username', username || '');
      formData.append('firstName', firstName || '');
      formData.append('email', email || '');
      formData.append('lastName', lastName || '');
      formData.append('specialtyArt', JSON.stringify(specialtyArt));
      formData.append('instagram', instagram || '');
      formData.append('facebook', facebook || '');
      formData.append('twitter', twitter || '');
      formData.append('description', description || '');
      formData.append('dateOfBirth', dateOfBirth || '');
      formData.append('phone', phone || '');
      formData.append('country', country || '');
      formData.append('city', city || '');
      const base_url = import.meta.env.VITE_BACKEND_URL + '/prixer/update';
      const response = await axios.post(base_url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data) {
        const res = response.data;
        setUsername(res.username);
        setEmail(res.email);
        setFirstName(res.firstName);
        setLastName(res.lastName);
        setSpecialtyArt(res.specialtyArt);
        setInstagram(res.instagram);
        setFacebook(res.facebook);
        setTwitter(res.twitter);
        setDescription(res.description);
        setDateOfBirth(res.dateOfBirth);
        setPhone(res.phone);
        setCountry(res.country);
        setCity(res.city);
        setAvatarObj(res.avatar);
        setProfilePic(res.avatar);
        setReady(true);
        setBackdrop(false);
        setPrixerExists(true);
        setPrixerDataState('read');
        props.setFeed('Artes');
      } else {
        setReady(true);
        setBackdrop(false);
      }
    } else {
      setPrixerDataState('edit');
      props.setFeed('Settings');
    }
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInputChange(true);
      setAvatarObj(URL.createObjectURL(e.target.files[0]));
      setProfilePic(e.target.files[0]);
    }
  };
  const handleChange = (e: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = e;
    setSpecialtyArt(typeof value === 'string' ? value.split(',') : value);
  };

  return prixerExists ? (
    <div className={classes.root}>
      <Backdrop className={classes.backdrop} open={backdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Paper elevation={3} className={classes.paper} style={{ width: isDesktop ? '50%' : '100%' }}>
        {prixerDataState === 'read' && (
          <>
            <Box style={{ textAlign: 'end' }}>
              {JSON.parse(localStorage.getItem('token') || 'null') &&
                JSON.parse(localStorage.getItem('token') || 'null').username === username && (
                  <IconButton
                    title="Profile Edit"
                    color="primary"
                    onClick={handleProfileDataEdit}
                  >
                    <EditIcon />
                  </IconButton>
                )}
              <Grid2
                container
                spacing={2}
                style={{
                  marginTop:
                    JSON.parse(localStorage.getItem('token') || 'null') &&
                    JSON.parse(localStorage.getItem('token') || 'null').username === username &&
                    '-46px',
                }}
              >
                <Grid2 size={{ xs: 12, sm: 4, md: 4, lg: 4, xl: 4 }}>
                  <Box
                    style={{
                      marginBottom: '4px',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {avatarObj ? (
                      <div
                        style={{
                          borderStyle: 'solid',
                          borderWidth: 2,
                          borderColor: 'gray',
                          borderRadius: '50%',
                          padding: 8,
                          marginTop: '-8px',
                        }}
                      >
                        <Avatar className={classes.avatar} src={typeof profilePic === 'string' ? profilePic : ''} alt="Prixer profile avatar" />
                      </div>
                    ) : (
                      JSON.parse(localStorage.getItem('token') || 'null') &&
                      JSON.parse(localStorage.getItem('token') || 'null').username === username && (
                        <div
                          style={{
                            borderStyle: 'solid',
                            borderWidth: 2,
                            borderColor: 'gray',
                            borderRadius: '50%',
                            padding: 8,
                          }}
                        >
                          <Avatar className={classes.avatar}>
                            <label htmlFor="file-input">
                              <img
                                src="/PrixLogo.png"
                                alt="Prixer profile avatar"
                                style={{ maxHeight: 200, height: 120 }}
                                onClick={handleProfileDataEdit}
                              />
                            </label>
                          </Avatar>
                        </div>
                      )
                    )}
                  </Box>
                </Grid2>
                <Grid2 size={{ xs: 12, sm: 8, md: 8, lg: 8, xl: 8 }}>
                  <Box
                    style={{
                      display: 'flex',
                      marginBottom: '4px',
                      alignItems: isMobile ? 'center' : 'start',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h5" color="secondary" style={{ fontWeight: 'bold' }}>
                        {firstName} {lastName}
                      </Typography>
                      {prixer?.role === 'Organization' && (
                        <Tooltip title="Organización verificada">
                          <VerifiedUserIcon color="primary" />
                        </Tooltip>
                      )}
                    </div>
                    <Typography style={{ fontSize: 16 }} color="secondary">
                      {specialtyArt?.map(
                        (specialty, index) =>
                          specialty !== '' &&
                          (specialtyArt?.length === index + 1 ? specialty : `${specialty}, `)
                      )}
                    </Typography>
                  </Box>
                  <Box
                    display={'flex'}
                    style={{
                      marginBottom: '4px',
                      justifyContent: isMobile ? 'center' : 'flexstart',
                    }}
                  ></Box>
                  <Box
                    display={'flex'}
                    style={{
                      marginBottom: '4px',
                      justifyContent: isMobile ? 'center' : 'flexstart',
                    }}
                  >
                    <Typography
                      align={isMobile ? 'center' : 'left'}
                      style={{ fontSize: 14 }}
                      color="secondary"
                    >
                      {description !== 'undefined' && description}
                    </Typography>
                  </Box>
                  <Box
                    style={{
                      marginBottom: '4px',
                      justifyContent: isMobile ? 'center' : 'flexstart',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <IconButton
                      size="small"
                      target="_blank"
                      href={'https://www.instagram.com/' + (instagram ? instagram.replace(/[@]/gi, '') : '')}
                      style={{
                        textDecoration: 'none',
                        backgroundColor: '#d33f49',
                        color: 'white',
                      }}
                    >
                      <InstagramIcon />
                    </IconButton>
                    {facebook && facebook !== 'undefined' && (
                      <IconButton
                        size="small"
                        target="_blank"
                        href={'https://www.facebook.com/' + facebook}
                        style={{
                          textDecoration: 'none',
                          backgroundColor: '#d33f49',
                          color: 'white',
                          marginLeft: 20,
                        }}
                      >
                        <FacebookIcon />
                      </IconButton>
                    )}
                    {twitter && twitter !== 'undefined' && (
                      <IconButton
                        size="small"
                        target="_blank"
                        href={'https://www.twitter.com/' + twitter?.replace(/[@]/gi, '')}
                        style={{
                          textDecoration: 'none',
                          backgroundColor: '#d33f49',
                          color: 'white',
                          marginLeft: 20,
                        }}
                      >
                        <TwitterIcon />
                      </IconButton>
                    )}
                  </Box>
                </Grid2>
              </Grid2>
            </Box>
          </>
        )}
        {prixerDataState === 'edit' && (
          <>
            <Box style={{ textAlign: 'end', marginBottom: '4px' }}>
              {JSON.parse(localStorage.getItem('token') || 'null') &&
                JSON.parse(localStorage.getItem('token') || 'null').username === username && (
                  <Button
                    color="primary"
                    onClick={handleProfileDataEdit}
                    variant="contained"
                    style={{ marginBottom: '8px' }}
                  >
                    Editar
                  </Button>
                )}
            </Box>
            <Grid2 container spacing={2}>
              <Grid2 size={{ xs: 12, sm: 12, md: 6, lg: 6, xl: 6 }}>
                <Box>
                  <Box
                    marginBottom={2}
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {avatarObj ? (
                      <Avatar className={classes.avatar}>
                        <label htmlFor="file-input">
                          <img
                            src={avatarObj}
                            alt="Prixer profile avatar"
                            style={{ height: 200, objectFit: 'cover' }}
                          />
                        </label>
                        <input
                          style={{ display: 'none' }}
                          accept="image/*"
                          id="file-input"
                          type="file"
                          onChange={onImageChange}
                          required
                        />
                      </Avatar>
                    ) : (
                      <Avatar className={classes.avatar}>
                        <label htmlFor="file-input">
                          <AddIcon style={{ width: 60, height: 60, color: '#d33f49' }} />
                        </label>
                        <input
                          style={{ display: 'none' }}
                          accept="image/*"
                          id="file-input"
                          type="file"
                          onChange={onImageChange}
                        />
                      </Avatar>
                    )}
                  </Box>
                  <Box style={{ marginBottom: '8px' }}>
                    <TextField
                      fullWidth
                      id="firstName"
                      variant="outlined"
                      label="Nombre"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                      }}
                    />
                  </Box>
                  <Box style={{ marginBottom: '8px' }}>
                    <TextField
                      fullWidth
                      id="lastName"
                      variant="outlined"
                      label="Apellido"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                      }}
                    />
                  </Box>
                  <Box>
                    <FormControl
                      style={{ width: '100%', marginBottom: 20 }}
                    >
                      <InputLabel id="demo-mutiple-name-label">Especialidad</InputLabel>
                      <Select
                        labelId="demo-multiple-name-label"
                        id="demo-multiple-name"
                        multiple
                        value={specialtyArt}
                        onChange={handleChange}
                        MenuProps={MenuProps}
                      >
                        {['Fotografía', 'Diseño', 'Artes plásticas'].map((specialty) => (
                          <MenuItem key={specialty} value={specialty} style={getStyles(specialty, specialtyArt, theme)}>
                            {specialty}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box style={{ marginBottom: '8px' }}>
                    <TextField
                      fullWidth
                      id="instagram"
                      variant="outlined"
                      label="Instagram"
                      onChange={(e) => {
                        setInstagram(e.target.value);
                      }}
                      value={instagram}
                    />
                  </Box>
                  <Box style={{ marginBottom: '8px' }}>
                    <TextField
                      fullWidth
                      id="facebook"
                      variant="outlined"
                      label="Facebook"
                      onChange={(e) => {
                        setFacebook(e.target.value);
                      }}
                      value={facebook}
                    />
                  </Box>
                  <Box style={{ marginBottom: '8px' }}>
                    <TextField
                      fullWidth
                      id="twitter"
                      variant="outlined"
                      label="Twitter"
                      onChange={(e) => {
                        setTwitter(e.target.value);
                      }}
                      value={twitter}
                    />
                  </Box>
                  <Box>
                    <TextField
                      fullWidth
                      id="description"
                      label="Descripción"
                      onChange={(e) => {
                        setDescription(e.target.value);
                      }}
                      value={description}
                      inputProps={{ maxLength: 300 }}
                      multiline
                    />
                  </Box>
                </Box>
              </Grid2>
            </Grid2>
          </>
        )}
      </Paper>
    </div >
  ) : (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Backdrop className={classes.backdrop} open={backdrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Grid2 container spacing={1}>
          <Grid2 size={{ xs: 12 }} container>
            <Grid2 container direction="column" spacing={2}>
              <Grid2 >
                <Typography gutterBottom variant="subtitle1">
                  Increíble, pero cierto
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Este usuario no existe
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Inténtalo de nuevo | ig: Wrong
                </Typography>
              </Grid2>
            </Grid2>
          </Grid2>
        </Grid2>
      </Paper>
    </div>
  );
}

export default UserData;