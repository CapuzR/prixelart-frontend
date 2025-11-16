import { CarouselItem, TermsAndConditions } from "./preferencesModel.ts";
import { BulkWriteResult, Collection, ObjectId } from "mongodb";
import { PrixResponse } from "../types/responseModel.ts";
import { Prixer } from "../prixer/prixerModel.ts";
import { getDb, getMongoClient } from "../mongo.ts";

function carouselCollection(): Collection<CarouselItem> {
  return getDb().collection<CarouselItem>("carousel");
}
function termsCollection(): Collection<TermsAndConditions> {
  return getDb().collection<TermsAndConditions>("termsAndConditions");
}

function prixerCollection(): Collection<Prixer> {
  return getDb().collection<Prixer>("prixer");
}

export const getAllImagesCarousel = async (): Promise<PrixResponse> => {
  try {
    const carousel = carouselCollection();
    const result = await carousel.find({}).toArray();
    return {
      success: true,
      message: "Fetched carousel images successfully.",
      result,
    };
  } catch (err) {
    return {
      success: false,
      message: `Error fetching carousel images: ${err}`,
    };
  }
};

export const createCarouselItem = async (itemData: Pick<CarouselItem, 'type' | 'imageURL'>): Promise<PrixResponse> => {
  if (!itemData || !itemData.type || !itemData.imageURL) {
    return { success: false, message: "Missing required fields (type, imageURL)." };
  }
  if (itemData.type !== 'desktop' && itemData.type !== 'mobile') {
    return { success: false, message: "Invalid type specified. Must be 'desktop' or 'mobile'." };
  }

  try {
    const carousel = carouselCollection();

    const lastItem = await carousel.find({ type: itemData.type })
      .sort({ position: -1 })
      .limit(1)
      .toArray();

    const nextPosition = lastItem.length > 0 ? lastItem[0].position + 1 : 1;

    const newItem: Omit<CarouselItem, '_id'> = {
      type: itemData.type,
      imageURL: itemData.imageURL,
      position: nextPosition,
    };

    const result = await carousel.insertOne(newItem);

    if (result.acknowledged && result.insertedId) {
      return {
        success: true,
        message: 'Carousel item created successfully.',
        result: { ...newItem, _id: result.insertedId },
      };
    } else {
      throw new Error('Database insertion failed.');
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error creating carousel item:", error);
    return {
      success: false,
      message: `Error creating carousel item: ${errorMsg}`,
    };
  }
};

export const deleteCarouselItem = async (id: string): Promise<PrixResponse> => {
  if (!ObjectId.isValid(id)) {
    return { success: false, message: 'Invalid ID format provided.' };
  }

  try {
    const carousel = carouselCollection();
    const objectId = new ObjectId(id);

    const itemToDelete = await carousel.findOne({ _id: objectId });

    if (!itemToDelete) {
      return { success: false, message: 'Carousel item not found.' };
    }

    const { position: deletedPosition, type: itemType } = itemToDelete;

    const deleteResult = await carousel.deleteOne({ _id: objectId });

    if (deleteResult.deletedCount === 0) {
      return { success: false, message: 'Item found but could not be deleted.' };
    }

    const updateResult = await carousel.updateMany(
      { type: itemType, position: { $gt: deletedPosition } },
      { $inc: { position: -1 } }
    );

    return {
      success: true,
      message: `Item deleted successfully. ${updateResult.modifiedCount} positions updated.`,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error deleting carousel item:", error);
    return {
      success: false,
      message: `Error deleting carousel item: ${errorMsg}`,
    };
  }
};

export const updateCarouselOrder = async (type: 'desktop' | 'mobile', orderedIds: string[]): Promise<PrixResponse> => {
  if (type !== 'desktop' && type !== 'mobile') {
    return { success: false, message: "Invalid type specified." };
  }
  if (!Array.isArray(orderedIds)) {
    return { success: false, message: 'Invalid input: orderedIds must be an array.' };
  }

  try {
    const carousel = carouselCollection();

    const bulkOps = orderedIds.map((id, index) => {
      if (!ObjectId.isValid(id)) {
        throw new Error(`Invalid ObjectId format provided in list: ${id}`);
      }
      return {
        updateOne: {
          filter: { _id: new ObjectId(id), type: type },
          update: { $set: { position: index + 1 } },
        },
      };
    });

    if (bulkOps.length > 0) {
      const result: BulkWriteResult = await carousel.bulkWrite(bulkOps, { ordered: true });

      if (result.isOk()) {

        if (result.matchedCount !== bulkOps.length) {
          console.warn(`Carousel order update warning: Matched count (${result.matchedCount}) does not equal operations count (${bulkOps.length}) for type '${type}'. Some IDs might have been invalid or belonged to the wrong type.`);

        }
        return {
          success: true,
          message: `Carousel order for '${type}' updated. ${result.modifiedCount} items repositioned.`,
        };
      } else {
        console.error("Bulk write operation failed without throwing error:", result);
        return { success: false, message: 'Bulk write failed to update order.' };
      }
    } else {
      return { success: true, message: `No items provided to reorder for type '${type}'.` };
    }

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Error updating ${type} carousel order:`, error);
    return {
      success: false,
      message: errorMsg.startsWith("Invalid ObjectId format") ? errorMsg : `Error updating order: ${errorMsg}`,
    };
  }
};

/* ----- Terms and Conditions Operations ----- */

export const updateTermsAndConditions = async (termsText: string): Promise<PrixResponse> => {
  const client = getMongoClient();
  const session = client.startSession();
  
  let response: PrixResponse = { 
    success: false, 
    message: "La operación no se completó." 
  };

  try {
    session.startTransaction();

    const terms = termsCollection();
    const prixers = prixerCollection();

    await prixers.updateMany({}, { $set: { termsAgree: false } }, { session });

    const existing = await terms.findOne({}, { session });
    
    if (existing) {
      await terms.updateOne(
        { _id: existing._id },
        { $set: { termsAndConditions: termsText } },
        { session }
      );
    } else {
      await terms.insertOne(
        { termsAndConditions: termsText },
        { session }
      );
    }

    await session.commitTransaction();
    
    response = {
      success: true,
      message: "Términos y condiciones actualizados exitosamente.",
      result: termsText
    };

  } catch (e: unknown) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Error en la transacción de actualizar términos:", e);
    const msg = e instanceof Error ? e.message : String(e);
    response = { success: false, message: `Error en la transacción: ${msg}` };
    
  } finally {
    await session.endSession();
  }

  return response;
};

export const readTermsAndConditions = async (): Promise<PrixResponse> => {
  try {
    const terms = termsCollection();
    const doc = await terms.findOne({});
    if (!doc) {
      return {
        success: false,
        message: "Terms and Conditions not found.",
      };
    }
    return {
      success: true,
      message: "Terms and Conditions fetched.",
      result: doc
    };
  } catch (err) {
    return {
      success: false,
      message: `Error reading terms: ${err}`,
    };
  }
};