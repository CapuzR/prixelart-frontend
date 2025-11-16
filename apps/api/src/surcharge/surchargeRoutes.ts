import express from "express"
import * as adminControllers from "../admin/adminControllers/adminAuthControllers.ts"
import * as surchargeControllers from "./surchargeControllers.ts"

const router = express.Router()

router.post(
  "/surcharge/create",
  adminControllers.ensureAuthenticated,
  surchargeControllers.createSurcharge
)
router.put(
  "/surcharge/update/:id",
  adminControllers.ensureAuthenticated,
  surchargeControllers.updateSurcharge
)
router.get(
  "/surcharge/read-by-id/:id",
  adminControllers.ensureAuthenticated,
  surchargeControllers.readById
)
router.get(
  "/surcharge/read-all",
  adminControllers.ensureAuthenticated,
  surchargeControllers.readAllSurcharge
)
router.get(
  "/surcharge/read-all-active",
  surchargeControllers.readActiveSurcharge
)
router.delete(
  "/surcharge/delete/:id",
  adminControllers.ensureAuthenticated,
  surchargeControllers.deleteSurcharge
)

export default router
