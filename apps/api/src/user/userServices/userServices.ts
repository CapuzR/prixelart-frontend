import { Collection, FindOptions, ObjectId } from 'mongodb';
import { PrixResponse } from '../../types/responseModel.ts';
import { User } from '../userModel.ts';
import bcrypt from 'bcryptjs';
import { getDb } from '../../mongo.ts';
import { Art } from '../../art/artModel.ts';
import { Order } from '../../order/orderModel.ts';
import { OrderArchive } from '../../orderArchive/orderArchiveModel.ts';

function usersCollection(): Collection<User> {
  return getDb().collection<User>('users');
}

const excludePasswordProjection: FindOptions<User>['projection'] = {
  password: 0,
};

export const createUser = async (userData: User): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const existingUserByEmail = await users.findOne({ email: userData.email });
    if (userData?.username) {
      const existingUserByUsername = await readUserByUsername(userData?.username);
      if (existingUserByUsername.success) {
        return {
          success: false,
          message: 'Disculpa, el nombre de usuario ya está registrado.',
        };
      }
    }
    if (existingUserByEmail) {
      return {
        success: false,
        message: 'Disculpa, el correo del usuario ya está registrado.',
      };
    }
    let newUserData;

    if (userData.role?.includes('Prixer')) {
      const salt = await bcrypt.genSalt(2);
      const hash = await bcrypt.hash(userData.password!, salt);
      newUserData = { ...userData, password: hash };
    } else {
      newUserData = { ...userData };
    }
    const result = await users.insertOne(newUserData);
    if (result.insertedId) {
      const newUser = await users.findOne({ _id: result.insertedId });
      return {
        success: true,
        message: 'Éxito',
        result: newUser!,
      };
    } else {
      return {
        success: false,
        message: 'No se pudo insertar el usuario.',
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

export const findOrCreateClient = async (order: Partial<Order>): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const clientData = order.consumerDetails;
    let existingClient: User | null = null;

    if (clientData?.basic?.email) {
      existingClient = await users.findOne({ email: clientData.basic.email });
    }

    if (!existingClient && clientData?.basic?.phone) {
      existingClient = await users.findOne({ phone: clientData.basic.phone });
    }
    if (existingClient) {
      const updatedFields: Partial<User> = {
        firstName: clientData?.basic?.name ?? existingClient.firstName,
        lastName: clientData?.basic?.lastName ?? existingClient.lastName,
        email: clientData?.basic?.email ?? existingClient.email,
        phone: clientData?.basic?.phone ?? existingClient.phone,
        city: clientData?.selectedAddress?.city ?? existingClient.city,
        country: clientData?.selectedAddress?.country ?? existingClient.country,
        shippingAddress: order?.shipping?.address.line1 ?? existingClient.shippingAddress,
        billingAddress: order?.billing?.address?.address?.line1 ?? existingClient.billingAddress,
      };

      await users.updateOne({ _id: existingClient._id }, { $set: updatedFields });

      const updatedClient = { ...existingClient, ...updatedFields };

      return { success: true, message: 'Cliente actualizado con éxito.', result: updatedClient };
    } else {
      const newClientData: User = {
        firstName: clientData?.basic?.name || '',
        lastName: clientData?.basic?.lastName || '',
        email: clientData?.basic?.email!,
        phone: clientData?.basic?.phone,
        active: true,
        role: ['Consumer'],
        city: clientData?.selectedAddress?.city,
        country: clientData?.selectedAddress?.country,
        shippingAddress: order?.shipping?.address.line1,
        billingAddress: order?.billing?.address?.address?.line1,
      };

      const result = await users.insertOne(newClientData);
      const newClient = await users.findOne({ _id: result.insertedId });

      return {
        success: true,
        message: 'Cliente creado con éxito.',
        result: newClient!,
      };
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error en findOrCreateClient:', errorMsg);
    return { success: false, message: `Error al procesar el cliente: ${errorMsg}` };
  }
};

export const changePassword = async (
  username: string,
  oldPassword: string,
  newPassword: string
): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const userRecord = await users.findOne({ username: username });
    if (!userRecord) {
      return {
        success: false,
        message: 'Nombre de usuario incorrecto.',
      };
    }
    if (userRecord.password && !bcrypt.compareSync(oldPassword, userRecord.password)) {
      return {
        success: false,
        message: 'Inténtalo de nuevo, contraseña incorrecta.',
      };
    } else {
      const salt = await bcrypt.genSalt(2);
      const hash = await bcrypt.hash(newPassword, salt);
      const updateResult = await users.findOneAndUpdate(
        { username: username },
        { $set: { password: hash } },
        { returnDocument: 'after' }
      );
      if (updateResult) {
        return {
          success: true,
          message: 'Contraseña actualizada correctamente.',
        };
      } else {
        return {
          success: false,
          message: 'No se pudo actualizar la contraseña.',
        };
      }
    }
  } catch (e) {
    return {
      success: false,
      message: 'Unable to change the password.',
    };
  }
};

export const changePasswordFromAdmin = async (
  username: string,
  newPassword: string
): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const userRecord = await users.findOne({ username: username });
    if (!userRecord) {
      return {
        success: false,
        message: 'Nombre de usuario incorrecto.',
      };
    }
    // if (userRecord.password && !bcrypt.compareSync(oldPassword, userRecord.password)) {
    //   return {
    //     success: false,
    //     message: "Inténtalo de nuevo, contraseña incorrecta.",
    //   };
    // } else {
    const salt = await bcrypt.genSalt(2);
    const hash = await bcrypt.hash(newPassword, salt);
    const updateResult = await users.findOneAndUpdate(
      { username: username },
      { $set: { password: hash } },
      { returnDocument: 'after' }
    );
    if (updateResult) {
      return { success: true, message: 'Contraseña actualizada correctamente.' };
    } else {
      return { success: false, message: 'No se pudo actualizar la contraseña.' };
    }
    // }
  } catch (e) {
    return {
      success: false,
      message: 'Unable to change the password.',
    };
  }
};

export const resetPassword = async (newPassword: string, user: User): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const salt = await bcrypt.genSalt(2);
    const hash = await bcrypt.hash(newPassword, salt);
    const updateResult = await users.findOneAndUpdate(
      { _id: new ObjectId(user._id) },
      { $set: { password: hash } },
      { returnDocument: 'after' }
    );
    if (updateResult) {
      return {
        success: true,
        message: 'Contraseña modificada correctamente. Por favor inicia sesión.',
      };
    } else {
      return {
        success: false,
        message: 'No pudimos actualizar tu contraseña, por favor inténtalo de nuevo.',
      };
    }
  } catch (e) {
    return {
      success: false,
      message: 'No pudimos actualizar tu contraseña, por favor inténtalo de nuevo.',
    };
  }
};
// Utils

export const readUserById = async (id: string): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const user = await users.findOne(
      { _id: new ObjectId(id) },
      { projection: excludePasswordProjection }
    );
    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }
    return {
      success: true,
      message: 'User found successfully.',
      result: user,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};

export const readAllUsers = async (): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const userList = await users.find({}, { projection: excludePasswordProjection }).toArray();

    return {
      success: true,
      message: 'Users found.',
      result: userList,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};

export const readUserByUsername = async (username: string): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const user = await users.findOne(
      { username: username },
      { projection: excludePasswordProjection }
    );

    if (!user) {
      return {
        success: false,
        message: `User not found`,
      };
    }

    return {
      success: true,
      message: 'User found successfully.',
      result: user,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};

export const readUserByAccount = async (account: string): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const found = await users.findOne(
      { account: account },
      { projection: excludePasswordProjection }
    );
    if (found) {
      found.password = '';
      found.email = '';
    }

    if (!found) {
      return {
        success: false,
        message: `User not found`,
      };
    }

    return {
      success: true,
      message: 'User found successfully.',
      result: found,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};

export const getUsersByIds = async (ids: string[]): Promise<PrixResponse> => {
  try {
    if (!Array.isArray(ids)) {
      return {
        success: false,
        message: 'Input must be an array of user IDs.',
      };
    }

    if (ids.length === 0) {
      return {
        success: true,
        message: 'Successfully retrieved 0 users.',
        result: [],
      };
    }

    const users = usersCollection();
    let objectIds: ObjectId[];

    try {
      objectIds = ids.map((id) => new ObjectId(id));
    } catch (validationError: unknown) {
      const errorMsg =
        validationError instanceof Error ? validationError.message : String(validationError);
      console.error('Invalid ObjectId format detected:', validationError);
      return {
        success: false,
        message: `One or more provided IDs have an invalid format: ${errorMsg}`,
      };
    }

    const query = { _id: { $in: objectIds } };

    const foundUsers = await users.find(query).toArray();

    return {
      success: true,
      message: `Successfully retrieved ${foundUsers.length} out of ${ids.length} requested users.`,
      result: foundUsers,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Error fetching users by IDs:', error);
    return {
      success: false,
      message: `An error occurred while retrieving users: ${errorMsg}`,
    };
  }
};

export const getMyStats = async (username: string): Promise<PrixResponse> => {
  try {
    const [myArtStats, topCategories, topProducts, myProductStats] = await Promise.all([
      getUserArtStats(username),
      getTopArtCategories(),
      getTopSoldProducts(),
      getProductsSoldWithUserArt(username),
    ]);

    return {
      success: true,
      message: `Estadísticas recopiladas para ${username}`,
      result: { myArtStats, topCategories, topProducts, myProductStats },
    };
  } catch (error: unknown) {
    console.error('Error fetching data by Prixer:', error);
    return {
      success: false,
      message: `Ha ocurrido un error leyendo la data para este Prixer`,
    };
  }
};

async function getUserArtStats(username: string): Promise<Partial<Art>[]> {
  const artsCollection = getDb().collection<Art>('arts');
  const orderCollection = getDb().collection<Order>('orders');
  const archiveCollection = getDb().collection<OrderArchive>('orderarchives');

  const myArts = await artsCollection.find({ prixerUsername: username }).toArray();
  if (!myArts || myArts.length === 0) {
    return [];
  }

  const artIds = myArts.map((art) => art.artId);

  const activeSales = await orderCollection
    .aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $arrayElemAt: [{ $last: '$status' }, 0] }, 5],
          },
        },
      },
      { $unwind: '$lines' },
      { $match: { 'lines.item.art.artId': { $in: artIds } } },
      {
        $group: {
          _id: '$lines.item.art.artId',
          totalSold: { $sum: '$lines.quantity' },
        },
      },
    ])
    .toArray();

  const archivedSales = await archiveCollection
    .aggregate([
      { $match: { status: 'Concretado' } },
      { $unwind: '$requests' },
      { $match: { 'requests.art.artId': { $in: artIds } } },
      {
        $group: {
          _id: '$requests.art.artId',
          totalSold: { $sum: { $toInt: '$requests.quantity' } },
        },
      },
    ])
    .toArray();

  const salesCountMap = new Map<string, number>();
  for (const sale of activeSales) {
    salesCountMap.set(sale._id, sale.totalSold);
  }
  for (const sale of archivedSales) {
    const currentCount = salesCountMap.get(sale._id) || 0;
    salesCountMap.set(sale._id, currentCount + sale.totalSold);
  }
  const result = myArts.map((art) => ({
    id: art._id,
    artId: art.artId,
    title: art.title,
    comission: art.comission,
    selled: salesCountMap.get(art.artId) || 0,
  }));

  result.sort((a, b) => b.selled - a.selled);
  return result;
}

async function getTopArtCategories(): Promise<{ category: string; count: number }[]> {
  const orderCollection = getDb().collection<Order>('order');
  const archiveCollection = getDb().collection<OrderArchive>('orderArchive');
  const artCollection = getDb().collection<Art>('arts');

  const activeCategorySales = await orderCollection
    .aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $arrayElemAt: [{ $last: '$status' }, 0] }, 5],
          },
        },
      },
      { $unwind: '$lines' },
      {
        $lookup: {
          from: 'arts',
          localField: 'lines.item.art.artId',
          foreignField: 'artId',
          as: 'artDetails',
        },
      },
      { $unwind: '$artDetails' },
      {
        $group: {
          _id: '$artDetails.category',
          totalSold: { $sum: '$lines.quantity' },
        },
      },
    ])
    .toArray();

  const archivedCategorySales = await archiveCollection
    .aggregate([
      { $match: { status: 'Concretado' } },
      { $unwind: '$requests' },
      {
        $lookup: {
          from: 'arts',
          localField: 'requests.art.artId',
          foreignField: 'artId',
          as: 'artDetails',
        },
      },
      { $unwind: '$artDetails' },
      {
        $group: {
          _id: '$artDetails.category',
          totalSold: { $sum: { $toInt: '$requests.quantity' } },
        },
      },
    ])
    .toArray();

  const categoryCounts = new Map<string, number>();
  [...activeCategorySales, ...archivedCategorySales].forEach((sale) => {
    if (sale._id) {
      const currentCount = categoryCounts.get(sale._id) || 0;
      categoryCounts.set(sale._id, currentCount + sale.totalSold);
    }
  });
  const sortedCategories = Array.from(categoryCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return sortedCategories;
}

async function getTopSoldProducts(): Promise<{ product: string; count: number }[]> {
  const orderCollection = getDb().collection<Order>('order');
  const archiveCollection = getDb().collection<OrderArchive>('orderArchive');

  const activeProductSales = await orderCollection
    .aggregate([
      {
        $match: {
          $expr: {
            $eq: [{ $arrayElemAt: [{ $last: '$status' }, 0] }, 5],
          },
        },
      },
      { $unwind: '$lines' },
      {
        $group: {
          _id: '$lines.item.product.name',
          totalSold: { $sum: '$lines.quantity' },
        },
      },
    ])
    .toArray();

  const archivedProductSales = await archiveCollection
    .aggregate([
      { $match: { status: 'Concretado' } },
      { $unwind: '$requests' },
      {
        $group: {
          _id: '$requests.product.name',
          totalSold: { $sum: { $toInt: '$requests.quantity' } },
        },
      },
    ])
    .toArray();

  const productCounts = new Map<string, number>();
  [...activeProductSales, ...archivedProductSales].forEach((sale) => {
    if (sale._id) {
      const currentCount = productCounts.get(sale._id) || 0;
      productCounts.set(sale._id, currentCount + sale.totalSold);
    }
  });

  const sortedProducts = Array.from(productCounts.entries())
    .map(([product, count]) => ({ product, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return sortedProducts;
}

async function getProductsSoldWithUserArt(
  username: string
): Promise<{ product: string; count: number }[]> {
  const orderCollection = getDb().collection<Order>('order');
  const archiveCollection = getDb().collection<OrderArchive>('orderArchive');

  const activeSales = await orderCollection
    .aggregate([
      { $match: { $expr: { $eq: [{ $arrayElemAt: [{ $last: '$status' }, 0] }, 5] } } },
      { $unwind: '$lines' },
      {
        $lookup: {
          from: 'arts',
          localField: 'lines.item.art.artId',
          foreignField: 'artId',
          as: 'artDetails',
        },
      },
      { $unwind: '$artDetails' },
      { $match: { 'artDetails.prixerUsername': username } },
      {
        $group: {
          _id: '$lines.item.product.name',
          totalSold: { $sum: '$lines.quantity' },
        },
      },
    ])
    .toArray();

  const archivedSales = await archiveCollection
    .aggregate([
      { $match: { status: 'Concretado' } },
      { $unwind: '$requests' },
      {
        $lookup: {
          from: 'arts',
          localField: 'requests.art.artId',
          foreignField: 'artId',
          as: 'artDetails',
        },
      },
      { $unwind: '$artDetails' },
      { $match: { 'artDetails.prixerUsername': username } },
      {
        $group: {
          _id: '$requests.product.name',
          totalSold: { $sum: { $toInt: '$requests.quantity' } },
        },
      },
    ])
    .toArray();

  const productCounts = new Map<string, number>();
  [...activeSales, ...archivedSales].forEach((sale) => {
    if (sale._id) {
      const currentCount = productCounts.get(sale._id) || 0;
      productCounts.set(sale._id, currentCount + sale.totalSold);
    }
  });

  const sortedProducts = Array.from(productCounts.entries())
    .map(([product, count]) => ({ product, count }))
    .sort((a, b) => b.count - a.count);

  return sortedProducts;
}

export const updateUser = async (id: string, userData: Partial<User>): Promise<PrixResponse> => {
  try {
    const users = usersCollection();

    const { password, ...otherDataToUpdate } = userData;

    const updatePayload: any = { ...otherDataToUpdate };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatePayload.password = await bcrypt.hash(password, salt);
    }

    if (Object.keys(updatePayload).length === 0) {
      return {
        success: false,
        message: 'No se proporcionaron datos para actualizar.',
      };
    }

    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updatePayload },
      {
        returnDocument: 'after',
        projection: { password: 0 },
      }
    );

    if (!result) {
      return {
        success: false,
        message: 'User no encontrado o error al actualizar.',
      };
    }

    return {
      success: true,
      message: 'User actualizado exitosamente.',
      result: result,
    };
  } catch (error) {
    console.error('Error updating user:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `Ocurrió un error al actualizar el user: ${errorMsg}`,
    };
  }
};

export const deleteUser = async (userUsername: string): Promise<PrixResponse> => {
  try {
    const users = usersCollection();
    const result = await users.findOneAndDelete({ username: userUsername });
    if (result) {
      return {
        success: true,
        message: 'User eliminado exitosamente.',
        result: result,
      };
    } else {
      return {
        success: false,
        message: 'Error al eliminar el user.',
      };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    };
  }
};
