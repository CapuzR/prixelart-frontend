import express from "express"
import * as orderArchiveControllers from "./orderArchiveControllers.ts"
import * as adminControllers from "../admin/adminControllers/adminAuthControllers.ts"

const router = express.Router()

// Order Archive Routes

router.post(
  "/orderArchive/read",
  adminControllers.ensureAuthenticated,
  orderArchiveControllers.readOrder
)

router.get(
  "/orderArchive/read/:id",
  adminControllers.ensureAuthenticated,
  orderArchiveControllers.readOrder
)
router.get(
  "/orderArchive/read-all",
  adminControllers.ensureAuthenticated,
  orderArchiveControllers.readAllOrders
)

router.put(
  "/orderArchive/addVoucher/:id",
  adminControllers.ensureAuthenticated,
  orderArchiveControllers.addVoucher
)
router.put(
  "/orderArchive/update/:id",
  adminControllers.ensureAuthenticated,
  orderArchiveControllers.updateOrder
)

router.put(
  "/orderArchive/updateItemStatus",
  adminControllers.ensureAuthenticated,
  orderArchiveControllers.updateItemStatus
)

export default router
