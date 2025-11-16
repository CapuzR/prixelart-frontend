import { Product, Variant } from "./productModel.ts"
import * as orderServices from "../order/orderService.ts"
import { readAllDiscounts } from "../discount/discountServices.ts"
import * as ArtService from "../art/artServices.ts"
import { Collection, ObjectId } from "mongodb"
import { PrixResponse } from "../types/responseModel.ts"
import { User } from "../user/userModel.ts"
import { Art } from "../art/artModel.ts"
import { Order } from "../order/orderModel.ts"
import { getDb } from "../mongo.ts"
import {
  applyAdjustmentsToList,
  applyAdjustmentsToProduct,
  getAdjustmentValue,
  isDateActive,
} from "./utils.ts"
import { readActiveSurcharge } from "../surcharge/surchargeServices.ts"
import { Discount } from "../discount/discountModel.ts"
import { Surcharge } from "../surcharge/surchargeModel.ts"

export interface VariantPriceResult {
  variantId: string;
  originalPrice: number;
  finalPrice: number;
}

function productCollection(): Collection<Product> {
  return getDb().collection<Product>("products")
}

function artCollection(): Collection<Art> {
  return getDb().collection<Art>("arts");
}

export const createProduct = async (p: Product): Promise<PrixResponse> => {
  try {
    const products = productCollection()
    const { acknowledged, insertedId } = await products.insertOne(p)
    if (acknowledged) {
      return {
        success: true,
        message: "Producto creado exitosamente.",
        result: { ...p, _id: insertedId },
      }
    }
    return { success: false, message: "No se pudo crear el producto." }
  } catch (e: unknown) {
    return { success: false, message: `Error: ${(e as Error).message}` }
  }
}

export const readById = async (id: string): Promise<PrixResponse> => {
  try {
    const products = productCollection()
    let productObjectId: ObjectId
    try {
      productObjectId = new ObjectId(id)
    } catch (error) {
      console.error(`Invalid productId format for readById: ${id}`, error)
      return { success: false, message: "Formato de ID de producto inválido." }
    }

    const prod = await products.findOne({ _id: productObjectId })
    if (!prod) return { success: false, message: "Producto no encontrado." }

    const [discountsRes, surchargesRes] = await Promise.all([
      readAllDiscounts(),
      readActiveSurcharge(),
    ])

    const updatedProd = await applyAdjustmentsToProduct(
      prod,
      (discountsRes.result as unknown as Discount[]) || [],
      (surchargesRes.result as unknown as Surcharge[]) || []
    )

    return {
      success: true,
      message: "Producto encontrado.",
      result: updatedProd,
    }
  } catch (e: unknown) {
    return { success: false, message: `Error: ${(e as Error).message}` }
  }
}

export const readActiveById = async (id: string): Promise<PrixResponse> => {
  try {
    const products = productCollection()
    let productObjectId: ObjectId
    try {
      productObjectId = new ObjectId(id)
    } catch (error) {
      console.error(`Invalid productId format for readActiveById: ${id}`, error)
      return { success: false, message: "Formato de ID de producto inválido." }
    }

    // 1. Fetch the product ONLY if it's active
    const product = await products.findOne({
      _id: productObjectId,
      active: true,
    })

    // Check if product was found and is active
    if (!product) {
      return {
        success: false,
        message: "Producto no encontrado o no está activo.",
      }
    }

    // 2. Fetch all discounts and active surcharges (needed for the next steps)
    const [discountsRes, surchargesRes] = await Promise.all([
      readAllDiscounts(),
      readActiveSurcharge(),
    ])

    if (
      !discountsRes.success ||
      !surchargesRes.success ||
      !Array.isArray(surchargesRes.result)
    ) {
      console.warn(
        `readActiveById: Could not fetch discounts/surcharges for product ${id}. Returning product without adjustments or price calculations.`
      )
      return {
        success: true,
        message:
          "Producto activo encontrado (ajustes/recargos no pudieron ser procesados).",
        result: product,
      }
    }

    const activeDiscounts: Discount[] =
      (discountsRes.result as unknown as Discount[]) || []
    const activeSurcharges: Surcharge[] = surchargesRes.result as Surcharge[]

    // 3. Apply adjustments to populate surcharge/discount IDs on variants
    const productWithAdjustmentIds = await applyAdjustmentsToProduct(
      product,
      activeDiscounts,
      activeSurcharges
    )

    // --- Start of Price Update Logic ---

    // 4. Create a Map for efficient surcharge lookup by ID
    const surchargeMap = new Map<string, Surcharge>(
      activeSurcharges.map((s) => [s._id!.toHexString(), s])
    )

    // 5. Iterate through the product's variants to apply surcharge values to prices
    if (
      productWithAdjustmentIds.variants &&
      productWithAdjustmentIds.variants.length > 0
    ) {
      productWithAdjustmentIds.variants = productWithAdjustmentIds.variants.map(
        (variant) => {
          if (variant.surchargeId && variant.surchargeId.length > 0) {
            let totalSurchargeAmount = 0
            const basePublicPrice = parseFloat(variant.publicPrice)
            const basePrixerPrice = parseFloat(variant.prixerPrice)

            if (isNaN(basePublicPrice) || isNaN(basePrixerPrice)) {
              console.warn(
                `readActiveById: Invalid base price for variant ${variant._id} in product ${product._id}. Skipping surcharge calculation for this variant.`
              )
              return variant
            }

            variant.surchargeId.forEach((surchargeId) => {
              const surcharge = surchargeMap.get(surchargeId)
              if (surcharge) {
                const { defaultValue, adjustmentMethod } = surcharge

                let surchargeAmount = 0
                if (adjustmentMethod === "percentage") {
                  surchargeAmount = (basePublicPrice * defaultValue) / 100
                } else {
                  surchargeAmount = defaultValue
                }
                totalSurchargeAmount += surchargeAmount
              } else {
                console.warn(
                  `readActiveById: Surcharge details not found for ID ${surchargeId} during price calculation.`
                )
              }
            })

            const newPublicPrice = basePublicPrice + totalSurchargeAmount
            const newPrixerPrice = basePrixerPrice + totalSurchargeAmount

            return {
              ...variant,
              publicPrice: newPublicPrice.toFixed(2),
              prixerPrice: newPrixerPrice.toFixed(2),
            }
          }
          return variant
        }
      )
    }

    // 6. Return the final product object with potentially updated variant prices
    return {
      success: true,
      message: "Producto activo encontrado.",
      result: productWithAdjustmentIds,
    }
  } catch (e: unknown) {
    console.error(`Error in readActiveById for id ${id}:`, e)
    const message = e instanceof Error ? e.message : String(e)
    return {
      success: false,
      message: `Error retrieving active product by ID: ${message}`,
    }
  }
}

export const getVariantPrice = async (
  variantId: string,
  productId: string,
  artId?: string,
  user?: User | null,
  isPrixer?: boolean
): Promise<PrixResponse> => {
  try {
    const products = productCollection()
    let productObjectId: ObjectId
    try {
      productObjectId = new ObjectId(productId)
    } catch (error) {
      console.error(
        `Invalid productId format for getVariantPrice: ${productId}`,
        error
      )
      return { success: false, message: "Formato de ID de producto inválido." }
    }

    let commissionRate = 10;
    if (artId) {
      try {
        const arts = artCollection();
        const art = await arts.findOne({ _id: new ObjectId(artId) });
        if (art && typeof art.comission === 'number') {
          commissionRate = art.comission;
        }
      } catch (error) {
        console.warn(`Could not fetch art or commission for artId: ${artId}. Using default 10%.`);
      }
    }

    const product = await products.findOne({ _id: productObjectId })

    if (!product?.variants?.length) {
      console.warn(
        `getVariantPrice: Product or variants not found for productId: ${productId}`
      )
      return { success: false, message: "Producto o variantes no encontradas." }
    }

    const variant = product.variants.find((v: Variant) => v._id === variantId)

    if (!variant) {
      console.warn(
        `getVariantPrice: Variant not found for variantId: ${variantId} within productId: ${productId}`
      )
      return { success: false, message: "Variante no encontrada." }
    }

    const priceSourceKey = isPrixer ? "prixerPrice" : "publicPrice"
    const priceStringToParse = variant[
      priceSourceKey as keyof Pick<Variant, "publicPrice" | "prixerPrice">
    ] as string

    const netPrice = parseFloat(priceStringToParse) * 0.9;

    if (isNaN(netPrice)) {
      return {
        success: false,
        message: "Precio base inválido para esta variante.",
      }
    }

    const basePrice = netPrice / (1 - commissionRate / 100);

    // --- Price Calculation ---
    let priceAfterSurcharges = basePrice

    const [activeDiscounts, activeSurcharges] = await Promise.all([
      readAllDiscounts(),
      readActiveSurcharge(),
    ])

    const productIdString = product._id.toHexString();

      // 1. Apply Surcharges to get originalPriceWithSurcharges
      (activeSurcharges.result as Surcharge[]).forEach((surcharge) => {
        if (!surcharge._id || !isDateActive(surcharge.dateRange)) return

        const isApplicable =
          surcharge.appliesToAllProducts ||
          surcharge.applicableProducts?.some(
            ([pId, vId]) => pId === productIdString && (!vId || vId === variantId)
          )

        if (isApplicable) {
          const { value, method } = getAdjustmentValue(surcharge, user)
          let surchargeAmount = 0
          if (method === "percentage") {
            surchargeAmount = (netPrice * value) / 100
          } else {
            surchargeAmount = value
          }
          priceAfterSurcharges += surchargeAmount
        }
      })

    const originalPriceWithSurcharges = priceAfterSurcharges

    // 2. Prepare and Apply Discounts
    let priceAfterDiscounts = originalPriceWithSurcharges
    const applicablePercentageDiscounts: Discount[] = []
    const applicableAbsoluteDiscounts: Discount[] = [];

    (activeDiscounts.result as Discount[]).forEach((discount) => {
        if (!discount._id || !isDateActive(discount.dateRange)) return

        const isApplicable =
          discount.appliesToAllProducts ||
          discount.applicableProducts?.some(
            ([pId, vId]) => pId === productIdString && (!vId || vId === variantId)
          )

        if (isApplicable) {
          const { method } = getAdjustmentValue(discount, user)
          if (method === "percentage") {
            applicablePercentageDiscounts.push(discount)
          } else {
            applicableAbsoluteDiscounts.push(discount)
          }
        }
      })

    // Apply Percentage Discounts First
    applicablePercentageDiscounts.forEach((discount) => {
      const { value } = getAdjustmentValue(discount, user)
      const discountAmount = (priceAfterDiscounts * value) / 100
      priceAfterDiscounts -= discountAmount
    })

    // Apply Absolute Discounts Second
    applicableAbsoluteDiscounts.forEach((discount) => {
      const { value } = getAdjustmentValue(discount, user)
      priceAfterDiscounts -= value
    })

    // Ensure final price isn't negative
    priceAfterDiscounts = Math.max(0, priceAfterDiscounts)

    // Round final values
    const finalOriginalPrice = parseFloat(
      originalPriceWithSurcharges.toFixed(2)
    )
    const finalDiscountedPrice = parseFloat(priceAfterDiscounts.toFixed(2))

    return {
      success: true,
      message: "Precios calculado y original encontrados",
      result: [finalOriginalPrice, finalDiscountedPrice],
    }
  } catch (e: unknown) {
    console.error(
      `getVariantPrice: Error calculating price for productId: ${productId}, variantId: ${variantId}`,
      e
    )
    const errorMessage = e instanceof Error ? e.message : String(e)
    return {
      success: false,
      message: `Error al calcular precios de variante: ${errorMessage}`,
    }
  }
}

export const getAllVariantPricesForProduct = async (
  productId: string,
  user?: User | null,
  isPrixer?: boolean
): Promise<{ success: boolean; message: string; result?: VariantPriceResult[] | null }> => {
  try {
    const products = productCollection();
    let productObjectId: ObjectId;
    try {
      productObjectId = new ObjectId(productId);
    } catch (error) {
      console.error(
        `[getAllVariantPricesForProduct] Formato de ID de producto inválido: ${productId}`,
        error
      );
      return { success: false, message: "Formato de ID de producto inválido." };
    }

    const product = await products.findOne({ _id: productObjectId });

    if (!product?.variants?.length) {
      console.warn(
        `[getAllVariantPricesForProduct] Producto o variantes no encontradas para productId: ${productId}`
      );
      return { success: false, message: "Producto o variantes no encontradas." };
    }

    const [activeDiscountsResult, activeSurchargesResult] = await Promise.all([
      readAllDiscounts(),
      readActiveSurcharge(),
    ]);

    const activeDiscounts = (activeDiscountsResult.result as Discount[]) || [];
    const activeSurcharges = (activeSurchargesResult.result as Surcharge[]) || [];


    const productPrices: VariantPriceResult[] = [];
    const productIdString = product._id.toHexString();

    for (const variant of product.variants) {
      const priceSourceKey = isPrixer ? "prixerPrice" : "publicPrice";
      const priceStringToParse = variant[
        priceSourceKey as keyof Pick<Variant, "publicPrice" | "prixerPrice">
      ] as string;

      const basePrice = parseFloat(priceStringToParse);

      if (isNaN(basePrice)) {
        console.warn(`[getAllVariantPricesForProduct] Precio base inválido para variante ${variant._id}`);
        continue;
      }

      let priceAfterSurcharges = basePrice;

      activeSurcharges.forEach((surcharge) => {
        if (!surcharge._id || !isDateActive(surcharge.dateRange)) return;

        const isApplicable =
          surcharge.appliesToAllProducts ||
          surcharge.applicableProducts?.some(
            ([pId, vId]) => pId === productIdString && (!vId || vId === variant._id)
          );

        if (isApplicable) {
          const { value, method } = getAdjustmentValue(surcharge, user);
          let surchargeAmount = 0;
          if (method === "percentage") {
            surchargeAmount = (basePrice * value) / 100;
          } else {
            surchargeAmount = value;
          }
          priceAfterSurcharges += surchargeAmount;
        }
      });

      const originalPriceWithSurcharges = priceAfterSurcharges;
      let priceAfterDiscounts = originalPriceWithSurcharges;

      const applicablePercentageDiscounts: Discount[] = [];
      const applicableAbsoluteDiscounts: Discount[] = [];

      activeDiscounts.forEach((discount) => {
        if (!discount._id || !isDateActive(discount.dateRange)) return;

        const isApplicable =
          discount.appliesToAllProducts ||
          discount.applicableProducts?.some(
            ([pId, vId]) => pId === productIdString && (!vId || vId === variant._id)
          );

        if (isApplicable) {
          const { method } = getAdjustmentValue(discount, user);
          if (method === "percentage") {
            applicablePercentageDiscounts.push(discount);
          } else {
            applicableAbsoluteDiscounts.push(discount);
          }
        }
      });

      applicablePercentageDiscounts.forEach((discount) => {
        const { value } = getAdjustmentValue(discount, user);
        const discountAmount = (priceAfterDiscounts * value) / 100;
        priceAfterDiscounts -= discountAmount;
      });

      applicableAbsoluteDiscounts.forEach((discount) => {
        const { value } = getAdjustmentValue(discount, user);
        priceAfterDiscounts -= value;
      });

      priceAfterDiscounts = Math.max(0, priceAfterDiscounts);

      productPrices.push({
        variantId: variant._id!,
        originalPrice: parseFloat(originalPriceWithSurcharges.toFixed(2)),
        finalPrice: parseFloat(priceAfterDiscounts.toFixed(2)),
      });
    }

    return {
      success: true,
      message: "Precios de todas las variantes calculados.",
      result: productPrices,
    };

  } catch (e: unknown) {
    console.error(
      `[getAllVariantPricesForProduct] Error general al calcular precios para productId: ${productId}`,
      e
    );
    const errorMessage = e instanceof Error ? e.message : String(e);
    return {
      success: false,
      message: `Error al calcular precios de variantes: ${errorMessage}`,
    };
  }
};

export const readAllProducts = async (): Promise<PrixResponse> => {
  try {
    const products = productCollection()
    const list = await products.find({}).toArray()

    const adjustedList = await applyAdjustmentsToList(list)

    return {
      success: true,
      message: "Productos encontrados.",
      result: adjustedList,
    }
  } catch (e: unknown) {
    return { success: false, message: `Error: ${(e as Error).message}` }
  }
}

export const readAllActiveProducts = async (
  sortBy: string | undefined
): Promise<PrixResponse> => {
  try {
    const products = productCollection()
    const list = await products.find({ active: true }).toArray()

    // 1. Apply adjustments to get surcharge/discount IDs populated on variants
    const listWithAdjustmentIds = await applyAdjustmentsToList(list)

    // 2. Fetch active surcharges to get their details (value, method)
    const surchargesRes = await readActiveSurcharge()
    if (!surchargesRes.success || !Array.isArray(surchargesRes.result)) {
      console.warn(
        "readAllActiveProducts: Could not fetch surcharge details for price calculation."
      )
      return {
        success: true,
        message:
          "Productos activos encontrados (surcharge price calculation skipped due to fetch error).",
        result: listWithAdjustmentIds,
      }
    }
    const activeSurcharges = surchargesRes.result as Surcharge[]

    // 3. Create a Map for efficient surcharge lookup by ID
    const surchargeMap = new Map<string, Surcharge>(
      activeSurcharges.map((s) => [s._id!.toHexString(), s])
    )

    // 4. Iterate through products and variants to apply surcharge values to prices
    const listWithUpdatedPrices = listWithAdjustmentIds.map((product) => {
      if (product.variants && product.variants.length > 0) {
        const updatedVariants = product.variants.map((variant) => {
          if (variant.surchargeId && variant.surchargeId.length > 0) {
            let totalSurchargeAmount = 0
            const basePublicPrice = parseFloat(variant.publicPrice)
            const basePrixerPrice = parseFloat(variant.prixerPrice)

            if (isNaN(basePublicPrice) || isNaN(basePrixerPrice)) {
              console.warn(
                `readAllActiveProducts: Invalid base price for variant ${variant._id} in product ${product._id}. Skipping surcharge calculation for this variant.`
              )
              return variant
            }

            variant.surchargeId.forEach((surchargeId) => {
              const surcharge = surchargeMap.get(surchargeId)
              if (surcharge) {
                const { defaultValue, adjustmentMethod } = surcharge

                let surchargeAmount = 0
                if (adjustmentMethod === "percentage") {
                  surchargeAmount = (basePublicPrice * defaultValue) / 100
                } else {
                  surchargeAmount = defaultValue
                }
                totalSurchargeAmount += surchargeAmount
              } else {
                console.warn(
                  `readAllActiveProducts: Surcharge details not found for ID ${surchargeId} during price calculation.`
                )
              }
            })

            const newPublicPrice = basePublicPrice + totalSurchargeAmount
            const newPrixerPrice = basePrixerPrice + totalSurchargeAmount

            return {
              ...variant,
              publicPrice: newPublicPrice.toFixed(2),
              prixerPrice: newPrixerPrice.toFixed(2),
            }
          }
          return variant
        })
        return { ...product, variants: updatedVariants }
      }
      return product
    })

    switch (sortBy) {
      case "A-Z":
        listWithUpdatedPrices.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "Z-A":
        listWithUpdatedPrices.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "lowerPrice":
        listWithUpdatedPrices.sort((a, b) => {
          const priceA = getMinVariantPublicPrice(a)
          const priceB = getMinVariantPublicPrice(b)
          return priceA - priceB
        })
        break
      case "maxPrice":
        listWithUpdatedPrices.sort((a, b) => {
          const priceA = getMaxVariantPublicPrice(a)
          const priceB = getMaxVariantPublicPrice(b)
          return priceB - priceA
        })
        break
    }

    return {
      success: true,
      message: "Productos activos encontrados.",
      result: listWithUpdatedPrices,
    }
  } catch (e: unknown) {
    console.error("Error in readAllActiveProducts:", e)
    const message = e instanceof Error ? e.message : String(e)
    return {
      success: false,
      message: `Error retrieving active products: ${message}`,
    }
  }
}

export const readBestSellers = async (): Promise<PrixResponse> => {
  try {
    const products = productCollection()
    const ordersResp = await orderServices.readAllOrders()
    if (!ordersResp.success || !Array.isArray(ordersResp.result)) {
      return {
        success: false,
        message: "Error fetching orders for best sellers.",
      }
    }
    const orders = ordersResp.result as Order[]

    const allPotentialProducts = await products
      .find({ active: true, variants: { $exists: true, $not: { $size: 0 } } })
      .toArray()

    const productMapByName = new Map<string, Product>(
      allPotentialProducts.map((p) => [p.name, p as Product])
    )

    const tally: { [productName: string]: number } = {}
    for (const order of orders) {
      for (const line of Object.values(order.lines || {})) {
        const name = line?.item?.product?.name
        if (name && productMapByName.has(name)) {
          tally[name] = (tally[name] || 0) + (line.quantity || 1)
        }
      }
    }

    const topProductNames = Object.entries(tally)
      .sort(([, quantA], [, quantB]) => quantB - quantA)
      .slice(0, 10)
      .map(([name]) => name)

    const bestProductsRaw = topProductNames
      .map((name) => productMapByName.get(name))
      .filter((p): p is Product => p !== undefined)

    const bestProductsAdjusted = await applyAdjustmentsToList(bestProductsRaw)

    return {
      success: true,
      message: "Estos son los productos más vendidos.",
      result: bestProductsAdjusted,
    }
  } catch (e: unknown) {
    console.error("Error in readBestSellers:", e)
    return {
      success: false,
      message: `Error calculating best sellers: ${e instanceof Error ? e.message : String(e)
        }`,
    }
  }
}

export const updateProduct = async (
  id: string,
  update: Partial<Product>
): Promise<PrixResponse> => {
  try {
    const products = productCollection()
    const result = await products.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    )
    if (result && !result.name) {
      return { success: false, message: "Producto no encontrado." }
    }
    return { success: true, message: "Producto actualizado.", result: result! }
  } catch (e: unknown) {
    return { success: false, message: `Error: ${(e as Error).message}` }
  }
}

export const processBulkProductUpdate = async (
  productsToProcess: Product[]
): Promise<PrixResponse> => {

  const existingProductsResponse = await readAllProducts()
  if (!existingProductsResponse.success || !existingProductsResponse.result) {
    return {
      success: false,
      message: 'No se pudieron obtener los productos existentes para la actualización.',
    }
  }
  const existingProducts: Product[] = existingProductsResponse.result as Product[]

  const existingProductsMap = new Map<string, Product>()
  existingProducts.forEach((p) => {
    if (p._id) {
      existingProductsMap.set(p._id.toString(), p)
    }
  })

  const results: {
    productId?: string
    variantId?: string
    success: boolean
    message: string
    productName?: string
    variantName?: string
  }[] = []

  for (const productDataFromFrontend of productsToProcess) {
    const { _id: productId, variants: variantsFromFrontend, ...productFields } = productDataFromFrontend

    if (!productId) {
      results.push({
        success: false,
        message: 'Producto recibido sin ID, no se puede actualizar.',
        productName: productFields.name || 'N/A',
      })
      continue
    }

    const existingProduct = existingProductsMap.get(productId.toString())
    if (!existingProduct) {
      results.push({
        productId: productId.toString(),
        success: false,
        message: `Producto con ID ${productId.toString()} no encontrado en la base de datos.`,
        productName: productFields.name || 'N/A',
      })
      continue
    }

    const updateProductData: Partial<Product> = {}
    if (productFields.name !== undefined) updateProductData.name = productFields.name
    if (productFields.cost !== undefined) updateProductData.cost = String(productFields.cost)
    if (productFields.productionTime !== undefined) updateProductData.productionTime = String(productFields.productionTime)
    if (productFields.productionLines !== undefined) {
      updateProductData.productionLines = Array.isArray(productFields.productionLines)
        ? productFields.productionLines.map((s) => String(s).trim()).filter((s) => s !== '')
        : undefined
    }

    if (Object.keys(updateProductData).length > 0) {
      const updateResponse = await updateProduct(productId.toString(), updateProductData)
      results.push({
        productId: productId.toString(),
        success: updateResponse.success,
        message: updateResponse.success ? 'Producto padre actualizado.' : updateResponse.message,
        productName: existingProduct.name,
      })
    }

    if (variantsFromFrontend && variantsFromFrontend.length > 0) {
        const variantsMap = new Map<string, Variant>(
            existingProduct.variants?.map(v => [v._id!.toString(), v]) || []
        );

        for (const variantData of variantsFromFrontend) {
            const { _id: variantId, attributes, ...variantFields } = variantData;
            
            const updateVariantData: Partial<Variant> = {};
            if (variantFields.name !== undefined) updateVariantData.name = variantFields.name;
            if (variantFields.publicPrice !== undefined) updateVariantData.publicPrice = String(variantFields.publicPrice);
            if (variantFields.prixerPrice !== undefined) updateVariantData.prixerPrice = String(variantFields.prixerPrice);
            if (attributes !== undefined) {
                updateVariantData.attributes = Array.isArray(attributes)
                    ? attributes.map(attr => ({ name: String(attr.name).trim(), value: String(attr.value).trim() }))
                    : [];
            }

            if (variantId && variantsMap.has(variantId.toString())) {
                const existingVariant = variantsMap.get(variantId.toString())!;
                const updatedVariant = { ...existingVariant, ...updateVariantData };
                variantsMap.set(variantId.toString(), updatedVariant);
                results.push({
                    productId: productId.toString(),
                    variantId: variantId.toString(),
                    success: true,
                    message: `Variante '${variantFields.name}' actualizada.`,
                    productName: existingProduct.name,
                    variantName: variantFields.name,
                });
            } else if (Object.keys(updateVariantData).length > 0) {
                const newVariant: Variant = {
                    _id: new ObjectId().toString(),
                    name: updateVariantData.name || "Nueva Variante",
                    attributes: updateVariantData.attributes || [],
                    publicPrice: updateVariantData.publicPrice || "0.00",
                    prixerPrice: updateVariantData.prixerPrice || "0.00",
                };
                variantsMap.set(newVariant._id!, newVariant);
                results.push({
                    productId: productId.toString(),
                    variantId: newVariant._id,
                    success: true,
                    message: `Nueva variante '${newVariant.name}' creada.`,
                    productName: existingProduct.name,
                    variantName: newVariant.name,
                });
            }
        }
        
        const finalVariants = Array.from(variantsMap.values());
        const variantUpdateResponse = await updateProduct(productId.toString(), { variants: finalVariants });

        if (!variantUpdateResponse.success) {
            results.push({
                productId: productId.toString(),
                success: false,
                message: `Error al guardar los cambios de variantes: ${variantUpdateResponse.message}`,
                productName: existingProduct.name,
            });
        }
    }
  }

  return {
    success: true,
    message: 'Proceso de actualización masiva completado.',
    result: results,
  }
}

export const deleteProduct = async (id: string): Promise<PrixResponse> => {
  try {
    const products = productCollection()
    const result = await products.findOneAndDelete({ _id: new ObjectId(id) })
    if (result && !result.name) {
      return { success: false, message: "Producto no encontrado." }
    }
    return { success: true, message: "Producto eliminado.", result: result! }
  } catch (e: unknown) {
    return { success: false, message: `Error: ${(e as Error).message}` }
  }
}

export const deleteVariant = async (data: {
  product: string
  variant: string
}): Promise<PrixResponse> => {
  try {
    const products = productCollection()
    const { product: productId, variant: variantId } = data
    const prod = await products.findOne({ _id: new ObjectId(productId) })
    if (!prod) {
      return { success: false, message: "Producto no encontrado." }
    }
    const newVariants = (prod.variants || []).filter((v) => v._id !== variantId)
    const result = await products.findOneAndUpdate(
      { _id: new ObjectId(productId) },
      { $set: { variants: newVariants } },
      { returnDocument: "after" }
    )
    if (result && !result.name) {
      return { success: false, message: "No se pudo eliminar la variante." }
    }
    return {
      success: true,
      message: "Variante eliminada exitosamente.",
      result: result!,
    }
  } catch (e: unknown) {
    return { success: false, message: `Error: ${(e as Error).message}` }
  }
}

export const getUniqueProductionLines = async (): Promise<PrixResponse> => {
  try {
    const products = productCollection()
    const uniqueLines = await products.distinct("productionLines")
    // Filter out any null or undefined values that might be stored in the DB
    const filteredLines = uniqueLines.filter(
      (line) => line !== null && line !== undefined
    )
    return {
      success: true,
      message: "Líneas de producción únicas obtenidas.",
      result: filteredLines as string[],
    }
  } catch (e: unknown) {
    console.error("Error in getUniqueProductionLines:", e)
    return { success: false, message: `Error: ${(e as Error).message}` }
  }
}

function getMinVariantPublicPrice(product: Product): number {
  if (!product.variants || product.variants.length === 0) {
    return Infinity // Para productos sin variantes, se consideran "más caros"
  }
  const prices = product.variants
    .map((variant) => parseFloat(variant.publicPrice))
    .filter((price) => !isNaN(price)) // Filtrar NaN si alguna conversión falla

  return prices.length > 0 ? Math.min(...prices) : Infinity
}

function getMaxVariantPublicPrice(product: Product): number {
  if (!product.variants || product.variants.length === 0) {
    return -Infinity // Para productos sin variantes, se consideran "más baratos"
  }
  const prices = product.variants
    .map((variant) => parseFloat(variant.publicPrice))
    .filter((price) => !isNaN(price)) // Filtrar NaN

  return prices.length > 0 ? Math.max(...prices) : -Infinity
}
