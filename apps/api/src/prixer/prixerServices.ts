import { Prixer } from "./prixerModel.ts";
import { PrixResponse } from "../types/responseModel.ts";
import { Collection, Filter, FindOptions, ObjectId, UpdateFilter } from "mongodb";
import { getDb } from "../mongo.ts";
import { User } from "../user/userModel.ts";

function usersCollection(): Collection<User> {
  return getDb().collection<User>("users");
}

const prixerFilter = (id?: string): Filter<User> => {
  const filter: Filter<User> = { "prixer": { $exists: true, $ne: undefined } };
  if (id) {
    try {
      filter._id = new ObjectId(id);
    } catch (error) {
      console.error("Invalid ObjectId string provided for filtering:", id, error);
      filter._id = new ObjectId('000000000000000000000000');
    }
  }
  return filter;
};

const prixerUpdate = (data: Partial<Prixer>): UpdateFilter<User> => {
  const setObj: Record<string, any> = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      setObj[`prixer.${key}`] = data[key as keyof Prixer];
    }
  }
  return { $set: setObj };
};

const excludePasswordProjection: FindOptions<User>['projection'] = { password: 0 };

export const promoteUserToPrixer = async (userId: string): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const userObjectId = new ObjectId(userId);

    const user = await users.findOne({ _id: userObjectId });
    if (!user) {
      return { success: false, message: "User not found." };
    }

    if (user.prixer) {
      return { success: false, message: "User is already a Prixer." };
    }

    const defaultPrixerProfile: Prixer = {
      specialty: [],
      description: 'Bienvenido a mi perfil de Prixer!',
      avatar: user.avatar || '',
      status: true,
      termsAgree: false,
      bio: {}
    };

    const updateResult = await users.updateOne(
      { _id: userObjectId },
      { $set: { prixer: defaultPrixerProfile } }
    );

    if (updateResult.modifiedCount === 1) {
      const updatedUser = await users.findOne(
        { _id: userObjectId },
        { projection: excludePasswordProjection }
      );
      return {
        success: true,
        message: "User successfully promoted to Prixer.",
        result: updatedUser!,
      };
    } else {
      return { success: false, message: "Failed to promote user to Prixer." };
    }

  } catch (e: any) {
    console.error("Error promoting user to Prixer:", e);
    if (e.message.includes("Argument passed in must be a single String")) {
      return { success: false, message: "Invalid userId format provided." };
    }
    return { success: false, message: `Error promoting user: ${e.message}` };
  }
};

export const createPrixer = async (data: Prixer & { userId: string }): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const userId = new ObjectId(data.userId);
    const { userId: _, ...prixerData } = data;

    const updateResult = await users.updateOne(
      { _id: userId, "prixer": { $exists: false } },
      { $set: { prixer: prixerData } }
    );

    if (updateResult.acknowledged && updateResult.modifiedCount === 1) {
      const updatedUser = await users.findOne(
        { _id: userId },
        { projection: excludePasswordProjection }
      );
      return {
        success: true,
        message: "Prixer profile created successfully for the user.",
        result: updatedUser!,
      };
    } else if (updateResult.acknowledged && updateResult.matchedCount === 1 && updateResult.modifiedCount === 0) {
      return { success: false, message: "User already has a Prixer profile." };
    } else if (updateResult.matchedCount === 0) {
      return { success: false, message: "User not found." };
    }
    return { success: false, message: "Failed to create Prixer profile." };

  } catch (e: any) {
    console.error("Error creating Prixer profile:", e);
    if (e.message.includes("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
      return { success: false, message: "Invalid userId format provided." };
    }
    return { success: false, message: `Error creating Prixer profile: ${e.message}` };
  }
};

export const readByUsername = async (username: string): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const doc = await users.findOne(
      { "username": username, ...prixerFilter() },
      { projection: excludePasswordProjection }
    );
    if (doc) {
      return { success: true, message: "Prixer user found.", result: doc };
    }
    return { success: false, message: "Prixer user not found." };
  } catch (e: any) {
    console.error("Error reading Prixer by ID:", e);
    if (e.message.includes("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
      return { success: false, message: "Invalid ID format provided." };
    }
    return { success: false, message: `Error reading Prixer by ID: ${e.message}` };
  }
};

export const readAllPrixers = async (): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const list = await users.find(prixerFilter(), { projection: excludePasswordProjection }).toArray();

    return { success: true, message: "Active Prixer users retrieved.", result: list };
  } catch (e: any) {
    console.error("Error reading all Prixers:", e);
    return { success: false, message: `Error reading all Prixers: ${e.message}` };
  }
};

export const readAllPrixersActive = async (): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const list = await users.find({
      ...prixerFilter(),
      // active: true,
      "prixer.status": true
    },
      { projection: excludePasswordProjection }
    ).toArray();

    return { success: true, message: "Active Prixer users retrieved.", result: list };
  } catch (e: any) {
    console.error("Error reading all Prixers:", e);
    return { success: false, message: `Error reading all Prixers: ${e.message}` };
  }
};

export const updatePrixer = async (id: string, data: Partial<Prixer>): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const updateOperation = prixerUpdate(data);

    const result = await users.findOneAndUpdate(
      prixerFilter(id),
      updateOperation,
      {
        returnDocument: "after",
        projection: excludePasswordProjection
      }
    );

    if (result) {
      return { success: true, message: "Prixer user profile updated.", result: result };
    }

    return { success: false, message: "Prixer user not found or update failed." };
  } catch (e: any) {
    console.error("Error updating Prixer profile:", e);
    if (e.message.includes("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
      return { success: false, message: "Invalid ID format provided." };
    }
    return { success: false, message: `Error updating Prixer profile: ${e.message}` };
  }
};

export const updateVisibility = async (id: string, status: boolean): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const result = await users.findOneAndUpdate(
      prixerFilter(id),
      { $set: { "prixer.status": status } },
      {
        returnDocument: "after",
        projection: excludePasswordProjection
      }
    );

    if (result) {
      return { success: true, message: "Prixer user visibility updated.", result: result };
    }
    return { success: false, message: "Prixer user not found or update failed." };
  } catch (e: any) {
    console.error("Error updating Prixer visibility:", e);
    if (e.message.includes("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
      return { success: false, message: "Invalid ID format provided." };
    }
    return { success: false, message: `Error updating Prixer visibility: ${e.message}` };
  }
};

export const updateTermsAgreeGeneral = async (termsAgree: boolean): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const updateResult = await users.updateMany(
      prixerFilter(),
      { $set: { "prixer.termsAgree": termsAgree } }
    );

    if (updateResult.acknowledged) {
      return {
        success: true,
        message: `Terms agreement updated for ${updateResult.modifiedCount} Prixer profiles.`,
      };
    }
    return { success: false, message: "Failed to update terms agreement for all Prixer profiles." };
  } catch (e: any) {
    console.error("Error updating general terms agreement:", e);
    return { success: false, message: `Error updating general terms agreement: ${e.message}` };
  }
};


export const updateTermsAgree = async (id: string, termsAgree: boolean): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const result = await users.findOneAndUpdate(
      prixerFilter(id),
      { $set: { "prixer.termsAgree": termsAgree } },
      {
        returnDocument: "after",
        projection: { prixer: 1, _id: 1, password: 0 }
      }
    );

    if (result) {

      return { success: true, message: "Prixer termsAgree updated.", result: result };
    }
    return { success: false, message: "Prixer not found or user is not a Prixer." };
  } catch (e: any) {
    console.error("Error updating specific terms agreement:", e);
    if (e.message.includes("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
      return { success: false, message: "Invalid ID format provided." };
    }
    return { success: false, message: `Error updating specific terms agreement: ${e.message}` };
  }
};

export const deletePrixer = async (id: string): Promise<PrixResponse> => {
  try {
    const users = usersCollection();

    const result = await users.findOneAndUpdate(
      prixerFilter(id),
      { $unset: { prixer: "" } },
      {
        returnDocument: "before",
        projection: { prixer: 1, _id: 1, password: 0 }
      }
    );

    if (result?.prixer) {
      return { success: true, message: "Prixer profile deleted successfully.", result: result };
    }
    return { success: false, message: "Prixer profile not found or already deleted." };
  } catch (e: any) {
    console.error("Error deleting Prixer profile:", e);
    if (e.message.includes("Argument passed in must be a single String of 12 bytes or a string of 24 hex characters")) {
      return { success: false, message: "Invalid ID format provided." };
    }
    return { success: false, message: `Error deleting Prixer profile: ${e.message}` };
  }
};