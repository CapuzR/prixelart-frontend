import { AdjustmentMethod, Discount } from "../discount/discountModel.ts";
import { readAllDiscounts } from "../discount/discountServices.ts";
import { Surcharge } from "../surcharge/surchargeModel.ts";
import { readActiveSurcharge } from "../surcharge/surchargeServices.ts";
import { User } from "../user/userModel.ts";
import { Product } from "./productModel.ts";

export const isDateActive = (dateRange?: { start: Date; end: Date }): boolean => {
    if (!dateRange) return true;
    const now = new Date();
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.warn("Invalid date range found:", dateRange);
        return false;
    }
    return now >= start && now <= end;
};

export const applyAdjustmentsToProduct = async (product: Product, activeDiscounts: Discount[], activeSurcharges: Surcharge[]): Promise<Product> => {
    if (!product._id) {
        console.warn("Product missing _id in applyAdjustmentsToProduct");
        return product;
    }
    const productIdString = product._id.toHexString();
    const variantSpecificDiscountIds: { [variantId: string]: Set<string> } = {};
    const variantSpecificSurchargeIds: { [variantId: string]: Set<string> } = {};

    activeDiscounts.forEach(discount => {
        if (!discount._id || !isDateActive(discount.dateRange)) return;

        const discountIdString = discount._id.toHexString();

        if (discount.applicableProducts && discount.applicableProducts.length > 0) {
            discount.applicableProducts.forEach(([pId, vId]) => {
                if (pId === productIdString) {
                    if (vId) {
                        if (!variantSpecificDiscountIds[vId]) {
                            variantSpecificDiscountIds[vId] = new Set<string>();
                        }
                        variantSpecificDiscountIds[vId].add(discountIdString);
                    }
                }
            });
        }
    });

    activeSurcharges.forEach(surcharge => {
        if (!surcharge._id || !isDateActive(surcharge.dateRange)) return;

        const surchargeIdString = surcharge._id.toHexString();
        if (surcharge.applicableProducts && surcharge.applicableProducts.length > 0) {
            surcharge.applicableProducts.forEach(([pId, vId]) => {
                if (pId === productIdString) {
                    if (vId) {
                        if (!variantSpecificSurchargeIds[vId]) {
                            variantSpecificSurchargeIds[vId] = new Set<string>();
                        }
                        variantSpecificSurchargeIds[vId].add(surchargeIdString);
                    }
                }
            });
        }
    });

    if (product.variants) {
        product.variants = product.variants.map(variant => {
            const combinedDiscountIds = new Set<string>([
                ...(variant.discountId || []),
                ...(variant._id && variantSpecificDiscountIds[variant._id] ? Array.from(variantSpecificDiscountIds[variant._id]) : [])
            ]);
            const combinedSurchargeIds = new Set<string>([
                ...(variant.surchargeId || []),
                ...(variant._id && variantSpecificSurchargeIds[variant._id] ? Array.from(variantSpecificSurchargeIds[variant._id]) : [])
            ]);

            return {
                ...variant,
                discountId: Array.from(combinedDiscountIds),
                surchargeId: Array.from(combinedSurchargeIds)
            };
        });
    }

    return product;
};

export const applyAdjustmentsToList = async (productList: Product[]): Promise<Product[]> => {
    if (productList.length === 0) return [];

    const [discountsRes, surchargesRes] = await Promise.all([
        readAllDiscounts(),
        readActiveSurcharge()
    ]);
    const activeDiscounts: Discount[] = (discountsRes.result as unknown as Discount[]) || [];
    const activeSurcharges: Surcharge[] = (surchargesRes.result as unknown as Surcharge[]) || [];

    const adjustedList = await Promise.all(
        productList.map(product => applyAdjustmentsToProduct(product, activeDiscounts, activeSurcharges))
    );

    return adjustedList;
};

export const getAdjustmentValue = (adjustment: Discount | Surcharge, user?: User | null): { value: number; method: AdjustmentMethod } => {
    let finalValue = adjustment.defaultValue;
    let finalMethod = adjustment.adjustmentMethod;

    if (user && adjustment.entityOverrides && adjustment.entityOverrides.length > 0) {

        const override = adjustment.entityOverrides.find(ov =>
            ov.type === 'user' && ov.id === user._id?.toHexString()
        );

        if (override && override.customValue !== undefined) {
            finalValue = override.customValue;
            if ((override as any).adjustmentMethod) {
                finalMethod = (override as any).adjustmentMethod;
            }
        }
    }
    return { value: finalValue, method: finalMethod };
};