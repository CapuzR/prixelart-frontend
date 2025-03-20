import axios from 'axios';
import { Art } from 'types/art.types';
import { Product } from 'types/product.types';
import { getImageSize } from 'utils/util';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface CarouselItem {
    images?: {
        type: string;
        url: string;
    };
    carouselImages?: CarouselItem[];
    width?: string;
    height?: string;
}

export const fetchCarouselImages = async (fallback: CarouselItem[]): Promise<{
    desktop: CarouselItem[];
    mobile: CarouselItem[];
}> => {
    const URI = `${BACKEND_URL}/carousel`;
    try {
        const res = await fetch(URI);
        const data = await res.json();
        const imagesDesktopData = data.imagesCarousels.filter(
            (result: CarouselItem) =>
                result.images?.type === 'desktop' || result.carouselImages
        );
        const imagesMobileData = data.imagesCarousels.filter(
            (result: CarouselItem) => result.images?.type === 'mobile'
        );
        return {
            desktop: imagesDesktopData.length > 0 ? imagesDesktopData : data.imagesCarousels,
            mobile: imagesMobileData.length > 0 ? imagesMobileData : fallback,
        };
    } catch (error) {
        console.error('Error fetching carousel images:', error);
        return {
            desktop: [],
            mobile: fallback,
        };
    }
};

export const fetchBestSellers = async (): Promise<Product[]> => {
    const url = `${BACKEND_URL}/product/bestSellers`;
    try {
        const { data } = await axios.get(url);
        return data.products;
    } catch (error) {
        console.error('Error fetching best sellers:', error);
        return [];
    }
};

export const fetchBestArts = async (): Promise<Art[]> => {
    const url = `${BACKEND_URL}/art/bestSellers`;
    try {
        const { data } = await axios.get(url);
        return data.arts;
    } catch (error) {
        console.error('Error fetching best arts:', error);
        return [];
    }
};

export const fetchLatestArts = async (): Promise<Art[]> => {
    const url = `${BACKEND_URL}/art/get-latest`;
    try {
        const { data } = await axios.get(url);
        const artsArray: Art[] = data.arts.map((art: Art) => ({
            ...art,
            url: art.largeThumbUrl ? art.largeThumbUrl : art.largeThumbUrl,
        }));
        const sizesArray = await Promise.all(
            artsArray.map(async (art) => {
                try {
                    return await getImageSize(art.largeThumbUrl);
                } catch (error) {
                    console.error('Failed to get image size for:', art.largeThumbUrl, error);
                    return { width: 0, height: 0 };
                }
            })
        );
        return artsArray.map((art, index) => ({
            ...art,
            width: sizesArray[index]?.width || 0,
            height: sizesArray[index]?.height || 0,
        }));
    } catch (error) {
        console.error('Error fetching latest arts:', error);
        return [];
    }
};
