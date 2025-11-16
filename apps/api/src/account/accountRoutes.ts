import { Router } from "express"
import * as accountControllers from "./accountControllers.ts"
import * as adminAuthControllers from "../admin/adminControllers/adminAuthControllers.ts"
import * as userAuthControllers from "../user/userControllers/userAuthControllers.ts"

const router: Router = Router()

router.post(
  "/account/create",
  adminAuthControllers.ensureAuthenticated,
  accountControllers.createAccount
);

router.get(
  "/account/readById/:id",
  adminAuthControllers.ensureAuthenticated,
  accountControllers.checkBalance
)

router.get(
    "/account/readMyAccount/:id",
    userAuthControllers.ensureAuthenticated,
    accountControllers.checkBalance
  )

router.post(
  "/account/readAll",
  adminAuthControllers.ensureAuthenticated,
  accountControllers.readAll
)

export default router
