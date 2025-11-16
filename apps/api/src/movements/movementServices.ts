import { Collection, Filter, ObjectId, ClientSession } from "mongodb"
import { PrixResponse } from "../types/responseModel.ts"
import { Movement } from "./movementModel.ts"
import { Account } from "../account/accountModel.ts"
import { getDb, getMongoClient } from "../mongo.ts"

function movementCollection(): Collection<Movement> {
  return getDb().collection<Movement>("movements")
}

function accountCollection(): Collection<Account> {
  return getDb().collection<Account>("account")
}

export const createMovement = async (
  movement: Movement
): Promise<PrixResponse> => {
  try {
    const movements = movementCollection()
    const { acknowledged, insertedId } = await movements.insertOne(movement)
    if (acknowledged) {
      return {
        success: true,
        message: "Movimiento creado con éxito.",
        result: movement,
      }
    }
    return { success: false, message: "No se pudo crear el movimiento." }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, message: `An error occurred: ${msg}` }
  }
}

export const updateBalance = async (
  movement: Movement
): Promise<PrixResponse> => {
  try {
    if (!movement.destinatary) {
      return { success: false, message: "Destinatario no definido." }
    }
    const accounts = accountCollection()

    const acct = await accounts.findOne({
      _id: movement.destinatary,
    })
    if (!acct) {
      return { success: false, message: "Cuenta no encontrada." }
    }

    let newBalance = acct.balance

    if (movement.type === "Depósito") {
      newBalance += movement.value
    } else if (movement.type === "Retiro") {
      newBalance -= movement.value
    } else {
      return {
        success: true,
        message: "Tipo de movimiento no modifica balance.",
        result: acct,
      }
    }

    await accounts.updateOne(
      { _id: movement.destinatary },
      { $set: { balance: newBalance } }
    )
    const updated = await accounts.findOne({
      _id: movement.destinatary,
    })
    return {
      success: true,
      message: "Balance actualizado con éxito.",
      result: updated!,
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, message: `An error occurred: ${msg}` }
  }
}

export const createMovementWithBalanceUpdate = async (
  movementData: Movement
): Promise<PrixResponse> => {
  movementData.value = Math.abs(movementData.value);

  if (movementData.value === 0) {
    return {
      success: false,
      message: "El valor del movimiento no puede ser cero.",
    };
  }

  const client = getMongoClient()
  const session = client.startSession()

  try {
    session.startTransaction()

    const movements = movementCollection()
    const accounts = accountCollection()

    await movements.insertOne(movementData, { session })

    if (!movementData.destinatary) {
      throw new Error("Destinatario no definido en el movimiento.")
    }

    const accountToUpdate = await accounts.findOne(
      { _id: movementData.destinatary },
      { session }
    )

    if (!accountToUpdate) {
      throw new Error("La cuenta del destinatario no fue encontrada.")
    }

    let newBalance = accountToUpdate.balance
    if (movementData.type === "Depósito") {
      newBalance += movementData.value
    } else if (movementData.type === "Retiro") {
      newBalance -= movementData.value
    }

    await accounts.updateOne(
      { _id: movementData.destinatary },
      { $set: { balance: newBalance } },
      { session }
    )

    await session.commitTransaction()

    return {
      success: true,
      message: "Movimiento creado y balance actualizado con éxito.",
      result: movementData,
    }
  } catch (e: unknown) {
    if (session.inTransaction()) {
      await session.abortTransaction()
    }

    console.error("Error en la transacción de crear movimiento:", e)
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, message: `Error en la transacción: ${msg}` }
  } finally {
    await session.endSession()
  }
}

export const readByAccount = async (
  accountId: string
): Promise<PrixResponse> => {
  try {
    const movements = movementCollection()
    const list = await movements.find({ destinatary: accountId }).toArray()
    return {
      success: true,
      message: list.length
        ? "Movimientos encontrados."
        : "No hay movimientos registrados.",
      result: list,
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, message: `An error occurred: ${msg}` }
  }
}

export interface MovementQueryOptions {
  page: number
  limit: number
  sortBy: string
  sortOrder: 1 | -1
  filterType?: "Depósito" | "Retiro"
  searchDesc?: string
  destinatary?: string | undefined
}

interface PaginatedMovementResponse extends Omit<PrixResponse, "result"> {
  result: {
    data: Movement[]
    totalCount: number
  } | null
}

export const readAllMovements = async (
  options: MovementQueryOptions
): Promise<PaginatedMovementResponse> => {
  try {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      filterType,
      searchDesc,
      destinatary,
    } = options
    const movements = movementCollection()
    const skip = (page - 1) * limit

    const filterQuery: Filter<Movement> = {}
    if (filterType) {
      filterQuery.type = filterType
    }
    if (searchDesc) {
      filterQuery.description = { $regex: searchDesc, $options: "i" }
    }

    if (destinatary) {
      filterQuery.destinatary = destinatary
    }
    const totalCount = await movements.countDocuments(filterQuery)

    const list = await movements
      .find(filterQuery)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .toArray()

    return {
      success: true,
      message: list.length
        ? "Movimientos recuperados."
        : "No se encontraron movimientos para esta página/filtros.",
      result: {
        data: list,
        totalCount: totalCount,
      },
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("Error in readAllMovements service:", e)
    return {
      success: false,
      message: `Ocurrió un error al leer movimientos: ${msg}`,
      result: null,
    }
  }
}

export const readById = async (id: string): Promise<PrixResponse> => {
  try {
    const movements = movementCollection()
    const mov = await movements.findOne({
      _id: id,
    })
    if (mov) {
      return {
        success: true,
        message: "Movimiento encontrado.",
        result: mov,
      }
    }
    return { success: false, message: "Movimiento no encontrado." }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return { success: false, message: `An error occurred: ${msg}` }
  }
}

export const reverseMovement = async (id: string): Promise<PrixResponse> => {
  const client = getMongoClient();
  const session = client.startSession();

  try {
    session.startTransaction();

    const movements = movementCollection();
    const accounts = accountCollection();
    const objectId = new ObjectId(id);

    const movementToReverse = await movements.findOne({ _id: objectId }, { session });

    if (!movementToReverse) {
      return { success: false, message: "Movimiento no encontrado." };
    }

    if (!movementToReverse.destinatary) {
      throw new Error("El movimiento a revertir no tiene un destinatario definido.");
    }

    const accountToUpdate = await accounts.findOne(
      { _id: movementToReverse.destinatary },
      { session }
    );

    if (!accountToUpdate) {
      throw new Error("La cuenta del destinatario para la reversión no fue encontrada.");
    }

    let newBalance = accountToUpdate.balance;
    if (movementToReverse.type === "Depósito") {
      newBalance -= movementToReverse.value;
    } else if (movementToReverse.type === "Retiro") {
      newBalance += movementToReverse.value;
    }

    await accounts.updateOne(
      { _id: movementToReverse.destinatary },
      { $set: { balance: newBalance } },
      { session }
    );
    
    const deleteResult = await movements.deleteOne({ _id: objectId }, { session });

    if (deleteResult.deletedCount === 0) {
      throw new Error("El movimiento no pudo ser eliminado durante la transacción.");
    }

    await session.commitTransaction();

    return {
      success: true,
      message: "Movimiento revertido y eliminado con éxito.",
      result: movementToReverse,
    };

  } catch (e: unknown) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    
    console.error("Error en la transacción de revertir movimiento:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error en la transacción: ${msg}` };

  } finally {
    await session.endSession();
  }
};
