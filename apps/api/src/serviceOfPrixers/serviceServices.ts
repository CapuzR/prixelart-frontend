import { Collection, ObjectId } from "mongodb";
import * as userService from "../user/userServices/userServices.ts";
import { Service } from "./serviceModel.ts";
import { PrixResponse } from "../types/responseModel.ts";
import { getDb } from "../mongo.ts";

function serviceCollection(): Collection<Service> {
  return getDb().collection<Service>("services");
}

export const createService = async (svc: Service): Promise<PrixResponse> => {
  try {
    const services = serviceCollection();
    const { acknowledged, insertedId } = await services.insertOne(svc);
    if (acknowledged) {
      return {
        success: true,
        message: "Servicio creado con éxito.",
        result: { ...svc, _id: insertedId },
      };
    }
    return { success: false, message: "No se pudo crear el servicio." };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
};

export const getAll = async (): Promise<PrixResponse> => {
  try {
    const services = serviceCollection();
    const list = await services.find({}).toArray();
    return {
      success: true,
      message: "Servicios encontrados.",
      result: list,
    };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
};

export const getAllActive = async (): Promise<PrixResponse> => {
  try {
    const services = serviceCollection();
    const list = await services.find({ active: true }).toArray();
    return {
      success: true,
      message: "Servicios activos encontrados.",
      result: list,
    };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
};

export const readMyServices = async (prixer: string): Promise<PrixResponse> => {
  try {
    const services = serviceCollection();
    const user = await userService.readUserByUsername(prixer);
    if (!user) {
      return { success: false, message: "Usuario no encontrado." };
    }
    const list = await services.find({ prixer }).toArray();
    return {
      success: true,
      message: "Servicios del usuario encontrados.",
      result: list,
    };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
};

export const readService = async (id: string): Promise<PrixResponse> => {
  try {
    const services = serviceCollection();
    const svc = await services.findOne({ _id: new ObjectId(id) });
    if (!svc) {
      return { success: false, message: "Servicio no encontrado." };
    }
    return {
      success: true,
      message: "Servicio encontrado.",
      result: svc,
    };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
};

export const readByPrixer = async (prixer: string): Promise<PrixResponse> => {
  try {
    const services = serviceCollection();
    const list = await services.find({ prixer }).toArray();
    return {
      success: true,
      message: "Servicios por prixer encontrados.",
      result: list,
    };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
};

export const readByUserId = async (userid: string): Promise<PrixResponse> => {
  try {
    const services = serviceCollection();
    const list = await services.find({ prixer: userid, active: true }).toArray();
    return {
      success: true,
      message: "Servicios activos por userid encontrados.",
      result: list,
    };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
}

export const updateMyService = async (id: string, updates: Partial<Service>): Promise<PrixResponse> => {
  try {
    const services = serviceCollection();
    const resp = await services.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );
    if (resp && !resp.title) {
      return { success: false, message: "Servicio no encontrado." };
    }
    return {
      success: true,
      message: "Servicio actualizado con éxito.",
      result: resp!,
    };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
};

export const disableService = async (id: string, visible: boolean): Promise<PrixResponse> => {
  try {
    const services = serviceCollection();
    const resp = await services.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { visible } },
      { returnDocument: "after" }
    );
    if (resp && !resp.title) {
      return { success: false, message: "Servicio no encontrado." };
    }

    return {
      success: true,
      message: "Visibilidad del servicio actualizada.",
      result: resp!,
    };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
};

export const deleteService = async (id: string): Promise<PrixResponse> => {
  try {
    const services = serviceCollection();
    const resp = await services.findOneAndDelete({ _id: new ObjectId(id) });
    if (resp && !resp.title) {
      return { success: false, message: "Servicio no encontrado." };
    }
    return {
      success: true,
      message: "Servicio eliminado con éxito.",
      result: resp!,
    };
  } catch (e: unknown) {
    const err = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${err}` };
  }
};