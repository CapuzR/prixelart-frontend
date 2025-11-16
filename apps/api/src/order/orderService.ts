import {
  HistoryEntry,
  Order,
  OrderLine,
  OrderStatus,
  GlobalPaymentStatus,
  PaymentMethod,
  ShippingMethod,
} from './orderModel.ts';
import { Collection, FindOneAndUpdateOptions, ObjectId } from 'mongodb';
import { PrixResponse } from '../types/responseModel.ts';
import { getDb, getMongoClient } from '../mongo.ts';
import { User } from '../user/userModel.ts';
import { Account } from '../account/accountModel.ts';
import { readByUsername } from '../prixer/prixerServices.ts';
import { getVariantPrice } from '../product/productServices.ts';
import { thanksForYourPurchase } from '../utils/emailSender.ts';
import { Admin } from '../admin/adminModel.ts';
import { findOrCreateClient, readUserByUsername } from '../user/userServices/userServices.ts';
import { readOneByObjId } from '../art/artServices.ts';
import { Art } from '../art/artModel.ts';
import { Movement } from '../movements/movementModel.ts';

function orderCollection(): Collection<Order> {
  return getDb().collection<Order>('order');
}
function paymentMethodCollection(): Collection<PaymentMethod> {
  return getDb().collection<PaymentMethod>('paymentMethod');
}

function shippingMethodCollection(): Collection<ShippingMethod> {
  return getDb().collection<ShippingMethod>('shippingMethod');
}

function adminCollection(): Collection<Admin> {
  return getDb().collection<Admin>('admin');
}

function movementCollection(): Collection<Movement> {
  return getDb().collection<Movement>('movements');
}

function accountCollection(): Collection<Account> {
  return getDb().collection<Account>('account');
}

export const createOrder = async (
  order: Order,
  isPrixer?: boolean,
  prixerUsername?: string
): Promise<PrixResponse> => {
  try {
    for (const line of order.lines) {
      if (!line.item.art) {
        return {
          success: false,
          message: `El artículo "${line.item.product.name}" no tiene un arte asociado. Todos los artículos deben tener un arte para crear el pedido.`,
        };
      }
    }

    let prixerUser: User | null = null;
    if (isPrixer) {
      if (!prixerUsername) {
        return {
          success: false,
          message: 'Se requiere un nombre de usuario Prixer.',
        };
      }
      const prixerResp = await readByUsername(prixerUsername);
      if (!prixerResp.success || !prixerResp.result) {
        return { success: false, message: 'Usuario Prixer no encontrado.' };
      }
      prixerUser = prixerResp.result as User;
    }
    const clientResponse = await findOrCreateClient(order);
    const client = clientResponse.result as User;
    const clientId = client._id;

    const validatedLines: OrderLine[] = await Promise.all(
      order.lines.map(async (line) => {
        const productId = line.item.product._id!.toString();

        const sel = line.item.product.selection ?? [];
        const variant = line.item.product.variants?.find(
          (v) =>
            v.attributes.length === sel.length &&
            v.attributes.every((attr) =>
              sel.some((s) => s.name === attr.name && s.value === attr.value)
            )
        );
        if (!variant || !variant._id) {
          throw new Error(
            `No pude resolver variante para el producto ${productId} usando la selección ${JSON.stringify(sel)}`
          );
        }
        const variantId = variant._id;

        const artId =
          line.item.art && '_id' in line.item.art ? line.item.art._id?.toString() : undefined;

        const priceResp = await getVariantPrice(variantId, productId, artId, prixerUser, isPrixer);
        if (!priceResp.success || !Array.isArray(priceResp.result)) {
          throw new Error(
            `Error al obtener precio para ${productId}/${variantId}: ${priceResp.message}`
          );
        }
        line.discount = 0; // or your 10% logic
        line.status = [[OrderStatus.Pending, new Date()]];

        return line;
      })
    );

    const totalUnits = validatedLines.reduce((sum, l) => sum + l.quantity, 0);
    const orders = orderCollection();
    const { acknowledged, insertedId } = await orders.insertOne({
      ...order,
      consumerDetails: {
        ...order.consumerDetails,
        basic: {
          ...order.consumerDetails?.basic,
          id: clientId && clientId?.toString(),
        },
      },
      lines: validatedLines,
      totalUnits,
      history: [
        {
          timestamp: order.createdOn,
          user: order.seller || order.createdBy,
          description: 'Pedido creado.',
        },
      ],
      createdOn: new Date(),
    });

    let orderEmail;
    if (!acknowledged) {
      return { success: false, message: 'No se pudo crear la orden.' };
    } else {
      orderEmail = await sendEmail({ ...order, _id: insertedId });
    }

    return {
      success: true,
      message: 'Orden creada con éxito.',
      result: { ...order, _id: insertedId },
      email: orderEmail,
    };
  } catch (e: any) {
    console.error('createOrder error:', e);
    return {
      success: false,
      message: `Error al crear la orden: ${e.message || e}`,
    };
  }
};

export const sendEmail = async (orderData: Order): Promise<PrixResponse> => {
  try {
    const res = await thanksForYourPurchase(orderData);
    const response = { ...res, message: 'Correo enviado exitosamente.' };
    return response;
  } catch (e) {
    return { success: false, message: 'Error enviando correo.' };
  }
};

export const readOrderById = async (id: string): Promise<PrixResponse> => {
  try {
    const orders = orderCollection();
    const order = await orders.findOne({ _id: new ObjectId(id) });
    return order
      ? { success: true, message: 'Orden encontrada.', result: order }
      : { success: false, message: 'Orden no encontrada.' };
  } catch (e) {
    return { success: false, message: `Error: ${e}` };
  }
};

export const readAllOrders = async (): Promise<PrixResponse> => {
  try {
    const order = orderCollection();
    const fiveMonthsAgo = new Date();
    fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
    const orders = await order
      .find({
        'status.name': { $ne: 'Anulado' },
        createdOn: { $gte: fiveMonthsAgo },
      })
      .sort({ createdOn: -1 })
      .toArray();
    return orders.length
      ? {
          success: true,
          message: 'Todas las órdenes disponibles.',
          result: orders,
        }
      : { success: false, message: 'No hay órdenes registradas.' };
  } catch (e) {
    return { success: false, message: `Error: ${e}` };
  }
};

export const readOrdersByEmail = async (data: {
  prixerId: string;
  email: string;
}): Promise<PrixResponse> => {
  try {
    const order = orderCollection();
    const orders = await order.find({ 'consumerDetails.basic.email': data.email }).toArray();
    return orders.length
      ? { success: true, message: 'Órdenes encontradas', result: orders }
      : { success: false, message: 'No hay órdenes registradas.' };
  } catch (e) {
    return { success: false, message: `Error: ${e}` };
  }
};

export const addVoucher = async (id: string, voucherUrl: string): Promise<PrixResponse> => {
  try {
    const order = orderCollection();
    const updatedOrder = await order.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { 'payment.method.voucher': voucherUrl } },
      { returnDocument: 'after' }
    );
    return updatedOrder
      ? {
          success: true,
          message: 'Comprobante agregado.',
          result: updatedOrder,
        }
      : { success: false, message: 'Orden no encontrada.' };
  } catch (e) {
    return { success: false, message: `Error: ${e}` };
  }
};

export const updateOrderAndProcessCommissions = async (
  id: string,
  update: Partial<Order> & { changeDescriptions?: string[] },
  adminUsername: string
): Promise<PrixResponse> => {
  const client = getMongoClient();
  const session = client.startSession();

  let response: PrixResponse = {
    success: false,
    message: 'La operación no se completó.',
  };

  try {
    session.startTransaction();

    const orders = orderCollection();
    const movements = movementCollection();
    const accounts = accountCollection();
    const orderObjectId = new ObjectId(id);

    const originalOrder = await orders.findOne({ _id: orderObjectId }, { session });
    if (!originalOrder) {
      throw new Error('Orden no encontrada.');
    }
    const finalUpdatePayload: {
      $set: Partial<Order>;
      $push?: { history: { $each: HistoryEntry[] } };
    } = {
      $set: {},
    };
    const historyEntriesToAdd: HistoryEntry[] = [];

    if (update.changeDescriptions && Array.isArray(update.changeDescriptions)) {
      for (const desc of update.changeDescriptions) {
        historyEntriesToAdd.push({
          timestamp: new Date(),
          user: adminUsername,
          description: desc,
        });
      }
    }
    delete update.changeDescriptions;

    Object.assign(finalUpdatePayload.$set, update);

    const futureOrderState = { ...originalOrder, ...finalUpdatePayload.$set };
    const currentGlobalStatus = futureOrderState.status?.slice(-1)[0]?.[0];
    const targetStatuses = [OrderStatus.ReadyToShip, OrderStatus.Delivered, OrderStatus.Finished];
    const orderIsInTargetState =
      currentGlobalStatus && targetStatuses.includes(currentGlobalStatus);
    const someLinesNeedUpdating = futureOrderState.lines.some(
      (line) => line.status?.slice(-1)[0]?.[0] !== OrderStatus.Finished
    );

    if (orderIsInTargetState && someLinesNeedUpdating) {
      console.log(
        `Estado global de la orden es ${OrderStatus[currentGlobalStatus]}. Actualizando estado de todas las líneas a 'Completado'...`
      );

      const updatedLines = futureOrderState.lines.map((line) => ({
        ...line,
        status: [...(line.status || []), [OrderStatus.Finished, new Date()] as [OrderStatus, Date]],
      }));

      finalUpdatePayload.$set.lines = updatedLines;
      historyEntriesToAdd.push({
        timestamp: new Date(),
        user: adminUsername,
        description: `Todas las líneas de productos se marcaron como 'Concretado' automáticamente.`,
      });
    }

    const shouldProcessCommissions =
      futureOrderState.status?.slice(-1)[0]?.[0] === OrderStatus.Finished &&
      futureOrderState.payment?.status?.slice(-1)[0]?.[0] === GlobalPaymentStatus.Paid &&
      !futureOrderState?.commissionsProcessed;

    if (shouldProcessCommissions) {
      for (const line of futureOrderState.lines) {
        if (
          !line.item?.art ||
          !('artId' in line.item.art) ||
          !line.item.art._id ||
          !line.item.product
        ) {
          // console.warn(
          //   `Skipping commission for line in order ${futureOrderState.number || futureOrderState._id} due to missing art _id, product data, or being a CustomImage.`
          // );
          continue;
        }

        const pickedArt = line.item.art;
        const artResult = await readOneByObjId(pickedArt._id!.toString());
        let fullArt: Art;
        if (artResult.success && artResult.result) {
          fullArt = artResult.result as Art;
        } else {
          // console.warn(
          //   `Art with ID ${pickedArt._id} not found in DB. Skipping commission for this line.`
          // );
          continue;
        }

        let commissionRate: number;
        const artSpecificCommission = fullArt.comission;

        if (artSpecificCommission !== undefined && artSpecificCommission !== null) {
          const parsedArtCommission = parseFloat(String(artSpecificCommission));
          if (!isNaN(parsedArtCommission) && parsedArtCommission > 0) {
            commissionRate = parsedArtCommission / 100;
            // console.log(
            //   `Using specific commission rate ${parsedArtCommission}% for art '${line.item.art.title}' by ${line.item.art.prixerUsername}.`
            // );
          } else {
            commissionRate = 0.1;
            // console.warn(
            //   `Invalid art commission ('${artSpecificCommission}') for art '${line.item.art.title}'. Defaulting to 10%.`
            // );
          }
        } else {
          commissionRate = 0.1;
          // console.log(
          //   `No specific commission for art '${line.item.art.title}'. Using default 10% for ${line.item.art.prixerUsername}.`
          // );
        }

        let lineSubtotal = 0;
        const pricePerUnit = parseFloat(String(line.pricePerUnit));
        const quantity = line.quantity;

        if (!isNaN(pricePerUnit) && !isNaN(quantity) && pricePerUnit > 0 && quantity > 0) {
          lineSubtotal = pricePerUnit * quantity;
        } else {
          // console.warn(
          //   `Cannot calculate subtotal for line (Art: '${line.item.art.title}'). Invalid pricePerUnit ('${line.pricePerUnit}') or quantity ('${line.quantity}'). Skipping.`
          // );
          continue;
        }

        const paymentAmount = lineSubtotal * commissionRate;

        if (paymentAmount > 0 && line.item.art.prixerUsername) {
          const prixerResult = await readUserByUsername(line.item.art.prixerUsername);
          const prixerUser = prixerResult.result as User;

          if (paymentAmount > 0 && prixerUser?.account) {
            const commissionMovement: Movement = {
              date: new Date(),
              createdOn: new Date(),
              destinatary: prixerUser.account,
              description: `Comisión por orden ${futureOrderState._id || futureOrderState.number} - Arte: ${line.item.art.artId}`,
              type: 'Depósito',
              value: parseFloat(paymentAmount.toFixed(2)),
              order: futureOrderState._id.toString(),
              createdBy: adminUsername,
            };

            await movements.insertOne(commissionMovement, { session });

            await accounts.updateOne(
              { _id: prixerUser.account },
              { $inc: { balance: commissionMovement.value } },
              { session }
            );
            console.log(`Comisión para ${prixerUser.username} encolada en la transacción.`);
          }
        }

        finalUpdatePayload.$set.commissionsProcessed = true;
        historyEntriesToAdd.push({
          timestamp: new Date(),
          user: adminUsername,
          description: 'Las comisiones de la orden han sido procesadas y liquidadas.',
        });
        console.log(`Orden ${futureOrderState._id} marcada como procesada.`);
      }
    }
    if (Object.keys(finalUpdatePayload.$set).length > 0 || historyEntriesToAdd.length > 0) {
      if (historyEntriesToAdd.length > 0) {
        finalUpdatePayload.$push = { history: { $each: historyEntriesToAdd } };
      }

      await orders.updateOne({ _id: orderObjectId }, finalUpdatePayload, { session });
      console.log('Todos los cambios de la orden se han aplicado en una sola operación.');
    } else {
      console.log('No se detectaron cambios para aplicar en la orden.');
    }

    await session.commitTransaction();
    const finalOrderState = { ...originalOrder, ...finalUpdatePayload.$set };

    response = {
      success: true,
      message: 'Orden actualizada exitosamente.',
      result: finalOrderState,
    };
    console.log('¡Transacción confirmada! Orden actualizada.');
  } catch (e: unknown) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error('Error en la transacción de actualizar orden:', e);
    const msg = e instanceof Error ? e.message : String(e);
    response = { success: false, message: `Error en la transacción: ${msg}` };
  } finally {
    await session.endSession();
  }
  return response;
};

export const deleteOrder = async (orderId: string): Promise<PrixResponse> => {
  try {
    const order = orderCollection();
    const ID = new ObjectId(orderId);
    const { deletedCount } = await order.deleteOne({ _id: ID });
    return deletedCount
      ? { success: true, message: 'Orden eliminada exitosamente' }
      : { success: false, message: 'Orden no encontrada' };
  } catch (e) {
    return { success: false, message: `Error: ${e}` };
  }
};

export interface TopPerformingItemData {
  id: string; // Product or Art ID
  name: string;
  quantity: number;
  revenue: number;
  imageUrl?: string;
}

export interface GlobalDashboardStatsData {
  // Renamed from SellerDashboardStatsData for clarity
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  unitsSold: number;
  orderStatusCounts: Record<string, number>;
  prevPeriodTotalSales: number;
  prevPeriodTotalOrders: number;
  totalOrdersAmount: number;
  totalPaidAmount: number;
  totalPendingAmount: number;
  totalFinalizedAmount: number;
}

export const readAllOrdersByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<PrixResponse> => {
  try {
    const collection = orderCollection();

    const orders = await collection
      .find({
        createdOn: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ createdOn: -1 })
      .toArray();

    return {
      success: true,
      message: 'All orders retrieved successfully.',
      result: orders as unknown as Order[],
    };
  } catch (e) {
    console.error('Error in readAllOrdersByDateRange:', e);
    return {
      success: false,
      message: `Error fetching all orders: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
};

/**
 * Reads orders for a specific seller within a given date range.
 */
export const calculateGlobalDashboardStats = async (
  startDate: Date,
  endDate: Date
): Promise<PrixResponse> => {
  try {
    const collection = orderCollection();

    const matchQuery = {
      createdOn: { $gte: startDate, $lte: endDate },
    };

    const statsPipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          totalUnits: { $sum: '$totalUnits' },
          totalOrdersAmount: { $sum: '$total' },
          totalPaidAmount: {
            $sum: {
              $cond: {
                if: {
                  $eq: [
                    { $toString: { $arrayElemAt: [{ $arrayElemAt: ['$payment.status', -1] }, 0] } },
                    String(GlobalPaymentStatus.Paid),
                  ],
                },
                then: '$total',
                else: 0,
              },
            },
          },
          totalPendingAmount: {
            $sum: {
              $cond: {
                if: {
                  $in: [
                    { $toString: { $arrayElemAt: [{ $arrayElemAt: ['$payment.status', -1] }, 0] } },
                    [String(GlobalPaymentStatus.Pending), String(GlobalPaymentStatus.Credited)],
                  ],
                },
                then: '$total',
                else: 0,
              },
            },
          },
          totalFinalizedAmount: {
            $sum: {
              $cond: {
                if: {
                  $and: [
                    {
                      $eq: [
                        { $toString: { $arrayElemAt: [{ $arrayElemAt: ['$status', -1] }, 0] } },
                        String(OrderStatus.Finished),
                      ],
                    },
                    {
                      $eq: [
                        {
                          $toString: {
                            $arrayElemAt: [{ $arrayElemAt: ['$payment.status', -1] }, 0],
                          },
                        },
                        String(GlobalPaymentStatus.Paid),
                      ],
                    },
                  ],
                },
                then: '$total',
                else: 0,
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalSales: { $ifNull: ['$totalSales', 0] },
          totalOrders: { $ifNull: ['$totalOrders', 0] },
          totalUnits: { $ifNull: ['$totalUnits', 0] },
          averageOrderValue: {
            $cond: {
              if: { $gt: ['$totalOrders', 0] },
              then: { $divide: ['$totalSales', '$totalOrders'] },
              else: 0,
            },
          },
          totalOrdersAmount: { $ifNull: ['$totalOrdersAmount', 0] },
          totalPaidAmount: { $ifNull: ['$totalPaidAmount', 0] },
          totalPendingAmount: { $ifNull: ['$totalPendingAmount', 0] },
          totalFinalizedAmount: { $ifNull: ['$totalFinalizedAmount', 0] },
        },
      },
    ];
    const statsResult = await collection.aggregate(statsPipeline).toArray();
    const mainStats = statsResult[0] || {
      totalSales: 0,
      totalOrders: 0,
      totalUnits: 0,
      averageOrderValue: 0,
      totalOrdersAmount: 0,
      totalPaidAmount: 0,
      totalPendingAmount: 0,
      totalFinalizedAmount: 0,
    };

    // --- Previous Period Calculation ---
    const diff = endDate.getTime() - startDate.getTime();
    const prevStartDate = new Date(startDate.getTime() - diff);
    const prevEndDate = new Date(startDate.getTime() - 1);

    const prevMatchQuery = {
      createdOn: { $gte: prevStartDate, $lte: prevEndDate },
    };

    const prevStatsPipeline = [
      { $match: prevMatchQuery },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          totalSales: { $ifNull: ['$totalSales', 0] },
          totalOrders: { $ifNull: ['$totalOrders', 0] },
        },
      },
    ];

    const prevStatsResult = await collection.aggregate(prevStatsPipeline).toArray();
    const prevStats = prevStatsResult[0] || { totalSales: 0, totalOrders: 0 };

    const ordersForStatusCount = (await collection
      .find(matchQuery)
      .project({ lines: 1 })
      .toArray()) as unknown as Pick<Order, 'lines'>[];
    const orderStatusCounts: Record<string, number> = {};

    Object.values(OrderStatus)
      .filter((value) => typeof value === 'string')
      .forEach((statusName) => {
        orderStatusCounts[statusName as string] = 0;
      });

    ordersForStatusCount.forEach((order) => {
      (order.lines || []).forEach((line) => {
        if (line.status && line.status.length > 0) {
          const latestStatusTuple = line.status[line.status.length - 1];
          const statusEnum = latestStatusTuple[0];
          const statusName = OrderStatus[statusEnum as OrderStatus];
          if (statusName) {
            orderStatusCounts[statusName] = (orderStatusCounts[statusName] || 0) + 1;
          }
        }
      });
    });

    const dashboardData: GlobalDashboardStatsData = {
      totalSales: mainStats.totalSales,
      totalOrders: mainStats.totalOrders,
      averageOrderValue: mainStats.averageOrderValue,
      unitsSold: mainStats.totalUnits,
      orderStatusCounts,
      prevPeriodTotalSales: prevStats.totalSales,
      prevPeriodTotalOrders: prevStats.totalOrders,
      totalOrdersAmount: mainStats.totalOrdersAmount,
      totalPaidAmount: mainStats.totalPaidAmount,
      totalPendingAmount: mainStats.totalPendingAmount,
      totalFinalizedAmount: mainStats.totalFinalizedAmount,
    };

    return {
      success: true,
      message: 'Global dashboard stats calculated.',
      result: dashboardData,
    };
  } catch (e) {
    console.error('Error in calculateGlobalDashboardStats:', e);
    return {
      success: false,
      message: `Error calculating global stats: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
};

/**
 * Gets GLOBAL top performing items within a given date range.
 */
export const getGlobalTopPerformingItems = async (
  startDate: Date,
  endDate: Date,
  limit: number = 5
): Promise<PrixResponse> => {
  try {
    const collection = orderCollection();
    const pipeline = [
      {
        $match: {
          createdOn: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      { $unwind: '$lines' },
      { $match: { 'lines.item.product._id': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$lines.item.product._id',
          name: { $first: '$lines.item.product.name' },
          imageUrl: { $first: '$lines.item.product.mockUp' },
          quantity: { $sum: '$lines.quantity' },
          revenue: { $sum: '$lines.subtotal' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: { $ifNull: ['$name', 'Unknown Product'] },
          imageUrl: '$imageUrl',
          quantity: { $ifNull: ['$quantity', 0] },
          revenue: { $ifNull: ['$revenue', 0] },
        },
      },
    ];

    const topItems = await collection.aggregate(pipeline).toArray();

    return {
      success: true,
      message: 'Global top performing items retrieved.',
      result: topItems as unknown as TopPerformingItemData[],
    };
  } catch (e) {
    console.error('Error in getGlobalTopPerformingItems:', e);
    return {
      success: false,
      message: `Error fetching global top items: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
};

export interface PerformanceData {
  id: string;
  name: string;
  imageUrl?: string;
  totalSales: number;
  totalUnits: number;
  orderCount: number;
}

export const getSellerPerformance = async (
  startDate: Date,
  endDate: Date
): Promise<PrixResponse> => {
  try {
    const orders = orderCollection();
    const admins = adminCollection();

    const performancePipeline = [
      {
        $match: {
          createdOn: { $gte: startDate, $lte: endDate },
          seller: { $exists: true, $nin: [null, ''] },
        },
      },
      {
        $group: {
          _id: '$seller',
          totalSales: { $sum: '$total' },
          totalUnits: { $sum: '$totalUnits' },
          orderCount: { $sum: 1 },
        },
      },
    ];
    const performanceResults = await orders.aggregate(performancePipeline).toArray();

    const allSellers = await admins
      .find({ isSeller: true }, { projection: { _id: 1, firstname: 1, lastname: 1 } })
      .toArray();
    const sellerMap = new Map<string, string>();
    allSellers.forEach((seller) => {
      const fullName = `${seller.firstname} ${seller.lastname}`;
      sellerMap.set(fullName, seller._id.toHexString());
    });

    const finalData = performanceResults.map((item: any) => ({
      id: sellerMap.get(item._id) || item._id,
      name: item._id,
      totalSales: item.totalSales,
      totalUnits: item.totalUnits,
      orderCount: item.orderCount,
      imageUrl: undefined,
    }));

    return {
      success: true,
      message: 'Seller performance data retrieved.',
      result: finalData as PerformanceData[],
    };
  } catch (e) {
    console.error('!!! [CRITICAL_ERROR] in getSellerPerformance:', e);
    return {
      success: false,
      message: `Error fetching seller performance: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
};

export const getPrixerPerformance = async (
  startDate: Date,
  endDate: Date
): Promise<PrixResponse> => {
  try {
    const orders = orderCollection();
    const pipeline = [
      { $match: { createdOn: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$lines' },
      {
        $match: {
          'lines.item.art.prixerUsername': { $exists: true, $nin: [null, ''] },
        },
      },
      {
        $group: {
          _id: '$lines.item.art.prixerUsername',
          totalSales: { $sum: '$lines.subtotal' },
          totalUnits: { $sum: '$lines.quantity' },
          orderIds: { $addToSet: '$_id' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'username',
          as: 'prixerInfo',
        },
      },
      { $unwind: { path: '$prixerInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          id: { $ifNull: ['$prixerInfo._id', '$_id'] },
          name: '$_id',
          imageUrl: {
            $ifNull: ['$prixerInfo.prixer.avatar', '$prixerInfo.avatar'],
          },
          totalSales: { $ifNull: ['$totalSales', 0] },
          totalUnits: { $ifNull: ['$totalUnits', 0] },
          orderCount: { $size: { $ifNull: ['$orderIds', []] } },
        },
      },
    ];

    const performanceData = await orders.aggregate(pipeline).toArray();

    return {
      success: true,
      message: 'Prixer performance data retrieved.',
      result: performanceData as PerformanceData[],
    };
  } catch (e) {
    console.error('!!! [CRITICAL_ERROR] in getPrixerPerformance:', e);
    return {
      success: false,
      message: `Error fetching prixer performance: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
};

export const getProductPerformance = async (
  startDate: Date,
  endDate: Date
): Promise<PrixResponse> => {
  try {
    const orders = orderCollection();
    const pipeline = [
      { $match: { createdOn: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$lines' },
      { $match: { 'lines.item.product._id': { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$lines.item.product._id',
          name: { $first: '$lines.item.product.name' },
          totalSales: { $sum: '$lines.subtotal' },
          totalUnits: { $sum: '$lines.quantity' },
          orderIds: { $addToSet: '$_id' },
          // Add sources to the grouped data
          sources: { $first: '$lines.item.product.sources' },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'fullProductInfo',
        },
      },
      {
        $unwind: { path: '$fullProductInfo', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          sources: 1, // Pass the sources object through
          imageUrl: {
            $ifNull: [
              {
                $cond: {
                  if: { $eq: [{ $type: '$fullProductInfo.mockUp' }, 'object'] },
                  then: '$fullProductInfo.mockUp.mockupImg',
                  else: '$fullProductInfo.mockUp',
                },
              },
              '$fullProductInfo.thumbUrl',
            ],
          },
          totalSales: { $ifNull: ['$totalSales', 0] },
          totalUnits: { $ifNull: ['$totalUnits', 0] },
          orderCount: { $size: { $ifNull: ['$orderIds', []] } },
        },
      },
    ];

    const performanceData = await orders.aggregate(pipeline).toArray();

    return {
      success: true,
      message: 'Product performance data retrieved.',
      result: performanceData as PerformanceData[],
    };
  } catch (e) {
    console.error('!!! [CRITICAL_ERROR] in getProductPerformance:', e);
    return {
      success: false,
      message: `Error fetching product performance: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
};

export const getProductionLinePerformance = async (
  startDate: Date,
  endDate: Date
): Promise<PrixResponse> => {
  try {
    const orders = orderCollection();
    const pipeline = [
      { $match: { createdOn: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$lines' },
      {
        $match: {
          'lines.item.product.productionLines': {
            $exists: true,
            $ne: [],
            $not: { $size: 0 },
          },
        },
      },
      { $unwind: '$lines.item.product.productionLines' },
      {
        $group: {
          _id: '$lines.item.product.productionLines',
          totalSales: { $sum: '$lines.subtotal' },
          totalUnits: { $sum: '$lines.quantity' },
          orderIds: { $addToSet: '$_id' },
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: '$_id',
          imageUrl: undefined,
          totalSales: { $ifNull: ['$totalSales', 0] },
          totalUnits: { $ifNull: ['$totalUnits', 0] },
          orderCount: { $size: { $ifNull: ['$orderIds', []] } },
        },
      },
      { $sort: { totalSales: -1 } },
    ];

    const performanceData = await orders.aggregate(pipeline).toArray();

    return {
      success: true,
      message: 'Production line performance data retrieved.',
      result: performanceData as PerformanceData[],
    };
  } catch (e) {
    console.error('!!! [CRITICAL_ERROR] in getProductionLinePerformance:', e);
    return {
      success: false,
      message: `Error fetching production line performance: ${
        e instanceof Error ? e.message : String(e)
      }`,
    };
  }
};

export const getArtPerformance = async (startDate: Date, endDate: Date): Promise<PrixResponse> => {
  try {
    const orders = orderCollection();
    const pipeline = [
      { $match: { createdOn: { $gte: startDate, $lte: endDate } } },
      { $unwind: '$lines' },
      {
        $match: {
          'lines.item.art.artId': { $exists: true, $ne: null },
          'lines.item.art.title': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            artId: '$lines.item.art.artId',
            title: '$lines.item.art.title',
          },
          totalSales: { $sum: '$lines.subtotal' },
          totalUnits: { $sum: '$lines.quantity' },
          imageUrl: { $first: '$lines.item.art.largeThumbUrl' }, // Use large thumb for better quality
          orderIds: { $addToSet: '$_id' },
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id.artId',
          name: '$_id.title',
          imageUrl: '$imageUrl',
          totalSales: { $ifNull: ['$totalSales', 0] },
          totalUnits: { $ifNull: ['$totalUnits', 0] },
          orderCount: { $size: { $ifNull: ['$orderIds', []] } },
        },
      },
      { $sort: { totalSales: -1 } },
    ];

    const performanceData = await orders.aggregate(pipeline).toArray();

    return {
      success: true,
      message: 'Art performance data retrieved.',
      result: performanceData as PerformanceData[],
    };
  } catch (e) {
    console.error('!!! [CRITICAL_ERROR] in getArtPerformance:', e);
    return {
      success: false,
      message: `Error fetching art performance: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
};

export interface CustomerAnalyticsData {
  newCustomers: { count: number; totalSales: number };
  returningCustomers: { count: number; totalSales: number };
}

export const getCustomerAnalytics = async (
  startDate: Date,
  endDate: Date
): Promise<PrixResponse> => {
  try {
    const orders = orderCollection();
    const pipeline = [
      // Get all orders in the date range
      {
        $match: {
          createdOn: { $gte: startDate, $lte: endDate },
          'consumerDetails.basic.email': { $exists: true, $ne: null },
        },
      },
      // Sort by customer and date to easily find their first order
      { $sort: { 'consumerDetails.basic.email': 1, createdOn: 1 } },
      // Group by customer email
      {
        $group: {
          _id: '$consumerDetails.basic.email',
          firstOrderDate: { $first: '$createdOn' },
          orders: { $push: { total: '$total', createdOn: '$createdOn' } },
        },
      },
      // Determine if the customer is new *within this period*
      {
        $project: {
          isNew: { $gte: ['$firstOrderDate', startDate] },
          orders: 1,
        },
      },
    ];

    const customerGroups = await orders.aggregate(pipeline).toArray();

    const analytics: CustomerAnalyticsData = {
      newCustomers: { count: 0, totalSales: 0 },
      returningCustomers: { count: 0, totalSales: 0 },
    };

    customerGroups.forEach((group) => {
      if (group.isNew) {
        analytics.newCustomers.count += 1;
        analytics.newCustomers.totalSales += group.orders.reduce(
          (sum: number, order: any) => sum + order.total,
          0
        );
      } else {
        analytics.returningCustomers.count += 1;
        // We still need to sum up their sales within the period
        const salesInPeriod = group.orders
          .filter((order: any) => order.createdOn >= startDate && order.createdOn <= endDate)
          .reduce((sum: number, order: any) => sum + order.total, 0);

        // A returning customer might not have made a purchase in this period
        if (salesInPeriod > 0) {
          analytics.returningCustomers.count += 1;
          analytics.returningCustomers.totalSales += salesInPeriod;
        }
      }
    });

    return {
      success: true,
      message: 'Customer analytics retrieved successfully.',
      result: analytics as any,
    };
  } catch (e) {
    console.error('!!! [CRITICAL_ERROR] in getCustomerAnalytics:', e);
    return {
      success: false,
      message: `Error fetching customer analytics: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
};

export interface CycleTimeData {
  status: string;
  averageDays: number;
}

export const getCycleTimeAnalytics = async (
  startDate: Date,
  endDate: Date
): Promise<PrixResponse> => {
  try {
    const orders = orderCollection();
    const pipeline = [
      // 1. Get orders within the date range
      { $match: { createdOn: { $gte: startDate, $lte: endDate } } },
      // 2. Unwind the status array to process each status entry
      { $unwind: '$status' },
      // 3. Sort by order and then by the date of the status change
      { $sort: { _id: 1, 'status.1': 1 } },
      // 4. Group by order to create pairs of statuses
      {
        $group: {
          _id: '$_id',
          statusHistory: { $push: '$status' },
        },
      },
      // 5. Create a new stage to transform the data into time intervals
      {
        $project: {
          intervals: {
            $map: {
              input: {
                $range: [0, { $subtract: [{ $size: '$statusHistory' }, 1] }],
              },
              as: 'idx',
              in: {
                statusEnum: {
                  $arrayElemAt: [{ $arrayElemAt: ['$statusHistory', '$$idx'] }, 0],
                },
                // --- FIX IS HERE: Convert to Date before assignment ---
                startDate: {
                  $toDate: {
                    $arrayElemAt: [{ $arrayElemAt: ['$statusHistory', '$$idx'] }, 1],
                  },
                },
                endDate: {
                  $toDate: {
                    $arrayElemAt: [
                      {
                        $arrayElemAt: ['$statusHistory', { $add: ['$$idx', 1] }],
                      },
                      1,
                    ],
                  },
                },
              },
            },
          },
        },
      },
      // 6. Unwind the newly created intervals
      { $unwind: '$intervals' },
      // 7. Calculate the duration of each interval in milliseconds
      {
        $project: {
          status: '$intervals.statusEnum',
          duration: {
            $subtract: ['$intervals.endDate', '$intervals.startDate'],
          },
        },
      },
      // 8. Group by status to calculate the average duration
      {
        $group: {
          _id: '$status',
          averageDurationMs: { $avg: '$duration' },
        },
      },
      // 9. Convert milliseconds to days and format the output
      {
        $project: {
          _id: 0,
          status: '$_id',
          averageDays: { $divide: ['$averageDurationMs', 1000 * 60 * 60 * 24] },
        },
      },
    ];

    const cycleTimeResults = await orders.aggregate(pipeline).toArray();

    // Convert status enum number to string name
    const finalResults = cycleTimeResults.map((item) => ({
      ...item,
      status: OrderStatus[item.status as number] || 'Desconocido',
    }));

    return {
      success: true,
      message: 'Cycle time analytics retrieved successfully.',
      result: finalResults as any,
    };
  } catch (e) {
    console.error('!!! [CRITICAL_ERROR] in getCycleTimeAnalytics:', e);
    return {
      success: false,
      message: `Error fetching cycle time analytics: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
};

// Payment Methods

export const createPaymentMethod = async (
  paymentMethodData: PaymentMethod
): Promise<PrixResponse> => {
  try {
    const paymentMethods = paymentMethodCollection();
    const methodToInsert = {
      ...paymentMethodData,
      active: paymentMethodData.active !== undefined ? paymentMethodData.active : true,
      createdOn: new Date(),
    };

    const { acknowledged, insertedId } = await paymentMethods.insertOne(methodToInsert);

    if (acknowledged) {
      return {
        success: true,
        message: 'Método de pago creado con éxito.',
        result: { ...methodToInsert, _id: insertedId },
      };
    }
    return { success: false, message: 'No se pudo crear el método de pago.' };
  } catch (e: any) {
    console.error('Error creating payment method:', e);
    return {
      success: false,
      message: `Error al crear método de pago: ${e.message || e}`,
    };
  }
};

export const readPaymentMethodById = async (id: string): Promise<PrixResponse> => {
  try {
    const payment = paymentMethodCollection();
    const pm = await payment.findOne({ _id: new ObjectId(id) });
    return pm
      ? { success: true, message: 'Método encontrado.', result: pm }
      : { success: false, message: 'Método no encontrado.' };
  } catch (e) {
    return { success: false, message: `Error: ${e}` };
  }
};

export const readAllPaymentMethods = async (active?: boolean): Promise<PrixResponse> => {
  try {
    const payment = paymentMethodCollection();
    const list = await payment.find().toArray();
    return list.length
      ? { success: true, message: 'Métodos disponibles.', result: list }
      : { success: false, message: 'No hay métodos registrados.' };
  } catch (e) {
    return { success: false, message: `Error: ${e}` };
  }
};

export const readAllActivePaymentMethods = async (active?: boolean): Promise<PrixResponse> => {
  try {
    const payment = paymentMethodCollection();
    const filter = active ? { active: true } : {};
    const list = await payment.find(filter).toArray();
    return list.length
      ? { success: true, message: 'Métodos disponibles.', result: list }
      : { success: false, message: 'No hay métodos registrados.' };
  } catch (e) {
    return { success: false, message: `Error: ${e}` };
  }
};

export const updatePaymentMethod = async (
  id: string,
  updateData: Partial<PaymentMethod>
): Promise<PrixResponse> => {
  try {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: 'ID de método de pago inválido.' };
    }

    delete (updateData as any)._id;
    delete (updateData as any).createdOn;

    const paymentMethods = paymentMethodCollection();
    const options: FindOneAndUpdateOptions = {
      returnDocument: 'after',
    };

    const result = await paymentMethods.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      options
    );

    return result
      ? {
          success: true,
          message: 'Método de pago actualizado con éxito.',
          result: result,
        }
      : {
          success: false,
          message: 'Método de pago no encontrado para actualizar.',
        };
  } catch (e: any) {
    console.error('Error updating payment method:', e);
    if (e.code === 11000 && updateData.name) {
      return {
        success: false,
        message: `Error: Ya existe otro método de pago con el nombre '${updateData.name}'.`,
      };
    }
    return {
      success: false,
      message: `Error al actualizar el método de pago: ${e.message || e}`,
    };
  }
};

export const deletePaymentMethod = async (id: string): Promise<PrixResponse> => {
  try {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: 'ID de método de pago inválido.' };
    }
    const paymentMethods = paymentMethodCollection();
    const { deletedCount } = await paymentMethods.deleteOne({
      _id: new ObjectId(id),
    });

    return deletedCount && deletedCount > 0
      ? { success: true, message: 'Método de pago eliminado exitosamente.' }
      : {
          success: false,
          message: 'Método de pago no encontrado o ya eliminado.',
        };
  } catch (e: any) {
    console.error('Error deleting payment method:', e);
    return {
      success: false,
      message: `Error al eliminar el método de pago: ${e.message || e}`,
    };
  }
};

// Shipping Methods

export const createShippingMethod = async (
  shippingMethodData: ShippingMethod
): Promise<PrixResponse> => {
  try {
    const shippingMethods = shippingMethodCollection();
    const methodToInsert = {
      ...shippingMethodData,
      active: shippingMethodData.active !== undefined ? shippingMethodData.active : true,
      createdOn: new Date(),
    };

    const { acknowledged, insertedId } = await shippingMethods.insertOne(methodToInsert);

    if (acknowledged) {
      return {
        success: true,
        message: 'Método de envío creado con éxito.',
        result: { ...methodToInsert, _id: insertedId },
      };
    }
    return { success: false, message: 'No se pudo crear el método de envío.' };
  } catch (e: any) {
    console.error('Error creating shipping method:', e);
    return {
      success: false,
      message: `Error al crear método de envío: ${e.message || e}`,
    };
  }
};

export const readShippingMethodById = async (id: string): Promise<PrixResponse> => {
  try {
    const shipping = shippingMethodCollection();
    const sm = await shipping.findOne({ _id: new ObjectId(id) });
    return sm
      ? { success: true, message: 'Método encontrado.', result: sm }
      : { success: false, message: 'Método no encontrado.' };
  } catch (e) {
    return { success: false, message: `Error: ${e}` };
  }
};

export const readAllShippingMethod = async (active?: boolean): Promise<PrixResponse> => {
  try {
    const shipping = shippingMethodCollection();
    const list = await shipping.find().toArray();
    return list.length
      ? { success: true, message: 'Métodos disponibles.', result: list }
      : { success: false, message: 'No hay métodos registrados.' };
  } catch (e) {
    return { success: false, message: `Error: ${e}` };
  }
};

export const readAllActiveShippingMethod = async (active?: boolean): Promise<PrixResponse> => {
  try {
    const shipping = shippingMethodCollection();
    const filter = active ? { active: true } : {};
    const list = await shipping.find(filter).toArray();
    return list.length
      ? { success: true, message: 'Métodos disponibles.', result: list }
      : { success: false, message: 'No hay métodos registrados.' };
  } catch (e) {
    return { success: false, message: `Error: ${e}` };
  }
};

export const updateShippingMethod = async (
  id: string,
  updateData: Partial<ShippingMethod>
): Promise<PrixResponse> => {
  try {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: 'ID de método de envío inválido.' };
    }

    delete (updateData as any)._id;
    delete (updateData as any).createdOn;

    const shippingMethods = shippingMethodCollection();
    const options: FindOneAndUpdateOptions = {
      returnDocument: 'after',
    };

    const result = await shippingMethods.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      options
    );

    return result
      ? {
          success: true,
          message: 'Método de envío actualizado con éxito.',
          result: result,
        }
      : {
          success: false,
          message: 'Método de envío no encontrado para actualizar.',
        };
  } catch (e: any) {
    console.error('Error updating shipping method:', e);
    if (e.code === 11000 && updateData.name) {
      return {
        success: false,
        message: `Error: Ya existe otro método de envío con el nombre '${updateData.name}'.`,
      };
    }
    return {
      success: false,
      message: `Error al actualizar el método de envío: ${e.message || e}`,
    };
  }
};

export const deleteShippingMethod = async (id: string): Promise<PrixResponse> => {
  try {
    if (!ObjectId.isValid(id)) {
      return { success: false, message: 'ID de método de envío inválido.' };
    }
    const shippingMethods = shippingMethodCollection();
    const { deletedCount } = await shippingMethods.deleteOne({
      _id: new ObjectId(id),
    });

    return deletedCount && deletedCount > 0
      ? { success: true, message: 'Método de envío eliminado exitosamente.' }
      : {
          success: false,
          message: 'Método de envío no encontrado o ya eliminado.',
        };
  } catch (e: any) {
    console.error('Error deleting shipping method:', e);
    return {
      success: false,
      message: `Error al eliminar el método de envío: ${e.message || e}`,
    };
  }
};
