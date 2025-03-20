import React, { useState, useEffect, MouseEvent } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import SearchBar from 'components/searchBar/searchBar';
import { fetchGallery } from '../../api';
import ArtThumbnail from '../ArtThumbnail';
import PaginationBar from '../../../../../components/Pagination/PaginationBar';
import { useLoading } from 'context/GlobalContext';
import Detail from './Details/Details';
import { useNavigate } from 'react-router-dom';
import useStyles from './ArtsGrid.styles';
import { Art } from '../../../../../types/art.types';

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
  const { setLoading } = useLoading();
  const classes = useStyles();
  const navigate = useNavigate();
  const globalParams = new URLSearchParams(window.location.search);

  const [tiles, setTiles] = useState<Art[]>([]);
  const [total, setTotal] = useState<number>(1);
  const [searchValue, setSearchValue] = useState<string | null>(
    globalParams.get('name') || null
  );
  const [categoryValue, setCategoryValue] = useState<string | null>(
    globalParams.get('category') || null
  );
  
  const [pageNumber, setPageNumber] = useState<number>(1);
  const itemsPerPage: number = 30;
  const activePrixer = globalParams.get('prixer');

  useEffect(() => {
    setLoading(true);

    const fetchData = async () => {
      try {
        const filters: GalleryFilters = {
          initialPoint: (pageNumber - 1) * itemsPerPage,
          itemsPerPage: itemsPerPage,
        };
        if (searchValue) filters.text = searchValue;
        if (categoryValue) filters.category = categoryValue;
        filters.initialPoint = (pageNumber - 1) * itemsPerPage;
        filters.itemsPerPage = itemsPerPage;

        const response: { arts: Art[]; length: number } = await fetchGallery(filters);
        setTiles(response.arts);
        setTotal(response.length);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchData().finally(() => setLoading(false));
  }, [searchValue, categoryValue, pageNumber, activePrixer, itemsPerPage, setLoading]);

  const handleSearch = (queryValue: string | null, categories: string | null) => {
    setSearchValue(queryValue);
    setCategoryValue(categories);
    setPageNumber(1);
  };

  const handleFullImageClick = (e: MouseEvent<HTMLElement>, tile: Art) => {
    navigate('/arte/' + tile._id);
  };

  const ResponsiveMasonryAny: any = ResponsiveMasonry;
  const MasonryAny: any = Masonry;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <div className={classes.root}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '20px',
          position: 'relative',
          height: '95%',
        }}
      >
        <ResponsiveMasonryAny
          columnsCountBreakPoints={{
            350: 1,
            750: 2,
            900: 3,
            1080: window.location.search.includes('producto=') ? 3 : 4,
          }}
        >
          <MasonryAny style={{ columnGap: '7px' }}>
            {tiles && tiles.length > 0 ? (
              tiles.map((tile, i) => (
                <div key={i + 1000}>
                  <ArtThumbnail
                    tile={tile as Art}
                    i={i}
                    handleFullImageClick={(e: MouseEvent<HTMLElement>) => {
                      if (onArtSelect) {
                        onArtSelect(tile);
                      } else {
                        handleFullImageClick(e, tile);
                      }
                    }}
                    onArtSelect={onArtSelect}
                  />
                </div>
              ))
            ) : (
              <h1>Pronto encontrarás todo el arte que buscas.</h1>
            )}
          </MasonryAny>
        </ResponsiveMasonryAny>
      </div>

      <PaginationBar
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
        itemsPerPage={itemsPerPage}
        maxLength={total}
      />
    </div>
  );
};

export default ArtsGrid;