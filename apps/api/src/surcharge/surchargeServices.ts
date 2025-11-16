import { Collection, ObjectId } from "mongodb";
import { Surcharge } from "./surchargeModel.ts";
import { PrixResponse } from "../types/responseModel.ts";
import { getDb } from "../mongo.ts";

function surchargeCollection(): Collection<Surcharge> {
  return getDb().collection<Surcharge>("surcharges");
}

export const createSurcharge = async (surcharge: Surcharge): Promise<PrixResponse> => {
  try {
    const surcharges = surchargeCollection();
    const { acknowledged, insertedId } = await surcharges.insertOne(surcharge);
    if (acknowledged && insertedId) {
      return {
        success: true,
        message: "Recargo creado con éxito.",
        result: { ...surcharge, _id: insertedId },
      };
    }
    return { success: false, message: "No se pudo crear el recargo." };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
};

export const updateSurcharge = async (id: string, updates: Partial<Surcharge>): Promise<PrixResponse> => {
  try {
    const surcharges = surchargeCollection();
    const updatedSurcharge = await surcharges.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );
    if (!updatedSurcharge) {
      return { success: false, message: "Recargo no encontrado." };
    }
    return {
      success: true,
      message: "Recargo actualizado con éxito.",
      result: updatedSurcharge,
    };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
};

export const readAllSurcharge = async (): Promise<PrixResponse> => {
  try {
    const surcharges = surchargeCollection();
    const list = await surcharges.find({}).toArray();
    return {
      success: true,
      message: "Recargos encontrados.",
      result: list,
    };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
};

export const readActiveSurcharge = async (): Promise<PrixResponse> => {
  try {
    const surcharges = surchargeCollection();
    const list = await surcharges.find({ active: true }).toArray();
    return {
      success: true,
      message: "Recargos activos encontrados.",
      result: list,
    };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
};

export const readById = async (id: string): Promise<PrixResponse> => {
  try {
    const discounts = surchargeCollection();
    const discount = await discounts.findOne({ _id: new ObjectId(id) });
    if (discount) {
      return { success: true, message: "Surcharge found.", result: discount };
    }
    return { success: false, message: "Surcharge not found." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `An error occurred: ${message}` };
  }
};

export const deleteSurcharge = async (id: string): Promise<PrixResponse> => {
  try {
    const surcharges = surchargeCollection();
    const result = await surcharges.findOneAndDelete({ _id: new ObjectId(id) });
    if (!result) {
      return { success: false, message: "Recargo no encontrado." };
    }
    return {
      success: true,
      message: "Recargo eliminado con éxito.",
      result: result,
    };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
};