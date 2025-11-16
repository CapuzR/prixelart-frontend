import { Request, Response, NextFunction } from "express";
import * as manufacturerServices from "./manufacturerServices.ts";
import * as userService from "../user/userServices/userServices.ts";
import { Manufacturer } from "./manufacturerModel.ts";
import { User } from "../user/userModel.ts";

// Esta todo sin hacer, solo se cambió la palabra prixer por manufacturer
export const createManufacturer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.createManufacturer) {
      res.send({ success: false, message: "No tienes permiso para crear Manufacturers." });
      return;
    }

    /* TUS‑uploaded logo ------------------------------------------------------ */
    const logo =
      req.session?.uploadResults?.brand?.find(
        (img: { purpose: string; url: string }) => img.purpose === "ManufacturerLogo"
      )?.url || null;

    if (!logo) {
      res.status(400).send({ success: false, message: "No se encontró el logo del Manufacturer en sesión." });
      return;
    }

    /* Required fields -------------------------------------------------------- */
    const {
      entityName,
      officialDoc,
      foundationDate,
      deliveryEmail,
      salesEmail,
      workshopEmail,
      mainPhone,
      country,
      city,
      brandPrimaryColor,
      brandSecondaryColor,
    } = req.body;

    if (
      !entityName ||
      !officialDoc ||
      !foundationDate ||
      !deliveryEmail ||
      !salesEmail ||
      !workshopEmail ||
      !mainPhone ||
      !country ||
      !city ||
      !brandPrimaryColor ||
      !brandSecondaryColor
    ) {
      res.status(400).send({
        success: false,
        message:
          "Faltan campos requeridos: entityName, officialDoc, foundationDate, deliveryEmail, salesEmail, workshopEmail, mainPhone, country, city, brandPrimaryColor y brandSecondaryColor.",
      });
      return;
    }

    const manufacturerData: Manufacturer = {
      entityName,
      officialDoc,
      foundationDate,
      deliveryEmail,
      salesEmail,
      workshopEmail,
      mainPhone,
      country,
      city,
      brandPrimaryColor,
      brandSecondaryColor,
      logo,
      description: req.body.description,
      mision: req.body.mision,
      vision: req.body.vision,
      values: req.body.values,
      why: req.body.why,
    };

    const result = await manufacturerServices.createManufacturer({
      ...manufacturerData,
      userId: req.body.user?.id,
    });
    res.send(result);
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const readManufacturer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await userService.readUserByUsername(req.body.username);
    if (!user) {
      res.status(404).send({ success: false, message: "User not found" });
      return;
    }
    const resultManufacturer = await manufacturerServices.readManufacturer(user.result as User);
    res.send(resultManufacturer);
  } catch (err) {
    next(err);
  }
};

export const readAllManufacturers = async (_: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.send(await manufacturerServices.readAllManufacturers());
  } catch (err) {
    next(err);
  }
};


export const updateManufacturer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.updateManufacturer) {
      res.send({ success: false, message: "No tienes permiso para actualizar Manufacturers." });
      return;
    }

    /* Optional new logo from TUS session */
    const logo =
      req.session?.uploadResults?.brand?.find(
        (img: { purpose: string; url: string }) => img.purpose === "ManufacturerLogo"
      )?.url;

    const manufacturerPatch: Partial<Manufacturer> = {
      entityName: req.body.entityName,
      officialDoc: req.body.officialDoc,
      foundationDate: req.body.foundationDate,
      deliveryEmail: req.body.deliveryEmail,
      salesEmail: req.body.salesEmail,
      workshopEmail: req.body.workshopEmail,
      mainPhone: req.body.mainPhone,
      country: req.body.country,
      city: req.body.city,
      description: req.body.description,
      mision: req.body.mision,
      vision: req.body.vision,
      values: req.body.values,
      why: req.body.why,
      brandPrimaryColor: req.body.brandPrimaryColor,
      brandSecondaryColor: req.body.brandSecondaryColor,
    };

    if (logo !== undefined) manufacturerPatch.logo = logo;

    const userPatch = {
      id: req.body.user?.id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      username: req.body.username,
      email: req.body.email,
    };

    const updates = await manufacturerServices.updateManufacturer(manufacturerPatch, userPatch);
    res.send(updates);
  } catch (err) {
    next(err);
  }
};

export const disableManufacturer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const disabledUser = await manufacturerServices.disableManufacturer(req.body);
    res.send(disabledUser);
  } catch (err) {
    next(err);
  }
};