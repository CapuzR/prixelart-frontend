import { Art } from "./artModel.ts";
import { Collection, ObjectId } from "mongodb";
import { GalleryResult, PrixResponse } from "../types/responseModel.ts";
import { getDb } from "../mongo.ts";
import mongoose from "mongoose"

function artCollection(): Collection<Art> {
  return getDb().collection<Art>("arts");
}

export const createArt = async (art: Art): Promise<PrixResponse> => {
  try {
    const arts = artCollection();

    const { acknowledged, insertedId } = await arts.insertOne(art);
    if (acknowledged) {
      return {
        success: true,
        message: "Arte creado con éxito.",
        result: { ...art, _id: insertedId },
      };
    }
    return { success: false, message: "No se pudo crear el arte." };
  } catch (e: unknown) {
    return {
      success: false,
      message: `Error al crear arte: ${e instanceof Error ? e.message : e}`,
    };
  }
};

export const readOneById = async (artId: string): Promise<PrixResponse> => {
  try {
    const arts = artCollection();
    const art = await arts.findOne({ artId, visible: true })

    if (!art) return { success: false, message: "Arte no encontrado." };
    const createdOn = new mongoose.Types.ObjectId(art._id)
    const date = createdOn.getTimestamp()
    art.createdOn = date

    return { success: true, message: "Arte encontrado.", result: art };
  } catch (e: unknown) {
    return {
      success: false,
      message: `Error buscar arte: ${e instanceof Error ? e.message : e}`,
    };
  }
};

export const readOneByObjId = async (_id: string): Promise<PrixResponse> => {
  try {
    const arts = artCollection();
    const art = await arts.findOne({ _id: new ObjectId(_id) });
    if (!art) return { success: false, message: "Arte no encontrado." };
    return { success: true, message: "Arte encontrado.", result: art };
  } catch (e: unknown) {
    return {
      success: false,
      message: `Error buscar arte: ${e instanceof Error ? e.message : e}`,
    };
  }
};

// Return a random art
export const randomArts = async (): Promise<PrixResponse> => {
  try {
    const arts = artCollection();
    const count = await arts.countDocuments({ visible: true });
    if (count === 0) {
      return {
        success: true,
        message: "No hay artes registrados.",
        result: []
      };
    }
    const skip = Math.floor(Math.random() * count);
    const [art] = await arts
      .find({ visible: true })
      .skip(skip)
      .limit(1)
      .toArray();

    return {
      success: true,
      message: "Arte aleatorio obtenido.",
      result: art
    };
  } catch (e: unknown) {
    return {
      success: false,
      message: `Error al obtener arte aleatorio: ${e instanceof Error ? e.message : e}`
    };
  }
};

// Read all arts
export const readAllArts = async (): Promise<PrixResponse> => {
  try {
    const art = artCollection();
    const arts = await art.find({}).toArray();
    return { success: true, message: "Artes encontrados.", result: arts };
  } catch (e: unknown) {
    return {
      success: false,
      message: `Error al leer artes: ${e instanceof Error ? e.message : e}`,
    };
  }
};

export const readGallery = async (filters: any): Promise<PrixResponse> => {
  try {
    const art = artCollection();

    const q: any = {};
    q.visible = true;

    if (filters.text) {
      const searchText = filters.text.trim();
      if (searchText.length > 0) {
        const escapedSearchText = searchText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

        const fieldsToSearch = [
          'title', 'description', 'category', 'prixerUsername',
          'tags', 'artType', 'artLocation', 'artId'
        ];

        q.$or = fieldsToSearch.map(field => ({
          [field]: { $regex: escapedSearchText, $options: 'i' }
        }));
      }
    }
    if (filters.category) {
      q.category = filters.category;
    }
    if (filters.username) {
      q.prixerUsername = filters.username;
    }

    const limit = Number(filters.itemsPerPage || 30);

    const arts = await art.aggregate<Art>([
      { $match: q },
      { $sample: { size: limit + 1 } }
    ]).toArray();
    
    const hasMore = arts.length > limit;
    const resultsToSend = hasMore ? arts.slice(0, limit) : arts;

    const result: GalleryResult = {
      arts: resultsToSend,
      hasMore: hasMore,
    };

    return {
      success: true,
      message: "Galería cargada.",
      result: result,
    };
  } catch (e: unknown) {
    console.error("‼ Error in readGallery:", e);
    return {
      success: false,
      message: `Error en galería: ${e instanceof Error ? e.message : e}`,
    };
  }
};

// Read the latest arts
export const readLatest = async (): Promise<PrixResponse> => {
  try {
    const art = artCollection();
    const arts = await art
      .find({ visible: true })
      .sort({ _id: -1 })
      .limit(20)
      .toArray();
    return { success: true, message: "Últimos artes.", result: arts };
  } catch (e: unknown) {
    return {
      success: false,
      message: `Error al leer últimos artes: ${e instanceof Error ? e.message : e}`,
    };
  }
};

export interface PaginatedArtsResult {
  arts: Art[];
  currentPage: number;
  totalPages: number;
  totalArts: number;
  hasNextPage: boolean;
}

export interface ArtsPrixResponse { // More specific than a generic PrixResponse
  success: boolean;
  message: string;
  result: PaginatedArtsResult | null; // result can be null if success is false
}

export const readAllByUsername = async (
  username: string,
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  category?: string
): Promise<ArtsPrixResponse> => {
  try {
    const artsCollection = artCollection(); // Renamed variable
    const query: any = { prixerUsername: username, visible: true };

    // Apply category filter if provided
    if (category) {
      query.category = category;
    }

    // Determine sort criteria
    const sortCriteria: any = {};
    const allowedSortFields = ['createdAt', 'title', 'price']; // Define allowed fields for sorting

    if (sortBy && allowedSortFields.includes(sortBy)) {
      sortCriteria[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      // Default sort if sortBy is not provided or not allowed
      sortCriteria['createdAt'] = -1; // Default to newest first
    }

    const totalArts = await artsCollection.countDocuments(query);
    const totalPages = Math.ceil(totalArts / limit);
    const artsToSkip = (page - 1) * limit;

    const fetchedArts = await artsCollection
      .find(query)
      .sort(sortCriteria)
      .skip(artsToSkip)
      .limit(limit)
      .toArray();

    const resultData: PaginatedArtsResult = {
      arts: fetchedArts,
      currentPage: page,
      totalPages,
      totalArts,
      hasNextPage: page < totalPages,
    };

    return {
      success: true,
      message: "Artes por username recuperadas exitosamente.",
      result: resultData,
    };
  } catch (e: unknown) {
    console.error(`Error al leer artes por username (${username}):`, e);
    return {
      success: false,
      message: `Error al leer artes por username: ${e instanceof Error ? e.message : String(e)}`,
      result: null,
    };
  }
};

// Update art by artId
export const updateArt = async (id: string, data: Partial<Art>): Promise<PrixResponse> => {
  try {
    const art = artCollection();
    const { _id, ...updateData } = data;

    const result = await art.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );
    if (result && !result.title) return { success: false, message: "Arte no encontrado." };
    return { success: true, message: "Arte actualizado.", result: result! };
  } catch (e: unknown) {
    return {
      success: false,
      message: `Error actualizar arte: ${e instanceof Error ? e.message : e}`,
    };
  }
};
// Disable art by artId
export const disableArt = async (id: string): Promise<PrixResponse> => {
  try {
    const art = artCollection();
    const result = await art.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { visible: false } },
      { returnDocument: "after" }
    );
    if (result && !result.title) return { success: false, message: "Arte no encontrado." };
    return { success: true, message: "Arte deshabilitado.", result: result! };
  } catch (e: unknown) {
    return {
      success: false,
      message: `Error deshabilitar arte: ${e instanceof Error ? e.message : e}`,
    };
  }
};

// Rank an art
export const rankArt = async (id: string, payload: { points: number; certificate?: any }): Promise<PrixResponse> => {
  try {
    const art = artCollection();
    const result = await art.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: payload },
      { returnDocument: "after" }
    );
    if (result && !result.title) return { success: false, message: "Arte no encontrado." };
    return { success: true, message: "Arte rankeado.", result: result! };
  } catch (e: unknown) {
    return {
      success: false,
      message: `Error rankear arte: ${e instanceof Error ? e.message : e}`,
    };
  }
};

// Delete an art
export const deleteArt = async (id: string): Promise<PrixResponse> => {
  try {
    const art = artCollection();
    const result = await art.findOneAndDelete({ _id: new ObjectId(id) });
    if (result && !result.title) return { success: false, message: "Arte no encontrado." };
    return { success: true, message: "Arte eliminado.", result: result! };
  } catch (e: unknown) {
    return {
      success: false,
      message: `Error eliminar arte: ${e instanceof Error ? e.message : e}`,
    };
  }
};

// Get best-selling arts based on orders
export const getBestSellers = async (orders: any[]): Promise<PrixResponse> => {
  try {
    const art = artCollection();
    const allArts = await art.find({ visible: true }).toArray();
    const tally: Record<string, number> = {};
    for (const art of allArts) tally[art.title] = 0;
    for (const order of orders) {
      for (const line of order.lines || []) {
        const t = line.item.art?.title;
        if (t && tally.hasOwnProperty(t)) tally[t]++;
      }
    }
    const top = Object.entries(tally)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, qty]) => ({ name, quantity: qty }));
    const arts = allArts.filter(a => top.some(t => t.name === a.title));
    return { success: true, message: "Los más vendidos.", result: arts };
  } catch (e: unknown) {
    return {
      success: false,
      message: `Error best sellers: ${e instanceof Error ? e.message : e}`,
    };
  }
};