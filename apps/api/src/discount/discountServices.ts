import { Collection, ObjectId } from "mongodb";
import { Discount } from "./discountModel.ts";
import { PrixResponse } from "../types/responseModel.ts";
import { getDb } from "../mongo.ts";

function discountCollection(): Collection<Discount> {
  return getDb().collection<Discount>("discounts");
}

export const createDiscount = async (discount: Discount): Promise<PrixResponse> => {
  try {
    const discounts = discountCollection();
    const { acknowledged, insertedId } = await discounts.insertOne(discount);
    if (acknowledged) {
      return {
        success: true,
        message: "Discount created successfully.",
        result: { ...discount, _id: insertedId },
      };
    }
    return { success: false, message: "Failed to create discount." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `An error occurred: ${message}` };
  }
};

export const readById = async (id: string): Promise<PrixResponse> => {
  try {
    const discounts = discountCollection();
    const discount = await discounts.findOne({ _id: new ObjectId(id) });
    if (discount) {
      return { success: true, message: "Discount found.", result: discount };
    }
    return { success: false, message: "Discount not found." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `An error occurred: ${message}` };
  }
};

export const readAllDiscounts = async (): Promise<PrixResponse> => {
  try {
    const discounts = discountCollection();
    const list = await discounts.find({ active: true }).toArray();
    return { success: true, message: "Active discounts found.", result: list };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `An error occurred: ${message}` };
  }
};

export const readAllDiscountsAdmin = async (): Promise<PrixResponse> => {
  try {
    const discounts = discountCollection();
    const list = await discounts.find({}).toArray();
    return { success: true, message: "All discounts found.", result: list };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `An error occurred: ${message}` };
  }
};

export const updateDiscount = async (id: string, updates: Partial<Discount>): Promise<PrixResponse> => {
  try {
    const discounts = discountCollection();
    const result = await discounts.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updates },
      { returnDocument: "after" }
    );
    if (result && !result.name) {
      return { success: false, message: "Discount not found." };
    }
    return {
      success: true,
      message: "Discount updated successfully.",
      result: result!,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `An error occurred: ${message}` };
  }
};

export const deleteDiscount = async (id: string): Promise<PrixResponse> => {
  try {
    const discounts = discountCollection();
    const result = await discounts.findOneAndDelete({
      _id: new ObjectId(id),
    });
    if (result && !result.name) {
      return { success: false, message: "Discount not found." };
    }
    return {
      success: true,
      message: "Discount deleted successfully.",
      result: result!,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `An error occurred: ${message}` };
  }
};

const readDiscountByFilter = async (productName: string, userId?: string): Promise<PrixResponse> => {
  try {
    const discount = discountCollection();
    const filter: any = { $and: [{ $or: [] }, { active: true }] };

    if (productName) {
      filter.$and[0].$or.push({ applicableProducts: { $in: [productName] } });
    }
    if (userId) {
      filter.$and[0].$or.push({ "entityOverrides.id": userId });
    }

    if (filter.$and[0].$or.length === 0) {
      delete filter.$and;
      Object.assign(filter, { active: true });
    }

    const discounts = await discount.find(filter).toArray();
    if (discounts.length > 0) {
      return {
        success: true,
        message: "Discounts found.",
        result: discounts,
      };
    } else {
      return {
        success: false,
        message: "No discounts found with the given filters.",
        result: [],
      };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `An error occurred: ${message}` };
  }
};

export const applyDiscounts = async (values: number[] = [], productName: string, userId: ObjectId): Promise<PrixResponse> => {
  try {
    const filterRes = await readDiscountByFilter(productName, userId?.toHexString());

    if (!filterRes.success || !Array.isArray(filterRes.result) || filterRes.result.length === 0) {
      return { success: true, message: "No discounts applied.", result: values };
    }

    const discounts: Discount[] = filterRes.result as Discount[];
    const discounted = values.map((v) => {
      return discounts.reduce((acc, d) => {
        let out = acc;
        if (d.adjustmentMethod === "percentage") {
          out -= (d.defaultValue / 100) * out;
        } else {
          out -= d.defaultValue;
        }
        return Math.max(0, out);
      }, v);
    });

    return { success: true, message: "Discounts applied.", result: discounted };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: `An error occurred: ${message}` };
  }
};
