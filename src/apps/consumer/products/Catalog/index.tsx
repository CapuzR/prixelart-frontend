import React, { useEffect, useMemo, useState } from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';

import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import ProductElement from 'components/ProductElement';
import { Slider } from 'components/Slider';
import SortingSelect from 'components/SortingSelect';
import PaginationBar from 'components/Pagination/PaginationBar';
import Grid2 from '@mui/material/Grid';
import Card from 'apps/consumer/products/components/Card';

import ReactGA from 'react-ga';

import styles from './styles.module.scss';
import { useCurrency } from '@context/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import { SelectChangeEvent } from '@mui/material';
import SearchBar from '@components/searchBar/searchBar';
import { Product } from '../../../../types/product.types';
import { fetchBestSellers, fetchActiveProducts } from '@api/product.api';
import ScrollToTopButton from '@components/ScrollToTop';

ReactGA.initialize('G-0RWP9B33D8');
ReactGA.pageview('/productos');

interface ProductsCatalogProps {
  onProductSelect?: (product: Product) => void;
}

const ProductsCatalog: React.FC<ProductsCatalogProps> = ({ onProductSelect }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { currency, conversionRate } = useCurrency();

  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [products, setProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[] | undefined>(undefined);

  const [currentPage, setCurrentPage] = useState(1);
  const [maxLength, setMaxLength] = useState(0);
  const [productsPerPage] = useState(10);
  const [sort, setSort] = useState('A-Z');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryValue, setCategoryValue] = useState<string>('');

  const sortingOptions = [
    { value: 'A-Z', label: 'A-Z' },
    { value: 'Z-A', label: 'Z-A' },
    { value: 'lowerPrice', label: 'Menor precio' },
    { value: 'maxPrice', label: 'Mayor precio' },
  ];

  const scrollToProduct = (product: Product) => {
    navigate('/producto/' + product._id);
  };

  const handleChangeSort = (event: SelectChangeEvent<string>, child: React.ReactNode) => {
    setSort(event.target.value);
  };

  // --- New handlers for the updated SearchBar ---
  const handleQueryChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    setCurrentPage(1); // Reset to the first page on a new search
  };

  // This is a placeholder. Products don't have a category filter in this view.
  const handleCategoryChange = (newCategory: string) => {
    setCategoryValue(newCategory);
  };

  // This is a placeholder. We are filtering as the user types.
  const handleSearchSubmit = () => {
    // This could be used to trigger a search if you don't want to filter on every keystroke.
    // For now, it's not needed.
  };
  // --- End of new handlers ---

  const handleDetails = (product: Product) => {
    navigate('/producto/' + product._id);
    ReactGA.event({
      category: 'Productos',
      action: 'Ver_mas',
      label: product.name,
    });
  };

  useEffect(() => {
    const getBestSellers = async () => {
      const bestSellers = await fetchBestSellers();
      setBestSellers(bestSellers);
    };

    getBestSellers();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchActiveProducts(sort);
        setProducts(response);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchData();
  }, [sort, currentPage, productsPerPage, searchQuery]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const displayedProducts = filteredProducts;

  return (
    <div className={styles['catalog']}>
      <CssBaseline />

      <>
        <div className={styles['title']}>
          <Typography
            variant="h3"
            color="secondary"
            sx={{
              fontFamily: 'Futura, sans-serif',
              fontStyle: 'italic',
              fontWeight: '700',
              // color: 'white',
            }}
          >
            Productos Prix
          </Typography>
        </div>

        {bestSellers && !onProductSelect && (
          <div
            className={styles['best-sellers']}
            style={{
            }}
          >
            <div className={styles['title-wrapper']}>
              <Typography
                variant="h4"
                className={styles['best-seller-title']}
                sx={{
                  fontFamily: 'Futura, sans-serif',
                  fontStyle: 'italic',
                  fontWeight: '700',
                }}
              >
                ¡Más vendidos!
              </Typography>
            </div>
            <div className={styles['slider-wrapper']}>
              <Slider
                images={bestSellers?.map((product) => ({
                  url:
                    product?.sources?.images.length > 0
                      ? (product.sources.images[0]?.url ?? '')
                      : (product.thumbUrl ?? ''),
                }))}
                useIndicators={{
                  type: 'dots',
                  position: 'below',
                  color: { active: 'primary', inactive: 'secondary' },
                }}
                childConfig={{
                  qtyPerSlide: isDesktop ? 6 : isMobile || onProductSelect ? 1 : 3,
                  spacing: 'sm',
                }}
                autoplay={false}
              >
                {bestSellers?.map((product, i) => (
                  <div key={i} >
                    <ProductElement
                      src={
                        product?.sources?.images.length > 0
                          ? product.sources.images[0]?.url || ''
                          : product.thumbUrl || ''
                      }
                      productName={product.name}
                      buttonLabel="Ver detalles"
                      onButtonClick={() => scrollToProduct(product)}
                      roundedCorner={true}
                    />
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        )}
      </>

      <div className={styles['grid-container']}>
        <div className={styles['search-bar']}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {/* --- Updated SearchBar component props --- */}
            <SearchBar
              queryValue={searchQuery}
              categoryValue={categoryValue}
              onQueryChange={handleQueryChange}
              onCategoryChange={handleCategoryChange}
              onSearchSubmit={handleSearchSubmit}
              placeholderText="Busca tu producto favorito"
              // We don't pass `categoriesList` because products don't use it here.
            />
          </div>
          <div className={styles['sorting-select']}>
            <SortingSelect sort={sort} handleChange={handleChangeSort} options={sortingOptions} />
          </div>
          {/* <div className={styles['sorting-select']}>
            <CurrencySwitch />
          </div> */}
        </div>
        <Grid2 container spacing={isMobile ? 2 : 3} style={{ marginTop: 20 }}>
          {displayedProducts && displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <Grid2
                key={String(product._id)}
                size={{ xs: 12, sm: 6, md: onProductSelect ? 6 : 4 }}
              >
                <Card
                  product={product}
                  currency={currency}
                  conversionRate={conversionRate}
                  handleDetails={() =>
                    onProductSelect ? onProductSelect(product) : handleDetails(product)
                  }
                  isCart={onProductSelect ? true : false}
                  onProductSelect={onProductSelect}
                  isMobile={isMobile}
                />
              </Grid2>
            ))
          ) : (
            <h1>Pronto encontrarás los productos ideales para ti.</h1>
          )}
        </Grid2>
      </div>

      <PaginationBar
        setPageNumber={setCurrentPage}
        pageNumber={currentPage}
        itemsPerPage={productsPerPage}
        maxLength={maxLength}
      />
      <ScrollToTopButton />
    </div>
  );
};

export default ProductsCatalog;
