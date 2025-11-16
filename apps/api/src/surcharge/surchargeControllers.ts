import { NextFunction, Request, Response } from "express";
import * as surchargeServices from "./surchargeServices.ts";
import { ApplicableEntity, Surcharge } from "./surchargeModel.ts";

export const createSurcharge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.surcharges.createSurcharge) {
      res.status(403).send({
        success: false,
        message: "No tienes permiso para crear recargos.",
      });
      return;
    }

    const {
      name,
      description,
      active,
      adjustmentMethod,
      defaultValue,
      applicableProducts,
      applicableArts,
      entityOverrides,
      appliesToAllProducts,
      appliestoAllArts,
      recipients,
      dateRange,
    } = req.body;

    if (
      !name ||
      active === undefined ||
      !adjustmentMethod ||
      defaultValue === undefined ||
      appliesToAllProducts === undefined ||
      appliestoAllArts === undefined
    ) {
      res.status(400).send({
        success: false,
        message:
          "Faltan campos obligatorios: name, active, adjustmentMethod, defaultValue, appliesToAllProducts, appliestoAllArts.",
      });
      return;
    }

    const surchargeData: Surcharge = {
      name,
      description,
      active,
      adjustmentMethod,
      defaultValue,
      applicableProducts,
      applicableArts,
      entityOverrides: entityOverrides as ApplicableEntity[],
      appliesToAllProducts,
      appliestoAllArts,
      recipients: recipients as ApplicableEntity[],
      dateRange: dateRange
        ? { start: new Date(dateRange.start), end: new Date(dateRange.end) }
        : undefined,
    };

    const result = await surchargeServices.createSurcharge(surchargeData);
    res.send(result);
  } catch (err) {
    next(err);
  }
};

export const updateSurcharge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.surcharges.updateSurcharge) {
      res.status(403).send({
        success: false,
        message: "No tienes permiso para actualizar recargos.",
      });
      return;
    }

    const updates: Partial<Surcharge> = {};
    const body = req.body;

    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.active !== undefined) updates.active = body.active;
    if (body.adjustmentMethod !== undefined)
      updates.adjustmentMethod = body.adjustmentMethod;
    if (body.defaultValue !== undefined) updates.defaultValue = body.defaultValue;
    if (body.applicableProducts !== undefined)
      updates.applicableProducts = body.applicableProducts;
    if (body.applicableArts !== undefined)
      updates.applicableArts = body.applicableArts;
    if (body.entityOverrides !== undefined)
      updates.entityOverrides = body.entityOverrides;
    if (body.appliesToAllProducts !== undefined)
      updates.appliesToAllProducts = body.appliesToAllProducts;
    if (body.appliestoAllArts !== undefined)
      updates.appliestoAllArts = body.appliestoAllArts;
    if (body.recipients !== undefined) updates.recipients = body.recipients;
    if (body.dateRange !== undefined)
      updates.dateRange = {
        start: new Date(body.dateRange.start),
        end: new Date(body.dateRange.end),
      };

    const result = await surchargeServices.updateSurcharge(
      req.params.id,
      updates
    );
    res.send(result);
  } catch (err) {
    next(err);
  }
};

export const readAllSurcharge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await surchargeServices.readAllSurcharge();
    res.send(result);
  } catch (err) {
    next(err);
  }
};

export const readById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await surchargeServices.readById(req.params.id);
    res.send(result);
  } catch (err) {
    next(err);
  }
};


export const readActiveSurcharge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await surchargeServices.readActiveSurcharge();
    res.send(result);
  } catch (err) {
    next(err);
  }
};

export const deleteSurcharge = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.surcharges.deleteSurcharge) {
      res.status(403).send({
        success: false,
        message: "No tienes permiso para eliminar recargos.",
      });
      return;
    }

    const result = await surchargeServices.deleteSurcharge(req.params.id);
    res.send(result);
  } catch (err) {
    next(err);
  }
};