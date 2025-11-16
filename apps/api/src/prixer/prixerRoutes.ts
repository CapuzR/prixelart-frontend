import express, { Router } from "express"
import * as prixerControllers from "./prixerControllers.ts"
import * as adminControllers from "../admin/adminControllers/adminAuthControllers.ts"
import * as userAuthControllers from "../user/userControllers/userAuthControllers.ts"

const router: Router = express.Router()

router.post("/prixer/promote", adminControllers.ensureAuthenticated, prixerControllers.promoteToPrixer);
router.post("/prixer-registration", userAuthControllers.ensureAuthenticated, prixerControllers.createPrixer);
router.get("/prixer/get/:username", prixerControllers.getPrixerByUsername);
router.get("/prixer/read-all", adminControllers.ensureAuthenticated, prixerControllers.readAllPrixers);
router.get("/prixer/read-all-active", prixerControllers.readAllPrixersActive);
router.put("/prixer/update", userAuthControllers.ensureAuthenticated, prixerControllers.updatePrixer);
router.put("/prixer/admin/update/:id", adminControllers.ensureAuthenticated, prixerControllers.updatePrixer);
router.put("/prixer/update-home/:id", adminControllers.ensureAuthenticated, prixerControllers.updateVisibility);
router.put("/prixer/update-terms/:id", userAuthControllers.ensureAuthenticated, prixerControllers.updateTermsAgree);
router.put("/prixer/update-home/updateTermsAgree", adminControllers.ensureAuthenticated, prixerControllers.updateTermsAgreeGeneral);
router.delete("/prixers/destroyPrixer", adminControllers.ensureAuthenticated, prixerControllers.destroyPrixer);
router.post(
  "/prixer-registration",
  userAuthControllers.ensureAuthenticated,
  prixerControllers.createPrixer
)
router.get("/prixer/get/:username", prixerControllers.getPrixerByUsername)
router.get(
  "/prixer/read-all",
  adminControllers.ensureAuthenticated,
  prixerControllers.readAllPrixers
)
router.get("/prixer/read-all-active", prixerControllers.readAllPrixersActive)
router.post(
  "/prixer/update",
  userAuthControllers.ensureAuthenticated,
  prixerControllers.updatePrixer
)
router.put(
  "/prixer/update-home/:id",
  adminControllers.ensureAuthenticated,
  prixerControllers.updateVisibility
)
router.put(
  "/prixer/update-terms/:id",
  userAuthControllers.ensureAuthenticated,
  prixerControllers.updateTermsAgree
)
router.put(
  "/prixer/update-home/updateTermsAgree",
  adminControllers.ensureAuthenticated,
  prixerControllers.updateTermsAgreeGeneral
)
router.delete(
  "/prixers/destroyPrixer",
  adminControllers.ensureAuthenticated,
  prixerControllers.destroyPrixer
)

export default router
