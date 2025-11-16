import { Router } from "express"
import * as adminAuthControllers from "../admin/adminControllers/adminAuthControllers.ts"
import * as discountControllers from "./discountControllers.ts"

const router: Router = Router()

router.post(
  "/discount/create",
  adminAuthControllers.ensureAuthenticated,
  discountControllers.createDiscount
)
router.put(
  "/discount/update/:id",
  adminAuthControllers.ensureAuthenticated,
  discountControllers.updateDiscount
)
router.get(
  "/discount/read-by-id/:id",
  adminAuthControllers.ensureAuthenticated,
  discountControllers.readById
)

router.get(
  "/discount/read-all",
  adminAuthControllers.ensureAuthenticated,
  discountControllers.readAllDiscountsAdmin
)
router.get("/discount/read-all-active", discountControllers.readAllDiscounts)

router.delete(
  "/discount/delete/:id",
  adminAuthControllers.ensureAuthenticated,
  discountControllers.deleteDiscount
)

export default router
