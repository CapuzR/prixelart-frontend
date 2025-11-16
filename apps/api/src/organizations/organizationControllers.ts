import { Request, Response, NextFunction } from "express";
import * as orgSvc from "./organizationServices.ts";

export const readAllOrgFull = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await orgSvc.readAllOrgFull();
    res.send(result);
  } catch (e) {
    console.error(e);
    next(e);
  }
};

/* export const getBio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await orgSvc.readBio(req.params.id);
    res.send(result);
  } catch (e) {
    console.error(e);
    next(e);
  }
}; */

export const updateBio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let images: string[] = [];
    if (req.body.bioImages !== undefined) {
      if (typeof req.body.bioImages === "string") {
        images = [req.body.bioImages];
      } else if (Array.isArray(req.body.bioImages)) {
        images = req.body.bioImages;
      }
    }

    const newUrls =
      req.session &&
        req.session.uploadResults &&
        Array.isArray(req.session.uploadResults.newBioImages)
        ? (req.session.uploadResults.newBioImages as Array<{
          purpose: string;
          url: string;
        }>)
          .filter((u) => u.purpose === "NewBioImage")
          .map((u) => u.url)
        : [];

    images = images.concat(newUrls);

    const bioPayload = {
      biography: req.body.biography,
      images,
    };

    const result = await orgSvc.updateBio(req.params.id, bioPayload);
    res.send(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
};