import { Admin } from "../adminModel.ts"
import { PermissionsV2 } from "../permissionsModel.ts"
import bcrypt from "bcryptjs"
import { PrixResponse } from "../../types/responseModel.ts"
import { getDb } from "../../mongo.ts"
import { Collection, ObjectId } from "mongodb"

function adminCollection(): Collection<Admin> {
  return getDb().collection<Admin>("admin")
}

function permissionsCollection(): Collection<PermissionsV2> {
  return getDb().collection<PermissionsV2>("permissions")
}

// Admin CRUD

export const createAdmin = async (adminData: Admin): Promise<PrixResponse> => {
  try {
    const admins = adminCollection()
    const resultAdminByUsername = await admins.findOne({
      username: adminData.username,
    })
    const resultAdminByEmail = await admins.findOne({ email: adminData.email })
    if (resultAdminByUsername) {
      return {
        success: false,
        message: "Disculpa, el nombre de usuario ya está registrado.",
      }
    }
    if (resultAdminByEmail) {
      return {
        success: false,
        message: "Disculpa, el correo del usuario ya está registrado.",
      }
    }
    const salt = await bcrypt.genSalt(2)
    const hash = await bcrypt.hash(adminData.password, salt)
    adminData.password = hash
    const result = await admins.insertOne(adminData)
    if (result.insertedId) {
      const newAdmin = await admins.findOne({ _id: result.insertedId })
      return {
        success: true,
        message: "Registro exitoso.",
        result: newAdmin!,
      }
    } else {
      return {
        success: false,
        message: "No se pudo crear el administrador.",
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

export const readAdminById = async (id: string): Promise<PrixResponse> => {
  try {
    const admins = adminCollection()
    const resultAdmin = await admins.findOne({ _id: new ObjectId(id) })
    if (resultAdmin) {
      return {
        success: true,
        message: "Admin encontrado.",
        result: resultAdmin,
      }
    } else {
      return {
        success: false,
        message: "Admin no encontrado.",
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

export const readSellers = async (): Promise<PrixResponse> => {
  try {
    const admins = adminCollection()
    const sellersCursor = admins.find(
      { isSeller: true },
      { projection: { firstname: 1, lastname: 1 } }
    )
    const sellers = await sellersCursor.toArray()

    const sellerNames = sellers.map(
      (seller) => `${seller.firstname} ${seller.lastname}`
    )

    if (sellers.length === 0) {
      return {
        success: true,
        message: "No se encontraron vendedores",
        result: sellerNames,
      }
    }

    return {
      success: true,
      message: "Se encontraron vendedores",
      result: sellerNames,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    }
  }
}

export const readAllAdmins = async (): Promise<PrixResponse> => {
  try {
    const adminsCollection = adminCollection()
    const admins = await adminsCollection
      .find<Admin>({}, { projection: { password: 0 } })
      .toArray()
    const adminsWithoutPassword = admins.map(
      ({ password, ...rest }) => rest
    ) as Admin[]

    if (adminsWithoutPassword.length === 0) {
      return {
        success: true,
        message: "No se encontraron administradores",
      }
    }
    return {
      success: true,
      message: "Se encontraron administradores",
      result: adminsWithoutPassword,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    }
  }
}

export const readFullAdminByEmail = async (
  email: string
): Promise<PrixResponse> => {
  try {
    const admins = adminCollection()
    const admin = await admins.findOne({ email: email })
    return {
      success: true,
      message: "Admin encontrado.",
      result: admin!,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    }
  }
}

export const readAdminByEmail = async (
  email: string
): Promise<PrixResponse> => {
  try {
    const admins = adminCollection()
    const admin = await admins.findOne<Admin>(
      { email: email },
      { projection: { password: 0 } }
    )
    if (admin) {
      return {
        success: true,
        message: "Admin encontrado.",
        result: admin,
      }
    } else {
      return {
        success: false,
        message: "Admin no encontrado.",
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

export const getAdminByUsername = async (
  username: string
): Promise<PrixResponse> => {
  try {
    const admins = adminCollection()
    const admin = await admins.findOne(
      { username: username },
      { projection: { password: 0 } }
    )

    if (admin) {
      return {
        success: true,
        message: "Administrador encontrado.",
        result: admin,
      }
    } else {
      return {
        success: false,
        message: "Administrador no encontrado con ese nombre de usuario.",
      }
    }
  } catch (error) {
    console.error("Error fetching admin by username:", error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `Ocurrió un error al buscar el administrador: ${errorMsg}`,
    }
  }
}

export const updateAdmin = async (
  username: any,
  adminData: any
): Promise<PrixResponse> => {
  try {
    const admins = adminCollection()

    const { newUsername, password, ...otherDataToUpdate } = adminData
    // console.log(username, "= ", adminData)
    // if (newUsername != username) {
    //   return {
    //     success: false,
    //     message:
    //       "No se puede actualizar el nombre de usuario con esta función. Utilice una función dedicada si es necesario.",
    //   }
    // }

    const updatePayload: any = { ...otherDataToUpdate }

    if (password) {
      const salt = await bcrypt.genSalt(10)
      updatePayload.password = await bcrypt.hash(password, salt)
    }

    if (Object.keys(updatePayload).length === 0) {
      return {
        success: false,
        message: "No se proporcionaron datos para actualizar.",
      }
    }

    const result = await admins.findOneAndUpdate(
      { username: adminData.username },
      { $set: updatePayload },
      {
        returnDocument: "after",
        projection: { password: 0 },
      }
    )

    if (!result) {
      return {
        success: false,
        message: "Administrador no encontrado o error al actualizar.",
      }
    }

    return {
      success: true,
      message: "Administrador actualizado exitosamente.",
      result: result,
    }
  } catch (error) {
    console.error("Error updating admin:", error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `Ocurrió un error al actualizar el administrador: ${errorMsg}`,
    }
  }
}

export const deleteAdmin = async (
  adminUsername: string
): Promise<PrixResponse> => {
  try {
    const admins = adminCollection()
    const result = await admins.findOneAndDelete({ username: adminUsername })
    if (result) {
      const { password, ...deletedAdminWithoutPassword } = result
      return {
        success: true,
        message: "Administrador eliminado exitosamente.",
        result: deletedAdminWithoutPassword as Admin,
      }
    } else {
      return {
        success: false,
        message: "Error al eliminar el administrador.",
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

// Admin roles CRUD

export const createPermissions = async (role: any): Promise<PrixResponse> => {
  try {
    const permissiondb = permissionsCollection()
    const result = await permissiondb.insertOne(role)
    if (result.insertedId) {
      const newRole = await permissiondb.findOne({ _id: result.insertedId })
      return {
        success: true,
        message: "Rol de administrador creado exitosamente.",
        result: newRole!,
      }
    } else {
      return {
        success: false,
        message: "No se pudo crear el rol.",
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

export const readPermissions = async (): Promise<PrixResponse> => {
  try {
    const permissiondb = permissionsCollection()
    const roles = await permissiondb.find({}).toArray()

    if (roles.length === 0) {
      return {
        success: true,
        message: "No se encontraron roles",
        result: roles,
      }
    }
    return {
      success: true,
      message: "Roles encontrados",
      result: roles,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    }
  }
}

export const readPermissionsById = async (
  id: string
): Promise<PrixResponse> => {
  try {
    const permissiondb = permissionsCollection()
    let objectId

    try {
      objectId = new ObjectId(id)
    } catch (validationError) {
      return {
        success: false,
        message: "El formato del ID de permisos proporcionado no es válido.",
      }
    }

    const permissions = await permissiondb.findOne({ _id: objectId })

    if (permissions) {
      return {
        success: true,
        message: "Permisos encontrados.",
        result: permissions,
      }
    } else {
      return {
        success: false,
        message: "Permisos no encontrados con ese ID.",
      }
    }
  } catch (error) {
    console.error("Error reading permissions by ID:", error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `Ocurrió un error al leer los permisos por ID: ${errorMsg}`,
    }
  }
}

export const updatePermissions = async (
  id: string,
  role: Partial<PermissionsV2>
): Promise<PrixResponse> => {
  try {
    const permissiondb = permissionsCollection()
    const result = await permissiondb.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: role },
      { returnDocument: "after" }
    )
    if (!result) {
      return {
        success: false,
        message: "Error al actualizar el rol.",
      }
    }
    return {
      success: true,
      message: "Rol de administrador actualizado con éxito.",
      result: result,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      message: `An error occurred: ${errorMsg}`,
    }
  }
}

export const deletePermissions = async (id: string): Promise<PrixResponse> => {
  try {
    const permissiondb = permissionsCollection()
    const result = await permissiondb.findOneAndDelete({
      _id: new ObjectId(id),
    })
    if (result) {
      return {
        success: true,
        message: "Rol de administrador eliminado correctamente.",
        result: result,
      }
    } else {
      return {
        success: false,
        message: "Rol de administrador no encontrado.",
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
