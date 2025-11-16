import { Router } from "express"
import * as artControllers from "./artControllers.ts"
import * as adminAuthControllers from "../admin/adminControllers/adminAuthControllers.ts"
import * as userAuthControllers from "../user/userControllers/userAuthControllers.ts"
const router: Router = Router()

router.post(
  "/art/create",
  userAuthControllers.ensureAuthenticated,
  artControllers.createArt
)

router.get("/art/read-by-prixer/:username", artControllers.readAllByUsername)
router.get(
  "/art/read-all",
  adminAuthControllers.ensureAuthenticated,
  artControllers.readAllArts
)
router.post("/art/read-gallery", artControllers.readGallery)
router.get("/art/get-latest", artControllers.readLatest)
router.get("/art/read-by-id/:id", artControllers.readOneById)
router.get(
  "/art/read-by-objid/:id",
  adminAuthControllers.ensureAuthenticated,
  artControllers.readOneByObjId
)
router.get("/art/random", artControllers.randomArts)
router.put(
  "/art/update/:id",
  adminAuthControllers.ensureAuthenticated,
  artControllers.updateArt
)
router.put(
  "/art/update/:id",
  userAuthControllers.ensureAuthenticated,
  artControllers.updateArtAsPrixer
)
router.delete(
  "/art/delete/:id",
  adminAuthControllers.ensureAuthenticated,
  artControllers.deleteArt
)
router.put(
  "/art/disable/:id",
  adminAuthControllers.ensureAuthenticated,
  artControllers.disableArt
)
router.put(
  "/art/rank/:id",
  adminAuthControllers.ensureAuthenticated,
  artControllers.rankArt
)
router.get(
  "/art/update/:id",
  userAuthControllers.ensureAuthenticated,
  artControllers.updateArtAsPrixer
)

router.get("/art/bestSellers", artControllers.readBestSellers)

export default router
