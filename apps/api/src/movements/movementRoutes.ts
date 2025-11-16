import express, { Router } from "express"
import * as adminControllers from "../admin/adminControllers/adminAuthControllers.ts"
import * as userAuthControllers from "../user/userControllers/userAuthControllers.ts"
import * as movementControllers from "./movementControllers.ts"

const router: Router = express.Router()

router.post(
  "/movement/create",
  adminControllers.ensureAuthenticated,
  movementControllers.createMovement
)
router.post(
  "/movement/readByAccount",
  userAuthControllers.ensureAuthenticated,
  movementControllers.readByAccount
)
router.post(
  "/movement/readByPrixer",
  adminControllers.ensureAuthenticated,
  movementControllers.readByAccount
)
router.get(
  "/movement/read-all",
  adminControllers.ensureAuthenticated,
  movementControllers.readAllMovements
)
router.get(
  "/movement/read-by-id/:id",
  adminControllers.ensureAuthenticated,
  movementControllers.readById
)

router.put(
  "/movement/reverse/:id",
  adminControllers.ensureAuthenticated,
  movementControllers.reverseMovement
)

export default router
