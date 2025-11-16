import { Router } from "express"
import * as adminControllers from "./adminControllers/adminControllers.ts"
import * as adminAuthControllers from "./adminControllers/adminAuthControllers.ts"

const router: Router = Router()

// Login
router.post("/admin/login", adminAuthControllers.adminLogin)
router.get(
  "/admin/check-auth",
  adminAuthControllers.ensureAuthenticated,
  adminControllers.sendAdminPermissions
)

// Admin
router.post(
  "/admin/create",
  adminAuthControllers.ensureAuthenticated,
  adminControllers.createAdmin
)
router.get(
  "/admin/read-all",
  adminAuthControllers.ensureAuthenticated,
  adminControllers.readAllAdmins
)
router.get(
  "/admin/read/:username",
  adminAuthControllers.ensureAuthenticated,
  adminControllers.readByUsername
)
router.put(
  "/admin/update/:username",
  adminAuthControllers.ensureAuthenticated,
  adminControllers.updateAdmin
)
router.delete(
  "/admin/delete/:username",
  adminAuthControllers.ensureAuthenticated,
  adminControllers.deleteAdmin
)
router.get("/admin/getSellers", adminControllers.getSellers)

// Permissions
router.post(
  "/permissions/create",
  adminAuthControllers.ensureAuthenticated,
  adminControllers.createPermissions
)
router.get(
  "/admin/read-roles",
  adminAuthControllers.ensureAuthenticated,
  adminControllers.readPermissions
)
router.get(
  "/permissions/read/:id",
  adminAuthControllers.ensureAuthenticated,
  adminControllers.readPermissionsById
)
router.put(
  "/permissions/update/:id",
  adminAuthControllers.ensureAuthenticated,
  adminControllers.updatePermissions
)
router.delete(
  "/permissions/delete/:id",
  adminAuthControllers.ensureAuthenticated,
  adminControllers.deletePermissions
)

export default router
