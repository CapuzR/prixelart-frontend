import { Collection, ObjectId, UpdateResult, WithId } from "mongodb";
import { PrixResponse } from "../types/responseModel.ts";
import { Testimonial } from "./testimonialModel.ts";
import { getDb } from "../mongo.ts";

function testimonialCollection(): Collection<Testimonial> {
  return getDb().collection<Testimonial>('testimonial');
}

// Create a new testimonial.
export const createTestimonial = async (testimonial: Testimonial): Promise<PrixResponse> => {
  try {
    const testimonials = testimonialCollection();
    const result = await testimonials.insertOne(testimonial);

    if (result.acknowledged && result.insertedId) {
      return {
        success: true,
        message: 'Testimonial created successfully.',
        result: { ...testimonial, _id: result.insertedId },
      };
    } else {
      return {
        success: false,
        message: 'Failed to create testimonial.',
      };
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};

// Read a testimonial by its ID.
export const readById = async (id: string): Promise<PrixResponse> => {
  try {
    const testimonials = testimonialCollection();
    const foundTestimonial = await testimonials.findOne({ _id: new ObjectId(id) });

    if (foundTestimonial) {
      return {
        success: true,
        message: 'Testimonial found.',
        result: foundTestimonial,
      };
    } else {
      return {
        success: false,
        message: 'Testimonial not found.',
      };
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }

};


// Read all testimonials.
export const readAllTestimonials = async (): Promise<PrixResponse> => {
  try {
    const testimonials = testimonialCollection();
    const testimonialList = await testimonials.find({}).toArray();

    return {
      success: true,
      message: 'Testimnonials found.',
      result: testimonialList
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};

// Update a testimonial.
export const updateTestimonial = async (testimonialId: string, testimonialData: Partial<Testimonial>): Promise<PrixResponse> => {
  try {
    const testimonials = testimonialCollection();
    const result = await testimonials.findOneAndUpdate(
      { _id: new ObjectId(testimonialId) },
      { $set: testimonialData },
      { returnDocument: 'after' }
    );

    if (result && !result.value) {
      return {
        success: false,
        message: 'Testimonial not found.',
      };
    }

    return {
      success: true,
      message: 'Testimonial updated successfully.',
      result: result!,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};

export const updateTestimonialOrder = async (orderedIds: string[]): Promise<PrixResponse> => {
  if (!Array.isArray(orderedIds)) {
    return {
      success: false,
      message: 'Invalid input: orderedIds must be an array.',
    };
  }

  try {
    const testimonials = testimonialCollection();

    const bulkOps = orderedIds.map((id, index) => {
      if (!ObjectId.isValid(id)) {
        throw new Error(`Invalid ObjectId format provided: ${id}`);
      }
      return {
        updateOne: {
          filter: { _id: new ObjectId(id) },
          update: { $set: { position: index + 1 } },
        },
      };
    });

    if (bulkOps.length > 0) {
      const result = await testimonials.bulkWrite(bulkOps, { ordered: true });

      if (result.isOk()) {
        return {
          success: true,
          message: `Testimonial order updated successfully. ${result.modifiedCount} documents modified.`,
        };
      } else {
        console.error("Bulk write operation failed without throwing error:", result);
        return {
          success: false,
          message: 'Bulk write operation failed to update order.',
        };
      }
    } else {
      return {
        success: true,
        message: 'No testimonials provided to reorder.',
      };
    }

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error updating testimonial order:", error);
    return {
      success: false,
      message: errorMsg.startsWith("Invalid ObjectId format") ? errorMsg : `An error occurred during bulk update: ${errorMsg}`,
    };
  }
};

// Delete a testimonial.
export const deleteTestimonial = async (id: string): Promise<PrixResponse> => {
  if (!ObjectId.isValid(id)) {
    return {
      success: false,
      message: `Invalid ID format provided: ${id}`,
    };
  }

  try {
    const testimonials = testimonialCollection();
    const objectId = new ObjectId(id);

    const deleteResult: WithId<Testimonial> | null = await testimonials.findOneAndDelete({ _id: objectId });

    if (!deleteResult) {
      return {
        success: false,
        message: 'Testimonial not found or could not be deleted.',
      };
    }

    const deletedPosition = deleteResult.position;

    const updateResult: UpdateResult = await testimonials.updateMany(
      { position: { $gt: deletedPosition } },
      { $inc: { position: -1 } }
    );

    return {
      success: true,
      message: `Testimonial deleted successfully. ${updateResult.modifiedCount} subsequent testimonials reordered.`,
      result: deleteResult
    };

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Error deleting testimonial ${id}:`, error);
    return {
      success: false,
      message: `An error occurred while deleting testimonial: ${errorMsg}`,
    };
  }
};