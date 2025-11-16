import { Collection, ObjectId } from "mongodb"
import { PrixResponse } from "../types/responseModel.ts"
import { Account } from "./accountModel.ts"
import { User } from "../user/userModel.ts"
import { getDb, getMongoClient } from "../mongo.ts"

function usersCollection(): Collection<User> {
  return getDb().collection<User>("users")
}

function accountCollection(): Collection<Account> {
  return getDb().collection<Account>("account")
}

export const createAndAssignAccount = async (
  email: string,
  accountData: Account
): Promise<PrixResponse> => {
  if (!email) {
    return { success: false, message: "El email del usuario es requerido." };
  }

  const client = getMongoClient();
  const session = client.startSession();

  let response: PrixResponse = { 
    success: false, 
    message: "La operación no se completó." 
  };

  try {
    session.startTransaction();

    const accounts = accountCollection();
    const users = usersCollection();

    await accounts.insertOne(accountData, { session });

    const addAccountResult = await users.updateOne(
      { email: email },
      { $set: { account: accountData._id } },
      { session }
    );

    if (addAccountResult.matchedCount === 0) {
      throw new Error(`No se encontró ningún usuario con el email: ${email}`);
    }

    await session.commitTransaction();

    response = {
      success: true,
      message: "Wallet creada y asignada al usuario exitosamente.",
      result: { ...accountData },
    };

  } catch (e: unknown) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    const msg = e instanceof Error ? e.message : String(e);
    response = { success: false, message: `Error en la transacción: ${msg}` };
    
  } finally {
    await session.endSession();
  }

  return response;
};

export const createAccount = async (
  account: Account
): Promise<PrixResponse> => {
  try {
    const accounts = accountCollection()
    const result = await accounts.insertOne(account)

    if (result.acknowledged && result.insertedId) {
      return {
        success: true,
        message: "Wallet creada satisfactoriamente.",
        result: { ...account, _id: result.insertedId },
      }
    } else {
      return {
        success: false,
        message: "Creación de wallet fallida.",
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    }
  }
}

export const addAccount = async (email: string, id: string) => {
  try {
    const users = usersCollection()

    const userToUpdate = await users.findOneAndUpdate(
      { email: email },
      { $set: { account: id } }
    );
    return userToUpdate
  } catch (e) {
    console.log(e)
    return e
  }
}

export const checkBalance = async (id: string): Promise<PrixResponse> => {
  try {
    const accounts = accountCollection()
    const account = await accounts.findOne({ _id: id })
    if (account) {
      return {
        success: true,
        message: "Wallet encontrada. Balance: " + account.balance,
        result: account,
      }
    } else {
      return {
        success: false,
        message: "Wallet no encontrada.",
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    }
  }
}

export const readAll = async (): Promise<PrixResponse> => {
  try {
    const accounts = accountCollection()
    const accountList = await accounts.find({}).toArray()

    if (accountList.length === 0) {
      return {
        success: true,
        message: "No accounts found.",
        result: accountList,
      }
    }
    return {
      success: true,
      message: "Accounts found.",
      result: accountList,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    }
  }
}
