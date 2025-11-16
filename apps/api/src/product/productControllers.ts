import { Request, Response, NextFunction } from "express"
import * as productServices from "./productServices.ts"
import * as authServices from "../user/userServices/userServices.ts"
import { Product, Variant } from "./productModel.ts"
import { User } from "../user/userModel.ts"
import { ObjectId } from "mongodb"
import { PrixResponse } from "../types/responseModel.ts"

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.products.createProduct) {
      res.send({
        success: false,
        message: "No tienes permiso para crear productos.",
      })
      return
    }

    const {
      name,
      description,
      category,
      productionTime,
      cost,
      publicPriceFrom,
      publicPriceTo,
      prixerPriceFrom,
      prixerPriceTo,
      attributes,
      active,
      hasSpecialVar,
      hasInternationalV,
      autoCertified,
      discount,
      bestSeller,
      sources,
      mockUp,
      variants,
      productionLines,
    } = req.body

    if (!name || !description || !category) {
      res.status(400).send({
        success: false,
        message: "Faltan campos requeridos: name, description o category.",
      })
      return
    }

    const productData: Product = {
      name,
      description,
      category,
      productionTime,
      cost,
      sources: {
        images: sources.images,
        video: sources.video,
      },
      active: Boolean(active),
      hasSpecialVar: Boolean(hasSpecialVar),
      autoCertified: Boolean(autoCertified),
      bestSeller: Boolean(bestSeller),
      mockUp: mockUp || "",
      variants: variants,
      productionLines: productionLines, // Added
    }

    const result = await productServices.createProduct(productData)
    res.send(result)
  } catch (e) {
    console.error(e)
    next(e)
  }
}

export const readById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.permissions?.products.readAllProducts) {
    res.send({
      success: false,
      message: "No tienes permiso para actualizar productos.",
    })
    return
  }

  try {
    const resp = await productServices.readById(req.params.id)
    res.send(resp)
  } catch (err) {
    next(err)
  }
}

export const readActiveById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resp = await productServices.readActiveById(req.params.id)
    res.send(resp)
  } catch (err) {
    next(err)
  }
}

export const getAllVariantPricesForProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.query;

    if (!productId || typeof productId !== 'string') {
      res.status(400).send({
        success: false,
        message: "El parámetro 'productId' es requerido y debe ser una cadena.",
      });
      return;
    }

    let validUser: User | null = null;
    if (req.userId) {
      const userResult = await authServices.readUserById(req.userId);
      if (userResult.success && userResult.result) {
        validUser = userResult.result as User;
      } else {
        console.warn(`[getAllVariantPricesForProductController] Usuario no encontrado para userId: ${req.userId}`);
      }
    }
    const isPrixer = req.isPrixer ? true : false;

    const resp = await productServices.getAllVariantPricesForProduct(
      productId,
      validUser,
      isPrixer
    );

    res.send(resp);
  } catch (err: unknown) {
    console.error("[getAllVariantPricesForProductController] Error en el controlador:", err);
    next(err);
  }
};

export const getVariantPrice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {artId, variantId, productId } = req.query
    if (!variantId || !productId) {
      res.status(400).send({
        success: false,
        message: "variantId y productId son requeridos.",
      })
      return
    }
    let validUser = null
    if (req.userId) {
      validUser = (await authServices.readUserById(req.userId)).result as User
    }
    const isPrixer = req.isPrixer ? true : false

    const resp = await productServices.getVariantPrice(
      variantId as string,
      productId as string,
      artId as string,
      validUser,
      isPrixer
    )
    res.send(resp)
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export const readAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.products.readAllProducts) {
      res.send({
        success: false,
        message: "No tienes permiso para actualizar productos.",
      })
      return
    }

    const resp = await productServices.readAllProducts()
    res.send(resp)
  } catch (err) {
    next(err)
  }
}

export const readAllActiveProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sortBy = req.query.sort as string | undefined
    type ProductSortOption = "A-Z" | "Z-A" | "lowerPrice" | "maxPrice"

    const ALLOWED_PRODUCT_SORT_OPTIONS: Exclude<
      ProductSortOption,
      "default_sort"
    >[] = ["A-Z", "Z-A", "lowerPrice", "maxPrice"]
    let validatedSortBy: ProductSortOption = "A-Z"

    if (sortBy) {
      if (ALLOWED_PRODUCT_SORT_OPTIONS.includes(sortBy as any)) {
        validatedSortBy = sortBy as ProductSortOption
      } else {
        console.warn(
          `Parámetro de ordenamiento inválido: ${sortBy}. Usando orden por defecto.`
        )
      }
    }
    const resp = await productServices.readAllActiveProducts(validatedSortBy)
    res.send(resp)
  } catch (err) {
    next(err)
  }
}

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.products.updateProduct) {
      res.send({
        success: false,
        message: "No tienes permiso para actualizar productos.",
      })
      return
    }

    const updateData: Partial<Product> = {}
    ;[
      "name",
      "description",
      "category",
      "productionTime",
      "cost",
      "discount",
      "mockUp",
      "variants",
      "productionLines",
    ].forEach((f) => {
      if (req.body[f] !== undefined)
        updateData[f as keyof Product] = req.body[f]
    })
    if (req.body.active !== undefined)
      updateData.active = Boolean(req.body.active)
    if (req.body.hasSpecialVar !== undefined)
      updateData.hasSpecialVar = Boolean(req.body.hasSpecialVar)
    if (req.body.autoCertified !== undefined)
      updateData.autoCertified = Boolean(req.body.autoCertified)
    if (req.body.bestSeller !== undefined)
      updateData.bestSeller = Boolean(req.body.bestSeller)

    updateData.sources = req.body.sources
    updateData.variants = req.body.variants

    const resp = await productServices.updateProduct(req.params.id, updateData)
    res.send(resp)
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export const updateManyProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.products.updateProduct) {
      res.status(403).send({
        success: false,
        message: 'No tienes permiso para realizar una actualización masiva de productos.',
      })
      return
    }

    const productsToProcess: Product[] = req.body
    if (!Array.isArray(productsToProcess)) {
      res.status(400).send({
        success: false,
        message: 'El cuerpo de la solicitud debe ser un array de productos.',
      })
      return
    }

    const serviceResponse = await productServices.processBulkProductUpdate(
      productsToProcess
    )

    const statusCode = serviceResponse.success ? 200 : 500
    res.status(statusCode).send(serviceResponse)
    
  } catch (err) {
    console.error("Error general en updateManyProducts controller:", err)
    next(err)
  }
}

export const getUniqueProductionLines = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resp = await productServices.getUniqueProductionLines()
    res.send(resp)
  } catch (err) {
    next(err)
  }
}

export const readBestSellers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resp = await productServices.readBestSellers()
    res.send(resp)
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.products.deleteProduct) {
      res.send({
        success: false,
        message: "No tienes permiso para eliminar productos.",
      })
      return
    }
    const resp = await productServices.deleteProduct(req.params.id)
    res.send(resp)
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export const deleteVariant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.products.deleteVariant) {
      res.send({
        success: false,
        message: "No tienes permiso para actualizar productos.",
      })
      return
    }
    const variantToDelete = await productServices.deleteVariant(req.body)
    const data = { variantToDelete, success: true }
    res.send(data)
  } catch (err) {
    next(err)
  }
}
