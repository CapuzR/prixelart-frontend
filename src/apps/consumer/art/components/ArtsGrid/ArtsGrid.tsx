import React, { useState, useEffect, MouseEvent, useRef, useCallback } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import SearchBar from 'components/searchBar/searchBar';
import ArtThumbnail from '../ArtThumbnail';
import { useLoading } from 'context/GlobalContext';
import { useNavigate } from 'react-router-dom';
import { Art } from '../../../../../types/art.types';
import { fetchGallery } from '@api/art.api';
import { Typography, Box, CircularProgress, Button, useTheme, Theme } from '@mui/material';
import SkeletonArtCard from '@apps/admin/components/SkeletonArtCard/SkeletonArtCard';

interface GalleryFilters {
  text?: string | null;
  category?: string | null;
  username?: string;
  initialPoint: number;
  itemsPerPage: number;
}

interface ArtsGridProps {
  onArtSelect?: (art: Art) => void;
}

const ArtsGrid: React.FC<ArtsGridProps> = ({ onArtSelect }) => {
  const { loading, setLoading } = useLoading();
  const navigate = useNavigate();
  const globalParams = new URLSearchParams(window.location.search);
  const theme = useTheme<Theme>(); // Use theme for breakpoint access if needed

  const [tiles, setTiles] = useState<Art[]>([]);
  const [searchValue, setSearchValue] = useState<string | null>(
    globalParams.get('name') || null
  );
  const [categoryValue, setCategoryValue] = useState<string | null>(
    globalParams.get('category') || null
  );

  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [fetchMoreError, setFetchMoreError] = useState<string | null>(null);
  const itemsPerPage: number = 30;

  const observer = useRef<IntersectionObserver | null>(null);

  const lastArtElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !fetchMoreError) {
        setPageNumber(prevPageNumber => prevPageNumber + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, hasMore, fetchMoreError]);

  // Effect to reset state when primary filters change
  useEffect(() => {
    setTiles([]);
    setPageNumber(1);
    setHasMore(true);
    setFetchMoreError(null);
  }, [searchValue, categoryValue]);

  // Effect for fetching data
  useEffect(() => {
    if (!hasMore && pageNumber > 1 && !fetchMoreError) return;

    if (!fetchMoreError && !hasMore && pageNumber > 1) {
      return;
    }

    setLoading(true);
    if (fetchMoreError) setFetchMoreError(null); // Clear previous error before new attempt

    const fetchData = async () => {
      try {
        const filters: GalleryFilters = {
          initialPoint: (pageNumber - 1) * itemsPerPage,
          itemsPerPage: itemsPerPage,
        };
        if (searchValue) filters.text = searchValue;
        if (categoryValue) filters.category = categoryValue;
        const response: { arts: Art[]; length: number } = await fetchGallery(filters);

        setTiles(prevTiles => {
          if (pageNumber === 1) {
            return response.arts; // New search or first load
          } else {
            const existingArtIds = new Set(prevTiles.map(art => art.artId));
            const uniqueNewArts = response.arts.filter(art => !existingArtIds.has(art.artId));
            return [...prevTiles, ...uniqueNewArts];
          }
        });

        const totalFetchedSoFar = pageNumber === 1 ? response.arts.length : tiles.length + response.arts.length;
        setHasMore(totalFetchedSoFar < response.length && response.arts.length > 0);

      } catch (error: any) {
        console.error('Error fetching arts:', error);
        if (tiles.length > 0) {
          setFetchMoreError(error.message || 'Ocurrió un error al cargar más arte.');
        } else {
          setHasMore(false); // Prevent infinite loops if initial load fails
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pageNumber, searchValue, categoryValue, itemsPerPage, setLoading, setHasMore, fetchMoreError, tiles.length]); // Added tiles.length to dependencies for the error handling case

  const handleSearch = (queryValue: string | null, categories: string | null) => {
    console.log('handleSearch called with:', { queryValue, categories });
    const newParams = new URLSearchParams(window.location.search);
    if (queryValue) newParams.set('name', queryValue); else newParams.delete('name');
    if (categories) newParams.set('category', categories); else newParams.delete('category');
    setSearchValue(queryValue);
    setCategoryValue(categories);
  };

  const handleFullImageClickEvent = (e: MouseEvent<HTMLElement>, tile: Art) => {
    navigate('/arte/' + tile.artId);
  };

  const handleRetryFetchMore = () => {
    setFetchMoreError(null);
  };

  const renderStatusMessages = () => {
    // Case 1: Initial load skeleton
    if (loading && tiles.length === 0 && pageNumber === 1 && !fetchMoreError) {
      const skeletonCount = itemsPerPage / 2 > 10 ? 10 : itemsPerPage / 2;
      return (
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1080: window.location.search.includes('producto=') ? 3 : 4 }}
        >
          <Masonry style={{ columnGap: '7px' }}>
            {Array.from({ length: Math.max(1, skeletonCount) }).map((_, index) => (
              <SkeletonArtCard key={`skeleton-${index}`} />
            ))}
          </Masonry>
        </ResponsiveMasonry>
      );
    }
    // Case 2: No results found after loading
    if (!loading && tiles.length === 0 && !fetchMoreError) {
      return (
        <Box textAlign="center" p={3}>
          <Typography variant="h6" gutterBottom>
            No se encontró arte con estos filtros.
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Prueba con otros términos de búsqueda o ajusta las categorías.
          </Typography>
          {/* <Button onClick={() => handleSearch(null, null)}>Ver todo el arte</Button> */}
        </Box>
      );
    }
    // Case 3: Loading more items
    if (loading && tiles.length > 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={2}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography variant="body1">Cargando más arte...</Typography>
        </Box>
      );
    }
    // Case 4: Error fetching more items
    if (fetchMoreError && tiles.length > 0) {
      return (
        <Box textAlign="center" p={3}>
          <Typography variant="body1" color="error" gutterBottom>
            {fetchMoreError}
          </Typography>
          <Button variant="outlined" onClick={handleRetryFetchMore}>
            Reintentar
          </Button>
        </Box>
      );
    }
    // Case 5: No more items to load
    if (!loading && !hasMore && tiles.length > 0 && !fetchMoreError) {
      return (
        <Typography variant="caption" display="block" textAlign="center" p={2} color="textSecondary">
          Has llegado al final de la galería.
        </Typography>
      );
    }
    // Case 6: Error on initial load
    if (!loading && tiles.length === 0 && fetchMoreError) {
      return (
        <Box textAlign="center" p={3}>
          <Typography variant="h6" color="error" gutterBottom>
            Error al cargar el arte.
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {fetchMoreError}
          </Typography>
          <Button variant="outlined" onClick={() => {
            setFetchMoreError(null);
            setPageNumber(1);
            setHasMore(true);
            // Data fetching useEffect will trigger
          }}>
            Reintentar Carga Inicial
          </Button>
        </Box>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%' }}>
      <Box // Replaces the old classes.root div
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-around',
          backgroundColor: theme.palette.background.paper, // Access theme for palette
          marginBottom: '15px',
        }}
      >
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '16px', padding: 0 }}>
          <SearchBar
            onSearch={handleSearch}
            placeholderText='Busca tu arte favorito'
            categoriesList={[
              'Abstracto', 'Animales', 'Arquitectura', 'Atardecer', 'Cacao', 'Café',
              'Carros', 'Ciudades', 'Comida', 'Edificios', 'Fauna', 'Flora',
              'Lanchas, barcos o yates', 'Montañas', 'Naturaleza', 'Navidad',
              'Playas', 'Puentes', 'Surrealista', 'Transportes', 'Vehículos',
            ]}
          />
        </div>
      </Box>
      <Box
        style={{ paddingBottom: '20px' }}
        aria-live="polite"
        aria-relevant="additions text"
      >
        {tiles.length > 0 && (
          <ResponsiveMasonry
            columnsCountBreakPoints={{
              350: 1,
              750: 2,
              900: 3,
              1080: window.location.search.includes('producto=') ? 3 : 4,
            }}
          >
            <Masonry style={{ columnGap: '7px' }}>
              {tiles.map((tile, i) => (
                <div
                  key={tile.artId}
                  ref={(i === tiles.length - 1) ? lastArtElementRef : null}
                >
                  <ArtThumbnail
                    tile={tile}
                    handleFullImageClick={(e: MouseEvent<HTMLElement>) => {
                      if (onArtSelect) {
                        onArtSelect(tile);
                      } else {
                        handleFullImageClickEvent(e, tile);
                      }
                    }}
                    onArtSelect={onArtSelect}
                  />
                </div>
              ))}
            </Masonry>
          </ResponsiveMasonry>
        )}
        {renderStatusMessages()}
      </Box>
    </div>
  );
};

export default ArtsGrid;