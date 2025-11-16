import { Login, Admin } from "../adminModel.ts"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import * as adminServices from "./adminServices.ts"
import { PermissionsV2 } from "../permissionsModel.ts"
import ms from "ms"
import { PrixResponse } from "../../types/responseModel.ts"
import { Collection } from "mongodb"
import { getDb } from "../../mongo.ts"

function permissionsCollection(): Collection<PermissionsV2> {
  return getDb().collection<PermissionsV2>("permissions")
}

export const authenticate = async (adminData: Login): Promise<PrixResponse> => {
  try {
    const admin = await adminServices.readFullAdminByEmail(adminData.email)
    if (admin.result) {
      const adminResult = admin.result as Admin
      if (!bcrypt.compareSync(adminData.password, adminResult.password!)) {
        return {
          success: false,
          message: "Inténtalo de nuevo, contraseña incorrecta.",
          result: adminResult,
        }
      } else {
        const payload = { id: adminResult._id!.toString() }

        const secret = process.env.ADMIN_JWT_SECRET!
        const tokenExpireTimeString = process.env.ADMIN_TOKEN_EXPIRE_TIME!
        const tokenExpireTimeInSeconds =
          ms(tokenExpireTimeString as ms.StringValue) / 1000

        const adminToken = jwt.sign(payload, secret, {
          expiresIn: tokenExpireTimeInSeconds,
        })

        return {
          success: true,
          result: adminToken,
          message: "Login exitoso.",
        }
      }
    } else {
      return {
        success: false,
        message:
          "No se encuentra el email, por favor solicita un usuario con acceso.",
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

export const getPermissions = async (
  decoded: string
): Promise<PrixResponse> => {
  try {
    const admin = await adminServices.readAdminById(decoded)
    const validAdmin = admin.result as Admin
    const permissionsdb = permissionsCollection()
    const permissions = await permissionsdb.findOne({ area: validAdmin.area })
    if (permissions) {
      return {
        success: true,
        result: permissions,
        message: "Permisos encontrados.",
      }
    } else {
      return {
        success: false,
        message: "No se encontraron permisos.",
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
