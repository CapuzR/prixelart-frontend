import { Product } from "../../../types/product.types";

export const parseProduct = (data: any): Product => {

    const id = data._id || data.id || '';


    const priceRange = {
        from: data.priceRange && data.priceRange.from
            ? parseFloat(data.priceRange.from.replace(',', '.'))
            : 0,
        to: data.priceRange && data.priceRange.to
            ? parseFloat(data.priceRange.to.replace(',', '.'))
            : 0,
    };


    const price = typeof data.price === 'number' ? data.price : priceRange.from;

    return {
        id,
        name: data.name || '',
        price,
        description: data.description || '',
        attributes: data.attributes || [],
        // Assuming selection may not be provided, so defaulting to an empty array.
        selection: data.selection || [],
        // Map each variant; we convert _id to id.
        variants: (data.variants || []).map((variant: any) => ({
            id: variant._id || variant.id || '',
            name: variant.name || '',
            attributes: variant.attributes || [],
        })),
        priceRange,
        observations: data.observations || '',
        thumbUrl: data.thumbUrl || '',
        // Extract only the image URL for each source.
        sources: {
            images: (data.sources?.images || []).map((img: any) => ({
                url: img.url,
            })),
        },
        productionTime: data.productionTime || 0,
        mockUp: data.mockUp || null,
        category: data.category,
    };
};
