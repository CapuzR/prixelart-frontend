import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Link,
  Paper,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  ImageList,
  ImageListItem,
  Alert,
  CircularProgress,
  ImageListItemBar,
  useMediaQuery,
  useTheme,
  Skeleton,
  Modal,
  Button,
  Divider,
  Select,
  SelectChangeEvent,
  MenuItem,
  FormControl,
  InputLabel,
  
} from '@mui/material';
import Grid2 from '@mui/material/Grid';
import {
  Instagram,
  Twitter,
  Facebook,
  Phone,
  InfoOutlined,
  ArtTrack,
  ExpandMore as ExpandMoreIcon,
  AccountCircle,
  Link as LinkIcon,
  SentimentVeryDissatisfied,
  CloudOff,
  CollectionsBookmark,
  Share as ShareIcon,
  VisibilityOff as VisibilityOffIcon,
  Close as CloseIcon,
  SortByAlpha as SortByAlphaIcon,
  NewReleases as NewReleasesIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { Prixer } from 'types/prixer.types';
import { useParams, useNavigate } from 'react-router-dom';
import { getPrixerByUsername } from '@api/prixer.api';
import { User } from 'types/user.types';
import { getArtsByPrixer, PaginatedArtsResult } from '@api/art.api';
import { Art } from 'types/art.types';

const ARTS_PER_PAGE = 12;
const DESCRIPTION_MAX_LINES_DEFAULT = 3;

const lightboxModalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 0.5,
  outline: 'none',
  maxWidth: '90vw',
  maxHeight: '90vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 1,
};

const sortOptions = [
  { value: 'createdAt_desc', label: 'Nuevos Primero', icon: <NewReleasesIcon fontSize="small" sx={{ mr: 1.5 }} /> },
  { value: 'createdAt_asc', label: 'Antiguos Primero', icon: <NewReleasesIcon fontSize="small" sx={{ mr: 1.5, transform: 'scaleY(-1)' }} /> },
  { value: 'title_asc', label: 'Título (A-Z)', icon: <SortByAlphaIcon fontSize="small" sx={{ mr: 1.5 }} /> },
  { value: 'title_desc', label: 'Título (Z-A)', icon: <SortByAlphaIcon fontSize="small" sx={{ mr: 1.5, transform: 'scaleY(-1)' }} /> },
];

const PrixerProfileSkeleton: React.FC = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const artCols = isSmall ? 2 : isMedium ? 3 : 4;

  return (
    <Card sx={{ maxWidth: 800, margin: 'auto', mt: 4, mb: 4, boxShadow: 5, borderRadius: 2 }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: { xs: 2, sm: 3 }, backgroundColor: 'grey.200', borderTopLeftRadius: (theme) => theme.shape.borderRadius * 2, borderTopRightRadius: (theme) => theme.shape.borderRadius * 2, }}>
          <Skeleton variant="circular" sx={{ width: { xs: 100, sm: 120 }, height: { xs: 100, sm: 120 } }} />
          <Box sx={{ flexGrow: 1, width: '100%' }}>
            <Skeleton variant="text" sx={{ fontSize: 'h4', width: '60%' }} />
            <Skeleton variant="text" sx={{ fontSize: 'body1', width: '80%', mt: 0.5 }} />
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}><Skeleton variant="rounded" width={80} height={24} /><Skeleton variant="rounded" width={80} height={24} /></Stack>
            <Skeleton variant="rectangular" height={40} sx={{ mt: 1.5, width: '90%' }} />
          </Box>
        </Box>
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction="row" spacing={1} justifyContent="flex-end" my={2.5}><Skeleton variant="circular" width={36} height={36} /></Stack>
          <Divider sx={{ mb: 3 }} />
          <Grid2 container spacing={3} mb={3}>
            <Grid2 size={{ xs: 12, md: 6 }}><Skeleton variant="text" width="100px" sx={{ mb: 0.5, fontSize: 'subtitle1' }} /><Skeleton variant="text" width="150px" sx={{ fontSize: 'body1', ml: 3.5 }} /></Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}><Skeleton variant="text" width="80px" sx={{ mb: 1, fontSize: 'subtitle1' }} /><Stack direction="row" spacing={1.5} sx={{ ml: 3.5 }}><Skeleton variant="circular" width={32} height={32} /><Skeleton variant="circular" width={32} height={32} /><Skeleton variant="circular" width={32} height={32} /></Stack></Grid2>
          </Grid2>
          <Typography variant="h5" gutterBottom><Skeleton width="180px" /></Typography>
          <Skeleton variant="rectangular" height={56} sx={{ mb: 1.5, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={120} sx={{ mb: 1.5, borderRadius: 1 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
            <Typography variant="h5"><Skeleton width="120px" /></Typography>
            <Stack direction="row" spacing={1}><Skeleton variant="rounded" width={100} height={40} /><Skeleton variant="rounded" width={120} height={40} /></Stack>
          </Stack>
          <ImageList variant="quilted" cols={artCols} gap={12}>
            {Array.from(new Array(artCols)).map((_, index) => (<ImageListItem key={index} sx={{ borderRadius: 1.5, aspectRatio: '1 / 1', backgroundColor: 'grey.300' }}><Skeleton variant="rectangular" width="100%" height="100%" /></ImageListItem>))}
          </ImageList>
        </Box>
      </CardContent>
    </Card>
  );
}

const PrixerProfileCard: React.FC = () => {
  const [prixer, setPrixer] = useState<Prixer | null>(null);
  const [prixerUser, setPrixerUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [arts, setArts] = useState<Art[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [artsLoading, setArtsLoading] = useState<boolean>(false);
  const [moreArtsLoading, setMoreArtsLoading] = useState<boolean>(false);
  const [artsError, setArtsError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);

  const [showFullDescription, setShowFullDescription] = useState<boolean>(false);
  const [isDescriptionClamped, setIsDescriptionClamped] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<string>('');

  const [sortOption, setSortOption] = useState<string>(sortOptions[0].value);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const { username: routeUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const checkClamping = () => {
      if (descriptionRef.current) {
        const el = descriptionRef.current;
        if (el.offsetParent !== null && el.textContent && el.scrollHeight > el.clientHeight) setIsDescriptionClamped(true);
        else setIsDescriptionClamped(false);
      } else setIsDescriptionClamped(false);
    };
    const timeoutId = setTimeout(checkClamping, 150);
    window.addEventListener('resize', checkClamping);
    return () => { clearTimeout(timeoutId); window.removeEventListener('resize', checkClamping); };
  }, [prixer?.description, showFullDescription, isSmallScreen, isMediumScreen, artsLoading]);

  const loadPrixerArts = useCallback(async (
    prixerUsernameToLoad: string,
    pageNum: number,
    currentSort: string,
    currentCategory: string,
    isInitialArtLoadForUser: boolean = false
  ) => {
    if (pageNum === 1) {
      setArtsLoading(true);
      setArtsError(null);
    } else {
      setMoreArtsLoading(true);
    }

    try {
      const data: PaginatedArtsResult | null = await getArtsByPrixer(
        prixerUsernameToLoad,
        pageNum,
        ARTS_PER_PAGE,
        currentSort,
        currentCategory
      );

      if (data) {
        setArts(prev => (pageNum === 1 ? data.arts : [...prev, ...data.arts]));
        setCurrentPage(data.currentPage);
        setHasNextPage(data.hasNextPage);

        if (isInitialArtLoadForUser && pageNum === 1) {
          const uniqueCategories = Array.from(new Set(data.arts.map((art) => art.category).filter(Boolean) as string[]));
          setAvailableCategories(uniqueCategories.sort());
        }
      } else {
        setHasNextPage(false);
        if (isInitialArtLoadForUser && pageNum === 1) setAvailableCategories([]);
      }
    } catch (err) {
      console.error("Failed to fetch arts in component:", err);
      setArtsError(err instanceof Error ? err.message : "Could not retrieve arts.");
      if (isInitialArtLoadForUser && pageNum === 1) setAvailableCategories([]);
    } finally {
      if (pageNum === 1) setArtsLoading(false);
      else setMoreArtsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!routeUsername) {
      setError("No Username provided in URL.");
      setLoading(false);
      setHasNextPage(false);
      return;
    }

    const loadProfileAndInitialArts = async () => {
      setLoading(true);
      setError(null);
      setPrixer(null); setPrixerUser(null); setUserName(undefined);
      setArts([]); setCurrentPage(1); setHasNextPage(true); setArtsError(null);
      setShowFullDescription(false); setIsDescriptionClamped(false);

      try {
        const userDataResponse: User | null = await getPrixerByUsername(routeUsername);

        console.log("Prixer data:", userDataResponse);

        if (userDataResponse) {
          setPrixerUser(userDataResponse);
          if (userDataResponse.prixer) {
            setPrixer(userDataResponse.prixer);
            setUserName(userDataResponse.username);
            await loadPrixerArts(userDataResponse.username, 1, sortOption, filterCategory, true);
          } else {
            setError(`User '${userDataResponse.username}' is not a Prixer.`);
            setHasNextPage(false); setAvailableCategories([]);
          }
        } else {
          setError(`Prixer profile for '${routeUsername}' not found.`);
          setHasNextPage(false); setAvailableCategories([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        setHasNextPage(false); setAvailableCategories([]);
      } finally {
        setLoading(false);
      }
    };
    loadProfileAndInitialArts();
  }, [routeUsername, sortOption, filterCategory, loadPrixerArts]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!hasNextPage || artsLoading || moreArtsLoading || !userName) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && userName) {
          loadPrixerArts(userName, currentPage + 1, sortOption, filterCategory);
        }
      }, { threshold: 0.1 }
    );

    const currentTrigger = loadMoreTriggerRef.current;
    if (currentTrigger) observerRef.current.observe(currentTrigger);

    return () => {
      if (observerRef.current && currentTrigger) observerRef.current.unobserve(currentTrigger);
      else if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasNextPage, artsLoading, moreArtsLoading, currentPage, userName, sortOption, filterCategory, loadPrixerArts]);

  const getSocialLink = (platform: string, handle?: string) => {
    if (!handle) return null;
    const cleanedHandle = handle.replace('@', '');
    switch (platform) {
      case 'instagram': return `https://instagram.com/${cleanedHandle}`;
      case 'twitter': return `https://twitter.com/${cleanedHandle}`;
      case 'facebook': return `https://facebook.com/${cleanedHandle}`;
      default: return null;
    }
  };

  const handleOpenLightbox = (imageUrl: string) => { setLightboxImage(imageUrl); setLightboxOpen(true); };
  const handleCloseLightbox = () => setLightboxOpen(false);
  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortOption(event.target.value);
  };

  const handleFilterCategoryChange = (event: SelectChangeEvent<string>) => {
    setFilterCategory(event.target.value);
  };


  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = `Check out ${userName}'s profile on Prixer`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Discover ${userName}'s artwork and bio!`,
          url: shareUrl,
        });
        console.log('Profile shared successfully');
      } catch (error) {
        console.error('Error sharing profile:', error);
        if ((error as DOMException).name !== 'AbortError') {
          copyToClipboard(shareUrl, shareTitle);
        }
      }
    } else {
      copyToClipboard(shareUrl, shareTitle);
    }
  };

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert(`${title}\nLink copied to clipboard!`);
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        alert('Failed to copy link. Please copy it manually.');
      });
  };

  if (loading) return <PrixerProfileSkeleton />;
  if (error && !prixer) {
    return (<Alert severity="error" icon={<CloudOff fontSize="inherit" />} sx={{ m: { xs: 1, sm: 2 }, p: 2 }}><Typography fontWeight="bold">{error}</Typography><Typography variant="body2">Please try again later.</Typography></Alert>);
  }
  if (!prixer || !prixerUser) {
    return (<Alert severity="info" icon={<SentimentVeryDissatisfied fontSize="inherit" />} sx={{ m: { xs: 1, sm: 2 }, p: 2 }}><Typography fontWeight="bold">Profile Unavailable</Typography><Typography variant="body2">The Prixer profile could not be loaded.</Typography></Alert>);
  }

  const { avatar, specialty, description, instagram, twitter, facebook, phone, bio } = prixer;
  const prixerLocation = prixerUser.city && prixerUser.country ? `${prixerUser.city}, ${prixerUser.country}` : prixerUser.city || prixerUser.country || null;
  const getImageListCols = () => isSmallScreen ? 2 : isMediumScreen ? 3 : 4;

  return (
    <Card sx={{ maxWidth: 800, margin: 'auto', mt: { xs: 2, sm: 4 }, mb: { xs: 2, sm: 4 }, boxShadow: 5, borderRadius: 2, overflow: 'hidden' }}>
      <CardContent sx={{ p: 0 }}>
        {/* HEADER */}
        <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: { xs: 2, sm: 3 }, background: (th) => `linear-gradient(135deg, ${th.palette.primary.light} 0%, ${th.palette.secondary.light} 100%)`, color: 'common.white', textAlign: { xs: 'center', sm: 'left' }, }}>
          <Avatar src={avatar} alt={userName || 'Prixer'} sx={{ width: { xs: 100, sm: 120 }, height: { xs: 100, sm: 120 }, border: '4px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} >{!avatar && <AccountCircle sx={{ fontSize: { xs: 60, sm: 80 } }} />}</Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ justifyContent: { xs: 'center', sm: 'flex-start' } }}><Typography variant="h4" component="div" fontWeight="bold" sx={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>{userName || 'Prixer Profile'}</Typography></Stack>
            {specialty && specialty.length > 0 && (<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>{specialty.map((spec, index) => (<Chip key={index} label={spec} size="small" sx={{ fontWeight: 'medium', color: 'white', backgroundColor: 'rgba(0,0,0,0.25)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.4)' } }} />))}</Stack>)}
            {description && (<Box mt={1.5}><Typography ref={descriptionRef} variant="body2" sx={{ whiteSpace: 'pre-wrap', opacity: 0.9, fontSize: '0.95rem', color: 'white', fontWeight: '400', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: showFullDescription ? 'none' : DESCRIPTION_MAX_LINES_DEFAULT, overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: showFullDescription ? 'none' : `${DESCRIPTION_MAX_LINES_DEFAULT * 1.6}em`, }}>{description}</Typography>
              {isDescriptionClamped && !showFullDescription && (<Button onClick={() => setShowFullDescription(true)} size="small" sx={{ color: 'white', textTransform: 'none', p: '2px 4px', mt: 0.5, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Read More</Button>)}
              {showFullDescription && (<Button onClick={() => setShowFullDescription(false)} size="small" sx={{ color: 'white', textTransform: 'none', p: '2px 4px', mt: 0.5, '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}>Read Less</Button>)}</Box>)}
          </Box>
        </Box>
        {/* CONTENT */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 1 }} justifyContent="space-between" my={2.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
            {prixerLocation ? (<Chip icon={<InfoOutlined />} label={prixerLocation} variant="outlined" size="small" sx={{ alignSelf: { xs: 'center', sm: 'flex-start' } }} />) : <Box sx={{ flexGrow: { sm: 1 } }} /> /* Spacer */}
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-end' }} alignItems="center"><Tooltip title="Share Profile"><IconButton onClick={handleShare}><ShareIcon /></IconButton></Tooltip></Stack>
          </Stack>
          <Divider sx={{ mb: 3 }} />
          <Grid2 container spacing={3} mb={3}>
            {phone && (<Grid2 size={{ xs: 12, md: 6 }}><Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><Phone sx={{ mr: 1, color: 'primary.main' }} /> Teléfono:</Typography><Link href={`tel:${phone}`} underline="hover" color="text.primary" sx={{ ml: 3.5, display: 'block' }}><Typography variant="body1">{phone}</Typography></Link></Grid2>)}
            {(instagram || twitter || facebook) && (<Grid2 size={{ xs: 12, md: phone ? 6 : 12 }}><Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}><LinkIcon sx={{ mr: 1, color: 'secondary.main' }} /> Redes:</Typography><Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 3.5 }}>
              {instagram && getSocialLink('instagram', instagram) && (<Tooltip title={`Instagram: @${instagram.replace('@', '')}`}><IconButton component="a" href={getSocialLink('instagram', instagram) as string} target="_blank" rel="noopener noreferrer" sx={{ color: '#E1306C', '&:hover': { backgroundColor: 'rgba(225, 48, 108, 0.1)' } }} ><Instagram /></IconButton></Tooltip>)}
              {twitter && getSocialLink('twitter', twitter) && (<Tooltip title={`Twitter: @${twitter.replace('@', '')}`}><IconButton component="a" href={getSocialLink('twitter', twitter) as string} target="_blank" rel="noopener noreferrer" sx={{ color: '#1DA1F2', '&:hover': { backgroundColor: 'rgba(29, 161, 242, 0.1)' } }} ><Twitter /></IconButton></Tooltip>)}
              {facebook && getSocialLink('facebook', facebook) && (<Tooltip title={`Facebook: ${facebook.replace('@', '')}`}><IconButton component="a" href={getSocialLink('facebook', facebook) as string} target="_blank" rel="noopener noreferrer" sx={{ color: '#1877F2', '&:hover': { backgroundColor: 'rgba(24, 119, 242, 0.1)' } }} ><Facebook /></IconButton></Tooltip>)}
            </Stack></Grid2>)}
          </Grid2>
          {/* BIO SECTIONS */}
          {((bio && bio.biography && bio.biography.length > 0) || Object.keys(bio || {}).includes('biography')) && (
            <Accordion defaultExpanded={!(bio && bio.images && bio.images.length > 0)} sx={{ mb: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: 'grey.100', '&:hover': { backgroundColor: 'grey.200' } }} >
                <Typography variant="subtitle1" fontWeight="medium">Bio</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: { xs: 1.5, sm: 2 }, backgroundColor: 'white' }}>
                {bio && bio.biography && bio.biography[0] ? (
                  <Typography component="div" sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', mb: 0, '& p:first-of-type': { mt: 0 }, '& p:last-of-type': { mb: 0 }, '& a': { color: 'primary.main', textDecoration: 'underline' } }} dangerouslySetInnerHTML={{ __html: bio.biography[0] }} />
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityOffIcon fontSize="small" /> No se encontró la bio.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          )}

          {((bio && bio.images && bio.images.length > 0) || Object.keys(bio || []).includes('images')) && (
            <Accordion sx={{ mb: 1.5, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ backgroundColor: 'grey.100', '&:hover': { backgroundColor: 'grey.200' } }} >
                <Typography variant="subtitle1" fontWeight="medium">Imágenes Destacadas</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: { xs: 1.5, sm: 2 }, backgroundColor: 'white' }}>
                {bio && bio.images && bio.images.length > 0 ? (
                  <ImageList variant="masonry" cols={isSmallScreen ? 2 : 3} gap={8}>
                    {bio && bio.images.map((imgUrl, imgIndex) => (
                      <ImageListItem key={imgIndex} sx={{ borderRadius: 1, overflow: 'hidden', cursor: 'pointer', '&:hover img': { transform: 'scale(1.05)' } }} onClick={() => handleOpenLightbox(imgUrl)}>
                        <img src={`${imgUrl}${imgUrl.includes('unsplash') ? '&w=248&fit=crop&auto=format' : ''}`} srcSet={`${imgUrl}${imgUrl.includes('unsplash') ? '&w=248&fit=crop&auto=format&dpr=2 2x' : ''}`} alt={`Imagen Destacada ${imgIndex + 1}`} loading="lazy" style={{ borderRadius: '4px', display: 'block', width: '100%', transition: 'transform 0.3s ease-in-out', backgroundColor: 'grey.200' }} />
                      </ImageListItem>
                    ))}
                  </ImageList>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityOffIcon fontSize="small" /> No featured images available.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          )}
          {/* ARTWORK SECTION */}
          <Box mt={4}>
            <Typography variant="h5" color="primary.dark" sx={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid', borderColor: 'primary.light', pb: 0.5, mb: 2 }}><CollectionsBookmark sx={{ mr: 1.5 }} /> Artes</Typography>
            <Grid2 container spacing={isSmallScreen ? 1 : 2} sx={{ mb: 2.5 }}>
              <Grid2 size={{ xs: 12, sm: availableCategories.length > 0 ? 6 : 12, md: availableCategories.length > 0 ? 5 : 8 }}>
                <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel id="sort-by-label">Ordenar Por</InputLabel>
                  <Select labelId="sort-by-label" value={sortOption} label="Ordenar Por" onChange={handleSortChange} MenuProps={{ PaperProps: { sx: { maxHeight: 250 } } }}>
                    {sortOptions.map(option => (<MenuItem key={option.value} value={option.value}><Stack direction="row" alignItems="center" spacing={1}>{option.icon}{option.label}</Stack></MenuItem>))}
                  </Select>
                </FormControl>
              </Grid2>
              {availableCategories.length > 0 && (
                <Grid2 size={{ xs: 12, sm: 6, md: availableCategories.length > 0 ? 5 : 4 }}>
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel id="filter-category-label">Categoría</InputLabel>
                    <Select labelId="filter-category-label" value={filterCategory} label="Categoría" onChange={handleFilterCategoryChange} MenuProps={{ PaperProps: { sx: { maxHeight: 250 } } }}>
                      <MenuItem value=""><Stack direction="row" alignItems="center" spacing={1}><CategoryIcon fontSize="small" />Todas Las Categorías</Stack></MenuItem>
                      {availableCategories.map(category => (<MenuItem key={category} value={category}>{category}</MenuItem>))}
                    </Select>
                  </FormControl>
                </Grid2>
              )}
              {/* Clear Filters Button - shown conditionally */}
              {(filterCategory || sortOption !== sortOptions[0].value) && availableCategories.length > 0 && (
                <Grid2 size={{ xs: 12, md: 2 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Button variant="text" size="small" onClick={() => { setFilterCategory(''); setSortOption(sortOptions[0].value); }} sx={{ mt: { xs: 1, md: 0 } }}>Clear All</Button>
                </Grid2>
              )}
            </Grid2>
            {artsLoading && (<Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" my={3} sx={{ minHeight: '200px' }}><CircularProgress /><Typography variant="body1" sx={{ mt: 2 }}>Loading artworks...</Typography></Box>)}
            {artsError && !artsLoading && (<Alert severity="warning" sx={{ my: 2 }}>{`Could not load artworks: ${artsError}`}</Alert>)}
            {!artsLoading && !artsError && arts.length === 0 && (
              <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center', backgroundColor: 'grey.100', borderRadius: 1, mt: 2, minHeight: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <InfoOutlined sx={{ fontSize: { xs: 32, sm: 40 }, color: 'text.secondary', mb: 1 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>No se encontraron artes</Typography>
                <Typography variant="body1" color="text.secondary">Este Prixer no dispone de artes en este momento</Typography>
                {(filterCategory || sortOption !== sortOptions[0].value) &&
                  <Button variant="text" onClick={() => { setFilterCategory(''); setSortOption(sortOptions[0].value); }} sx={{ mt: 1.5 }}>Clear selection</Button>
                }
              </Paper>
            )}
            {arts.length > 0 && (<ImageList variant="quilted" cols={getImageListCols()} gap={12} rowHeight="auto">
              {arts.map((art) => (<ImageListItem key={art._id?.toString() || art.artId} onClick={() => navigate(`/arte/${art.artId}`)} sx={{ borderRadius: 1.5, overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', cursor: 'pointer', '&:hover .MuiImageListItemBar-root': { opacity: 1 }, '&:hover img': { transform: 'scale(1.03)' }, transition: 'box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transform: 'translateY(-2px)' } }} >
                <img src={`${art.mediumThumbUrl || art.imageUrl}${art.imageUrl?.includes('unsplash') ? '&w=300&h=300&fit=crop&auto=format' : ''}`} srcSet={`${art.largeThumbUrl || art.imageUrl}${art.imageUrl?.includes('unsplash') ? '&w=300&h=300&fit=crop&auto=format&dpr=2 2x' : ''}`} alt={art.title} loading="lazy" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease-in-out', backgroundColor: 'grey.200' }} />
                <ImageListItemBar title={art.title} subtitle={art.category || art.artType} position="bottom" sx={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0) 100%)', opacity: 0.85, transition: 'opacity 0.3s ease-in-out', '& .MuiImageListItemBar-title': { fontWeight: '500', mb: 0.25 } }} />
              </ImageListItem>))}
            </ImageList>)}
            {hasNextPage && <div ref={loadMoreTriggerRef} style={{ height: '1px', margin: '30px 0 10px' }} /> /* Trigger for more */}
            {moreArtsLoading && (<Box display="flex" justifyContent="center" alignItems="center" my={2}><CircularProgress size={30} /><Typography variant="body2" sx={{ ml: 1 }}>Loading more artworks...</Typography></Box>)}
            {!hasNextPage && arts.length > 0 && !moreArtsLoading && !artsLoading && !artsError && (<Typography variant="caption" display="block" textAlign="center" sx={{ my: 2, color: 'text.secondary' }}>All artworks loaded.</Typography>)}
          </Box>
        </Box>
      </CardContent>
      <Modal open={lightboxOpen} onClose={handleCloseLightbox} aria-labelledby="lightbox-image" closeAfterTransition>
        <Box sx={lightboxModalStyle}>
          <IconButton onClick={handleCloseLightbox} sx={{ position: 'absolute', top: { xs: 4, sm: 8 }, right: { xs: 4, sm: 8 }, color: 'grey.700', backgroundColor: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }, zIndex: 1, p: 0.5 }} size="small"><CloseIcon fontSize="small" /></IconButton>
          <img src={lightboxImage} alt="Imagen Destacada Ampliada" style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '4px' }} />
        </Box>
      </Modal>
    </Card >
  );
};
export default PrixerProfileCard;