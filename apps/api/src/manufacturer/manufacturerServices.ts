import { Collection, ObjectId } from "mongodb";
import { getDb } from "../mongo.ts";
import { PrixResponse } from "../types/responseModel.ts";
import { Manufacturer } from "./manufacturerModel.ts";
import { User } from "../user/userModel.ts";

function manufacturerCollection(): Collection<Manufacturer> {
  return getDb().collection<Manufacturer>("manufacturer");
}

export const createManufacturer = async (data: Manufacturer & { userId?: string }): Promise<PrixResponse> => {
  try {
    const manufacturers = manufacturerCollection();
    if (!data.userId) {
      return { success: false, message: "No se encontró usuario asociado al Manufacturer." };
    }

    /* Evitar duplicados por userId ----------------------------------------- */
    const exists = await manufacturers.findOne({ userId: data.userId });
    if (exists) {
      return { success: false, message: "Este usuario ya está asignado a un Manufacturer." };
    }

    const { acknowledged, insertedId } = await manufacturers.insertOne(data as any);

    if (!acknowledged || !insertedId) {
      return { success: false, message: "No se pudo crear el Manufacturer." };
    }

    return {
      success: true,
      message: "Manufacturer creado con éxito.",
      result: { ...data, _id: insertedId },
    };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${msg}` };
  }
};

export const readManufacturer = async (user: User): Promise<PrixResponse> => {
  try {
    const manufacturers = manufacturerCollection();
    const manufacturer = await manufacturers.findOne({ userId: user._id!.toString() });
    if (!manufacturer) return { success: false, message: "Manufacturer no encontrado." };

    return {
      success: true,
      message: "Manufacturer encontrado.",
      result: {
        ...manufacturer,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, message: `Error: ${msg}` };
  }
};

export const readAllManufacturers = async (): Promise<PrixResponse> => {
  try {
    const manufacturers = manufacturerCollection();
    const list = await manufacturers.find({}).toArray();
    return { success: true, message: "Manufacturers encontrados.", result: list };
  } catch (e) {
    return { success: false, message: `Error: ${e instanceof Error ? e.message : e}` };
  }
};


export const updateManufacturer = async (manufacturerPatch: Partial<Manufacturer>, userPatch: { id?: string;[k: string]: any }): Promise<PrixResponse> => {
  try {
    if (!userPatch.id) return { success: false, message: "Usuario no proporcionado." };

    const manufacturers = manufacturerCollection();
    /* Manufacturer --------------------------------------------------------- */
    const updatedManufacturer = await manufacturers.findOneAndUpdate(
      { userId: userPatch.id },
      { $set: manufacturerPatch },
      { returnDocument: "after" }
    );

    if (!updatedManufacturer) return { success: false, message: "Manufacturer no encontrado." };


    return {
      success: true,
      message: "Manufacturer actualizado con éxito.",
      result: updatedManufacturer
    };
  } catch (e) {
    return { success: false, message: `Error: ${e instanceof Error ? e.message : e}` };
  }
};

export const disableManufacturer = async (_body: any): Promise<PrixResponse> => ({
  success: false,
  message: "Funcionalidad de deshabilitar Manufacturer pendiente de implementar.",
});

export const removeManufacturers = async (): Promise<PrixResponse> => {
  try {
    const manufacturers = manufacturerCollection();
    const res = await manufacturers.deleteMany({});
    return { success: true, message: `Se eliminaron ${res.deletedCount} Manufacturers.` };
  } catch (e) {
    return { success: false, message: `Error: ${e instanceof Error ? e.message : e}` };
  }
};
