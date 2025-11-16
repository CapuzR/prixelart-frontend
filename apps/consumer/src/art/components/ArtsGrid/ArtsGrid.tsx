import React, {
  useState,
  useEffect,
  MouseEvent,
  useRef,
  useCallback,
} from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import SearchBar from "@components/searchBar/searchBar";
import ArtThumbnail from "../ArtThumbnail";
import { useLoading } from "@prixpon/context/GlobalContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Art } from "@prixpon/types/art.types";
import { fetchGallery } from "@prixpon/api-client/art.api";
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  useTheme,
  Theme,
} from "@mui/material";
import SkeletonArtCard from "@components/SkeletonArtCard/SkeletonArtCard";
import { debounce } from "@prixpon/utils";

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
  const location = useLocation();
  const theme = useTheme<Theme>();

  const getParams = useCallback(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const [searchValue, setSearchValue] = useState<string>(
    getParams().get("name") || "",
  );
  const [categoryValue, setCategoryValue] = useState<string>(
    getParams().get("category") || "",
  );

  const [tiles, setTiles] = useState<Art[]>([]);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [fetchMoreError, setFetchMoreError] = useState<string | null>(null);
  const itemsPerPage: number = 30;

  const performSearch = (query: string, category: string) => {
    const newParams = new URLSearchParams(location.search);
    if (query) {
      newParams.set("name", query);
    } else {
      newParams.delete("name");
    }

    if (category) {
      newParams.set("category", category);
    } else {
      newParams.delete("category");
    }

    navigate({ search: newParams.toString() }, { replace: true });
  };

  const debouncedSearch = useCallback(debounce(performSearch, 500), []);

  // Handler for text input changes from the SearchBar
  const handleQueryChange = (newQuery: string) => {
    setSearchValue(newQuery);
    debouncedSearch(newQuery, categoryValue);
  };

  // Handler for category changes from the SearchBar
  const handleCategoryChange = (newCategory: string) => {
    setCategoryValue(newCategory);
    performSearch(searchValue, newCategory);
  };

  // Effect to reset state when primary filters (URL search params) change
  useEffect(() => {
    setTiles([]);
    setPageNumber(1);
    setHasMore(true);
    setFetchMoreError(null);
  }, [location.search]);

  // Effect for fetching data
  useEffect(() => {
    setLoading(true);
    if (fetchMoreError) setFetchMoreError(null);

    const fetchData = async () => {
      try {
        const params = getParams();
        const currentSearch = params.get("name") || "";
        const currentCategory = params.get("category") || "";

        const filters: GalleryFilters = {
          initialPoint: (pageNumber - 1) * itemsPerPage,
          itemsPerPage: itemsPerPage,
        };
        if (currentSearch) filters.text = currentSearch;
        if (currentCategory) filters.category = currentCategory;
        const response = await fetchGallery(filters);
        console.log(response);
        setTiles((prevTiles) => {
          if (pageNumber === 1) {
            return response.arts;
          } else {
            const existingArtIds = new Set(prevTiles.map((art) => art.artId));
            const uniqueNewArts = response.arts.filter(
              (art) => !existingArtIds.has(art.artId),
            );
            return [...prevTiles, ...uniqueNewArts];
          }
        });

        setHasMore(response.hasMore);
      } catch (error: any) {
        console.error("Error fetching arts:", error);
        if (tiles.length > 0 && pageNumber > 1) {
          setFetchMoreError(
            error.message || "Ocurrió un error al cargar más arte.",
          );
        } else {
          setHasMore(false);
          if (pageNumber === 1) {
            setFetchMoreError(
              error.message || "Ocurrió un error al cargar el arte.",
            );
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [pageNumber, location.search]);

  // Infinite scroll observer logic
  const observer = useRef<IntersectionObserver | null>(null);
  const lastArtElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !fetchMoreError) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, fetchMoreError],
  );

  const handleFullImageClickEvent = (e: MouseEvent<HTMLElement>, tile: Art) => {
    navigate("/arte/" + tile.artId);
  };

  const handleRetryFetchMore = () => {
    setFetchMoreError(null);
    setPageNumber((p) => p);
  };

  const handleRetryInitialLoad = () => {
    setFetchMoreError(null);
    setHasMore(true);
    setPageNumber(1);
    setTiles([]);
  };

  const renderStatusMessages = () => {
    // Skeletons for initial load
    if (loading && pageNumber === 1 && tiles.length === 0) {
      const skeletonCount = itemsPerPage / 2 > 10 ? 10 : itemsPerPage / 2;
      return (
        <ResponsiveMasonry
          columnsCountBreakPoints={{
            350: 1,
            750: 2,
            900: 3,
            1080: window.location.search.includes("producto=") ? 3 : 4,
          }}
        >
          <Masonry style={{ columnGap: "7px" }}>
            {Array.from({ length: Math.max(1, skeletonCount) }).map(
              (_, index) => (
                <SkeletonArtCard key={`skeleton-${index}`} />
              ),
            )}
          </Masonry>
        </ResponsiveMasonry>
      );
    }
    // Initial load failed
    if (!loading && pageNumber === 1 && tiles.length === 0 && fetchMoreError) {
      return (
        <Box textAlign="center" p={3}>
          <Typography variant="h6" color="error" gutterBottom>
            Error al cargar el arte.
          </Typography>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            {fetchMoreError}
          </Typography>
          <Button variant="outlined" onClick={handleRetryInitialLoad}>
            Reintentar
          </Button>
        </Box>
      );
    }
    // No results found
    if (!loading && tiles.length === 0 && !fetchMoreError) {
      return (
        <Box textAlign="center" p={3}>
          <Typography variant="h6" gutterBottom>
            No se encontró arte con estos filtros.
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Prueba con otros términos de búsqueda o ajusta las categorías.
          </Typography>
        </Box>
      );
    }
    // Loading more items
    if (loading && tiles.length > 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={2}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography variant="body1">Cargando más arte...</Typography>
        </Box>
      );
    }
    // Error fetching more items
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
    // End of gallery
    if (!loading && !hasMore && tiles.length > 0 && !fetchMoreError) {
      return (
        <Typography
          variant="caption"
          display="block"
          textAlign="center"
          p={2}
          color="textSecondary"
        >
          Has llegado al final de la galería.
        </Typography>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-around",
          backgroundColor: theme.palette.background.paper,
          marginBottom: "15px",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            marginBottom: "16px",
            padding: 0,
          }}
        >
          <SearchBar
            queryValue={searchValue}
            categoryValue={categoryValue}
            onQueryChange={handleQueryChange}
            onCategoryChange={handleCategoryChange}
            onSearchSubmit={() => performSearch(searchValue, categoryValue)}
            placeholderText="Busca tu arte favorito"
            categoriesList={[
              "Abstracto",
              "Animales",
              "Arquitectura",
              "Atardecer",
              "Cacao",
              "Café",
              "Carros",
              "Ciudades",
              "Comida",
              "Edificios",
              "Fauna",
              "Flora",
              "Lanchas, barcos o yates",
              "Montañas",
              "Naturaleza",
              "Navidad",
              "Playas",
              "Puentes",
              "Surrealista",
              "Transportes",
              "Vehículos",
            ]}
          />
        </div>
      </Box>
      <Box
        style={{ paddingBottom: "20px" }}
        aria-live="polite"
        aria-relevant="additions text"
      >
        {tiles.length > 0 && (
          <ResponsiveMasonry
            columnsCountBreakPoints={{
              350: 1,
              750: 2,
              900: 3,
              1080: window.location.search.includes("producto=") ? 3 : 4,
            }}
          >
            <Masonry style={{ columnGap: "7px" }}>
              {tiles.map((tile, i) => (
                <div
                  key={tile.artId}
                  ref={i === tiles.length - 1 ? lastArtElementRef : null}
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
                    originalPhotoWidth={tile.originalPhotoWidth}
                    originalPhotoHeight={tile.originalPhotoHeight}
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
