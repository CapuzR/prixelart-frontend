import express from "express";
import { readAllOrgFull, updateBio } from "./organizationControllers.ts";
import * as userAuthControllers from "../user/userControllers/userAuthControllers.ts";

const router = express.Router();

router.get("/organization/read-all", readAllOrgFull);

router.put("/organization/updateBio/:id", userAuthControllers.ensureAuthenticated, updateBio);

export default router;
