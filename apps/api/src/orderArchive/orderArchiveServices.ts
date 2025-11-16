import { Collection, Filter, ObjectId } from "mongodb"
import { PrixResponse } from "../types/responseModel.ts"
import { OrderArchive, PayStatus, Status } from "./orderArchiveModel.ts"
import { getDb } from "../mongo.ts"
import { Movement } from "../movements/movementModel.ts"
import { createMovement, updateBalance } from "../movements/movementServices.ts"
import { readUserByUsername } from "../user/userServices/userServices.ts"
import { User } from "../user/userModel.ts"
import { create } from "domain"

function orderArchiveCollection(): Collection<OrderArchive> {
  return getDb().collection<OrderArchive>("orderArchive")
}

const makeError = (e: unknown): string =>
  e instanceof Error ? e.message : String(e)

export const readOrderById = async (id: string): Promise<PrixResponse> => {
  try {
    const orderArchives = orderArchiveCollection()
    const order = await orderArchives.findOne({ _id: new ObjectId(id) })
    return order
      ? { success: true, message: "Order found.", result: order }
      : { success: false, message: "Order not found." }
  } catch (e) {
    return { success: false, message: `An error occurred: ${makeError(e)}` }
  }
}

export const readOrder = async (
  filter: Record<string, unknown>
): Promise<PrixResponse> => {
  try {
    const orderArchives = orderArchiveCollection()
    const order = await orderArchives.findOne(filter)
    return order
      ? { success: true, message: "Order found.", result: order }
      : { success: false, message: "Order not found." }
  } catch (e) {
    return { success: false, message: `An error occurred: ${makeError(e)}` }
  }
}

export interface OrderArchiveQueryOptions {
  page: number
  limit: number
  sortBy: string
  sortOrder: 1 | -1
  filterStatus?: Status
  filterPayStatus?: PayStatus
  search?: string

  filterStartDate?: Date
  filterEndDate?: Date
  filterExcludeStatus?: Status
}

export interface PaginatedOrderArchiveResponse
  extends Omit<PrixResponse, "result"> {
  result: {
    data: OrderArchive[]
    totalCount: number
  } | null
}

export const readAllOrders = async (
  options: OrderArchiveQueryOptions
): Promise<PaginatedOrderArchiveResponse> => {
  try {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      filterStatus,
      filterPayStatus,
      search,
      filterStartDate,
      filterEndDate,
      filterExcludeStatus,
    } = options

    const orders = orderArchiveCollection()
    const skip = (page - 1) * limit

    const filterQuery: Filter<OrderArchive> = {}

    if (filterStatus && !filterExcludeStatus) {
      filterQuery.status = filterStatus
    }

    if (filterExcludeStatus) {
      filterQuery.status = { $nin: ["Concretado", "Entregado", "Anulado"] }
    }

    if (filterPayStatus) {
      filterQuery.payStatus = filterPayStatus
    }

    const dateFieldPath = "createdOn.$date"
    const dateConditions: Filter<Date> = {}

    if (filterStartDate) {
      dateConditions.$gte = filterStartDate
    }

    if (filterEndDate) {
      dateConditions.$lte = filterEndDate
    }

    if (Object.keys(dateConditions).length > 0) {
      filterQuery[dateFieldPath] = dateConditions
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" }
      filterQuery.$or = [
        { orderId: searchRegex },
        { "basicData.firstname": searchRegex },
        { "basicData.lastname": searchRegex },
        { "basicData.name": searchRegex },
        { "basicData.email": searchRegex },
        { "basicData.ci": searchRegex },
        { "shippingData.name": searchRegex },
        { "shippingData.lastname": searchRegex },
        { "shippingData.shippingName": searchRegex },
        { "shippingData.shippingLastName": searchRegex },
        { "billingData.name": searchRegex },
        { "billingData.lastname": searchRegex },
        { "billingData.company": searchRegex },
        { "billingData.billingCompany": searchRegex },
        { "billingData.ci": searchRegex },
      ]
    }

    const totalCount = await orders.countDocuments(filterQuery)

    const list = await orders
      .find(filterQuery)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray()

    return {
      success: true,
      message: list.length
        ? "Órdenes recuperadas."
        : "No se encontraron órdenes para esta página/filtros.",
      result: {
        data: list,
        totalCount: totalCount,
      },
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("Error in readAllOrders service:", e)
    return {
      success: false,
      message: `Ocurrió un error al leer las órdenes: ${msg}`,
      result: null,
    }
  }
}

export const addVoucher = async (
  id: string,
  url: string
): Promise<PrixResponse> => {
  try {
    const orderArchives = orderArchiveCollection()
    const result = await orderArchives.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { paymentVoucher: url, payStatus: "Pagado" } },
      { returnDocument: "after" }
    )

    if (result && !result.status) {
      return { success: false, message: "Order not found." }
    }
    return { success: true, message: "Voucher added.", result: result! }
  } catch (e) {
    return { success: false, message: `An error occurred: ${makeError(e)}` }
  }
}

export const updateOrder = async (
  id: string,
  data: Partial<OrderArchive>,
  adminUsername: string
): Promise<PrixResponse> => {
  try {
    const orderArchives = orderArchiveCollection()
    const result = await orderArchives.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: data },
      { returnDocument: "after" }
    )

    if (!result) {
      return { success: false, message: "Order not found." }
    }

    const updatedOrder: OrderArchive = result

    if (data.status === "Concretado" && updatedOrder.status === "Concretado") {
      console.log(
        `Order ${updatedOrder.orderId} status is 'Concretado'. Processing commissions by ${adminUsername}.`
      )

      for (const request of updatedOrder.requests) {
        if (!request.art || !request.product) {
          console.warn(
            `Skipping commission for a request in order ${updatedOrder.orderId} due to missing art or product data.`
          )
          continue
        }

        let commissionRate: number
        const artSpecificCommission = request.art.comission

        if (
          artSpecificCommission !== undefined &&
          artSpecificCommission !== null
        ) {
          const parsedArtCommission = parseFloat(String(artSpecificCommission))
          if (!isNaN(parsedArtCommission) && parsedArtCommission > 0) {
            commissionRate = parsedArtCommission / 100
            console.log(
              `Using specific commission rate ${parsedArtCommission}% for art '${request.art.title}' by ${request.art.prixerUsername}.`
            )
          } else {
            commissionRate = 0.1
            console.warn(
              `Invalid art commission ('${artSpecificCommission}') for art '${request.art.title}'. Defaulting to 10%.`
            )
          }
        } else {
          commissionRate = 0.1
          console.log(
            `No specific commission for art '${request.art.title}'. Using default 10% for ${request.art.prixerUsername}.`
          )
        }

        let requestSubtotal = 0
        const productFinalPriceStr = request.product.finalPrice
        const requestQuantityStr = request.quantity

        if (
          productFinalPriceStr !== undefined &&
          requestQuantityStr !== undefined
        ) {
          const finalPrice = parseFloat(String(productFinalPriceStr))
          const quantity = parseFloat(String(requestQuantityStr))
          if (
            !isNaN(finalPrice) &&
            !isNaN(quantity) &&
            finalPrice > 0 &&
            quantity > 0
          ) {
            requestSubtotal = finalPrice * quantity
          } else {
            console.warn(
              `Cannot calculate subtotal for request (Art: '${request.art.title}'). Invalid finalPrice ('${productFinalPriceStr}') or quantity ('${requestQuantityStr}'). Skipping.`
            )
            continue
          }
        } else {
          console.warn(
            `Missing finalPrice or quantity for request (Art: '${request.art.title}'). Skipping.`
          )
          continue
        }

        const paymentAmount = requestSubtotal * commissionRate

        if (paymentAmount > 0 && request.art.prixerUsername) {
          const prixer = await readUserByUsername(request.art.prixerUsername)

          if (prixer && prixer.success && prixer.result) {
            const movement: Movement = {
              date: new Date(),
              destinatary: (prixer.result as User).account,
              description: `Commission for order ${updatedOrder.orderId} - Art: ${request.art.title}`,
              type: "Depósito",
              value: parseFloat(paymentAmount.toFixed(2)),
              order: updatedOrder._id.toString(),
              createdOn: new Date(),
              createdBy: adminUsername,
              item: {},
            }
            await updateBalance(movement)
            await createMovement(movement)
          }
        }
      }
    }
    return {
      success: true,
      message: "Order updated successfully.",
      result: updatedOrder,
    }
  } catch (e) {
    console.error(`General error in updateOrder: ${makeError(e)}`)
    return {
      success: false,
      message: `An error occurred while updating the order: ${makeError(e)}`,
    }
  }
}

export const updateItemStatus = async (
  id: string,
  itemIndex: number,
  status: string
): Promise<PrixResponse> => {
  try {
    const orderArchives = orderArchiveCollection()
    const key = `requests.${itemIndex}.status`
    const result = await orderArchives.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { [key]: status } },
      { returnDocument: "after" }
    )

    if (result && !result.status) {
      return { success: false, message: "Order not found." }
    }
    return { success: true, message: "Item status updated.", result: result! }
  } catch (e) {
    return { success: false, message: `An error occurred: ${makeError(e)}` }
  }
}
