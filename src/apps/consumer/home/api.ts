import { CarouselItem } from '../../../types/preference.types';
import { PrixResponse, SourceProduct } from '../../../types/api.types';
import axios from 'axios';
import { Art } from 'types/art.types';
import { getImageSize } from 'utils/util';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const fetchCarouselImages = async (): Promise<{
    desktopCarousel: CarouselItem[];
    mobileCarousel: CarouselItem[];
}> => {
    const URI = `${BACKEND_URL}/carousel`;
    try {
        const res = await fetch(URI);
        const data: PrixResponse = await res.json();

        if (data.success && Array.isArray(data.result)) {
            const carouselItems = data.result;
            return {
                desktopCarousel: carouselItems.filter(item => item.type === 'desktop'),
                mobileCarousel: carouselItems.filter(item => item.type === 'mobile')
            };
        } else {
            console.error('Failed to fetch carousel data:', data.message);
            return { desktopCarousel: [], mobileCarousel: [] };
        }
    } catch (error) {
        console.error('Error fetching carousel data:', error);
        return { desktopCarousel: [], mobileCarousel: [] };
    }
};

export const fetchBestSellers = async (): Promise<SourceProduct[]> => {
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
