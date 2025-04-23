import { SourceProduct } from "../../../types/api.types";
import { Product, Variant } from "../../../types/product.types";

export const parseProduct = (sourceProduct: SourceProduct): Product | null => {

    if (!sourceProduct.variants || !sourceProduct.variants.length) {
        return null;
    }

    function parsePrice(equation: string | number): number {
        let eqStr: string;
        if (typeof equation === "number") {
            eqStr = equation.toString();
        } else if (typeof equation === "string") {
            eqStr = equation;
        } else {
            return 0;
        }
        const cleaned = eqStr.replace(/[^0-9.,]/g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }

    const prices = sourceProduct.variants
        .filter((variant) => variant.publicPrice && variant.publicPrice.equation)
        .map((variant) => parsePrice(variant.publicPrice.equation));

    const mainPrice = prices.length > 0 ? prices[0] : 0;
    const priceRange = {
        from: prices.length > 0 ? Math.min(...prices) : 0,
        to: prices.length > 0 ? Math.max(...prices) : 0
    };

    let thumbUrl = "";
    if (!thumbUrl && sourceProduct.variants[0]) {
        if (
            sourceProduct.variants[0].variantImage &&
            sourceProduct.variants[0].variantImage.length > 0
        ) {
            thumbUrl = sourceProduct.variants[0].variantImage[0].url;
        } else if (sourceProduct.variants[0].thumbUrl) {
            thumbUrl = sourceProduct.variants[0].thumbUrl;
        }
    }

    const firstVariant = sourceProduct.variants[0];
    if (firstVariant) {
        if (firstVariant.variantImage && firstVariant.variantImage.length > 0) {
            thumbUrl = firstVariant.variantImage[0].url;
        } else if (firstVariant.thumbUrl) {
            thumbUrl = firstVariant.thumbUrl;
        }
    }

    const variants: Variant[] = sourceProduct.variants.map((variant) => ({
        _id: variant._id,
        id: variant._id,
        name: variant.name,
        attributes: variant.attributes.map((attr) => ({
            name: attr.name,
            value: attr.value
        }))
    }));

    let sourcesImages: { url: string }[] = [];
    let videoUrl: string | undefined = undefined;

    if (
        sourceProduct.sources &&
        sourceProduct.sources.images &&
        sourceProduct.sources.images.length > 0
    ) {
        for (const src of sourceProduct.sources.images) {
            if (!videoUrl && src.url && src.url.includes("<iframe")) {
                // Extract the src attribute from the iframe HTML using regex.
                const match = src.url.match(/src="([^"]+)"/);
                if (match && match[1]) {
                    videoUrl = match[1];
                }
            } else if (src.url && !src.url.includes("<iframe")) {
                sourcesImages.push({ url: src.url });
            }
            if (sourcesImages.length >= 5) break; // Limit images to 5
        }
    }

    // Fallback: if there are no source images, collect images from variants (up to 5)
    if (sourcesImages.length === 0) {
        for (const variant of sourceProduct.variants) {
            if (variant.variantImage && variant.variantImage.length > 0) {
                for (const image of variant.variantImage) {
                    if (sourcesImages.length < 5) {
                        sourcesImages.push({ url: image.url });
                    } else {
                        break;
                    }
                }
            } else if (variant.thumbUrl) {
                if (sourcesImages.length < 5) {
                    sourcesImages.push({ url: variant.thumbUrl });
                }
            }
            if (sourcesImages.length >= 5) break;
        }
    }

    const sources = {
        images: sourcesImages,
        video: undefined
    };

    const attributesMap: { [key: string]: Set<string> } = {};
    for (const variant of sourceProduct.variants) {
        if (variant.attributes) {
            for (const attr of variant.attributes) {
                if (!attributesMap[attr.name]) {
                    attributesMap[attr.name] = new Set();
                }
                attributesMap[attr.name].add(attr.value);
            }
        }
    }
    const attributes = Object.entries(attributesMap).map(([name, valuesSet]) => ({
        name,
        value: Array.from(valuesSet)
    }));

    const category = sourceProduct.variants[0]?.category || undefined;

    return {
        id: sourceProduct._id,
        name: sourceProduct.name,
        price: mainPrice,
        description: sourceProduct.description,
        attributes: attributes,
        selection: [], // No selection provided; set as empty array
        variants: variants,
        priceRange: priceRange,
        observations: '', // Not provided in source; default empty string
        thumbUrl: thumbUrl,
        sources: sources,
        productionTime: 0, // Default value since not provided
        mockUp: '', // Default value since not provided
        category: category
    };
};

export function parseProducts(sourceProducts: SourceProduct[]): Product[] {
    return sourceProducts.map(sourceProduct => parseProduct(sourceProduct))
        .filter((product): product is Product => product !== null);
}