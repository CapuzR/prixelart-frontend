import { Product } from "types/product.types"
import { BACKEND_URL } from "./utils.api"
import { PrixResponse } from "types/prixResponse.types"
import axios from "axios"

export interface AllVariantPricesResult {
  variantId: string
  originalPrice: number
  finalPrice: number
}

export const fetchBestSellers = async (): Promise<Product[]> => {
  const URI = `${BACKEND_URL}/product/bestSellers`

  try {
    const res = await axios.get<PrixResponse>(URI)

    if (!res.data.success) {
      console.error("Failed to fetch best sellers:", res.data.message)
      return []
    }

    const products = res.data.result as Product[]
    return products
  } catch (error) {
    console.error("Error fetching best sellers:", error)
    return []
  }
}

export const fetchProducts = async (): Promise<Product[]> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/product/read-all"

  const res = await axios.get<PrixResponse>(base_url)

  if (!res.data.success || !Array.isArray(res.data.result)) {
    console.error("Failed to fetch:", res.data.message)
  }
  console.log(res.data)
  const items = res.data.result as Product[]
  return items
}

export const fetchActiveProducts = async (sort: string): Promise<Product[]> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/product/read-all-active"

  const res = await axios.get(base_url, {
    params: {
      sort,
    },
  })

  if (!res.data.success || !Array.isArray(res.data.result)) {
    console.error("Failed to fetch:", res.data.message)
  }

  const items = res.data.result as Product[]

  return items
}

export const fetchProductDetails = async (
  productId: string
): Promise<Product> => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/product/read/${productId}`

  try {
    const response = await axios.get<PrixResponse>(url)
    if (response.data.result === undefined) {
      throw new Error("Product details not found")
    }
    return response.data.result as Product
  } catch (error) {
    console.error("Error fetching product details:", error)
    throw error
  }
}

export const fetchActiveProductDetails = async (
  productId: string
): Promise<Product> => {
  const url = `${import.meta.env.VITE_BACKEND_URL}/product/read-active/${productId}`

  try {
    const response = await axios.get<PrixResponse>(url)
    if (response.data.result === undefined) {
      throw new Error("Product details not found")
    }
    return response.data.result as Product
  } catch (error) {
    console.error("Error fetching product details:", error)
    throw error
  }
}

export const fetchVariantPrice = async (
  variantId: String,
  productId: String,
  artId?: string
): Promise<[number, number]> => {
  try {
    const response = await axios.get<PrixResponse>(
      `${BACKEND_URL}/product/getVariantPrice`,
      {
        params: { variantId, productId: productId || null, artId },
      }
    )

    if (response.data.result === undefined) {
      throw new Error("Product details not found")
    }
    const result = response.data.result as number[]
    return [result[0], result[1]] as [number, number] // Original Price, Discounted Price
  } catch (error) {
    console.error("Error fetching variant price:", error)
    return [0, 0]
  }
}

export const fetchAllVariantPricesForProduct = async (
  productId: string
): Promise<AllVariantPricesResult[]> => {
  try {
    const base_url =
      import.meta.env.VITE_BACKEND_URL + "/product/getAllVariantPrices"

    const response = await axios.get<any>(base_url, {
      params: { productId },
    })

    if (response.data.success && Array.isArray(response.data.result)) {
      return response.data.result as AllVariantPricesResult[]
    } else {
      console.error(
        "Respuesta inesperada al obtener todos los precios de variantes:",
        response.data.message
      )
      return []
    }
  } catch (error) {
    console.error("Error al obtener todos los precios de variantes:", error)
    return []
  }
}

export const createProduct = async (
  data: Partial<Product>
): Promise<Product> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/product/create"
  try {
    const response = await axios.post<PrixResponse>(base_url, data, {
      withCredentials: true,
    })

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message
      )
      throw new Error(response.data.message || "Authentication failed")
    }

    const newProduct = response.data.result as unknown as Product
    return newProduct
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const updateProduct = async (
  id: string,
  artData: Partial<Product>
): Promise<Product> => {
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/product/update/${id}`
  try {
    const response = await axios.put<PrixResponse>(base_url, artData, {
      withCredentials: true,
    })

    if (!response.data.success) {
      console.error(
        `Backend reported failure updating product`,
        response.data.message
      )
      throw new Error(response.data.message || `Failed to update product `)
    }

    if (!response.data.result) {
      console.error(
        `Backend reported success but no product data returned after update.`
      )
      throw new Error(`No data received after updating product.`)
    }

    const updatedAdmin = response.data.result as unknown as Product
    return updatedAdmin
  } catch (error) {
    console.error(`Error updating productt:`, error)
    throw error
  }
}

export const updateManyProduct = async (
  products: Product[]
): Promise<PrixResponse> => {
  const base_url = `${import.meta.env.VITE_BACKEND_URL}/product/update-many-products`
  try {
    const response = await axios.put<PrixResponse>(base_url, products, {
      withCredentials: true,
      // ContentType: 'application/json'
    })

    if (!response.data.success) {
      console.error(
        `Backend reported failure updating products`,
        response.data.message
      )
      throw new Error(response.data.message || `Failed to update products`)
    }

    if (!response.data.result) {
      console.error(
        `Backend reported success but no product data returned after update.`
      )
      throw new Error(`No data received after updating product.`)
    }

    const updatedAdmin = response.data as unknown as PrixResponse
    return updatedAdmin
  } catch (error) {
    console.error(`Error updating productt:`, error)
    throw error
  }
}

export const deleteProduct = async (id: string): Promise<Product> => {
  const base_url = import.meta.env.VITE_BACKEND_URL + "/product/delete/" + id
  try {
    const response = await axios.delete(base_url, { withCredentials: true })

    if (!response.data.success) {
      console.error(
        "Backend reported authentication failure:",
        response.data.message
      )
      throw new Error(response.data.message || "Authentication failed")
    }

    const delProduct = response.data.result as unknown as Product
    return delProduct
  } catch (e) {
    console.log(e)
    throw e
  }
}

export const fetchUniqueProductionLines = async (): Promise<string[]> => {
  const url = `${BACKEND_URL}/product/unique-production-lines`
  try {
    const response = await axios.get<PrixResponse>(url, {
      withCredentials: true,
    })

    if (!response.data.success) {
      console.error(
        "Failed to fetch unique production lines:",
        response.data.message
      )
      return []
    }

    return (response.data.result as string[]) || []
  } catch (error) {
    console.error("Error fetching unique production lines:", error)
    return []
  }
}
