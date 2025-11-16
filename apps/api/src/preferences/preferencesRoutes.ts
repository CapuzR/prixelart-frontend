import express from "express"
import * as preferencesController from "./preferencesController.ts"
import * as adminControllers from "../admin/adminControllers/adminAuthControllers.ts"

const router = express.Router()

router.get("/carousel", preferencesController.readAllImagesCarousel)
router.post(
  "/carousel",
  adminControllers.ensureAuthenticated,
  preferencesController.createCarouselItem
)

router.delete(
  "/carousel/:id",
  adminControllers.ensureAuthenticated,
  preferencesController.deleteCarouselItem
)

router.put(
  "/carousel/order/:type",
  adminControllers.ensureAuthenticated,
  preferencesController.updateCarouselOrder
)

router.get(
  "/termsAndConditions/read",
  preferencesController.readTermsAndConditions
)
router.put(
  "/termsAndConditions/update",
  adminControllers.ensureAuthenticated,
  preferencesController.updateTermsAndConditions
)

router.get("/dollarValue/read", preferencesController.readDollarValue)

export default router
