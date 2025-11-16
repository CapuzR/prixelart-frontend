import { Request, Response, NextFunction } from "express";
import * as discountServices from "./discountServices.ts";
import { Discount } from "./discountModel.ts";

// CRUD

export const createDiscount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.discounts.createDiscount) {
      res.send({ success: false, message: "No tienes permiso para crear descuentos." });
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
      dateRange,
    } = req.body;

    if (
      !name ||
      description === undefined ||
      active === undefined ||
      !adjustmentMethod ||
      defaultValue === undefined ||
      appliesToAllProducts === undefined ||
      appliestoAllArts === undefined
    ) {
      res.status(400).send({
        success: false,
        message:
          "Missing required fields: name, description, active, adjustmentMethod, defaultValue, appliesToAllProducts, appliestoAllArts.",
      });
      return;
    }

    const newDiscount: Discount = {
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
      dateRange: dateRange
        ? { start: new Date(dateRange.start), end: new Date(dateRange.end) }
        : undefined,
    };

    const result = await discountServices.createDiscount(newDiscount);
    res.send(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const updateDiscount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.discounts.updateDiscount) {
      res.send({ success: false, message: "No tienes permiso para actualizar descuentos." });
      return;
    }

    const updates: Partial<Discount> = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.active !== undefined) updates.active = req.body.active;
    if (req.body.adjustmentMethod !== undefined)
      updates.adjustmentMethod = req.body.adjustmentMethod;
    if (req.body.defaultValue !== undefined) updates.defaultValue = req.body.defaultValue;
    if (req.body.applicableProducts !== undefined)
      updates.applicableProducts = req.body.applicableProducts;
    if (req.body.applicableArts !== undefined) updates.applicableArts = req.body.applicableArts;
    if (req.body.entityOverrides !== undefined)
      updates.entityOverrides = req.body.entityOverrides;
    if (req.body.appliesToAllProducts !== undefined)
      updates.appliesToAllProducts = req.body.appliesToAllProducts;
    if (req.body.appliestoAllArts !== undefined)
      updates.appliestoAllArts = req.body.appliestoAllArts;
    if (req.body.dateRange !== undefined)
      updates.dateRange = {
        start: new Date(req.body.dateRange.start),
        end: new Date(req.body.dateRange.end),
      };

    const result = await discountServices.updateDiscount(req.params.id, updates);
    res.send(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const readById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await discountServices.readById(req.params.id);
    res.send(result);
  } catch (err) {
    next(err);
  }
};

export const readAllDiscounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await discountServices.readAllDiscounts();
    res.send(result);
  } catch (err) {
    next(err);
  }
};

export const readAllDiscountsAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await discountServices.readAllDiscountsAdmin();
    res.send(result);
  } catch (err) {
    next(err);
  }
};

export const deleteDiscount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.permissions?.discounts.deleteDiscount) {
      res.send({ success: false, message: "No tienes permiso para eliminar descuentos." });
      return;
    }
    const result = await discountServices.deleteDiscount(req.params.id);
    res.send(result);
  } catch (err) {
    console.error(err);
    next(err);
  }
};
