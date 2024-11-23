import React, { useEffect, useState } from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';

import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/styles';
import { useHistory } from 'react-router-dom';

import FloatingAddButton from 'components/floatingAddButton/floatingAddButton';
import CreateService from 'components/createService/createService';
import ArtUploader from 'components/artUploader/artUploader';
import Grid from 'components/Grid';
import ProductElement from 'components/ProductElement';
import { Slider } from 'components/Slider';
import SortingSelect from 'components/SortingSelect';
import PaginationBar from 'components/Pagination/PaginationBar';

import Card from 'apps/consumer/products/components/Card';

import { fetchBestSellers, fetchProducts } from '../api';
import ReactGA from 'react-ga';

import styles from './styles.module.scss';
import { Product } from 'apps/consumer/products/interfaces';
import { useConversionRate, useCurrency } from 'context/GlobalContext';
import { Art } from '../interfaces';
import { queryCreator } from 'apps/consumer/flow/utils';
import CurrencySwitch from 'components/CurrencySwitch';

ReactGA.initialize('G-0RWP9B33D8');
ReactGA.pageview('/productos');

interface ProductsCatalogProps {
  pointedProduct?: string | null;
  setPointedProduct?: (productName: string) => void;
  flowData?: {
    onlyGrid?: boolean;
    addInFlow: (updatedArt?: Art, updatedProduct?: Product) => void | undefined;
    selectedProductId?: string | undefined;
  };
}

const ProductsCatalog: React.FC<ProductsCatalogProps> = ({
  pointedProduct,
  flowData = {
    onlyGrid: false,
    addInFlow: undefined,
    selectedProductId: undefined,
  },
  setPointedProduct,
}) => {
  const theme = useTheme();
  const history = useHistory();
  const { currency } = useCurrency();
  const { conversionRate } = useConversionRate();

  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState<Product[] | undefined>(undefined);

  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [currentPage, setCurrentPage] = useState(1);
  const [maxLength, setMaxLength] = useState(0);
  const [productsPerPage] = useState(10);
  const [sort, setSort] = useState('');

  // Pronto se moverá.
  const [openServiceFormDialog, setOpenServiceFormDialog] = useState(false);
  const [createdService, setCreatedService] = useState(false);
  const [openArtFormDialog, setOpenArtFormDialog] = useState(false);

  const sortingOptions = [
    { value: 'A-Z', label: 'A-Z' },
    { value: 'Z-A', label: 'Z-A' },
    { value: 'lowerPrice', label: 'Menor precio' },
    { value: 'maxPrice', label: 'Mayor precio' },
  ];

  const handleProduct = async (product) => {
    setPointedProduct(product.name);
    document.getElementById(product.name)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const handleChangeSort = (event) => {
    setSort(event.target.value);
  };

  const handleDetails = (product) => {
    history.push({
      pathname: '/producto/' + product.id,
    });
    ReactGA.event({
      category: 'Productos',
      action: 'Ver_mas',
      label: product.name,
    });
  };

  const goToFlow = (art: Art, product: Product) => {
    if (flowData?.addInFlow) {
      flowData.addInFlow(art, { ...product, selection: undefined });
    } else {
      const queryString = queryCreator(
        undefined,
        undefined,
        product?.id,
        undefined,
        undefined,
        'producto',
        '1'
      );

      history.push({ pathname: '/flow', search: queryString });
    }
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
        const response = await fetchProducts(sort, currentPage, productsPerPage);
        const { products, maxLength } = {
          products: response.products,
          maxLength: response.maxLength,
        };
        setProducts(products);
        setMaxLength(maxLength);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchData();
  }, [sort, currentPage, productsPerPage]);

  return (
    <div className={styles['catalog']}>
      <CssBaseline />
      {!flowData.onlyGrid && (
        <>
          <div className={styles['title']}>
            <Typography variant="h4">
              <strong>Productos Prix</strong>
            </Typography>
          </div>

          {bestSellers && (
            <div className={styles['best-sellers']}>
              <div className={styles['title-wrapper']}>
                <Typography variant="h5" className={styles['best-seller-title']}>
                  {isMobile ? (
                    <strong>¡Más vendidos!</strong>
                  ) : (
                    <strong>¡Productos más vendidos! </strong>
                  )}
                </Typography>
              </div>
              <div className={styles['slider-wrapper']}>
                <Slider
                  images={bestSellers?.map((product) => ({
                    url:
                      product?.sources?.images.length > 0
                        ? product.sources.images[0]?.url
                        : product.thumbUrl,
                  }))}
                  useIndicators={{
                    type: 'dots',
                    position: 'below',
                    color: { active: 'primary', inactive: 'secondary' },
                  }}
                  childConfig={{
                    qtyPerSlide: isDesktop ? 4 : isMobile ? 1 : 3,
                    spacing: 'sm',
                  }}
                  autoplay={false}
                >
                  {bestSellers?.map((product, i) => (
                    <div key={i}>
                      <ProductElement
                        src={
                          product?.sources?.images.length > 0
                            ? product.sources.images[0]?.url
                            : product.thumbUrl
                        }
                        productName={product.name}
                        buttonLabel="Ver detalles"
                        onButtonClick={() => handleProduct(product)}
                        roundedCorner={true}
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          )}
        </>
      )}
      <div className={styles['grid-container']}>
        <div className={styles['search-bar']}>
          <div className={styles['sorting-select']}>
            <SortingSelect sort={sort} handleChange={handleChangeSort} options={sortingOptions} />
          </div>
          <div className={styles['sorting-select']}>
            <CurrencySwitch />
          </div>
        </div>
        <Grid isParent={true}>
          {products && products.length > 0 ? (
            products.map((product) => (
              <Grid key={product.id}>
                <Card
                  product={product}
                  currency={currency}
                  conversionRate={conversionRate}
                  handleDetails={handleDetails}
                  pointedProduct={pointedProduct}
                  goToFlow={goToFlow}
                  isSelectedInFlow={flowData?.selectedProductId === product.id}
                />
              </Grid>
            ))
          ) : (
            <h1>Pronto encontrarás los productos ideales para ti.</h1>
          )}
        </Grid>
      </div>

      <PaginationBar
        setPageNumber={setCurrentPage}
        pageNumber={currentPage}
        itemsPerPage={productsPerPage}
        maxLength={maxLength}
      />

      {/* Utility?, it shouldn't be here. */}
      {openArtFormDialog && (
        <ArtUploader
          openArtFormDialog={openArtFormDialog}
          setOpenArtFormDialog={setOpenArtFormDialog}
        />
      )}

      {/* Utility?, it shouldn't be here. */}
      {openServiceFormDialog && (
        <CreateService
          openArtFormDialog={openServiceFormDialog}
          setOpenServiceFormDialog={setOpenServiceFormDialog}
          setCreatedService={setCreatedService}
        />
      )}

      {/* Utility, it shouldn't be here. */}
      <Grid className={styles['float']}>
        <FloatingAddButton
          setOpenArtFormDialog={setOpenArtFormDialog}
          setOpenServiceFormDialog={setOpenServiceFormDialog}
        />
      </Grid>
    </div>
  );
};

export default ProductsCatalog;
