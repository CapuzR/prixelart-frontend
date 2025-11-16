import express from "express"
import * as serviceControllers from "./serviceControllers.ts"
import * as adminControllers from "../admin/adminControllers/adminAuthControllers.ts"
import * as userAuthControllers from "../user/userControllers/userAuthControllers.ts"

const router = express.Router()

router.post(
  "/service/create",
  userAuthControllers.ensureAuthenticated,
  serviceControllers.createService
)

router.get(
  "/service/read-all",
  adminControllers.ensureAuthenticated,
  serviceControllers.getAll
)
router.get("/service/read-all-active", serviceControllers.getAllActive)
router.get("/service/readService/:id", serviceControllers.readService)
router.post(
  "/service/readMyServices",
  userAuthControllers.ensureAuthenticated,
  serviceControllers.readMyServices
)

router.get(
  "/service/getServiceByPrixer/:prixer",
  serviceControllers.getServicesByPrixer
)

router.get(
  "/service/by-user/:userid",
  serviceControllers.getServicesByUserId
)

router.put(
  "/service/updateMyService/:id",
  userAuthControllers.ensureAuthenticated,
  serviceControllers.updateMyService
)

router.put(
  "/service/disable/:id",
  adminControllers.ensureAuthenticated,
  serviceControllers.disableService
)

router.delete(
  "/service/deleteService/:id",
  userAuthControllers.ensureAuthenticated,
  serviceControllers.deleteService
)

export default router
