// Api Product

import { CarouselItem } from "./preference.types";

interface SourceImage {
    type: string;
    url: string;
}

interface SourceAttribute {
    name: string;
    value: string;
}

interface Price {
    equation: string;
    from?: string;
    to?: string;
}

interface SourceVariant {
    _id: string;
    variantImage: SourceImage[];
    active: boolean;
    name: string;
    description: string;
    category: string;
    considerations: string;
    attributes: SourceAttribute[];
    publicPrice: Price;
    prixerPrice: Price;
    thumbUrl: string;
}

interface SourceSources {
    images: SourceImage[];
}

export interface SourceProduct {
    sources: SourceSources;
    _id: string;
    variants: SourceVariant[];
    name: string;
    description: string;
}

type PrixResult = CarouselItem | CarouselItem[];

export interface PrixResponse {
    success: boolean;
    message: string;
    result?: PrixResult;
}