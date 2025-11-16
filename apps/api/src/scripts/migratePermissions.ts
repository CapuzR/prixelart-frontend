import * as dotenv from "dotenv"
dotenv.config()

import { MongoClient, Db, Collection, ObjectId } from "mongodb"
import { Permissions, PermissionsV2 } from "../admin/permissionsModel.ts"

function transformPermissionsToV2(oldPerms: Permissions): PermissionsV2 {
  const newPerms: PermissionsV2 = {
    _id: oldPerms._id,
    area: oldPerms.area,
    admins: {
      createAdmin: oldPerms.modifyAdmins,
      createAdminRole: oldPerms.modifyAdmins,
      deleteAdmin: oldPerms.modifyAdmins,
      deleteAdminRole: oldPerms.modifyAdmins,
      readAdmins: oldPerms.modifyAdmins || oldPerms.updateAdmins,
      readAdminRoles: oldPerms.modifyAdmins || oldPerms.updateAdmins,
      updateAdmin: oldPerms.modifyAdmins || oldPerms.updateAdmins,
      updateAdminRole: oldPerms.modifyAdmins || oldPerms.updateAdmins,
    },
    art: {
      artBan: oldPerms.artBan,
      createArt: false,
      readAllArts: true,
      updateArt: oldPerms.modifyArtBestSellers || oldPerms.updateArtBestSellers,
      deleteArt: false,
    },
    announcement: {
      createAnnouncement: false,
      readAnnouncements: false,
      updateAnnouncement: false,
      deleteAnnouncement: false,
      archiveAnnouncement: false,
      enableAnnouncement: false 
    },
    discounts: {
      createDiscount: oldPerms.createDiscount,
      deleteDiscount: oldPerms.deleteDiscount,
      readAllDiscounts: oldPerms.createDiscount || oldPerms.deleteDiscount,
      updateDiscount: oldPerms.createDiscount || oldPerms.deleteDiscount,
      useDiscount: false,
    },
    movements: {
      createWallet: false,
      createMovement: false,
      deleteMovement: false,
      reverseMovement: false,
      readAllMovements: oldPerms.readMovements,
      readMovementsByPrixer: oldPerms.readMovements,
      updateMovement: false,
    },
    orders: {
      archiveOrder: false,
      create: oldPerms.createOrder,
      deleteOrder: false, // Asumo que deleteProduct era el permiso genérico de eliminación más cercano
      downloadData: false,
      readHistory: oldPerms.detailOrder,
      readAllOrders: true,
      readOrderDetails: oldPerms.detailOrder,
      readPayDetails: oldPerms.detailPay,
      updateDetails: oldPerms.detailOrder,
      updateGeneralStatus: oldPerms.orderStatus,
      updateItem: oldPerms.orderStatus,
      updateItemPrice: false,
      updateItemStatus: oldPerms.orderStatus,
      updatePayDetails: oldPerms.detailPay,
      updatePayStatus: oldPerms.orderStatus,
      updateSeller: false,
    },
    paymentMethods: {
      createPaymentMethod: oldPerms.createPaymentMethod,
      deletePaymentMethod: oldPerms.deletePaymentMethod,
      readAllPaymentMethod:
        oldPerms.createPaymentMethod || oldPerms.deletePaymentMethod,
      updatePaymentMethod:
        oldPerms.createPaymentMethod || oldPerms.deletePaymentMethod,
    },
    preferences: {
      createBanner: false,
      deleteBanner: false,
      readAllBanners: oldPerms.modifyBanners || oldPerms.updateBanners,
      updateArtBestSellers:
        oldPerms.modifyArtBestSellers || oldPerms.updateArtBestSellers,
      updateBanner: oldPerms.modifyBanners || oldPerms.updateBanners,
      updateBestSellers:
        oldPerms.modifyBestSellers || oldPerms.updateBestSellers,
      updateDollarValue: oldPerms.modifyDollar || oldPerms.updateDollar,
      updateTermsAndCo: oldPerms.modifyTermsAndCo || oldPerms.updateTermsAndCo,
    },
    products: {
      createProduct: oldPerms.createProduct,
      createVariant: false,
      deleteProduct: oldPerms.deleteProduct,
      deleteVariant: false,
      downloadData: false,
      loadData: false,
      readAllProducts: oldPerms.createProduct,
      updateImages: oldPerms.createProduct,
      updateMockup: oldPerms.createProduct,
      updateProduct: oldPerms.createProduct,
      updateVariant: oldPerms.createProduct,
    },
    shippingMethod: {
      createShippingMethod: oldPerms.createShippingMethod,
      deleteShippingMethod: oldPerms.deleteShippingMethod,
      readAllShippingMethod:
        oldPerms.createShippingMethod || oldPerms.deleteShippingMethod,
      updateShippingMethod:
        oldPerms.createShippingMethod || oldPerms.deleteShippingMethod,
    },
    surcharges: {
      createSurcharge: false,
      deleteSurcharge: false,
      readAllSurcharges: false,
      updateSurcharge: false,
      useSurcharge: false,
    },
    testimonials: {
      createTestimonial: oldPerms.createTestimonial,
      deleteTestimonial: oldPerms.deleteTestimonial,
      readTestimonials:
        oldPerms.createTestimonial || oldPerms.deleteTestimonial,
      updateTestimonial:
        oldPerms.createTestimonial || oldPerms.deleteTestimonial,
    },
    users: {
      banConsumer: oldPerms.prixerBan,
      banPrixer: oldPerms.prixerBan,
      banUser: oldPerms.prixerBan,
      promoteToPrixer: false,
      createConsumer: oldPerms.createConsumer,
      deleteConsumer: oldPerms.deleteConsumer,
      deleteUser: false,
      readAllUsers: oldPerms.readConsumers || oldPerms.prixerBan, // Suponemos que leer consumidores o banear implica ver usuarios
      readPrixerBalance: oldPerms.setPrixerBalance,
      setPrixerBalance: oldPerms.setPrixerBalance,
      updatePrixer: false,
      updateUser: false,
    },
  }

  if (newPerms.area === "Master") {
    for (const category of Object.keys(newPerms)) {
      if (category === "_id" || category === "area") continue

      const permCategory =
        newPerms[category as keyof Omit<PermissionsV2, "_id" | "area">]
      if (typeof permCategory === "object" && permCategory !== null) {
        for (const permKey of Object.keys(permCategory)) {
          if (
            typeof permCategory[permKey as keyof typeof permCategory] ===
            "boolean"
          ) {
            ;(permCategory as any)[permKey] = true
          }
        }
      }
    }
  }

  return newPerms
}

const MONGODB_URI = process.env.MONGO_URI!

async function runMigration() {
  let client: MongoClient | undefined
  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("🟢 Conectado a MongoDB para la migración de permisos.")

    const db: Db = client.db(new URL(MONGODB_URI).pathname.substring(1))

    const oldSchemaPermissionsCollection: Collection<Permissions> =
      db.collection<Permissions>("permissions")

    const newSchemaPermissionsCollection: Collection<PermissionsV2> =
      db.collection<PermissionsV2>("permissions")

    const existingPerms = await oldSchemaPermissionsCollection
      .find({})
      .toArray()
    console.log(
      `🟡 Encontrados ${existingPerms.length} documentos de permisos para migrar.`
    )

    let convertedCount = 0
    let errorsCount = 0

    for (const oldPerm of existingPerms) {
      try {
        const newPerm = transformPermissionsToV2(oldPerm) // Ya no necesitas el 'as Permissions' aquí

        await newSchemaPermissionsCollection.replaceOne(
          { _id: oldPerm._id },
          newPerm
        )

        console.log(`   ✅ Permiso para '${oldPerm.area}' migrado con éxito.`)
        convertedCount++
      } catch (transformError) {
        console.error(
          `   🔴 Error al migrar permiso para '${oldPerm.area}':`,
          transformError
        )
        errorsCount++
      }
    }

    console.log(
      `✅ Migración finalizada: ${convertedCount} documentos convertidos, ${errorsCount} errores.`
    )
  } catch (error) {
    console.error("🔴 Error general durante la migración:", error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log("🔵 Conexión a MongoDB cerrada.")
    }
  }
}

runMigration()