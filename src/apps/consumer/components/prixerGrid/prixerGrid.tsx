import React, { useState, useEffect } from 'react';
import {
  Backdrop,
  Button,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Paper,
  Typography,
  Chip,
  Box,
  Alert,
} from '@mui/material';
import Grid2 from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import utils from '../../../../utils/utils';
import { User } from 'types/user.types';
import { fetchAllPrixersActive } from '@api/prixer.api';

import ExploreIcon from '@mui/icons-material/Explore';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export default function PrixerGrid(): React.ReactElement {
  const [tiles, setTiles] = useState<User[]>([]);
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchAllPrixersActive()
      .then(data => {
        if (Array.isArray(data)) {
          const datav2 = data.map(user => {
            if (user.prixer && !user.prixer._id) {
              return {
                ...user,
                prixer: {
                  ...user.prixer,
                  _id: user._id
                }
              };
            }
            return user;
          });

          setTiles(utils.shuffle(datav2));
        } else {
          console.error("Fetched data is not an array:", data);
          setTiles([]); 
          setError("Could not retrieve Prixers due to unexpected data format.");
        }
      })
      .catch(apiError => {
        console.error("Error fetching prixers:", apiError);
        setError("We couldn't load the Prixers at this time. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);
  const activePrixers = tiles.filter(tile => tile.prixer?.avatar);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando Prixers...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        icon={<ErrorOutlineIcon fontSize="inherit" />}
        sx={{ width: '100%', justifyContent: 'center', mt: 4, py: 3 }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center', // Center grid items if they don't fill the row
        gap: 3, // Spacing between cards
        p: { xs: 1, sm: 2 }, // Padding around the grid
        width: '100%',
      }}
    >
      <Backdrop
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          color: 'common.white', // Changed color for better contrast with CircularProgress
        }}
        open={loading} // This will be very brief now as main loading handled above
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid2 container spacing={{ xs: 2, md: 3 }} sx={{ width: '100%' }}>
        {activePrixers.map(tile => (
          <Grid2 key={tile.prixer!._id!.toString()} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Paper
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'background.paper',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: (theme) => theme.shadows[6],
                },
              }}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img" // Use img component for better control if needed
                  image={tile.prixer!.avatar!}
                  alt={`${tile.firstName} ${tile.lastName}`}
                  sx={{
                    height: 300,
                    objectFit: 'cover',
                  }}
                />
              </Box>
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 2, // Standard padding
                }}
              >
                <Typography
                  gutterBottom
                  variant="h6" // Slightly smaller for better fit
                  component="div"
                  fontWeight="600"
                  sx={{ mb: 0.5 }}
                >
                  {tile.firstName} {tile.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  @{tile.username}
                </Typography>

                {/* Specialties as Chips */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5, minHeight: '32px' /* Reserve space */ }}>
                  {(tile.prixer!.specialty ?? [])
                    .filter(s => !!s)
                    .slice(0, 3) // Show max 3 specialties, add more indicator if needed
                    .map(specialty => (
                      <Chip key={specialty} label={specialty} size="small" variant="outlined" />
                    ))}
                  {(tile.prixer!.specialty ?? []).length > 3 && (
                    <Chip label={`+${(tile.prixer!.specialty ?? []).length - 3}`} size="small" />
                  )}
                </Box>

                {/* Truncated Description */}
                {tile.prixer?.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 2, // Max 2 lines
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: '40px', // Approx height for 2 lines to reduce jump
                    }}
                  >
                    {tile.prixer.description}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                <Button
                  size="medium" // Slightly larger button
                  variant="contained" // More prominent CTA
                  color="primary"
                  onClick={() => navigate(`/prixer/${tile.username}`)}
                  startIcon={<ExploreIcon />}
                >
                  Ver más
                </Button>
              </CardActions>
            </Paper>
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
}