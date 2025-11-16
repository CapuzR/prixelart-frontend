import { Request, Response, NextFunction } from "express"
import * as orderServices from "./orderService.ts"
import { Order, PaymentMethod, ShippingMethod } from "./orderModel.ts"

// Order
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.orders.create) {
      res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
      return
    }

    const orderData = req.body
    orderData.seller = req.adminFullname
    const creation = await orderServices.createOrder(orderData)

    res.send(creation)
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export const createOrder4Client = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await orderServices.createOrder(req.body, req.isPrixer, req.prixerUsername)
    await orderServices.sendEmail(req.body)
    res.send({ success: true, info: "Éxito" })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export const addVoucher = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.orders.updatePayDetails) {
      res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
      return
    }

    const voucherUrl =
      req.session?.uploadResults?.vouchers?.find(
        (v: { purpose: string; url: string }) => v.purpose === "PaymentVoucher"
      )?.url || null

    if (!voucherUrl) {
      res
        .status(400)
        .send({ success: false, message: "No voucher found in session." })
      return
    }

    const updated = await orderServices.addVoucher(req.params.id, voucherUrl)
    res.send(updated)
  } catch (err) {
    next(err)
  }
}

export const readOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await orderServices.readOrderById(req.params.id)
    res.send(result)
  } catch (err) {
    next(err)
  }
}

export const readAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.permissions?.orders.readAllOrders) {
    res.send({
      success: false,
      message: "No tienes autorización para leer todos los pedidos.",
    })
    return
  }

  try {
    const results = await orderServices.readAllOrders()
    res.send(results)
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export const readOrdersByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // if (!req.permissions?.createOrder) {
  //   res.send({
  //     success: false,
  //     message: "No tienes autorización para leer estos pedidos",
  //   })
  //   return
  // }
  // TODO: apply a validation for users !

  try {
    const results = await orderServices.readOrdersByEmail(req.body)
    res.send(results)
  } catch (err) {
    console.error(err)
    next(err)
  }
}

export const updateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.permissions?.orders.updateDetails) {
    res.send({
      success: false,
      message: "No tienes autorización para realizar esta acción.",
    })
    return
  }

  try {
    const orderId = req.params.id
    const updateData = req.body as Partial<Order>

    if (!orderId) {
      res
        .status(400)
        .send({ success: false, message: "ID de orden requerido." })
      return
    }
    if (Object.keys(updateData).length === 0) {
      res.status(400).send({
        success: false,
        message: "No se proporcionaron datos para actualizar.",
      })
      return
    }

    delete updateData._id
    delete updateData.createdOn

    const result = await orderServices.updateOrderAndProcessCommissions(
      orderId,
      updateData,
      req.adminUsername
    )
    res.status(result.success ? 200 : 400).send(result)
  } catch (err) {
    console.error("Error in updateOrder controller:", err)
    next(err)
  }
}

export const deleteOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.orders.deleteOrder) {
      res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
      return
    }

    const orderId = req.params.id
    if (!orderId) {
      res
        .status(400)
        .send({ success: false, message: "ID de orden requerido." })
      return
    }

    const result = await orderServices.deleteOrder(orderId)
    res.send(result)
  } catch (err) {
    console.error("Error in deleteOrder controller:", err)
    next(err)
  }
}

const parseDateQuery = (dateString: any, defaultDate: Date): Date => {
  if (dateString && !isNaN(new Date(dateString as string).getTime())) {
    return new Date(dateString as string)
  }
  return defaultDate
}

export const getGlobalOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.orders.readAllOrders) {
      res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
      return
    }
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const startDate = parseDateQuery(req.query.startDate, thirtyDaysAgo)
    const endDate = parseDateQuery(req.query.endDate, new Date())
    endDate.setHours(23, 59, 59, 999)

    if (startDate > endDate) {
      res.status(400).send({
        success: false,
        message: "Start date cannot be after end date.",
      })
      return
    }

    const result = await orderServices.readAllOrdersByDateRange(
      startDate,
      endDate
    )
    res.send(result)
  } catch (err) {
    console.error("[Controller Error] getGlobalOrders:", err)
    next(err)
  }
}

export const getGlobalDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const startDate = parseDateQuery(req.query.startDate, thirtyDaysAgo)
    const endDate = parseDateQuery(req.query.endDate, new Date())
    endDate.setHours(23, 59, 59, 999)

    if (startDate > endDate) {
      res.status(400).send({
        success: false,
        message: "Start date cannot be after end date.",
      })
      return
    }

    const result = await orderServices.calculateGlobalDashboardStats(
      startDate,
      endDate
    )
    res.send(result)
  } catch (err) {
    console.error("[Controller Error] getGlobalDashboardStats:", err)
    next(err)
  }
}

export const getGlobalTopPerformingItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const startDate = parseDateQuery(req.query.startDate, thirtyDaysAgo)
    const endDate = parseDateQuery(req.query.endDate, new Date())
    endDate.setHours(23, 59, 59, 999)

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5

    if (startDate > endDate) {
      res.status(400).send({
        success: false,
        message: "Start date cannot be after end date.",
      })
      return
    }
    if (isNaN(limit) || limit <= 0) {
      res.status(400).send({
        success: false,
        message: "Invalid limit provided. Must be a positive number.",
      })
      return
    }

    const result = await orderServices.getGlobalTopPerformingItems(
      startDate,
      endDate,
      limit
    )
    res.send(result)
  } catch (err) {
    console.error("[Controller Error] getGlobalTopPerformingItems:", err)
    next(err)
  }
}

export const getSellerPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const startDate = parseDateQuery(req.query.startDate, thirtyDaysAgo)
    const endDate = parseDateQuery(req.query.endDate, new Date())
    endDate.setHours(23, 59, 59, 999)

    if (startDate > endDate) {
      res
        .status(400)
        .send({
          success: false,
          message: "Start date cannot be after end date.",
        })
      return
    }

    const result = await orderServices.getSellerPerformance(startDate, endDate)
    res.send(result)
  } catch (err) {
    console.error("[Controller Error] getSellerPerformance:", err)
    next(err)
  }
}

export const getPrixerPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const startDate = parseDateQuery(req.query.startDate, thirtyDaysAgo)
    const endDate = parseDateQuery(req.query.endDate, new Date())
    endDate.setHours(23, 59, 59, 999)

    if (startDate > endDate) {
      res
        .status(400)
        .send({
          success: false,
          message: "Start date cannot be after end date.",
        })
      return
    }

    const result = await orderServices.getPrixerPerformance(startDate, endDate)
    res.send(result)
  } catch (err) {
    console.error("[Controller Error] getPrixerPerformance:", err)
    next(err)
  }
}

export const getProductPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const startDate = parseDateQuery(req.query.startDate, thirtyDaysAgo)
    const endDate = parseDateQuery(req.query.endDate, new Date())
    endDate.setHours(23, 59, 59, 999)

    if (startDate > endDate) {
      res
        .status(400)
        .send({
          success: false,
          message: "Start date cannot be after end date.",
        })
      return
    }

    const result = await orderServices.getProductPerformance(startDate, endDate)
    res.send(result)
  } catch (err) {
    console.error("[Controller Error] getProductPerformance:", err)
    next(err)
  }
}

export const getProductionLinePerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const startDate = parseDateQuery(req.query.startDate, thirtyDaysAgo)
    const endDate = parseDateQuery(req.query.endDate, new Date())
    endDate.setHours(23, 59, 59, 999)

    if (startDate > endDate) {
      res.status(400).send({
        success: false,
        message: "Start date cannot be after end date.",
      })
      return
    }

    const result = await orderServices.getProductionLinePerformance(
      startDate,
      endDate
    )
    res.send(result)
  } catch (err) {
    console.error("[Controller Error] getProductionLinePerformance:", err)
    next(err)
  }
}

export const getArtPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const startDate = parseDateQuery(req.query.startDate, thirtyDaysAgo)
    const endDate = parseDateQuery(req.query.endDate, new Date())
    endDate.setHours(23, 59, 59, 999)

    if (startDate > endDate) {
      res.status(400).send({
        success: false,
        message: "Start date cannot be after end date.",
      })
      return
    }

    const result = await orderServices.getArtPerformance(startDate, endDate)
    res.send(result)
  } catch (err) {
    console.error("[Controller Error] getArtPerformance:", err)
    next(err)
  }
}

export const getCustomerAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const startDate = parseDateQuery(req.query.startDate, thirtyDaysAgo)
    const endDate = parseDateQuery(req.query.endDate, new Date())
    endDate.setHours(23, 59, 59, 999)

    if (startDate > endDate) {
      res.status(400).send({
        success: false,
        message: "Start date cannot be after end date.",
      })
      return
    }

    const result = await orderServices.getCustomerAnalytics(startDate, endDate)
    res.send(result)
  } catch (err) {
    console.error("[Controller Error] getCustomerAnalytics:", err)
    next(err)
  }
}

export const getCycleTimeAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const startDate = parseDateQuery(req.query.startDate, thirtyDaysAgo)
    const endDate = parseDateQuery(req.query.endDate, new Date())
    endDate.setHours(23, 59, 59, 999)

    if (startDate > endDate) {
      res.status(400).send({
        success: false,
        message: "Start date cannot be after end date.",
      })
      return
    }

    const result = await orderServices.getCycleTimeAnalytics(startDate, endDate)
    res.send(result)
  } catch (err) {
    console.error("[Controller Error] getCycleTimeAnalytics:", err)
    next(err)
  }
}

// PaymentMethod

export const createPaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions.paymentMethods.createPaymentMethod) {
      res.status(403).send({
        success: false,
        message: "No tienes autorización para crear métodos de pago.",
      })
      return
    }

    const methodData = req.body as PaymentMethod
    if (!methodData || !methodData.name) {
      res.status(400).send({
        success: false,
        message: "Datos de método de pago incompletos (se requiere nombre).",
      })
      return
    }

    const result = await orderServices.createPaymentMethod(methodData)
    res.send(result)
  } catch (err) {
    console.error("Error in createPaymentMethod controller:", err)
    next(err)
  }
}

export const readPaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.paymentMethods.readAllPaymentMethod) {
      res.status(403).send({
        success: false,
        message: "No tienes autorización para leer métodos de pago.",
      })
      return
    }

    const resultPaymentMethod = await orderServices.readPaymentMethodById(
      req.params.id
    )
    res.send(resultPaymentMethod)
  } catch (err) {
    next(err)
  }
}

export const readAllPaymentMethods = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.paymentMethods.readAllPaymentMethod) {
      res
        .status(403)
        .send({
          success: false,
          message: "No tienes autorización para leer métodos de pago.",
        })
      return
    }

    const resultPaymentMethods = await orderServices.readAllPaymentMethods()
    res.send(resultPaymentMethods)
  } catch (err) {
    next(err)
  }
}

export const readAllActivePaymentMethods = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const active = true
    const resultPaymentMethods =
      await orderServices.readAllActivePaymentMethods(active)
    res.send(resultPaymentMethods)
  } catch (err) {
    next(err)
  }
}

export const updatePaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.paymentMethods.updatePaymentMethod) {
      res.status(403).send({
        success: false,
        message: "No tienes autorización para actualizar métodos de pago.",
      })
      return
    }

    const methodId = req.params.id
    const updateData = req.body as Partial<PaymentMethod>

    if (!methodId) {
      res
        .status(400)
        .send({ success: false, message: "ID de método de pago requerido." })
      return
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      res.status(400).send({
        success: false,
        message: "No se proporcionaron datos para actualizar.",
      })
      return
    }

    const result = await orderServices.updatePaymentMethod(methodId, updateData)
    res.send(result)
  } catch (err) {
    console.error("Error in updatePaymentMethod controller:", err)
    next(err)
  }
}

export const deletePaymentMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.paymentMethods.deletePaymentMethod) {
      res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
      return
    }

    const methodId = req.params.id
    if (!methodId) {
      res
        .status(400)
        .send({ success: false, message: "ID de método de pago requerido." })
      return
    }

    const result = await orderServices.deletePaymentMethod(methodId)
    res.send(result)
  } catch (err) {
    console.error("Error in deletePaymentMethod controller:", err)
    next(err)
  }
}

// Shipping method
export const createShippingMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.shippingMethod.createShippingMethod) {
      res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
      return
    }

    const methodData = req.body as ShippingMethod
    if (!methodData || !methodData.name) {
      res.status(400).send({
        success: false,
        message: "Datos de método de envío incompletos (se requiere nombre).",
      })
      return
    }

    const result = await orderServices.createShippingMethod(methodData)
    res.send(result)
  } catch (err) {
    console.error("Error in createShippingMethod controller:", err)
    next(err)
  }
}

export const readAllShippingMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.shippingMethod.readAllShippingMethod) {
      res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
      return
    }

    const resultShippingMethods = await orderServices.readAllShippingMethod()
    res.send(resultShippingMethods)
  } catch (err) {
    next(err)
  }
}

export const readAllActiveShippingMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resultShippingMethods =
      await orderServices.readAllActiveShippingMethod()
    res.send(resultShippingMethods)
  } catch (err) {
    next(err)
  }
}

export const readShippingMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.shippingMethod.readAllShippingMethod) {
      res.send({
        success: false,
        message: "No tienes autorización para realizar esta acción.",
      })
      return
    }

    const resultShippingMethod = await orderServices.readShippingMethodById(
      req.params.id
    )
    res.send(resultShippingMethod)
  } catch (err) {
    next(err)
  }
}

export const updateShippingMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.shippingMethod.updateShippingMethod) {
      res.status(403).send({
        success: false,
        message: "No tienes autorización para actualizar métodos de envío.",
      })
      return
    }

    const methodId = req.params.id
    const updateData = req.body as Partial<ShippingMethod>

    if (!methodId) {
      res
        .status(400)
        .send({ success: false, message: "ID de método de envío requerido." })
      return
    }
    if (!updateData || Object.keys(updateData).length === 0) {
      res.status(400).send({
        success: false,
        message: "No se proporcionaron datos para actualizar.",
      })
      return
    }

    const result = await orderServices.updateShippingMethod(
      methodId,
      updateData
    )
    res.send(result)
  } catch (err) {
    console.error("Error in updateShippingMethod controller:", err)
    next(err)
  }
}

export const deleteShippingMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.permissions?.shippingMethod.deleteShippingMethod) {
      res.status(403).send({
        success: false,
        message: "No tienes autorización para eliminar métodos de envío.",
      })
      return
    }

    const methodId = req.params.id
    if (!methodId) {
      res
        .status(400)
        .send({ success: false, message: "ID de método de envío requerido." })
      return
    }

    const result = await orderServices.deleteShippingMethod(methodId)
    res.send(result)
  } catch (err) {
    console.error("Error in deleteShippingMethod controller:", err)
    next(err)
  }
}
