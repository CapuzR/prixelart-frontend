import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Modal,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Grid2 from '@mui/material/Grid';
import AddIcon from "@mui/icons-material/AddRounded";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

import { useSnackBar, useLoading, useUser } from "@context/GlobalContext";
import { getRandomArt } from "@api/art.api";
import { createPrixer } from "../api"; 
import { isAuth } from "@api/utils.api";
import { User } from "types/user.types";

import InitialTerms from "@apps/artist/components/Terms/index";
import Copyright from "@components/Copyright/copyright";
import ProfileImageUpload from "@components/ProfileImageAvatar";
import { count } from "console";

const ensureHttps = (url: string): string => {
  if (!url) return "";
  let fullUrl = url.trim();
  if (!/^https?:\/\//i.test(fullUrl) && !fullUrl.startsWith("/")) {
    fullUrl = `https://${fullUrl}`;
  }
  return fullUrl;
};

const findValidWebpUrl = (art: any): string | null => {
  if (!art) return null;
  const props = ["largeThumbUrl", "mediumThumbUrl", "thumbnailUrl"];
  for (const key of props) {
    const value = art[key];
    if (typeof value === "string" && value.toLowerCase().endsWith(".webp")) {
      return ensureHttps(value);
    }
  }
  return null;
};

const SPECIALTIES = ["Fotografía", "Diseño", "Artes plásticas"];

export default function PrixerRegistration() {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();
  const { loading, setLoading } = useLoading();

  const { user, setUser } = useUser(); 
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [formData, setFormData] = useState({
    instagram: "",
    facebook: "",
    twitter: "",
    phone: "",
    country: "",
    city: "",
    description: "",
  });
  const [specialty, setSpecialty] = useState<string[]>([]);
  const [dateOfBirth, setDateOfBirth] = useState<Dayjs | null>(dayjs().subtract(18, "year"));

  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [loadingBg, setLoadingBg] = useState(true);

  useEffect(() => {
    const fetchArt = async () => {
      try {
        const art = await getRandomArt();
        const url = findValidWebpUrl(art);
        if (url) setBgUrl(url);
      } catch (err) {
        console.error("Error bg:", err);
      } finally {
        setLoadingBg(false);
      }
    };
    fetchArt();
  }, []);

  useEffect(() => {
    const verifyUserStatus = async () => {
      try {
        const auth = await isAuth(); 

        if (!auth.success) {
          showSnackBar("Para crear un perfil de artista, primero debes registrarte o iniciar sesión.");
          navigate("/registrar");
          return;
        }

        const currentUser = auth.result as User;

        if (currentUser.prixer) {
          showSnackBar("Ya tienes un perfil de Prixer creado.");
          navigate(`/prixer/${currentUser.username}`);
          return;
        }
        setUser(currentUser); 
        setCheckingAuth(false);
      } catch (error) {
        navigate("/registrar");
      }
    };

    verifyUserStatus();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setAvatar({
  //       file: e.target.files[0],
  //       preview: URL.createObjectURL(e.target.files[0]),
  //     });
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phone || !formData.country || specialty.length === 0 || !termsAccepted) {
      showSnackBar("Por favor completa los campos obligatorios y acepta los términos.");
      return;
    }

    setLoading(true);

    if (!user) {
      showSnackBar("Error de sesión. Por favor inicia sesión de nuevo.");
      navigate("/login");
      return;
    }

    const data = {
      specialty: specialty.join(", "),
      dateOfBirth: dateOfBirth?.format("DD-MM-YYYY") || "",
      termsAgree: termsAccepted,
      username: user.username,
      avatar: avatarUrl,
      instagram: formData.instagram,
      twitter: formData.twitter,
      facebook: formData.facebook,
      phone: formData.phone,
      country: formData.country,
      city: formData.city,
      description: formData.description
    }

    try {
      const response = await createPrixer(data);
      if (response.data.success) {
        setUser(response.data.result); 
        showSnackBar("¡Perfil de Prixer creado con éxito!");
        navigate(`/prixer/${response.data.result.username}`);
      } else {
        showSnackBar(response.data.message || "Error al crear el perfil.");
      }
    } catch (error) {
      console.error(error);
      showSnackBar("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
        <CircularProgress />
        <Typography>Verificando estado de registro...</Typography>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid2 container component="main" sx={{ minHeight: "100vh" }}>
        {/* Background Section (Consistencia con SignUp) */}
        {!isSmallScreen && (
          <Grid2
            size={{ md: 7 }}
            sx={{
              backgroundImage: bgUrl ? `url(${bgUrl})` : "none",
              backgroundColor: theme.palette.grey[200],
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              transition: "background-image 0.5s ease-in-out",
            }}
          >
            {loadingBg && (
              <Box sx={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", position: "absolute", width: "100%" }}>
                <CircularProgress />
              </Box>
            )}
          </Grid2>
        )}

        {/* Form Section */}
        <Grid2 size={{ xs: 12, md: 5 }} component={Paper} elevation={6} square sx={{ overflowY: "auto" }}>
          <Box sx={{ my: 4, mx: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography component="h1" variant="h4" color="primary" sx={{ fontWeight: "bold", mb: 1, textAlign: "center" }}>
              Crea tu perfil de Prixer
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Comparte tu talento con el mundo
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: "100%" }}>
              <Grid2 container spacing={2}>
                {/* Avatar Upload */}
                <Grid2 size={{ xs: 12 }} sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <ProfileImageUpload
                    currentImageUrl={avatarUrl}
                    onImageUploadSuccess={(url) => setAvatarUrl(url)}
                  />
                </Grid2>

                {/* Fields */}
                <Grid2 size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>Especialidades</InputLabel>
                    <Select
                      multiple
                      value={specialty}
                      label="Especialidades"
                      onChange={(e) => setSpecialty(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)}
                    >
                      {SPECIALTIES.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <DatePicker
                    label="Fecha de Nacimiento"
                    value={dateOfBirth}
                    onChange={(val) => setDateOfBirth(val)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid2>

                <Grid2 size={{ xs: 6 }}>
                  <TextField fullWidth name="instagram" label="Instagram" value={formData.instagram} onChange={handleInputChange} />
                </Grid2>
                <Grid2 size={{ xs: 6 }}>
                  <TextField fullWidth name="phone" label="Teléfono *" value={formData.phone} onChange={handleInputChange} />
                </Grid2>

                <Grid2 size={{ xs: 6 }}>
                  <TextField fullWidth name="country" label="País *" value={formData.country} onChange={handleInputChange} />
                </Grid2>
                <Grid2 size={{ xs: 6 }}>
                  <TextField fullWidth name="city" label="Ciudad" value={formData.city} onChange={handleInputChange} />
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    name="description"
                    label="Cuéntanos sobre tu arte"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </Grid2>

                <Grid2 size={{ xs: 12 }}>
                  <FormControlLabel
                    control={<Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} color="primary" />}
                    label={
                      <Typography variant="body2">
                        Acepto los{" "}
                        <Link component="button" type="button" onClick={() => setModalOpen(true)} sx={{ verticalAlign: "baseline" }}>
                          términos y condiciones
                        </Link>
                      </Typography>
                    }
                  />
                </Grid2>
              </Grid2>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !termsAccepted}
                sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: "bold" }}
              >
                {loading ? <CircularProgress size={24} /> : "Finalizar Registro"}
              </Button>

              <Copyright sx={{ mt: 2 }} />
            </Box>
          </Box>
        </Grid2>

        {/* Modal de Términos */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: isSmallScreen ? '90%' : 600, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 24, p: 4,
            maxHeight: '80vh', overflowY: 'auto'
          }}>
            <InitialTerms setIsChecked={setTermsAccepted} setModal={setModalOpen} />
          </Box>
        </Modal>
      </Grid2>
    </LocalizationProvider>
  );
}